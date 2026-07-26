-- The node_members policies referenced node_members inside their own
-- USING/WITH CHECK subqueries, which Postgres detects as infinite
-- recursion (42P17) and surfaces to PostgREST as a 500. A SECURITY
-- DEFINER function runs with the privileges of its owner, so it bypasses
-- RLS on node_members instead of re-triggering it.
create or replace function "public"."is_node_member"(check_node_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from "public"."node_members"
    where node_id = check_node_id
      and member_id = auth.uid()
  );
$$;

drop policy if exists "Members can view memberships on their nodes" on "public"."node_members";
drop policy if exists "Members can add themselves or invite to their nodes" on "public"."node_members";
drop policy if exists "Members can update memberships on their nodes" on "public"."node_members";
drop policy if exists "Members can remove memberships on their nodes" on "public"."node_members";

create policy "Members can view memberships on their nodes"
on "public"."node_members" for select
to authenticated
using (
  member_id = auth.uid()
  or "public"."is_node_member"(node_id)
);

create policy "Members can add themselves or invite to their nodes"
on "public"."node_members" for insert
to authenticated
with check (
  member_id = auth.uid()
  or "public"."is_node_member"(node_id)
);

create policy "Members can update memberships on their nodes"
on "public"."node_members" for update
to authenticated
using ("public"."is_node_member"(node_id))
with check ("public"."is_node_member"(node_id));

create policy "Members can remove memberships on their nodes"
on "public"."node_members" for delete
to authenticated
using ("public"."is_node_member"(node_id));
