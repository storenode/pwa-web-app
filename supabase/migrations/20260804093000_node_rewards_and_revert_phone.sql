-- Correction: "phone number" on the public store page is a CUSTOMER's
-- phone captured when they claim a review reward, not the store's own
-- contact number. Drop the misapplied nodes.phone column and replace it
-- with a proper node_rewards table.
alter table "public"."nodes" drop column if exists "phone";

create table if not exists "public"."node_rewards" (
  "id" uuid primary key default gen_random_uuid(),
  "node_id" uuid not null references "public"."nodes"(id) on delete cascade,
  "phone" text not null,
  "points" int not null default 10,
  "status" text not null default 'unclaimed' check (status in ('unclaimed', 'claimed')),
  "created_at" timestamptz not null default now(),
  "claimed_at" timestamptz,
  "claimed_by" uuid references "public"."members"(id)
);

create index "node_rewards_node_id_idx" on "public"."node_rewards" ("node_id");

alter table "public"."node_rewards" enable row level security;

-- Staff (same brand-cascade access as node_members/node_channels) can view
-- and mark claims on their stores' rewards.
create policy "Members can view rewards on their nodes"
on "public"."node_rewards" for select
to authenticated
using ("public"."can_manage_node_members"(node_id));

create policy "Members can update rewards on their nodes"
on "public"."node_rewards" for update
to authenticated
using ("public"."can_manage_node_members"(node_id))
with check ("public"."can_manage_node_members"(node_id));

-- No direct anon/authenticated INSERT policy: a customer claiming a
-- reward goes through claim_store_reward() below, so points/status can't
-- be forged by the client and node_id is verified to actually be a store.
create or replace function "public"."claim_store_reward"(
  p_store_id uuid,
  p_phone text
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

  insert into public.node_rewards (node_id, phone)
  values (p_store_id, p_phone)
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function "public"."claim_store_reward"(uuid, text) from public;
grant execute on function "public"."claim_store_reward"(uuid, text) to anon, authenticated;

-- get_public_store_info no longer returns phone (that was the store's
-- contact number, not what this app tracks) — drop and recreate since the
-- return signature is changing.
drop function if exists "public"."get_public_store_info"(uuid);

create function "public"."get_public_store_info"(p_store_id uuid)
returns table (
  display_name text,
  google_review_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select n.display_name, nc.url
  from public.nodes n
  left join public.node_channels nc
    on nc.node_id = n.id and nc.channel_type = 'google'
  where n.id = p_store_id;
$$;

revoke all on function "public"."get_public_store_info"(uuid) from public;
grant execute on function "public"."get_public_store_info"(uuid) to anon, authenticated;
