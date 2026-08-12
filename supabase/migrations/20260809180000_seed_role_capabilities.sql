-- Populates role_definitions.capabilities for existing rows (the seed.sql
-- inserts use `on conflict do nothing`, so they never touch already-seeded
-- databases). See src/shared/capabilities.ts for the key vocabulary and the
-- "<resource>:*" / "*:*" wildcard convention.

update "public"."role_definitions"
set "capabilities" = '["dashboard:*", "nodes:*", "store:*", "rewards:*", "voice_reviews:*", "suppliers:*", "supplier_invoices:*"]'::jsonb
where "role_key" = 'platform_admin';

update "public"."role_definitions"
set "capabilities" = '["dashboard:*", "nodes:*", "store:*", "rewards:*", "voice_reviews:*"]'::jsonb
where "role_key" = 'platform_manager';

update "public"."role_definitions"
set "capabilities" = '["dashboard:*", "store:*", "rewards:*", "voice_reviews:*", "nodes:browse_all", "nodes:view", "nodes:create_store", "suppliers:*"]'::jsonb
where "role_key" in ('store_manager', 'brand_admin');

update "public"."role_definitions"
set "capabilities" = '["dashboard:*", "store:*"]'::jsonb
where "role_key" = 'platform_editor';

update "public"."role_definitions"
set "capabilities" = '["dashboard:*", "rewards:*", "voice_reviews:*"]'::jsonb
where "role_key" = 'sales_person';

update "public"."role_definitions"
set "capabilities" = '["dashboard:*", "rewards:*"]'::jsonb
where "role_key" in ('helper', 'temporary');
