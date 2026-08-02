import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Milestone {
  id: string;
  check: (stats: MilestoneStats) => boolean;
  message: string;
  emoji: string;
  celebration?: "confetti" | "glow" | "sparkle";
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
    celebration: "confetti",
  },
  {
    id: "three-lessons",
    check: (s) => s.completedCount >= 3 && s.previousCompleted < 3,
    message: "Three lessons down! You're already ahead of most people who just talk about investing.",
    emoji: "🌿",
    celebration: "sparkle",
  },
  {
    id: "stage-sprout",
    check: (s) => s.completedCount >= 5 && s.previousCompleted < 5,
    message: "You've graduated from Seed to Sprout! Your garden is starting to take shape.",
    emoji: "🌿",
    celebration: "confetti",
  },
  {
    id: "stage-grow",
    check: (s) => s.completedCount >= 12 && s.previousCompleted < 12,
    message: "Welcome to the Grow stage! You're building real investing knowledge now.",
    emoji: "🌳",
    celebration: "confetti",
  },
  {
    id: "stage-bloom",
    check: (s) => s.completedCount >= 22 && s.previousCompleted < 22,
    message: "Full Bloom! You've come so far — your confidence isn't luck, it's earned.",
    emoji: "🌸",
    celebration: "confetti",
  },
  {
    id: "streak-3",
    check: (s) => s.streak >= 3 && s.previousStreak < 3,
    message: "3 days in a row! Consistency beats intensity every single time.",
    emoji: "🔥",
    celebration: "glow",
  },
  {
    id: "streak-7",
    check: (s) => s.streak >= 7 && s.previousStreak < 7,
    message: "A whole week of learning! You're building a habit that will change your financial future.",
    emoji: "⭐",
    celebration: "confetti",
  },
  {
    id: "streak-14",
    check: (s) => s.streak >= 14 && s.previousStreak < 14,
    message: "Two weeks strong! You're more disciplined than most Wall Street traders.",
    emoji: "💪",
    celebration: "confetti",
  },
  {
    id: "first-perfect",
    check: (s) => s.perfectQuizzes >= 1 && s.previousCompleted < s.completedCount,
    message: "Perfect quiz score! You really understood that lesson — it shows.",
    emoji: "💯",
    celebration: "sparkle",
  },
  {
    id: "halfway",
    check: (s) => s.completedCount >= 15 && s.previousCompleted < 15,
    message: "Halfway through your journey! Look back at how much you've learned since day one.",
    emoji: "🎯",
    celebration: "confetti",
  },
  {
    id: "all-done",
    check: (s) => s.completedCount >= 30 && s.previousCompleted < 30,
    message: "You completed every single lesson! Your garden is in full bloom. Time to put this knowledge to work!",
    emoji: "🏆",
    celebration: "confetti",
  },
];

const STORAGE_KEY = "pansy_milestones_seen";
const STATS_KEY = "pansy_milestone_stats";

function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ["#27B7C8", "#49B06E", "#F59E0B", "#EC4899", "#8B5CF6", "#ffffff"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 4 + Math.random() * 6;
  const rotation = Math.random() * 360;

  return (
    <motion.div
      className="absolute rounded-sm"
      style={{
        width: size,
        height: size * 0.6,
        background: color,
        left: `${x}%`,
        top: "-10px",
        rotate: rotation,
      }}
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: [0, 150 + Math.random() * 100],
        x: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 120],
        opacity: [1, 1, 0],
        rotate: [rotation, rotation + (Math.random() - 0.5) * 720],
      }}
      transition={{
        duration: 1.5 + Math.random() * 0.8,
        delay: delay,
        ease: "easeOut",
      }}
    />
  );
}

function SparkleEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#F59E0B]"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
          }}
          animate={{
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.15,
            repeat: 1,
            repeatDelay: 0.3,
          }}
        />
      ))}
    </div>
  );
}

export function PansyMilestones() {
  const router = useRouter();
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const checkMilestones = useCallback(async () => {
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
      setTimeout(() => setIsVisible(true), 400);
    }
  }, []);

  useEffect(() => {
    if (router.pathname === "/" || router.pathname === "/onboarding") return;
    const timeout = setTimeout(checkMilestones, 1500);
    return () => clearTimeout(timeout);
  }, [router.pathname, checkMilestones]);

  const dismiss = () => {
    setIsVisible(false);
    setTimeout(() => setActiveMilestone(null), 400);
  };

  return (
    <AnimatePresence>
      {activeMilestone && isVisible && (
        <motion.div
          className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-4 z-[60] sm:w-80"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <div className="relative rounded-2xl border border-[#27B7C8]/30 bg-gradient-to-br from-[#0E1B30] to-[#27B7C8]/10 p-4 shadow-2xl shadow-[#27B7C8]/10 overflow-hidden">
            {/* Celebration effects */}
            {activeMilestone.celebration === "confetti" && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {Array.from({ length: 24 }).map((_, i) => (
                  <ConfettiParticle
                    key={i}
                    delay={i * 0.05}
                    x={5 + (i / 24) * 90}
                  />
                ))}
              </div>
            )}

            {activeMilestone.celebration === "sparkle" && <SparkleEffect />}

            {activeMilestone.celebration === "glow" && (
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                animate={{
                  boxShadow: [
                    "inset 0 0 20px rgba(39,183,200,0)",
                    "inset 0 0 30px rgba(39,183,200,0.15)",
                    "inset 0 0 20px rgba(39,183,200,0)",
                  ],
                }}
                transition={{ duration: 2, repeat: 2 }}
              />
            )}

            <div className="relative flex items-start gap-3">
              <motion.div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#27B7C8] to-[#49B06E] text-2xl shadow-md"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
              >
                {activeMilestone.emoji}
              </motion.div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-start justify-between">
                  <motion.div
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="font-semibold text-foreground">Pansy</p>
                    <PartyPopper className="w-3.5 h-3.5 text-[#F59E0B]" />
                  </motion.div>
                  <button onClick={dismiss} className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <motion.p
                  className="text-sm leading-relaxed text-foreground/90"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {activeMilestone.message}
                </motion.p>
                <p className="text-[10px] text-muted-foreground">— Pansy 🌺</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
