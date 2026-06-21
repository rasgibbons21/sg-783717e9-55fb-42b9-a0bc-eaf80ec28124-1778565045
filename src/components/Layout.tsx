import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Home, Search, Target, Briefcase, Building2, User, GraduationCap, PieChart } from "lucide-react";
import { PansyPopup } from "./PansyPopup";
import { PansyPsychologyToast } from "./PansyPsychologyToast";
import { SignUpBanner } from "./SignUpBanner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const currentPath = router.pathname;
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setIsCheckingAuth(false);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActivePath = (path: string) => {
    if (path === "/home") return currentPath === "/home";
    if (path === "/discover") return currentPath.startsWith("/discover") || currentPath.startsWith("/stock");
    if (path === "/portfolio") return currentPath.startsWith("/portfolio");
    if (path === "/learn") return currentPath === "/learn";
    if (path === "/brokers") return currentPath === "/brokers";
    if (path === "/profile") return currentPath.startsWith("/profile") || currentPath.startsWith("/subscription");
    return false;
  };

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/discover", icon: Search, label: "Discover" },
    { href: "/learn", icon: GraduationCap, label: "Learn" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/portfolio", icon: Briefcase, label: "Portfolio" },
    { href: "/brokers", icon: Building2, label: "Brokers" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => isActivePath(path);

  useEffect(() => {
    const handleRateLimit = () => {
      toast({
        title: "API Limit Reached 🐢",
        description: "We've hit the Financial Modeling Prep free tier limit. Please wait a moment before fetching more data.",
        variant: "destructive",
      });
    };

    window.addEventListener("fmp-rate-limit", handleRateLimit);
    return () => window.removeEventListener("fmp-rate-limit", handleRateLimit);
  }, [toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-[80px]">
      {/* Sign-Up Banner for Logged-Out Users */}
      {!isCheckingAuth && !isLoggedIn && <SignUpBanner />}

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-full flex h-16 items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt="Bloom"
              className="h-8 w-auto rounded-md"
            />
            <span className="font-serif text-xl font-bold text-foreground">
              Bloom
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content - add top padding when banner is showing */}
      <main className={cn("flex-1 w-full", !isCheckingAuth && !isLoggedIn && "pt-[60px]")}>{children}</main>

      {/* Pansy Popup */}
      <PansyPopup />

      {/* Pansy Psychology Toast */}
      <PansyPsychologyToast />

      {/* Global Toaster for Rate Limits */}
      <Toaster />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 safe-area-bottom">
        <div className="grid grid-cols-6 gap-1 px-2 py-2 max-w-2xl mx-auto">
          <Link href="/home" passHref>
            <button className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActivePath("/home") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}>
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </button>
          </Link>

          <Link href="/discover" passHref>
            <button className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActivePath("/discover") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}>
              <Search className="w-5 h-5" />
              <span className="text-xs">Discover</span>
            </button>
          </Link>

          <Link href="/portfolio" passHref>
            <button className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActivePath("/portfolio") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}>
              <PieChart className="w-5 h-5" />
              <span className="text-xs">Portfolio</span>
            </button>
          </Link>

          <Link href="/learn" passHref>
            <button className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActivePath("/learn") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}>
              <GraduationCap className="w-5 h-5" />
              <span className="text-xs">Learn</span>
            </button>
          </Link>

          <Link href="/brokers" passHref>
            <button className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActivePath("/brokers") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}>
              <Building2 className="w-5 h-5" />
              <span className="text-xs">Brokers</span>
            </button>
          </Link>

          <Link href="/profile" passHref>
            <button className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
              isActivePath("/profile") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}>
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-background py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="mb-4 font-serif text-lg font-semibold text-primary">Bloom</h3>
              <p className="text-sm text-muted-foreground">
                Invest in yourself first 🌸
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="text-muted-foreground hover:text-primary">
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-foreground">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a href="mailto:admin@vanguardapexholdings.com" className="text-muted-foreground hover:text-primary">
                    support@vanguardapexholdings.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8">
            <p className="text-xs text-muted-foreground">
              © 2026 Cinder Vault Enterprises LLC. All rights reserved. Bloom is a product of Cinder Vault Enterprises LLC.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Bloom is for educational purposes only and does not constitute financial advice. All investing involves risk of loss.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}