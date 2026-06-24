import { useState, useEffect, useCallback } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Trophy, Lock, CheckCircle, Sparkles, AlertTriangle,
  Loader2, TrendingUp, BookOpen, NotebookPen, ChevronRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Level { level: number; name: string; badge: string; xpRequired: number }

interface MissionStatus {
  key: string;
  title: string;
  description: string;
  xpReward: number;
  unlockedByLesson: { moduleSlug: string; lessonSlug: string; lessonTitle: string };
  status: "locked" | "unlocked" | "completed";
  completedAt: string | null;
}

interface Habits {
  totalClosedTrades: number;
  stopSetRate: number;
  thesisRate: number;
  targetSetRate: number;
  avgDisciplineScore: number | null;
  journalCompletionRate: number;
  overallHabitScore: number;
}

interface ProgressionData {
  xp: number;
  level: {
    current: Level;
    next: Level | null;
    progressPct: number;
    xpToNext: number | null;
    allLevels: readonly Level[];
  };
  missions: MissionStatus[];
  habits: Habits;
}

interface PageProps { requiresClientAuth?: boolean }

// ── Helpers ────────────────────────────────────────────────────────────────
async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = await getToken();
  return fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
  });
}

function habitColor(pct: number) {
  if (pct >= 80) return "bg-[#49B06E]";
  if (pct >= 50) return "bg-yellow-400";
  return "bg-[#ef4444]";
}

function habitTextColor(pct: number) {
  if (pct >= 80) return "text-[#49B06E]";
  if (pct >= 50) return "text-yellow-400";
  return "text-[#ef4444]";
}

// ── Habit Bar ──────────────────────────────────────────────────────────────
function HabitBar({ label, value, suffix = "%", description }: {
  label: string; value: number | null; suffix?: string; description: string;
}) {
  const pct = value ?? 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#F4F7FA]/70">{label}</span>
        <span className={`text-xs font-mono font-semibold ${habitTextColor(pct)}`}>
          {value != null ? `${pct}${suffix}` : "—"}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#0E1B30] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${habitColor(pct)}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className="text-[9px] text-[#F4F7FA]/30 mt-0.5">{description}</p>
    </div>
  );
}

// ── Mission Card ────────────────────────────────────────────────────────────
function MissionCard({ mission }: { mission: MissionStatus }) {
  const locked = mission.status === "locked";
  const completed = mission.status === "completed";
  const unlocked = mission.status === "unlocked";

  return (
    <div className={`rounded-xl p-4 border transition-all ${
      completed ? "border-[#49B06E]/30 bg-[#49B06E]/5" :
      unlocked  ? "border-[#27B7C8]/30 bg-[#27B7C8]/5" :
                  "border-[#27B7C8]/10 bg-[#16264A] opacity-60"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          completed ? "bg-[#49B06E]/20" : unlocked ? "bg-[#27B7C8]/15" : "bg-[#0E1B30]"
        }`}>
          {completed ? <CheckCircle className="w-4 h-4 text-[#49B06E]" /> :
           unlocked  ? <Sparkles className="w-4 h-4 text-[#27B7C8]" /> :
                       <Lock className="w-4 h-4 text-[#F4F7FA]/20" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-sm font-semibold ${
              completed ? "text-[#49B06E]" : unlocked ? "text-[#F4F7FA]" : "text-[#F4F7FA]/40"
            }`}>{mission.title}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
              completed ? "bg-[#49B06E]/15 text-[#49B06E]" : "bg-[#27B7C8]/10 text-[#27B7C8]"
            }`}>+{mission.xpReward} XP</span>
          </div>
          <p className={`text-xs leading-relaxed mb-2 ${
            locked ? "text-[#F4F7FA]/30" : "text-[#F4F7FA]/60"
          }`}>{mission.description}</p>
          {locked && (
            <p className="text-[10px] text-[#F4F7FA]/30">
              Complete{" "}
              <Link
                href={`/university/${mission.unlockedByLesson.moduleSlug}/${mission.unlockedByLesson.lessonSlug}`}
                className="underline text-[#27B7C8]/50 hover:text-[#27B7C8]"
              >
                {mission.unlockedByLesson.lessonTitle}
              </Link>{" "}
              to unlock
            </p>
          )}
          {unlocked && (
            <p className="text-[10px] text-[#27B7C8]">
              Active — complete this in the{" "}
              <Link href="/practice" className="underline hover:opacity-80">Practice Trader</Link>
            </p>
          )}
          {completed && mission.completedAt && (
            <p className="text-[10px] text-[#49B06E]/70">
              Completed {new Date(mission.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Level Journey ──────────────────────────────────────────────────────────
function LevelJourney({ allLevels, currentLevel, xp }: {
  allLevels: readonly Level[];
  currentLevel: number;
  xp: number;
}) {
  return (
    <div className="rounded-xl bg-[#16264A] border border-[#27B7C8]/15 p-4">
      <h2 className="text-sm font-semibold text-[#F4F7FA] mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-[#27B7C8]" />
        Level Journey
      </h2>
      <div className="space-y-2">
        {allLevels.map((lvl) => {
          const achieved = xp >= lvl.xpRequired;
          const isCurrent = lvl.level === currentLevel;
          return (
            <div key={lvl.level} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
              isCurrent ? "bg-[#27B7C8]/10 border border-[#27B7C8]/30" :
              achieved  ? "bg-[#49B06E]/5 border border-[#49B06E]/15" :
                          "bg-[#0E1B30] border border-transparent opacity-40"
            }`}>
              <span className="text-lg w-8 text-center flex-shrink-0">{lvl.badge}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${
                    isCurrent ? "text-[#27B7C8]" : achieved ? "text-[#49B06E]" : "text-[#F4F7FA]/40"
                  }`}>{lvl.name}</span>
                  {isCurrent && <span className="text-[9px] bg-[#27B7C8]/20 text-[#27B7C8] px-1.5 py-0.5 rounded font-semibold">CURRENT</span>}
                  {achieved && !isCurrent && <CheckCircle className="w-3 h-3 text-[#49B06E]" />}
                </div>
                <p className="text-[9px] text-[#F4F7FA]/30">{lvl.xpRequired.toLocaleString()} XP required</p>
              </div>
              <span className={`text-xs font-mono flex-shrink-0 ${
                isCurrent ? "text-[#27B7C8]" : achieved ? "text-[#49B06E]/60" : "text-[#F4F7FA]/20"
              }`}>Lv {lvl.level}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Pro Gate ────────────────────────────────────────────────────────────────
function ProGate() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Lock className="w-10 h-10 text-[#27B7C8]/40 mb-4" />
      <h2 className="font-serif text-xl font-bold text-[#F4F7FA] mb-2">Pro Feature</h2>
      <p className="text-sm text-[#F4F7FA]/50 mb-6 max-w-xs">
        Progression, missions, and discipline tracking are available to Pro subscribers.
      </p>
      <Link href="/subscription-offer"
        className="px-6 py-3 rounded-xl bg-[#27B7C8] text-[#0E1B30] font-semibold text-sm hover:bg-[#27B7C8]/90 transition-colors">
        Upgrade to Pro
      </Link>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ProgressionPage(_props: PageProps) {
  const { isPro, isLoading: authLoading } = useSubscription();
  const [data, setData] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/api/practice/progress");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load progression");
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isPro) load();
    else if (!authLoading && !isPro) setLoading(false);
  }, [authLoading, isPro, load]);

  const showProGate = !authLoading && !isPro;

  return (
    <>
      <Head><title>My Progression — Bloom</title></Head>
      <Layout>
        <div className="min-h-screen bg-[#0E1B30] px-4 py-6 max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-[#27B7C8]" />
              <h1 className="font-serif text-2xl font-bold text-[#F4F7FA]">My Progression</h1>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-[#27B7C8]/10 border border-[#27B7C8]/20 px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-[#27B7C8] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#27B7C8]/90 leading-relaxed">
                <strong>Discipline is rewarded by habits, not profits.</strong> Scores reflect process — using stops, writing plans, following your thesis, completing journals.
              </p>
            </div>
          </div>

          {(authLoading || (loading && isPro)) && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-5 h-5 text-[#27B7C8] animate-spin" />
              <span className="text-sm text-[#F4F7FA]/50">Loading your progression…</span>
            </div>
          )}

          {showProGate && <ProGate />}

          {!loading && !authLoading && isPro && error && (
            <div className="rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 px-4 py-3 text-sm text-[#ef4444] mb-4">
              {error} <button onClick={load} className="underline ml-2">Retry</button>
            </div>
          )}

          {!authLoading && !loading && isPro && !error && data && (
            <div className="space-y-6">

              {/* ── Level Card ──────────────────────────────────────────── */}
              <div className="rounded-2xl bg-[#16264A] border border-[#27B7C8]/20 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0E1B30] border border-[#27B7C8]/20 flex items-center justify-center text-3xl flex-shrink-0">
                    {data.level.current.badge}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#F4F7FA]/40 uppercase tracking-wide mb-0.5">Level {data.level.current.level} of 9</p>
                    <h2 className="font-serif text-xl font-bold text-[#F4F7FA]">{data.level.current.name}</h2>
                    <p className="text-xs text-[#27B7C8] font-mono mt-0.5">{data.xp.toLocaleString()} XP total</p>
                  </div>
                </div>

                {data.level.next ? (
                  <>
                    <div className="h-2 rounded-full bg-[#0E1B30] overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full bg-[#27B7C8] transition-all"
                        style={{ width: `${data.level.progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#F4F7FA]/40">
                      <span>{data.level.current.name}</span>
                      <span>{data.level.xpToNext?.toLocaleString()} XP to {data.level.next.name} {data.level.next.badge}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-2">
                    <span className="text-sm text-[#49B06E] font-semibold">🎓 Maximum level achieved!</span>
                  </div>
                )}
              </div>

              {/* ── Discipline Habits ────────────────────────────────────── */}
              <div className="rounded-xl bg-[#16264A] border border-[#27B7C8]/15 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#F4F7FA] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#27B7C8]" />
                    Discipline Habits
                  </h2>
                  <div className={`text-sm font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    data.habits.overallHabitScore >= 80 ? "text-[#49B06E] bg-[#49B06E]/10 border-[#49B06E]/30" :
                    data.habits.overallHabitScore >= 50 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" :
                    "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30"
                  }`}>
                    {data.habits.overallHabitScore}/100
                  </div>
                </div>

                {data.habits.totalClosedTrades === 0 ? (
                  <div className="text-center py-6 text-[#F4F7FA]/30 text-sm">
                    Close your first trade to see habit metrics.
                    <div className="mt-2">
                      <Link href="/practice" className="text-[#27B7C8] hover:underline text-xs">Go to Practice Trader →</Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <HabitBar
                      label="Stop Set Rate"
                      value={data.habits.stopSetRate}
                      description="% of trades with a stop-loss (invalidation level) defined before entry"
                    />
                    <HabitBar
                      label="Thesis Written"
                      value={data.habits.thesisRate}
                      description="% of trades with a written pre-trade plan (the most important habit)"
                    />
                    <HabitBar
                      label="Target Set Rate"
                      value={data.habits.targetSetRate}
                      description="% of trades with a profit target defined before entry"
                    />
                    <HabitBar
                      label="Avg AI Discipline Score"
                      value={data.habits.avgDisciplineScore}
                      description="Pansy's average process score across all reviewed trades (plan adherence, not P/L)"
                    />
                    <HabitBar
                      label="Journal Completion"
                      value={data.habits.journalCompletionRate}
                      description="% of closed trades that triggered a full Pansy review and journal entry"
                    />
                    <p className="text-[9px] text-[#F4F7FA]/25 leading-relaxed pt-1">
                      Discipline is rewarded by habits, not by profits. A losing trade with a written plan, a stop, and a journal entry scores higher than a winning trade with no process.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Missions ────────────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[#F4F7FA] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#27B7C8]" />
                    Missions
                  </h2>
                  <div className="flex gap-2 text-[10px] text-[#F4F7FA]/40">
                    <span className="text-[#49B06E]">{data.missions.filter(m => m.status === "completed").length} done</span>
                    <span>·</span>
                    <span className="text-[#27B7C8]">{data.missions.filter(m => m.status === "unlocked").length} active</span>
                    <span>·</span>
                    <span>{data.missions.filter(m => m.status === "locked").length} locked</span>
                  </div>
                </div>
                <p className="text-xs text-[#F4F7FA]/40 mb-3 leading-relaxed">
                  Each mission is unlocked by completing its paired lesson in Bloom University. Then apply what you learned in the Practice Trader to complete it.
                </p>
                <div className="space-y-3">
                  {/* Completed first, then unlocked, then locked */}
                  {[
                    ...data.missions.filter(m => m.status === "completed"),
                    ...data.missions.filter(m => m.status === "unlocked"),
                    ...data.missions.filter(m => m.status === "locked"),
                  ].map(m => <MissionCard key={m.key} mission={m} />)}
                </div>
              </div>

              {/* ── Level Journey ────────────────────────────────────────── */}
              <LevelJourney
                allLevels={data.level.allLevels}
                currentLevel={data.level.current.level}
                xp={data.xp}
              />

              {/* ── Quick Links ─────────────────────────────────────────── */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { href: "/university", icon: <BookOpen className="w-4 h-4" />, label: "University", sub: "Complete lessons to unlock missions" },
                  { href: "/practice", icon: <TrendingUp className="w-4 h-4" />, label: "Practice", sub: "Earn XP by trading with process" },
                  { href: "/journal", icon: <NotebookPen className="w-4 h-4" />, label: "Journal", sub: "Review your trade history" },
                ].map(({ href, icon, label, sub }) => (
                  <Link key={href} href={href}
                    className="rounded-xl bg-[#16264A] border border-[#27B7C8]/10 p-3 hover:border-[#27B7C8]/30 hover:bg-[#27B7C8]/5 transition-colors group">
                    <div className="text-[#27B7C8]/70 group-hover:text-[#27B7C8] mb-2">{icon}</div>
                    <p className="text-xs font-semibold text-[#F4F7FA]">{label}</p>
                    <p className="text-[9px] text-[#F4F7FA]/35 mt-0.5 leading-snug">{sub}</p>
                    <ChevronRight className="w-3 h-3 text-[#F4F7FA]/20 mt-1 group-hover:text-[#27B7C8]/50" />
                  </Link>
                ))}
              </div>

              <div className="text-center pb-4">
                <p className="text-[10px] text-[#F4F7FA]/20 leading-relaxed max-w-sm mx-auto">
                  Bloom is an educational simulator. XP and progression reflect practice habits only — not real trading performance. Not financial advice.
                </p>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const result = await requireProUserSSR(req as Parameters<typeof requireProUserSSR>[0]);
  if (result.status === "not-pro") return { props: {} };
  if (result.status === "unauthenticated") return { redirect: { destination: "/auth", permanent: false } };
  return { props: { requiresClientAuth: result.status === "no-cookie" } };
};
