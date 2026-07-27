-- The existing "Members can view nodes they belong to" policy only covers a
-- member's own node and its direct children. Only platform_admin needs
-- system-wide visibility into every node. Other platform-tier roles
-- (platform_manager, platform_editor) are role *definitions* assignable
-- across any node, but each grant is still a specific node_members row —
-- e.g. an editor or accountant assigned to a handful of stores — so they
-- must stay scoped to their own memberships like any store-tier role.
create policy "Platform admins can view all nodes"
on "public"."nodes" for select
to authenticated
using (
  exists (
    select 1
    from "public"."node_members" nm
    join "public"."role_definitions" rd on rd.id = nm.role_id
    where nm.member_id = auth.uid()
      and rd.role_key = 'platform_admin'
  )
);
