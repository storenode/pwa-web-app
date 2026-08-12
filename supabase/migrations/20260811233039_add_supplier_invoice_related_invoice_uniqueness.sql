-- ============================================================
-- supplier_invoices.related_invoice_id — enforce uniqueness
--
-- A given invoice should be referenced by at most one other invoice
-- (e.g. a tax invoice pointing back to its proforma). Use a partial
-- unique index rather than a plain unique constraint on the column
-- so the intent — "unique whenever present" — is explicit rather
-- than relying on Postgres's NULL-distinctness behavior.
-- ============================================================

create unique index uq_supplier_invoices_related_invoice_id
  on public.supplier_invoices (related_invoice_id)
  where related_invoice_id is not null;
