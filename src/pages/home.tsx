import { useEffect } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { SignedInHome } from "@/components/home/SignedInHome";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useSubscription();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace("/");
  }, [isLoading, isLoggedIn, router]);

  return (
    <>
      <SEO title="Home - Bloom" description="Pick up your stock lessons where you left off." />
      <Layout>
        {isLoggedIn ? (
          <SignedInHome />
        ) : (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
          </div>
        )}
      </Layout>
    </>
  );
}
