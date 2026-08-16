import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const cronSecret = req.headers["x-cron-secret"];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const { data: atRiskUsers } = await supabaseAdmin
    .from("daily_streaks")
    .select("user_id, current_streak, last_active_date")
    .eq("last_active_date", yesterday)
    .gte("current_streak", 2);

  if (!atRiskUsers || atRiskUsers.length === 0) {
    return res.json({ sent: 0, message: "No at-risk streaks" });
  }

  const userIds = atRiskUsers.map(u => u.user_id);

  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("*")
    .in("user_id", userIds);

  if (!subs || subs.length === 0) {
    return res.json({ sent: 0, message: "No push subscriptions for at-risk users" });
  }

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: "VAPID keys not configured" });
  }

  const webpush = await import("web-push");
  webpush.setVapidDetails("mailto:rasgibbons@gmail.com", vapidPublic, vapidPrivate);

  const streakMap = new Map(atRiskUsers.map(u => [u.user_id, u.current_streak]));
  let sent = 0;

  for (const sub of subs) {
    const streak = streakMap.get(sub.user_id) ?? 0;
    const payload = JSON.stringify({
      title: `Your ${streak}-day streak is at risk!`,
      body: "Open Bloom today to keep your streak alive. Even 1 minute counts.",
      url: "/home",
    });

    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        payload
      );
      sent++;

      await supabaseAdmin.from("notification_log").insert({
        user_id: sub.user_id,
        notification_type: "streak_reminder",
        metadata: { streak, date: today },
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
        await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }

  return res.json({ sent, atRiskCount: atRiskUsers.length });
}
