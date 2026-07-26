import { useState } from "react";
import { supabase } from "../../lib/supabase";

export function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleLoginButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      console.error("❌ Google Sign-in failed:", error);
      setIsLoading(false);
    }
    // On success the browser navigates away to Google, so no need to reset loading.
  };

  return (
    <button
      type="button"
      {...props}
      onClick={handleGoogleLogin}
      disabled={isLoading || props.disabled}
      className="
        group cursor-pointer inline-flex h-10 min-w-[220px] items-center justify-center gap-3
        rounded-[4px] border border-google-border
        bg-google-surface px-4
        text-sm font-medium tracking-[.25px] text-google-text
        shadow-[0_1px_2px_0_rgba(60,64,67,0.30),0_1px_3px_1px_rgba(60,64,67,0.15)]
        transition-shadow duration-150
        hover:bg-[var(--color-google-hover)] hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.30),0_4px_8px_3px_rgba(60,64,67,0.15)]
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a73e8]
        active:shadow-none
        disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none
      "
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-sm" />
      ) : (
        <GoogleIcon />
      )}
      {isLoading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}
