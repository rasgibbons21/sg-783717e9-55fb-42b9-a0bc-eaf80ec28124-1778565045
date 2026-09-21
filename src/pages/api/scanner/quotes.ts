import type { NextApiRequest, NextApiResponse } from "next";

let cache: { data: unknown; ts: number } | null = null;
const CACHE_MS = 60 * 1000;
const STALE_CACHE_MS = 4 * 60 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  if (!fmpKey && !finnhubKey) {
    return res.status(500).json({ error: "No API keys configured" });
  }

  const symbols = String(req.query.symbols || "SPY,QQQ,IWM,%5EVIX")
    .split(",")
    .map(s => s.replace("%5E", "^").trim())
    .filter(Boolean);

  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return res.status(200).json(cache.data);
  }

  // Try FMP first
  if (fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/quote/${symbols.join(",")}?apiKey=${fmpKey}`;
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) {
          const quotes = data.map((q: Record<string, unknown>) => ({
            symbol: q.symbol,
            price: q.price,
            changesPercentage: q.changesPercentage,
            change: q.change,
          }));
          const result = { quotes, timestamp: Date.now() };
          cache = { data: result, ts: Date.now() };
          return res.status(200).json(result);
        }
      }
    } catch {}
  }

  // Fallback: Finnhub individual quotes
  if (finnhubKey) {
    try {
      const finnhubSymbols = symbols.map(s =>
        s === "^VIX" ? "VIX" : s
      );

      const quotes = await Promise.all(
        finnhubSymbols.map(async (sym, i) => {
          try {
            const url = `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`;
            const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
            if (!r.ok) return null;
            const d = await r.json();
            if (!d?.c || d.c <= 0) return null;

            const price = d.c;
            const prevClose = d.pc || 0;
            const change = price - prevClose;
            const changePct = prevClose > 0 ? Math.round(((change / prevClose) * 100) * 100) / 100 : 0;

            return {
              symbol: symbols[i],
              price,
              changesPercentage: changePct,
              change: Math.round(change * 100) / 100,
            };
          } catch { return null; }
        }),
      );

      const valid = quotes.filter((q): q is NonNullable<typeof q> => q !== null);
      if (valid.length > 0) {
        const result = { quotes: valid, timestamp: Date.now() };
        cache = { data: result, ts: Date.now() };
        return res.status(200).json(result);
      }
    } catch {}
  }

  // Serve stale cache if available
  if (cache && Date.now() - (cache.ts) < STALE_CACHE_MS) {
    return res.status(200).json(cache.data);
  }

  return res.status(200).json({ quotes: [], timestamp: Date.now() });
}
