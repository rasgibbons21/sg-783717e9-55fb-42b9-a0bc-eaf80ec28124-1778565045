import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { awardXP, unlockMission, missionUnlockedByLesson } from "@/lib/progression";
import { UNIVERSITY_MODULES } from "@/data/university/modules";

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
    const moduleSlug = req.query.module as string;
    if (!moduleSlug) return res.status(400).json({ error: "module query param required" });

    const [progressResult, bookmarksResult] = await Promise.all([
      supabaseAdmin
        .from("university_lesson_progress")
        .select("lesson_slug, completed_at")
        .eq("user_id", userId)
        .eq("module_slug", moduleSlug),
      supabaseAdmin
        .from("university_bookmarks")
        .select("lesson_slug")
        .eq("user_id", userId)
        .eq("module_slug", moduleSlug),
    ]);

    return res.status(200).json({
      progress: progressResult.data ?? [],
      bookmarks: (bookmarksResult.data ?? []).map((b) => b.lesson_slug),
    });
  }

  if (req.method === "POST") {
    const { moduleSlug, lessonSlug } = req.body as {
      moduleSlug?: string;
      lessonSlug?: string;
    };
    if (!moduleSlug || !lessonSlug) {
      return res.status(400).json({ error: "moduleSlug and lessonSlug required" });
    }

    // Check if already completed to avoid double-awarding XP
    const { data: existing } = await supabaseAdmin
      .from("university_lesson_progress")
      .select("lesson_slug")
      .eq("user_id", userId)
      .eq("module_slug", moduleSlug)
      .eq("lesson_slug", lessonSlug)
      .single();

    const isFirstCompletion = !existing;

    const { error } = await supabaseAdmin
      .from("university_lesson_progress")
      .upsert(
        { user_id: userId, module_slug: moduleSlug, lesson_slug: lessonSlug, completed_at: new Date().toISOString() },
        { onConflict: "user_id,module_slug,lesson_slug" }
      );

    if (error) {
      console.error("progress upsert error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!isFirstCompletion) {
      return res.status(200).json({ ok: true, xp_awarded: 0, mission_unlocked: null });
    }

    let xpAwarded = 10;
    await awardXP(userId, 10, `Lesson: ${lessonSlug}`, `${moduleSlug}/${lessonSlug}`);

    const missionKey = missionUnlockedByLesson(moduleSlug, lessonSlug);
    if (missionKey) {
      await unlockMission(userId, missionKey);
    }

    // Module completion bonus
    const mod = UNIVERSITY_MODULES.find(m => m.slug === moduleSlug);
    if (mod) {
      const { data: allProgress } = await supabaseAdmin
        .from("university_lesson_progress")
        .select("lesson_slug")
        .eq("user_id", userId)
        .eq("module_slug", moduleSlug);

      if ((allProgress?.length ?? 0) >= mod.lessonCount) {
        await awardXP(userId, 50, `Module complete: ${moduleSlug}`, moduleSlug);
        xpAwarded += 50;
      }
    }

    return res.status(200).json({ ok: true, xp_awarded: xpAwarded, mission_unlocked: missionKey ?? null });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
