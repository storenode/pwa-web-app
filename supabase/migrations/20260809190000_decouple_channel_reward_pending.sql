-- record_channel_click previously blocked on *any* unclaimed reward at the
-- store, so an unredeemed birthday reward (reward_type='birthday') wrongly
-- blocked a customer from ever earning the separate channel/Google reward
-- (reward_type='phone'). The two reward types should stack independently —
-- only a second, still-unclaimed channel reward should block a new one.
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

  if exists (
    select 1 from public.node_rewards
    where node_id = p_store_id
      and phone = p_phone
      and status = 'unclaimed'
      and reward_type = 'phone'
  ) then
    raise exception 'a channel reward is already pending for this phone number';
  end if;

  insert into public.node_rewards (node_id, phone, reward_type, channel_type)
  values (p_store_id, p_phone, 'phone', p_channel_type)
  returning * into v_row;

  return v_row;
end;
$$;

-- Public (anon-callable): lets the store page know whether this phone
-- already has an unclaimed channel/Google reward at this store, so the
-- button can be disabled for the right reason — independent of any pending
-- birthday reward, which no longer blocks it (see above).
create or replace function "public"."has_pending_channel_reward"(
  p_store_id uuid,
  p_phone text
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.node_rewards
    where node_id = p_store_id
      and phone = p_phone
      and status = 'unclaimed'
      and reward_type = 'phone'
  );
$$;

revoke all on function "public"."has_pending_channel_reward"(uuid, text) from public;
grant execute on function "public"."has_pending_channel_reward"(uuid, text) to anon, authenticated;
