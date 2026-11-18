import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { dueForSavingsReminder, SAVINGS_REMINDER } from "@/lib/budget/reminders";

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Daily: sends Pansy's savings-day reminder to members who turned notifications on and whose savings day it is.
 * Called by Vercel Cron (GET with "Authorization: Bearer CRON_SECRET") or the older POST with x-cron-secret.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.CRON_SECRET;
  const bearer = req.headers.authorization === `Bearer ${secret}`;
  const legacy = req.headers["x-cron-secret"] === secret;
  if (!secret || !(bearer || legacy)) return res.status(401).json({ error: "Unauthorized" });

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) return res.status(500).json({ error: "VAPID keys not configured" });

  const { data: plans, error } = await supabaseAdmin.from("budget_plans").select("user_id, savings_days, next_payday, pay_frequency, time_zone").eq("notify", true);
  if (error) return res.status(500).json({ error: "Could not read plans" });

  const due = dueForSavingsReminder((plans ?? []) as Parameters<typeof dueForSavingsReminder>[0], new Date());
  if (due.length === 0) return res.status(200).json({ sent: 0 });

  const { data: subs } = await supabaseAdmin.from("push_subscriptions").select("id, user_id, endpoint, p256dh, auth_key").in("user_id", due);

  const webpush = await import("web-push");
  webpush.setVapidDetails("mailto:cindervaultenterprisesllc@gmail.com", vapidPublic, vapidPrivate);
  const payload = JSON.stringify(SAVINGS_REMINDER);

  let sent = 0;
  for (const sub of (subs ?? []) as { id: string; endpoint: string; p256dh: string; auth_key: string }[]) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } }, payload);
      sent += 1;
    } catch (err: unknown) {
      // A subscription the browser has withdrawn is removed so we stop trying it.
      if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
        await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }
  return res.status(200).json({ sent, due: due.length });
}
