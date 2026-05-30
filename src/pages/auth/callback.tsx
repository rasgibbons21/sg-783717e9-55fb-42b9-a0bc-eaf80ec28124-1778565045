import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // First check if there's already a valid session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          // Session exists - check if user is new or returning
          const isNewUser = sessionData.session.user?.created_at === sessionData.session.user?.last_sign_in_at;
          router.push(isNewUser ? "/onboarding" : "/home");
          return;
        }

        // No session - exchange code for session
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error("Exchange code error:", error);
            router.push("/?error=confirmation_failed");
            return;
          }

          if (data.session) {
            // Session is now persisted - redirect based on user status
            const isNewUser = data.user?.created_at === data.user?.last_sign_in_at;
            router.push(isNewUser ? "/onboarding" : "/home");
          } else {
            router.push("/?error=confirmation_failed");
          }
        } else {
          router.push("/?error=confirmation_failed");
        }
      } catch (error) {
        console.error("Callback error:", error);
        router.push("/?error=confirmation_failed");
      }
    };
    
    handleCallback();
  }, [router]);

  return (
    <div style={{background:"#0a0a0f",color:"#ffffff",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p>Confirming your email... 🌸</p>
    </div>
  );
}