import type { NextApiRequest, NextApiResponse } from "next";

// Simple cache to avoid hammering Yahoo Finance
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_MS = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const { ticker, interval = "1d", range = "3mo" } = req.query as Record<string, string>;
  if (!ticker) return res.status(400).json({ error: "ticker required" });

  const sym = ticker.toUpperCase().trim();
  const cacheKey = `${sym}:${interval}:${range}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return res.status(200).json(cached.data);
  }

  try {
    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/${sym}` +
      `?interval=${interval}&range=${range}&includePrePost=false&events=div%2Csplit`;

    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json,text/plain,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://finance.yahoo.com/",
      },
    });

    if (!resp.ok) {
      console.error(`Yahoo Finance ${resp.status} for ${sym}`);
      return res.status(resp.status).json({ error: `Upstream ${resp.status}` });
    }

    const data = await resp.json();
    cache.set(cacheKey, { data, ts: Date.now() });
    return res.status(200).json(data);
  } catch (err) {
    console.error("yahoo-chart proxy error:", err);
    return res.status(500).json({ error: "Failed to fetch chart data" });
  }
}
