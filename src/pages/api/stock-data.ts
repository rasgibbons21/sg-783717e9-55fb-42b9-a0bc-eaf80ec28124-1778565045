import type { NextApiRequest, NextApiResponse } from "next";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 60_000;
const TIMEOUT = 8_000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { tickers } = req.query;
  if (!tickers || typeof tickers !== "string") {
    return res.status(400).json({ error: "Tickers parameter is required" });
  }

  const cached = cache.get(tickers);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.status(200).json(cached.data);
  }

  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  // Try FMP first
  if (fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/quote/${tickers}?apiKey=${fmpKey}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          cache.set(tickers, { data, timestamp: Date.now() });
          return res.status(200).json(data);
        }
      }
    } catch {}
  }

  // Fallback: Finnhub individual quotes
  if (finnhubKey) {
    try {
      const symbols = tickers.split(",").map(s => s.trim().toUpperCase());
      const quotes = await Promise.all(
        symbols.map(async (sym) => {
          try {
            const url = `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`;
            const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
            if (!r.ok) return null;
            const d = await r.json();
            if (!d?.c || d.c <= 0) return null;
            const price = d.c;
            const pc = d.pc || 0;
            return {
              symbol: sym,
              price,
              changesPercentage: pc > 0 ? Math.round(((price - pc) / pc) * 10000) / 100 : 0,
              change: Math.round((price - pc) * 100) / 100,
              dayLow: d.l || price,
              dayHigh: d.h || price,
              yearHigh: d.h || price,
              yearLow: d.l || price,
              marketCap: 0,
              volume: 0,
              avgVolume: 0,
              open: d.o || pc,
              previousClose: pc,
            };
          } catch { return null; }
        })
      );
      const valid = quotes.filter(Boolean);
      if (valid.length > 0) {
        cache.set(tickers, { data: valid, timestamp: Date.now() });
        return res.status(200).json(valid);
      }
    } catch {}
  }

  return res.status(500).json({ error: "Failed to fetch stock data" });
}
