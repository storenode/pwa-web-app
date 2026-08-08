-- Public (anon-callable) lookup of a customer's date of birth on file for a
-- store, so the claim page can prefill and lock the DOB field for a
-- returning phone number instead of leaving it blank/editable every visit.
-- node_rewards itself is staff-only via RLS, so this is the only way an
-- anonymous visitor can see this.
create or replace function "public"."get_customer_date_of_birth"(
  p_store_id uuid,
  p_phone text
)
returns date
language sql
security definer
set search_path = public
stable
as $$
  select date_of_birth
  from public.node_rewards
  where node_id = p_store_id
    and phone = p_phone
    and date_of_birth is not null
  order by created_at desc
  limit 1;
$$;

revoke all on function "public"."get_customer_date_of_birth"(uuid, text) from public;
grant execute on function "public"."get_customer_date_of_birth"(uuid, text) to anon, authenticated;
