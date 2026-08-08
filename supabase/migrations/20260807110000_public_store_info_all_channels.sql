-- get_public_store_info only ever surfaced the Google channel's URL, so the
-- public QR-scan landing page could only ever show a single "Leave a Google
-- Review" button — a store with an active Instagram/Facebook/WhatsApp/YouTube/
-- website channel had no way to expose those. Return one row per active,
-- URL-having channel instead of a single google_review_url column, so the
-- client can render a button per active channel. display_name is repeated
-- per row (or returned alone, via the left join, if the store has no active
-- channels) rather than requiring a second round trip.
drop function if exists "public"."get_public_store_info"(uuid);

create function "public"."get_public_store_info"(p_store_id uuid)
returns table (
  display_name text,
  channel_type text,
  url text
)
language sql
security definer
set search_path = public
stable
as $$
  select n.display_name, nc.channel_type, nc.url
  from public.nodes n
  left join public.node_channels nc
    on nc.node_id = n.id
    and nc.status = 'active'
    and nc.url is not null
  where n.id = p_store_id;
$$;

revoke all on function "public"."get_public_store_info"(uuid) from public;
grant execute on function "public"."get_public_store_info"(uuid) to anon, authenticated;
