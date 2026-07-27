-- Removes exactly what test-seed.sql added: the synthetic brand/store
-- nodes (their `on delete cascade` FK also removes any node_members rows
-- pointing at them), plus the role assignments on the pre-existing
-- storenode platform node (...101), looked up by email. Never touches
-- auth.users/members — those rows belong to real people and were never
-- inserted by test-seed.sql in the first place.

delete from "public"."node_members"
where "node_id" = '00000000-0000-0000-0000-000000000101'
  and "member_id" in (
    select "id" from "public"."members"
    where "email" = 'veerareddy.obula@gmail.com'
  );

delete from "public"."nodes"
where "id" in (
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000104',
  '00000000-0000-0000-0000-000000000105',
  '00000000-0000-0000-0000-000000000106'
);
