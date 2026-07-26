import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../shared/components/ProtectedRoute";
import DashboardLayout from "../../shared/layouts/DashboardLayout";
import BrowseAllNodes from "./pages/nodes";
import AddEditNodes from "./pages/add-edit-nodes";

const accountRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/node/",
            element: <BrowseAllNodes />,
          },
          {
            path: "/node/:nodeId",
            element: <AddEditNodes />,
          },
        ],
      },
    ],
  },
];

export default accountRoutes;
