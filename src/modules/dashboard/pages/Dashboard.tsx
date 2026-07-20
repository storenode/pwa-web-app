import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { useAuthStore } from "../../../shared/store/authStore";
import { StoreNodeLogo } from "../../../shared/components/StoreNodeLogo";
import ThemeToggle from "../../../shared/components/ThemeToggle";

export default function Dashboard() {
  const navigate = useNavigate();
  const { session, member, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/", { replace: true });
    }
  }, [isLoading, session, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="p-4 border-b border-border">
        <div className="container flex justify-between items-center h-16 mx-auto">
          <StoreNodeLogo className="h-10 w-auto" />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-sm btn-ghost"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-text">
          Welcome{member?.name ? `, ${member.name}` : ""} 👋
        </h1>
        <p className="mt-2 text-text-muted">{member?.email}</p>
      </main>
    </div>
  );
}
