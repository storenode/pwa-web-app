import { createBrowserRouter } from "react-router-dom";
import publicRoutes from "../modules/public/public.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import accountRoutes from "../modules/account/account.routes";
import voiceNoteRoutes from "../modules/voiceNote/voicenotes.routes";
import inventoryRoutes from "../modules/inventory/inventory.routes";

export const router = createBrowserRouter([
  ...publicRoutes,
  ...dashboardRoutes,
  ...accountRoutes,
  ...voiceNoteRoutes,
  ...inventoryRoutes,
]);
