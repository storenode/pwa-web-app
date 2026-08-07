-- Same gap as node_members (see 20260803090000_node_members_brand_cascade_access.sql):
-- node_channels' write policies only matched an exact node_id in
-- node_members, so a brand_admin (membership row on the brand) got a 403
-- writing channels for one of that brand's child stores. Reuse the
-- cascade-aware can_manage_node_members() function (checks direct
-- membership OR membership on the node's parent) instead of the flat
-- `node_id in (select node_id from node_members ...)` check.

drop policy if exists "Members can view channels on their nodes" on "public"."node_channels";
drop policy if exists "Members can add channels to their nodes" on "public"."node_channels";
drop policy if exists "Members can update channels on their nodes" on "public"."node_channels";
drop policy if exists "Members can remove channels on their nodes" on "public"."node_channels";

create policy "Members can view channels on their nodes"
on "public"."node_channels" for select
to authenticated
using ("public"."can_manage_node_members"(node_id));

create policy "Members can add channels to their nodes"
on "public"."node_channels" for insert
to authenticated
with check ("public"."can_manage_node_members"(node_id));

create policy "Members can update channels on their nodes"
on "public"."node_channels" for update
to authenticated
using ("public"."can_manage_node_members"(node_id))
with check ("public"."can_manage_node_members"(node_id));

create policy "Members can remove channels on their nodes"
on "public"."node_channels" for delete
to authenticated
using ("public"."can_manage_node_members"(node_id));
