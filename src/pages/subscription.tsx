import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Check, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

// PayPal Plan IDs
const PAYPAL_MONTHLY_PLAN = "P-8W707879XT1115010NIACMNQ";
const PAYPAL_YEARLY_PLAN = "P-1TU067111E1942024NIACQBI";

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function Subscription() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    loadPayPalScript();
  }, []);

  useEffect(() => {
    if (paypalLoaded && user) {
      renderPayPalButtons();
    }
  }, [paypalLoaded, isYearly, user]);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }

    const userData = await userService.getCurrentUser();
    if (userData) {
      setUser(userData);
      setCurrentPlan(userData.plan_type as "free" | "pro");
    }
  };

  const loadPayPalScript = () => {
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      console.error("PayPal Client ID not configured");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load PayPal SDK");
    };
    document.body.appendChild(script);
  };

  const renderPayPalButtons = () => {
    const container = document.getElementById("paypal-button-container");
    if (!container || !window.paypal) return;

    // Clear existing buttons
    container.innerHTML = "";

    const planId = isYearly ? PAYPAL_YEARLY_PLAN : PAYPAL_MONTHLY_PLAN;

    window.paypal
      .Buttons({
        style: {
          shape: "rect",
          color: "gold",
          layout: "vertical",
          label: "subscribe",
        },
        createSubscription: function (data: any, actions: any) {
          return actions.subscription.create({
            plan_id: planId,
          });
        },
        onApprove: async function (data: any) {
          setIsProcessing(true);
          try {
            // Update user plan in Supabase
            if (user) {
              await userService.updateUser(user.id, {
                plan_type: "pro",
              });

              // Create subscription record
              await fetch("/api/paypal/activate-subscription", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: user.id,
                  subscriptionId: data.subscriptionID,
                  planType: isYearly ? "yearly" : "monthly",
                }),
              });

              // Refresh page to show Pro status
              window.location.reload();
            }
          } catch (error) {
            console.error("Error activating subscription:", error);
            alert("There was an error activating your subscription. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        onError: function (err: any) {
          console.error("PayPal subscription error:", err);
          alert("There was an error processing your subscription. Please try again.");
        },
      })
      .render("#paypal-button-container");
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
                  <div className="space-y-3">
                    <div id="paypal-button-container" className="min-h-[150px]">
                      {!paypalLoaded && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {isProcessing && (
                      <div className="text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Activating your Pro subscription...
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {currentPlan === "pro" && (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
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