import { createClient } from "@supabase/supabase-js";

// Gems are DERIVED, never stored. This module is the single source of truth for
// the earn rule: a passed lesson quiz = one gem-award.
//   - University lesson passed (row in university_lesson_progress) = 10 gems
//   - Learn quiz submitted (lesson_progress.quiz_completed = true)  = 5 gems
// Both the single-user total and the leaderboard route through computeGems so
// the math can never diverge.

export const GEMS_PER_UNIVERSITY_LESSON = 10;
export const GEMS_PER_LEARN_LESSON = 5;

export function computeGems(universityLessons: number, learnLessons: number): number {
  return universityLessons * GEMS_PER_UNIVERSITY_LESSON + learnLessons * GEMS_PER_LEARN_LESSON;
}

export interface GemBreakdown {
  gems: number;
  universityLessons: number;
  learnLessons: number;
}

export interface GemLeaderboardRow extends GemBreakdown {
  user_id: string;
  challenge_name: string;
  rank: number;
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const FALLBACK_NAME = "Bloom Member";

/** (a) One user's gem total + breakdown. */
export async function getUserGems(userId: string): Promise<GemBreakdown> {
  const [uniRes, learnRes] = await Promise.all([
    supabaseAdmin
      .from("university_lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabaseAdmin
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("quiz_completed", true),
  ]);

  const universityLessons = uniRes.count ?? 0;
  const learnLessons = learnRes.count ?? 0;
  return { universityLessons, learnLessons, gems: computeGems(universityLessons, learnLessons) };
}

/** (b) Compute + rank gems across all users, for the leaderboard. */
export async function getGemsLeaderboard(limit = 50): Promise<GemLeaderboardRow[]> {
  const [uniRes, learnRes, profilesRes] = await Promise.all([
    supabaseAdmin.from("university_lesson_progress").select("user_id"),
    supabaseAdmin.from("lesson_progress").select("user_id").eq("quiz_completed", true),
    supabaseAdmin.from("profiles").select("id, challenge_name"),
  ]);

  const uni = new Map<string, number>();
  for (const row of uniRes.data ?? []) {
    uni.set(row.user_id, (uni.get(row.user_id) ?? 0) + 1);
  }

  const learn = new Map<string, number>();
  for (const row of learnRes.data ?? []) {
    learn.set(row.user_id, (learn.get(row.user_id) ?? 0) + 1);
  }

  const names = new Map<string, string>();
  for (const p of (profilesRes.data ?? []) as { id: string; challenge_name: string | null }[]) {
    const name = (p.challenge_name ?? "").trim();
    if (name) names.set(p.id, name);
  }

  const userIds = new Set<string>([...uni.keys(), ...learn.keys()]);
  const rows = [...userIds].map((user_id) => {
    const universityLessons = uni.get(user_id) ?? 0;
    const learnLessons = learn.get(user_id) ?? 0;
    return {
      user_id,
      challenge_name: names.get(user_id) ?? FALLBACK_NAME,
      universityLessons,
      learnLessons,
      gems: computeGems(universityLessons, learnLessons),
    };
  });

  rows.sort((a, b) => b.gems - a.gems);
  return rows.slice(0, limit).map((r, i) => ({ ...r, rank: i + 1 }));
}
