-- ============================================================
-- Supplier Invoice Receiving — Schema v1
-- Tables: suppliers, supplier_invoices, supplier_invoice_items
--
-- Placeholders resolved against this repo's actual migrations:
--   1. public.set_updated_at() — already exists (see
--      20260725120000_create_members.sql), reused as-is.
--   2. public.has_node_capability(node_id, capability_key) — does not
--      exist in this schema. RLS here has no per-capability helper;
--      brand-scoped tables (node_channels, node_rewards) instead use
--      can_manage_node_members(node_id) — a cascade-aware "member on
--      this node or its parent" check — for both read and write, plus
--      a stacked is_platform_admin() bypass policy (the node_channels
--      pattern; node_rewards never got the platform-admin policy, but
--      it's included here for full-access parity). See
--      20260803090000_node_members_brand_cascade_access.sql and
--      20260802093000_platform_admin_full_access.sql.
-- ============================================================

-- ----------------------------------------------------------------
-- suppliers
-- ----------------------------------------------------------------
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.nodes(id),
  name text not null,
  location_city text,
  gstin text,
  contact_phone text,
  contact_email text,
  notes text,
  auto_created boolean not null default false,
  created_by uuid references public.members(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_suppliers_node_id on public.suppliers(node_id);

-- Enforce node_id is always a brand/corporate node (parent_id IS NULL).
-- Reused by supplier_invoices below too.
create or replace function public.enforce_brand_node()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.nodes
    where id = NEW.node_id and parent_id is null
  ) then
    raise exception 'node_id % is not a brand/corporate node (parent_id must be null)', NEW.node_id;
  end if;
  return NEW;
end;
$$;

create trigger trg_suppliers_brand_node
  before insert or update of node_id on public.suppliers
  for each row execute function public.enforce_brand_node();

create trigger trg_suppliers_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------
-- supplier_invoices
-- ----------------------------------------------------------------
create table public.supplier_invoices (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.nodes(id),
  supplier_id uuid not null references public.suppliers(id),
  invoice_number text not null,
  invoice_type text not null check (invoice_type in ('proforma', 'tax_invoice', 'other')),
  invoice_date date not null,
  related_invoice_id uuid references public.supplier_invoices(id),
  source_file_url text,
  source_extraction_json jsonb, -- raw Claude Vision output, kept alongside the normalized columns below
  status text not null default 'captured'
    check (status in ('captured', 'verified', 'paid', 'dispatched', 'delivered', 'cancelled')),
  taxable_value_total numeric(12,2) not null default 0,
  tax_total numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  paid_at timestamptz,
  notes text,
  created_by uuid references public.members(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_supplier_invoice_number unique (supplier_id, invoice_number)
);

create index idx_supplier_invoices_node_id on public.supplier_invoices(node_id);
create index idx_supplier_invoices_supplier_id on public.supplier_invoices(supplier_id);
create index idx_supplier_invoices_status on public.supplier_invoices(status);

create trigger trg_supplier_invoices_brand_node
  before insert or update of node_id on public.supplier_invoices
  for each row execute function public.enforce_brand_node();

create trigger trg_supplier_invoices_updated_at
  before update on public.supplier_invoices
  for each row execute function public.set_updated_at();

-- Forward-only status transitions (mirrors the state machine in the spec)
create or replace function public.enforce_invoice_status_transition()
returns trigger
language plpgsql
as $$
declare
  allowed boolean;
begin
  if TG_OP = 'INSERT' or OLD.status = NEW.status then
    return NEW;
  end if;

  allowed := case OLD.status
    when 'captured'   then NEW.status in ('verified', 'cancelled')
    when 'verified'   then NEW.status in ('paid', 'cancelled')
    when 'paid'       then NEW.status = 'dispatched'
    when 'dispatched' then NEW.status = 'delivered'
    else false
  end;

  if not allowed then
    raise exception 'invalid supplier_invoices status transition: % -> %', OLD.status, NEW.status;
  end if;

  return NEW;
end;
$$;

create trigger trg_supplier_invoices_status_transition
  before update of status on public.supplier_invoices
  for each row execute function public.enforce_invoice_status_transition();

-- ----------------------------------------------------------------
-- supplier_invoice_items
-- ----------------------------------------------------------------
create table public.supplier_invoice_items (
  id uuid primary key default gen_random_uuid(),
  supplier_invoice_id uuid not null references public.supplier_invoices(id) on delete cascade,
  description text not null,
  sku text,
  hsn_code text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  unit_discount numeric(10,2) not null default 0,
  taxable_value numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_supplier_invoice_items_invoice_id on public.supplier_invoice_items(supplier_invoice_id);

create trigger trg_supplier_invoice_items_updated_at
  before update on public.supplier_invoice_items
  for each row execute function public.set_updated_at();

-- Recompute parent invoice totals whenever line items change
create or replace function public.recompute_invoice_totals()
returns trigger
language plpgsql
as $$
declare
  v_invoice_id uuid;
begin
  v_invoice_id := coalesce(NEW.supplier_invoice_id, OLD.supplier_invoice_id);

  update public.supplier_invoices
  set
    taxable_value_total = coalesce((select sum(taxable_value) from public.supplier_invoice_items where supplier_invoice_id = v_invoice_id), 0),
    tax_total = coalesce((select sum(tax_amount) from public.supplier_invoice_items where supplier_invoice_id = v_invoice_id), 0),
    total_amount = coalesce((select sum(line_total) from public.supplier_invoice_items where supplier_invoice_id = v_invoice_id), 0)
  where id = v_invoice_id;

  return null; -- AFTER trigger, return value ignored
end;
$$;

create trigger trg_supplier_invoice_items_recompute_insert
  after insert on public.supplier_invoice_items
  for each row execute function public.recompute_invoice_totals();

create trigger trg_supplier_invoice_items_recompute_update
  after update on public.supplier_invoice_items
  for each row execute function public.recompute_invoice_totals();

create trigger trg_supplier_invoice_items_recompute_delete
  after delete on public.supplier_invoice_items
  for each row execute function public.recompute_invoice_totals();

-- ----------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------
alter table public.suppliers enable row level security;
alter table public.supplier_invoices enable row level security;
alter table public.supplier_invoice_items enable row level security;

-- suppliers: brand-cascade member access (can_manage_node_members already
-- covers both direct brand membership and — though brands have no parent —
-- the same helper used everywhere else in this schema), plus a full-access
-- bypass for platform admins.
create policy "Members can view suppliers on their nodes"
on public.suppliers for select
to authenticated
using (public.can_manage_node_members(node_id));

create policy "Members can add suppliers to their nodes"
on public.suppliers for insert
to authenticated
with check (public.can_manage_node_members(node_id));

create policy "Members can update suppliers on their nodes"
on public.suppliers for update
to authenticated
using (public.can_manage_node_members(node_id))
with check (public.can_manage_node_members(node_id));

create policy "Members can remove suppliers on their nodes"
on public.suppliers for delete
to authenticated
using (public.can_manage_node_members(node_id));

create policy "Platform admins can view all suppliers"
on public.suppliers for select
to authenticated
using (public.is_platform_admin());

create policy "Platform admins can add suppliers to any node"
on public.suppliers for insert
to authenticated
with check (public.is_platform_admin());

create policy "Platform admins can update suppliers on any node"
on public.suppliers for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "Platform admins can remove suppliers on any node"
on public.suppliers for delete
to authenticated
using (public.is_platform_admin());

-- supplier_invoices: same brand-cascade + platform-admin pattern.
create policy "Members can view supplier invoices on their nodes"
on public.supplier_invoices for select
to authenticated
using (public.can_manage_node_members(node_id));

create policy "Members can add supplier invoices to their nodes"
on public.supplier_invoices for insert
to authenticated
with check (public.can_manage_node_members(node_id));

create policy "Members can update supplier invoices on their nodes"
on public.supplier_invoices for update
to authenticated
using (public.can_manage_node_members(node_id))
with check (public.can_manage_node_members(node_id));

create policy "Members can remove supplier invoices on their nodes"
on public.supplier_invoices for delete
to authenticated
using (public.can_manage_node_members(node_id));

create policy "Platform admins can view all supplier invoices"
on public.supplier_invoices for select
to authenticated
using (public.is_platform_admin());

create policy "Platform admins can add supplier invoices to any node"
on public.supplier_invoices for insert
to authenticated
with check (public.is_platform_admin());

create policy "Platform admins can update supplier invoices on any node"
on public.supplier_invoices for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "Platform admins can remove supplier invoices on any node"
on public.supplier_invoices for delete
to authenticated
using (public.is_platform_admin());

-- supplier_invoice_items has no node_id of its own — gate via its parent
-- invoice's node_id instead.
create policy "Members can view supplier invoice items on their nodes"
on public.supplier_invoice_items for select
to authenticated
using (
  exists (
    select 1 from public.supplier_invoices si
    where si.id = supplier_invoice_id
      and public.can_manage_node_members(si.node_id)
  )
);

create policy "Members can add supplier invoice items to their nodes"
on public.supplier_invoice_items for insert
to authenticated
with check (
  exists (
    select 1 from public.supplier_invoices si
    where si.id = supplier_invoice_id
      and public.can_manage_node_members(si.node_id)
  )
);

create policy "Members can update supplier invoice items on their nodes"
on public.supplier_invoice_items for update
to authenticated
using (
  exists (
    select 1 from public.supplier_invoices si
    where si.id = supplier_invoice_id
      and public.can_manage_node_members(si.node_id)
  )
)
with check (
  exists (
    select 1 from public.supplier_invoices si
    where si.id = supplier_invoice_id
      and public.can_manage_node_members(si.node_id)
  )
);

create policy "Members can remove supplier invoice items on their nodes"
on public.supplier_invoice_items for delete
to authenticated
using (
  exists (
    select 1 from public.supplier_invoices si
    where si.id = supplier_invoice_id
      and public.can_manage_node_members(si.node_id)
  )
);

create policy "Platform admins can view all supplier invoice items"
on public.supplier_invoice_items for select
to authenticated
using (public.is_platform_admin());

create policy "Platform admins can add supplier invoice items to any invoice"
on public.supplier_invoice_items for insert
to authenticated
with check (public.is_platform_admin());

create policy "Platform admins can update supplier invoice items on any invoice"
on public.supplier_invoice_items for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "Platform admins can remove supplier invoice items on any invoice"
on public.supplier_invoice_items for delete
to authenticated
using (public.is_platform_admin());
