import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  
  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/onboarding");
      } else {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            router.push("/onboarding");
          } else {
            router.push("/?error=confirmation_failed");
          }
        } else {
          router.push("/?error=confirmation_failed");
        }
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