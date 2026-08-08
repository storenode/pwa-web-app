-- Public (anon-callable) cross-store lookup: given a phone number, find
-- every store where it has any reward activity, with the underlying reward
-- rows so the client can group them into a per-store view (e.g. tabs). A
-- phone number can have rewards at several unrelated stores, so this is a
-- genuine "search across the platform" endpoint, not a single-store RPC
-- like get_public_store_info/get_unclaimed_reward_summary. node_rewards
-- itself is staff-only via RLS, so anon access has to go through this.
--
-- Note: this intentionally lets anyone who knows a phone number see which
-- stores it has reward history at (store names + reward rows, no other
-- PII) — that's inherent to a public "find my rewards by phone" feature.
create or replace function "public"."find_rewards_by_phone"(p_phone text)
returns table (
  node_id uuid,
  store_name text,
  reward_type text,
  channel_type text,
  points int,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    n.id,
    coalesce(n.display_name, n.name),
    nr.reward_type,
    nr.channel_type,
    nr.points,
    nr.status,
    nr.created_at
  from public.node_rewards nr
  join public.nodes n on n.id = nr.node_id
  where nr.phone = p_phone
  order by nr.created_at desc;
$$;

revoke all on function "public"."find_rewards_by_phone"(text) from public;
grant execute on function "public"."find_rewards_by_phone"(text) to anon, authenticated;
