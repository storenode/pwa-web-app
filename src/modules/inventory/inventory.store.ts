import { create } from "zustand";
import type { ExtractedInvoice } from "./inventory.types";

interface InventoryState {
  isExtracting: boolean;
  /** Raw extraction response for the invoice currently being reviewed before it's turned into a supplier_invoices row. */
  extractedInvoice: ExtractedInvoice | null;
  setExtracting: (isExtracting: boolean) => void;
  setExtractedInvoice: (invoice: ExtractedInvoice) => void;
  /** Replaces the draft in place, e.g. after the reviewer edits fields before approving. */
  updateExtractedInvoice: (invoice: ExtractedInvoice) => void;
  /** Drops the draft the reviewer decided not to keep. */
  clearExtractedInvoice: () => void;
  reset: () => void;
}

const initialState = {
  isExtracting: false,
  extractedInvoice: null as ExtractedInvoice | null,
};

export const useInventoryStore = create<InventoryState>()((set) => ({
  ...initialState,
  setExtracting: (isExtracting) => set({ isExtracting }),
  setExtractedInvoice: (invoice) => set({ extractedInvoice: invoice }),
  updateExtractedInvoice: (invoice) => set({ extractedInvoice: invoice }),
  clearExtractedInvoice: () => set({ extractedInvoice: null }),
  reset: () => set(initialState),
}));
