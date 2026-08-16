import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { authService } from "@/services/authService";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  activeDates: string[];
  today: string;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function StreakCalendar() {
  const [data, setData] = useState<StreakData | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [showMilestone, setShowMilestone] = useState<number | null>(null);

  const loadStreak = useCallback(async () => {
    const session = await authService.getCurrentSession();
    if (!session) return;
    try {
      const res = await fetch("/api/streak", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      setData(await res.json());
    } catch {}
  }, []);

  const recordLogin = useCallback(async () => {
    const session = await authService.getCurrentSession();
    if (!session) return;
    try {
      const res = await fetch("/api/streak", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activityType: "login" }),
      });
      if (!res.ok) return;
      const result = await res.json();
      if (result.milestone) {
        setShowMilestone(result.milestone);
        haptic(40);
        setTimeout(() => setShowMilestone(null), 4000);
      }
      loadStreak();
    } catch {}
  }, [loadStreak]);

  useEffect(() => {
    recordLogin();
  }, [recordLogin]);

  if (!data) return null;

  const activeSet = new Set(data.activeDates);
  const now = new Date();
  const viewMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const todayKey = data.today;
  const monthLabel = viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells: Array<{ day: number | null; dateKey: string | null; isActive: boolean; isToday: boolean }> = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: null, dateKey: null, isActive: false, isToday: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      day: d,
      dateKey,
      isActive: activeSet.has(dateKey),
      isToday: dateKey === todayKey,
    });
  }

  const streakColor = data.currentStreak >= 7 ? "#F59E0B" : "#FB923C";

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header with streak stats */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ background: `linear-gradient(135deg, ${streakColor}08, ${streakColor}04)` }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={data.currentStreak > 0 ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              <Flame className="w-5 h-5" style={{ color: streakColor }} />
            </motion.div>
            <h3 className="font-serif text-base font-bold text-foreground">Your Streak</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">{data.currentStreak}</span>
              <span className="text-xs text-muted-foreground ml-1">days</span>
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-xs text-muted-foreground">
              Best: <span className="font-semibold text-foreground">{data.longestStreak}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{data.totalActiveDays}</span> days
            </span>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="px-5 pb-5 pt-3">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => { setMonthOffset(o => o - 1); haptic(); }}
            className="p-1.5 rounded-lg hover:bg-muted/50"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </motion.button>
          <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => { if (monthOffset < 0) { setMonthOffset(o => o + 1); haptic(); } }}
            className="p-1.5 rounded-lg hover:bg-muted/50"
            style={{ opacity: monthOffset >= 0 ? 0.3 : 1 }}
            disabled={monthOffset >= 0}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => (
            <div key={i} className="aspect-square flex items-center justify-center">
              {cell.day !== null && (
                <motion.div
                  initial={cell.isToday ? { scale: 0.5 } : false}
                  animate={cell.isToday ? { scale: 1 } : {}}
                  className="w-full h-full rounded-lg flex items-center justify-center text-xs font-medium relative"
                  style={{
                    background: cell.isActive
                      ? `linear-gradient(135deg, ${streakColor}25, ${streakColor}15)`
                      : "transparent",
                    border: cell.isToday
                      ? `2px solid ${streakColor}60`
                      : cell.isActive
                        ? `1px solid ${streakColor}30`
                        : "1px solid transparent",
                    color: cell.isActive
                      ? streakColor
                      : cell.isToday
                        ? "hsl(var(--foreground))"
                        : "hsl(var(--muted-foreground))",
                    fontWeight: cell.isActive || cell.isToday ? 700 : 400,
                  }}
                >
                  {cell.isActive && (
                    <span className="absolute -top-0.5 -right-0.5 text-[8px]">🔥</span>
                  )}
                  {cell.day}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Milestone celebration */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="mx-5 mb-5 rounded-xl p-4 text-center"
            style={{
              background: `linear-gradient(135deg, ${streakColor}20, ${streakColor}10)`,
              border: `1px solid ${streakColor}40`,
            }}
          >
            <p className="text-lg font-bold text-foreground mb-1">
              🔥 {showMilestone}-Day Streak!
            </p>
            <p className="text-sm text-muted-foreground">
              +{showMilestone * 5} XP bonus earned!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
