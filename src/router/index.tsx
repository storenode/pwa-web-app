import { createBrowserRouter } from "react-router-dom";
import publicRoutes from "../modules/public/public.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import accountRoutes from "../modules/account/account.routes";

export const router = createBrowserRouter([
  ...publicRoutes,
  ...dashboardRoutes,
  ...accountRoutes,
]);
