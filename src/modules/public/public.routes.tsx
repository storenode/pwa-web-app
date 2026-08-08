import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import PublicLayout from "./public.layout";
import Home from "./pages/home";
import AuthCallback from "./pages/AuthCallback";
import NoNodeAttached from "./pages/NoNodeAttached";
import PublicStoreView from "@/modules/rewards/pages/PublicStoreView";
import ScenarioDetail from "./pages/ScenarioDetail";
import { scenarios } from "./scenarios/getAllScenarios";
import { scenarioPages } from "./scenarios/scenarioPages";

// One route per scenario slug, each rendering its own dedicated page when
// one exists (see scenarioPages.ts) — otherwise the generic ScenarioDetail
// template. React Router ranks these static-path routes above the `:slug`
// fallback below, so a scenario's own page always wins over the fallback.
const scenarioRoutes: RouteObject[] = scenarios
  .filter((scenario) => scenarioPages[scenario.slug])
  .map((scenario) => {
    const Page = scenarioPages[scenario.slug];
    return {
      path: `/scenarios/${scenario.slug}`,
      element: <Page />,
    };
  });

const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/public/home",
        element: <Home />,
      },
      ...scenarioRoutes,
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
  {
    path: "/store/:storeId",
    element: <PublicStoreView />,
  },
];

export default publicRoutes;
