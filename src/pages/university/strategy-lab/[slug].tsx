import type { GetServerSideProps } from "next";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { getStrategyBySlug, isIndicatorStrategy } from "@/data/strategy-lab";
import type { Strategy, IndicatorStrategy } from "@/data/strategy-lab";
import { StrategyChartLesson } from "@/components/StrategyChartLesson";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  BookOpen,
  AlertTriangle,
  Wrench,
  Plus,
  Check,
} from "lucide-react";

interface Props {
  slug: string;
  requiresClientAuth?: boolean;
}

export default function StrategyLessonPage({ slug, requiresClientAuth }: Props) {
  const strategy = getStrategyBySlug(slug);
  const [isVerifying, setIsVerifying] = useState(!!requiresClientAuth);
  const [isAuthorized, setIsAuthorized] = useState(!requiresClientAuth);
  const [activeSection, setActiveSection] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [inToolbelt, setInToolbelt] = useState(false);
  const [toolbeltLoading, setToolbeltLoading] = useState(false);

  useEffect(() => {
    if (!requiresClientAuth) {
      checkToolbelt();
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
      checkToolbelt();
    };
    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresClientAuth]);

  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }, []);

  const checkToolbelt = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/strategy-lab/toolbelt", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInToolbelt(data.toolbelt?.some((t: { strategy_slug: string }) => t.strategy_slug === slug) ?? false);
      }
    } catch {}
  }, [getToken, slug]);

  const toggleToolbelt = useCallback(async () => {
    const token = await getToken();
    if (!token || toolbeltLoading) return;
    setToolbeltLoading(true);
    try {
      await fetch("/api/strategy-lab/toolbelt", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ strategySlug: slug, action: inToolbelt ? "remove" : "add" }),
      });
      setInToolbelt(!inToolbelt);
    } catch {} finally {
      setToolbeltLoading(false);
    }
  }, [getToken, slug, inToolbelt, toolbeltLoading]);

  const trackProgress = useCallback(async (status: string, lessonsCompleted?: number) => {
    const token = await getToken();
    if (!token || !strategy) return;
    try {
      await fetch("/api/strategy-lab/progress", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          strategySlug: slug,
          category: strategy.category,
          status,
          lessonsCompleted,
        }),
      });
    } catch {}
  }, [getToken, slug, strategy]);

  const submitQuiz = useCallback(async () => {
    if (!strategy || quizSubmitted) return;
    setQuizSubmitted(true);

    const score = quizAnswers.reduce((s, a, i) => s + (a === strategy.quiz[i]?.correct ? 1 : 0), 0);
    const total = strategy.quiz.length;
    const passed = total > 0 && score / total >= 0.75;

    if (passed) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    }

    const token = await getToken();
    if (!token) return;

    try {
      await fetch("/api/strategy-lab/practice", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          strategySlug: slug,
          exerciseType: "quiz",
          score,
          total,
          answers: quizAnswers,
        }),
      });

      if (passed) {
        await trackProgress("mastered", strategy.sections.length);
      }
    } catch {}
  }, [strategy, quizAnswers, quizSubmitted, getToken, slug, trackProgress]);

  if (!strategy) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#0E1B30]">
          <div className="text-center">
            <p className="text-[#F4F7FA]/60 mb-4">Strategy not found.</p>
            <Link href="/university/strategy-lab" className="text-[#27B7C8] text-sm">
              Back to Strategy Lab
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

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

  const isIndicator = isIndicatorStrategy(strategy);
  const indicator = isIndicator ? (strategy as IndicatorStrategy) : null;
  const section = strategy.sections[activeSection];
  const quizScore = quizSubmitted
    ? quizAnswers.reduce((s, a, i) => s + (a === strategy.quiz[i]?.correct ? 1 : 0), 0)
    : 0;

  return (
    <Layout>
      <SEO
        title={`${strategy.name} — Bloom Strategy Lab`}
        description={`Learn the ${strategy.name} strategy with interactive charts and exercises. Educational only.`}
      />

      <div className="bg-[#0E1B30] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Back + breadcrumb */}
          <Link
            href="/university/strategy-lab"
            className="inline-flex items-center gap-1.5 text-xs text-[#27B7C8] hover:text-[#27B7C8]/80 mb-6"
          >
            <ArrowLeft className="w-3 h-3" />
            Strategy Lab
          </Link>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{strategy.icon}</span>
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#F4F7FA]">{strategy.name}</h1>
                <div className="flex items-center gap-2 text-xs text-[#F4F7FA]/40 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded ${
                    strategy.difficulty === "Beginner" ? "bg-[#49B06E]/10 text-[#49B06E]" :
                    strategy.difficulty === "Intermediate" ? "bg-[#27B7C8]/10 text-[#27B7C8]" :
                    "bg-amber-400/10 text-amber-400"
                  }`}>
                    {strategy.difficulty}
                  </span>
                  <span>{strategy.category}</span>
                  <span>·</span>
                  <span>{strategy.timeframe}</span>
                </div>
              </div>
            </div>

            {/* Market conditions */}
            <p className="text-xs text-[#F4F7FA]/40 mt-2">
              <span className="text-[#F4F7FA]/60">Best studied during:</span> {strategy.marketConditions}
            </p>

            {/* Toolbelt toggle */}
            <button
              onClick={toggleToolbelt}
              disabled={toolbeltLoading}
              className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                inToolbelt
                  ? "bg-[#49B06E]/10 text-[#49B06E] border border-[#49B06E]/20"
                  : "bg-white/5 text-[#F4F7FA]/50 border border-white/10 hover:border-[#27B7C8]/30"
              }`}
            >
              {inToolbelt ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {inToolbelt ? "In Your Toolbelt" : "Add to Toolbelt"}
            </button>
          </div>

          {/* Pansy intro */}
          <div className="mb-6 p-4 rounded-xl border border-[#27B7C8]/10 bg-[#27B7C8]/5">
            <div className="flex items-start gap-2">
              <span className="text-lg">🌸</span>
              <p className="text-sm text-[#F4F7FA]/70 italic leading-relaxed">{strategy.pansy.intro}</p>
            </div>
          </div>

          {/* Indicator-specific info */}
          {indicator && (
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoCard title="What It Measures" content={indicator.whatItMeasures} color="teal" />
                <InfoCard title="What It Does NOT Do" content={indicator.whatItDoesNot} color="red" />
                <InfoCard title="Common Settings" content={indicator.commonSettings} color="blue" />
                <InfoCard title="False Signals" content={indicator.falseSignals} color="amber" />
              </div>
              <InfoCard title="Beginner Mistakes" content={indicator.beginnerMistakes} color="red" />
              <InfoCard title="When NOT to Use" content={indicator.whenNotToUse} color="amber" />
              <InfoCard title="Combine with Price Action" content={indicator.combineWithPriceAction} color="green" />
            </div>
          )}

          {/* Section navigation */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {strategy.sections.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveSection(i);
                  if (i === 0) trackProgress("learning", 1);
                }}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === i
                    ? "bg-[#27B7C8] text-white"
                    : "bg-white/5 text-[#F4F7FA]/50 hover:bg-white/10"
                }`}
              >
                {s.heading.length > 20 ? s.heading.slice(0, 20) + "…" : s.heading}
              </button>
            ))}
          </div>

          {/* Active section content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <div className="bg-[#162540] rounded-xl border border-white/5 p-5">
                <h2 className="text-lg font-semibold text-[#F4F7FA] mb-3">{section.heading}</h2>
                <div className="text-sm text-[#F4F7FA]/70 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>

              {/* Nav buttons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                  disabled={activeSection === 0}
                  className="flex items-center gap-1 text-xs text-[#27B7C8] disabled:opacity-30"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Previous
                </button>
                <button
                  onClick={() => {
                    const next = activeSection + 1;
                    if (next < strategy.sections.length) {
                      setActiveSection(next);
                      trackProgress("learning", next + 1);
                    }
                  }}
                  disabled={activeSection === strategy.sections.length - 1}
                  className="flex items-center gap-1 text-xs text-[#27B7C8] disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Diagram */}
          {strategy.diagram && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#F4F7FA] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#27B7C8]" />
                Visual Diagram
              </h3>
              <div
                className="rounded-xl overflow-hidden border border-white/5"
                dangerouslySetInnerHTML={{ __html: strategy.diagram }}
              />
            </div>
          )}

          {/* Chart exercises */}
          {strategy.chartExercises.length > 0 && (
            <div className="mb-6 space-y-4">
              <h3 className="text-sm font-semibold text-[#F4F7FA] flex items-center gap-2">
                📊 Chart Exercises
              </h3>
              {strategy.chartExercises.map((ex) => (
                <StrategyChartLesson
                  key={ex.id}
                  exercise={ex}
                  onComplete={(correct) => {
                    if (correct) trackProgress("practicing");
                  }}
                />
              ))}
            </div>
          )}

          {/* Quiz */}
          {strategy.quiz.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#F4F7FA] mb-3">Knowledge Check</h3>

              {!quizStarted ? (
                <div className="bg-[#162540] rounded-xl border border-white/5 p-5 text-center">
                  <p className="text-sm text-[#F4F7FA]/60 mb-4">
                    {strategy.quiz.length} questions to test your understanding.
                  </p>
                  <button
                    onClick={() => {
                      setQuizStarted(true);
                      setQuizAnswers(new Array(strategy.quiz.length).fill(null));
                    }}
                    className="px-6 py-2.5 bg-[#27B7C8] text-white rounded-lg text-sm font-medium hover:bg-[#27B7C8]/90 transition-colors"
                  >
                    Start Quiz
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {strategy.quiz.map((q, qi) => (
                    <div key={qi} className="bg-[#162540] rounded-xl border border-white/5 p-4">
                      <p className="text-sm font-medium text-[#F4F7FA] mb-3">
                        {qi + 1}. {q.q}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          let optClass = "border-white/10 bg-transparent";
                          let icon = null;

                          if (quizSubmitted) {
                            if (oi === q.correct) {
                              optClass = "border-[#49B06E]/40 bg-[#49B06E]/5";
                              icon = <CheckCircle className="w-3.5 h-3.5 text-[#49B06E] shrink-0" />;
                            } else if (oi === quizAnswers[qi] && oi !== q.correct) {
                              optClass = "border-red-400/40 bg-red-400/5";
                              icon = <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
                            }
                          } else if (oi === quizAnswers[qi]) {
                            optClass = "border-[#27B7C8]/40 bg-[#27B7C8]/5";
                          }

                          return (
                            <button
                              key={oi}
                              onClick={() => {
                                if (quizSubmitted) return;
                                const newAnswers = [...quizAnswers];
                                newAnswers[qi] = oi;
                                setQuizAnswers(newAnswers);
                              }}
                              disabled={quizSubmitted}
                              className={`w-full text-left px-3 py-2 rounded-lg border ${optClass} text-xs text-[#F4F7FA]/70 transition-all flex items-center gap-2 disabled:cursor-default`}
                            >
                              {icon}
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && quizAnswers[qi] !== null && (
                        <p className="mt-2 text-[10px] text-[#F4F7FA]/50 leading-relaxed">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  {!quizSubmitted ? (
                    <button
                      onClick={submitQuiz}
                      disabled={quizAnswers.some((a) => a === null)}
                      className="w-full py-3 bg-[#27B7C8] text-white rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-[#27B7C8]/90 transition-colors"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <div className={`p-4 rounded-xl border text-center ${
                      quizScore / strategy.quiz.length >= 0.75
                        ? "border-[#49B06E]/20 bg-[#49B06E]/5"
                        : "border-amber-400/20 bg-amber-400/5"
                    }`}>
                      <p className="text-lg font-bold text-[#F4F7FA]">
                        {quizScore}/{strategy.quiz.length}
                      </p>
                      <p className="text-xs text-[#F4F7FA]/50">
                        {quizScore / strategy.quiz.length >= 0.75 ? "Great work!" : "Review and try again next time."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pansy post-quiz encouragement */}
          {quizSubmitted && (
            <div className="mb-6 p-4 rounded-xl border border-[#27B7C8]/10 bg-[#27B7C8]/5">
              <div className="flex items-start gap-2">
                <span className="text-lg">🌸</span>
                <div>
                  {strategy.pansy.afterQuiz.map((line, i) => (
                    <p key={i} className="text-sm text-[#F4F7FA]/70 italic leading-relaxed mb-1">
                      {line}
                    </p>
                  ))}
                  <p className="text-xs text-[#F4F7FA]/50 mt-2">{strategy.pansy.encouragement}</p>
                </div>
              </div>
            </div>
          )}

          {/* Toolbelt summary */}
          <div className="mb-6 bg-[#162540] rounded-xl border border-white/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-[#27B7C8]" />
              <h3 className="text-sm font-semibold text-[#F4F7FA]">Strategy Toolbelt Summary</h3>
            </div>
            <div className="space-y-2 text-xs text-[#F4F7FA]/60">
              <p><span className="text-[#F4F7FA]/80 font-medium">Best studied during:</span> {strategy.toolbelt.bestStudiedDuring}</p>
              <p><span className="text-[#49B06E] font-medium">Look for:</span> {strategy.toolbelt.lookFor}</p>
              <p><span className="text-red-400 font-medium">Avoid:</span> {strategy.toolbelt.avoid}</p>
              <p><span className="text-[#27B7C8] font-medium">Confirmation:</span> {strategy.toolbelt.confirmation}</p>
              <p><span className="text-amber-400 font-medium">Invalidation:</span> {strategy.toolbelt.invalidation}</p>
            </div>
          </div>

          {/* Pansy warning */}
          {strategy.pansy.warning && (
            <div className="mb-6 p-3 rounded-xl border border-amber-400/10 bg-amber-400/5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400/80">{strategy.pansy.warning}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mb-8 p-4 rounded-xl border border-white/5 bg-white/5">
            <p className="text-[9px] text-[#F4F7FA]/25 leading-relaxed">
              <strong className="text-[#F4F7FA]/40">Educational purposes only.</strong>{" "}
              This strategy lesson is designed for learning. Nothing here constitutes financial advice.
              All examples use hypothetical educational data. Simulated/historical chart performance does not represent future expected results.
              All strategies can and do fail. Trading involves significant risk of loss.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function InfoCard({ title, content, color }: { title: string; content: string; color: string }) {
  const colorMap: Record<string, string> = {
    teal: "border-[#27B7C8]/15 bg-[#27B7C8]/5",
    red: "border-red-400/15 bg-red-400/5",
    blue: "border-blue-400/15 bg-blue-400/5",
    amber: "border-amber-400/15 bg-amber-400/5",
    green: "border-[#49B06E]/15 bg-[#49B06E]/5",
  };

  return (
    <div className={`rounded-lg border p-3 ${colorMap[color] ?? colorMap.teal}`}>
      <p className="text-xs font-medium text-[#F4F7FA]/80 mb-1">{title}</p>
      <p className="text-[11px] text-[#F4F7FA]/55 leading-relaxed">{content}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const result = await requireProUserSSR(req);

  if (result.status === "not-pro" || result.status === "unauthenticated") {
    return { redirect: { destination: "/subscription", permanent: false } };
  }

  const slug = params?.slug as string;
  if (!slug || !getStrategyBySlug(slug)) {
    return { notFound: true };
  }

  if (result.status === "no-cookie") {
    return { props: { slug, requiresClientAuth: true } };
  }

  return { props: { slug } };
};
