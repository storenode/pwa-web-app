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

async function syncHasNode(
  session: Session | null,
  setHasNode: (hasNode: boolean | null) => void,
) {
  if (!session?.user) {
    setHasNode(null);
    return;
  }

  const { count, error } = await supabase
    .from("node_members")
    .select("id", { count: "exact", head: true })
    .eq("member_id", session.user.id);

  if (error) {
    console.error("Failed to check node membership:", error.message);
    return;
  }

  setHasNode((count ?? 0) > 0);
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
  const setHasNode = useAuthStore((state) => state.setHasNode);

  useEffect(() => {
    setLoading(true);

    supabase.auth.getSession().then(({ data }) => {
      console.log("AuthProvider: initial session", data.session);
      setSession(data.session);
      setMember(toMember(data.session));
      setLoading(false);
      void syncMember(data.session, setMember);
      void syncHasNode(data.session, setHasNode);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("onAuthStateChange: initial session", session);
      setSession(session);
      setMember(toMember(session));
      setLoading(false);
      void syncMember(session, setMember);
      void syncHasNode(session, setHasNode);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setMember, setLoading, setHasNode]);

  return <>{children}</>;
}
