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
}
