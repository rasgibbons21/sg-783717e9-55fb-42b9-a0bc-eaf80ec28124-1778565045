import { ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ChevronLeft, LayoutDashboard, Wallet, Lightbulb,
  TrendingUp, Wrench, Menu, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { AdMobBanner } from "@/components/AdMobBanner";
import { Toaster } from "@/components/ui/toaster";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const NAV_ITEMS = [
  { href: "/academy/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/academy/budget", icon: Wallet, label: "Budget" },
  { href: "/academy/hustle", icon: Lightbulb, label: "Hustle" },
  { href: "/academy/trade", icon: TrendingUp, label: "Trade" },
  { href: "/academy/tools", icon: Wrench, label: "Tools" },
];

interface AcademyLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

export function AcademyLayout({ children, title, showBack }: AcademyLayoutProps) {
  const router = useRouter();
  const { isLoggedIn, isPro } = useSubscription();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentPath = router.pathname;

  const isActive = (href: string) => {
    if (href === "/academy/dashboard") return currentPath === "/academy/dashboard";
    return currentPath.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-[72px] md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            {showBack && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => { haptic(); router.back(); }}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </motion.button>
            )}
            <Link href="/academy" className="flex items-center gap-2">
              <img src="/icon-192.png" alt="Bloom" className="h-7 w-auto rounded-md" />
              <span className="font-serif text-lg font-bold text-foreground">
                Bloom <span className="text-[#27B7C8]">Academy</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    isActive(href)
                      ? "bg-[#27B7C8]/15 text-[#27B7C8]"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <Link
              href="/home"
              className="text-xs text-muted-foreground hover:text-primary transition-colors hidden md:block"
            >
              Main App
            </Link>

            {!isLoggedIn && (
              <Link
                href="/onboarding"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
              >
                Sign Up
              </Link>
            )}

            {/* Mobile menu toggle */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => { haptic(); setMobileMenuOpen(!mobileMenuOpen); }}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border bg-card"
            >
              <div className="p-3 space-y-1">
                <Link
                  href="/home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent/10"
                >
                  Back to Main App
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Ad banner below header for free users */}
      <AdMobBanner format="banner" />

      {/* Desktop sidebar + content */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border p-4 gap-1 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-[#27B7C8]/15 text-[#27B7C8]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                <Icon className={cn("w-4 h-4", active && "drop-shadow-[0_0_6px_rgba(39,183,200,0.5)]")} />
                {label}
              </Link>
            );
          })}

          <div className="mt-auto pt-4 border-t border-border">
            {!isPro && (
              <Link
                href="/subscription"
                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-center bg-gradient-to-r from-primary to-[#27B7C8] text-white hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {title && (
            <div className="px-4 py-4 border-b border-border">
              <h1 className="text-xl font-serif font-bold text-foreground">{title}</h1>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mid-page ad slot */}
      <AdMobBanner format="rectangle" />

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h3 className="mb-3 font-serif text-lg font-semibold text-[#27B7C8]">Bloom Academy</h3>
              <p className="text-sm text-muted-foreground">
                Your complete financial education platform. Budget smarter, hustle harder, trade confidently.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Sections</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/academy/budget" className="text-muted-foreground hover:text-primary">Budget</Link></li>
                <li><Link href="/academy/hustle" className="text-muted-foreground hover:text-primary">Side Hustle</Link></li>
                <li><Link href="/academy/trade" className="text-muted-foreground hover:text-primary">Learn to Trade</Link></li>
                <li><Link href="/academy/tools" className="text-muted-foreground hover:text-primary">AI Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/disclaimer" className="text-muted-foreground hover:text-primary">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 Cinder Vault Enterprises LLC. All rights reserved. Bloom Academy is for educational purposes only.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2 max-w-md mx-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}>
                <motion.button
                  whileTap={{ scale: 0.75, y: 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  onClick={() => haptic()}
                  className={cn(
                    "flex flex-col items-center gap-1 px-2 py-1 rounded-lg w-full relative",
                    active ? "text-[#27B7C8]" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="academy-nav-indicator"
                      className="absolute -top-1 w-6 h-1 rounded-full bg-[#27B7C8]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={active ? { scale: [1, 1.3, 1], y: [0, -3, 0] } : {}}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Icon className={cn("w-5 h-5", active && "drop-shadow-[0_0_6px_rgba(39,183,200,0.5)]")} />
                  </motion.div>
                  <span className={cn("text-xs", active && "font-semibold")}>{label}</span>
                </motion.button>
              </Link>
            );
          })}
        </div>
      </nav>

      <Toaster />
    </div>
  );
}
