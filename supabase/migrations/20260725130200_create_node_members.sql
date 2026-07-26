create table if not exists "public"."node_members" (
  "id" uuid primary key default gen_random_uuid(),
  "node_id" uuid not null references "public"."nodes"(id) on delete cascade,
  "member_id" uuid not null references "public"."members"(id) on delete cascade,
  "role_id" uuid references "public"."role_definitions"(id),
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("node_id", "member_id")
);

create trigger "node_members_set_updated_at"
before update on "public"."node_members"
for each row execute function "public"."set_updated_at"();

alter table "public"."node_members" enable row level security;

create policy "Members can view memberships on their nodes"
on "public"."node_members" for select
to authenticated
using (
  member_id = auth.uid()
  or node_id in (select node_id from "public"."node_members" where member_id = auth.uid())
);

create policy "Members can add themselves or invite to their nodes"
on "public"."node_members" for insert
to authenticated
with check (
  member_id = auth.uid()
  or node_id in (select node_id from "public"."node_members" where member_id = auth.uid())
);

create policy "Members can update memberships on their nodes"
on "public"."node_members" for update
to authenticated
using (node_id in (select node_id from "public"."node_members" where member_id = auth.uid()))
with check (node_id in (select node_id from "public"."node_members" where member_id = auth.uid()));

create policy "Members can remove memberships on their nodes"
on "public"."node_members" for delete
to authenticated
using (node_id in (select node_id from "public"."node_members" where member_id = auth.uid()));
