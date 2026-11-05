import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { BloomMark } from "@/components/brand/BloomMark";
import { RiskNote } from "@/components/RiskNote";
import { SignUpBanner } from "./SignUpBanner";
import { AppShell } from "./AppShell";

const PUBLIC_PAGES = ["/", "/about", "/privacy", "/terms", "/disclaimer", "/refund-policy", "/contact", "/delete-account"];

export function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { isLoggedIn, isLoading } = useSubscription();

  useEffect(() => {
    const handleRateLimit = () => {
      toast({
        title: "Just a moment",
        description: "Prices are busy right now. Please try again shortly.",
      });
    };

    window.addEventListener("fmp-rate-limit", handleRateLimit);
    return () => window.removeEventListener("fmp-rate-limit", handleRateLimit);
  }, [toast]);

  if (!PUBLIC_PAGES.includes(router.pathname)) {
    return (
      <>
        <AppShell>
          {!isLoading && !isLoggedIn && <SignUpBanner />}
          {children}
        </AppShell>
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4">
          <Link href="/" className="flex items-center gap-2">
            <BloomMark size={32} />
            <span className="font-serif text-xl font-semibold text-foreground">Bloom</span>
          </Link>
          <div className="ml-auto">
            {!isLoading && (
              <Link
                href={isLoggedIn ? "/home" : "/onboarding"}
                className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
              >
                {isLoggedIn ? "Open Bloom" : "Start free"}
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="w-full flex-1">{children}</main>
      <RiskNote variant="footer" />
      <Toaster />
    </div>
  );
}
