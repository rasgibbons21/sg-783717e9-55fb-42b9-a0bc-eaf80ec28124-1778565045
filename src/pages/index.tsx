import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (user?.experience_level) {
          router.push("/home");
        } else {
          router.push("/onboarding");
        }
      } else {
        router.push("/onboarding");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading Bloom...</p>
      </div>
    </div>
  );
}