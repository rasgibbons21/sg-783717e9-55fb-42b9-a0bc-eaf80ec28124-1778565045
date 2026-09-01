import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Check, Loader2, AlertCircle, Lock, Share2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PRO_PLAN } from "@/config/proPlan";
import { usePaymentProvider } from "@/lib/payments";
import GooglePlaySubscription from "@/components/GooglePlaySubscription";
import { QRCodeSVG } from "qrcode.react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Subscription() {
  const router = useRouter();
  const { canShowExternalPayment, canShowInAppPayment } = usePaymentProvider();
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authService.getCurrentSession();
      if (session) {
        const userData = await userService.getCurrentUser();
        if (userData) {
          setUser(userData);
        }
      }
    };

    checkAuth();

    if (router.query.canceled) {
      setErrorMsg("Checkout was canceled. You have not been charged.");
    } else if (router.query.error) {
      setErrorMsg("There was an issue processing your subscription. Please try again.");
    }
  }, [router]);

  const handleSubscribe = async (plan: "monthly" | "yearly" | "lifetime") => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const priceIdMap: Record<string, string | undefined> = {
        monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
        yearly: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
        lifetime: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID,
      };
      const priceId = priceIdMap[plan];

      if (!priceId) {
        throw new Error("Subscription pricing is not configured correctly.");
      }

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: user?.id,
          email: user?.email,
          isLifetime: plan === "lifetime",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      setErrorMsg(error.message || "Failed to start checkout. Please try again.");
      setIsProcessing(false);
    }
  };

  const monthlyPrice = PRO_PLAN.monthlyPrice;
  const yearlyPrice = PRO_PLAN.yearlyPrice;
  const yearlyMonthly = PRO_PLAN.yearlyMonthly;
  const lifetimePrice = PRO_PLAN.lifetimePrice;

  if (canShowInAppPayment) {
    return (
      <Layout>
        <SEO title="Bloom Premium" description="Subscribe to Bloom Premium via Google Play" />
        <GooglePlaySubscription />
      </Layout>
    );
  }

  if (!canShowExternalPayment) {
    return (
      <Layout>
        <SEO title="Subscription - Bloom" description="Bloom Pro subscription" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
          <div className="rounded-full bg-muted p-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Subscriptions</h1>
            <p className="text-muted-foreground max-w-sm">
              Subscriptions are not available in this version of the app.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="Subscription Plans - Bloom"
        description="Choose between Free and Bloom Pro to unlock unlimited daily stock analyses"
      />
      <div className="max-w-lg mx-auto p-4">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground">
              Unlock 150+ lessons, 32 strategies, and earn your certificate
            </p>
          </div>
          
          {errorMsg && (
            <Card className="p-4 bg-[#ef4444]/10 border-[#ef4444]/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0 mt-0.5" />
              <p className="text-sm text-[#ef4444]">{errorMsg}</p>
            </Card>
          )}

          <div className="space-y-4">
            {/* Free Plan */}
            <Card className={`p-6 ${currentPlan === "free" ? "border-primary border-2" : ""}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-foreground">Free</h3>
                    <p className="text-2xl font-bold text-foreground mt-1">$0</p>
                  </div>
                  {currentPlan === "free" && (
                    <Badge variant="outline" className="border-primary text-primary">
                      Current Plan
                    </Badge>
                  )}
                </div>

                <ul className="space-y-2">
                  {[
                    "36 core lessons (beginner & intermediate)",
                    "Paper trading simulator with $10K",
                    "Daily challenges & streak tracking",
                    "Market insights & daily bloom",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 opacity-50">
                    <span className="text-sm text-muted-foreground line-through">16 income stream lessons</span>
                  </li>
                  <li className="flex items-start gap-2 opacity-50">
                    <span className="text-sm text-muted-foreground line-through">32 pro strategies</span>
                  </li>
                  <li className="flex items-start gap-2 opacity-50">
                    <span className="text-sm text-muted-foreground line-through">9-module university (89 lessons)</span>
                  </li>
                </ul>

                {currentPlan === "free" && (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                )}
              </div>
            </Card>

            {/* Monthly Plan */}
            <Card className="p-6 border border-accent">
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">Monthly</h3>
                  <p className="text-2xl font-bold text-foreground mt-1">${monthlyPrice}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <p className="text-sm text-muted-foreground">Cancel anytime</p>
                </div>

                {currentPlan === "free" && (
                  <div className="pt-2">
                    {user ? (
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => handleSubscribe("monthly")}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting...</>
                        ) : (
                          "Subscribe Monthly"
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => router.push("/onboarding")}
                      >
                        Sign Up Free, Then Upgrade
                      </Button>
                    )}
                  </div>
                )}

                {currentPlan === "pro" && (
                  <Button variant="outline" className="w-full border-accent text-accent" disabled>
                    Active Plan
                  </Button>
                )}
              </div>
            </Card>

            {/* Yearly Plan */}
            <Card className="p-6 border-2 border-accent relative">
              <Badge className="absolute -top-2.5 left-4 bg-accent text-accent-foreground">Save 50%</Badge>
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">Yearly</h3>
                  <p className="text-2xl font-bold text-foreground mt-1">${yearlyMonthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <p className="text-sm text-muted-foreground">Billed ${yearlyPrice}/year</p>
                </div>

                <ul className="space-y-2">
                  {[
                    "Everything in Free, plus:",
                    "16 income stream & side hustle lessons",
                    "32 pro trading & investing strategies",
                    "9-module university — 89 deep-dive lessons",
                    "Unlimited stock & ETF analysis",
                    "Certificate of completion",
                    "Save your portfolio & progress forever",
                    "Pansy unlimited — ask anything, anytime",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {currentPlan === "free" && (
                  <div className="space-y-3 pt-2">
                    {user ? (
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => handleSubscribe("yearly")}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting...</>
                        ) : (
                          "Subscribe Yearly"
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => router.push("/onboarding")}
                      >
                        Sign Up Free, Then Upgrade
                      </Button>
                    )}
                    <p className="text-xs text-center text-muted-foreground">
                      Secure checkout powered by Stripe
                    </p>
                  </div>
                )}

                {currentPlan === "pro" && (
                  <Button variant="outline" className="w-full border-accent text-accent" disabled>
                    Active Plan
                  </Button>
                )}
              </div>
            </Card>

            {/* Lifetime Plan */}
            <Card className="p-6 border border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg"
                style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)", color: "#0E1B30" }}>
                Best Value
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">Lifetime</h3>
                  <p className="text-2xl font-bold text-foreground mt-1">${lifetimePrice}<span className="text-sm font-normal text-muted-foreground"> one-time</span></p>
                  <p className="text-sm text-muted-foreground">Pay once, yours forever</p>
                </div>

                <ul className="space-y-2">
                  {[
                    "Everything in Bloom Pro",
                    "All future updates included",
                    "No recurring payments ever",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {currentPlan === "free" && (
                  <div className="pt-2">
                    {user ? (
                      <Button
                        className="w-full text-[#0E1B30] font-bold"
                        style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)" }}
                        onClick={() => handleSubscribe("lifetime")}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting...</>
                        ) : (
                          "Get Lifetime Access"
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="w-full text-[#0E1B30] font-bold"
                        style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)" }}
                        onClick={() => router.push("/onboarding")}
                      >
                        Sign Up Free, Then Upgrade
                      </Button>
                    )}
                  </div>
                )}

                {currentPlan === "pro" && (
                  <Button variant="outline" className="w-full border-accent text-accent" disabled>
                    Active Plan
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-3 bg-muted border-muted-foreground/20">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Educational content only. Not financial advice. Bloom is not liable for any investment decisions or losses.
            </p>
          </Card>

          {/* Share QR */}
          <Card className="p-5 bg-card text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Share2 className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wide">Share Bloom</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Know someone who needs this? Scan to share.
            </p>
            <div className="inline-block p-3 rounded-xl bg-white">
              <QRCodeSVG
                value="https://shebloomswealth.app"
                size={120}
                level="M"
                fgColor="#0E1B30"
                bgColor="white"
                imageSettings={{
                  src: "/bloom-logo.png",
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">shebloomswealth.app</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}