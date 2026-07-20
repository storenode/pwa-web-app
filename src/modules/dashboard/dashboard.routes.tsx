import type { RouteObject } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

const dashboardRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
];

export default dashboardRoutes;
