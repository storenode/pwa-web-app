-- India phone number for a node/store, surfaced on the store edit form and
-- read back (via the RPC below) on the public QR-scan landing page.
alter table "public"."nodes" add column if not exists "phone" text;

-- Public (anon-callable) read of only the fields a QR-scan landing page
-- needs: display name, phone, and the store's Google review URL (if any
-- google-type node_channels row exists). No token/health/expiry columns,
-- no way to enumerate other stores — mirrors the get_node_channel_token_health
-- pattern in 20260802090100_node_channels_token_rpc.sql, but callable by
-- anon since this page has no session at all.
create or replace function "public"."get_public_store_info"(p_store_id uuid)
returns table (
  display_name text,
  phone text,
  google_review_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select n.display_name, n.phone, nc.url
  from public.nodes n
  left join public.node_channels nc
    on nc.node_id = n.id and nc.channel_type = 'google'
  where n.id = p_store_id;
$$;

revoke all on function "public"."get_public_store_info"(uuid) from public;
grant execute on function "public"."get_public_store_info"(uuid) to anon, authenticated;
