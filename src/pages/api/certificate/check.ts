import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { UNIVERSITY_MODULES } from "@/data/university/modules";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const BASICS_TOTAL_LESSONS = 20;

const UNLOCKED_MODULE_SLUGS = [
  "m1-chart-reading", "m2-chart-patterns", "m3-indicators", "m4-trading-signals",
  "m5-strategies", "m6-entering", "m7-managing", "m8-exiting", "m10-candlestick-patterns",
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Unauthorized" });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const userName = profile?.full_name || "Bloom Member";
  const type = req.query.type as string;

  if (type === "basics") {
    const { data: progress } = await supabaseAdmin
      .from("lesson_progress")
      .select("lesson_id, completed_at")
      .eq("user_id", user.id)
      .eq("completed", true);

    const completedCount = progress?.length || 0;
    const allComplete = completedCount >= BASICS_TOTAL_LESSONS;
    const dates = (progress || []).map(p => p.completed_at).filter(Boolean).sort();
    const completedAt = dates.length > 0 ? dates[dates.length - 1] : null;

    return res.status(200).json({
      eligible: allComplete,
      allComplete,
      completedCount,
      totalRequired: BASICS_TOTAL_LESSONS,
      userName,
      completedAt,
      certId: `BLOOM-${new Date(completedAt || Date.now()).getFullYear()}-${user.id.slice(0, 6).toUpperCase()}`,
    });
  }

  if (type === "university") {
    const moduleSlug = req.query.module as string;
    const mod = UNIVERSITY_MODULES.find(m => m.slug === moduleSlug);
    if (!mod) return res.status(400).json({ error: "Invalid module" });

    const { data: progress } = await supabaseAdmin
      .from("university_lesson_progress")
      .select("lesson_slug, completed_at")
      .eq("user_id", user.id)
      .eq("module_slug", moduleSlug);

    const completedCount = progress?.length || 0;
    const allComplete = completedCount >= mod.lessonCount;
    const dates = (progress || []).map(p => p.completed_at).filter(Boolean).sort();
    const completedAt = dates.length > 0 ? dates[dates.length - 1] : null;

    return res.status(200).json({
      eligible: allComplete,
      allComplete,
      completedCount,
      totalRequired: mod.lessonCount,
      userName,
      completedAt,
      certId: `BLOOM-ADV-${new Date(completedAt || Date.now()).getFullYear()}-${user.id.slice(0, 6).toUpperCase()}`,
    });
  }

  if (type === "university-all") {
    const { data: progress } = await supabaseAdmin
      .from("university_lesson_progress")
      .select("module_slug, lesson_slug, completed_at")
      .eq("user_id", user.id);

    const moduleMap: Record<string, number> = {};
    (progress || []).forEach(p => {
      moduleMap[p.module_slug] = (moduleMap[p.module_slug] || 0) + 1;
    });

    const totalRequired = UNLOCKED_MODULE_SLUGS.reduce((sum, slug) => {
      const mod = UNIVERSITY_MODULES.find(m => m.slug === slug);
      return sum + (mod?.lessonCount || 0);
    }, 0);

    const allModulesComplete = UNLOCKED_MODULE_SLUGS.every(slug => {
      const mod = UNIVERSITY_MODULES.find(m => m.slug === slug);
      return mod && (moduleMap[slug] || 0) >= mod.lessonCount;
    });

    const dates = (progress || []).map(p => p.completed_at).filter(Boolean).sort();
    const completedAt = dates.length > 0 ? dates[dates.length - 1] : null;

    return res.status(200).json({
      eligible: allModulesComplete,
      allComplete: allModulesComplete,
      completedCount: progress?.length || 0,
      totalRequired,
      moduleProgress: moduleMap,
      userName,
      completedAt,
      certId: `BLOOM-UNI-${new Date(completedAt || Date.now()).getFullYear()}-${user.id.slice(0, 6).toUpperCase()}`,
    });
  }

  return res.status(400).json({ error: "Invalid type" });
}
