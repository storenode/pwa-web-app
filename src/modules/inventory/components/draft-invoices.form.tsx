import {
  useFieldArray,
  useForm,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import { useInventoryStore } from "@/modules/inventory/inventory.store";
import type { ExtractedInvoice } from "@/modules/inventory/inventory.types";

interface DraftInvoicesFormValues {
  invoices: ExtractedInvoice[];
}

const inputClass =
  "w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";

/**
 * Review/edit table for invoices just pulled off extract-invoice, before
 * they're approved into supplier_invoices rows. Reads/writes
 * useInventoryStore's extractedInvoices — approve is intentionally a no-op
 * button for now.
 */
export default function DraftInvoicesForm() {
  const extractedInvoices = useInventoryStore(
    (state) => state.extractedInvoices,
  );
  const updateExtractedInvoice = useInventoryStore(
    (state) => state.updateExtractedInvoice,
  );
  const removeExtractedInvoice = useInventoryStore(
    (state) => state.removeExtractedInvoice,
  );

  const { control, register, getValues } = useForm<DraftInvoicesFormValues>({
    values: { invoices: extractedInvoices },
  });

  const { fields, remove } = useFieldArray({ control, name: "invoices" });

  if (fields.length === 0) return null;

  function handleSave(index: number) {
    updateExtractedInvoice(index, getValues(`invoices.${index}`));
  }

  function handleDelete(index: number) {
    remove(index);
    removeExtractedInvoice(index);
  }

  return (
    <div className="flex flex-col gap-6">
      {fields.map((field, invoiceIndex) => (
        <div key={field.id} className="rounded border border-gray-300 p-4">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <FieldInput
                label="Supplier"
                {...register(`invoices.${invoiceIndex}.supplier.name`)}
              />
              <FieldInput
                label="Invoice #"
                {...register(
                  `invoices.${invoiceIndex}.invoice.invoice_number`,
                )}
              />
              <FieldInput
                label="Invoice date"
                type="date"
                {...register(`invoices.${invoiceIndex}.invoice.invoice_date`)}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSave(invoiceIndex)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Save
              </button>
              <button
                type="button"
                className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleDelete(invoiceIndex)}
                className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          <LineItemsTable
            control={control}
            register={register}
            invoiceIndex={invoiceIndex}
          />
        </div>
      ))}
    </div>
  );
}

function FieldInput({
  label,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
      {label}
      <input {...inputProps} className={inputClass} />
    </label>
  );
}

function LineItemsTable({
  control,
  register,
  invoiceIndex,
}: {
  control: Control<DraftInvoicesFormValues>;
  register: UseFormRegister<DraftInvoicesFormValues>;
  invoiceIndex: number;
}) {
  const { fields, remove } = useFieldArray({
    control,
    name: `invoices.${invoiceIndex}.line_items`,
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-600">
            <th className="p-1">Description</th>
            <th className="p-1">SKU</th>
            <th className="p-1">HSN</th>
            <th className="p-1">Qty</th>
            <th className="p-1">Unit price</th>
            <th className="p-1">Tax amount</th>
            <th className="p-1">Line total</th>
            <th className="p-1" />
          </tr>
        </thead>
        <tbody>
          {fields.map((field, lineIndex) => (
            <tr key={field.id}>
              <td className="p-1">
                <input
                  {...register(
                    `invoices.${invoiceIndex}.line_items.${lineIndex}.description`,
                  )}
                  className={inputClass}
                />
              </td>
              <td className="p-1">
                <input
                  {...register(
                    `invoices.${invoiceIndex}.line_items.${lineIndex}.sku`,
                  )}
                  className={inputClass}
                />
              </td>
              <td className="p-1">
                <input
                  {...register(
                    `invoices.${invoiceIndex}.line_items.${lineIndex}.hsn_code`,
                  )}
                  className={inputClass}
                />
              </td>
              <td className="p-1">
                <input
                  type="number"
                  {...register(
                    `invoices.${invoiceIndex}.line_items.${lineIndex}.quantity`,
                    { valueAsNumber: true },
                  )}
                  className={inputClass}
                />
              </td>
              <td className="p-1">
                <input
                  type="number"
                  step="0.01"
                  {...register(
                    `invoices.${invoiceIndex}.line_items.${lineIndex}.unit_price`,
                    { valueAsNumber: true },
                  )}
                  className={inputClass}
                />
              </td>
              <td className="p-1">
                <input
                  type="number"
                  step="0.01"
                  {...register(
                    `invoices.${invoiceIndex}.line_items.${lineIndex}.tax_amount`,
                    { valueAsNumber: true },
                  )}
                  className={inputClass}
                />
              </td>
              <td className="p-1">
                <input
                  type="number"
                  step="0.01"
                  {...register(
                    `invoices.${invoiceIndex}.line_items.${lineIndex}.line_total`,
                    { valueAsNumber: true },
                  )}
                  className={inputClass}
                />
              </td>
              <td className="p-1">
                <button
                  type="button"
                  onClick={() => remove(lineIndex)}
                  className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
