import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { awardXP } from "@/lib/progression";
import { ACHIEVEMENTS, getAchievement } from "@/lib/achievements";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "POST") return handleUnlock(req, res);
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user.id;

  const { data: earned } = await supabaseAdmin
    .from("user_achievements")
    .select("achievement_key, earned_at")
    .eq("user_id", userId);

  const earnedMap = new Map(
    (earned ?? []).map(e => [e.achievement_key, e.earned_at])
  );

  const achievements = ACHIEVEMENTS.map(a => ({
    ...a,
    earned: earnedMap.has(a.key),
    earnedAt: earnedMap.get(a.key) ?? null,
  }));

  return res.json({
    achievements,
    earnedCount: earnedMap.size,
    totalCount: ACHIEVEMENTS.length,
  });
}

async function handleUnlock(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user.id;

  const { key } = req.body ?? {};
  if (!key) return res.status(400).json({ error: "key required" });

  const achievement = getAchievement(key);
  if (!achievement) return res.status(404).json({ error: "Unknown achievement" });

  const { data: existing } = await supabaseAdmin
    .from("user_achievements")
    .select("id")
    .eq("user_id", userId)
    .eq("achievement_key", key)
    .single();

  if (existing) {
    return res.json({ success: true, alreadyEarned: true });
  }

  await supabaseAdmin.from("user_achievements").insert({
    user_id: userId,
    achievement_key: key,
  });

  await awardXP(userId, achievement.xpReward, `Achievement: ${achievement.title}`, key);

  return res.json({
    success: true,
    alreadyEarned: false,
    achievement,
    xpAwarded: achievement.xpReward,
  });
}
