import ComponentCard from "@/shared/fields/ComponentCard";
import { Link } from "react-router-dom";

export default function PurchaseInvoices() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <ComponentCard
        title={"Purchase Invoices"}
        actions={
          <div className="flex flex-row gap-2">
            <Link
              to="/inventory/invoices/new"
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Invoices
            </Link>
          </div>
        }
      >
        <div>Invoice list goes here.</div>
      </ComponentCard>
    </div>
  );
}
