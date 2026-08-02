create table if not exists "public"."node_channels" (
  "id" uuid primary key default gen_random_uuid(),
  "node_id" uuid not null references "public"."nodes"(id) on delete cascade,
  "channel_type" text not null,
  "external_id" text,
  "url" text,
  "label" text,
  "is_primary" boolean not null default false,
  "status" text,
  "last_verified_at" timestamptz,
  "verify_error" text,
  "token_health" text,
  "page_token_expires_at" timestamptz,
  "user_token_expires_at" timestamptz,
  "token_last_refreshed_at" timestamptz,
  "created_at" timestamptz not null default now(),
  "created_by" uuid references "public"."members"(id),
  unique ("node_id", "channel_type", "external_id")
);

-- One "google" channel per node (see storenode-schema.svg "channel constraints").
create unique index "node_channels_one_google_per_node"
on "public"."node_channels" ("node_id")
where ("channel_type" = 'google');

-- One primary channel per (node, type).
create unique index "node_channels_one_primary_per_type"
on "public"."node_channels" ("node_id", "channel_type")
where ("is_primary");

alter table "public"."node_channels" enable row level security;

create policy "Members can view channels on their nodes"
on "public"."node_channels" for select
to authenticated
using (
  node_id in (select node_id from "public"."node_members" where member_id = auth.uid())
);

create policy "Members can add channels to their nodes"
on "public"."node_channels" for insert
to authenticated
with check (
  node_id in (select node_id from "public"."node_members" where member_id = auth.uid())
);

create policy "Members can update channels on their nodes"
on "public"."node_channels" for update
to authenticated
using (node_id in (select node_id from "public"."node_members" where member_id = auth.uid()))
with check (node_id in (select node_id from "public"."node_members" where member_id = auth.uid()));

create policy "Members can remove channels on their nodes"
on "public"."node_channels" for delete
to authenticated
using (node_id in (select node_id from "public"."node_members" where member_id = auth.uid()));
