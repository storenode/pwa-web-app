import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useNodesStore } from "../store/nodesStore";

export default function ProtectedRoute() {
  const location = useLocation();
  const { session, member, isLoading } = useAuthStore();
  const {
    memberships,
    isLoading: nodesLoading,
    activeNodeId,
  } = useNodesStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !member) {
    return <Navigate to="/public/home" replace />;
  }

  if (nodesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (memberships.length === 0) {
    return <Navigate to="/public/no-node" replace />;
  }

  if (
    memberships.length > 1 &&
    !activeNodeId &&
    location.pathname !== "/launch"
  ) {
    return <Navigate to="/launch" replace />;
  }

  return <Outlet />;
}
