import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import PublicLayout from "./public.layout";
import Home from "./pages/home";
import AuthCallback from "./pages/AuthCallback";
import NoNodeAttached from "./pages/NoNodeAttached";
import ScenarioDetail from "./pages/ScenarioDetail";

const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/public/home",
        element: <Home />,
      },
      {
        path: "/scenarios/:slug",
        element: <ScenarioDetail />,
      },
      {
        path: "/auth/callback",
        element: <AuthCallback />,
      },
      {
        path: "/",
        element: <Navigate to="/public/home" replace />,
      },
    ],
  },
  {
    path: "/public/no-node",
    element: <NoNodeAttached />,
  },
];

export default publicRoutes;
