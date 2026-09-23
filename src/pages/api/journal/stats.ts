import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

interface JournalRow {
  id: string;
  ticker: string;
  direction: string | null;
  entry_price: number | null;
  exit_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  shares: number | null;
  pnl: number | null;
  pnl_pct: number | null;
  risk_amount: number | null;
  duration_minutes: number | null;
  overall_grade: string | null;
  score_discipline: number | null;
  score_entry: number | null;
  score_exit: number | null;
  score_rr: number | null;
  score_pl: number | null;
  emotion_before: string | null;
  followed_plan: string | null;
  closed_at: string | null;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user!.id;

  const { data: rows, error } = await supabaseAdmin
    .from("practice_journal")
    .select("id, ticker, direction, entry_price, exit_price, stop_price, target_price, shares, pnl, pnl_pct, risk_amount, duration_minutes, overall_grade, score_discipline, score_entry, score_exit, score_rr, score_pl, emotion_before, followed_plan, closed_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  const trades = (rows ?? []) as JournalRow[];

  if (trades.length === 0) {
    return res.status(200).json({ empty: true, totalTrades: 0 });
  }

  const withPnl = trades.filter(t => t.pnl != null);
  const wins = withPnl.filter(t => t.pnl! > 0);
  const losses = withPnl.filter(t => t.pnl! < 0);
  const breakeven = withPnl.filter(t => t.pnl === 0);

  const totalPnl = withPnl.reduce((s, t) => s + t.pnl!, 0);
  const grossProfit = wins.reduce((s, t) => s + t.pnl!, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl!, 0));
  const winRate = withPnl.length > 0 ? Math.round((wins.length / withPnl.length) * 1000) / 10 : 0;
  const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : grossProfit > 0 ? Infinity : 0;
  const avgWin = wins.length > 0 ? Math.round(wins.reduce((s, t) => s + t.pnl!, 0) / wins.length * 100) / 100 : 0;
  const avgLoss = losses.length > 0 ? Math.round(losses.reduce((s, t) => s + t.pnl!, 0) / losses.length * 100) / 100 : 0;

  const durations = trades.filter(t => t.duration_minutes != null).map(t => t.duration_minutes!);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

  const riskRewards = trades.filter(t => t.score_rr != null).map(t => t.score_rr!);
  const avgRR = riskRewards.length > 0 ? Math.round(riskRewards.reduce((a, b) => a + b, 0) / riskRewards.length) : null;

  // Streaks
  let currentStreak = 0;
  let currentStreakType: "win" | "loss" | null = null;
  let bestWinStreak = 0;
  let worstLossStreak = 0;
  let runningWin = 0;
  let runningLoss = 0;

  for (const t of withPnl) {
    if (t.pnl! > 0) {
      runningWin++;
      runningLoss = 0;
      if (runningWin > bestWinStreak) bestWinStreak = runningWin;
    } else if (t.pnl! < 0) {
      runningLoss++;
      runningWin = 0;
      if (runningLoss > worstLossStreak) worstLossStreak = runningLoss;
    } else {
      runningWin = 0;
      runningLoss = 0;
    }
  }
  if (runningWin > 0) { currentStreak = runningWin; currentStreakType = "win"; }
  else if (runningLoss > 0) { currentStreak = runningLoss; currentStreakType = "loss"; }

  // P&L curve (cumulative, by date)
  const pnlCurve: { date: string; cumPnl: number }[] = [];
  let cum = 0;
  for (const t of withPnl) {
    cum += t.pnl!;
    const date = (t.closed_at || t.created_at).slice(0, 10);
    pnlCurve.push({ date, cumPnl: Math.round(cum * 100) / 100 });
  }

  // Best / worst trades
  const sorted = [...withPnl].sort((a, b) => b.pnl! - a.pnl!);
  const bestTrades = sorted.slice(0, 3).map(t => ({ ticker: t.ticker, pnl: t.pnl!, date: (t.closed_at || t.created_at).slice(0, 10) }));
  const worstTrades = sorted.slice(-3).reverse().map(t => ({ ticker: t.ticker, pnl: t.pnl!, date: (t.closed_at || t.created_at).slice(0, 10) }));

  // Top tickers by frequency
  const tickerCounts = new Map<string, { count: number; pnl: number }>();
  for (const t of trades) {
    const entry = tickerCounts.get(t.ticker) ?? { count: 0, pnl: 0 };
    entry.count++;
    if (t.pnl != null) entry.pnl += t.pnl;
    tickerCounts.set(t.ticker, entry);
  }
  const topTickers = [...tickerCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([ticker, v]) => ({ ticker, trades: v.count, pnl: Math.round(v.pnl * 100) / 100 }));

  // Grade distribution
  const grades: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const t of trades) {
    if (t.overall_grade && t.overall_grade in grades) grades[t.overall_grade]++;
  }

  // Discipline average
  const discScores = trades.filter(t => t.score_discipline != null).map(t => t.score_discipline!);
  const avgDiscipline = discScores.length > 0 ? Math.round(discScores.reduce((a, b) => a + b, 0) / discScores.length) : null;

  // Direction breakdown
  const longs = trades.filter(t => t.direction === "long");
  const shorts = trades.filter(t => t.direction === "short");
  const longWins = longs.filter(t => t.pnl != null && t.pnl > 0).length;
  const shortWins = shorts.filter(t => t.pnl != null && t.pnl > 0).length;
  const longPnl = longs.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const shortPnl = shorts.reduce((s, t) => s + (t.pnl ?? 0), 0);

  // Emotion analysis
  const emotionMap = new Map<string, { count: number; wins: number; pnl: number }>();
  for (const t of trades) {
    if (!t.emotion_before) continue;
    const e = emotionMap.get(t.emotion_before) ?? { count: 0, wins: 0, pnl: 0 };
    e.count++;
    if (t.pnl != null && t.pnl > 0) e.wins++;
    e.pnl += t.pnl ?? 0;
    emotionMap.set(t.emotion_before, e);
  }
  const emotionStats = [...emotionMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([emotion, v]) => ({
      emotion,
      trades: v.count,
      winRate: v.count > 0 ? Math.round((v.wins / v.count) * 100) : 0,
      pnl: Math.round(v.pnl * 100) / 100,
    }));

  return res.status(200).json({
    empty: false,
    totalTrades: trades.length,
    tradesWithPnl: withPnl.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: breakeven.length,
    winRate,
    totalPnl: Math.round(totalPnl * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    grossLoss: Math.round(grossLoss * 100) / 100,
    profitFactor,
    avgWin,
    avgLoss,
    avgDuration,
    avgRR,
    currentStreak,
    currentStreakType,
    bestWinStreak,
    worstLossStreak,
    pnlCurve,
    bestTrades,
    worstTrades,
    topTickers,
    grades,
    avgDiscipline,
    direction: {
      longs: longs.length,
      shorts: shorts.length,
      longWinRate: longs.length > 0 ? Math.round((longWins / longs.length) * 100) : 0,
      shortWinRate: shorts.length > 0 ? Math.round((shortWins / shorts.length) * 100) : 0,
      longPnl: Math.round(longPnl * 100) / 100,
      shortPnl: Math.round(shortPnl * 100) / 100,
    },
    emotionStats,
  });
}
