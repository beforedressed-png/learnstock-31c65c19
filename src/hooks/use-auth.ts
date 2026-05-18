import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AccessRequest = Database["public"]["Tables"]["access_requests"]["Row"];

export type AuthState = {
  loading: boolean;
  session: Session | null;
  request: AccessRequest | null;
};

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [request, setRequest] = useState<AccessRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setSession(s);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setRequest(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("access_requests")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!cancelled) setRequest(data ?? null);
    };
    load();
    // poll briefly to catch trigger-created row right after first sign-in
    const t = setInterval(load, 2000);
    const stop = setTimeout(() => clearInterval(t), 10000);
    return () => {
      cancelled = true;
      clearInterval(t);
      clearTimeout(stop);
    };
  }, [session?.user?.id]);

  return { loading, session, request };
}

export async function signInWithGoogle() {
  const { lovable } = await import("@/integrations/lovable/index");
  return lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin + "/app",
  });
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}
