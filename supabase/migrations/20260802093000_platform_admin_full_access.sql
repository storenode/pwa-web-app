-- The existing nodes UPDATE policy already grants a brand member access to
-- its child stores via `parent_id in (select node_id from node_members ...)`
-- — that part matches the documented node cascade rule (see
-- storenode-schema.svg "role at node covers all children") and needs no
-- change. What's missing is the platform tier: the "storenode" root node
-- (see seed.sql — parent_id is null, platform_admin is just a regular
-- node_members row on it) should have unrestricted access to every node,
-- membership, and channel, not just read access to nodes (which
-- 20260726041500_platform_tier_nodes_policy.sql already covers).
--
-- A SECURITY DEFINER helper avoids re-triggering RLS on node_members from
-- inside its own policy (same reasoning as is_node_member in
-- 20260725130400_fix_node_members_recursive_policies.sql).
create or replace function "public"."is_platform_admin"()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from "public"."node_members" nm
    join "public"."role_definitions" rd on rd.id = nm.role_id
    where nm.member_id = auth.uid()
      and rd.role_key = 'platform_admin'
  );
$$;

-- nodes: extend insert/update to platform admins (select is already
-- covered by "Platform admins can view all nodes"). Also add delete,
-- which had no policy at all yet.
create policy "Platform admins can create any node"
on "public"."nodes" for insert
to authenticated
with check ("public"."is_platform_admin"());

create policy "Platform admins can update any node"
on "public"."nodes" for update
to authenticated
using ("public"."is_platform_admin"())
with check ("public"."is_platform_admin"());

create policy "Platform admins can delete any node"
on "public"."nodes" for delete
to authenticated
using ("public"."is_platform_admin"());

-- node_members: select is already open to all authenticated users (see
-- 20260801120000_widen_node_members_read_access.sql); extend write access
-- so platform admins can manage membership on any node, not just nodes
-- they already belong to.
create policy "Platform admins can add memberships on any node"
on "public"."node_members" for insert
to authenticated
with check ("public"."is_platform_admin"());

create policy "Platform admins can update memberships on any node"
on "public"."node_members" for update
to authenticated
using ("public"."is_platform_admin"())
with check ("public"."is_platform_admin"());

create policy "Platform admins can remove memberships on any node"
on "public"."node_members" for delete
to authenticated
using ("public"."is_platform_admin"());

-- node_channels: platform admins get full CRUD across every node's
-- channels, on top of the per-node member policies added in
-- 20260802090000_create_node_channels.sql.
create policy "Platform admins can view all channels"
on "public"."node_channels" for select
to authenticated
using ("public"."is_platform_admin"());

create policy "Platform admins can add channels to any node"
on "public"."node_channels" for insert
to authenticated
with check ("public"."is_platform_admin"());

create policy "Platform admins can update channels on any node"
on "public"."node_channels" for update
to authenticated
using ("public"."is_platform_admin"())
with check ("public"."is_platform_admin"());

create policy "Platform admins can remove channels on any node"
on "public"."node_channels" for delete
to authenticated
using ("public"."is_platform_admin"());
