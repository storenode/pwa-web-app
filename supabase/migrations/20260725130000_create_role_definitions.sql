create table if not exists "public"."role_definitions" (
  "id" uuid primary key default gen_random_uuid(),
  "role_key" text not null unique,
  "role_level" text,
  "display_name" text,
  "display_name_te" text,
  "description" text,
  "scenario" text,
  "capabilities" jsonb,
  "assignable_by" text[],
  "sort_order" int,
  "is_active" boolean not null default true
);

alter table "public"."role_definitions" enable row level security;

create policy "Authenticated users can view role definitions"
on "public"."role_definitions" for select
to authenticated
using (true);
