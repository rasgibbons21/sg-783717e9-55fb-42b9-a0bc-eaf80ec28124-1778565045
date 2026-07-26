import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionContextType {
  isPro: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  userName: string | null;
  userId: string | null;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const loadAuthStatus = useCallback(async () => {
    try {
      // getUser() hits the Supabase server and validates the token — not localStorage.
      // This is the only source of truth for whether the session is actually live.
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setIsLoggedIn(false);
        setIsPro(false);
        setUserName(null);
        setUserId(null);
        return;
      }

      setIsLoggedIn(true);
      setUserId(user.id);

      // Single profile fetch: name + Pro status in one query
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro, subscription_status, full_name")
        .eq("id", user.id)
        .single();

      const userIsPro = profile?.is_pro === true || profile?.subscription_status === "active";
      setIsPro(userIsPro);

      const first = profile?.full_name
        ? (profile.full_name as string).trim().split(" ")[0]
        : null;
      setUserName(first);
    } catch {
      setIsLoggedIn(false);
      setIsPro(false);
      setUserName(null);
      setUserId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadAuthStatus();
  }, [loadAuthStatus]);

  useEffect(() => {
    // Initial load
    loadAuthStatus();

    // Supabase fires this on sign-in, sign-out, token refresh — re-validate immediately
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      loadAuthStatus();
    });

    // Re-validate when the tab regains focus (catches session expiry while backgrounded)
    // In TWA context, also re-verify Google Play subscription status
    const handleFocus = async () => {
      loadAuthStatus();
      if ("getDigitalGoodsService" in window) {
        try {
          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;
          if (token) {
            fetch("/api/google-play/subscription-status", {
              headers: { Authorization: `Bearer ${token}` },
            }).then(() => loadAuthStatus());
          }
        } catch {}
      }
    };
    window.addEventListener("focus", handleFocus);

    // Re-validate after every client-side route transition
    const handleRoute = () => loadAuthStatus();
    router.events?.on("routeChangeComplete", handleRoute);

    return () => {
      authSub.unsubscribe();
      window.removeEventListener("focus", handleFocus);
      router.events?.off("routeChangeComplete", handleRoute);
    };
  }, [loadAuthStatus, router.events]);

  return (
    <SubscriptionContext.Provider value={{ isPro, isLoggedIn, isLoading, userName, userId, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within a SubscriptionProvider");
  return context;
}
