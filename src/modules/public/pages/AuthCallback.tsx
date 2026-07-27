import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../shared/store/authStore";
import { useNodesStore } from "../../../shared/store/nodesStore";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { session, member, isLoading } = useAuthStore();
  const { memberships, isLoading: nodesLoading } = useNodesStore();

  useEffect(() => {
    if (isLoading) return; // wait for AuthProvider to finish

    if (session && member) {
      if (nodesLoading) return; // wait for node membership check
      navigate(memberships.length > 0 ? "/dashboard" : "/public/no-node", {
        replace: true,
      });
    } else {
      navigate("/public/home", { replace: true });
    }
  }, [session, member, isLoading, memberships, nodesLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-text font-semibold text-base font-sans">
          Signing you in to SelfNode...
        </p>
        <p className="text-text-muted text-sm font-sans">
          Setting up your profile
        </p>
      </div>
    </div>
  );
}
