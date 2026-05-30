import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Check, Loader2, Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function SubscriptionOffer() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

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
  }, [router]);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const priceId = isYearly 
        ? process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID 
        : process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;

      if (!priceId) {
        throw new Error("Subscription pricing is not configured correctly.");
      }

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          userId: user?.id,
          email: user?.email
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create checkout session");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      setIsProcessing(false);
    }
  };

  const monthlyPrice = 7.99;
  const yearlyPrice = 57.99;
  const yearlyMonthly = (yearlyPrice / 12).toFixed(2);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SEO title="Unlock Everything - Bloom" description="Get unlimited access to Pansy's investing insights" />
      
      <div className="max-w-2xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-4xl mx-auto shadow-xl">
            🌺
          </div>
          <h1 className="font-serif text-5xl font-bold text-foreground">
            You're all set!
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Want to unlock everything Pansy has to offer? Get unlimited daily picks and full analysis.
          </p>
        </div>

        {/* Plan Toggle */}
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

        {/* Pro Plan Card */}
        <Card className="p-8 border-accent border-2 bg-gradient-to-br from-accent/5 to-background">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-serif text-2xl font-bold text-foreground">Bloom Pro</h3>
                  <Badge className="bg-accent text-accent-foreground">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
                {isYearly ? (
                  <>
                    <p className="text-3xl font-bold text-foreground">${yearlyMonthly}/mo</p>
                    <p className="text-sm text-muted-foreground">Billed ${yearlyPrice}/year</p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-foreground">${monthlyPrice}/mo</p>
                )}
              </div>
            </div>

            <ul className="space-y-3">
              {[
                "Unlimited daily picks from Pansy",
                "Full analysis on every stock & ETF",
                "Real-time news and charts",
                "Portfolio tracker",
                "Exclusive broker deals",
                "Priority support",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-base text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-14 text-lg" 
              onClick={handleSubscribe}
              disabled={isProcessing || !user}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Redirecting to checkout...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Unlock Bloom Pro
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure checkout powered by Stripe • Cancel anytime
            </p>
          </div>
        </Card>

        {/* Skip Link */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/home")}
            className="text-muted-foreground hover:text-foreground"
          >
            Start with Free →
          </Button>
        </div>
      </div>
    </div>
  );
}