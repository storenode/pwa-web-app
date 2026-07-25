import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import ThemeToggle from "../../components/ThemeToggle";
import { StoreNodeLogo } from "../../components/StoreNodeLogo";
import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const navigate = useNavigate();
  const member = useAuthStore((state) => state.member);
  const [avatarError, setAvatarError] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/public/home", { replace: true });
  };

  const initials =
    member?.name?.trim()?.[0]?.toUpperCase() ??
    member?.email?.trim()?.[0]?.toUpperCase() ??
    "U";

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
        <StoreNodeLogo subtitle="Store operating system" />
      </div>
      <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 shrink-0">
        <ThemeToggle />
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            aria-label="Account menu"
            className="btn btn-ghost btn-circle avatar avatar-placeholder"
          >
            {member?.avatarUrl && !avatarError ? (
              <div className="w-8 rounded-full">
                <img
                  src={member.avatarUrl}
                  alt={member.name ?? "User"}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              </div>
            ) : (
              <div className="bg-neutral text-neutral-content w-8 rounded-full">
                <span className="text-sm">{initials}</span>
              </div>
            )}
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-48 p-2 shadow"
          >
            {(member?.name || member?.email) && (
              <li className="menu-title truncate">
                {member?.name ?? member?.email}
              </li>
            )}
            <li>
              <button type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
