import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  
  useEffect(() => {
    const handleCallback = async () => {
      // First check if we already have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Already have a session — check onboarding status
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", session.user.id)
          .single();

        router.push(profile?.onboarding_complete ? "/home" : "/onboarding");
        return;
      }
      
      // Handle the code from email confirmation
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("onboarding_complete")
            .eq("id", data.session.user.id)
            .single();

          router.push(profile?.onboarding_complete ? "/home" : "/onboarding");
        } else {
          router.push("/?error=confirmation_failed");
        }
      } else {
        router.push("/");
      }
    };
    
    handleCallback();
  }, [router]);

  return (
    <div style={{
      background: "#0E1B30",
      color: "#ffffff",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px"
    }}>
      <div style={{ fontSize: "32px" }}>🌸</div>
      <p style={{ fontFamily: "Georgia,serif", fontSize: "18px" }}>
        Setting things up for you...
      </p>
    </div>
  );
}