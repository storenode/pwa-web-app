-- ============================================================
-- supplier_invoices: shipped_by / awb_no columns
--
-- Both already exist inside source_extraction_json (as
-- invoice.shipped_by / invoice.awb_no from the AI extraction) but weren't
-- queryable/editable columns. Goods are often bought and paid for at one
-- store/location and then transported to another office — the reviewer
-- needs to record who's shipping it and the tracking/AWB number once that's
-- arranged, independent of re-running extraction.
-- ============================================================

alter table public.supplier_invoices
  add column shipped_by text,
  add column awb_no text;
