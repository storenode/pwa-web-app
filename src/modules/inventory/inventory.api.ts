import { supabase } from "@/lib/supabase";
import type { ExtractInvoiceRequest, ExtractedInvoice } from "./inventory.types";

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
