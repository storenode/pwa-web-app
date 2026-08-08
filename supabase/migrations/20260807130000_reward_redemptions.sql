-- Bill-based reward redemption: a customer requests a redemption (bill
-- number + amount) from the public store page; a staff member gives the
-- final approval from the dashboard. This is a two-party flow — the
-- customer never directly marks their own points claimed.

-- Per-node reward conversion settings. Optional row — if none exists, the
-- RPCs below fall back to a static 1 point = ₹1 / cap-at-bill-amount
-- default. No settings UI is being built yet; this table just leaves room
-- for one (a future "reward rules" screen for store admins) instead of
-- hardcoding the rate inline.
create table if not exists "public"."node_reward_settings" (
  "node_id" uuid primary key references "public"."nodes"(id) on delete cascade,
  "points_to_currency_rate" numeric not null default 1,
  "cap_discount_at_bill_amount" boolean not null default true,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

alter table "public"."node_reward_settings" enable row level security;

create policy "Members can view reward settings on their nodes"
on "public"."node_reward_settings" for select
to authenticated
using ("public"."can_manage_node_members"(node_id));

create policy "Members can upsert reward settings on their nodes"
on "public"."node_reward_settings" for insert
to authenticated
with check ("public"."can_manage_node_members"(node_id));

create policy "Members can update reward settings on their nodes"
on "public"."node_reward_settings" for update
to authenticated
using ("public"."can_manage_node_members"(node_id))
with check ("public"."can_manage_node_members"(node_id));

-- One row per bill claim request. 'requested' rows are pending staff
-- review; 'approved'/'rejected' are terminal.
create table if not exists "public"."reward_redemptions" (
  "id" uuid primary key default gen_random_uuid(),
  "node_id" uuid not null references "public"."nodes"(id) on delete cascade,
  "phone" text not null,
  "bill_number" text not null,
  "bill_amount" numeric not null,
  "points_applied" int not null,
  "discount_amount" numeric not null,
  "status" text not null default 'requested'
    check (status in ('requested', 'approved', 'rejected')),
  "requested_at" timestamptz not null default now(),
  "reviewed_by" uuid references "public"."members"(id),
  "reviewed_at" timestamptz
);

create index "reward_redemptions_node_id_idx" on "public"."reward_redemptions" ("node_id");

alter table "public"."reward_redemptions" enable row level security;

create policy "Members can view redemptions on their nodes"
on "public"."reward_redemptions" for select
to authenticated
using ("public"."can_manage_node_members"(node_id));

-- No direct insert/update policy for staff or anon — creation happens only
-- via request_reward_redemption(), review only via review_reward_redemption()
-- (both security definer), so points can't be forged or self-approved.

-- 'requested' reserves the reward rows a pending redemption covers, so a
-- second request can't double-spend the same points.
alter table "public"."node_rewards"
  drop constraint if exists "node_rewards_status_check";
alter table "public"."node_rewards"
  add constraint "node_rewards_status_check"
  check (status in ('unclaimed', 'requested', 'claimed'));

alter table "public"."node_rewards"
  add column if not exists "redemption_id" uuid
  references "public"."reward_redemptions"(id);

-- Public (anon-callable): a customer's live unclaimed point balance for a
-- store, shown on the public page after they unlock it. node_rewards
-- itself is staff-only via RLS, so this is the only way an anonymous
-- visitor can see their own total.
create or replace function "public"."get_unclaimed_reward_summary"(
  p_store_id uuid,
  p_phone text
)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(sum(points), 0)::int
  from public.node_rewards
  where node_id = p_store_id
    and phone = p_phone
    and status = 'unclaimed';
$$;

revoke all on function "public"."get_unclaimed_reward_summary"(uuid, text) from public;
grant execute on function "public"."get_unclaimed_reward_summary"(uuid, text) to anon, authenticated;

-- Public (anon-callable): customer requests a redemption against a bill.
-- Consumes the customer's entire unclaimed balance at request time (not a
-- partial amount) and reserves those rows (status -> 'requested') so they
-- can't be spent twice while this request is pending staff review.
create or replace function "public"."request_reward_redemption"(
  p_store_id uuid,
  p_phone text,
  p_bill_number text,
  p_bill_amount numeric
)
returns "public"."reward_redemptions"
language plpgsql
security definer
set search_path = public
as $$
declare
  v_points int;
  v_rate numeric;
  v_cap boolean;
  v_discount numeric;
  v_redemption public.reward_redemptions;
begin
  if not exists (select 1 from public.nodes where id = p_store_id) then
    raise exception 'store % not found', p_store_id;
  end if;

  if exists (
    select 1 from public.reward_redemptions
    where node_id = p_store_id and phone = p_phone and status = 'requested'
  ) then
    raise exception 'a redemption request is already pending for this phone number';
  end if;

  select coalesce(sum(points), 0) into v_points
  from public.node_rewards
  where node_id = p_store_id and phone = p_phone and status = 'unclaimed';

  if v_points <= 0 then
    raise exception 'no unclaimed points for this phone number';
  end if;

  select
    coalesce(s.points_to_currency_rate, 1),
    coalesce(s.cap_discount_at_bill_amount, true)
  into v_rate, v_cap
  from (select 1) as _
  left join public.node_reward_settings s on s.node_id = p_store_id;

  v_discount := v_points * v_rate;
  if v_cap then
    v_discount := least(v_discount, p_bill_amount);
  end if;

  insert into public.reward_redemptions
    (node_id, phone, bill_number, bill_amount, points_applied, discount_amount)
  values
    (p_store_id, p_phone, p_bill_number, p_bill_amount, v_points, v_discount)
  returning * into v_redemption;

  update public.node_rewards
  set status = 'requested', redemption_id = v_redemption.id
  where node_id = p_store_id and phone = p_phone and status = 'unclaimed';

  return v_redemption;
end;
$$;

revoke all on function "public"."request_reward_redemption"(uuid, text, text, numeric) from public;
grant execute on function "public"."request_reward_redemption"(uuid, text, text, numeric) to anon, authenticated;

-- Staff-only: approve or reject a pending redemption request. Approving
-- claims the reserved reward rows for real; rejecting releases them back
-- to 'unclaimed' so they're claimable again in a future request.
create or replace function "public"."review_reward_redemption"(
  p_redemption_id uuid,
  p_approve boolean
)
returns "public"."reward_redemptions"
language plpgsql
security definer
set search_path = public
as $$
declare
  v_node_id uuid;
  v_redemption public.reward_redemptions;
begin
  select node_id into v_node_id
  from public.reward_redemptions
  where id = p_redemption_id;

  if v_node_id is null then
    raise exception 'redemption % not found', p_redemption_id;
  end if;

  if not "public"."can_manage_node_members"(v_node_id) then
    raise exception 'not authorized to review redemptions for this store';
  end if;

  if p_approve then
    update public.reward_redemptions
    set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_redemption_id
    returning * into v_redemption;

    update public.node_rewards
    set status = 'claimed', claimed_at = now(), claimed_by = auth.uid()
    where redemption_id = p_redemption_id;
  else
    update public.reward_redemptions
    set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now()
    where id = p_redemption_id
    returning * into v_redemption;

    update public.node_rewards
    set status = 'unclaimed', redemption_id = null
    where redemption_id = p_redemption_id;
  end if;

  return v_redemption;
end;
$$;

revoke all on function "public"."review_reward_redemption"(uuid, boolean) from public;
grant execute on function "public"."review_reward_redemption"(uuid, boolean) to authenticated;
