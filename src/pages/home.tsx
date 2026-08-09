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
  BookOpen, TrendingUp, MessageCircle, NotebookPen,
  ChevronRight, Flame, Target, Sparkles, Play, ArrowRight, Trophy,
} from "lucide-react";
import { motion } from "framer-motion";
import { TimeGreeting } from "@/components/TimeGreeting";
import { GemsLeaderboard } from "@/components/GemsLeaderboard";
import { PansyContextCard } from "@/components/PansyContextCard";

export default function Home() {
  const router = useRouter();
  const { isPro, isTrial, trialDaysLeft, userName } = useSubscription();
  const [user, setUser] = useState<any>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [traderLb, setTraderLb] = useState<{ display_name: string; total_pnl: number; win_rate: number; rank: number }[]>([]);
  const [traderMe, setTraderMe] = useState<{ display_name: string; total_pnl: number; win_rate: number; rank: number } | null>(null);

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
      .select("onboarding_complete")
      .eq("id", session.user.id)
      .single();
    if (profile && !profile.onboarding_complete) {
      router.push("/onboarding");
      return;
    }

    const userProfile = await userService.getCurrentUser();
    setUser(userProfile);

    loadProgress(session.user.id);
    loadBriefing(session.access_token);
    loadTraderLeaderboard(session.access_token);
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

  const totalLessons = 30;
  const progressPercent = Math.min(Math.round((completedCount / totalLessons) * 100), 100);
  const confidenceScore = Math.min(Math.round((completedCount / totalLessons) * 100), 100);

  const journeyStage = completedCount < 5 ? 0 : completedCount < 12 ? 1 : completedCount < 22 ? 2 : 3;
  const stages = [
    { name: "Seed", emoji: "🌱" },
    { name: "Sprout", emoji: "🌿" },
    { name: "Grow", emoji: "🌳" },
    { name: "Bloom", emoji: "🌸" },
  ];

  const getJourneyCoachMessage = (): { message: string; action: { label: string; href: string } } => {
    if (completedCount === 0) {
      return {
        message: "Your first step: learn what a stock actually is. It takes 3 minutes and changes how you see the market.",
        action: { label: "Start First Lesson", href: "/learn" },
      };
    }
    if (completedCount < 5) {
      return {
        message: `${completedCount} lessons done — you're in the Seed stage. Keep going to reach Sprout. Each lesson builds on the last.`,
        action: { label: "Next Lesson", href: "/learn" },
      };
    }
    if (completedCount < 12 && streak === 0) {
      return {
        message: "You haven't studied today yet. Even 5 minutes keeps the momentum going. Your Sprout stage garden needs water!",
        action: { label: "Continue Learning", href: "/learn" },
      };
    }
    if (completedCount < 12) {
      return {
        message: "You're in the Sprout stage now. Try the Practice Trader to apply what you've learned — no real money involved.",
        action: { label: "Try Practice Trading", href: "/practice" },
      };
    }
    if (completedCount < 22) {
      return {
        message: "Growing strong! You know enough to start exploring real stocks. Head to Discover and research some companies.",
        action: { label: "Discover Stocks", href: "/discover" },
      };
    }
    return {
      message: "Full Bloom! You've built a strong foundation. Consider finding a broker to start your real investing journey.",
      action: { label: "Find a Broker", href: "/brokers" },
    };
  };

  const coach = getJourneyCoachMessage();

  return (
    <Layout>
      <SEO title="Home — Bloom" description="Your personalized learning dashboard" />

      <div className="w-full mx-auto space-y-6 pb-24 px-[5%] pt-6">

        {/* ══════ GREETING + STATS ══════ */}
        <div className="space-y-4">
          <div>
            <TimeGreeting fullName={user?.full_name ?? userName} />
            <p className="text-muted-foreground mt-1">Your next small step is ready.</p>
          </div>

          {/* Trial banner */}
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

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Flame className="w-4 h-4 text-orange-400" />, value: streak, label: "day streak" },
              { icon: <Target className="w-4 h-4 text-[#27B7C8]" />, value: `${progressPercent}%`, label: "journey" },
              { icon: <Sparkles className="w-4 h-4 text-[#49B06E]" />, value: confidenceScore, label: "confidence" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                className="bg-card border border-border rounded-2xl p-3 text-center"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {stat.icon}
                  <span className="text-xl font-bold text-foreground">{stat.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══════ CONTINUE YOUR JOURNEY ══════ */}
        <Link href="/learn" className="block">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[#27B7C8]/10 via-card to-[#49B06E]/10">
            <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 80% 20%, rgba(39,183,200,0.3), transparent 60%)" }} />
            <div className="relative p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#27B7C8] uppercase tracking-wider">Continue Your Journey</p>
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    {completedCount === 0 ? "What is a Stock?" : completedCount < 5 ? "Building Your Foundation" : completedCount < 12 ? "Growing Your Knowledge" : "Advanced Strategies"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {completedCount === 0
                      ? "Start your investing journey with the basics"
                      : `${completedCount} lessons completed`}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#27B7C8]/15 flex items-center justify-center shrink-0">
                  <Play className="w-7 h-7 text-[#27B7C8] ml-0.5" />
                </div>
              </div>
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="h-2 rounded-full overflow-hidden bg-muted/40">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(progressPercent, 3)}%`,
                      background: "linear-gradient(90deg, #49B06E, #27B7C8)",
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{completedCount}/{totalLessons} lessons</span>
                  <span className="text-xs font-medium text-[#27B7C8] flex items-center gap-1">
                    Continue Lesson <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* ══════ TODAY WITH PANSY ══════ */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
            Today with Pansy <span className="text-lg">🌺</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {/* Morning Coffee */}
            <div className="bg-card border border-border rounded-2xl p-4">
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
            </div>

            {/* Confidence tip — milestone-aware */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#49B06E]/10 flex items-center justify-center shrink-0 text-lg">
                  💡
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground mb-1">Pansy&apos;s Note</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {streak >= 7
                      ? `${streak} days straight! You're more consistent than most professional traders. That discipline will serve you well.`
                      : streak >= 3
                      ? `${streak}-day streak going! Consistency is the real secret to building wealth — and you've got it.`
                      : completedCount === 0
                      ? "You don't need to know everything to start. The best investors began exactly where you are now."
                      : completedCount < 5
                      ? `${completedCount} lesson${completedCount > 1 ? "s" : ""} done! You've already started — that puts you ahead of most people.`
                      : completedCount < 12
                      ? `${completedCount} lessons and growing! You're in the Sprout stage now — real knowledge is taking root.`
                      : completedCount < 22
                      ? "You're in the Grow stage. Every lesson compounds, just like your future investments will."
                      : "Full Bloom! Your confidence isn't luck — it's earned through every single lesson."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════ PANSY'S NEXT STEP ══════ */}
        <PansyContextCard
          message={coach.message}
          action={coach.action}
          variant="coach"
        />

        {/* ══════ YOUR LEARNING PATH ══════ */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Your Learning Path</p>
          <div className="flex items-center justify-between">
            {stages.map((stage, i) => (
              <div key={stage.name} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all"
                    style={{
                      background: i <= journeyStage
                        ? "linear-gradient(135deg, rgba(39,183,200,0.15), rgba(73,176,110,0.15))"
                        : "rgba(255,255,255,0.03)",
                      border: i === journeyStage
                        ? "2px solid rgba(39,183,200,0.4)"
                        : i < journeyStage
                        ? "2px solid rgba(73,176,110,0.3)"
                        : "1px solid hsl(var(--border))",
                      boxShadow: i === journeyStage ? "0 0 12px rgba(39,183,200,0.2)" : "none",
                    }}
                  >
                    {stage.emoji}
                  </div>
                  <span className={`text-xs font-medium ${i === journeyStage ? "text-[#27B7C8]" : i < journeyStage ? "text-[#49B06E]" : "text-muted-foreground"}`}>
                    {stage.name}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <div
                    className="w-6 h-px mx-1 mt-[-18px]"
                    style={{ background: i < journeyStage ? "linear-gradient(90deg, #49B06E, #27B7C8)" : "hsl(var(--border))" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ══════ LEADERBOARDS — SIDE BY SIDE ══════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lessons / Gems Leaderboard */}
          <GemsLeaderboard />

          {/* Trader P&L Leaderboard */}
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
        </div>

        {/* ══════ QUICK ACTIONS ══════ */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { href: "/learn", label: "Learn", icon: <BookOpen className="w-6 h-6" />, color: "#27B7C8" },
              { href: "/practice", label: "Practice", icon: <TrendingUp className="w-6 h-6" />, color: "#49B06E" },
              { href: "/ask-pansy", label: "Pansy", icon: <MessageCircle className="w-6 h-6" />, color: "#8B5CF6" },
              { href: "/journal", label: "Journal", icon: <NotebookPen className="w-6 h-6" />, color: "#F59E0B" },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="flex flex-col items-center gap-2 p-3 bg-card border border-border rounded-2xl hover:border-accent/30 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${action.color}15`, color: action.color }}>
                  {action.icon}
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ══════ DISCLAIMER ══════ */}
        <div className="p-4 bg-muted/50 border border-border rounded-xl">
          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            This is educational content only and does not constitute financial advice. Bloom is not liable for any investment decisions or losses.
          </p>
        </div>
      </div>
    </Layout>
  );
}
