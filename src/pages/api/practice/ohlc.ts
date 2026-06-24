import type { NextApiRequest, NextApiResponse } from "next";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";

// Simple in-memory cache
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_MS = 5 * 60 * 1000;

// Map our timeframe keys to Finnhub resolution strings
const RESOLUTION: Record<string, string> = {
  daily: "D",
  "1hour": "60",
  "15min": "15",
  "5min": "5",
};

// How many calendar days of history to request per timeframe
const LOOKBACK_DAYS: Record<string, number> = {
  daily: 120,
  "1hour": 10,
  "15min": 5,
  "5min": 3,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { ticker, timeframe = "daily" } = req.query as Record<string, string>;
  if (!ticker) return res.status(400).json({ error: "ticker required" });

  const sym = ticker.toUpperCase().trim();
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const resolution = RESOLUTION[timeframe] ?? "D";
  const days = LOOKBACK_DAYS[timeframe] ?? 120;

  const cacheKey = `${sym}:${timeframe}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return res.status(200).json(cached.data);
  }

  try {
    const toTs = Math.floor(Date.now() / 1000);
    const fromTs = toTs - days * 24 * 60 * 60;

    const url =
      `https://finnhub.io/api/v1/stock/candle` +
      `?symbol=${sym}&resolution=${resolution}&from=${fromTs}&to=${toTs}&token=${apiKey}`;

    const fhRes = await fetch(url);
    if (fhRes.status === 429) return res.status(429).json({ error: "Rate limit" });
    if (!fhRes.ok) throw new Error(`Finnhub ${fhRes.status}`);

    const raw = await fhRes.json() as {
      s: string;
      o?: number[];
      h?: number[];
      l?: number[];
      c?: number[];
      v?: number[];
      t?: number[];
    };

    if (raw.s !== "ok" || !raw.t?.length) {
      // No data returned (weekend, invalid ticker, plan limit) — return empty
      return res.status(200).json({ bars: [] });
    }

    const bars = raw.t.map((ts, i) => ({
      // Daily: use "YYYY-MM-DD" string (BusinessDay); intraday: Unix seconds (UTCTimestamp)
      time: resolution === "D"
        ? new Date(ts * 1000).toISOString().slice(0, 10)
        : ts,
      open: raw.o![i],
      high: raw.h![i],
      low: raw.l![i],
      close: raw.c![i],
      volume: raw.v![i],
    }));

    const result = { bars };
    cache.set(cacheKey, { data: result, ts: Date.now() });
    return res.status(200).json(result);
  } catch (err) {
    console.error("OHLC fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch OHLC data" });
  }
}
