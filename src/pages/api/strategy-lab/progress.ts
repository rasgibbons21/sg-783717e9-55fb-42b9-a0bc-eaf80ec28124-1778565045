import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { awardXP } from "@/lib/progression";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user!.id;

  if (req.method === "GET") {
    const category = req.query.category as string | undefined;

    let query = supabaseAdmin
      .from("strategy_progress")
      .select("strategy_slug, category, status, lessons_completed, practice_score, practice_attempts, started_at, completed_at")
      .eq("user_id", userId);

    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ progress: data ?? [] });
  }

  if (req.method === "POST") {
    const { strategySlug, category, status, lessonsCompleted, practiceScore } = req.body as {
      strategySlug?: string;
      category?: string;
      status?: string;
      lessonsCompleted?: number;
      practiceScore?: number;
    };

    if (!strategySlug || !category) {
      return res.status(400).json({ error: "strategySlug and category required" });
    }

    const { data: existing } = await supabaseAdmin
      .from("strategy_progress")
      .select("status, practice_attempts")
      .eq("user_id", userId)
      .eq("strategy_slug", strategySlug)
      .single();

    const now = new Date().toISOString();
    const isNew = !existing;
    const wasMastered = existing?.status === "mastered";

    const upsertData: Record<string, unknown> = {
      user_id: userId,
      strategy_slug: strategySlug,
      category,
    };

    if (status) upsertData.status = status;
    if (lessonsCompleted !== undefined) upsertData.lessons_completed = lessonsCompleted;
    if (practiceScore !== undefined) {
      upsertData.practice_score = practiceScore;
      upsertData.practice_attempts = (existing?.practice_attempts ?? 0) + 1;
    }

    if (isNew || (!existing?.status || existing.status === "not_started")) {
      upsertData.started_at = now;
    }

    if (status === "mastered" && !wasMastered) {
      upsertData.completed_at = now;
    }

    const { error } = await supabaseAdmin
      .from("strategy_progress")
      .upsert(upsertData, { onConflict: "user_id,strategy_slug" });

    if (error) {
      console.error("strategy progress upsert error:", error);
      return res.status(500).json({ error: error.message });
    }

    let xpAwarded = 0;
    if (isNew) {
      await awardXP(userId, 5, `Started strategy: ${strategySlug}`, `strategy/${strategySlug}`);
      xpAwarded = 5;
    }
    if (status === "mastered" && !wasMastered) {
      await awardXP(userId, 25, `Mastered strategy: ${strategySlug}`, `strategy/${strategySlug}/mastered`);
      xpAwarded += 25;
    }

    return res.status(200).json({ ok: true, xp_awarded: xpAwarded });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
