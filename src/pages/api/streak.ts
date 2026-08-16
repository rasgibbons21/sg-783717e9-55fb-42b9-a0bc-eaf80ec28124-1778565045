import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { awardXP } from "@/lib/progression";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  return Math.round(
    (new Date(a).getTime() - new Date(b).getTime()) / 86_400_000
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "POST") return handlePost(req, res);
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user.id;

  const { data: streak } = await supabaseAdmin
    .from("daily_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  const today = toDateKey(new Date());
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: activity } = await supabaseAdmin
    .from("daily_activity_log")
    .select("activity_date, activity_type")
    .eq("user_id", userId)
    .gte("activity_date", toDateKey(thirtyDaysAgo))
    .order("activity_date", { ascending: false });

  const activeDates = [...new Set((activity ?? []).map(a => a.activity_date))];

  return res.json({
    currentStreak: streak?.current_streak ?? 0,
    longestStreak: streak?.longest_streak ?? 0,
    lastActiveDate: streak?.last_active_date ?? null,
    totalActiveDays: streak?.total_active_days ?? 0,
    activeDates,
    today,
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user.id;

  const { activityType = "login", referenceId } = req.body ?? {};
  const today = toDateKey(new Date());
  const refId = referenceId ?? `${activityType}-${today}`;

  await supabaseAdmin.from("daily_activity_log").upsert(
    {
      user_id: userId,
      activity_date: today,
      activity_type: activityType,
      reference_id: refId,
    },
    { onConflict: "user_id,activity_date,activity_type,reference_id" }
  );

  const { data: existing } = await supabaseAdmin
    .from("daily_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  let currentStreak = 1;
  let longestStreak = 1;
  let totalActiveDays = 1;

  if (existing) {
    const lastDate = existing.last_active_date;
    const diff = diffDays(today, lastDate);

    if (diff === 0) {
      return res.json({
        currentStreak: existing.current_streak,
        longestStreak: existing.longest_streak,
        totalActiveDays: existing.total_active_days,
        streakExtended: false,
      });
    }

    if (diff === 1) {
      currentStreak = existing.current_streak + 1;
    }
    longestStreak = Math.max(currentStreak, existing.longest_streak);
    totalActiveDays = existing.total_active_days + 1;

    await supabaseAdmin
      .from("daily_streaks")
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active_date: today,
        total_active_days: totalActiveDays,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } else {
    await supabaseAdmin.from("daily_streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
      total_active_days: 1,
    });
  }

  const milestones = [3, 7, 14, 30, 60, 100];
  const hitMilestone = milestones.find(m => currentStreak === m);
  if (hitMilestone) {
    const xpBonus = hitMilestone * 5;
    await awardXP(userId, xpBonus, `${hitMilestone}-day streak milestone`);
  }

  return res.json({
    currentStreak,
    longestStreak,
    totalActiveDays,
    streakExtended: true,
    milestone: hitMilestone ?? null,
  });
}
