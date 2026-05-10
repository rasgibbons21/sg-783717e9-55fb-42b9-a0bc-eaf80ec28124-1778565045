import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type User = Database["public"]["Tables"]["users"]["Row"];

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: PayPalButtonsConfig) => {
        render: (container: string) => void;
      };
    };
  }
}

interface PayPalButtonsConfig {
  style?: {
    layout?: string;
    color?: string;
    shape?: string;
    label?: string;
  };
  createSubscription: (
    data: unknown,
    actions: {
      subscription: {
        create: (details: { plan_id: string }) => Promise<string>;
      };
    }
  ) => Promise<string>;
  onApprove: (
    data: { subscriptionID: string },
    actions: unknown
  ) => Promise<void>;
  onError?: (err: unknown) => void;
}

export default function Subscription() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [planIds, setPlanIds] = useState<{ monthly: string; yearly: string } | null>(null);
  const paypalMonthlyRef = useRef<HTMLDivElement>(null);
  const paypalYearlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserData();
    initializePayPalPlans();
  }, []);

  useEffect(() => {
    if (planIds && window.paypal) {
      renderPayPalButtons();
    }
  }, [planIds, billingCycle]);

  const loadUserData = async () => {
    const userData = await userService.getCurrentUser();
    setUser(userData);
  };

  const initializePayPalPlans = async () => {
    try {
      const response = await fetch("/api/paypal/create-plans", {
        method: "POST",
      });
      const data = await response.json();
      
      if (data.success) {
        setPlanIds({
          monthly: data.monthly,
          yearly: data.yearly,
        });
      }
    } catch (error) {
      console.error("Error initializing PayPal plans:", error);
      toast({
        title: "Error",
        description: "Failed to initialize payment options. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const renderPayPalButtons = () => {
    if (!window.paypal || !planIds) return;

    const currentPlanId = billingCycle === "monthly" ? planIds.monthly : planIds.yearly;
    const containerRef = billingCycle === "monthly" ? paypalMonthlyRef : paypalYearlyRef;

    if (!containerRef.current) return;

    // Clear existing buttons
    containerRef.current.innerHTML = "";

    window.paypal.Buttons({
      style: {
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "subscribe",
      },
      createSubscription: (data, actions) => {
        return actions.subscription.create({
          plan_id: currentPlanId,
        });
      },
      onApprove: async (data) => {
        setIsProcessing(true);
        
        try {
          if (!user) {
            throw new Error("User not found");
          }

          const response = await fetch("/api/paypal/activate-subscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              subscriptionId: data.subscriptionID,
              planType: billingCycle,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to activate subscription");
          }

          toast({
            title: "Welcome to Bloom Pro! 🌸",
            description: "Your subscription is now active. Enjoy unlimited analysis!",
          });

          setTimeout(() => {
            router.push("/home");
          }, 2000);
        } catch (error) {
          console.error("Error activating subscription:", error);
          toast({
            title: "Subscription Error",
            description: "There was an issue activating your subscription. Please contact support.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        toast({
          title: "Payment Error",
          description: "There was an issue processing your payment. Please try again.",
          variant: "destructive",
        });
      },
    }).render(billingCycle === "monthly" ? "#paypal-monthly-button" : "#paypal-yearly-button");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  const freeFeatures = [
    "3 picks per week",
    "Basic market summary",
    "Broker directory",
    "Educational content",
  ];

  const proFeatures = [
    "Unlimited daily picks",
    "Dahlia's full analysis on every pick",
    "Stocks, ETFs, and Mutual Funds",
    "Real-time news and charts",
    "Portfolio tracker",
    "Exclusive broker deals",
    "Priority support",
  ];

  return (
    <Layout>
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground">
            Unlock unlimited analysis with Bloom Pro
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant={billingCycle === "monthly" ? "default" : "outline"}
            onClick={() => setBillingCycle("monthly")}
            className={billingCycle === "monthly" ? "bg-primary" : ""}
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === "yearly" ? "default" : "outline"}
            onClick={() => setBillingCycle("yearly")}
            className={billingCycle === "yearly" ? "bg-primary" : ""}
          >
            Yearly
          </Button>
          {billingCycle === "yearly" && (
            <Badge className="bg-accent text-accent-foreground">
              Save 40%
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Free
              </h2>
              <p className="text-3xl font-bold text-foreground">$0</p>
            </div>

            <div className="space-y-2">
              {freeFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{feature}</p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full"
              disabled={user?.plan_type === "free"}
            >
              {user?.plan_type === "free" ? "Current Plan" : "Downgrade to Free"}
            </Button>
          </Card>

          <Card className="p-6 space-y-4 border-accent border-2 relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
              Most Popular
            </Badge>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Bloom Pro
              </h2>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground">
                  {billingCycle === "monthly"
                    ? formatPrice(7.99)
                    : formatPrice(57.99)}
                </p>
                <span className="text-muted-foreground">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              {billingCycle === "yearly" && (
                <p className="text-sm text-accent font-semibold">
                  {formatPrice(4.83)}/month when billed annually
                </p>
              )}
            </div>

            <div className="space-y-2">
              {proFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <p className="text-sm text-foreground">{feature}</p>
                </div>
              ))}
            </div>

            {user?.plan_type === "pro" ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <div className="space-y-3">
                {isProcessing ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    <p className="ml-3 text-muted-foreground">
                      Processing your subscription...
                    </p>
                  </div>
                ) : (
                  <div
                    id={billingCycle === "monthly" ? "paypal-monthly-button" : "paypal-yearly-button"}
                    ref={billingCycle === "monthly" ? paypalMonthlyRef : paypalYearlyRef}
                  />
                )}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-4 bg-muted">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            By subscribing, you agree to our Terms of Service. Cancel anytime from
            your account settings.
          </p>
        </Card>
      </div>
    </Layout>
  );
}