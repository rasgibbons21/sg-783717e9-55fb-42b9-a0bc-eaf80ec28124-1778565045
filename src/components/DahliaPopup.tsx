import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface DahliaPopupProps {
  type?: "first-visit" | "returning" | "market-tip";
  userName?: string;
  marketTip?: string;
}

export function DahliaPopup({ type = "first-visit", userName, marketTip }: DahliaPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const sessionKey = `dahlia-popup-${type}`;
    const wasDismissed = sessionStorage.getItem(sessionKey);
    
    if (!wasDismissed) {
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      setIsDismissed(true);
    }
  }, [type]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem(`dahlia-popup-${type}`, "true");
  };

  if (isDismissed || !isVisible) return null;

  const getMessage = () => {
    switch (type) {
      case "first-visit":
        return "Hi I'm Dahlia — I know everything about investing and I'm going to make it make sense for you 🌺";
      case "returning":
        return `Welcome back ${userName || "there"} 🌸 I've been watching the market and I've got some picks ready for you.`;
      case "market-tip":
        return marketTip || "Something interesting is happening in the market today 💛";
    }
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`bg-card rounded-2xl shadow-lg max-w-md mx-auto p-4 ${
          type === "market-tip" ? "border-2 border-accent" : "border border-border"
        }`}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-amber-400 flex items-center justify-center text-2xl flex-shrink-0">
            🌺
          </div>
          <div className="flex-1 pr-8">
            <p className="font-serif text-lg font-medium text-foreground mb-1">
              Dahlia
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Bloom's Investing Expert
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {getMessage()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}