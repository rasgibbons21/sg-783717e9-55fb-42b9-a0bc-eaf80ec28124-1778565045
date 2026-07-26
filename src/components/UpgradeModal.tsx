import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, X, Lock } from "lucide-react";
import { useRouter } from "next/router";
import { PRO_PLAN } from "@/config/proPlan";
import { usePaymentProvider } from "@/lib/payments";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: "view_limit" | "after_analysis" | "discover" | "portfolio" | "goals";
}

export function UpgradeModal({ isOpen, onClose, trigger = "view_limit" }: UpgradeModalProps) {
  const router = useRouter();
  const { canShowExternalPayment, canShowInAppPayment } = usePaymentProvider();

  if (canShowInAppPayment) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-background border-accent">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl">
                🌺
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <DialogTitle className="font-serif text-2xl text-foreground mt-4">
              Unlock Bloom Pro
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Get unlimited analyses, full lessons, and more with Bloom Pro.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe later
            </Button>
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => router.push("/subscription")}
            >
              View Plans
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!canShowExternalPayment) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <DialogTitle className="font-serif text-2xl text-foreground mt-4">
              Not available in this version
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This feature requires Bloom Pro. Subscriptions are not available in this version of the app.
          </p>
          <Button variant="outline" onClick={onClose} className="w-full">
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background border-accent">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-2xl">
              🌺
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogTitle className="font-serif text-2xl text-foreground mt-4">
            Go from learning to building it.
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            You&apos;ve got the foundation. Pro is where you put it to work.
          </p>

          <Card className="p-4 border-accent/20 bg-accent/5">
            <div className="space-y-3">
              <h4 className="font-serif text-lg font-semibold text-foreground">Bloom Pro</h4>
              <ul className="space-y-2">
                {[
                  "Save your portfolio — your holdings and progress, there every time you come back.",
                  "Unlock every locked lesson — the income-stream playbooks (real estate, digital products, affiliate, REITs, LLC, cash-flow business) plus the full trading-psychology system.",
                  "Unlimited analysis — research any stock or ETF, as often as you want.",
                  "Pansy, unlimited — ask your guide anything, anytime, with no daily limit (free is capped).",
                  "Your whole journey, tracked — completed lessons, saved analyses, progress over time.",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Monthly</p>
              <p className="font-serif text-xl font-semibold text-foreground">${PRO_PLAN.monthlyPrice}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            </div>
            <div className="relative rounded-lg border border-accent p-3 text-center bg-accent/5">
              <Badge className="absolute -top-2 right-2 bg-accent text-accent-foreground text-[10px] px-1.5 py-0.5">
                <Sparkles className="w-3 h-3 mr-1" />
                {PRO_PLAN.yearlySavingsLabel}
              </Badge>
              <p className="text-xs text-muted-foreground">Yearly</p>
              <p className="font-serif text-xl font-semibold text-foreground">${PRO_PLAN.yearlyPrice}<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (trigger === "view_limit") {
                  localStorage.setItem("bloom-upgrade-dismissed", new Date().toDateString());
                }
                onClose();
              }}
              className="flex-1"
            >
              Maybe later
            </Button>
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => router.push("/subscription")}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UpgradeBanner({ message, className = "" }: { message: string; className?: string }) {
  const router = useRouter();
  const { canShowExternalPayment, canShowInAppPayment } = usePaymentProvider();
  const [isVisible, setIsVisible] = useState(true);

  if ((!canShowExternalPayment && !canShowInAppPayment) || !isVisible) return null;

  return (
    <Card className={`p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm shrink-0">
            🌺
          </div>
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="h-8 px-2"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/90 text-accent-foreground h-8 px-4"
            onClick={() => router.push("/subscription")}
          >
            Upgrade 🌸
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function useViewTracker() {
  const [viewCount, setViewCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const count = parseInt(localStorage.getItem("bloom-daily-views") || "0");
    const lastReset = localStorage.getItem("bloom-views-reset");
    const today = new Date().toDateString();

    if (lastReset !== today) {
      localStorage.setItem("bloom-daily-views", "0");
      localStorage.setItem("bloom-views-reset", today);
      localStorage.removeItem("bloom-upgrade-dismissed");
      setViewCount(0);
    } else {
      setViewCount(count);
    }
  }, []);

  const { canShowExternalPayment: canShowStripe, canShowInAppPayment: canShowGP } = usePaymentProvider();

  const trackView = () => {
    if (!canShowStripe && !canShowGP) return;

    const newCount = viewCount + 1;
    setViewCount(newCount);
    localStorage.setItem("bloom-daily-views", newCount.toString());

    const dismissedToday = localStorage.getItem("bloom-upgrade-dismissed") === new Date().toDateString();
    if (newCount >= 3 && !dismissedToday) {
      setShowUpgradeModal(true);
    }
  };

  return {
    viewCount,
    trackView,
    showUpgradeModal,
    setShowUpgradeModal,
  };
}
