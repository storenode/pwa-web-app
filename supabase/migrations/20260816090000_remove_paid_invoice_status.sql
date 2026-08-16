-- ============================================================
-- Remove 'paid' from supplier_invoice_statuses
--
-- 'paid' was a stage in the supplier_invoices.status goods-pipeline
-- (captured→verified→paid→dispatched→receiving→delivered), but
-- supplier_invoices already has a dedicated payment_status ('unpaid'/'paid')
-- + paid_at pair (20260811090000_supplier_invoice_receiving.sql) that the
-- app now actively uses for payment tracking. Keeping both is redundant and
-- wrong in practice — payment and the goods pipeline are orthogonal (some
-- invoices are paid up front via proforma before anything ships, others only
-- after delivery). Nothing in the app ever set status='paid' (invoice-level
-- status is read-only in the UI), so this only touches reference data.
-- ============================================================

-- Backfill: any invoice currently parked at status='paid' rolls back one
-- pipeline stage to 'verified' (doesn't assume shipping already happened),
-- and payment_status/paid_at is backfilled so the payment fact isn't lost.
update public.supplier_invoices
set
  status = 'verified',
  payment_status = 'paid',
  paid_at = coalesce(paid_at, now())
where status = 'paid';

-- New chain: captured→verified→dispatched→receiving→delivered, with
-- cancelled reachable from captured or verified (unchanged otherwise).
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
    when 'verified'   then NEW.status in ('dispatched', 'cancelled')
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

-- Safe now that the backfill above guarantees no supplier_invoices row
-- still references it (the fk_supplier_invoices_status FK would otherwise
-- block this delete).
delete from public.supplier_invoice_statuses where code = 'paid';

update public.supplier_invoice_statuses set sort_order = 2 where code = 'verified';
update public.supplier_invoice_statuses set sort_order = 3 where code = 'dispatched';
update public.supplier_invoice_statuses set sort_order = 4 where code = 'receiving';
update public.supplier_invoice_statuses set sort_order = 5 where code = 'delivered';
update public.supplier_invoice_statuses set sort_order = 6 where code = 'cancelled';
