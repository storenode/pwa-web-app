-- Only platform_admin/platform_manager may create or edit a top-level node
-- (brand). store_manager/brand_admin manage stores under a node, but not
-- the node itself, so they lose the blanket "nodes:*" wildcard (which
-- included nodes:manage) and get explicit browse/view/create_store access
-- instead.
update "public"."role_definitions"
set "capabilities" = '["dashboard:*", "store:*", "rewards:*", "voice_reviews:*", "nodes:browse_all", "nodes:view", "nodes:create_store"]'::jsonb
where "role_key" in ('store_manager', 'brand_admin');
