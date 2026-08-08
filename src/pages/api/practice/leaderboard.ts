import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export interface PracticeLeaderboardRow {
  user_id: string;
  display_name: string;
  total_pnl: number;
  total_trades: number;
  win_rate: number;
  rank: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  try {
    const [tradesRes, profilesRes] = await Promise.all([
      supabaseAdmin
        .from("practice_trades")
        .select("user_id, pnl, status")
        .eq("status", "closed"),
      supabaseAdmin
        .from("profiles")
        .select("id, challenge_name, full_name, is_review_account"),
    ]);

    if (tradesRes.error) throw tradesRes.error;
    if (profilesRes.error) throw profilesRes.error;

    const names = new Map<string, string>();
    const reviewIds = new Set<string>();
    for (const p of profilesRes.data ?? []) {
      if (p.is_review_account) reviewIds.add(p.id);
      const name = (p.challenge_name ?? p.full_name ?? "").trim();
      if (name) names.set(p.id, name);
    }

    const stats = new Map<string, { pnl: number; total: number; wins: number }>();
    for (const t of tradesRes.data ?? []) {
      if (reviewIds.has(t.user_id)) continue;
      const s = stats.get(t.user_id) ?? { pnl: 0, total: 0, wins: 0 };
      s.pnl += t.pnl ?? 0;
      s.total += 1;
      if ((t.pnl ?? 0) > 0) s.wins += 1;
      stats.set(t.user_id, s);
    }

    const rows: PracticeLeaderboardRow[] = [...stats.entries()]
      .map(([user_id, s]) => ({
        user_id,
        display_name: names.get(user_id) ?? "Bloom Trader",
        total_pnl: Math.round(s.pnl * 100) / 100,
        total_trades: s.total,
        win_rate: s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0,
        rank: 0,
      }))
      .sort((a, b) => b.total_pnl - a.total_pnl);

    rows.forEach((r, i) => { r.rank = i + 1; });

    const top = rows.slice(0, 10);
    const me = rows.find((r) => r.user_id === auth.user!.id) ?? null;

    return res.status(200).json({ top, me });
  } catch (error: unknown) {
    console.error("Practice leaderboard error:", error);
    return res.status(500).json({ error: (error as Error).message || String(error) });
  }
}
