import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../../shared/components/ProtectedRoute";
import DashboardLayout from "../../shared/layouts/DashboardLayout";
import RequireCapability from "../../shared/components/RequireCapability";
import { CAPABILITIES } from "../../shared/capabilities";
import BrowseAllNodes from "./pages/nodes";
import AddEditNodes from "./pages/add-edit-nodes";
import AddEditStores from "./pages/add-edit-stores";
import SelectStore from "./pages/select-store";
import NodeRewards from "@/modules/rewards/pages/node-rewards";

const accountRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/launch",
        element: <SelectStore />,
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/node/",
            element: (
              <RequireCapability capability={CAPABILITIES["nodes:browse_all"]}>
                <BrowseAllNodes />
              </RequireCapability>
            ),
          },
          {
            path: "/node/:nodeId",
            element: (
              <RequireCapability capability={CAPABILITIES["nodes:manage"]}>
                <AddEditNodes />
              </RequireCapability>
            ),
          },
          {
            path: "/node/:nodeId/store/:storeId",
            element: (
              <RequireCapability capability={CAPABILITIES["store:manage"]}>
                <AddEditStores />
              </RequireCapability>
            ),
          },
          {
            path: "/node/:nodeId/rewards",
            element: (
              <RequireCapability capability={CAPABILITIES["rewards:view"]}>
                <NodeRewards />
              </RequireCapability>
            ),
          },
        ],
      },
    ],
  },
];

export default accountRoutes;
