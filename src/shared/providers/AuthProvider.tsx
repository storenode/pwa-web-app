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
    avatarUrl:
      (user_metadata?.avatar_url as string | undefined) ??
      (user_metadata?.picture as string | undefined) ??
      null,
  };
}

async function syncMember(
  session: Session | null,
  setMember: (member: Member | null) => void,
) {
  if (!session?.user) return;

  const { id, email, user_metadata } = session.user;
  const authProvider = session.user.app_metadata?.provider ?? null;
  const providerUid =
    (user_metadata?.provider_id as string | undefined) ??
    (user_metadata?.sub as string | undefined) ??
    null;

  const { data: existing, error: fetchError } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error("Failed to look up member profile:", fetchError.message);
    return;
  }

  const query = existing
    ? supabase
        .from("members")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", id)
    : supabase.from("members").insert({
        id,
        email: email ?? null,
        display_name:
          (user_metadata?.full_name as string | undefined) ??
          (user_metadata?.name as string | undefined) ??
          null,
        avatar_url:
          (user_metadata?.avatar_url as string | undefined) ??
          (user_metadata?.picture as string | undefined) ??
          null,
        auth_provider: authProvider,
        provider_uid: providerUid,
        last_login_at: new Date().toISOString(),
      });

  const { data: row, error } = await query.select().single();

  if (error) {
    console.error("Failed to sync member profile:", error.message);
    return;
  }

  setMember({
    id: row.id,
    email: row.email,
    name: row.display_name,
    avatarUrl: row.avatar_url,
  });
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
      void syncMember(data.session, setMember);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Supabase's client auto-refreshes the session on tab focus/interval,
      // firing this event for the same signed-in user. The refreshed token
      // is already held internally by the client for its own requests, and
      // nothing in this app reads session.access_token directly, so a
      // same-user refresh needs no state update (and no member re-sync) —
      // skipping it here is what stops that cascading into refetches in
      // NodesProvider/MyStores.
      if (
        event === "TOKEN_REFRESHED" &&
        session?.user.id === useAuthStore.getState().member?.id
      ) {
        return;
      }

      setSession(session);
      setMember(toMember(session));
      setLoading(false);
      void syncMember(session, setMember);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setMember, setLoading]);

  return <>{children}</>;
}
