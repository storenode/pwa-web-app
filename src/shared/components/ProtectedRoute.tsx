import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ProtectedRoute() {
  const { session, member, isLoading, hasNode } = useAuthStore();

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

  if (hasNode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasNode) {
    return <Navigate to="/public/no-node" replace />;
  }

  return <Outlet />;
}
