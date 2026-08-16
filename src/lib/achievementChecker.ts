import { createClient } from "@supabase/supabase-js";
import { awardXP } from "@/lib/progression";
import { getAchievement } from "@/lib/achievements";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function tryUnlock(userId: string, key: string): Promise<boolean> {
  const achievement = getAchievement(key);
  if (!achievement) return false;

  const { data: existing } = await supabaseAdmin
    .from("user_achievements")
    .select("id")
    .eq("user_id", userId)
    .eq("achievement_key", key)
    .single();

  if (existing) return false;

  await supabaseAdmin.from("user_achievements").insert({
    user_id: userId,
    achievement_key: key,
  });

  await awardXP(userId, achievement.xpReward, `Achievement: ${achievement.title}`, key);
  return true;
}

export async function checkLessonAchievements(userId: string, completedCount: number): Promise<string[]> {
  const unlocked: string[] = [];

  if (completedCount >= 1 && await tryUnlock(userId, "first-lesson")) unlocked.push("first-lesson");
  if (completedCount >= 5 && await tryUnlock(userId, "five-lessons")) unlocked.push("five-lessons");
  if (completedCount >= 10 && await tryUnlock(userId, "ten-lessons")) unlocked.push("ten-lessons");
  if (completedCount >= 20 && await tryUnlock(userId, "twenty-lessons")) unlocked.push("twenty-lessons");
  if (completedCount >= 30 && await tryUnlock(userId, "all-lessons")) unlocked.push("all-lessons");

  return unlocked;
}

export async function checkTradeAchievements(
  userId: string,
  stats: { totalClosed: number; winStreak: number; hasProfitableTrade: boolean; hasThesis: boolean; thesisTradeCount: number; hasGoodRR: boolean }
): Promise<string[]> {
  const unlocked: string[] = [];

  if (await tryUnlock(userId, "first-trade")) unlocked.push("first-trade");
  if (stats.hasProfitableTrade && await tryUnlock(userId, "first-win")) unlocked.push("first-win");
  if (stats.totalClosed >= 10 && await tryUnlock(userId, "ten-trades")) unlocked.push("ten-trades");
  if (stats.totalClosed >= 50 && await tryUnlock(userId, "fifty-trades")) unlocked.push("fifty-trades");
  if (stats.winStreak >= 3 && await tryUnlock(userId, "win-streak-3")) unlocked.push("win-streak-3");
  if (stats.winStreak >= 5 && await tryUnlock(userId, "win-streak-5")) unlocked.push("win-streak-5");
  if (stats.hasGoodRR && await tryUnlock(userId, "risk-manager")) unlocked.push("risk-manager");
  if (stats.thesisTradeCount >= 5 && await tryUnlock(userId, "thesis-trader")) unlocked.push("thesis-trader");

  return unlocked;
}

export async function checkStreakAchievements(userId: string, currentStreak: number): Promise<string[]> {
  const unlocked: string[] = [];

  if (currentStreak >= 3 && await tryUnlock(userId, "streak-3")) unlocked.push("streak-3");
  if (currentStreak >= 7 && await tryUnlock(userId, "streak-7")) unlocked.push("streak-7");
  if (currentStreak >= 14 && await tryUnlock(userId, "streak-14")) unlocked.push("streak-14");
  if (currentStreak >= 30 && await tryUnlock(userId, "streak-30")) unlocked.push("streak-30");

  return unlocked;
}

export async function checkMiscAchievement(userId: string, key: string): Promise<boolean> {
  return tryUnlock(userId, key);
}
