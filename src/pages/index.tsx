import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { SignedOutHero } from "@/components/home/SignedOutHero";
import { supabase } from "@/integrations/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const [confirmationFailed, setConfirmationFailed] = useState(false);

  useEffect(() => {
    setConfirmationFailed(new URLSearchParams(window.location.search).get("error") === "confirmation_failed");
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/home");
    });
  }, [router]);

  return (
    <>
      <SEO
        title="Bloom - Learn to read stocks with skill. Free."
        description="A free, premium place for women to learn stock analysis: fair value gaps, structure and liquidity, through interactive chart lessons and safe practice. No card, nothing to pay."
      />
      <Layout>
        {confirmationFailed && (
          <p role="alert" className="bg-accent px-4 py-3 text-center text-sm text-foreground">
            That confirmation link has expired. Please sign in or start again and we&apos;ll send a new one.
          </p>
        )}
        <SignedOutHero />
      </Layout>
    </>
  );
}
