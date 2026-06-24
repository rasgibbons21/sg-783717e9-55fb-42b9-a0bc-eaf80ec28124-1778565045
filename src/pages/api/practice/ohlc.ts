import type { NextApiRequest, NextApiResponse } from "next";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";

// In-memory cache keyed by symbol+timeframe
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_MS = 5 * 60 * 1000;

// FMP endpoint names per timeframe
const FMP_ENDPOINT: Record<string, string> = {
  daily: "historical-price-full",
  "1hour": "1hour",
  "15min": "15min",
  "5min": "5min",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { ticker, timeframe = "daily" } = req.query as Record<string, string>;
  if (!ticker) return res.status(400).json({ error: "ticker required" });

  const sym = ticker.toUpperCase().trim();
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "FMP_API_KEY not configured" });

  const cacheKey = `${sym}:${timeframe}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return res.status(200).json(cached.data);
  }

  try {
    let url: string;
    if (timeframe === "daily") {
      // Returns { symbol, historical: [{date,open,high,low,close,volume,...}] }
      url = `https://financialmodelingprep.com/api/v3/historical-price-full/${sym}?timeseries=90&apiKey=${apiKey}`;
    } else {
      // Returns [{date: "2024-01-02 09:30:00", open, high, low, close, volume}]
      const ep = FMP_ENDPOINT[timeframe] ?? "15min";
      url = `https://financialmodelingprep.com/api/v3/historical-chart/${ep}/${sym}?apiKey=${apiKey}`;
    }

    const fmpRes = await fetch(url);
    if (fmpRes.status === 429) return res.status(429).json({ error: "Rate limit" });
    if (!fmpRes.ok) throw new Error(`FMP ${fmpRes.status}`);

    const raw = await fmpRes.json();

    let bars: { time: string | number; open: number; high: number; low: number; close: number; volume: number }[] = [];

    if (timeframe === "daily") {
      // FMP returns newest-first; lightweight-charts needs oldest-first
      const hist = (raw as { historical?: { date: string; open: number; high: number; low: number; close: number; volume: number }[] }).historical ?? [];
      bars = hist
        .slice()
        .reverse()
        .map(r => ({
          time: r.date as string,
          open: r.open,
          high: r.high,
          low: r.low,
          close: r.close,
          volume: r.volume,
        }));
    } else {
      // Intraday: [{date: "2024-01-02 09:30:00", ...}], also newest-first
      const intraday = (Array.isArray(raw) ? raw : []) as {
        date: string; open: number; high: number; low: number; close: number; volume: number;
      }[];
      bars = intraday
        .slice()
        .reverse()
        .map(r => ({
          // lightweight-charts UTCTimestamp (seconds since epoch) for intraday
          time: Math.floor(new Date(r.date).getTime() / 1000),
          open: r.open,
          high: r.high,
          low: r.low,
          close: r.close,
          volume: r.volume,
        }));
    }

    const result = { bars };
    cache.set(cacheKey, { data: result, ts: Date.now() });
    return res.status(200).json(result);
  } catch (err) {
    console.error("OHLC fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch OHLC data" });
  }
}
