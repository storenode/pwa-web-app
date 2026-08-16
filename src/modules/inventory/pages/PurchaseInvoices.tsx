import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ComponentCard from "@/shared/fields/ComponentCard";
import {
  fetchSupplierInvoiceStatuses,
  fetchSupplierInvoices,
} from "@/modules/inventory/inventory.api";
import { useNodesStore } from "@/shared/store/nodesStore";

export default function PurchaseInvoices() {
  const activeNodeId = useNodesStore((state) => state.activeNodeId);
  const [statusFilter, setStatusFilter] = useState("");

  const { data: statusOptions = [] } = useQuery({
    queryKey: ["supplier-invoice-statuses"],
    queryFn: fetchSupplierInvoiceStatuses,
  });

  const {
    data: invoices = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["supplier-invoices", activeNodeId, statusFilter],
    queryFn: () =>
      fetchSupplierInvoices(activeNodeId as string, statusFilter || null),
    enabled: !!activeNodeId,
  });

  return (
    <div className="p-1 md:p-6 flex flex-col gap-4">
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
        <div className="mb-4 w-full flex flex-row items-center justify-end gap-2">
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.displayName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-600 border-b border-base-300">
                <th className="p-2">Invoice #</th>
                <th className="p-2">Supplier</th>
                <th className="p-2">Date</th>
                <th className="p-2">Status</th>
                <th className="p-2">Payment</th>
                <th className="p-2">Total</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-red-600">
                    Couldn't load invoices.
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-gray-200">
                    <td className="p-2">
                      <Link
                        to={`/inventory/invoices/${invoice.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="p-2">{invoice.supplierName}</td>
                    <td className="p-2">{invoice.invoiceDate}</td>
                    <td className="p-2">{invoice.statusDisplayName}</td>
                    <td className="p-2 capitalize">{invoice.paymentStatus}</td>
                    <td className="p-2">{invoice.totalAmount.toFixed(2)}</td>
                    <td className="p-2">
                      <Link
                        to={`/inventory/invoices/${invoice.id}`}
                        className="rounded border border-gray-300 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </div>
  );
}
