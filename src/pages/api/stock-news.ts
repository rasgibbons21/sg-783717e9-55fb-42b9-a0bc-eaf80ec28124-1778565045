import type { NextApiRequest, NextApiResponse } from "next";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 300_000;
const TIMEOUT = 8_000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { ticker } = req.query;
  if (!ticker || typeof ticker !== "string") {
    return res.status(400).json({ error: "Ticker parameter is required" });
  }

  const sym = ticker.toUpperCase().trim();
  const cached = cache.get(sym);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.status(200).json(cached.data);
  }

  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  // Try FMP first
  if (fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${sym}&limit=10&apiKey=${fmpKey}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          cache.set(sym, { data, timestamp: Date.now() });
          return res.status(200).json(data);
        }
      }
    } catch {}
  }

  // Fallback: Finnhub company-news
  if (finnhubKey) {
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const from = weekAgo.toISOString().slice(0, 10);
      const to = now.toISOString().slice(0, 10);
      const url = `https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${from}&to=${to}&token=${finnhubKey}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (r.ok) {
        const raw = await r.json();
        if (Array.isArray(raw) && raw.length > 0) {
          const articles = raw.slice(0, 10).map((a: any) => ({
            title: a.headline || "",
            text: a.summary || "",
            publishedDate: a.datetime ? new Date(a.datetime * 1000).toISOString() : undefined,
            site: a.source || "",
            url: a.url || "",
            image: a.image || "",
            symbol: sym,
          }));
          cache.set(sym, { data: articles, timestamp: Date.now() });
          return res.status(200).json(articles);
        }
      }
    } catch {}
  }

  return res.status(200).json([]);
}
