-- ============================================================
-- Supplier invoice receivables check
--
-- Adds a "receiving" stage to supplier_invoices between dispatched and
-- delivered — the window where a reviewer checks physically-arrived goods
-- against the invoiced line items — and adds per-line status/notes to
-- supplier_invoice_items so exceptions (short, missing, damaged, excess)
-- found during that check can be recorded against the specific item.
--
-- Status values move from inline CHECK lists to reference tables, mirroring
-- role_definitions (see 20260725130000_create_role_definitions.sql): a new
-- status is then just a row insert, not a migration, and the UI can fetch
-- display_name/sort_order/description instead of hardcoding labels.
-- ============================================================

-- ----------------------------------------------------------------
-- supplier_invoice_statuses (invoice-level)
-- ----------------------------------------------------------------
create table public.supplier_invoice_statuses (
  code text primary key,
  display_name text not null,
  description text,
  sort_order int not null,
  is_active boolean not null default true
);

alter table public.supplier_invoice_statuses enable row level security;

create policy "Authenticated users can view supplier invoice statuses"
on public.supplier_invoice_statuses for select
to authenticated
using (true);

insert into public.supplier_invoice_statuses (code, display_name, description, sort_order) values
  ('captured', 'Captured', 'Extracted and saved, awaiting review.', 1),
  ('verified', 'Verified', 'Reviewer confirmed the invoice details are correct.', 2),
  ('paid', 'Paid', 'Payment sent to the supplier.', 3),
  ('dispatched', 'Dispatched', 'Supplier has shipped the goods.', 4),
  ('receiving', 'Receiving', 'Goods have arrived; line items are being checked against the invoice.', 5),
  ('delivered', 'Delivered', 'Receivables check complete.', 6),
  ('cancelled', 'Cancelled', 'Invoice voided.', 7);

-- ----------------------------------------------------------------
-- supplier_invoice_item_statuses (line-item level)
-- ----------------------------------------------------------------
create table public.supplier_invoice_item_statuses (
  code text primary key,
  display_name text not null,
  description text,
  sort_order int not null,
  is_active boolean not null default true
);

alter table public.supplier_invoice_item_statuses enable row level security;

create policy "Authenticated users can view supplier invoice item statuses"
on public.supplier_invoice_item_statuses for select
to authenticated
using (true);

insert into public.supplier_invoice_item_statuses (code, display_name, description, sort_order) values
  ('pending', 'Pending', 'Not yet checked against the physical delivery.', 1),
  ('received', 'Received', 'Quantity received matches the invoice.', 2),
  ('short', 'Short', 'Fewer units arrived than invoiced.', 3),
  ('missing', 'Missing', 'None of this line item arrived.', 4),
  ('damaged', 'Damaged', 'Arrived but unusable.', 5),
  ('excess', 'Excess', 'More units arrived than invoiced.', 6);

-- ----------------------------------------------------------------
-- supplier_invoices.status: reference the lookup table instead of a CHECK list
-- ----------------------------------------------------------------
alter table public.supplier_invoices
  drop constraint if exists supplier_invoices_status_check;

alter table public.supplier_invoices
  add constraint fk_supplier_invoices_status
  foreign key (status) references public.supplier_invoice_statuses(code);

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
    when 'dispatched' then NEW.status = 'receiving'
    when 'receiving'  then NEW.status = 'delivered'
    else false
  end;

  if not allowed then
    raise exception 'invalid supplier_invoices status transition: % -> %', OLD.status, NEW.status;
  end if;

  return NEW;
end;
$$;

-- ----------------------------------------------------------------
-- supplier_invoice_items: per-line receivables-check status + notes
-- ----------------------------------------------------------------
alter table public.supplier_invoice_items
  add column status text not null default 'pending'
    references public.supplier_invoice_item_statuses(code),
  add column notes text;

create index idx_supplier_invoice_items_status on public.supplier_invoice_items(status);
