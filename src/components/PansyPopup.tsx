import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface PansyPopupProps {
  type?: "first-visit" | "returning" | "market-tip";
  userName?: string;
  marketTip?: string;
}

export function PansyPopup({ type = "first-visit", userName, marketTip }: PansyPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if popup has been shown this session
    const sessionKey = `pansy-popup-${type}`;
    const hasShown = sessionStorage.getItem(sessionKey);

    if (!hasShown) {
      setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }
  }, [type]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(`pansy-popup-${type}`, "true");
  };

  if (!isVisible) return null;

  const getMessage = () => {
    switch (type) {
      case "first-visit":
        return "Hi I'm Pansy — I'm here to help investing make sense, one plain-language step at a time 🌺";
      case "returning":
        return `Welcome back ${userName} 🌸 Ready to keep learning, or want a quick analysis on a stock you're curious about?`;
      case "market-tip":
        return marketTip || "Market tip coming soon!";
      default:
        return "";
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 w-80 animate-in slide-in-from-bottom">
      <div className="rounded-2xl border border-accent bg-gradient-to-br from-background to-accent/10 p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-2xl shadow-md">
            🌺
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  Pansy
                </p>
                <p className="text-xs text-muted-foreground">
                  Bloom's Investing Expert
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm leading-relaxed text-foreground">
              {getMessage()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}