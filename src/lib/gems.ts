import { createClient } from "@supabase/supabase-js";
import { displayName, gapToNext, rankRows } from "@/lib/leaderboard/rank";

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

interface GemTotals {
  rows: GemLeaderboardRow[];
  hiddenIds: Set<string>;
}

async function computeAllUsers(): Promise<GemTotals> {
  const [uniRes, learnRes, profilesRes] = await Promise.all([
    supabaseAdmin.from("university_lesson_progress").select("user_id"),
    supabaseAdmin.from("lesson_progress").select("user_id").eq("quiz_completed", true),
    supabaseAdmin.from("profiles").select("id, challenge_name, full_name, is_review_account, show_on_leaderboard"),
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
  const reviewIds = new Set<string>();
  const hiddenIds = new Set<string>();
  for (const p of profilesRes.data ?? []) {
    if (p.is_review_account) reviewIds.add(p.id);
    if (p.show_on_leaderboard === false) hiddenIds.add(p.id);
    names.set(p.id, displayName(p));
  }

  const userIds = new Set<string>([...uni.keys(), ...learn.keys()]);
  for (const id of reviewIds) userIds.delete(id);
  const rows = [...userIds].map((user_id) => {
    const universityLessons = uni.get(user_id) ?? 0;
    const learnLessons = learn.get(user_id) ?? 0;
    return {
      user_id,
      challenge_name: names.get(user_id) ?? "Member",
      universityLessons,
      learnLessons,
      gems: computeGems(universityLessons, learnLessons),
      rank: 0,
    };
  });

  return { rows, hiddenIds };
}

const byGems = (row: GemLeaderboardRow) => row.gems;

/** Viewer-aware board: the top members, plus the viewer's own row and how far it is
 *  to the next place. A hidden viewer still sees their own totals, unranked. */
export async function getLeaderboardView(viewerId: string, limit = 10) {
  const { rows, hiddenIds } = await computeAllUsers();
  const ranked = rankRows(rows, byGems, hiddenIds, (row) => row.user_id);
  const hidden = hiddenIds.has(viewerId);
  const me = hidden ? rows.find((row) => row.user_id === viewerId) ?? null : ranked.find((row) => row.user_id === viewerId) ?? null;
  return {
    top: ranked.slice(0, limit),
    me,
    hidden,
    gap_to_next: gapToNext(ranked, viewerId, byGems),
  };
}
