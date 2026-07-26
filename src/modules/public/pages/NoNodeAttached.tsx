import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { LogoDark } from "../../../shared/components/LogoDark";
import { LogoLight } from "../../../shared/components/LogoLight";

export default function NoNodeAttached() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/public/home", { replace: true });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center items-center space-x-2">
          <LogoLight className="h-20 sm:h-18 w-auto shrink-0 dark:hidden" />
          <LogoDark className="h-20 sm:h-18 w-auto shrink-0 hidden dark:block" />
        </div>
        <h1 className="text-text font-semibold text-xl font-sans">
          No store attached to your account
        </h1>
        <p className="text-text-muted text-sm font-sans">
          Your account isn&apos;t linked to a store yet. Please contact your
          store admin, or reach out to{" "}
          <a
            href="mailto:storenode.hq@gmail.com"
            className="text-primary underline"
          >
            storenode.hq@gmail.com
          </a>{" "}
          for assistance.
        </p>
        <div className="flex justify-center items-center space-x-2">
          <button onClick={handleSignOut} className="btn btn-accent">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
