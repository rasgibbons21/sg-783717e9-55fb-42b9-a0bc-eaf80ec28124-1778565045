import type { NextApiRequest, NextApiResponse } from "next";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";

// Simple in-memory cache
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_MS = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { ticker, timeframe = "daily" } = req.query as Record<string, string>;
  if (!ticker) return res.status(400).json({ error: "ticker required" });

  const sym = ticker.toUpperCase().trim();
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server configuration error" });

  const cacheKey = `${sym}:${timeframe}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return res.status(200).json(cached.data);
  }

  try {
    let url: string;
    if (timeframe === "daily") {
      url = `https://financialmodelingprep.com/api/v3/historical-price-full/${sym}?timeseries=90&apiKey=${apiKey}`;
    } else {
      // 1min, 5min, 15min, 30min, 1hour
      url = `https://financialmodelingprep.com/api/v3/historical-chart/${timeframe}/${sym}?apiKey=${apiKey}`;
    }

    const fmpRes = await fetch(url);
    if (fmpRes.status === 429) return res.status(429).json({ error: "Rate limit" });
    if (!fmpRes.ok) throw new Error(`FMP ${fmpRes.status}`);

    const raw = await fmpRes.json();

    // Normalise both response shapes to [{time,open,high,low,close,volume}]
    let bars: { time: string; open: number; high: number; low: number; close: number; volume: number }[] = [];

    if (timeframe === "daily") {
      // { historical: [{date, open, high, low, close, volume}] }
      const hist: { date: string; open: number; high: number; low: number; close: number; volume: number }[] =
        (raw as { historical?: { date: string; open: number; high: number; low: number; close: number; volume: number }[] }).historical ?? [];
      bars = hist
        .map(r => ({ time: r.date, open: r.open, high: r.high, low: r.low, close: r.close, volume: r.volume }))
        .reverse(); // FMP returns newest first; chart needs oldest first
    } else {
      // [{date: "2024-01-02 09:30:00", open, high, low, close, volume}]
      const intraday: { date: string; open: number; high: number; low: number; close: number; volume: number }[] =
        Array.isArray(raw) ? raw : [];
      bars = intraday
        .map(r => ({ time: r.date.slice(0, 10) + (r.date.length > 10 ? " " + r.date.slice(11, 16) : ""), open: r.open, high: r.high, low: r.low, close: r.close, volume: r.volume }))
        .reverse();
    }

    const result = { bars };
    cache.set(cacheKey, { data: result, ts: Date.now() });
    return res.status(200).json(result);
  } catch (err) {
    console.error("OHLC fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch OHLC data" });
  }
}
