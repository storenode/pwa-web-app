export interface ExtractInvoiceRequest {
  file_path: string;
}

export interface ExtractedInvoiceSupplier {
  name: string;
  address: string | null;
  state_code: string | null;
  phone: string | null;
  gstin: string | null;
  website: string | null;
  email: string | null;
}

export interface ExtractedInvoiceAddress {
  name: string;
  address: string | null;
  state_code: string | null;
  phone: string | null;
}

export interface ExtractedInvoiceDetails {
  invoice_number: string;
  invoice_type: "proforma" | "tax_invoice" | "other";
  invoice_date: string;
  order_number: string | null;
  order_date: string | null;
  channel: string | null;
  shipped_by: string | null;
  awb_no: string | null;
  payment_method: string | null;
  payment_status: string | null;
  remark: string | null;
  reverse_charge_applicable: boolean;
}

export interface ExtractedInvoiceLineItem {
  s_no: number;
  description: string;
  sku: string | null;
  hsn_code: string | null;
  quantity: number;
  unit_price: number;
  unit_discount: number;
  taxable_value: number;
  cgst_value: number;
  cgst_percent: number;
  sgst_value: number;
  sgst_percent: number;
  tax_amount: number;
  line_total: number;
  /** Receivables-check status (supplier_invoice_item_statuses.code) — not part of the AI extraction, defaulted to 'pending' after extraction. */
  status?: string;
  /** Reviewer comment for this line item, e.g. noting a shortfall or damage. */
  notes?: string | null;
}

export interface ExtractedInvoice {
  document_type: string;
  supplier: ExtractedInvoiceSupplier;
  shipping_address: ExtractedInvoiceAddress;
  invoice: ExtractedInvoiceDetails;
  line_items: ExtractedInvoiceLineItem[];
  taxable_value_total: number;
  tax_total: number;
  total_amount: number;
  authorized_signature_present: boolean;
  /** supplier_invoices.status (supplier_invoice_statuses.code) — not part of the AI extraction, defaulted to 'captured' after extraction. */
  status?: string;
  /** Reviewer comment for the invoice as a whole. */
  notes?: string | null;
  /** supplier_invoices.payment_status — set by the reviewer once payment is actually made, defaulted to 'unpaid'. */
  payment_status?: "unpaid" | "paid";
  /** supplier_invoices.paid_at — set automatically when payment_status flips to 'paid'. */
  paid_at?: string | null;
}

/** A row from supplier_invoice_statuses or supplier_invoice_item_statuses — reference data for status dropdowns/badges. */
export interface StatusOption {
  code: string;
  displayName: string;
  description: string | null;
}

/** A row in the purchase invoices list — summary fields only, for the table view. */
export interface SupplierInvoiceListItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplierName: string;
  status: string;
  statusDisplayName: string;
  paymentStatus: string;
  totalAmount: number;
}
