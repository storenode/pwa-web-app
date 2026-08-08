-- Reward customers separately for sharing their date of birth: a customer
-- claiming a store's reward can now also submit a date of birth, which
-- earns a second, independent 10-point reward row — capped at once per
-- calendar year per (store, phone), so re-submitting the same year doesn't
-- farm extra points.
alter table "public"."node_rewards"
  add column if not exists "date_of_birth" date,
  add column if not exists "reward_type" text not null default 'phone'
    check (reward_type in ('phone', 'birthday')),
  add column if not exists "reward_year" int;

-- reward_year is only meaningful (and only enforced unique) for birthday
-- rows; phone rows leave it null.
create unique index if not exists "node_rewards_birthday_once_per_year_idx"
on "public"."node_rewards" ("node_id", "phone", "reward_year")
where reward_type = 'birthday';

-- claim_store_reward's return shape is changing (now potentially 2 rows,
-- one per reward_type), so drop and recreate rather than replace.
drop function if exists "public"."claim_store_reward"(uuid, text);

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
  v_phone_row public.node_rewards;
begin
  if not exists (select 1 from public.nodes where id = p_store_id) then
    raise exception 'store % not found', p_store_id;
  end if;

  insert into public.node_rewards (node_id, phone, reward_type)
  values (p_store_id, p_phone, 'phone')
  returning * into v_phone_row;

  return next v_phone_row;

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
