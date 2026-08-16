import { supabase } from "@/lib/supabase";
import type {
  ExtractInvoiceRequest,
  ExtractedInvoice,
  StatusOption,
  SupplierInvoiceListItem,
} from "./inventory.types";

interface StatusRow {
  code: string;
  display_name: string;
  description: string | null;
}

function toStatusOption(row: StatusRow): StatusOption {
  return {
    code: row.code,
    displayName: row.display_name,
    description: row.description,
  };
}

/** Reference list of supplier_invoices.status values, for status badges/dropdowns. */
export async function fetchSupplierInvoiceStatuses(): Promise<StatusOption[]> {
  const { data, error } = await supabase
    .from("supplier_invoice_statuses")
    .select("code, display_name, description")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []).map(toStatusOption);
}

/** Reference list of supplier_invoice_items.status values, for the receivables-check UI. */
export async function fetchSupplierInvoiceItemStatuses(): Promise<
  StatusOption[]
> {
  const { data, error } = await supabase
    .from("supplier_invoice_item_statuses")
    .select("code, display_name, description")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []).map(toStatusOption);
}

/** Purchase invoices list for a node, newest first, optionally filtered to one status. */
export async function fetchSupplierInvoices(
  nodeId: string,
  statusCode?: string | null,
): Promise<SupplierInvoiceListItem[]> {
  let query = supabase
    .from("supplier_invoices")
    .select(
      "id, invoice_number, invoice_date, status, payment_status, total_amount, suppliers(name), supplier_invoice_statuses(display_name)",
    )
    .eq("node_id", nodeId)
    .order("invoice_date", { ascending: false });

  if (statusCode) {
    query = query.eq("status", statusCode);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => {
    const supplier = row.suppliers as unknown as { name: string } | null;
    const statusRef = row.supplier_invoice_statuses as unknown as {
      display_name: string;
    } | null;

    return {
      id: row.id as string,
      invoiceNumber: row.invoice_number as string,
      invoiceDate: row.invoice_date as string,
      supplierName: supplier?.name ?? "—",
      status: row.status as string,
      statusDisplayName: statusRef?.display_name ?? (row.status as string),
      paymentStatus: row.payment_status as string,
      totalAmount: Number(row.total_amount),
    };
  });
}

/**
 * Loads a saved invoice back into the draft-review shape for editing.
 * `source_extraction_json` is kept in lockstep with the reviewer-editable
 * form on every save (see saveSupplierInvoice below), so it's always the
 * authoritative snapshot to hydrate the form from — no need to reconstruct
 * it from the normalized columns.
 */
export async function fetchSupplierInvoiceById(
  invoiceId: string,
): Promise<ExtractedInvoice> {
  const { data, error } = await supabase
    .from("supplier_invoices")
    .select("source_extraction_json")
    .eq("id", invoiceId)
    .single();

  if (error) throw error;
  return data.source_extraction_json as ExtractedInvoice;
}

/** Calls the extract-invoice edge function to extract structured data from an uploaded invoice file. */
export async function extractInvoice(
  request: ExtractInvoiceRequest,
): Promise<ExtractedInvoice> {
  const { data, error } = await supabase.functions.invoke<ExtractedInvoice>(
    "extract-invoice",
    { body: request },
  );

  if (error) throw error;
  return data as ExtractedInvoice;
}

/** Finds a supplier on this node by GSTIN (or name, when GSTIN is missing), auto-creating one if none matches. */
async function findOrCreateSupplier(
  nodeId: string,
  supplier: ExtractedInvoice["supplier"],
): Promise<string> {
  const matchColumn = supplier.gstin ? "gstin" : "name";
  const matchValue = supplier.gstin ?? supplier.name;

  const { data: existing, error: findError } = await supabase
    .from("suppliers")
    .select("id")
    .eq("node_id", nodeId)
    .eq(matchColumn, matchValue)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from("suppliers")
    .insert({
      node_id: nodeId,
      name: supplier.name,
      gstin: supplier.gstin,
      contact_phone: supplier.phone,
      contact_email: supplier.email,
      auto_created: true,
    })
    .select("id")
    .single();

  if (createError) throw createError;
  return created.id as string;
}

/**
 * Persists a reviewed draft invoice as a `captured` (pending) supplier_invoices
 * row plus its line items, auto-creating the supplier if it's not on file yet.
 * Safe to call again after edits — finds the existing row by
 * (supplier_id, invoice_number) and updates it, or inserts a new one, and
 * replaces the line items wholesale either way.
 *
 * created_by is only ever set on the initial insert — re-saving after edits
 * (e.g. recording payment or shipping details later) must not reassign the
 * original creator to whoever happens to save next.
 */
export async function saveSupplierInvoice(
  nodeId: string,
  invoice: ExtractedInvoice,
): Promise<string> {
  const supplierId = await findOrCreateSupplier(nodeId, invoice.supplier);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: existing, error: findInvoiceError } = await supabase
    .from("supplier_invoices")
    .select("id, payment_status, paid_at")
    .eq("supplier_id", supplierId)
    .eq("invoice_number", invoice.invoice.invoice_number)
    .maybeSingle();

  if (findInvoiceError) throw findInvoiceError;

  const paymentStatus = invoice.payment_status ?? "unpaid";
  const paidAt =
    paymentStatus === "paid"
      ? existing?.payment_status === "paid"
        ? existing.paid_at // already paid — keep the original timestamp
        : new Date().toISOString() // just transitioned to paid
      : null;

  const invoicePayload = {
    node_id: nodeId,
    supplier_id: supplierId,
    invoice_number: invoice.invoice.invoice_number,
    invoice_type: invoice.invoice.invoice_type,
    invoice_date: invoice.invoice.invoice_date,
    source_extraction_json: invoice,
    taxable_value_total: invoice.taxable_value_total,
    tax_total: invoice.tax_total,
    total_amount: invoice.total_amount,
    status: invoice.status ?? "captured",
    notes: invoice.notes ?? null,
    payment_status: paymentStatus,
    paid_at: paidAt,
    shipped_by: invoice.invoice.shipped_by ?? null,
    awb_no: invoice.invoice.awb_no ?? null,
  };

  let invoiceId: string;
  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("supplier_invoices")
      .update(invoicePayload)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (updateError) throw updateError;
    invoiceId = updated.id as string;
  } else {
    const { data: created, error: insertError } = await supabase
      .from("supplier_invoices")
      .insert({ ...invoicePayload, created_by: user?.id ?? null })
      .select("id")
      .single();

    if (insertError) throw insertError;
    invoiceId = created.id as string;
  }

  const { error: deleteItemsError } = await supabase
    .from("supplier_invoice_items")
    .delete()
    .eq("supplier_invoice_id", invoiceId);

  if (deleteItemsError) throw deleteItemsError;

  if (invoice.line_items.length > 0) {
    const { error: insertItemsError } = await supabase
      .from("supplier_invoice_items")
      .insert(
        invoice.line_items.map((item) => ({
          supplier_invoice_id: invoiceId,
          description: item.description,
          sku: item.sku,
          hsn_code: item.hsn_code,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit_discount: item.unit_discount,
          taxable_value: item.taxable_value,
          tax_amount: item.tax_amount,
          line_total: item.line_total,
          status: "pending",
          notes: item.notes ?? null,
        })),
      );

    if (insertItemsError) throw insertItemsError;
  }

  return invoiceId;
}
