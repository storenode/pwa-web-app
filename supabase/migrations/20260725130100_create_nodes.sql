create table if not exists "public"."nodes" (
  "id" uuid primary key default gen_random_uuid(),
  "parent_id" uuid references "public"."nodes"(id) on delete cascade,
  "name" text,
  "display_name" text,
  "slug" text unique,
  "status" text,
  "logo_url" text,
  "city" text,
  "address" text,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now()
);

create trigger "nodes_set_updated_at"
before update on "public"."nodes"
for each row execute function "public"."set_updated_at"();

alter table "public"."nodes" enable row level security;
