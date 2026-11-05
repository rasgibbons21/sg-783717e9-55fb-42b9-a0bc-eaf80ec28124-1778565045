import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { getLesson } from "@/data/lessons-v2";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/** Records a finished lesson. Only real lessons count, and the first completion is the one that's kept. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const { slug, score } = req.body ?? {};
  const lesson = typeof slug === "string" ? getLesson(slug) : undefined;
  if (!lesson) return res.status(400).json({ error: "That lesson doesn't exist." });

  const quizScore = Math.max(0, Math.min(lesson.blocks.length, Math.floor(Number(score) || 0)));

  const { data, error } = await supabaseAdmin
    .from("lesson_progress")
    .upsert(
      {
        user_id: auth.user!.id,
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
  return res.status(200).json({ isNew: (data ?? []).length > 0 });
}
