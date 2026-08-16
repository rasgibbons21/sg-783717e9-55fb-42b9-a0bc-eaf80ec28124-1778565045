import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { awardXP } from "@/lib/progression";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const CHALLENGE_POOL = [
  {
    challenge_type: "trade",
    title: "Make a Paper Trade",
    description: "Open and close a paper trade in the Practice Trader. Any stock, any direction — just practice reading the chart before you enter.",
    reward_xp: 25,
    reward_gems: 5,
    criteria: { type: "trade_closed" },
  },
  {
    challenge_type: "learn",
    title: "Complete a Lesson",
    description: "Finish any lesson you haven't completed yet. Every lesson you finish compounds your knowledge — and your confidence.",
    reward_xp: 20,
    reward_gems: 5,
    criteria: { type: "lesson_completed" },
  },
  {
    challenge_type: "trade",
    title: "Green Trade Challenge",
    description: "Close a paper trade in profit. Read the chart, pick your entry, set your stop — and aim for green.",
    reward_xp: 35,
    reward_gems: 8,
    criteria: { type: "profitable_trade" },
  },
  {
    challenge_type: "journal",
    title: "Journal a Trade",
    description: "Write a journal entry about a trade — what you saw, why you entered, and what you learned. Reflection builds real skill.",
    reward_xp: 20,
    reward_gems: 5,
    criteria: { type: "journal_entry" },
  },
  {
    challenge_type: "learn",
    title: "Quiz Master",
    description: "Complete a quiz in any lesson module. Test what you know — it's the fastest way to lock in knowledge.",
    reward_xp: 25,
    reward_gems: 5,
    criteria: { type: "quiz_completed" },
  },
  {
    challenge_type: "research",
    title: "Research a Stock",
    description: "Look up a stock on the Discover page and read about the company. Real investors do their homework first.",
    reward_xp: 15,
    reward_gems: 3,
    criteria: { type: "stock_researched" },
  },
  {
    challenge_type: "trade",
    title: "Long & Short Challenge",
    description: "Open both a LONG and a SHORT paper trade today. Practice seeing the market from both sides.",
    reward_xp: 40,
    reward_gems: 10,
    criteria: { type: "long_and_short" },
  },
  {
    challenge_type: "learn",
    title: "Two Lesson Streak",
    description: "Complete two lessons today. They don't have to be in the same module — just keep the momentum going.",
    reward_xp: 30,
    reward_gems: 7,
    criteria: { type: "two_lessons" },
  },
  {
    challenge_type: "trade",
    title: "Risk Manager",
    description: "Open a trade with both a stop-loss AND a profit target. Plan the trade, trade the plan.",
    reward_xp: 30,
    reward_gems: 6,
    criteria: { type: "trade_with_stops" },
  },
  {
    challenge_type: "learn",
    title: "Strategy Explorer",
    description: "Visit the Bloom Strategy Lab and explore a strategy you haven't tried. Knowledge is your edge.",
    reward_xp: 20,
    reward_gems: 5,
    criteria: { type: "strategy_explored" },
  },
];

function getDailyChallenge(dateStr: string) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % CHALLENGE_POOL.length;
  return CHALLENGE_POOL[idx];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "POST") return handleComplete(req, res);
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user.id;

  const today = new Date().toISOString().slice(0, 10);

  let { data: challenge } = await supabaseAdmin
    .from("daily_challenges")
    .select("*")
    .eq("challenge_date", today)
    .single();

  if (!challenge) {
    const template = getDailyChallenge(today);
    const { data: inserted } = await supabaseAdmin
      .from("daily_challenges")
      .upsert(
        { challenge_date: today, ...template },
        { onConflict: "challenge_date" }
      )
      .select()
      .single();
    challenge = inserted;
  }

  if (!challenge) {
    return res.status(500).json({ error: "Failed to create daily challenge" });
  }

  const { data: completion } = await supabaseAdmin
    .from("daily_challenge_completions")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("challenge_id", challenge.id)
    .single();

  return res.json({
    challenge: {
      id: challenge.id,
      date: challenge.challenge_date,
      type: challenge.challenge_type,
      title: challenge.title,
      description: challenge.description,
      rewardXp: challenge.reward_xp,
      rewardGems: challenge.reward_gems,
    },
    completed: !!completion,
    completedAt: completion?.completed_at ?? null,
  });
}

async function handleComplete(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user.id;

  const { challengeId } = req.body ?? {};
  if (!challengeId) {
    return res.status(400).json({ error: "challengeId required" });
  }

  const { data: challenge } = await supabaseAdmin
    .from("daily_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (!challenge) {
    return res.status(404).json({ error: "Challenge not found" });
  }

  const { data: existing } = await supabaseAdmin
    .from("daily_challenge_completions")
    .select("id")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .single();

  if (existing) {
    return res.json({ success: true, alreadyCompleted: true });
  }

  await supabaseAdmin.from("daily_challenge_completions").insert({
    user_id: userId,
    challenge_id: challengeId,
  });

  await awardXP(userId, challenge.reward_xp, "Daily challenge completed", challengeId);

  const today = new Date().toISOString().slice(0, 10);
  await supabaseAdmin.from("daily_activity_log").upsert(
    {
      user_id: userId,
      activity_date: today,
      activity_type: "challenge",
      reference_id: challengeId,
    },
    { onConflict: "user_id,activity_date,activity_type,reference_id" }
  );

  return res.json({
    success: true,
    alreadyCompleted: false,
    xpAwarded: challenge.reward_xp,
    gemsAwarded: challenge.reward_gems,
  });
}
