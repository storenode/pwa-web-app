import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import VoiceReviews from "./pages/voice-reviews";

const voiceNoteRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/node/:nodeId/voice-reviews",
            element: <VoiceReviews />,
          },
        ],
      },
    ],
  },
];

export default voiceNoteRoutes;
