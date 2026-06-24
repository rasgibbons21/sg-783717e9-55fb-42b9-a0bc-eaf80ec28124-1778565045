/**
 * Server-side progression library.
 * All exports are safe to call from API routes only — never import in browser code.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Level ladder ─────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, name: "Bloom Beginner",      badge: "🌱", xpRequired: 0    },
  { level: 2, name: "Chart Reader",         badge: "📊", xpRequired: 100  },
  { level: 3, name: "Candlestick Explorer", badge: "🕯️", xpRequired: 300  },
  { level: 4, name: "Pattern Spotter",      badge: "🔺", xpRequired: 600  },
  { level: 5, name: "Indicator Student",    badge: "📈", xpRequired: 1000 },
  { level: 6, name: "Trade Planner",        badge: "📋", xpRequired: 1500 },
  { level: 7, name: "Disciplined Trader",   badge: "⚖️", xpRequired: 2200 },
  { level: 8, name: "Bloom Trader",         badge: "🌸", xpRequired: 3000 },
  { level: 9, name: "Bloom Mentor",         badge: "🎓", xpRequired: 4200 },
] as const;

export type LevelEntry = typeof LEVELS[number];

export function getLevelForXP(xp: number) {
  let current: LevelEntry = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  const idx = LEVELS.findIndex(l => l.level === current.level);
  const next: LevelEntry | null = idx + 1 < LEVELS.length ? LEVELS[idx + 1] : null;
  const xpIntoLevel = xp - current.xpRequired;
  const xpToNext = next ? next.xpRequired - xp : null;
  const progressPct = next
    ? Math.min(100, Math.round((xpIntoLevel / (next.xpRequired - current.xpRequired)) * 100))
    : 100;
  return { current, next, progressPct, xpToNext };
}

// ── Mission definitions ───────────────────────────────────────────────────────

export interface Mission {
  key: string;
  title: string;
  description: string;
  unlockedByLesson: { moduleSlug: string; lessonSlug: string; lessonTitle: string };
  xpReward: number;
}

export const MISSIONS: Mission[] = [
  {
    key: "support-resistance-entry",
    title: "Support & Resistance Entry",
    description: "Complete a trade with 'support' or 'resistance' mentioned in your pre-trade thesis.",
    unlockedByLesson: { moduleSlug: "m1-chart-reading", lessonSlug: "support-and-resistance", lessonTitle: "Support — The Floor" },
    xpReward: 50,
  },
  {
    key: "bull-flag-trade",
    title: "Spot the Bull Flag",
    description: "Complete a LONG trade with 'bull flag' referenced in your thesis.",
    unlockedByLesson: { moduleSlug: "m2-chart-patterns", lessonSlug: "bull-flag", lessonTitle: "Bull Flag" },
    xpReward: 50,
  },
  {
    key: "rsi-confirmation",
    title: "RSI Confirmation",
    description: "Complete a trade and note 'RSI' as your indicator in the journal.",
    unlockedByLesson: { moduleSlug: "m3-indicators", lessonSlug: "rsi", lessonTitle: "RSI (Relative Strength Index)" },
    xpReward: 50,
  },
  {
    key: "ema-confirmation",
    title: "EMA Confirmation",
    description: "Complete a trade using EMA and note it in your journal indicator field.",
    unlockedByLesson: { moduleSlug: "m3-indicators", lessonSlug: "exponential-moving-average", lessonTitle: "Exponential Moving Average (EMA)" },
    xpReward: 50,
  },
  {
    key: "risk-manager",
    title: "Risk Manager",
    description: "Complete a trade with at least 2:1 Risk/Reward (stop and target both required).",
    unlockedByLesson: { moduleSlug: "m7-managing", lessonSlug: "moving-your-stop-loss", lessonTitle: "Moving Your Stop-Loss" },
    xpReward: 75,
  },
  {
    key: "candlestick-signal",
    title: "Candlestick Signal",
    description: "Complete a trade and note a bullish engulfing or hammer in your journal.",
    unlockedByLesson: { moduleSlug: "m10-candlestick-patterns", lessonSlug: "bullish-engulfing", lessonTitle: "Bullish Engulfing" },
    xpReward: 50,
  },
];

/** Returns the mission key unlocked by a given lesson, or null. */
export function missionUnlockedByLesson(moduleSlug: string, lessonSlug: string): string | null {
  const m = MISSIONS.find(
    m => m.unlockedByLesson.moduleSlug === moduleSlug && m.unlockedByLesson.lessonSlug === lessonSlug
  );
  return m?.key ?? null;
}

// ── Mission check logic ───────────────────────────────────────────────────────

export interface TradeFact {
  id?: string;
  direction: string;
  entry_price: number;
  stop_price: number | null;
  target_price: number | null;
  thesis: string | null;
}

export interface JournalFact {
  thesis: string | null;
  indicator_used: string | null;
  candlestick_confirmation: string | null;
}

function checkMission(key: string, trade: TradeFact, journal: JournalFact): boolean {
  switch (key) {
    case "support-resistance-entry": {
      const text = `${journal.thesis ?? ""} ${trade.thesis ?? ""}`.toLowerCase();
      return text.includes("support") || text.includes("resistance");
    }
    case "bull-flag-trade": {
      const text = `${journal.thesis ?? ""} ${trade.thesis ?? ""}`.toLowerCase();
      return text.includes("bull flag") && trade.direction === "long";
    }
    case "rsi-confirmation": {
      const ind = (journal.indicator_used ?? "").toLowerCase();
      return ind.includes("rsi") || ind.includes("relative strength");
    }
    case "ema-confirmation": {
      const ind = (journal.indicator_used ?? "").toLowerCase();
      return ind.includes("ema") || ind.includes("exponential");
    }
    case "risk-manager": {
      if (trade.stop_price == null || trade.target_price == null) return false;
      const risk = trade.direction === "long"
        ? Number(trade.entry_price) - Number(trade.stop_price)
        : Number(trade.stop_price) - Number(trade.entry_price);
      const reward = trade.direction === "long"
        ? Number(trade.target_price) - Number(trade.entry_price)
        : Number(trade.entry_price) - Number(trade.target_price);
      return risk > 0 && reward > 0 && reward / risk >= 2.0;
    }
    case "candlestick-signal": {
      const candle = (journal.candlestick_confirmation ?? "").toLowerCase();
      return candle.includes("engulfing") || candle.includes("hammer");
    }
    default:
      return false;
  }
}

// ── XP awarding ───────────────────────────────────────────────────────────────

export async function awardXP(
  userId: string,
  amount: number,
  reason: string,
  referenceId?: string
): Promise<void> {
  await Promise.all([
    supabaseAdmin.rpc("increment_user_xp", { p_user_id: userId, p_amount: amount }),
    supabaseAdmin.from("user_xp_log").insert({
      user_id: userId,
      xp_earned: amount,
      reason,
      reference_id: referenceId ?? null,
    }),
  ]);
}

// ── Mission unlocking ─────────────────────────────────────────────────────────

export async function unlockMission(userId: string, missionKey: string): Promise<void> {
  await supabaseAdmin.from("user_missions").upsert(
    { user_id: userId, mission_key: missionKey, status: "unlocked", unlocked_at: new Date().toISOString() },
    { onConflict: "user_id,mission_key", ignoreDuplicates: true }
  );
}

// ── Mission completion check ──────────────────────────────────────────────────

export async function checkAndCompleteMissions(
  userId: string,
  trade: TradeFact,
  journal: JournalFact
): Promise<Array<{ key: string; title: string; xpReward: number }>> {
  const { data: userMissions } = await supabaseAdmin
    .from("user_missions")
    .select("mission_key")
    .eq("user_id", userId)
    .eq("status", "unlocked");

  if (!userMissions || userMissions.length === 0) return [];

  const unlockedKeys = new Set(userMissions.map((m: { mission_key: string }) => m.mission_key));
  const completed: Array<{ key: string; title: string; xpReward: number }> = [];

  for (const mission of MISSIONS) {
    if (!unlockedKeys.has(mission.key)) continue;
    if (!checkMission(mission.key, trade, journal)) continue;

    await supabaseAdmin.from("user_missions").update({
      status: "completed",
      completed_at: new Date().toISOString(),
      completing_trade_id: trade.id ?? null,
    }).eq("user_id", userId).eq("mission_key", mission.key);

    await awardXP(userId, mission.xpReward, `Mission: ${mission.title}`, mission.key);
    completed.push({ key: mission.key, title: mission.title, xpReward: mission.xpReward });
  }

  return completed;
}
