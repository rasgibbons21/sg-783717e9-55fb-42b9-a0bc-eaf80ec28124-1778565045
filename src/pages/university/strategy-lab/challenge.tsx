import type { GetServerSideProps } from "next";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import DynamicChart from "@/components/DynamicChart";
import { SPOT_SETUP_CHARTS, SPOT_SETUP_ANSWERS } from "@/data/strategy-lab/chart-data";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  Trophy,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Shield,
  BarChart3,
  Brain,
  Zap,
} from "lucide-react";

interface Props {
  requiresClientAuth?: boolean;
}

const OPTIONS = [
  "Bullish breakout setup",
  "Bearish breakdown setup",
  "Mean reversion / bounce setup",
  "No valid setup — stay out",
];

function mapAnswerToOption(answer: string): number {
  const lower = answer.toLowerCase();
  if (lower.includes("no valid")) return 3;
  if (lower.includes("bear")) return 1;
  if (lower.includes("bounce") || lower.includes("reversion") || lower.includes("support")) return 2;
  return 0; // breakout, bull flag, momentum, ORB, VWAP reclaim → bullish
}

const CHALLENGE_QUESTIONS = SPOT_SETUP_CHARTS.map((chart, i) => ({
  chartData: chart,
  correctOption: mapAnswerToOption(SPOT_SETUP_ANSWERS[i] ?? "No valid setup"),
}));

const TOTAL_CHARTS = Math.min(CHALLENGE_QUESTIONS.length, 10);

export default function ChallengePage({ requiresClientAuth }: Props) {
  const [isVerifying, setIsVerifying] = useState(!!requiresClientAuth);
  const [isAuthorized, setIsAuthorized] = useState(!requiresClientAuth);
  const [started, setStarted] = useState(false);
  const [currentChart, setCurrentChart] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(TOTAL_CHARTS).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [pastScores, setPastScores] = useState<{ total_score: number; attempted_at: string }[]>([]);

  useEffect(() => {
    if (!requiresClientAuth) { loadScores(); return; }
    const verify = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/subscription"; return; }
      const res = await fetch("/api/strategy-lab/challenge", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/subscription"; return;
      }
      setIsAuthorized(true);
      setIsVerifying(false);
      loadScores();
    };
    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresClientAuth]);

  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  }, []);

  const loadScores = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch("/api/strategy-lab/challenge", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPastScores(data.scores ?? []);
      }
    } catch {}
  }, [getToken]);

  const submitChallenge = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);

    let correct = 0;
    let noTradeCorrect = 0;
    const details: { chart: number; answer: number | null; correct: number; isCorrect: boolean }[] = [];

    for (let i = 0; i < TOTAL_CHARTS; i++) {
      const userAnswer = answers[i];
      const correctOption = CHALLENGE_QUESTIONS[i]?.correctOption ?? 3;
      const isCorrect = userAnswer === correctOption;
      if (isCorrect) {
        correct++;
        if (correctOption === 3) noTradeCorrect++;
      }
      details.push({ chart: i, answer: userAnswer, correct: correctOption, isCorrect });
    }

    const pct = Math.round((correct / TOTAL_CHARTS) * 100);
    const patternRecognition = Math.round((correct / TOTAL_CHARTS) * 25);
    const noTradeTotal = CHALLENGE_QUESTIONS.filter((q, i) => i < TOTAL_CHARTS && q.correctOption === 3).length;
    const riskAwareness = Math.round((noTradeCorrect / Math.max(1, noTradeTotal)) * 25);
    const chartReading = patternRecognition;
    const strategySelection = Math.round((correct / TOTAL_CHARTS) * 15);
    const discipline = riskAwareness;

    if (pct >= 80) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => confetti({ particleCount: 60, spread: 50, origin: { y: 0.7, x: 0.3 } }), 300);
      setTimeout(() => confetti({ particleCount: 60, spread: 50, origin: { y: 0.7, x: 0.7 } }), 600);
    }

    const token = await getToken();
    if (!token) return;

    try {
      await fetch("/api/strategy-lab/challenge", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          patternRecognition,
          riskAwareness,
          chartReading,
          strategySelection,
          discipline,
          totalScore: pct,
          chartsCompleted: TOTAL_CHARTS,
          noTradeCorrect,
          details,
        }),
      });
    } catch {}
  }, [answers, submitted, getToken]);

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

  const totalCorrect = submitted
    ? answers.reduce((s, a, i) => s + (a === (CHALLENGE_QUESTIONS[i]?.correctOption ?? 3) ? 1 : 0), 0)
    : 0;
  const scorePct = Math.round((totalCorrect / TOTAL_CHARTS) * 100);

  return (
    <Layout>
      <SEO title="Strategy Challenge — Bloom Strategy Lab" description="Test your strategy knowledge with the final 10-chart challenge." />

      <div className="bg-[#0E1B30] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/university/strategy-lab" className="inline-flex items-center gap-1.5 text-xs text-[#27B7C8] hover:text-[#27B7C8]/80 mb-6">
            <ArrowLeft className="w-3 h-3" />
            Strategy Lab
          </Link>

          {!started ? (
            /* Pre-challenge screen */
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-[#FFD700] mx-auto mb-4" />
              <h1 className="text-3xl font-serif font-bold text-[#F4F7FA] mb-3">Final Strategy Challenge</h1>
              <p className="text-sm text-[#F4F7FA]/50 max-w-md mx-auto mb-6">
                {TOTAL_CHARTS} charts. Each one asks you to identify the setup — or recognize there isn't one.
                "No valid setup" is frequently the correct answer.
              </p>

              <div className="grid grid-cols-5 gap-2 max-w-sm mx-auto mb-8">
                {[
                  { icon: Target, label: "Pattern Recognition" },
                  { icon: Shield, label: "Risk Awareness" },
                  { icon: BarChart3, label: "Chart Reading" },
                  { icon: Brain, label: "Strategy Selection" },
                  { icon: Zap, label: "Discipline" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="bg-white/5 rounded-lg p-2 text-center">
                    <Icon className="w-4 h-4 text-[#27B7C8] mx-auto mb-1" />
                    <p className="text-[8px] text-[#F4F7FA]/30">{label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStarted(true)}
                className="px-8 py-3 bg-gradient-to-r from-[#27B7C8] to-[#49B06E] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Begin Challenge
              </button>

              {/* Past scores */}
              {pastScores.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs text-[#F4F7FA]/30 mb-2">Previous Attempts</p>
                  <div className="flex gap-2 justify-center">
                    {pastScores.slice(0, 5).map((s, i) => (
                      <div key={i} className={`px-3 py-1.5 rounded-lg text-xs ${
                        s.total_score >= 80 ? "bg-[#49B06E]/10 text-[#49B06E]" :
                        s.total_score >= 60 ? "bg-[#27B7C8]/10 text-[#27B7C8]" :
                        "bg-white/5 text-[#F4F7FA]/40"
                      }`}>
                        {s.total_score}%
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-8 text-[9px] text-[#F4F7FA]/20 max-w-sm mx-auto">
                All charts use hypothetical educational data. This is a learning exercise, not financial advice.
              </p>
            </div>
          ) : !submitted ? (
            /* Active challenge */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#F4F7FA]">
                  Chart {currentChart + 1} of {TOTAL_CHARTS}
                </h2>
                <span className="text-xs text-[#F4F7FA]/30">
                  {answers.filter((a) => a !== null).length} answered
                </span>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: TOTAL_CHARTS }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentChart(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentChart ? "bg-[#27B7C8]" :
                      answers[i] !== null ? "bg-[#49B06E]/50" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Chart */}
              <div className="bg-[#162540] rounded-xl border border-white/5 p-2 mb-4">
                {CHALLENGE_QUESTIONS[currentChart] && (
                  <DynamicChart data={CHALLENGE_QUESTIONS[currentChart].chartData} height={240} />
                )}
              </div>

              <div className="flex items-center gap-1.5 mb-4">
                <AlertTriangle className="w-3 h-3 text-amber-400/40" />
                <p className="text-[9px] text-white/20">
                  Hypothetical educational data — not a real stock or financial advice.
                </p>
              </div>

              {/* Options */}
              <p className="text-sm font-medium text-[#F4F7FA] mb-3">What setup do you see?</p>
              <div className="space-y-2 mb-4">
                {OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const newAnswers = [...answers];
                      newAnswers[currentChart] = i;
                      setAnswers(newAnswers);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                      answers[currentChart] === i
                        ? "border-[#27B7C8]/50 bg-[#27B7C8]/10 text-[#F4F7FA]"
                        : "border-white/10 text-[#F4F7FA]/60 hover:border-white/20"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentChart(Math.max(0, currentChart - 1))}
                  disabled={currentChart === 0}
                  className="text-xs text-[#27B7C8] disabled:opacity-30"
                >
                  Previous
                </button>

                {currentChart < TOTAL_CHARTS - 1 ? (
                  <button
                    onClick={() => setCurrentChart(currentChart + 1)}
                    className="flex items-center gap-1 text-xs text-[#27B7C8]"
                  >
                    Next <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={submitChallenge}
                    disabled={answers.some((a) => a === null)}
                    className="px-6 py-2 bg-gradient-to-r from-[#27B7C8] to-[#49B06E] text-white rounded-lg text-sm font-medium disabled:opacity-30 hover:opacity-90 transition-opacity"
                  >
                    Submit Challenge
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results */
            <div className="text-center py-8">
              <Trophy className={`w-16 h-16 mx-auto mb-4 ${scorePct >= 80 ? "text-[#FFD700]" : scorePct >= 60 ? "text-[#27B7C8]" : "text-[#F4F7FA]/30"}`} />
              <h2 className="text-3xl font-bold text-[#F4F7FA] mb-1">{scorePct}%</h2>
              <p className="text-sm text-[#F4F7FA]/50 mb-6">
                {totalCorrect}/{TOTAL_CHARTS} correct
              </p>

              <p className="text-sm text-[#F4F7FA]/60 mb-8">
                {scorePct >= 80 ? "Outstanding! You have a strong grasp of chart reading and strategy identification." :
                 scorePct >= 60 ? "Good work! You're developing solid pattern recognition skills." :
                 "Keep studying! Review the strategies and practice more chart exercises."}
              </p>

              {/* Chart-by-chart review */}
              <div className="text-left space-y-3 max-w-lg mx-auto mb-8">
                <h3 className="text-sm font-semibold text-[#F4F7FA]">Review</h3>
                {answers.map((a, i) => {
                  const correct = CHALLENGE_QUESTIONS[i]?.correctOption ?? 3;
                  const isCorrect = a === correct;
                  return (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
                      isCorrect ? "border-[#49B06E]/20 bg-[#49B06E]/5" : "border-red-400/20 bg-red-400/5"
                    }`}>
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-[#49B06E] shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <div className="text-xs text-[#F4F7FA]/60">
                        <span className="text-[#F4F7FA]/80">Chart {i + 1}:</span>{" "}
                        {isCorrect ? OPTIONS[correct] : (
                          <>
                            You said "{OPTIONS[a ?? 0]}" — correct answer: "{OPTIONS[correct]}"
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setStarted(false);
                    setSubmitted(false);
                    setCurrentChart(0);
                    setAnswers(new Array(TOTAL_CHARTS).fill(null));
                    loadScores();
                  }}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-[#F4F7FA]/60 rounded-xl text-sm hover:bg-white/10 transition-colors"
                >
                  Try Again
                </button>
                <Link
                  href="/university/strategy-lab"
                  className="px-6 py-2.5 bg-[#27B7C8] text-white rounded-xl text-sm font-medium hover:bg-[#27B7C8]/90 transition-colors"
                >
                  Back to Lab
                </Link>
              </div>

              <p className="mt-8 text-[9px] text-[#F4F7FA]/20">
                All charts used hypothetical data. Performance on this challenge does not predict real trading results.
              </p>
            </div>
          )}
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
