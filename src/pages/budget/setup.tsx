import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { SetupFlow } from "@/components/budget/SetupFlow";
import { useBudget } from "@/components/budget/useBudget";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function BudgetSetupPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useSubscription();
  const budget = useBudget();
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.replace(`/onboarding?returnTo=${encodeURIComponent("/budget/setup")}`);
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    fetch("/api/geo")
      .then((res) => (res.ok ? res.json() : { country: null }))
      .then(({ country: found }) => setCountry(found ?? null))
      .catch(() => undefined);
  }, []);

  return (
    <>
      <SEO title="Your savings plan - Bloom" description="Build a calm, save-first plan with Pansy." />
      <Layout>
        {isLoggedIn && !budget.loading ? (
          <SetupFlow
            initial={budget.plan}
            country={country}
            onSave={async (plan) => {
              await budget.savePlan(plan);
              // The development preview signs in through ?pro=1, so keep it when moving on.
              router.push(process.env.NODE_ENV === "development" && router.query.pro === "1" ? "/budget?pro=1" : "/budget");
            }}
          />
        ) : (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
          </div>
        )}
      </Layout>
    </>
  );
}
