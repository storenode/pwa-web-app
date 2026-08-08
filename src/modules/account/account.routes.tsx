import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../shared/components/ProtectedRoute";
import DashboardLayout from "../../shared/layouts/DashboardLayout";
import BrowseAllNodes from "./pages/nodes";
import AddEditNodes from "./pages/add-edit-nodes";
import AddEditStores from "./pages/add-edit-stores";
import NodeRewards from "@/modules/rewards/pages/node-rewards";

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
          {
            path: "/node/:nodeId/store/:storeId",
            element: <AddEditStores />,
          },
          {
            path: "/node/:nodeId/rewards",
            element: <NodeRewards />,
          },
        ],
      },
    ],
  },
];

export default accountRoutes;
