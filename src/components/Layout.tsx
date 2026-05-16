import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Home, Search, Target, Briefcase, Building2, User, GraduationCap } from "lucide-react";
import { PansyPopup } from "./DahliaPopup";
import { PansyPsychologyToast } from "./DahliaPsychologyToast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/discover", icon: Search, label: "Discover" },
    { href: "/learn", icon: GraduationCap, label: "Learn" },
    { href: "/goals", icon: Target, label: "Goals" },
    { href: "/portfolio", icon: Briefcase, label: "Portfolio" },
    { href: "/brokers", icon: Building2, label: "Brokers" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-full flex h-16 items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <img
              src="/bloom-logo.png"
              alt="Bloom"
              className="h-8 w-auto"
            />
            <span className="font-serif text-xl font-bold text-foreground">
              Bloom
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-4">{children}</main>

      {/* Pansy Popup */}
      <PansyPopup />

      {/* Pansy Psychology Toast */}
      <PansyPsychologyToast />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="flex items-center justify-around h-16 overflow-x-auto hide-scrollbar px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 min-w-[64px] px-2 py-2 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 ${active ? "fill-current" : ""}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
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
              Bloom is for educational purposes only and does not constitute financial advice. All investing involves risk of loss. Some broker links may be affiliate partnerships where Bloom earns a commission.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}