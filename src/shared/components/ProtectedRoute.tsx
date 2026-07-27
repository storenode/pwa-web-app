import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useNodesStore } from "../store/nodesStore";

export default function ProtectedRoute() {
  const { session, member, isLoading } = useAuthStore();
  const { memberships, isLoading: nodesLoading } = useNodesStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !member) {
    return <Navigate to="/public/home" replace />;
  }

  if (nodesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (memberships.length === 0) {
    return <Navigate to="/public/no-node" replace />;
  }

  return <Outlet />;
}
