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
        // Already have a session — go home immediately
        router.push("/home");
        return;
      }
      
      // Handle the code from email confirmation
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          // Check if this is first time login
          const createdAt = new Date(data.user?.created_at || "");
          const lastSignIn = new Date(data.user?.last_sign_in_at || "");
          const diffSeconds = Math.abs(lastSignIn.getTime() - createdAt.getTime()) / 1000;
          const isNewUser = diffSeconds < 60;
          
          router.push(isNewUser ? "/onboarding" : "/home");
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
      background: "#0a0a0f",
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