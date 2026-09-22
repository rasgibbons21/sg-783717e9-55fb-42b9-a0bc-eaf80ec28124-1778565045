import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shebloomswealth.app";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const cronSecret = req.headers["x-cron-secret"];
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 1. Run the scanner to get fresh candidates
  let candidates: any[] = [];
  try {
    const scanRes = await fetch(`${SITE_URL}/api/scanner/scan?fresh=1`, {
      signal: AbortSignal.timeout(25_000),
    });
    const data = await scanRes.json();
    candidates = data.candidates || [];
  } catch (err: any) {
    return res.status(500).json({ error: "Scanner fetch failed", detail: err?.message });
  }

  // 2. Collect ACTIVE signals
  const activeSignals: Array<{
    symbol: string;
    price: number;
    change: number;
    strategyId: string;
    strategyName: string;
    entryZone: string | null;
    stopLevel: string | null;
    target: string | null;
    score: number;
  }> = [];

  for (const c of candidates) {
    if (!c.signals) continue;
    for (const sig of c.signals) {
      if (sig.state !== "ACTIVE") continue;
      activeSignals.push({
        symbol: c.symbol,
        price: c.price,
        change: c.change,
        strategyId: sig.strategyId,
        strategyName: sig.strategyName || sig.strategyId,
        entryZone: sig.entryZone ?? null,
        stopLevel: sig.invalidationLevel ?? null,
        target: sig.target1 ?? null,
        score: sig.score,
      });
    }
  }

  if (activeSignals.length === 0) {
    return res.json({ sent: 0, signals: 0, message: "No active signals found" });
  }

  // 3. Deduplicate — skip signals already pushed in the last 60 min
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentNotifs } = await supabaseAdmin
    .from("notification_log")
    .select("metadata")
    .eq("notification_type", "signal_alert")
    .gte("created_at", oneHourAgo);

  const notifiedSet = new Set(
    (recentNotifs ?? []).map((n: any) => `${n.metadata?.symbol}:${n.metadata?.strategy}`)
  );

  const newSignals = activeSignals
    .filter((s) => !notifiedSet.has(`${s.symbol}:${s.strategyId}`))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (newSignals.length === 0) {
    return res.json({ sent: 0, signals: activeSignals.length, message: "All active signals already notified" });
  }

  // 4. Get push subscribers
  const { data: subs } = await supabaseAdmin.from("push_subscriptions").select("*");
  if (!subs || subs.length === 0) {
    return res.json({ sent: 0, signals: newSignals.length, message: "No push subscribers" });
  }

  // 5. Build notification payload
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: "VAPID keys not configured" });
  }

  const webpush = await import("web-push");
  webpush.setVapidDetails("mailto:cindervaultenterprisesllc@gmail.com", vapidPublic, vapidPrivate);

  const top = newSignals[0];
  const title = newSignals.length === 1
    ? `${top.symbol} — ${top.strategyName} Signal`
    : `${newSignals.length} New Signals Found`;

  const lines = newSignals.map((s) => {
    const dir = s.change > 0 ? "+" : "";
    const entry = s.entryZone ? ` · Entry ${s.entryZone}` : "";
    return `${s.symbol} ${dir}${s.change}%${entry}`;
  });

  const payload = JSON.stringify({
    title,
    body: lines.join("\n"),
    url: newSignals.length === 1 ? `/scanner/${top.symbol}` : "/signals",
  });

  // 6. Send to all subscribers
  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
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

  // 7. Log notifications to prevent re-sending
  const logRows = newSignals.map((s) => ({
    user_id: null as string | null,
    notification_type: "signal_alert",
    metadata: {
      symbol: s.symbol,
      strategy: s.strategyId,
      price: s.price,
      change: s.change,
      entry: s.entryZone,
    },
  }));

  try { await supabaseAdmin.from("notification_log").insert(logRows); } catch {}

  return res.json({ sent, failed, signals: newSignals.length, subscribers: subs.length });
}
