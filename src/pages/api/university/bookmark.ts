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
  const { moduleSlug, lessonSlug, action } = req.body as {
    moduleSlug?: string;
    lessonSlug?: string;
    action?: "add" | "remove";
  };

  if (!moduleSlug || !lessonSlug || !action) {
    return res.status(400).json({ error: "moduleSlug, lessonSlug, action required" });
  }

  if (action === "add") {
    const { error } = await supabaseAdmin
      .from("university_bookmarks")
      .upsert(
        {
          user_id: userId,
          module_slug: moduleSlug,
          lesson_slug: lessonSlug,
          bookmarked_at: new Date().toISOString(),
        },
        { onConflict: "user_id,module_slug,lesson_slug" }
      );

    if (error) {
      console.error("bookmark upsert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, bookmarked: true });
  }

  if (action === "remove") {
    const { error } = await supabaseAdmin
      .from("university_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("module_slug", moduleSlug)
      .eq("lesson_slug", lessonSlug);

    if (error) {
      console.error("bookmark delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true, bookmarked: false });
  }

  return res.status(400).json({ error: "action must be add or remove" });
}
