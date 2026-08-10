import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "@/shared/components/ProtectedRoute";
import DashboardLayout from "@/shared/layouts/DashboardLayout";
import RequireCapability from "@/shared/components/RequireCapability";
import { CAPABILITIES } from "@/shared/capabilities";
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
            element: (
              <RequireCapability
                capability={CAPABILITIES["voice_reviews:view"]}
              >
                <VoiceReviews />
              </RequireCapability>
            ),
          },
        ],
      },
    ],
  },
];

export default voiceNoteRoutes;
