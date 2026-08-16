import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { authService } from "@/services/authService";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface AchievementItem {
  key: string;
  title: string;
  description: string;
  emoji: string;
  category: string;
  xpReward: number;
  earned: boolean;
  earnedAt: string | null;
}

interface AchievementData {
  achievements: AchievementItem[];
  earnedCount: number;
  totalCount: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  learning: "Learning",
  trading: "Trading",
  streak: "Streaks",
  milestone: "Milestones",
  social: "Social",
};

export function TrophyCase() {
  const [data, setData] = useState<AchievementData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const load = useCallback(async () => {
    const session = await authService.getCurrentSession();
    if (!session) return;
    try {
      const res = await fetch("/api/achievements", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      setData(await res.json());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!data) return null;

  const categories = [...new Set(data.achievements.map(a => a.category))];
  const filtered = selectedCategory
    ? data.achievements.filter(a => a.category === selectedCategory)
    : data.achievements;
  const earned = filtered.filter(a => a.earned);
  const locked = filtered.filter(a => !a.earned);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="font-serif text-base font-bold text-foreground">Trophy Case</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{data.earnedCount}</span>/{data.totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden bg-muted/40 mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(data.earnedCount / data.totalCount) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #F59E0B, #FB923C)" }}
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => { setSelectedCategory(null); haptic(); }}
            className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              background: !selectedCategory ? "rgba(245,158,11,0.15)" : "transparent",
              color: !selectedCategory ? "#F59E0B" : "hsl(var(--muted-foreground))",
              border: `1px solid ${!selectedCategory ? "rgba(245,158,11,0.3)" : "hsl(var(--border))"}`,
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat === selectedCategory ? null : cat); haptic(); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                background: selectedCategory === cat ? "rgba(245,158,11,0.15)" : "transparent",
                color: selectedCategory === cat ? "#F59E0B" : "hsl(var(--muted-foreground))",
                border: `1px solid ${selectedCategory === cat ? "rgba(245,158,11,0.3)" : "hsl(var(--border))"}`,
              }}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div className="px-5 pb-3">
          <div className="grid grid-cols-4 gap-2">
            {earned.map((a, i) => (
              <motion.div
                key={a.key}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-1 p-2 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}
                title={`${a.title}: ${a.description}`}
              >
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-[9px] font-medium text-foreground text-center leading-tight line-clamp-2">
                  {a.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div className="px-5 pb-5">
          {earned.length > 0 && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 mt-1">Locked</p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {locked.map(a => (
              <div
                key={a.key}
                className="flex flex-col items-center gap-1 p-2 rounded-xl opacity-40"
                style={{ border: "1px solid hsl(var(--border))" }}
                title={a.description}
              >
                <span className="text-2xl grayscale">{a.emoji}</span>
                <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight line-clamp-2">
                  {a.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
