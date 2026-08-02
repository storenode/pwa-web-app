-- The "Members can view memberships on their nodes" policy scoped
-- node_members SELECT to rows where the requester already held a
-- node_members row on that exact node_id. That doesn't honor the
-- documented cascade rule ("role at node (via node_members) covers all
-- children" — see storenode-schema.svg) and blocks legitimate reads of a
-- store's member list by anyone who isn't already a member of that exact
-- store. Any authenticated user managing store members needs to be able
-- to list them regardless of their own membership on that specific node.
drop policy if exists "Members can view memberships on their nodes" on "public"."node_members";

create policy "Authenticated users can view node memberships"
on "public"."node_members" for select
to authenticated
using (true);

-- "members" RLS still limited select to the requester's own row, which
-- meant the node_members -> members embed above returned null email/
-- display_name for every teammate. Widen read access the same way so the
-- join actually returns member details.
create policy "Authenticated users can view all members"
on "public"."members" for select
to authenticated
using (true);
