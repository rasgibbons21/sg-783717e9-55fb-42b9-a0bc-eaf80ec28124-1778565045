import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const { days = "30", strategy } = req.query;
  const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000).toISOString();

  try {
    let q = supabaseAdmin
      .from("scanner_results")
      .select("*")
      .gte("scanned_at", since)
      .order("scanned_at", { ascending: false })
      .limit(500);

    if (strategy && strategy !== "all") q = q.eq("strategy_id", strategy);

    const { data: results, error } = await q;
    if (error) return res.status(500).json({ error: error.message });

    const rows = results ?? [];
    const resolved = rows.filter((r: any) => r.outcome && r.outcome !== "pending");
    const pending = rows.filter((r: any) => r.outcome === "pending");

    const wins = resolved.filter((r: any) => r.outcome === "win_t1" || r.outcome === "win_t2");
    const t2Wins = resolved.filter((r: any) => r.outcome === "win_t2");
    const stopped = resolved.filter((r: any) => r.outcome === "stopped");
    const expired = resolved.filter((r: any) => r.outcome === "expired");

    const avgPnl = resolved.length > 0
      ? resolved.reduce((s: number, r: any) => s + (r.outcome_pnl_pct ?? 0), 0) / resolved.length
      : 0;

    const byStrategy: Record<string, { name: string; total: number; wins: number; stopped: number; expired: number; avgPnl: number; bestPnl: number; worstPnl: number }> = {};
    for (const r of resolved) {
      if (!byStrategy[r.strategy_id]) {
        byStrategy[r.strategy_id] = { name: r.strategy_name, total: 0, wins: 0, stopped: 0, expired: 0, avgPnl: 0, bestPnl: -Infinity, worstPnl: Infinity };
      }
      const s = byStrategy[r.strategy_id];
      s.total++;
      if (r.outcome === "win_t1" || r.outcome === "win_t2") s.wins++;
      else if (r.outcome === "stopped") s.stopped++;
      else s.expired++;
      s.avgPnl += r.outcome_pnl_pct ?? 0;
      s.bestPnl = Math.max(s.bestPnl, r.outcome_pnl_pct ?? 0);
      s.worstPnl = Math.min(s.worstPnl, r.outcome_pnl_pct ?? 0);
    }

    for (const s of Object.values(byStrategy)) {
      s.avgPnl = s.total > 0 ? Math.round((s.avgPnl / s.total) * 100) / 100 : 0;
      if (s.bestPnl === -Infinity) s.bestPnl = 0;
      if (s.worstPnl === Infinity) s.worstPnl = 0;
    }

    const byDate: Record<string, { date: string; total: number; wins: number; pnl: number }> = {};
    for (const r of resolved) {
      const d = r.scanned_date;
      if (!byDate[d]) byDate[d] = { date: d, total: 0, wins: 0, pnl: 0 };
      byDate[d].total++;
      if (r.outcome === "win_t1" || r.outcome === "win_t2") byDate[d].wins++;
      byDate[d].pnl += r.outcome_pnl_pct ?? 0;
    }

    return res.status(200).json({
      summary: {
        totalSignals: rows.length,
        resolved: resolved.length,
        pending: pending.length,
        wins: wins.length,
        t2Wins: t2Wins.length,
        stopped: stopped.length,
        expired: expired.length,
        winRate: resolved.length > 0 ? Math.round((wins.length / resolved.length) * 100) : 0,
        avgPnl: Math.round(avgPnl * 100) / 100,
      },
      byStrategy,
      dailyPerformance: Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)),
      recentTrades: rows.slice(0, 50).map((r: any) => ({
        symbol: r.symbol,
        strategyId: r.strategy_id,
        strategyName: r.strategy_name,
        score: r.score,
        priceAtSignal: r.price_at_signal,
        changePct: r.change_pct,
        entry: r.entry_price,
        stop: r.stop_price,
        target1: r.target1_price,
        target2: r.target2_price,
        outcome: r.outcome,
        outcomePnlPct: r.outcome_pnl_pct,
        scannedAt: r.scanned_at,
      })),
    });
  } catch (err: any) {
    console.error("[backtest] Error:", err.message);
    return res.status(500).json({ error: err.message || "Failed to load backtest data" });
  }
}
