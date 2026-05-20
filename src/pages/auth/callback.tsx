import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your authentication...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const type = url.searchParams.get("type");
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        let currentUser = null;

        // PKCE Flow (Primary)
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.session) {
            currentUser = data.session.user;
          }
        } 
        // Implicit Flow (Fallback for older emails)
        else if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          currentUser = data.user;
        } 
        // Session fallback
        else {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (session) currentUser = session.user;
        }
        
        if (!currentUser) {
          throw new Error("No authentication data found");
        }

        setStatus("success");
        
        if (type === "recovery") {
          setMessage("Password reset successful! Redirecting...");
          setTimeout(() => router.push("/profile"), 1500);
        } else {
          setMessage("Authentication successful! Redirecting...");
          
          // Determine if user is new or returning based on onboarding completion
          let isNewUser = false;
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('experience_level')
              .eq('id', currentUser.id)
              .single();
              
            if (!userData || !userData.experience_level) {
              isNewUser = true;
            }
          } catch (e) {
            console.error("Error checking user status", e);
            isNewUser = true; // Fallback to onboarding if check fails
          }
          
          setTimeout(() => {
            if (isNewUser) {
              router.push('/onboarding'); // new users
            } else {
              router.push('/home');
            }
          }, 1500);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage("Authentication failed. Redirecting to login...");
        setTimeout(() => router.push("/"), 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <h2 className="text-xl font-semibold text-foreground">
                  Authenticating...
                </h2>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle className="h-12 w-12 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  Success!
                </h2>
              </>
            )}
            {status === "error" && (
              <>
                <XCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-semibold text-foreground">
                  Something went wrong
                </h2>
              </>
            )}
            <p className="text-muted-foreground">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}