import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../shared/components/ProtectedRoute";
import DashboardLayout from "../../shared/layouts/DashboardLayout";
import RequireCapability from "../../shared/components/RequireCapability";
import { CAPABILITIES } from "../../shared/capabilities";
import Suppliers from "./pages/Suppliers";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import AddEditInvoices from "./pages/AddEditInvoices";

const inventoryRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/inventory/suppliers",
            element: (
              <RequireCapability capability={CAPABILITIES["suppliers:manage"]}>
                <Suppliers />
              </RequireCapability>
            ),
          },
          {
            path: "/inventory/invoices",
            element: (
              <RequireCapability
                capability={CAPABILITIES["supplier_invoices:manage"]}
              >
                <PurchaseInvoices />
              </RequireCapability>
            ),
          },
          {
            path: "/inventory/invoices/:invoiceId",
            element: (
              <RequireCapability
                capability={CAPABILITIES["supplier_invoices:manage"]}
              >
                <AddEditInvoices />
              </RequireCapability>
            ),
          },
        ],
      },
    ],
  },
];

export default inventoryRoutes;
