import { ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Home,
  Radar,
  Zap,
  BarChart3,
  Newspaper,
  Briefcase,
  MoreHorizontal,
  Search,
  Bookmark,
  ChevronLeft,
  Mic,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const haptic = (ms = 8) => {
  try { navigator?.vibrate?.(ms); } catch {}
};

const PANSY_PROMPTS = [
  "What's moving today?",
  "Scan for gap-ups...",
  "Any setups near VWAP?",
  "Show me high volume...",
  "Find red-to-green plays...",
];

const NAV_ITEMS: ReadonlyArray<{
  href: string;
  icon: typeof Home;
  label: string;
}> = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/scanner", icon: Radar, label: "Scanner" },
  { href: "/signals", icon: Zap, label: "Signals" },
  { href: "/discover", icon: BarChart3, label: "Charts" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/portfolio", icon: Briefcase, label: "Portfolio" },
  { href: "/more", icon: MoreHorizontal, label: "More" },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const path = router.pathname;

  const isActive = (href: string) => {
    if (href === "/home") return path === "/home";
    if (href === "/scanner") return path === "/scanner" || path.startsWith("/scanner/");
    if (href === "/signals") return path === "/signals";
    if (href === "/discover") return path === "/discover" || path.startsWith("/stock/");
    if (href === "/news") return path === "/news";
    if (href === "/portfolio") return path === "/portfolio" || path === "/goals";
    if (href === "/more") return path === "/more";
    return false;
  };

  const mainPaths = ["/home", "/scanner", "/signals", "/discover", "/news", "/portfolio", "/more", "/profile", "/onboarding"];
  const isInner = !mainPaths.some(p => path === p || path.startsWith(p + "/"));

  const promptIdx = typeof window !== "undefined"
    ? Math.floor(Date.now() / 8000) % PANSY_PROMPTS.length
    : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--r-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{ background: "var(--r-elevated)", borderBottom: "1px solid var(--r-hairline)" }}
      >
        <div className="flex items-center gap-3 h-14 px-4">
          {isInner ? (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => { haptic(); router.back(); }}
              className="flex items-center justify-center w-9 h-9 -ml-1 rounded-full"
              style={{ background: "var(--r-card)" }}
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: "var(--r-ivory)" }} />
            </motion.button>
          ) : (
            <Link href="/profile" className="flex-shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ background: "var(--r-card)", color: "var(--r-teal)" }}
              >
                R
              </div>
            </Link>
          )}

          {/* Search pill */}
          <Link
            href="/discover"
            className="flex-1 flex items-center gap-2 h-9 px-3 rounded-full"
            style={{ background: "var(--r-card)", color: "var(--r-meta)" }}
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">Search stocks...</span>
          </Link>

          <button
            onClick={() => { haptic(); router.push("/portfolio"); }}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full"
            style={{ color: "var(--r-meta)" }}
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full pb-[120px]">
        {children}
      </main>

      {/* Pansy dock */}
      <div
        className="fixed left-0 right-0 z-40 px-4"
        style={{ bottom: "calc(56px + env(safe-area-inset-bottom, 0px) + 8px)" }}
      >
        <Link href="/ask-pansy">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 h-12 px-4 rounded-full mx-auto max-w-md"
            style={{
              background: "var(--r-card)",
              border: "1px solid var(--r-hairline)",
            }}
          >
            <span className="text-lg flex-shrink-0">🌺</span>
            <span
              className="flex-1 text-sm truncate"
              style={{ color: "var(--r-meta)" }}
            >
              {PANSY_PROMPTS[promptIdx]}
            </span>
            <Mic className="w-4 h-4 flex-shrink-0" style={{ color: "var(--r-teal)" }} />
          </motion.div>
        </Link>
      </div>

      {/* Tab bar — 7 tabs */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "var(--r-elevated)",
          borderTop: "1px solid var(--r-hairline)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="grid grid-cols-7 h-14 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} className="flex flex-col items-center justify-center gap-0.5">
                <motion.div
                  whileTap={{ scale: 0.75 }}
                  onClick={() => haptic()}
                  className="flex flex-col items-center gap-0.5"
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: active ? "var(--r-teal)" : "var(--r-inactive)" }}
                  />
                  <span
                    className={cn("text-[10px] leading-tight", active ? "font-semibold" : "font-medium")}
                    style={{ color: active ? "var(--r-teal)" : "var(--r-inactive)" }}
                  >
                    {label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
