import { useEffect, useState } from "react";
import ComponentCard from "@/shared/fields/ComponentCard";
import FileUploadLabel from "@/shared/fields/FileUploadLabel";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  extractInvoice,
  fetchSupplierInvoiceById,
  saveSupplierInvoice,
} from "@/modules/inventory/inventory.api";
import { useInventoryStore } from "@/modules/inventory/inventory.store";
import { useNodesStore } from "@/shared/store/nodesStore";
import DraftInvoicesForm from "@/modules/inventory/components/draft-invoices.form";
import type { ExtractedInvoice } from "@/modules/inventory/inventory.types";

interface AddEditInvoicesForm {
  files: FileList | null;
  invoice: ExtractedInvoice | null;
}

export default function AddEditInvoices() {
  const navigate = useNavigate();
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const isEditing = !!invoiceId && invoiceId !== "new";
  const methods = useForm<AddEditInvoicesForm>({
    defaultValues: { files: null, invoice: null },
  });
  const { control, getValues, setValue } = methods;
  const [isSaving, setIsSaving] = useState(false);
  const activeNodeId = useNodesStore((state) => state.activeNodeId);
  const isExtracting = useInventoryStore((state) => state.isExtracting);
  const setExtracting = useInventoryStore((state) => state.setExtracting);
  const setExtractedInvoice = useInventoryStore(
    (state) => state.setExtractedInvoice,
  );
  const clearExtractedInvoice = useInventoryStore(
    (state) => state.clearExtractedInvoice,
  );

  const invoice = useWatch({ control, name: "invoice" });
  const isReadOnly = !!invoice && invoice.status !== "captured";

  const { data: existingInvoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ["supplier-invoice", invoiceId],
    queryFn: () => fetchSupplierInvoiceById(invoiceId as string),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingInvoice) {
      setValue("invoice", existingInvoice);
      setExtractedInvoice(existingInvoice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingInvoice]);

  async function handleFilesSelected(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      const result = await extractInvoice({ file_path: file.name });
      const draft: ExtractedInvoice = {
        ...result,
        status: "captured",
        notes: null,
        payment_status: "unpaid",
        line_items: result.line_items.map((item) => ({
          ...item,
          status: "pending",
          notes: null,
        })),
      };
      setValue("invoice", draft);
      setExtractedInvoice(draft);
    } finally {
      setExtracting(false);
    }
  }

  async function handleSave() {
    const current = getValues("invoice");
    if (!current || !activeNodeId) return;

    setIsSaving(true);
    try {
      await saveSupplierInvoice(
        activeNodeId,
        current,
        isEditing ? invoiceId : undefined,
      );
      clearExtractedInvoice();
      setValue("invoice", null);
      navigate("/inventory/invoices");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save invoice.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete() {
    setValue("invoice", null);
    clearExtractedInvoice();
  }

  return (
    <FormProvider {...methods}>
      <div className="p-1 md:p-6 flex flex-col gap-4">
        <Link
          to="/inventory/invoices"
          className="link link-hover text-sm opacity-70"
        >
          ← Back to all invoices
        </Link>

        <ComponentCard
          title={isEditing ? "Edit Invoice" : "Add Invoice"}
          actions={
            !invoice && isEditing ? null : !invoice ? (
              <Controller
                control={control}
                name="files"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <FileUploadLabel
                    id="File"
                    label="Upload invoice"
                    loadingLabel="AddEditInvoices: extracting…"
                    isLoading={isExtracting}
                    name={name}
                    ref={ref}
                    onBlur={onBlur}
                    onChange={(e) => {
                      onChange(e.target.files);
                      void handleFilesSelected(e.target.files);
                    }}
                  />
                )}
              />
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded cursor-pointer border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="rounded cursor-pointer border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            )
          }
        >
          {invoice ? (
            <DraftInvoicesForm readOnly={isReadOnly} canEditStatus={isEditing} />
          ) : isLoadingInvoice ? (
            <div className="flex justify-center w-full text-sm text-gray-600">
              Loading invoice…
            </div>
          ) : (
            <div className="flex justify-center w-full text-sm text-gray-600">
              Please upload an invoice to get started.
            </div>
          )}
        </ComponentCard>
      </div>
    </FormProvider>
  );
}
