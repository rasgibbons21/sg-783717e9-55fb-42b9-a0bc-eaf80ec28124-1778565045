import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shebloomswealth.app";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

  // ── PART C: Check past scanner results outcomes ──────────────────────
  let outcomesChecked = 0;
  try {
    const { data: pending } = await supabaseAdmin
      .from("scanner_results")
      .select("*")
      .eq("outcome", "pending")
      .lt("scanned_at", new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString());

    if (pending && pending.length > 0) {
      const finnhubKey = process.env.FINNHUB_API_KEY;
      const symbols = [...new Set(pending.map((r: any) => r.symbol))];
      const priceMap = new Map<string, number>();

      if (finnhubKey) {
        await Promise.all(
          symbols.map(async (sym: string) => {
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

      for (const result of pending) {
        const currentPrice = priceMap.get(result.symbol);
        if (!currentPrice || !result.entry_price) continue;

        let outcome = "expired";
        let outcomePnlPct = 0;

        if (result.stop_price && currentPrice <= result.stop_price) {
          outcome = "stopped";
          outcomePnlPct = ((result.stop_price - result.entry_price) / result.entry_price) * 100;
        } else if (result.target2_price && currentPrice >= result.target2_price) {
          outcome = "win_t2";
          outcomePnlPct = ((result.target2_price - result.entry_price) / result.entry_price) * 100;
        } else if (result.target1_price && currentPrice >= result.target1_price) {
          outcome = "win_t1";
          outcomePnlPct = ((result.target1_price - result.entry_price) / result.entry_price) * 100;
        } else {
          const hoursSinceSignal = (Date.now() - new Date(result.scanned_at).getTime()) / (1000 * 60 * 60);
          if (hoursSinceSignal < 24) continue;
          outcomePnlPct = ((currentPrice - result.entry_price) / result.entry_price) * 100;
        }

        await supabaseAdmin
          .from("scanner_results")
          .update({
            outcome,
            outcome_price: currentPrice,
            outcome_pnl_pct: Math.round(outcomePnlPct * 100) / 100,
            outcome_checked_at: new Date().toISOString(),
          })
          .eq("id", result.id);
        outcomesChecked++;
      }
    }
  } catch (err: any) {
    console.error("Outcome check failed:", err?.message);
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
    // Log scanner results for performance tracking (backtest)
    const signalsToLog = candidates.flatMap((c: any) =>
      (c.signals ?? [])
        .filter((s: any) => s.state === "ACTIVE" || s.state === "NEAR_TRIGGER")
        .map((s: any) => {
          const parsePrice = (text: string | null) => {
            if (!text) return null;
            const m = text.match(/\$(\d+(?:\.\d+)?)/);
            return m ? parseFloat(m[1]) : null;
          };
          return {
            symbol: c.symbol,
            strategy_id: s.strategyId,
            strategy_name: s.strategyName,
            signal_state: s.state,
            score: s.score,
            price_at_signal: c.price,
            change_pct: c.change,
            volume: c.volume,
            rvol: c.rvol,
            catalyst: c.catalyst,
            entry_price: parsePrice(s.entryZone) ?? c.price,
            stop_price: parsePrice(s.invalidationLevel),
            target1_price: parsePrice(s.target1),
            target2_price: parsePrice(s.target2),
            outcome: "pending",
          };
        })
    );

    if (signalsToLog.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const { data: existing } = await supabaseAdmin
        .from("scanner_results")
        .select("symbol, strategy_id")
        .eq("scanned_date", today);

      const existingSet = new Set(
        (existing ?? []).map((r: any) => `${r.symbol}:${r.strategy_id}`)
      );
      const newResults = signalsToLog.filter(
        (r: any) => !existingSet.has(`${r.symbol}:${r.strategy_id}`)
      );

      if (newResults.length > 0) {
        try { await supabaseAdmin.from("scanner_results").insert(newResults); } catch {}
      }
    }
  } catch (err: any) {
    console.error("Scanner signal check failed:", err?.message);
  }

  // ── PART A2: Watchlist signal + big-move alerts (targeted per-user) ──

  let watchlistAlertsSent = 0;

  try {
    const { data: watchlistRows } = await supabaseAdmin
      .from("watchlist")
      .select("user_id, ticker");

    if (watchlistRows && watchlistRows.length > 0) {
      // Build user -> tickers map
      const userTickers = new Map<string, Set<string>>();
      for (const row of watchlistRows) {
        if (!userTickers.has(row.user_id)) userTickers.set(row.user_id, new Set());
        userTickers.get(row.user_id)!.add(row.ticker);
      }

      // Collect all unique watchlisted tickers
      const allWatchedTickers = new Set<string>();
      for (const tickers of userTickers.values()) {
        for (const t of tickers) allWatchedTickers.add(t);
      }

      // Check scanner results for watchlisted stocks
      const scanRes2 = await fetch(`${SITE_URL}/api/scanner/scan?fresh=0`, {
        signal: AbortSignal.timeout(15_000),
      }).catch(() => null);
      const scanData = scanRes2 ? await scanRes2.json().catch(() => ({})) : {};
      const candidates2 = scanData.candidates || [];

      // Map of symbol -> active signals from scanner
      const symbolSignals = new Map<string, Array<{ strategyName: string; entryZone: string | null }>>();
      for (const c of candidates2) {
        if (!allWatchedTickers.has(c.symbol)) continue;
        for (const sig of c.signals ?? []) {
          if (sig.state !== "ACTIVE") continue;
          if (!symbolSignals.has(c.symbol)) symbolSignals.set(c.symbol, []);
          symbolSignals.get(c.symbol)!.push({
            strategyName: sig.strategyName || sig.strategyId,
            entryZone: sig.entryZone ?? null,
          });
        }
      }

      // Fetch quotes for all watchlisted tickers to detect big moves
      const finnhubKey = process.env.FINNHUB_API_KEY;
      const tickerQuotes = new Map<string, { price: number; changePct: number }>();
      if (finnhubKey) {
        const tickerBatch = [...allWatchedTickers].slice(0, 40);
        await Promise.all(
          tickerBatch.map(async (sym) => {
            try {
              const r = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`,
                { signal: AbortSignal.timeout(6000) }
              );
              if (!r.ok) return;
              const d = await r.json();
              if (d?.c && d.c > 0 && d.pc && d.pc > 0) {
                const changePct = ((d.c - d.pc) / d.pc) * 100;
                tickerQuotes.set(sym, { price: d.c, changePct });
              }
            } catch {}
          })
        );
      }

      // Deduplicate: check what we already notified recently
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data: recentWatchlistNotifs } = await supabaseAdmin
        .from("notification_log")
        .select("user_id, metadata")
        .eq("notification_type", "watchlist_alert")
        .gte("created_at", twoHoursAgo);

      const notifiedWatchlist = new Set(
        (recentWatchlistNotifs ?? []).map((n: any) => `${n.user_id}:${n.metadata?.symbol}`)
      );

      // Send targeted notifications per user
      for (const [uid, tickers] of userTickers) {
        const userSubs = subMap.get(uid) ?? [];
        if (userSubs.length === 0) continue;

        for (const ticker of tickers) {
          if (notifiedWatchlist.has(`${uid}:${ticker}`)) continue;

          const signals = symbolSignals.get(ticker);
          const quote = tickerQuotes.get(ticker);
          const bigMove = quote && Math.abs(quote.changePct) >= 5;

          if (!signals && !bigMove) continue;

          let title: string;
          let body: string;

          if (signals && signals.length > 0) {
            const strat = signals[0].strategyName;
            const entry = signals[0].entryZone ? ` · Entry ${signals[0].entryZone}` : "";
            title = `${ticker} — ${strat} Signal`;
            body = `Your watchlisted stock triggered a setup${entry}`;
          } else if (quote && bigMove) {
            const dir = quote.changePct > 0 ? "up" : "down";
            title = `${ticker} ${dir} ${Math.abs(quote.changePct).toFixed(1)}%`;
            body = `Big move on your watchlisted stock — now $${quote.price.toFixed(2)}`;
          } else {
            continue;
          }

          const payload = JSON.stringify({ title, body, url: `/stock/${ticker}` });
          const r = await sendPush(userSubs, payload);
          totalSent += r.s;
          totalFailed += r.f;
          watchlistAlertsSent++;

          try {
            await supabaseAdmin.from("notification_log").insert({
              user_id: uid,
              notification_type: "watchlist_alert",
              metadata: {
                symbol: ticker,
                hasSignal: !!signals,
                bigMove: !!bigMove,
                changePct: quote?.changePct ?? null,
              },
            });
          } catch {}
        }
      }
    }
  } catch (err: any) {
    console.error("Watchlist alert check failed:", err?.message);
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
    watchlistAlerts: watchlistAlertsSent,
    outcomesChecked,
    subscribers: allSubs.length,
  });
}
