import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Check, Minus, Loader2, AlertCircle, Lock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { DESK_PLAN, PRO_PLAN, FEATURE_MATRIX } from "@/config/proPlan";
import { usePaymentProvider } from "@/lib/payments";
import { useSubscription } from "@/contexts/SubscriptionContext";
import GooglePlaySubscription from "@/components/GooglePlaySubscription";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Billing = "monthly" | "yearly";

export default function Subscription() {
  const router = useRouter();
  const { canShowExternalPayment, canShowInAppPayment } = usePaymentProvider();
  const { tier, isLoggedIn, userId } = useSubscription();
  const [billing, setBilling] = useState<Billing>("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (router.query.canceled) setErrorMsg("Checkout was canceled. You have not been charged.");
    else if (router.query.error) setErrorMsg("There was an issue processing your subscription. Please try again.");
  }, [router]);

  const handleSubscribe = async (planTier: "desk" | "pro", cycle: Billing) => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const priceIdMap: Record<string, string | undefined> = {
        desk_monthly: process.env.NEXT_PUBLIC_STRIPE_DESK_MONTHLY_PRICE_ID,
        desk_yearly: process.env.NEXT_PUBLIC_STRIPE_DESK_YEARLY_PRICE_ID,
        pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
        pro_yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
      };
      const priceId = priceIdMap[`${planTier}_${cycle}`];
      if (!priceId) throw new Error("Subscription pricing is not configured correctly.");

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId, tier: planTier }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create checkout session");
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (error: any) {
      console.error("Subscription error:", error);
      setErrorMsg(error.message || "Failed to start checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  if (canShowInAppPayment) {
    return (
      <Layout>
        <SEO title="Radar Desk" description="Subscribe to Radar Desk via Google Play" />
        <GooglePlaySubscription />
      </Layout>
    );
  }

  if (!canShowExternalPayment) {
    return (
      <Layout>
        <SEO title="Subscription" description="Radar subscription" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
          <div className="rounded-full bg-muted p-6"><Lock className="w-10 h-10 text-muted-foreground" /></div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Subscriptions</h1>
            <p className="text-muted-foreground max-w-sm">Subscriptions are not available in this version of the app.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const deskPrice = billing === "yearly" ? DESK_PLAN.yearlyPrice : DESK_PLAN.monthlyPrice;
  const proPrice = billing === "yearly" ? PRO_PLAN.yearlyPrice : PRO_PLAN.monthlyPrice;
  const deskPeriod = billing === "yearly" ? "/yr" : "/mo";

  return (
    <Layout>
      <SEO title="Plans — Radar" description="Radar Desk and Pro plans" />
      <div className="max-w-3xl mx-auto p-4 pb-24">
        <div className="text-center space-y-2 mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground">Choose Your Plan</h1>
          <p className="text-muted-foreground">Everything starts with the free tier. Upgrade when you're ready.</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-4 rounded-xl flex items-start gap-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
            <p className="text-sm text-[#ef4444]">{errorMsg}</p>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-full p-1" style={{ background: "rgba(255,255,255,0.06)" }}>
            {(["monthly", "yearly"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: billing === b ? "rgba(39,183,200,0.15)" : "transparent",
                  color: billing === b ? "#27B7C8" : "rgba(243,237,227,0.5)",
                  border: billing === b ? "1px solid rgba(39,183,200,0.3)" : "1px solid transparent",
                }}
              >
                {b === "yearly" ? "Yearly (save 2+ mo)" : "Monthly"}
              </button>
            ))}
          </div>
        </div>

        {/* Plan columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Free column */}
          <div className="rounded-2xl p-5 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
            <h3 className="text-lg font-bold text-foreground mb-1">Free</h3>
            <p className="text-2xl font-bold text-foreground mb-1">$0</p>
            <p className="text-xs text-muted-foreground mb-4">No card needed</p>
            <Button variant="outline" className="w-full" disabled={tier === "free"}
              onClick={tier !== "free" ? () => router.push("/profile") : undefined}
            >
              {tier === "free" ? "Current Plan" : "Manage in Profile"}
            </Button>
          </div>

          {/* Desk column */}
          <div className="rounded-2xl p-5 border-2 relative" style={{ background: "rgba(39,183,200,0.04)", borderColor: "#27B7C8" }}>
            <div className="absolute -top-2.5 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: "#27B7C8", color: "#07080C" }}>
              Recommended
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Desk</h3>
            <p className="text-2xl font-bold text-foreground mb-0.5">${deskPrice}<span className="text-sm font-normal text-muted-foreground">{deskPeriod}</span></p>
            {billing === "yearly" && <p className="text-xs text-[#49B06E] mb-1">{DESK_PLAN.yearlySavings}</p>}
            <p className="text-xs text-muted-foreground mb-4">{DESK_PLAN.tagline}</p>
            {isLoggedIn ? (
              <Button
                className="w-full text-[#07080C] font-bold"
                style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)" }}
                onClick={() => handleSubscribe("desk", billing)}
                disabled={isProcessing || tier === "desk"}
              >
                {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting...</> : tier === "desk" ? "Current Plan" : "Subscribe to Desk"}
              </Button>
            ) : (
              <Button
                className="w-full text-[#07080C] font-bold"
                style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)" }}
                onClick={() => router.push("/onboarding")}
              >
                Sign Up, Then Upgrade
              </Button>
            )}
          </div>

          {/* Pro column */}
          <div className="rounded-2xl p-5 border relative" style={{ background: "rgba(168,85,247,0.04)", borderColor: "rgba(168,85,247,0.4)" }}>
            <div className="absolute -top-2.5 left-4 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: "linear-gradient(135deg, #a855f7, #27B7C8)", color: "#fff" }}>
              Pro
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Pro</h3>
            <p className="text-2xl font-bold text-foreground mb-0.5">${proPrice}<span className="text-sm font-normal text-muted-foreground">{deskPeriod}</span></p>
            {billing === "yearly" && <p className="text-xs text-[#49B06E] mb-1">{PRO_PLAN.yearlySavings}</p>}
            <p className="text-xs text-muted-foreground mb-4">{PRO_PLAN.tagline}</p>
            {isLoggedIn ? (
              <Button
                className="w-full font-bold text-white"
                style={{ background: "linear-gradient(135deg, #a855f7, #27B7C8)" }}
                onClick={() => handleSubscribe("pro", billing)}
                disabled={isProcessing || tier === "pro"}
              >
                {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting...</> : tier === "pro" ? "Current Plan" : "Subscribe to Pro"}
              </Button>
            ) : (
              <Button
                className="w-full font-bold text-white"
                style={{ background: "linear-gradient(135deg, #a855f7, #27B7C8)" }}
                onClick={() => router.push("/onboarding")}
              >
                Sign Up, Then Upgrade
              </Button>
            )}
          </div>
        </div>

        {/* Feature matrix */}
        <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="grid grid-cols-4 text-xs font-bold uppercase tracking-wider px-4 py-3" style={{ background: "rgba(255,255,255,0.04)" }}>
            <span className="text-muted-foreground">Feature</span>
            <span className="text-center text-muted-foreground">Free</span>
            <span className="text-center text-[#27B7C8]">Desk</span>
            <span className="text-center text-[#a855f7]">Pro</span>
          </div>
          {FEATURE_MATRIX.map((row, i) => (
            <div
              key={row.label}
              className="grid grid-cols-4 px-4 py-3 text-sm items-center"
              style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
            >
              <span className="text-foreground font-medium">{row.label}</span>
              <FeatureCell value={row.free} />
              <FeatureCell value={row.desk} accent />
              <FeatureCell value={row.pro} accent />
            </div>
          ))}
        </div>

        {/* Fine print */}
        <p className="text-[10px] text-center text-muted-foreground/50 mt-6 leading-relaxed max-w-md mx-auto">
          Educational content only. Not financial advice. Radar is not liable for any investment decisions or losses.
          Cancel anytime in Settings. Secure checkout powered by Stripe.
        </p>
      </div>
    </Layout>
  );
}

function FeatureCell({ value, accent }: { value: string; accent?: boolean }) {
  if (value === "—") return <span className="text-center"><Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" /></span>;
  if (value === "Open") return <span className="text-center"><Check className="w-4 h-4 text-[#49B06E] mx-auto" /></span>;
  return (
    <span className={`text-center text-xs ${accent ? "text-foreground" : "text-muted-foreground"}`}>
      {value}
    </span>
  );
}
