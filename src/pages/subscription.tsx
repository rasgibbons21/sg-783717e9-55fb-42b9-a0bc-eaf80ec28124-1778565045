import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { SEO } from "@/components/SEO";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function Subscription() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await authService.getCurrentSession();
      if (!session) {
        router.push("/");
        return;
      }

      const userData = await userService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    };
    
    checkAuth();
    
    // Check for URL errors (e.g. from canceled checkout)
    if (router.query.canceled) {
      setErrorMsg("Checkout was canceled. You have not been charged.");
    } else if (router.query.error) {
      setErrorMsg("There was an issue processing your subscription. Please try again.");
    }
  }, [router]);

  useEffect(() => {
    const checkCurrentPlan = async () => {
      const user = await userService.getCurrentUser();
      if (user) {
        // Default to free since plan_type doesn't exist in profiles
        setCurrentPlan("free");
      }
    };
    checkCurrentPlan();
  }, []);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const priceId = isYearly 
        ? process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;

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
          email: user?.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        // Redirect to Stripe hosted checkout
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

  const monthlyPrice = 7.99;
  const yearlyPrice = 57.99;
  const yearlyMonthly = (yearlyPrice / 12).toFixed(2);

  return (
    <Layout>
      <SEO 
        title="Subscription Plans - Bloom" 
        description="Choose between Free and Bloom Pro to unlock unlimited daily picks and full analysis"
      />
      <div className="max-w-lg mx-auto p-4">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground">
              Get unlimited access to Pansy's investing insights
            </p>
          </div>
          
          {errorMsg && (
            <Card className="p-4 bg-[#d4788a]/10 border-[#d4788a]/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#d4788a] shrink-0 mt-0.5" />
              <p className="text-sm text-[#d4788a]">{errorMsg}</p>
            </Card>
          )}

          <Card className="p-4 bg-card">
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-accent"
              />
              <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
                Yearly
              </span>
              {isYearly && (
                <Badge className="bg-accent text-accent-foreground">
                  Save 40%
                </Badge>
              )}
            </div>
          </Card>

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
                    "3 picks per week",
                    "Basic market summary",
                    "Broker directory",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 opacity-50">
                    <span className="text-sm text-muted-foreground line-through">Pansy's full analysis</span>
                  </li>
                  <li className="flex items-start gap-2 opacity-50">
                    <span className="text-sm text-muted-foreground line-through">ETF picks</span>
                  </li>
                </ul>

                {currentPlan === "free" && (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                )}
              </div>
            </Card>

            {/* Pro Plan */}
            <Card className={`p-6 border-accent ${currentPlan === "pro" ? "border-2" : "border"}`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xl font-bold text-foreground">Bloom Pro</h3>
                      <Badge className="bg-accent text-accent-foreground">Popular</Badge>
                    </div>
                    <div className="mt-2">
                      {isYearly ? (
                        <>
                          <p className="text-2xl font-bold text-foreground">${yearlyMonthly}/mo</p>
                          <p className="text-sm text-muted-foreground">
                            Billed ${yearlyPrice}/year
                          </p>
                        </>
                      ) : (
                        <p className="text-2xl font-bold text-foreground">${monthlyPrice}/mo</p>
                      )}
                    </div>
                  </div>
                  {currentPlan === "pro" && (
                    <Badge variant="outline" className="border-accent text-accent">
                      Current Plan
                    </Badge>
                  )}
                </div>

                <ul className="space-y-2">
                  {[
                    "Unlimited daily picks",
                    "Pansy's full analysis on every pick",
                    "Stocks, ETFs, and mutual funds",
                    "Real-time news and charts",
                    "Portfolio tracker",
                    "Exclusive broker deals",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {currentPlan === "free" && (
                  <div className="space-y-3 pt-4">
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                      onClick={handleSubscribe}
                      disabled={isProcessing || !user}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting to Stripe...
                        </>
                      ) : (
                        "Upgrade to Bloom Pro"
                      )}
                    </Button>
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
          </div>

          <Card className="p-3 bg-muted border-muted-foreground/20">
            <p className="text-xs text-center text-muted-foreground leading-relaxed">
              Educational content only. Not financial advice. Bloom is not liable for any investment decisions or losses.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}