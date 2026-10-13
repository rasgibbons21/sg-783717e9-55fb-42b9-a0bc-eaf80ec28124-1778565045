import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireAdminUser, sendAuthError } from "@/lib/requireProUser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireAdminUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const { userId, title, body, url } = req.body ?? {};

  const webpush = await import("web-push");

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: "VAPID keys not configured" });
  }

  webpush.setVapidDetails("mailto:cindervaultenterprisesllc@gmail.com", vapidPublic, vapidPrivate);

  const query = supabaseAdmin.from("push_subscriptions").select("*");
  if (userId) query.eq("user_id", userId);

  const { data: subs } = await query;
  if (!subs || subs.length === 0) {
    return res.json({ sent: 0, message: "No subscriptions found" });
  }

  const payload = JSON.stringify({ title: title || "Bloom", body: body || "", url: url || "/home" });
  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth_key },
        },
        payload
      );
      sent++;
    } catch (err: unknown) {
      failed++;
      if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
        await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }

  return res.json({ sent, failed });
}
