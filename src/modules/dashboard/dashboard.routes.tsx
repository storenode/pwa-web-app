import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../shared/components/ProtectedRoute";
import DashboardLayout from "../../shared/layouts/DashboardLayout";
import RequireCapability from "../../shared/components/RequireCapability";
import { CAPABILITIES } from "../../shared/capabilities";
import Dashboard from "./pages/Dashboard";

const dashboardRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: (
              <RequireCapability capability={CAPABILITIES["dashboard:view"]}>
                <Dashboard />
              </RequireCapability>
            ),
          },
        ],
      },
    ],
  },
];

export default dashboardRoutes;
