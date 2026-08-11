import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { awardXP } from "@/lib/progression";

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
    const { data, error } = await supabaseAdmin
      .from("strategy_scores")
      .select("*")
      .eq("user_id", userId)
      .order("attempted_at", { ascending: false })
      .limit(5);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ scores: data ?? [] });
  }

  if (req.method === "POST") {
    const {
      patternRecognition,
      riskAwareness,
      chartReading,
      strategySelection,
      discipline,
      totalScore,
      chartsCompleted,
      noTradeCorrect,
      details,
    } = req.body as {
      patternRecognition?: number;
      riskAwareness?: number;
      chartReading?: number;
      strategySelection?: number;
      discipline?: number;
      totalScore?: number;
      chartsCompleted?: number;
      noTradeCorrect?: number;
      details?: unknown[];
    };

    if (totalScore === undefined || chartsCompleted === undefined) {
      return res.status(400).json({ error: "totalScore and chartsCompleted required" });
    }

    const { error } = await supabaseAdmin
      .from("strategy_scores")
      .insert({
        user_id: userId,
        pattern_recognition: patternRecognition ?? 0,
        risk_awareness: riskAwareness ?? 0,
        chart_reading: chartReading ?? 0,
        strategy_selection: strategySelection ?? 0,
        discipline: discipline ?? 0,
        total_score: totalScore,
        charts_completed: chartsCompleted,
        no_trade_correct: noTradeCorrect ?? 0,
        details: details ?? [],
        attempted_at: new Date().toISOString(),
      });

    if (error) {
      console.error("challenge score insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (totalScore >= 80) {
      await awardXP(userId, 100, "Strategy Challenge: 80+ score", "strategy/challenge/80");
    } else if (totalScore >= 60) {
      await awardXP(userId, 50, "Strategy Challenge: 60+ score", "strategy/challenge/60");
    } else {
      await awardXP(userId, 20, "Strategy Challenge completed", "strategy/challenge/attempt");
    }

    return res.status(200).json({ ok: true, totalScore });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
