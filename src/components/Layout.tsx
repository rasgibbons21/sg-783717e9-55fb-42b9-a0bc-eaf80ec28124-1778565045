import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { FoundersPricingModal } from "./FoundersPricingModal";
import { SignUpBanner } from "./SignUpBanner";
import { AppShell } from "./AppShell";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const currentPath = router.pathname;
  const { isLoggedIn, isLoading } = useSubscription();

  useEffect(() => {
    const handleRateLimit = () => {
      toast({
        title: "API Limit Reached",
        description: "Rate limit hit. Please wait a moment before fetching more data.",
        variant: "destructive",
      });
    };

    window.addEventListener("fmp-rate-limit", handleRateLimit);
    return () => window.removeEventListener("fmp-rate-limit", handleRateLimit);
  }, [toast]);

  const publicPages = ["/", "/about", "/privacy", "/terms", "/disclaimer", "/refund-policy", "/contact", "/delete-account"];
  const isPublic = publicPages.includes(currentPath);

  if (!isPublic && !isLoading) {
    return (
      <>
        <AppShell>
          {!isLoggedIn && <SignUpBanner />}
          {children}
        </AppShell>
        <Toaster />
        <FoundersPricingModal />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--r-bg)" }}>
      {!isLoading && !isLoggedIn && <SignUpBanner />}

      <header
        className="sticky top-0 z-50 w-full"
        style={{ background: "var(--r-elevated)", borderBottom: "1px solid var(--r-hairline)" }}
      >
        <div className="flex items-center h-14 px-4">
          <Link href="/home" className="flex items-center gap-3">
            <img src="/icon-192.png" alt="She Blooms Wealth" className="h-8 w-auto rounded-md" />
            <span className="text-xl font-bold" style={{ color: "var(--r-ivory)" }}>Radar</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full">{children}</main>

      <footer className="mt-auto py-8" style={{ borderTop: "1px solid var(--r-hairline)" }}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--r-teal)" }}>Radar</h3>
              <p className="text-sm" style={{ color: "var(--r-meta)" }}>Stock screener & alerts</p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold" style={{ color: "var(--r-ivory)" }}>Legal</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/terms", label: "Terms of Service" },
                  { href: "/disclaimer", label: "Disclaimer" },
                  { href: "/refund-policy", label: "Refund Policy" },
                  { href: "/delete-account", label: "Delete Account" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="hover:underline" style={{ color: "var(--r-meta)" }}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold" style={{ color: "var(--r-ivory)" }}>Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="hover:underline" style={{ color: "var(--r-meta)" }}>Contact Us</Link></li>
                <li><a href="mailto:cindervaultenterprisesllc@gmail.com" className="hover:underline" style={{ color: "var(--r-meta)" }}>cindervaultenterprisesllc@gmail.com</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8" style={{ borderTop: "1px solid var(--r-hairline)" }}>
            <p className="text-xs" style={{ color: "var(--r-meta)" }}>
              &copy; 2026 Cinder Vault Enterprises LLC. All rights reserved. She Blooms Wealth is a product of Cinder Vault Enterprises LLC.
            </p>
            <p className="mt-2 text-xs" style={{ color: "var(--r-meta)" }}>
              She Blooms Wealth is for educational purposes only and does not constitute financial advice. All investing involves risk of loss.
            </p>
          </div>
        </div>
      </footer>

      <Toaster />
      <FoundersPricingModal />
    </div>
  );
}