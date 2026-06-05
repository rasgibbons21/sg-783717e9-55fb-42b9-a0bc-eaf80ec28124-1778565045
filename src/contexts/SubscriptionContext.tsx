import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionContextType {
  isPro: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
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

      // Fetch fresh profile from Supabase
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_pro, subscription_status")
        .eq("id", session.user.id)
        .single();

      // Check Pro status
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

  const refreshSubscription = async () => {
    setIsLoading(true);
    await loadSubscriptionStatus();
  };

  useEffect(() => {
    loadSubscriptionStatus();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadSubscriptionStatus();
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Show loading state until data is ready
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-3xl animate-pulse">
            🌸
          </div>
          <p className="text-foreground font-medium">Loading Bloom...</p>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionContext.Provider value={{ isPro, isLoggedIn, isLoading, refreshSubscription }}>
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