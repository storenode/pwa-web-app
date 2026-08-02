create extension if not exists supabase_vault;

-- Stores/rotates a channel's secret token in Supabase Vault, keyed by
-- "<token_type>:<node_channels.id>" (see storenode-schema.svg vault.secrets
-- naming: meta_page_token:<node_channels.id> / meta_user_token:<brand_node_id>).
-- The token itself never lands in a plain public table/column; only this
-- security-definer function may write to vault.secrets, never PostgREST.
create or replace function "public"."set_node_channel_token"(
  p_channel_id uuid,
  p_token text,
  p_token_type text default 'meta_page_token'
)
returns void
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  v_node_id uuid;
  v_secret_name text;
  v_existing_id uuid;
begin
  select node_id into v_node_id
  from public.node_channels
  where id = p_channel_id;

  if v_node_id is null then
    raise exception 'node_channels row % not found', p_channel_id;
  end if;

  if not exists (
    select 1 from public.node_members
    where node_id = v_node_id and member_id = auth.uid()
  ) then
    raise exception 'not authorized for node %', v_node_id;
  end if;

  v_secret_name := p_token_type || ':' || p_channel_id::text;

  select id into v_existing_id
  from vault.secrets
  where name = v_secret_name;

  if v_existing_id is null then
    perform vault.create_secret(p_token, v_secret_name);
  else
    perform vault.update_secret(v_existing_id, p_token);
  end if;

  update public.node_channels
  set token_health = 'ok',
      token_last_refreshed_at = now()
  where id = p_channel_id;
end;
$$;

revoke all on function "public"."set_node_channel_token"(uuid, text, text) from public;
grant execute on function "public"."set_node_channel_token"(uuid, text, text) to authenticated;

-- Read-only health/expiry lookup — never returns the raw token.
create or replace function "public"."get_node_channel_token_health"(p_channel_id uuid)
returns table (
  token_health text,
  token_last_refreshed_at timestamptz,
  page_token_expires_at timestamptz,
  user_token_expires_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select nc.token_health, nc.token_last_refreshed_at,
         nc.page_token_expires_at, nc.user_token_expires_at
  from public.node_channels nc
  where nc.id = p_channel_id
    and nc.node_id in (
      select node_id from public.node_members where member_id = auth.uid()
    );
$$;

revoke all on function "public"."get_node_channel_token_health"(uuid) from public;
grant execute on function "public"."get_node_channel_token_health"(uuid) to authenticated;
