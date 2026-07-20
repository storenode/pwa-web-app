import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import PublicLayout from "./public.layout";
import Home from "./pages/home";
import AuthCallback from "./pages/AuthCallback";

const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/public/home",
        element: <Home />,
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
];

export default publicRoutes;
