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

  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return res.status(500).json({ error: "VAPID keys not configured" });
  }

  const webpush = await import("web-push");
  webpush.setVapidDetails("mailto:cindervaultenterprisesllc@gmail.com", vapidPublic, vapidPrivate);

  const { data: subs } = await supabaseAdmin.from("push_subscriptions").select("*");
  const subMap = new Map<string, typeof subs>();

  // Group subscribers by user_id for targeted price alerts
  for (const sub of subs ?? []) {
    const uid = sub.user_id ?? "__anon__";
    if (!subMap.has(uid)) subMap.set(uid, []);
    subMap.get(uid)!.push(sub);
  }

  const allSubs = subs ?? [];
  let totalSent = 0;
  let totalFailed = 0;

  // Helper: send push to specific subscribers
  async function sendPush(targets: any[], payload: string) {
    let s = 0, f = 0;
    for (const sub of targets) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          payload
        );
        s++;
      } catch (err: unknown) {
        f++;
        if (err && typeof err === "object" && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }
    return { s, f };
  }

  // ── PART A: Scanner signal alerts (broadcast to all subscribers) ──────

  let signalCount = 0;

  try {
    const scanRes = await fetch(`${SITE_URL}/api/scanner/scan?fresh=1`, {
      signal: AbortSignal.timeout(25_000),
    });
    const data = await scanRes.json();
    const candidates = data.candidates || [];

    const activeSignals: Array<{
      symbol: string; price: number; change: number;
      strategyId: string; strategyName: string;
      entryZone: string | null; score: number;
    }> = [];

    for (const c of candidates) {
      if (!c.signals) continue;
      for (const sig of c.signals) {
        if (sig.state !== "ACTIVE") continue;
        activeSignals.push({
          symbol: c.symbol, price: c.price, change: c.change,
          strategyId: sig.strategyId,
          strategyName: sig.strategyName || sig.strategyId,
          entryZone: sig.entryZone ?? null,
          score: sig.score,
        });
      }
    }

    if (activeSignals.length > 0 && allSubs.length > 0) {
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

      if (newSignals.length > 0) {
        signalCount = newSignals.length;
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
          title, body: lines.join("\n"),
          url: newSignals.length === 1 ? `/scanner/${top.symbol}` : "/signals",
        });

        const r = await sendPush(allSubs, payload);
        totalSent += r.s;
        totalFailed += r.f;

        const logRows = newSignals.map((s) => ({
          user_id: null as string | null,
          notification_type: "signal_alert",
          metadata: { symbol: s.symbol, strategy: s.strategyId, price: s.price, change: s.change, entry: s.entryZone },
        }));
        try { await supabaseAdmin.from("notification_log").insert(logRows); } catch {}
      }
    }
  } catch (err: any) {
    console.error("Scanner signal check failed:", err?.message);
  }

  // ── PART B: Price alerts (targeted per-user) ─────────────────────────

  let priceAlertsSent = 0;

  try {
    const { data: alerts } = await supabaseAdmin
      .from("price_alerts")
      .select("*")
      .eq("enabled", true);

    if (alerts && alerts.length > 0) {
      const tickers = [...new Set(alerts.map((a: any) => a.ticker))];

      // Fetch current prices via Finnhub
      const finnhubKey = process.env.FINNHUB_API_KEY;
      const priceMap = new Map<string, number>();

      if (finnhubKey) {
        await Promise.all(
          tickers.map(async (sym: string) => {
            try {
              const r = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`,
                { signal: AbortSignal.timeout(6000) }
              );
              if (!r.ok) return;
              const d = await r.json();
              if (d?.c && d.c > 0) priceMap.set(sym, d.c);
            } catch {}
          })
        );
      }

      // Check each alert
      for (const alert of alerts) {
        const currentPrice = priceMap.get(alert.ticker);
        if (!currentPrice) continue;

        const isAbove = alert.threshold > 0;
        const target = Math.abs(alert.threshold);
        const triggered = isAbove ? currentPrice >= target : currentPrice <= target;

        if (!triggered) continue;

        // Send targeted push to this user
        const userSubs = subMap.get(alert.user_id) ?? subMap.get("__anon__") ?? [];
        if (userSubs.length > 0) {
          const direction = isAbove ? "above" : "below";
          const payload = JSON.stringify({
            title: `${alert.ticker} hit $${currentPrice.toFixed(2)}`,
            body: `Price moved ${direction} your $${target.toFixed(2)} target`,
            url: `/stock/${alert.ticker}`,
          });

          const r = await sendPush(userSubs, payload);
          totalSent += r.s;
          totalFailed += r.f;
          priceAlertsSent++;
        }

        // Disable alert after triggering (one-shot)
        await supabaseAdmin
          .from("price_alerts")
          .update({ enabled: false, last_triggered_at: new Date().toISOString() })
          .eq("id", alert.id);

        // Log it
        try {
          await supabaseAdmin.from("notification_log").insert({
            user_id: alert.user_id,
            notification_type: "price_alert",
            metadata: { ticker: alert.ticker, target, direction: isAbove ? "above" : "below", currentPrice },
          });
        } catch {}
      }
    }
  } catch (err: any) {
    console.error("Price alert check failed:", err?.message);
  }

  return res.json({
    sent: totalSent,
    failed: totalFailed,
    signals: signalCount,
    priceAlerts: priceAlertsSent,
    subscribers: allSubs.length,
  });
}
