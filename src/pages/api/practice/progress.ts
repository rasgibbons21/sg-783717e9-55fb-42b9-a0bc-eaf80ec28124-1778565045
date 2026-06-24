import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { MISSIONS, LEVELS, getLevelForXP } from "@/lib/progression";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user!.id;

  const [
    { data: xpRow },
    { data: userMissions },
    { data: closedTrades },
    { data: journalRows },
  ] = await Promise.all([
    supabaseAdmin.from("user_xp").select("total_xp").eq("user_id", userId).single(),
    supabaseAdmin.from("user_missions").select("mission_key, status, completed_at").eq("user_id", userId),
    supabaseAdmin.from("practice_trades")
      .select("stop_price, thesis, target_price")
      .eq("user_id", userId).eq("status", "closed"),
    supabaseAdmin.from("practice_journal")
      .select("score_discipline")
      .eq("user_id", userId),
  ]);

  // ── XP + Level ──────────────────────────────────────────────────────────────
  const totalXP = xpRow?.total_xp ?? 0;
  const levelInfo = getLevelForXP(totalXP);

  // ── Missions ────────────────────────────────────────────────────────────────
  const missionMap = new Map<string, { status: string; completedAt: string | null }>(
    (userMissions ?? []).map((m: { mission_key: string; status: string; completed_at: string | null }) => [
      m.mission_key,
      { status: m.status, completedAt: m.completed_at },
    ])
  );

  const missions = MISSIONS.map(m => {
    const row = missionMap.get(m.key);
    return {
      key: m.key,
      title: m.title,
      description: m.description,
      xpReward: m.xpReward,
      unlockedByLesson: m.unlockedByLesson,
      status: (row?.status ?? "locked") as "locked" | "unlocked" | "completed",
      completedAt: row?.completedAt ?? null,
    };
  });

  // ── Discipline Habits ────────────────────────────────────────────────────────
  const totalClosed = closedTrades?.length ?? 0;
  const stopSetRate = totalClosed > 0
    ? Math.round(closedTrades!.filter((t: { stop_price: number | null }) => t.stop_price != null).length / totalClosed * 100)
    : 0;
  const thesisRate = totalClosed > 0
    ? Math.round(closedTrades!.filter((t: { thesis: string | null }) => t.thesis?.trim()).length / totalClosed * 100)
    : 0;
  const targetSetRate = totalClosed > 0
    ? Math.round(closedTrades!.filter((t: { target_price: number | null }) => t.target_price != null).length / totalClosed * 100)
    : 0;

  const journalCount = journalRows?.length ?? 0;
  const journalCompletionRate = totalClosed > 0
    ? Math.min(100, Math.round(journalCount / totalClosed * 100))
    : 0;

  const disciplineScores = (journalRows ?? [])
    .map((j: { score_discipline: number | null }) => j.score_discipline)
    .filter((s: number | null): s is number => s != null);
  const avgDisciplineScore = disciplineScores.length > 0
    ? Math.round(disciplineScores.reduce((a: number, b: number) => a + b, 0) / disciplineScores.length)
    : null;

  // Weighted overall habit score (process-first, not profit-first)
  const overallHabitScore = Math.round(
    stopSetRate * 0.25 +
    thesisRate  * 0.25 +
    targetSetRate * 0.15 +
    (avgDisciplineScore ?? 0) * 0.25 +
    journalCompletionRate * 0.10
  );

  return res.status(200).json({
    xp: totalXP,
    level: {
      current: levelInfo.current,
      next: levelInfo.next,
      progressPct: levelInfo.progressPct,
      xpToNext: levelInfo.xpToNext,
      allLevels: LEVELS,
    },
    missions,
    habits: {
      totalClosedTrades: totalClosed,
      stopSetRate,
      thesisRate,
      targetSetRate,
      avgDisciplineScore,
      journalCompletionRate,
      overallHabitScore,
    },
  });
}
