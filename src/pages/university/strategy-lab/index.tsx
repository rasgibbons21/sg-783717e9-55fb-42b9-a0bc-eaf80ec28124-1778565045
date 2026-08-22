import type { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import {
  ALL_STRATEGIES,
  STRATEGY_CATEGORIES,
  STRATEGY_FILTERS,
  getStrategiesByFilter,
  type StrategyFilter,
} from "@/data/strategy-lab";
import {
  FlaskConical,
  BookOpen,
  CheckCircle,
  Clock,
  Filter,
  ArrowLeft,
  Wrench,
  Trophy,
} from "lucide-react";

interface ProgressRow {
  strategy_slug: string;
  status: string;
  lessons_completed: number;
}

interface Props {
  requiresClientAuth?: boolean;
}

export default function StrategyLabIndex({ requiresClientAuth }: Props) {
  const [isVerifying, setIsVerifying] = useState(!!requiresClientAuth);
  const [isAuthorized, setIsAuthorized] = useState(!requiresClientAuth);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [activeFilter, setActiveFilter] = useState<StrategyFilter>("All");

  useEffect(() => {
    if (!requiresClientAuth) {
      loadProgress();
      return;
    }

    const verify = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/subscription"; return; }

      const res = await fetch("/api/strategy-lab/progress", {
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

    try {
      const res = await fetch("/api/strategy-lab/progress", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress ?? []);
      }
    } catch {}
  };

  if (isVerifying) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#0E1B30]">
          <div className="w-12 h-12 border-4 border-[#27B7C8] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) return null;

  const progressMap = new Map(progress.map((p) => [p.strategy_slug, p]));
  const filtered = getStrategiesByFilter(activeFilter);
  const masteredCount = progress.filter((p) => p.status === "mastered").length;
  const startedCount = progress.filter((p) => p.status !== "not_started").length;

  return (
    <Layout>
      <SEO
        title="Strategy Lab — 32 Trading & Investing Strategies | Bloom"
        description="Learn 32 trading strategies: day trading, swing trading, long-term investing, and indicator workshops. Scalping, momentum, breakout, DCA, dividend growth, value investing, and more. Interactive charts and practice exercises for each strategy."
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0E1B30] via-[#0E1B30] to-[#162540] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link href="/university" className="inline-flex items-center gap-1.5 text-xs text-[#27B7C8] hover:text-[#27B7C8]/80 mb-6">
            <ArrowLeft className="w-3 h-3" />
            Back to University
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#27B7C8]/10 rounded-xl flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-[#27B7C8]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#F4F7FA]">
                Strategy Lab
              </h1>
              <p className="text-[#F4F7FA]/50 text-sm">
                {ALL_STRATEGIES.length} strategies across {STRATEGY_CATEGORIES.length} categories
              </p>
            </div>
          </div>

          <p className="text-[#F4F7FA]/60 text-sm max-w-2xl leading-relaxed">
            Learn real trading strategies with interactive charts and exercises. Every strategy includes what to look for, when NOT to use it, common mistakes, and practice scenarios.
          </p>

          {/* Stats row */}
          {startedCount > 0 && (
            <div className="flex gap-4 mt-6">
              <div className="bg-white/5 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-[#27B7C8]">{startedCount}</div>
                <div className="text-[10px] text-[#F4F7FA]/40">Started</div>
              </div>
              <div className="bg-white/5 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-[#49B06E]">{masteredCount}</div>
                <div className="text-[10px] text-[#F4F7FA]/40">Mastered</div>
              </div>
              <div className="bg-white/5 rounded-lg px-4 py-2 text-center">
                <div className="text-lg font-bold text-[#F4F7FA]">{ALL_STRATEGIES.length - startedCount}</div>
                <div className="text-[10px] text-[#F4F7FA]/40">Remaining</div>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="flex gap-2 mt-6">
            <Link
              href="/university/strategy-lab/toolbelt"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 rounded-lg text-[#F4F7FA]/60 hover:bg-white/10 transition-colors border border-white/5"
            >
              <Wrench className="w-3 h-3" />
              My Toolbelt
            </Link>
            <Link
              href="/university/strategy-lab/challenge"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 rounded-lg text-[#F4F7FA]/60 hover:bg-white/10 transition-colors border border-white/5"
            >
              <Trophy className="w-3 h-3" />
              Final Challenge
            </Link>
          </div>
        </div>
      </div>

      {/* Filters + Grid */}
      <div className="bg-[#0E1B30] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Filter pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-3.5 h-3.5 text-[#F4F7FA]/30 shrink-0" />
            {STRATEGY_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === f
                    ? "bg-[#27B7C8] text-white"
                    : "bg-white/5 text-[#F4F7FA]/50 hover:bg-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Category sections */}
          {STRATEGY_CATEGORIES.map((cat) => {
            const catStrategies = filtered.filter((s) => s.category === cat.slug);
            if (catStrategies.length === 0) return null;

            return (
              <div key={cat.slug} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">{cat.icon}</span>
                  <h2 className="text-lg font-semibold text-[#F4F7FA]">{cat.label}</h2>
                  <span className="text-xs text-[#F4F7FA]/30 ml-1">{catStrategies.length} strategies</span>
                </div>
                <p className="text-xs text-[#F4F7FA]/40 mb-4">{cat.description}</p>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {catStrategies.map((strategy) => {
                    const prog = progressMap.get(strategy.slug);
                    const status = prog?.status ?? "not_started";

                    return (
                      <Link
                        key={strategy.slug}
                        href={`/university/strategy-lab/${strategy.slug}`}
                      >
                        <div className="rounded-xl border border-white/10 bg-[#162540] p-4 hover:border-[#27B7C8]/40 transition-all cursor-pointer group">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-2xl">{strategy.icon}</span>
                            {status === "mastered" && (
                              <CheckCircle className="w-4 h-4 text-[#49B06E]" />
                            )}
                            {status === "learning" && (
                              <div className="w-4 h-4 rounded-full border-2 border-[#27B7C8] border-t-transparent animate-spin" />
                            )}
                            {status === "practicing" && (
                              <Clock className="w-4 h-4 text-amber-400" />
                            )}
                          </div>

                          <h3 className="text-sm font-semibold text-[#F4F7FA] mb-1 group-hover:text-[#27B7C8] transition-colors">
                            {strategy.name}
                          </h3>

                          <div className="flex items-center gap-2 text-[10px] text-[#F4F7FA]/40 mb-2">
                            <span className={`px-1.5 py-0.5 rounded ${
                              strategy.difficulty === "Beginner" ? "bg-[#49B06E]/10 text-[#49B06E]" :
                              strategy.difficulty === "Intermediate" ? "bg-[#27B7C8]/10 text-[#27B7C8]" :
                              "bg-amber-400/10 text-amber-400"
                            }`}>
                              {strategy.difficulty}
                            </span>
                            <span>{strategy.timeframe}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-[#F4F7FA]/30">
                            <BookOpen className="w-3 h-3" />
                            <span>{strategy.lessonCount} lessons</span>
                            {strategy.chartExercises.length > 0 && (
                              <>
                                <span>·</span>
                                <span>{strategy.chartExercises.length} chart exercises</span>
                              </>
                            )}
                          </div>

                          {prog && status !== "not_started" && (
                            <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#27B7C8] to-[#49B06E] rounded-full"
                                style={{ width: `${Math.min(100, ((prog.lessons_completed ?? 0) / strategy.lessonCount) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Disclaimer */}
          <div className="mt-12 p-5 rounded-xl border border-white/10 bg-white/5">
            <p className="text-[10px] text-[#F4F7FA]/30 leading-relaxed">
              <strong className="text-[#F4F7FA]/50">Educational purposes only.</strong>{" "}
              Strategy Lab is designed to teach trading concepts and frameworks. Nothing here constitutes financial advice or a recommendation to buy or sell any security.
              All strategies can and do fail. "No valid setup" is frequently the correct answer. Historical/simulated chart performance does not represent future expected performance.
              Trading involves significant risk of loss. Always conduct your own research and consider consulting a licensed financial advisor.
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
