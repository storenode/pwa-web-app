-- Creates the "members" table (app-level user profile, keyed by auth.users.id)
-- and lets an authenticated user read/write only their own row.

create table if not exists "public"."members" (
  "id" uuid primary key references auth.users(id) on delete cascade,
  "first_name" text,
  "last_name" text,
  "display_name" text unique,
  "email" text,
  "avatar_url" text,
  "auth_provider" text,
  "provider_uid" text,
  "last_login_at" timestamptz,
  "is_active" boolean not null default true,
  "date_of_birth" date,
  "created_at" timestamptz not null default now(),
  "updated_at" timestamptz not null default now(),
  unique ("auth_provider", "provider_uid")
);

create or replace function "public"."set_updated_at"()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger "members_set_updated_at"
before update on "public"."members"
for each row execute function "public"."set_updated_at"();

alter table "public"."members" enable row level security;

create policy "Members can view own row"
on "public"."members" for select
to authenticated
using (auth.uid() = id);

create policy "Members can insert own row"
on "public"."members" for insert
to authenticated
with check (auth.uid() = id);

create policy "Members can update own row"
on "public"."members" for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
