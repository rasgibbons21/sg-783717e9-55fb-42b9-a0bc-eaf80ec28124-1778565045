import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const userId = auth.user.id;
  const { moduleSlug, lessonSlug, answers, score, total } = req.body as {
    moduleSlug?: string;
    lessonSlug?: string;
    answers?: number[];
    score?: number;
    total?: number;
  };

  if (!moduleSlug || !lessonSlug || answers === undefined || score === undefined || total === undefined) {
    return res.status(400).json({ error: "moduleSlug, lessonSlug, answers, score, total required" });
  }

  const passed = score / total >= 0.75;

  const { error } = await supabaseAdmin
    .from("university_quiz_results")
    .insert({
      user_id: userId,
      module_slug: moduleSlug,
      lesson_slug: lessonSlug,
      answers,
      score,
      total,
      passed,
      submitted_at: new Date().toISOString(),
    });

  if (error) {
    console.error("quiz insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true, score, total, passed });
}
