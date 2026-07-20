import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../shared/store/authStore";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { session, member, isLoading } = useAuthStore();

  useEffect(() => {
    console.log("AuthCallback: session", session);
    console.log("AuthCallback: member", member);
    console.log("AuthCallback: isLoading", isLoading);
    if (isLoading) return; // wait for AuthProvider to finish

    if (session && member) {
      navigate("/dashboard");
    } else if (!session) {
      navigate("/");
    }
  }, [session, member, isLoading, navigate]);

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
