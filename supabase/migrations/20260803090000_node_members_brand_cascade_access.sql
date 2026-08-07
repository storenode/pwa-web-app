-- is_node_member(node_id) only matches an exact node_id, so a brand_admin
-- (whose node_members row lives on the brand node) gets a 403 writing
-- node_members for one of that brand's child stores — the same cascade
-- rule the `nodes` table policies already honor ("role at node covers all
-- children", see storenode-schema.svg) was never applied to node_members
-- itself. This adds a cascade-aware check: a member can manage
-- node_members rows on a node they belong to directly, OR on a node whose
-- parent they belong to.
create or replace function "public"."can_manage_node_members"(target_node_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from "public"."node_members" nm
    where nm.member_id = auth.uid()
      and (
        nm.node_id = target_node_id
        or nm.node_id = (select parent_id from "public"."nodes" where id = target_node_id)
      )
  );
$$;

drop policy if exists "Members can add themselves or invite to their nodes" on "public"."node_members";
drop policy if exists "Members can update memberships on their nodes" on "public"."node_members";
drop policy if exists "Members can remove memberships on their nodes" on "public"."node_members";

create policy "Members can add themselves or invite to their nodes"
on "public"."node_members" for insert
to authenticated
with check (
  member_id = auth.uid()
  or "public"."can_manage_node_members"(node_id)
);

create policy "Members can update memberships on their nodes"
on "public"."node_members" for update
to authenticated
using ("public"."can_manage_node_members"(node_id))
with check ("public"."can_manage_node_members"(node_id));

create policy "Members can remove memberships on their nodes"
on "public"."node_members" for delete
to authenticated
using ("public"."can_manage_node_members"(node_id));
