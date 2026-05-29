import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your authentication...");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    if (!userEmail) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: 'https://shebloomswealth.app/auth/callback'
        }
      });
      
      if (error) throw error;
      
      setMessage("✨ New confirmation email sent! Check your inbox (and spam folder).");
    } catch (err) {
      console.error("Resend error:", err);
      setMessage("Couldn't resend the email. Please try signing up again.");
    } finally {
      setIsResending(false);
    }
  };

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
              router.push('/onboarding');
            } else {
              router.push('/home');
            }
          }, 1500);
        }
      } catch (error: any) {
        console.error("Auth callback error:", error);
        setStatus("error");
        
        // Extract email from error if available
        const errorMessage = error?.message || "";
        if (errorMessage.includes("email")) {
          const emailMatch = errorMessage.match(/[\w.-]+@[\w.-]+\.\w+/);
          if (emailMatch) setUserEmail(emailMatch[0]);
        }
        
        // Friendly Pansy error message
        if (errorMessage.includes("expired") || errorMessage.includes("invalid")) {
          setMessage("Oops! This confirmation link has expired or was already used. No worries — I can send you a fresh one! 🌸");
        } else {
          setMessage("Something went wrong with your confirmation link. Let me help you get a new one! 🌸");
        }
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
                  Confirming your account...
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
                <div className="text-6xl mb-2">🌸</div>
                <h2 className="text-xl font-semibold text-foreground">
                  Link Expired
                </h2>
              </>
            )}
            <p className="text-muted-foreground">{message}</p>
            
            {status === "error" && userEmail && (
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="mt-4 w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send me a new link"
                )}
              </Button>
            )}
            
            {status === "error" && !userEmail && (
              <Button
                onClick={() => router.push("/")}
                className="mt-4 w-full"
              >
                Back to Sign In
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}