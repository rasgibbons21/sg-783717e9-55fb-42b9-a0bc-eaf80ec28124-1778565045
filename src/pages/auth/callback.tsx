import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { BloomMark } from "@/components/brand/BloomMark";
import { postAuthPath } from "@/lib/postAuthPath";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const goToLearning = async (userId: string) => {
      const { data: profile } = await supabase.from("profiles").select("onboarding_complete").eq("id", userId).single();
      if (!profile?.onboarding_complete) {
        await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", userId);
      }
      router.push(postAuthPath(profile));
    };

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const isRecovery = params.get("type") === "recovery";

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        if (isRecovery) return router.push("/reset-password");
        return goToLearning(session.user.id);
      }

      const code = params.get("code");
      if (!code) return router.push("/");

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.session) return router.push("/?error=confirmation_failed");
      if (isRecovery) return router.push("/reset-password");
      return goToLearning(data.session.user.id);
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
      <BloomMark size={48} />
      <p className="font-serif text-lg text-foreground">Setting things up for you...</p>
    </div>
  );
}
