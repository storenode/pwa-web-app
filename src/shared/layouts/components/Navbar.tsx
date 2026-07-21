import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import ThemeToggle from "../../components/ThemeToggle";
import { LogoLight } from "../../components/LogoLight";
import { LogoDark } from "../../components/LogoDark";

export default function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/public/home", { replace: true });
  };

  return (
    <nav className="navbar w-full bg-base-300">
      <label
        htmlFor="dashboard-drawer"
        aria-label="open sidebar"
        className="btn btn-square btn-ghost drawer-button lg:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth="2"
          fill="none"
          stroke="currentColor"
          className="my-1.5 inline-block size-4"
        >
          <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
          <path d="M9 4v16"></path>
          <path d="M14 10l2 2l-2 2"></path>
        </svg>
      </label>
      <div className="flex-1 min-w-0 px-2 sm:px-4">
        <LogoLight className="h-12 sm:h-10 w-auto shrink-0 dark:hidden" />
        <LogoDark className="h-12 sm:h-10 w-auto shrink-0 hidden dark:block" />
      </div>
      <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 shrink-0">
        <ThemeToggle />
        <button
          type="button"
          onClick={handleSignOut}
          className="btn btn-sm btn-ghost"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
