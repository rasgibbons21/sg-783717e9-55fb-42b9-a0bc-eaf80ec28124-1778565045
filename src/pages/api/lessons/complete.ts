import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { getLesson } from "@/data/lessons-stocks";
import { testCount } from "@/lib/lessons/engine";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/**
 * Records a finished lesson. Only real lessons count, and the first completion is the one that's kept.
 * A test score is saved only when it matches the lesson's real test, and only when it beats her best.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const { slug, score, total } = req.body ?? {};
  const lesson = typeof slug === "string" ? getLesson(slug) : undefined;
  if (!lesson) return res.status(400).json({ error: "That lesson doesn't exist." });

  const quizScore = Math.max(0, Math.min(lesson.blocks.length, Math.floor(Number(score) || 0)));
  const userId = auth.user!.id;

  const { data, error } = await supabaseAdmin
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lesson.slug,
        completed: true,
        completed_at: new Date().toISOString(),
        quiz_score: quizScore,
        quiz_completed: true,
      },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
    )
    .select("lesson_id");

  if (error) return res.status(500).json({ error: "We couldn't save that just now." });

  const expected = testCount(lesson);
  const validScore = Number.isInteger(score) && Number.isInteger(total) && total === expected && score >= 0 && score <= total;
  if (validScore) {
    // A failed score update never fails the completion: the lesson is already saved.
    const { data: row } = await supabaseAdmin
      .from("lesson_progress")
      .select("test_score")
      .eq("user_id", userId)
      .eq("lesson_id", lesson.slug)
      .maybeSingle();
    const best = (row as { test_score: number | null } | null)?.test_score ?? null;
    if (best === null || score > best) {
      await supabaseAdmin.from("lesson_progress").update({ test_score: score, test_total: total }).eq("user_id", userId).eq("lesson_id", lesson.slug);
    }
  }

  return res.status(200).json({ isNew: (data ?? []).length > 0 });
}
