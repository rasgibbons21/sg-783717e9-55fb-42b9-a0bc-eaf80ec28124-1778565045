import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useGooglePlayBilling } from "@/hooks/useGooglePlayBilling";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function GooglePlaySubscription() {
  const router = useRouter();
  const { isPro, refresh } = useSubscription();
  const {
    state,
    error,
    monthlyOffer,
    yearlyOffer,
    purchase,
    restorePurchases,
    manageSubscriptionUrl,
    hasFreeTrial,
  } = useGooglePlayBilling();

  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    const info: Record<string, string> = {
      "App Version": "v31 (1.0.30)",
      "Build": "2026-08-26",
      "API exists": String("getDigitalGoodsService" in window),
      "PaymentRequest": String("PaymentRequest" in window),
      "Standalone": String(
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      ),
      "TWA referrer": String(document.referrer.includes("android-app://")),
      "Referrer": document.referrer || "(empty)",
      "Billing state": state,
      "Chrome": navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0] || "unknown",
    };
    if (error) info["Error"] = error;
    setDebugInfo(info);
  }, [state, error]);

  if (state === "success") {
    refresh();
    return (
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="text-center space-y-4 py-12">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Welcome to Bloom Pro!
          </h1>
          <p className="text-muted-foreground">
            Your subscription is active. Enjoy unlimited access.
          </p>
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => router.push("/home")}
          >
            Start Exploring
          </Button>
        </div>
      </div>
    );
  }

  if (isPro) {
    return (
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            You&apos;re a Bloom Pro member
          </h1>
          <p className="text-muted-foreground">
            You have full access to all premium features.
          </p>
          <a
            href={manageSubscriptionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Manage Subscription <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  const isLoading =
    state === "loading" || state === "purchasing" || state === "verifying";

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Bloom Premium
        </h1>
        <p className="text-muted-foreground">
          Unlock everything Bloom has to offer
        </p>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {state === "pending" && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/30 flex items-start gap-3">
          <Loader2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-spin" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Purchase pending
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your purchase is being processed. This may take a few minutes.
              Your access will be granted once the payment is confirmed.
            </p>
          </div>
        </Card>
      )}

      {state === "unavailable" && (
        <Card className="p-4 bg-muted border-border flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Google Play Billing is not available. Please make sure you&apos;re
            using the Bloom app from the Google Play Store.
          </p>
        </Card>
      )}

      {/* Features */}
      <Card className="p-5 border-accent/20 bg-accent/5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
          Everything in Pro
        </h3>
        <ul className="space-y-2.5">
          {[
            "Unlimited daily stock & ETF analyses",
            "Pansy AI — ask anything, anytime",
            "Full lesson library including income strategies",
            "Portfolio tracker & investing journal",
            "Practice Trader simulator",
            "Progress tracking & achievements",
          ].map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Plan cards */}
      {(monthlyOffer || yearlyOffer) && (
        <div className="space-y-3">
          {monthlyOffer && (
            <Card
              className={`p-5 border transition-all cursor-pointer ${
                !yearlyOffer ? "border-accent" : "border-border hover:border-accent/50"
              }`}
              onClick={() => !isLoading && purchase(monthlyOffer)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Monthly</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {monthlyOffer.price?.replace(/(\.\d{2})\d*/, "$1") || monthlyOffer.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Billed monthly
                  </p>
                </div>
              </div>
            </Card>
          )}

          {yearlyOffer && (
            <Card
              className="p-5 border-accent border-2 relative transition-all cursor-pointer hover:shadow-md hover:shadow-accent/10"
              onClick={() => !isLoading && purchase(yearlyOffer)}
            >
              <Badge className="absolute -top-2.5 right-4 bg-accent text-accent-foreground text-[10px] px-2 py-0.5 gap-1">
                <Sparkles className="w-3 h-3" /> Best value
              </Badge>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Yearly</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {yearlyOffer.price?.replace(/(\.\d{2})\d*/, "$1") || yearlyOffer.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /year
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Billed yearly
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Loading state */}
      {state === "loading" && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="w-5 h-5 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">
            Loading plans from Google Play…
          </p>
        </div>
      )}

      {/* Purchase button */}
      {(monthlyOffer || yearlyOffer) && (
        <div className="space-y-3">
          {state === "purchasing" && (
            <div className="flex items-center justify-center gap-2 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground">
                Completing purchase…
              </p>
            </div>
          )}

          {state === "verifying" && (
            <div className="flex items-center justify-center gap-2 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground">
                Verifying purchase…
              </p>
            </div>
          )}
        </div>
      )}

      {/* Restore + Manage */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          disabled={isLoading}
          onClick={restorePurchases}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Restore Purchases
        </Button>

        <a
          href={manageSubscriptionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          Manage Subscription <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Recurring billing disclosure */}
      <Card className="p-4 bg-muted/50 border-border">
        <p className="text-xs text-center text-muted-foreground leading-relaxed">
          Your subscription will automatically renew at the end of each billing
          period unless cancelled at least 24 hours before the renewal date. You
          can manage or cancel your subscription in your Google Play Store
          account settings.
        </p>
      </Card>

      {/* Legal links */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <a
          href="https://shebloomswealth.app/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Terms of Service
        </a>
        <span>·</span>
        <a
          href="https://shebloomswealth.app/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Privacy Policy
        </a>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-center text-muted-foreground/60 leading-relaxed">
        Educational content only. Not financial advice. Bloom is not liable for
        any investment decisions or losses.
      </p>

      {/* Debug panel — tap version to toggle */}
      <p
        className="text-[10px] text-center text-muted-foreground/40 cursor-pointer"
        onClick={() => setShowDebug((v) => !v)}
      >
        v31 (1.0.30)
      </p>
      {showDebug && (
        <Card className="p-3 bg-muted/50 border-border text-[10px] font-mono space-y-0.5">
          {Object.entries(debugInfo).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <span className="text-muted-foreground">{k}:</span>
              <span className="text-foreground text-right break-all">{v}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
