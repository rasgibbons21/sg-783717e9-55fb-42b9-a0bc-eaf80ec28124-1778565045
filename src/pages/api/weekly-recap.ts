import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function weekRange(): { start: string; end: string } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

function buildEmailHTML(data: {
  name: string;
  streak: number;
  lessonsCompleted: number;
  tradesClosed: number;
  tradePnl: number;
  xpEarned: number;
  challengesCompleted: number;
  newBadges: string[];
  tip: string;
}) {
  const { name, streak, lessonsCompleted, tradesClosed, tradePnl, xpEarned, challengesCompleted, newBadges, tip } = data;
  const pnlColor = tradePnl >= 0 ? "#49B06E" : "#E5484D";
  const pnlSign = tradePnl >= 0 ? "+" : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:28px;">🌸</span>
      <h1 style="font-size:20px;color:#0E1B30;margin:8px 0 4px;">Your Week in Bloom</h1>
      <p style="color:#666;font-size:13px;margin:0;">Hey ${name}, here's how your week went</p>
    </div>

    <div style="background:white;border-radius:16px;padding:24px;margin-bottom:16px;border:1px solid #E5E7EB;">
      <div style="display:flex;justify-content:space-between;text-align:center;">
        <div style="flex:1;">
          <p style="font-size:24px;font-weight:700;color:#FB923C;margin:0;">${streak}</p>
          <p style="font-size:11px;color:#999;margin:4px 0 0;">Day Streak</p>
        </div>
        <div style="flex:1;">
          <p style="font-size:24px;font-weight:700;color:#27B7C8;margin:0;">${lessonsCompleted}</p>
          <p style="font-size:11px;color:#999;margin:4px 0 0;">Lessons</p>
        </div>
        <div style="flex:1;">
          <p style="font-size:24px;font-weight:700;color:#49B06E;margin:0;">${xpEarned}</p>
          <p style="font-size:11px;color:#999;margin:4px 0 0;">XP Earned</p>
        </div>
      </div>
    </div>

    ${tradesClosed > 0 ? `
    <div style="background:white;border-radius:16px;padding:20px;margin-bottom:16px;border:1px solid #E5E7EB;">
      <p style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Trading</p>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="font-size:13px;color:#0E1B30;margin:0;">${tradesClosed} trade${tradesClosed !== 1 ? "s" : ""} closed</p>
        </div>
        <p style="font-size:18px;font-weight:700;color:${pnlColor};margin:0;">${pnlSign}$${Math.abs(tradePnl).toFixed(2)}</p>
      </div>
    </div>` : ""}

    ${challengesCompleted > 0 ? `
    <div style="background:white;border-radius:16px;padding:20px;margin-bottom:16px;border:1px solid #E5E7EB;">
      <p style="font-size:13px;color:#0E1B30;margin:0;">
        <span style="font-size:16px;margin-right:6px;">⚡</span>
        ${challengesCompleted} daily challenge${challengesCompleted !== 1 ? "s" : ""} completed
      </p>
    </div>` : ""}

    ${newBadges.length > 0 ? `
    <div style="background:white;border-radius:16px;padding:20px;margin-bottom:16px;border:1px solid #E5E7EB;">
      <p style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">New Badges</p>
      <p style="font-size:24px;margin:0;">${newBadges.join(" ")}</p>
    </div>` : ""}

    <div style="background:linear-gradient(135deg,rgba(39,183,200,0.08),rgba(73,176,110,0.05));border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid rgba(39,183,200,0.15);">
      <p style="font-size:12px;color:#27B7C8;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Pansy's Tip</p>
      <p style="font-size:13px;color:#0E1B30;line-height:1.5;margin:0;">${tip}</p>
    </div>

    <div style="text-align:center;">
      <a href="https://shebloomswealth.app/home" style="display:inline-block;background:linear-gradient(135deg,#27B7C8,#49B06E);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600;">
        Continue Your Journey
      </a>
    </div>

    <p style="text-align:center;font-size:10px;color:#999;margin-top:32px;line-height:1.5;">
      She Blooms Wealth — Educational content only, not financial advice.<br>
      <a href="https://shebloomswealth.app/profile" style="color:#999;">Manage preferences</a>
    </p>
  </div>
</body>
</html>`;
}

const TIPS = [
  "Consistency beats intensity. Your streak proves you're building the habit — and habits build wealth.",
  "The best investors read more than they trade. Keep learning, and the confidence follows.",
  "Every trade you journal teaches you twice — once when you take it, and once when you review it.",
  "Markets reward patience. The urge to 'do something' is often the biggest risk of all.",
  "Your paper trades are building muscle memory. When real money is on the line, you'll be ready.",
  "Reviewing losing trades is where the real growth happens. Winners teach you less than you think.",
  "The fact that you're here, learning, already puts you ahead of 90% of people who never start.",
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const cronSecret = req.headers["x-cron-secret"];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return res.status(500).json({ error: "RESEND_API_KEY not configured" });
  }

  const { start, end } = weekRange();

  const { data: allUsers } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email:id")
    .limit(500);

  if (!allUsers || allUsers.length === 0) {
    return res.json({ sent: 0, message: "No users found" });
  }

  const userIds = allUsers.map(u => u.id);

  const { data: streaks } = await supabaseAdmin
    .from("daily_streaks")
    .select("user_id, current_streak")
    .in("user_id", userIds);

  const { data: lessonProgress } = await supabaseAdmin
    .from("lesson_progress")
    .select("user_id")
    .eq("completed", true)
    .gte("completed_at", start)
    .lte("completed_at", end)
    .in("user_id", userIds);

  const { data: trades } = await supabaseAdmin
    .from("practice_trades")
    .select("user_id, pnl")
    .eq("status", "closed")
    .gte("exit_at", start)
    .lte("exit_at", end)
    .in("user_id", userIds);

  const { data: xpLogs } = await supabaseAdmin
    .from("user_xp_log")
    .select("user_id, xp_earned")
    .gte("created_at", start)
    .lte("created_at", end)
    .in("user_id", userIds);

  const { data: challengeCompletions } = await supabaseAdmin
    .from("daily_challenge_completions")
    .select("user_id")
    .gte("completed_at", start)
    .lte("completed_at", end)
    .in("user_id", userIds);

  const { data: newAchievements } = await supabaseAdmin
    .from("user_achievements")
    .select("user_id, achievement_key")
    .gte("earned_at", start)
    .lte("earned_at", end)
    .in("user_id", userIds);

  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 500 });
  const emailMap = new Map(
    (authUsers?.users ?? []).map(u => [u.id, u.email])
  );

  const streakMap = new Map((streaks ?? []).map(s => [s.user_id, s.current_streak]));

  function countForUser<T extends { user_id: string }>(data: T[] | null, userId: string): number {
    return (data ?? []).filter(d => d.user_id === userId).length;
  }

  function sumForUser<T extends { user_id: string }>(data: T[] | null, userId: string, field: keyof T): number {
    return (data ?? []).filter(d => d.user_id === userId).reduce((s, d) => s + (Number(d[field]) || 0), 0);
  }

  let sent = 0;
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];

  const { ACHIEVEMENTS } = await import("@/lib/achievements");
  const emojiMap = new Map(ACHIEVEMENTS.map(a => [a.key, a.emoji]));

  for (const user of allUsers) {
    const email = emailMap.get(user.id);
    if (!email) continue;

    const lessonsCompleted = countForUser(lessonProgress, user.id);
    const tradesClosed = countForUser(trades, user.id);
    const tradePnl = sumForUser(trades, user.id, "pnl" as keyof typeof trades[0]);
    const xpEarned = sumForUser(xpLogs, user.id, "xp_earned" as keyof typeof xpLogs[0]);
    const challengesCompleted = countForUser(challengeCompletions, user.id);
    const streak = streakMap.get(user.id) ?? 0;
    const badges = (newAchievements ?? [])
      .filter(a => a.user_id === user.id)
      .map(a => emojiMap.get(a.achievement_key) ?? "🏅");

    const hadActivity = lessonsCompleted > 0 || tradesClosed > 0 || challengesCompleted > 0 || xpEarned > 0;
    if (!hadActivity && streak === 0) continue;

    const html = buildEmailHTML({
      name: user.full_name?.split(" ")[0] || "Bloom friend",
      streak,
      lessonsCompleted,
      tradesClosed,
      tradePnl,
      xpEarned,
      challengesCompleted,
      newBadges: badges,
      tip,
    });

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bloom <hello@shebloomswealth.app>",
          to: email,
          subject: `Your Week in Bloom — ${streak > 0 ? `${streak}-day streak!` : "Here's your recap"}`,
          html,
        }),
      });

      if (emailRes.ok) sent++;
    } catch {}
  }

  return res.json({ sent, totalUsers: allUsers.length });
}
