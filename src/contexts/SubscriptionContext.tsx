import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { type SubscriptionTier, getEntitlements, type Entitlements } from "@/config/proPlan";

interface SubscriptionContextType {
  tier: SubscriptionTier;
  entitlements: Entitlements;
  isPro: boolean;
  isDesk: boolean;
  isPaid: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  userName: string | null;
  userId: string | null;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

function statusToTier(status: string | null | undefined, isPro: boolean): SubscriptionTier {
  if (status === "pro" || status === "pro_active") return "pro";
  if (status === "desk" || status === "active" || status === "lifetime") return "desk";
  if (isPro) return "desk";
  return "free";
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const loadAuthStatus = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setIsLoggedIn(false);
        setTier("free");
        setUserName(null);
        setUserId(null);
        return;
      }

      setIsLoggedIn(true);
      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro, subscription_status, full_name")
        .eq("id", user.id)
        .single();

      const resolvedTier = statusToTier(
        profile?.subscription_status as string | null,
        profile?.is_pro === true
      );
      setTier(resolvedTier);

      const first = profile?.full_name
        ? (profile.full_name as string).trim().split(" ")[0]
        : null;
      setUserName(first);
    } catch {
      setIsLoggedIn(false);
      setTier("free");
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
    if (process.env.NODE_ENV === "development" && router.query.pro === "1") {
      setTier("pro");
      setIsLoggedIn(true);
      setUserName("Preview");
      setUserId("dev-preview");
      setIsLoading(false);
    }
  }, [router.query.pro]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && router.query.pro === "1") return;
    loadAuthStatus();

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      loadAuthStatus();
    });

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

    const handleRoute = () => loadAuthStatus();
    router.events?.on("routeChangeComplete", handleRoute);

    return () => {
      authSub.unsubscribe();
      window.removeEventListener("focus", handleFocus);
      router.events?.off("routeChangeComplete", handleRoute);
    };
  }, [loadAuthStatus, router.events]);

  const entitlements = getEntitlements(tier);

  return (
    <SubscriptionContext.Provider value={{
      tier,
      entitlements,
      isPro: tier === "pro",
      isDesk: tier === "desk",
      isPaid: tier !== "free",
      isLoggedIn,
      isLoading,
      userName,
      userId,
      refresh,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within a SubscriptionProvider");
  return context;
}
