import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionContextType {
  isPro: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscriptionStatus = async () => {
    try {
      const session = await authService.getCurrentSession();
      
      if (!session) {
        setIsLoggedIn(false);
        setIsPro(false);
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      // Fetch fresh profile from Supabase - no cache
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro, subscription_status")
        .eq("id", session.user.id)
        .single();

      // Compute Pro status: is_pro OR subscription_status = 'active'
      const userIsPro = profile?.is_pro === true || profile?.subscription_status === "active";
      setIsPro(userIsPro);
    } catch (error) {
      console.error("Error loading subscription status:", error);
      setIsLoggedIn(false);
      setIsPro(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    await loadSubscriptionStatus();
  };

  useEffect(() => {
    // Load on mount
    loadSubscriptionStatus();

    // Re-fetch on auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadSubscriptionStatus();
    });

    // Re-fetch on window focus
    const handleFocus = () => {
      loadSubscriptionStatus();
    };
    window.addEventListener("focus", handleFocus);

    // Re-fetch on route change
    const handleRouteChange = () => {
      loadSubscriptionStatus();
    };
    router.events?.on("routeChangeComplete", handleRouteChange);

    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener("focus", handleFocus);
      router.events?.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // Always render children - components handle their own loading states
  return (
    <SubscriptionContext.Provider value={{ isPro, isLoggedIn, isLoading, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}