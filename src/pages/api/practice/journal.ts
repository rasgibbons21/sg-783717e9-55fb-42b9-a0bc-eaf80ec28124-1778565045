import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user!.id;

  // ── GET: list journal entries with optional filters ─────────────────────
  if (req.method === "GET") {
    const { ticker, grade, direction, range } = req.query as Record<string, string>;

    let q = supabaseAdmin
      .from("practice_journal")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (ticker) q = q.ilike("ticker", `%${ticker}%`);
    if (grade && grade !== "all") q = q.eq("overall_grade", grade.toUpperCase());
    if (direction && direction !== "all") q = q.eq("direction", direction);

    if (range === "week") {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      q = q.gte("created_at", since);
    } else if (range === "month") {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      q = q.gte("created_at", since);
    }

    const { data, error } = await q;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ entries: data ?? [] });
  }

  // ── PATCH: update user-editable fields ─────────────────────────────────
  if (req.method === "PATCH") {
    const { id, ...fields } = req.body as Record<string, string>;
    if (!id) return res.status(400).json({ error: "id required" });

    const EDITABLE = [
      "chart_pattern", "candlestick_confirmation", "indicator_used",
      "market_trend", "emotion_before", "emotion_during", "emotion_after",
      "related_lesson", "what_i_learned", "personal_notes",
    ] as const;

    const update: Record<string, string> = {};
    for (const key of EDITABLE) {
      if (key in fields) update[key] = fields[key];
    }

    if (Object.keys(update).length === 0)
      return res.status(400).json({ error: "No editable fields provided" });

    const { data, error } = await supabaseAdmin
      .from("practice_journal")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ entry: data });
  }

  return res.status(405).end();
}
