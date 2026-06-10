import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ProWelcomeOverlay } from "@/components/ProWelcomeOverlay";

function ProWelcomeCheck() {
  const { isPro, isLoggedIn, isLoading } = useSubscription();
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkProWelcome = async () => {
      // Only check once, and only if Pro user is logged in
      if (hasChecked || !isLoggedIn || !isPro || isLoading) {
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setHasChecked(true);
          return;
        }

        // Check if user has seen Pro welcome
        const { data: profile } = await supabase
          .from("profiles")
          .select("has_seen_pro_welcome")
          .eq("id", session.user.id)
          .single();

        if (profile && !profile.has_seen_pro_welcome) {
          setShowWelcome(true);
        }

        setHasChecked(true);
      } catch (error) {
        console.error("Error checking Pro welcome status:", error);
        setHasChecked(true);
      }
    };

    checkProWelcome();
  }, [isPro, isLoggedIn, isLoading, hasChecked]);

  const handleCloseWelcome = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Set has_seen_pro_welcome to true
        await supabase
          .from("profiles")
          .update({ has_seen_pro_welcome: true })
          .eq("id", session.user.id);
      }

      setShowWelcome(false);
    } catch (error) {
      console.error("Error updating Pro welcome status:", error);
      setShowWelcome(false);
    }
  };

  if (!showWelcome) {
    return null;
  }

  return <ProWelcomeOverlay onClose={handleCloseWelcome} />;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <ProWelcomeCheck />
        <Component {...pageProps} />
        <Toaster />
      </SubscriptionProvider>
    </ThemeProvider>
  );
}
