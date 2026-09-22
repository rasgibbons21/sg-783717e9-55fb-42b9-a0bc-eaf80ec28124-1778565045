import type { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { UNIVERSITY_MODULES } from "@/data/university/modules";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { GraduationCap, BookOpen, Lock, CheckCircle, Clock, FlaskConical } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface LessonProgress {
  lesson_slug: string;
  completed_at: string;
}

interface ProgressData {
  progress: LessonProgress[];
  bookmarks: string[];
}

interface Props {
  requiresClientAuth?: boolean;
}

// Modules whose content is live. Single source for both the progress fetch and
// the card grid so they can never drift apart.
const UNLOCKED_SLUGS = [
  "m1-chart-reading", "m2-chart-patterns", "m3-indicators", "m4-trading-signals",
  "m5-strategies", "m6-entering", "m7-managing", "m8-exiting", "m10-candlestick-patterns",
];
const UNLOCKED = new Set(UNLOCKED_SLUGS);
const TRIAL_MODULE_LIMIT = 1;

export default function UniversityIndex({ requiresClientAuth }: Props) {
  const [isVerifying, setIsVerifying] = useState(!!requiresClientAuth);
  const [isAuthorized, setIsAuthorized] = useState(!requiresClientAuth);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress[]>>({});
  const { isTrial, isPaidPro } = useSubscription();

  useEffect(() => {
    if (!requiresClientAuth) {
      loadProgress();
      return;
    }

    // Client-side auth check
    const verify = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/subscription";
        return;
      }

      const res = await fetch("/api/university/progress?module=m1-chart-reading", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = "/subscription";
        return;
      }

      setIsAuthorized(true);
      setIsVerifying(false);
      loadProgress();
    };

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresClientAuth]);

  const loadProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const headers = { Authorization: `Bearer ${session.access_token}` };

    // Fetch progress for every unlocked module in parallel so the hub reflects
    // real completion across all modules, not just Module 1.
    const results = await Promise.all(
      UNLOCKED_SLUGS.map(async (slug) => {
        try {
          const res = await fetch(`/api/university/progress?module=${slug}`, { headers });
          if (!res.ok) return [slug, []] as const;
          const data: ProgressData = await res.json();
          return [slug, data.progress] as const;
        } catch {
          return [slug, []] as const;
        }
      })
    );

    setProgressMap(Object.fromEntries(results));
  };

  if (isVerifying) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#07080C]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#27B7C8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#F3EDE3]/60 text-sm">Verifying your access…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) return null;

  // Overall progress across every unlocked module.
  const totalLessons = UNIVERSITY_MODULES
    .filter((m) => UNLOCKED.has(m.slug))
    .reduce((sum, m) => sum + m.lessonCount, 0);
  const completedLessons = Object.values(progressMap).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Layout>
      <SEO
        title="Radar University — Chart Reading, Indicators & Trading Education"
        description="Master chart reading, candlestick patterns, RSI, MACD, Bollinger Bands, moving averages, and trading signals. 9 structured modules covering chart patterns, indicators, entry/exit strategies, and position management. Advanced investing education for women."
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#07080C] via-[#07080C] to-[#121821] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[#27B7C8]/10 text-[#27B7C8] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            Pro Members Only
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#F3EDE3] mb-4">
            🌸 Radar University
          </h1>
          <p className="text-[#F3EDE3]/70 text-lg max-w-2xl mx-auto">
            Structured trading education built the right way — no hype, no directives, just the real patterns and frameworks that experienced traders use to make sense of price action.
          </p>

          {/* Overall Progress Bar */}
          {completedLessons > 0 && (
            <div className="mt-8 max-w-sm mx-auto">
              <div className="flex justify-between text-xs text-[#F3EDE3]/50 mb-1">
                <span>Your Progress</span>
                <span>{completedLessons}/{totalLessons} lessons</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#27B7C8] to-[#49B06E] rounded-full transition-all"
                  style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                />
              </div>
              {completedLessons >= totalLessons ? (
                <Link
                  href="/certificate?type=university-all"
                  className="mt-3 block py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #D4AF37)" }}
                >
                  🏅 Download Your Advanced Certificate
                </Link>
              ) : completedLessons >= 5 ? (
                <Link
                  href="/certificate?type=university-all"
                  className="mt-3 block py-2.5 rounded-xl text-sm font-medium text-[#C9A84C] border border-[#C9A84C]/20 text-center transition-all hover:bg-[#C9A84C]/5"
                >
                  🔒 Preview Your Advanced Certificate
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="bg-[#07080C] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Strategy Lab banner */}
          <Link href="/university/strategy-lab">
            <div className="mb-10 rounded-2xl border border-[#27B7C8]/30 bg-gradient-to-r from-[#121821] to-[#07080C] p-6 hover:border-[#27B7C8]/60 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#27B7C8]/10 rounded-xl flex items-center justify-center group-hover:bg-[#27B7C8]/20 transition-colors">
                  <FlaskConical className="w-6 h-6 text-[#27B7C8]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#F3EDE3] group-hover:text-[#27B7C8] transition-colors">
                    Strategy Lab
                  </h3>
                  <p className="text-xs text-[#F3EDE3]/50">
                    30+ strategies with interactive charts, simulations, and exercises across day trading, swing trading, long-term investing, and indicators.
                  </p>
                </div>
                <div className="text-[#27B7C8]/40 group-hover:text-[#27B7C8] transition-colors">
                  →
                </div>
              </div>
            </div>
          </Link>

          <h2 className="text-xl font-semibold text-[#F3EDE3] mb-8">All Modules</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {UNIVERSITY_MODULES.map((mod, idx) => {
              const isContentLive = UNLOCKED.has(mod.slug);
              const isTrialLocked = isTrial && !isPaidPro && idx >= TRIAL_MODULE_LIMIT;
              const isUnlocked = isContentLive && !isTrialLocked;
              const progress = progressMap[mod.slug] ?? [];
              const completed = progress.length;
              const pct = isUnlocked ? Math.round((completed / mod.lessonCount) * 100) : 0;

              return (
                <Link key={mod.slug} href={isUnlocked ? `/university/${mod.slug}` : "/subscription"}>
                <div
                  className={`relative rounded-2xl border p-5 transition-all ${
                    isUnlocked
                      ? "border-[#27B7C8]/30 bg-[#121821] hover:border-[#27B7C8]/60 cursor-pointer"
                      : "border-white/10 bg-[#0F1E33] opacity-60 cursor-pointer hover:opacity-80"
                  }`}
                >
                  {/* Lock badge */}
                  {!isUnlocked && (
                    <div className="absolute top-3 right-3">
                      <Lock className="w-4 h-4 text-[#F3EDE3]/30" />
                    </div>
                  )}

                  <div className="text-3xl mb-3">{mod.icon}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[#27B7C8]">Module {mod.number}</span>
                    <span className="text-xs text-[#F3EDE3]/40">·</span>
                    <span className="text-xs text-[#F3EDE3]/40">{mod.difficulty}</span>
                  </div>
                  <h3 className="text-[#F3EDE3] font-semibold text-base mb-1">{mod.title}</h3>
                  <p className="text-[#F3EDE3]/50 text-xs leading-relaxed mb-4 line-clamp-3">{mod.subtitle}</p>

                  <div className="flex items-center justify-between text-xs text-[#F3EDE3]/40 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {mod.lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mod.estimatedHours}h
                    </span>
                  </div>

                  {isUnlocked && (
                    <>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-[#27B7C8] to-[#49B06E] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <button className="w-full py-2 text-sm font-medium rounded-xl bg-[#27B7C8] text-[#07080C] hover:bg-[#27B7C8]/90 transition-colors">
                        {completed === 0 ? "Start Module" : completed === mod.lessonCount ? "Review Module" : "Continue"}
                      </button>
                    </>
                  )}

                  {isTrialLocked && (
                    <div className="text-xs text-center py-1" style={{ color: '#D4AF37' }}>
                      Subscribe to unlock
                    </div>
                  )}

                  {!isContentLive && !isTrialLocked && (
                    <div className="text-xs text-[#F3EDE3]/30 text-center py-1">Coming soon</div>
                  )}
                </div>
                </Link>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="mt-16 p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-xs text-[#F3EDE3]/40 leading-relaxed">
              <strong className="text-[#F3EDE3]/60">Educational purposes only.</strong>{" "}
              Radar University is designed to teach chart reading, technical analysis concepts, and market frameworks. Nothing in these lessons constitutes financial advice or a recommendation to buy or sell any security. All patterns discussed can and do fail regularly. Trading involves significant risk of loss, and past patterns are not predictive of future results. Always conduct your own research.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const result = await requireProUserSSR(req);

  if (result.status === "not-pro" || result.status === "unauthenticated") {
    return { redirect: { destination: "/subscription", permanent: false } };
  }

  if (result.status === "no-cookie") {
    return { props: { requiresClientAuth: true } };
  }

  return { props: {} };
};
