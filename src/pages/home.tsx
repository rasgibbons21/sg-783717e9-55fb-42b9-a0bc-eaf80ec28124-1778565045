/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Skeleton } from "@/components/ui/skeleton";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, TrendingUp, MessageCircle,
  ChevronRight, Flame, Sparkles, Play, Target, Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerChild, cardHover } from "@/lib/motion";
import { TimeGreeting } from "@/components/TimeGreeting";
import { GemsLeaderboard } from "@/components/GemsLeaderboard";
import { PansyContextCard } from "@/components/PansyContextCard";
import { StreakCalendar } from "@/components/StreakCalendar";
import { DailyChallenge } from "@/components/DailyChallenge";
import { TrophyCase } from "@/components/TrophyCase";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
import { AdMobBanner } from "@/components/AdMobBanner";
import { LateBloomersSignup } from "@/components/LateBloomersSignup";

import { haptic as hx } from "@/lib/motion";
const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };
const cardSpring = { type: "spring" as const, stiffness: 400, damping: 25 };
const db = supabase as any;

function ProgressRing({ percent, size = 120, stroke = 8, color = "#27B7C8", label, sublabel }: {
  percent: number; size?: number; stroke?: number; color?: string; label: string; sublabel: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{percent}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  );
}

function MiniDonut({ segments, size = 56 }: { segments: { pct: number; color: string }[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const innerR = outerR * 0.6;
  const gap = 0.03;

  if (segments.length === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={(outerR + innerR) / 2} fill="none" stroke="hsl(var(--border))" strokeWidth={outerR - innerR} strokeDasharray="3 3" />
      </svg>
    );
  }

  let startAngle = -Math.PI / 2;
  const arcs: { path: string; color: string }[] = [];
  segments.forEach(seg => {
    const sweep = (seg.pct / 100) * Math.PI * 2 - gap;
    if (sweep <= 0) return;
    const endAngle = startAngle + sweep;
    const x1o = cx + outerR * Math.cos(startAngle), y1o = cy + outerR * Math.sin(startAngle);
    const x2o = cx + outerR * Math.cos(endAngle), y2o = cy + outerR * Math.sin(endAngle);
    const x1i = cx + innerR * Math.cos(endAngle), y1i = cy + innerR * Math.sin(endAngle);
    const x2i = cx + innerR * Math.cos(startAngle), y2i = cy + innerR * Math.sin(startAngle);
    const la = sweep > Math.PI ? 1 : 0;
    arcs.push({ path: `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${la} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 ${la} 0 ${x2i} ${y2i} Z`, color: seg.color });
    startAngle = endAngle + gap;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} />)}
      <circle cx={cx} cy={cy} r={innerR - 1} className="fill-card" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const { isPro, isTrial, trialDaysLeft, userName } = useSubscription();
  const [user, setUser] = useState<any>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [hustleProgress, setHustleProgress] = useState(0);
  const [recommendedPath, setRecommendedPath] = useState<"hustle" | "budget" | "invest">("invest");
  const [traderLb, setTraderLb] = useState<{ display_name: string; total_pnl: number; win_rate: number; rank: number }[]>([]);
  const [traderMe, setTraderMe] = useState<{ display_name: string; total_pnl: number; win_rate: number; rank: number } | null>(null);
  const [budgetCount, setBudgetCount] = useState(0);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const session = await authService.getCurrentSession();
    if (!session) {
      router.push("/");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_complete, experience_level, risk_tolerance")
      .eq("id", session.user.id)
      .single();
    if (profile && !profile.onboarding_complete) {
      router.push("/onboarding");
      return;
    }

    if (profile) {
      const struggle = profile.risk_tolerance as string | null;
      const level = profile.experience_level as string | null;
      if (level === "beginner" || struggle === "earning") {
        setRecommendedPath("hustle");
      } else if (struggle === "spending" || struggle === "debt") {
        setRecommendedPath("budget");
      } else {
        setRecommendedPath("invest");
      }
    }

    const userProfile = await userService.getCurrentUser();
    setUser(userProfile);

    loadProgress(session.user.id);
    loadBriefing(session.access_token);
    loadTraderLeaderboard(session.access_token);
    loadHustleProgress(session.user.id);
    loadBudgetCount(session.user.id);
  };

  const loadProgress = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("completed, completed_at")
        .eq("user_id", userId)
        .eq("completed", true);

      if (error || !data) return;
      setCompletedCount(data.length);

      const dates = data
        .filter(d => d.completed_at)
        .map(d => {
          const dt = new Date(d.completed_at!);
          return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
        });
      const uniqueDates = [...new Set(dates)].sort().reverse();

      let s = 0;
      const today = new Date();
      for (let i = 0; i < uniqueDates.length; i++) {
        const check = new Date(today);
        check.setDate(check.getDate() - i);
        const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
        if (uniqueDates.includes(key)) s++;
        else break;
      }
      setStreak(s);
    } catch {
      // silent
    }
  };

  const loadBriefing = async (token: string) => {
    setBriefingLoading(true);
    try {
      const res = await fetch("/api/daily-briefing", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.content) setBriefing(data.content);
    } catch {
      // silent
    } finally {
      setBriefingLoading(false);
    }
  };

  const loadTraderLeaderboard = async (token: string) => {
    try {
      const res = await fetch("/api/practice/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setTraderLb(data.top ?? []);
      setTraderMe(data.me ?? null);
    } catch {
      // silent
    }
  };

  const loadHustleProgress = async (userId: string) => {
    try {
      const { data } = await db.from("side_hustle_progress").select("completed_steps").eq("user_id", userId);
      if (data && data.length > 0) {
        const maxSteps = Math.max(...data.map((d: any) => (d.completed_steps || []).length));
        setHustleProgress(maxSteps);
      }
    } catch {
      // silent
    }
  };

  const loadBudgetCount = async (userId: string) => {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data } = await db.from("budget_entries").select("id").eq("user_id", userId).gte("date", monthStart);
      if (data) setBudgetCount(data.length);
    } catch {
      // silent
    }
  };

  const totalLessons = 36;
  const progressPercent = Math.min(Math.round((completedCount / totalLessons) * 100), 100);

  const journeyStage = completedCount < 5 ? 0 : completedCount < 12 ? 1 : completedCount < 22 ? 2 : 3;
  const stages = [
    { name: "Foundation", count: 5 },
    { name: "Build", count: 7 },
    { name: "Launch", count: 10 },
    { name: "Grow", count: 14 },
  ];

  const getJourneyCoachMessage = (): { message: string; action: { label: string; href: string } } => {
    if (hustleProgress > 0 && hustleProgress < 12) {
      return {
        message: `You're ${hustleProgress} steps into your side hustle journey. Keep going — step ${hustleProgress + 1} is waiting!`,
        action: { label: "Continue Hustle", href: "/side-hustle" },
      };
    }
    if (completedCount === 0 && hustleProgress === 0) {
      if (recommendedPath === "hustle") {
        return {
          message: "Based on your answers, let's start by building some income. Lexi's got your 12-step plan ready — pick a hustle and go!",
          action: { label: "Start Side Hustle", href: "/side-hustle" },
        };
      }
      if (recommendedPath === "budget") {
        return {
          message: "Let's start by getting honest about where your money goes. Track your first expense — it takes 30 seconds.",
          action: { label: "Open Budget Tracker", href: "/budget-tracker" },
        };
      }
      return {
        message: "You're ready to learn how money works. Start with your first lesson — I'll walk you through everything.",
        action: { label: "Start Learning", href: "/learn" },
      };
    }
    if (completedCount < 5) {
      return {
        message: `${completedCount} lessons done — you're building your foundation. Each one makes the next one easier.`,
        action: { label: "Next Lesson", href: "/learn" },
      };
    }
    if (completedCount < 12) {
      return {
        message: "You're in the Build phase. Try the Practice Trader to apply what you've learned — no real money involved.",
        action: { label: "Try Practice Trading", href: "/practice" },
      };
    }
    if (completedCount < 22) {
      return {
        message: "Launch phase! You know enough to start exploring real stocks. Head to Discover and research some companies.",
        action: { label: "Discover Stocks", href: "/discover" },
      };
    }
    return {
      message: "Full Bloom! You've built a strong foundation. Consider finding a broker to start your real investing journey.",
      action: { label: "Find a Broker", href: "/brokers" },
    };
  };

  const coach = getJourneyCoachMessage();

  const hustlePct = Math.round((hustleProgress / 12) * 100);
  const budgetActive = budgetCount > 0;

  const overallPct = recommendedPath === "hustle"
    ? hustlePct
    : recommendedPath === "budget"
    ? (budgetActive ? Math.min(budgetCount * 10, 100) : 0)
    : progressPercent;

  const donutSegments = [
    { pct: progressPercent > 0 ? Math.max(progressPercent, 5) : 0, color: "#27B7C8" },
    { pct: hustlePct > 0 ? Math.max(hustlePct, 5) : 0, color: "#49B06E" },
    { pct: budgetActive ? 15 : 0, color: "#F59E0B" },
  ].filter(s => s.pct > 0);

  const remainingPct = 100 - donutSegments.reduce((s, d) => s + d.pct, 0);
  if (remainingPct > 0) donutSegments.push({ pct: remainingPct, color: "hsl(var(--border))" });

  return (
    <Layout>
      <SEO title="Dashboard — Bloom | Your Investing Learning Hub" description="Your personalized financial education dashboard. Track streaks, complete daily challenges, earn XP and badges, view your portfolio, and climb the leaderboard. Bloom makes learning about money feel like a game." />

      <div className="w-full mx-auto space-y-5 pb-24 px-[5%] pt-6">

        {/* ══════ GREETING ══════ */}
        <div>
          <TimeGreeting fullName={user?.full_name ?? userName} />
          <p className="text-muted-foreground mt-1 text-sm">Your next step is ready.</p>
        </div>

        {isTrial && (
          <Link href="/subscription" className="block">
            <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{
              background: "linear-gradient(135deg, rgba(39,183,200,0.15), rgba(73,176,110,0.1))",
              border: "1px solid rgba(39,183,200,0.3)",
            }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#27B7C8]" />
                <span className="text-sm text-foreground">
                  <span className="font-semibold">{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}</span>
                  <span className="text-muted-foreground"> left in your free trial</span>
                </span>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#27B7C8] text-[#0E1B30]">
                Subscribe
              </span>
            </div>
          </Link>
        )}

        {/* ══════ OVERALL PROGRESS + STATS ══════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...cardSpring }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Overall Progress</h3>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-foreground">{streak}</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ProgressRing
              percent={overallPct}
              size={110}
              stroke={8}
              color={recommendedPath === "hustle" ? "#49B06E" : recommendedPath === "budget" ? "#F59E0B" : "#27B7C8"}
              label={overallPct === 0 ? "Get started" : overallPct === 100 ? "Complete!" : "In progress"}
              sublabel={recommendedPath === "hustle" ? `${hustleProgress}/12 steps` : recommendedPath === "budget" ? `${budgetCount} tracked` : `${completedCount}/${totalLessons} lessons`}
            />

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#27B7C8]" />
                <span className="text-xs text-muted-foreground flex-1">Lessons</span>
                <span className="text-xs font-semibold text-foreground">{completedCount}/{totalLessons}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#49B06E]" />
                <span className="text-xs text-muted-foreground flex-1">Side Hustle</span>
                <span className="text-xs font-semibold text-foreground">{hustleProgress}/12</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-xs text-muted-foreground flex-1">Budget</span>
                <span className="text-xs font-semibold text-foreground">{budgetCount > 0 ? "Active" : "—"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══════ PHASE BREAKDOWN ══════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ...cardSpring }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <h3 className="text-sm font-bold text-foreground mb-4">Phase Breakdown</h3>
          <div className="space-y-3">
            {stages.map((stage, i) => {
              const stageStart = i === 0 ? 0 : stages.slice(0, i).reduce((s, st) => s + st.count, 0);
              const stageEnd = stageStart + stage.count;
              const done = Math.max(0, Math.min(completedCount - stageStart, stage.count));
              const active = i === journeyStage;
              const completed = i < journeyStage;
              return (
                <div key={stage.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    completed ? "bg-[#49B06E]/15 text-[#49B06E]"
                    : active ? "bg-[#27B7C8]/15 text-[#27B7C8]"
                    : "bg-muted/50 text-muted-foreground"
                  }`}>
                    {completed ? "✓" : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${active ? "text-foreground" : completed ? "text-[#49B06E]" : "text-muted-foreground"}`}>
                        {stage.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{done}/{stage.count}</span>
                    </div>
                    <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(done / stage.count) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.1 * i }}
                        className="h-full rounded-full"
                        style={{
                          background: completed
                            ? "#49B06E"
                            : active
                            ? "linear-gradient(90deg, #27B7C8, #49B06E)"
                            : "hsl(var(--border))",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ══════ CURRENT MISSION ══════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...cardSpring }}
          className="rounded-2xl border border-border overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.06), rgba(73,176,110,0.04))" }}
        >
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌺</span>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Mission</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                style={{
                  background: recommendedPath === "hustle" ? "rgba(73,176,110,0.12)" : recommendedPath === "budget" ? "rgba(245,158,11,0.12)" : "rgba(39,183,200,0.12)",
                  color: recommendedPath === "hustle" ? "#49B06E" : recommendedPath === "budget" ? "#F59E0B" : "#27B7C8",
                  border: `1px solid ${recommendedPath === "hustle" ? "rgba(73,176,110,0.2)" : recommendedPath === "budget" ? "rgba(245,158,11,0.2)" : "rgba(39,183,200,0.2)"}`,
                }}>
                {recommendedPath === "hustle" ? "Side Hustle" : recommendedPath === "budget" ? "Budgeting" : "Investing"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{coach.message}</p>
            <Link href={coach.action.href}>
              <motion.button
                whileTap={{ scale: 0.94, y: 1 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: recommendedPath === "hustle"
                    ? "0 6px 24px rgba(73,176,110,0.35)"
                    : recommendedPath === "budget"
                    ? "0 6px 24px rgba(245,158,11,0.35)"
                    : "0 6px 24px rgba(39,183,200,0.35)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                onClick={() => hx.bloom()}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-2"
                style={{
                  background: recommendedPath === "hustle"
                    ? "linear-gradient(135deg, #49B06E, #27B7C8)"
                    : recommendedPath === "budget"
                    ? "linear-gradient(135deg, #F59E0B, #F97316)"
                    : "linear-gradient(135deg, #27B7C8, #49B06E)",
                  color: "#0E1B30",
                }}
              >
                {coach.action.label} <ChevronRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* ══════ ACTIVITY OVERVIEW ══════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, ...cardSpring }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
            <MiniDonut segments={donutSegments.filter(s => s.color !== "hsl(var(--border))")} size={40} />
          </div>

          <div className="space-y-3">
            {completedCount > 0 && (
              <Link href="/learn" className="block">
                <motion.div whileTap={{ scale: 0.98 }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#27B7C8]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-[#27B7C8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Continue Learning</p>
                    <p className="text-xs text-muted-foreground">{completedCount} lessons completed</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 bg-muted/40 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full bg-[#27B7C8]" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              </Link>
            )}

            {hustleProgress > 0 && (
              <Link href="/side-hustle" className="block">
                <motion.div whileTap={{ scale: 0.98 }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#49B06E]/10 flex items-center justify-center shrink-0 text-lg">
                    ⚡
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Side Hustle Journey</p>
                    <p className="text-xs text-muted-foreground">Step {hustleProgress} of 12</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 bg-muted/40 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full bg-[#49B06E]" style={{ width: `${hustlePct}%` }} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </motion.div>
              </Link>
            )}

            {budgetActive && (
              <Link href="/budget-tracker" className="block">
                <motion.div whileTap={{ scale: 0.98 }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Budget Tracker</p>
                    <p className="text-xs text-muted-foreground">{budgetCount} expenses this month</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </motion.div>
              </Link>
            )}
          </div>
        </motion.div>

        {/* ══════ PANSY'S NOTE ══════ */}
        <PansyContextCard
          message={coach.message}
          action={coach.action}
          variant="coach"
        />

        {/* ══════ TODAY ══════ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="space-y-3"
        >
          <h3 className="font-serif text-base font-bold text-foreground">Today</h3>

          <DailyChallenge />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, ...cardSpring }}
            className="bg-card border border-border rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 text-lg">
                ☕
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground mb-1">Morning Coffee</p>
                {briefingLoading ? (
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                ) : briefing ? (
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{briefing}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Today&apos;s market context is brewing...</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <PushNotificationPrompt />

        <StreakCalendar />

        <TrophyCase />

        {/* ══════ LEADERBOARDS ══════ */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <GemsLeaderboard />

          <Link href="/practice" className="block">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#27B7C8]" /> Top Traders
                </h3>
                <span className="text-xs text-[#27B7C8] font-medium flex items-center gap-1">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              {traderLb.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No trades closed yet — be the first!</p>
              ) : (
                <div className="space-y-1.5">
                  {traderLb.slice(0, 5).map((row) => {
                    const medals: Record<number, string> = { 1: "\u{1F947}", 2: "\u{1F948}", 3: "\u{1F949}" };
                    const isPositive = row.total_pnl >= 0;
                    return (
                      <div key={row.rank} className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-muted/50">
                        <span className="w-6 text-center text-sm font-semibold text-muted-foreground">
                          {medals[row.rank] ?? row.rank}
                        </span>
                        <span className="flex-1 text-sm font-medium text-foreground truncate">
                          {row.display_name}
                        </span>
                        <span className={`text-xs font-bold ${isPositive ? "text-[#49B06E]" : "text-red-400"}`}>
                          {isPositive ? "+" : ""}${row.total_pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {traderMe && traderMe.rank > 5 && (
                <div className="border-t border-border pt-2">
                  <div className="flex items-center gap-2 rounded-xl px-2 py-2 bg-[#27B7C8]/10 border border-[#27B7C8]/20">
                    <span className="w-6 text-center text-sm font-semibold text-[#27B7C8]">{traderMe.rank}</span>
                    <span className="flex-1 text-sm font-medium text-foreground truncate">You</span>
                    <span className={`text-xs font-bold ${traderMe.total_pnl >= 0 ? "text-[#49B06E]" : "text-red-400"}`}>
                      {traderMe.total_pnl >= 0 ? "+" : ""}${traderMe.total_pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Link>
        </motion.div>

        {/* ══════ QUICK ACTIONS ══════ */}
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-3"
        >
          <h3 className="font-serif text-base font-bold text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { href: "/learn", label: "Learn", icon: <BookOpen className="w-6 h-6" />, color: "#27B7C8" },
              { href: "/paper-trader-v2", label: "Trade", icon: <TrendingUp className="w-6 h-6" />, color: "#49B06E" },
              { href: "/budget-tracker", label: "Budget", icon: <Target className="w-6 h-6" />, color: "#F59E0B" },
              { href: "/ask-pansy", label: "Pansy", icon: <MessageCircle className="w-6 h-6" />, color: "#8B5CF6" },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <motion.div
                  variants={staggerChild}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1, boxShadow: `0 8px 24px ${action.color}25` }}
                  onClick={() => hx.tap()}
                  className="flex flex-col items-center gap-2 p-3 bg-card border border-border rounded-2xl transition-colors"
                  style={{ boxShadow: `0 2px 8px ${action.color}10` }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${action.color}15`, color: action.color }}
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {action.icon}
                  </motion.div>
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        <LateBloomersSignup />

        <AdMobBanner format="banner" />

        <div className="p-4 bg-muted/50 border border-border rounded-xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </div>
      </div>
    </Layout>
  );
}
