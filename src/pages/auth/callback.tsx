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
        // Get the hash from URL (Supabase sends tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        // Check if we have tokens in the hash
        if (accessToken && refreshToken) {
          // Set the session using the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          setStatus("success");
          
          if (type === "recovery") {
            setMessage("Password reset successful! Redirecting...");
            setTimeout(() => router.push("/profile"), 1500);
          } else {
            setMessage("Email confirmed successfully! Redirecting...");
            setTimeout(() => router.push("/home"), 1500);
          }
        } else {
          // Fallback: try to get session from Supabase
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (session) {
            setStatus("success");
            setMessage("Authentication successful! Redirecting...");
            setTimeout(() => router.push("/home"), 1500);
          } else {
            throw new Error("No authentication data found");
          }
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