import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { displayName, gapToNext, rankRows } from "@/lib/leaderboard/rank";

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
        .select("id, challenge_name, full_name, is_review_account, show_on_leaderboard"),
    ]);

    if (tradesRes.error) throw tradesRes.error;
    if (profilesRes.error) throw profilesRes.error;

    const names = new Map<string, string>();
    const reviewIds = new Set<string>();
    const hiddenIds = new Set<string>();
    for (const p of profilesRes.data ?? []) {
      if (p.is_review_account) reviewIds.add(p.id);
      if (p.show_on_leaderboard === false) hiddenIds.add(p.id);
      names.set(p.id, displayName(p));
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

    const rows: PracticeLeaderboardRow[] = [...stats.entries()].map(([user_id, s]) => ({
      user_id,
      display_name: names.get(user_id) ?? "Member",
      total_pnl: Math.round(s.pnl * 100) / 100,
      total_trades: s.total,
      win_rate: s.total > 0 ? Math.round((s.wins / s.total) * 100) : 0,
      rank: 0,
    }));

    const byPnl = (row: PracticeLeaderboardRow) => row.total_pnl;
    const ranked = rankRows(rows, byPnl, hiddenIds, (row) => row.user_id);
    const viewerId = auth.user!.id;
    const hidden = hiddenIds.has(viewerId);
    const me = (hidden ? rows : ranked).find((row) => row.user_id === viewerId) ?? null;

    return res.status(200).json({ top: ranked.slice(0, 10), me, hidden, gap_to_next: gapToNext(ranked, viewerId, byPnl) });
  } catch (error: unknown) {
    console.error("Practice leaderboard error:", error);
    return res.status(500).json({ error: (error as Error).message || String(error) });
  }
}
