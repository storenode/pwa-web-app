-- store_admin is renamed to brand_admin: this role is assigned on the
-- brand (parent) node and cascades down to all of that brand's stores
-- (see "Members can view nodes they belong to" / node cascade rules in
-- nodes_policies.sql), so "brand_admin" describes its scope more
-- accurately than "store_admin". role_level stays 'store' — this is
-- still a business-owner-side role, not a StoreNode platform role.
--
-- This only updates the role_key/display_name on the existing row;
-- role_id foreign keys on node_members are untouched, so no membership
-- data needs to change.
update "public"."role_definitions"
set "role_key" = 'brand_admin',
    "display_name" = 'Brand Admin'
where "role_key" = 'store_admin';
