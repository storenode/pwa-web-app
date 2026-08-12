import ComponentCard from "@/shared/fields/ComponentCard";
import FileUploadLabel from "@/shared/fields/FileUploadLabel";
import { Link } from "react-router-dom";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { extractInvoice } from "@/modules/inventory/inventory.api";
import { useInventoryStore } from "@/modules/inventory/inventory.store";
import DraftInvoicesForm from "@/modules/inventory/components/draft-invoices.form";

interface AddEditInvoicesForm {
  files: FileList | null;
}

export default function AddEditInvoices() {
  const methods = useForm<AddEditInvoicesForm>({
    defaultValues: { files: null },
  });
  const { control } = methods;
  const isExtracting = useInventoryStore((state) => state.isExtracting);
  const setExtracting = useInventoryStore((state) => state.setExtracting);
  const addExtractedInvoice = useInventoryStore(
    (state) => state.addExtractedInvoice,
  );

  async function handleFilesSelected(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setExtracting(true);
    try {
      const result = await extractInvoice({ file_path: file.name });
      addExtractedInvoice(result);
    } finally {
      setExtracting(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="p-6 flex flex-col gap-4">
        <Link
          to="/inventory/invoices"
          className="link link-hover text-sm opacity-70"
        >
          ← Back to all invoices
        </Link>

        <ComponentCard
          title={"Add Invoices"}
          actions={
            <div className="flex flex-row gap-2">
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
            </div>
          }
        >
          <DraftInvoicesForm />
        </ComponentCard>
      </div>
    </FormProvider>
  );
}
