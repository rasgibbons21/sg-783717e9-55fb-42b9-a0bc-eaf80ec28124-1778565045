import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SignUpBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem("bloom-signup-banner-dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("bloom-signup-banner-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-accent/20 to-primary/20 border-b border-accent/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-foreground flex-1">
            Create a free account to unlock Pansy's full analysis, save your watchlist, and track your goals.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/">
              <Button 
                size="sm"
                className="bg-accent hover:bg-accent/90 text-white font-semibold shadow-md"
              >
                Sign up free
              </Button>
            </Link>
            <button
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}