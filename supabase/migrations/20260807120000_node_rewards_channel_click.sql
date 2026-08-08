-- Move the "phone" reward off form-submit and onto channel-click: we can't
-- know whether a customer actually posted a review (Google/Instagram have
-- no callback for that), but we *can* know they clicked through to the
-- channel, since that click runs our own code before the browser
-- navigates away. Track which channel (fb|ig|google|wa|yt|web) triggered
-- each reward. The birthday reward is unaffected — still granted on
-- submit via claim_store_reward.
alter table "public"."node_rewards"
  add column if not exists "channel_type" text;

-- claim_store_reward no longer grants the phone reward — only the store
-- validation + birthday-reward logic remain. Signature is unchanged, but
-- the return shape's possible row count changes (0 or 1, birthday-only),
-- so drop and recreate rather than replace, matching the pattern used
-- when this function's shape last changed.
drop function if exists "public"."claim_store_reward"(uuid, text, date);

create or replace function "public"."claim_store_reward"(
  p_store_id uuid,
  p_phone text,
  p_date_of_birth date default null
)
returns setof "public"."node_rewards"
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := extract(year from now())::int;
begin
  if not exists (select 1 from public.nodes where id = p_store_id) then
    raise exception 'store % not found', p_store_id;
  end if;

  if p_date_of_birth is not null
     and not exists (
       select 1
       from public.node_rewards
       where node_id = p_store_id
         and phone = p_phone
         and reward_type = 'birthday'
         and reward_year = v_year
     )
  then
    return query
      insert into public.node_rewards
        (node_id, phone, reward_type, date_of_birth, reward_year)
      values
        (p_store_id, p_phone, 'birthday', p_date_of_birth, v_year)
      returning *;
  end if;
end;
$$;

revoke all on function "public"."claim_store_reward"(uuid, text, date) from public;
grant execute on function "public"."claim_store_reward"(uuid, text, date) to anon, authenticated;

-- Called when a customer clicks a channel button (Google review, Instagram,
-- etc.) on the public store page — one reward row per click, tagged with
-- which channel was clicked. No dedupe: clicking the same channel twice
-- grants twice, by design for this pass.
create or replace function "public"."record_channel_click"(
  p_store_id uuid,
  p_phone text,
  p_channel_type text
)
returns "public"."node_rewards"
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.node_rewards;
begin
  if not exists (select 1 from public.nodes where id = p_store_id) then
    raise exception 'store % not found', p_store_id;
  end if;

  insert into public.node_rewards (node_id, phone, reward_type, channel_type)
  values (p_store_id, p_phone, 'phone', p_channel_type)
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function "public"."record_channel_click"(uuid, text, text) from public;
grant execute on function "public"."record_channel_click"(uuid, text, text) to anon, authenticated;
