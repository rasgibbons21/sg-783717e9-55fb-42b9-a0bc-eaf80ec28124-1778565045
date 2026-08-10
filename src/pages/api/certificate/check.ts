import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Unauthorized" });

  const type = req.query.type as string;

  if (type === "basics") {
    const { data: progress } = await supabaseAdmin
      .from("lesson_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", user.id)
      .eq("completed", true);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const completedCount = progress?.length || 0;
    const dates = (progress || []).map(p => p.completed_at).filter(Boolean).sort();
    const completedAt = dates.length > 0 ? dates[dates.length - 1] : null;

    return res.status(200).json({
      eligible: completedCount > 0,
      allComplete: completedCount >= 20,
      completedCount,
      userName: profile?.full_name || "Bloom Member",
      completedAt,
      certId: `BLOOM-${new Date(completedAt || Date.now()).getFullYear()}-${user.id.slice(0, 6).toUpperCase()}`,
    });
  }

  if (type === "university") {
    const moduleSlug = req.query.module as string;

    const { data: progress } = await supabaseAdmin
      .from("university_lesson_progress")
      .select("lesson_slug, completed_at")
      .eq("user_id", user.id)
      .eq("module_slug", moduleSlug || "");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const completedCount = progress?.length || 0;
    const dates = (progress || []).map(p => p.completed_at).filter(Boolean).sort();
    const completedAt = dates.length > 0 ? dates[dates.length - 1] : null;

    return res.status(200).json({
      eligible: completedCount > 0,
      completedCount,
      userName: profile?.full_name || "Bloom Member",
      completedAt,
      certId: `BLOOM-ADV-${new Date(completedAt || Date.now()).getFullYear()}-${user.id.slice(0, 6).toUpperCase()}`,
    });
  }

  if (type === "university-all") {
    const { data: progress } = await supabaseAdmin
      .from("university_lesson_progress")
      .select("module_slug, lesson_slug, completed_at")
      .eq("user_id", user.id);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const moduleMap: Record<string, number> = {};
    (progress || []).forEach(p => {
      moduleMap[p.module_slug] = (moduleMap[p.module_slug] || 0) + 1;
    });

    const dates = (progress || []).map(p => p.completed_at).filter(Boolean).sort();
    const completedAt = dates.length > 0 ? dates[dates.length - 1] : null;

    return res.status(200).json({
      eligible: (progress?.length || 0) > 0,
      completedCount: progress?.length || 0,
      moduleProgress: moduleMap,
      userName: profile?.full_name || "Bloom Member",
      completedAt,
      certId: `BLOOM-UNI-${new Date(completedAt || Date.now()).getFullYear()}-${user.id.slice(0, 6).toUpperCase()}`,
    });
  }

  return res.status(400).json({ error: "Invalid type" });
}
