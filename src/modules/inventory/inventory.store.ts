import { create } from "zustand";
import type { ExtractedInvoice } from "./inventory.types";

interface InventoryState {
  isExtracting: boolean;
  /** Raw extraction responses, most recent first — kept around for review before they're turned into supplier_invoices rows. */
  extractedInvoices: ExtractedInvoice[];
  setExtracting: (isExtracting: boolean) => void;
  addExtractedInvoice: (invoice: ExtractedInvoice) => void;
  /** Replaces a draft in place, e.g. after the reviewer edits fields before approving. */
  updateExtractedInvoice: (index: number, invoice: ExtractedInvoice) => void;
  /** Drops a draft the reviewer decided not to keep. */
  removeExtractedInvoice: (index: number) => void;
  reset: () => void;
}

const initialState = {
  isExtracting: false,
  extractedInvoices: [] as ExtractedInvoice[],
};

export const useInventoryStore = create<InventoryState>()((set) => ({
  ...initialState,
  setExtracting: (isExtracting) => set({ isExtracting }),
  addExtractedInvoice: (invoice) =>
    set((state) => ({
      extractedInvoices: [invoice, ...state.extractedInvoices],
    })),
  updateExtractedInvoice: (index, invoice) =>
    set((state) => ({
      extractedInvoices: state.extractedInvoices.map((existing, i) =>
        i === index ? invoice : existing,
      ),
    })),
  removeExtractedInvoice: (index) =>
    set((state) => ({
      extractedInvoices: state.extractedInvoices.filter((_, i) => i !== index),
    })),
  reset: () => set(initialState),
}));
