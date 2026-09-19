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
    <div
      className="sticky top-14 left-0 right-0 z-40 px-4 py-2.5"
      style={{ background: "var(--r-elevated)", borderBottom: "1px solid var(--r-hairline)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs flex-1" style={{ color: "var(--r-body)" }}>
          Create a free account to unlock Pansy's full analysis, save your watchlist, and track your goals.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/">
            <Button
              size="sm"
              className="h-8 px-3 text-xs font-semibold rounded-lg"
              style={{ background: "var(--r-teal)", color: "var(--r-bg)" }}
            >
              Sign up free
            </Button>
          </Link>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ color: "var(--r-meta)" }}
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}