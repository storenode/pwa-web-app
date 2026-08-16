import { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { fetchSupplierInvoiceStatuses } from "@/modules/inventory/inventory.api";
import type {
  ExtractedInvoice,
  StatusOption,
} from "@/modules/inventory/inventory.types";

export interface DraftInvoicesFormValues {
  invoice: ExtractedInvoice | null;
}

const inputClass =
  "w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";

/** Loads a status reference list once on mount — the lists rarely change and are shared across every invoice/item row. */
function useStatusOptions(
  fetcher: () => Promise<StatusOption[]>,
): StatusOption[] {
  const [options, setOptions] = useState<StatusOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetcher().then((result) => {
      if (!cancelled) setOptions(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return options;
}

interface DraftInvoicesFormProps {
  /** Locks every editable field — invoices past the 'captured' stage are view-only here. */
  readOnly?: boolean;
}

/**
 * Review/edit form for the invoice just pulled off extract-invoice, before
 * it's approved into a supplier_invoices row — approve is intentionally a
 * no-op button for now.
 */
export default function DraftInvoicesForm({
  readOnly = false,
}: DraftInvoicesFormProps) {
  const { control, register } = useFormContext<DraftInvoicesFormValues>();
  const invoice = useWatch({ control, name: "invoice" });
  const invoiceStatusOptions = useStatusOptions(fetchSupplierInvoiceStatuses);
  const invoiceStatusLabel =
    invoiceStatusOptions.find((option) => option.code === invoice?.status)
      ?.displayName ?? invoice?.status;

  if (!invoice) return null;

  return (
    <div className="rounded w-full px-1 md:px-4">
      <div className="w-full py-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldInput
          label="Supplier"
          className="w-full"
          disabled={readOnly}
          {...register("invoice.supplier.name")}
        />
        <FieldInput
          label="Invoice #"
          className="w-full"
          disabled={readOnly}
          {...register("invoice.invoice.invoice_number")}
        />
      </div>

      <div className="w-full py-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldInput
          label="Invoice date"
          type="date"
          disabled={readOnly}
          {...register("invoice.invoice.invoice_date")}
        />
        <div className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          Status
          <span className={`${inputClass} bg-gray-50 text-gray-700`}>
            {invoiceStatusLabel ?? "—"}
          </span>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium text-gray-600 w-full mb-2">
        Notes
        <textarea
          rows={2}
          disabled={readOnly}
          {...register("invoice.notes")}
          className={inputClass}
        />
      </label>

      <div className="w-full py-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          Payment status
          <select
            disabled={readOnly}
            {...register("invoice.payment_status")}
            className={inputClass}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </label>
        <FieldInput
          label="Shipped by"
          placeholder="Transporter / courier"
          disabled={readOnly}
          {...register("invoice.invoice.shipped_by")}
        />
        <FieldInput
          label="AWB / tracking no."
          placeholder="Once goods are dispatched to your office"
          disabled={readOnly}
          {...register("invoice.invoice.awb_no")}
        />
      </div>

      <div className="w-full mt-4">
        <LineItemsTable readOnly={readOnly} />
      </div>
    </div>
  );
}

function FieldInput({
  label,
  className,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label
      className={`flex flex-col gap-1 text-xs font-medium text-gray-600 ${className ?? ""}`}
    >
      {label}
      <input {...inputProps} className={inputClass} />
    </label>
  );
}

function LineItemsTable({ readOnly = false }: { readOnly?: boolean }) {
  const { control, register } = useFormContext<DraftInvoicesFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoice.line_items",
  });

  function handleAddItem() {
    append({
      s_no: fields.length + 1,
      description: "",
      sku: null,
      hsn_code: null,
      quantity: 0,
      unit_price: 0,
      unit_discount: 0,
      taxable_value: 0,
      cgst_value: 0,
      cgst_percent: 0,
      sgst_value: 0,
      sgst_percent: 0,
      tax_amount: 0,
      line_total: 0,
      notes: null,
    });
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {!readOnly && (
        <div className="flex flex-row justify-end">
          <button
            type="button"
            onClick={handleAddItem}
            className="self-start rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-50"
          >
            + Add item
          </button>
        </div>
      )}
      <div className="w-full max-h-[500px] md:max-h-full overflow-auto touch-pan-x touch-pan-y">
        <table className="min-w-[820px] min-h-[400px] border-none text-sm">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-600">
              <th className="p-1">Description</th>
              <th className="p-1">SKU</th>
              <th className="p-1">HSN</th>
              <th className="p-1">Qty</th>
              <th className="p-1">Unit price</th>
              <th className="p-1">Tax amount</th>
              <th className="p-1">Line total</th>
              <th className="p-1">Notes</th>
              <th className="p-1" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, lineIndex) => (
              <tr key={field.id}>
                <td className="p-1">
                  <input
                    disabled={readOnly}
                    {...register(`invoice.line_items.${lineIndex}.description`)}
                    className={inputClass}
                  />
                </td>
                <td className="p-1">
                  <input
                    disabled={readOnly}
                    {...register(`invoice.line_items.${lineIndex}.sku`)}
                    className={inputClass}
                  />
                </td>
                <td className="p-1">
                  <input
                    disabled={readOnly}
                    {...register(`invoice.line_items.${lineIndex}.hsn_code`)}
                    className={inputClass}
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    disabled={readOnly}
                    {...register(`invoice.line_items.${lineIndex}.quantity`, {
                      valueAsNumber: true,
                    })}
                    className={inputClass}
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="0.01"
                    disabled={readOnly}
                    {...register(`invoice.line_items.${lineIndex}.unit_price`, {
                      valueAsNumber: true,
                    })}
                    className={inputClass}
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="0.01"
                    disabled={readOnly}
                    {...register(`invoice.line_items.${lineIndex}.tax_amount`, {
                      valueAsNumber: true,
                    })}
                    className={inputClass}
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    step="0.01"
                    disabled={readOnly}
                    {...register(`invoice.line_items.${lineIndex}.line_total`, {
                      valueAsNumber: true,
                    })}
                    className={inputClass}
                  />
                </td>
                <td className="p-1">
                  <ItemNotesPopover lineIndex={lineIndex} readOnly={readOnly} />
                </td>
                <td className="p-1">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => remove(lineIndex)}
                      className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ItemNotesPopover({
  lineIndex,
  readOnly = false,
}: {
  lineIndex: number;
  readOnly?: boolean;
}) {
  const { control, register } = useFormContext<DraftInvoicesFormValues>();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const item = useWatch({
    control,
    name: `invoice.line_items.${lineIndex}`,
  });

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="whitespace-nowrap rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
      >
        {item?.notes ? "Notes ●" : "+ Notes"}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-72 rounded border border-gray-300 bg-white p-3 text-left shadow-lg">
          <dl className="mb-3 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs text-gray-600">
            <dt className="font-medium text-gray-800">Description</dt>
            <dd>{item?.description || "—"}</dd>
            <dt className="font-medium text-gray-800">SKU</dt>
            <dd>{item?.sku || "—"}</dd>
            <dt className="font-medium text-gray-800">HSN</dt>
            <dd>{item?.hsn_code || "—"}</dd>
            <dt className="font-medium text-gray-800">Qty</dt>
            <dd>{item?.quantity ?? "—"}</dd>
            <dt className="font-medium text-gray-800">Unit price</dt>
            <dd>{item?.unit_price ?? "—"}</dd>
            <dt className="font-medium text-gray-800">Line total</dt>
            <dd>{item?.line_total ?? "—"}</dd>
          </dl>

          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Notes
            <textarea
              rows={3}
              autoFocus={!readOnly}
              disabled={readOnly}
              {...register(`invoice.line_items.${lineIndex}.notes`)}
              className={inputClass}
            />
          </label>
        </div>
      )}
    </div>
  );
}
