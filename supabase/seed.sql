-- Seed data for local development.
-- Static role definitions managed by the platform, plus a sample
-- StoreNode HQ member, node, and node membership.

-- 1) Role definitions (platform-managed, static list)
insert into "public"."role_definitions"
  ("role_key", "role_level", "display_name", "sort_order")
values
  ('platform_admin', 'platform', 'Platform Admin', 1),
  ('platform_manager', 'platform', 'Platform Manager', 2),
  ('platform_editor', 'platform', 'Platform Editor', 3),
  ('brand_admin', 'store', 'Brand Admin', 4),
  ('store_manager', 'store', 'Store Manager', 5),
  ('sales_person', 'store', 'Sales Person', 6),
  ('helper', 'store', 'Helper', 7),
  ('temporary', 'store', 'Temporary', 8)
on conflict ("role_key") do nothing;

-- 2) Auth user + member row for the StoreNode HQ account
insert into "auth"."users"
  ("id", "instance_id", "aud", "role", "email", "encrypted_password",
   "email_confirmed_at", "created_at", "updated_at",
   "raw_app_meta_data", "raw_user_meta_data",
   "confirmation_token", "recovery_token", "email_change_token_new",
   "email_change", "email_change_token_current", "phone_change",
   "phone_change_token", "reauthentication_token")
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'storenode.hq@gmail.com', '',
   now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}',
   '', '', '', '', '', '', '', '')
on conflict ("id") do nothing;

insert into "public"."members"
  ("id", "first_name", "last_name", "display_name", "email", "is_active")
values
  ('00000000-0000-0000-0000-000000000001', 'StoreNode', 'HQ', 'StoreNode HQ',
   'storenode.hq@gmail.com', true)
on conflict ("id") do nothing;

-- 3) StoreNode platform node
insert into "public"."nodes"
  ("id", "parent_id", "name", "display_name", "slug", "status")
values
  ('00000000-0000-0000-0000-000000000101', null, 'storenode', 'StoreNode', 'storenode', 'active')
on conflict ("id") do nothing;

-- 4) Membership linking StoreNode HQ member to the StoreNode node as Platform Admin
insert into "public"."node_members"
  ("node_id", "member_id", "role_id")
values
  ('00000000-0000-0000-0000-000000000101',
   '00000000-0000-0000-0000-000000000001',
   (select "id" from "public"."role_definitions" where "role_key" = 'platform_admin'))
on conflict ("node_id", "member_id") do nothing;
