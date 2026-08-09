-- Customer voice-to-text feedback: recorded via the browser's Web Speech
-- API on the public store page, transcript reviewed/edited by the customer,
-- then submitted here. Staff-only read (same shape as node_rewards /
-- reward_redemptions) — no anon/authenticated insert policy, creation only
-- via submit_voice_review() so the client can't forge rows or spam the
-- table directly.
create table if not exists "public"."node_voice_reviews" (
  "id" uuid primary key default gen_random_uuid(),
  "node_id" uuid not null references "public"."nodes"(id) on delete cascade,
  "phone" text not null,
  "review_text" text not null,
  "created_at" timestamptz not null default now()
);

create index "node_voice_reviews_node_id_idx" on "public"."node_voice_reviews" ("node_id");

alter table "public"."node_voice_reviews" enable row level security;

create policy "Members can view voice reviews on their nodes"
on "public"."node_voice_reviews" for select
to authenticated
using ("public"."can_manage_node_members"(node_id));

create or replace function "public"."submit_voice_review"(
  p_store_id uuid,
  p_phone text,
  p_review_text text
)
returns "public"."node_voice_reviews"
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.node_voice_reviews;
begin
  if not exists (select 1 from public.nodes where id = p_store_id) then
    raise exception 'store % not found', p_store_id;
  end if;

  insert into public.node_voice_reviews (node_id, phone, review_text)
  values (p_store_id, p_phone, p_review_text)
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function "public"."submit_voice_review"(uuid, text, text) from public;
grant execute on function "public"."submit_voice_review"(uuid, text, text) to anon, authenticated;
