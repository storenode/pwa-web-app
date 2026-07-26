create policy "Members can view nodes they belong to"
on "public"."nodes" for select
to authenticated
using (
  id in (select node_id from "public"."node_members" where member_id = auth.uid())
  or parent_id in (select node_id from "public"."node_members" where member_id = auth.uid())
);

create policy "Authenticated users can create brand nodes"
on "public"."nodes" for insert
to authenticated
with check (
  parent_id is null
  or parent_id in (select node_id from "public"."node_members" where member_id = auth.uid())
);

create policy "Members can update nodes they belong to"
on "public"."nodes" for update
to authenticated
using (
  id in (select node_id from "public"."node_members" where member_id = auth.uid())
  or parent_id in (select node_id from "public"."node_members" where member_id = auth.uid())
)
with check (
  id in (select node_id from "public"."node_members" where member_id = auth.uid())
  or parent_id in (select node_id from "public"."node_members" where member_id = auth.uid())
);
