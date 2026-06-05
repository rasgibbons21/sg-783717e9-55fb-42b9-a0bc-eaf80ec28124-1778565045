import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, X } from "lucide-react";
import { useRouter } from "next/router";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: "view_limit" | "after_analysis" | "discover" | "portfolio" | "goals";
}

export function UpgradeModal({ isOpen, onClose, trigger = "view_limit" }: UpgradeModalProps) {
  const router = useRouter();

  const getTriggerMessage = () => {
    switch (trigger) {
      case "view_limit":
        return "You've used your free previews for today 🌸";
      case "after_analysis":
        return "Loved Pansy's take?";
      case "discover":
        return "Want Pansy's full breakdown on this?";
      case "portfolio":
        return "Track unlimited positions with Bloom Pro";
      case "goals":
        return "Set unlimited goals with Bloom Pro";
      default:
        return "Ready to unlock everything?";
    }
  };

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
            {getTriggerMessage()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Upgrade to Bloom Pro for unlimited Pansy analysis, real-time insights, and exclusive features.
          </p>

          <Card className="p-4 border-accent/20 bg-accent/5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-serif text-lg font-semibold text-foreground">Bloom Pro</h4>
                <Badge className="bg-accent text-accent-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />
                  $7.99/mo
                </Badge>
              </div>
              <ul className="space-y-2">
                {[
                  "Unlimited daily picks from Pansy",
                  "Full analysis on every stock & ETF",
                  "Real-time news and charts",
                  "Portfolio tracker",
                  "Exclusive broker deals",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => router.push("/subscription")}
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function UpgradeBanner({ message, className = "" }: { message: string; className?: string }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

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

export function useViewTracker(isPro: boolean = false) {
  const [viewCount, setViewCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    // Pro users never count views
    if (isPro) {
      setViewCount(0);
      return;
    }

    const count = parseInt(localStorage.getItem("bloom-daily-views") || "0");
    const lastReset = localStorage.getItem("bloom-views-reset");
    const today = new Date().toDateString();

    if (lastReset !== today) {
      localStorage.setItem("bloom-daily-views", "0");
      localStorage.setItem("bloom-views-reset", today);
      setViewCount(0);
    } else {
      setViewCount(count);
    }
  }, [isPro]);

  const trackView = () => {
    // Pro users: skip counting entirely
    if (isPro) {
      return;
    }

    const newCount = viewCount + 1;
    setViewCount(newCount);
    localStorage.setItem("bloom-daily-views", newCount.toString());

    if (newCount >= 3) {
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