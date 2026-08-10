-- Test data for exercising role/node combinations.
-- Scoped to tables that actually exist in migrations today: nodes,
-- node_members, role_definitions. schema v3 (storenode-schema.svg) also
-- shows node_channels, but no migration creates it yet, so it's left out.
--
-- IMPORTANT: all 9 people below are real Gmail accounts, not synthetic
-- test users. We never insert into auth.users/members for them — that
-- would collide with (or orphan) their real Google-login identity. Each
-- role assignment is looked up by email via `insert ... select ... from
-- members where email = ...`, which safely inserts 0 rows if that person
-- hasn't logged in yet. Re-run this file any time after someone logs in
-- for the first time to backfill their role.
--
-- Layout:
--   Platform tier (storenode node, id ...101, already seeded by seed.sql):
--     - platform_admin (pre-existing, seed.sql): storenode.hq@gmail.com
--     - platform_manager: veerareddy.obula@gmail.com
--     - platform_editor (multi-store, same brand): vbreddy.obulareddy@gmail.com
--     - platform_editor (multi-store, cross-brand): kalyanisreddy@gmail.com
--   Brand: Urban Thread (...102)
--     Store: Urban Thread – Vijayawada (...103)
--     Store: Urban Thread – Guntur (...104)
--   Brand: Fashion Bazaar (...105)
--     Store: Fashion Bazaar – Tirupati (...106)
--     - brand_admin on the Urban Thread brand (cascades to its stores): deepthi.juni@gmail.com
--     - store_manager @ Vijayawada (standalone): obulareddyveera@gmail.com
--     - sales_person @ Vijayawada (standalone): veerabhargavablr@gmail.com
--     - helper @ Guntur (standalone): webintsolutions@gmail.com
--     - temporary @ Guntur (standalone): hemitha.obula@gmail.com
--     - two different roles at two different nodes, cross-brand
--       (store_manager @ Guntur, sales_person @ Tirupati): ghargpt.team@gmail.com

-- 0) Role definitions (no-op if seed.sql already ran)
insert into "public"."role_definitions"
  ("role_key", "role_level", "display_name", "sort_order", "capabilities")
values
  ('platform_admin', 'platform', 'Platform Admin', 1, '["dashboard:*", "nodes:*", "store:*", "rewards:*", "voice_reviews:*"]'),
  ('platform_manager', 'platform', 'Platform Manager', 2, '["dashboard:*", "nodes:*", "store:*", "rewards:*", "voice_reviews:*"]'),
  ('platform_editor', 'platform', 'Platform Editor', 3, '["dashboard:*", "store:*"]'),
  ('brand_admin', 'store', 'Brand Admin', 4, '["dashboard:*", "store:*", "rewards:*", "voice_reviews:*", "nodes:browse_all", "nodes:view", "nodes:create_store"]'),
  ('store_manager', 'store', 'Store Manager', 5, '["dashboard:*", "store:*", "rewards:*", "voice_reviews:*", "nodes:browse_all", "nodes:view", "nodes:create_store"]'),
  ('sales_person', 'store', 'Sales Person', 6, '["dashboard:*", "rewards:*", "voice_reviews:*"]'),
  ('helper', 'store', 'Helper', 7, '["dashboard:*", "rewards:*"]'),
  ('temporary', 'store', 'Temporary', 8, '["dashboard:*", "rewards:*"]')
on conflict ("role_key") do nothing;

-- 1) Nodes: two brands, three stores between them (synthetic, safe)
insert into "public"."nodes"
  ("id", "parent_id", "name", "display_name", "slug", "status", "city")
values
  ('00000000-0000-0000-0000-000000000102', null, 'urban-thread', 'Urban Thread', 'urban-thread', 'active', null),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000102', 'urban-thread-vijayawada', 'Urban Thread – Vijayawada', 'urban-thread-vijayawada', 'active', 'Vijayawada'),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000102', 'urban-thread-guntur', 'Urban Thread – Guntur', 'urban-thread-guntur', 'active', 'Guntur'),
  ('00000000-0000-0000-0000-000000000105', null, 'fashion-bazaar', 'Fashion Bazaar', 'fashion-bazaar', 'active', null),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000105', 'fashion-bazaar-tirupati', 'Fashion Bazaar – Tirupati', 'fashion-bazaar-tirupati', 'active', 'Tirupati')
on conflict ("id") do nothing;

-- 2) Role assignments, looked up by email — 0 rows inserted for anyone
-- who hasn't logged in yet.

-- veerareddy.obula@gmail.com: platform_manager on the platform node
insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000101', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'platform_manager')
from "public"."members" m
where m."email" = 'veerareddy.obula@gmail.com'
on conflict ("node_id", "member_id") do nothing;

-- vbreddy.obulareddy@gmail.com: platform_editor across 2 stores, same brand
insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000103', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'platform_editor')
from "public"."members" m
where m."email" = 'vbreddy.obulareddy@gmail.com'
on conflict ("node_id", "member_id") do nothing;

insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000104', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'platform_editor')
from "public"."members" m
where m."email" = 'vbreddy.obulareddy@gmail.com'
on conflict ("node_id", "member_id") do nothing;

-- kalyanisreddy@gmail.com: platform_editor across 2 stores, different brands
insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000103', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'platform_editor')
from "public"."members" m
where m."email" = 'kalyanisreddy@gmail.com'
on conflict ("node_id", "member_id") do nothing;

insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000106', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'platform_editor')
from "public"."members" m
where m."email" = 'kalyanisreddy@gmail.com'
on conflict ("node_id", "member_id") do nothing;

-- deepthi.juni@gmail.com: brand_admin at the brand level (cascades to its stores)
insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000102', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'brand_admin')
from "public"."members" m
where m."email" = 'deepthi.juni@gmail.com'
on conflict ("node_id", "member_id") do nothing;

-- obulareddyveera@gmail.com: store_manager @ Vijayawada (standalone)
-- NOTE: no dot before "veera" — this is the real registered Google
-- address; the dotted version (obulareddy.veera@gmail.com) doesn't exist.
insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000103', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'store_manager')
from "public"."members" m
where m."email" = 'obulareddyveera@gmail.com'
on conflict ("node_id", "member_id") do nothing;

-- veerabhargavablr@gmail.com: sales_person @ Vijayawada (standalone)
insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000103', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'sales_person')
from "public"."members" m
where m."email" = 'veerabhargavablr@gmail.com'
on conflict ("node_id", "member_id") do nothing;

-- webintsolutions@gmail.com: helper @ Guntur (standalone)
insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000104', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'helper')
from "public"."members" m
where m."email" = 'webintsolutions@gmail.com'
on conflict ("node_id", "member_id") do nothing;

-- hemitha.obula@gmail.com: temporary @ Guntur (standalone)
insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000104', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'temporary')
from "public"."members" m
where m."email" = 'hemitha.obula@gmail.com'
on conflict ("node_id", "member_id") do nothing;

-- ghargpt.team@gmail.com: store_manager @ Guntur, sales_person @ Tirupati
-- (two different roles, two different nodes, cross-brand)
insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000104', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'store_manager')
from "public"."members" m
where m."email" = 'ghargpt.team@gmail.com'
on conflict ("node_id", "member_id") do nothing;

insert into "public"."node_members" ("node_id", "member_id", "role_id")
select '00000000-0000-0000-0000-000000000106', m."id",
  (select "id" from "public"."role_definitions" where "role_key" = 'sales_person')
from "public"."members" m
where m."email" = 'ghargpt.team@gmail.com'
on conflict ("node_id", "member_id") do nothing;
