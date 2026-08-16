import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Zap, TrendingUp, BookOpen, NotebookPen, Search, Check, Gift, Star,
} from "lucide-react";
import { authService } from "@/services/authService";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface ChallengeData {
  challenge: {
    id: string;
    date: string;
    type: string;
    title: string;
    description: string;
    rewardXp: number;
    rewardGems: number;
  };
  completed: boolean;
  completedAt: string | null;
}

const TYPE_CONFIG: Record<string, { icon: typeof Zap; color: string; href: string }> = {
  trade: { icon: TrendingUp, color: "#49B06E", href: "/paper-trader-v2" },
  learn: { icon: BookOpen, color: "#27B7C8", href: "/learn" },
  journal: { icon: NotebookPen, color: "#F59E0B", href: "/journal" },
  research: { icon: Search, color: "#8B5CF6", href: "/discover" },
};

export function DailyChallenge() {
  const [data, setData] = useState<ChallengeData | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  const load = useCallback(async () => {
    const session = await authService.getCurrentSession();
    if (!session) return;
    try {
      const res = await fetch("/api/daily-challenge", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      setData(await res.json());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const markComplete = async () => {
    if (!data || data.completed || completing) return;
    setCompleting(true);
    const session = await authService.getCurrentSession();
    if (!session) return;
    try {
      const res = await fetch("/api/daily-challenge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ challengeId: data.challenge.id }),
      });
      if (!res.ok) return;
      haptic(25);
      setJustCompleted(true);
      setData(prev => prev ? { ...prev, completed: true } : null);
      setTimeout(() => setJustCompleted(false), 3000);
    } catch {} finally {
      setCompleting(false);
    }
  };

  if (!data) return null;

  const { challenge, completed } = data;
  const config = TYPE_CONFIG[challenge.type] ?? TYPE_CONFIG.learn;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-5 pt-4 pb-3 flex items-center justify-between"
        style={{
          background: completed
            ? "linear-gradient(135deg, rgba(73,176,110,0.08), rgba(73,176,110,0.03))"
            : `linear-gradient(135deg, ${config.color}08, ${config.color}03)`,
        }}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: completed ? "#49B06E" : config.color }} />
          <h3 className="font-serif text-sm font-bold text-foreground">Daily Challenge</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: `${config.color}15`,
              color: config.color,
            }}
          >
            +{challenge.rewardXp} XP
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: "rgba(245,158,11,0.12)",
              color: "#F59E0B",
            }}
          >
            +{challenge.rewardGems} 💎
          </span>
        </div>
      </div>

      {/* Challenge content */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <motion.div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: completed ? "rgba(73,176,110,0.12)" : `${config.color}12`,
              color: completed ? "#49B06E" : config.color,
            }}
            animate={completed ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {completed ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground mb-1">{challenge.title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{challenge.description}</p>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-4">
          {completed ? (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#49B06E]/10 border border-[#49B06E]/20">
              <Check className="w-4 h-4 text-[#49B06E]" />
              <span className="text-sm font-semibold text-[#49B06E]">Challenge Complete!</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href={config.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  onClick={() => haptic()}
                  className="py-2.5 rounded-xl text-center text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}CC)` }}
                >
                  Go to {challenge.type === "trade" ? "Trader" : challenge.type === "learn" ? "Lessons" : challenge.type === "journal" ? "Journal" : "Discover"}
                </motion.div>
              </Link>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={markComplete}
                disabled={completing}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-muted/50 text-foreground hover:bg-muted"
              >
                {completing ? "..." : "Done ✓"}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Just-completed celebration */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
            animate={{ opacity: 1, height: "auto", paddingTop: 12, paddingBottom: 12 }}
            exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
            className="mx-5 mb-4 rounded-xl text-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(73,176,110,0.12), rgba(39,183,200,0.08))",
              border: "1px solid rgba(73,176,110,0.25)",
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-sm font-bold text-foreground">
                +{challenge.rewardXp} XP & +{challenge.rewardGems} Gems earned!
              </span>
              <Gift className="w-4 h-4 text-[#49B06E]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
