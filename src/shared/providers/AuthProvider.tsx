import { useEffect } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { useAuthStore, type Member } from "../store/authStore";

function toMember(session: Session | null): Member | null {
  if (!session?.user) return null;
  const { id, email, user_metadata } = session.user;
  return {
    id,
    email: email ?? null,
    name:
      (user_metadata?.full_name as string | undefined) ??
      (user_metadata?.name as string | undefined) ??
      null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);
  const setMember = useAuthStore((state) => state.setMember);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    setLoading(true);

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setMember(toMember(data.session));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setMember(toMember(session));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setMember, setLoading]);

  return <>{children}</>;
}
