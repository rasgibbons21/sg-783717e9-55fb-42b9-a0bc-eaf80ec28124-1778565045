import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { X, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Milestone {
  id: string;
  check: (stats: MilestoneStats) => boolean;
  message: string;
  emoji: string;
}

interface MilestoneStats {
  completedCount: number;
  streak: number;
  perfectQuizzes: number;
  previousCompleted: number;
  previousStreak: number;
}

const MILESTONES: Milestone[] = [
  {
    id: "first-lesson",
    check: (s) => s.completedCount >= 1 && s.previousCompleted === 0,
    message: "You planted your first bloom! Every expert was once a beginner — you just took the hardest step.",
    emoji: "🌱",
  },
  {
    id: "three-lessons",
    check: (s) => s.completedCount >= 3 && s.previousCompleted < 3,
    message: "Three lessons down! You're already ahead of most people who just talk about investing.",
    emoji: "🌿",
  },
  {
    id: "stage-sprout",
    check: (s) => s.completedCount >= 5 && s.previousCompleted < 5,
    message: "You've graduated from Seed to Sprout! Your garden is starting to take shape.",
    emoji: "🌿",
  },
  {
    id: "stage-grow",
    check: (s) => s.completedCount >= 12 && s.previousCompleted < 12,
    message: "Welcome to the Grow stage! You're building real investing knowledge now.",
    emoji: "🌳",
  },
  {
    id: "stage-bloom",
    check: (s) => s.completedCount >= 22 && s.previousCompleted < 22,
    message: "Full Bloom! You've come so far — your confidence isn't luck, it's earned.",
    emoji: "🌸",
  },
  {
    id: "streak-3",
    check: (s) => s.streak >= 3 && s.previousStreak < 3,
    message: "3 days in a row! Consistency beats intensity every single time.",
    emoji: "🔥",
  },
  {
    id: "streak-7",
    check: (s) => s.streak >= 7 && s.previousStreak < 7,
    message: "A whole week of learning! You're building a habit that will change your financial future.",
    emoji: "⭐",
  },
  {
    id: "streak-14",
    check: (s) => s.streak >= 14 && s.previousStreak < 14,
    message: "Two weeks strong! You're more disciplined than most Wall Street traders.",
    emoji: "💪",
  },
  {
    id: "first-perfect",
    check: (s) => s.perfectQuizzes >= 1 && s.previousCompleted < s.completedCount,
    message: "Perfect quiz score! You really understood that lesson — it shows.",
    emoji: "💯",
  },
  {
    id: "halfway",
    check: (s) => s.completedCount >= 15 && s.previousCompleted < 15,
    message: "Halfway through your journey! Look back at how much you've learned since day one.",
    emoji: "🎯",
  },
  {
    id: "all-done",
    check: (s) => s.completedCount >= 30 && s.previousCompleted < 30,
    message: "You completed every single lesson! Your garden is in full bloom. Time to put this knowledge to work!",
    emoji: "🏆",
  },
];

const STORAGE_KEY = "pansy_milestones_seen";
const STATS_KEY = "pansy_milestone_stats";

export function PansyMilestones() {
  const router = useRouter();
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (router.pathname === "/" || router.pathname === "/onboarding") return;

    const checkMilestones = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("completed, completed_at, quiz_score")
        .eq("user_id", session.user.id)
        .eq("completed", true);

      if (!progress) return;

      const completedCount = progress.length;
      const perfectQuizzes = progress.filter(p => p.quiz_score === 3).length;

      const dates = progress
        .filter(d => d.completed_at)
        .map(d => {
          const dt = new Date(d.completed_at!);
          return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
        });
      const uniqueDates = [...new Set(dates)].sort().reverse();
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < uniqueDates.length; i++) {
        const check = new Date(today);
        check.setDate(check.getDate() - i);
        const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
        if (uniqueDates.includes(key)) streak++;
        else break;
      }

      const seen: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      const prev = JSON.parse(localStorage.getItem(STATS_KEY) || '{"completedCount":0,"streak":0}');

      const stats: MilestoneStats = {
        completedCount,
        streak,
        perfectQuizzes,
        previousCompleted: prev.completedCount || 0,
        previousStreak: prev.streak || 0,
      };

      localStorage.setItem(STATS_KEY, JSON.stringify({ completedCount, streak }));

      const triggered = MILESTONES.find(m => !seen.includes(m.id) && m.check(stats));
      if (triggered) {
        seen.push(triggered.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
        setActiveMilestone(triggered);
        setTimeout(() => setIsVisible(true), 800);
      }
    };

    const timeout = setTimeout(checkMilestones, 1500);
    return () => clearTimeout(timeout);
  }, [router.pathname]);

  const dismiss = () => {
    setIsVisible(false);
    setTimeout(() => setActiveMilestone(null), 300);
  };

  if (!activeMilestone) return null;

  return (
    <div
      className="fixed bottom-24 right-4 z-50 w-80 transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <div className="rounded-2xl border border-[#27B7C8]/30 bg-gradient-to-br from-[#0E1B30] to-[#27B7C8]/10 p-4 shadow-2xl shadow-[#27B7C8]/10">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#27B7C8] to-[#49B06E] text-2xl shadow-md">
            {activeMilestone.emoji}
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-foreground">Pansy</p>
                <PartyPopper className="w-3.5 h-3.5 text-[#F59E0B]" />
              </div>
              <button onClick={dismiss} className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              {activeMilestone.message}
            </p>
            <p className="text-[10px] text-muted-foreground">— Pansy 🌺</p>
          </div>
        </div>
      </div>
    </div>
  );
}
