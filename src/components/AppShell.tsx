import { ReactNode } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, UserRound } from "lucide-react";
import { HEADER_ITEMS, TAB_ITEMS, isActivePath } from "@/config/navigation";
import { BloomMark } from "@/components/brand/BloomMark";
import { RiskNote } from "@/components/RiskNote";
import { ReviewPrompt, useAutoReviewPrompt } from "@/components/ReviewPrompt";
import { cn } from "@/lib/utils";

const haptic = (ms = 8) => {
  try {
    navigator?.vibrate?.(ms);
  } catch {
    // Vibration isn't available on every device.
  }
};

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = router.pathname;
  const reviewPrompt = useAutoReviewPrompt();
  const isTopLevel = [...TAB_ITEMS, ...HEADER_ITEMS].some((item) => item.href === path);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {reviewPrompt.show && path === "/home" && <ReviewPrompt onClose={reviewPrompt.dismiss} />}

      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4">
          {!isTopLevel && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                haptic();
                router.back();
              }}
              className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-secondary md:hidden"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
          )}

          <Link href="/home" className="flex items-center gap-2">
            <BloomMark size={32} />
            <span className="font-serif text-xl font-semibold text-foreground">Bloom</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Main">
            {TAB_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActivePath(path, href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  isActivePath(path, href) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link href="/leaderboard" className="rounded-full px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary sm:px-3">
              Leaderboard
            </Link>
            <Link href="/brokers" className="rounded-full px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary sm:px-3">
              Brokers
            </Link>
            <Link
              href="/profile"
              aria-label="Your profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-foreground"
            >
              <UserRound className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full flex-1 pb-24 md:pb-8">
        {children}
        <RiskNote variant="footer" />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Main"
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
          {TAB_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(path, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-center"
              >
                <motion.span
                  whileTap={{ scale: 0.85 }}
                  onClick={() => haptic()}
                  className={cn("flex flex-col items-center gap-1", active ? "text-primary" : "text-muted-foreground")}
                >
                  {Icon && <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />}
                  <span className={cn("text-[11px] leading-tight", active ? "font-semibold" : "font-medium")}>{label}</span>
                </motion.span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
