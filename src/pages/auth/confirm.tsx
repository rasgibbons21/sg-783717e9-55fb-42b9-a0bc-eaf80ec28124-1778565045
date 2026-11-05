import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { BloomMark } from "@/components/brand/BloomMark";
import { FIRST_LESSON_PATH } from "@/lib/postAuthPath";

export default function AuthConfirm() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) router.push(FIRST_LESSON_PATH);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-center">
      <BloomMark size={56} />
      <h1 className="text-2xl font-semibold text-foreground">Confirming your account...</h1>
      <p className="text-muted-foreground">This will only take a moment.</p>
    </div>
  );
}
