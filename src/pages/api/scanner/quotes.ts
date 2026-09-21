import type { NextApiRequest, NextApiResponse } from "next";

let cache: { data: unknown; ts: number } | null = null;
const CACHE_MS = 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "FMP_API_KEY not configured" });

  const symbols = String(req.query.symbols || "SPY,QQQ,IWM,%5EVIX");

  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return res.status(200).json(cache.data);
  }

  try {
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbols}?apiKey=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`FMP quotes: ${r.status}`);
    const data = await r.json();

    const quotes = (Array.isArray(data) ? data : []).map((q: Record<string, unknown>) => ({
      symbol: q.symbol,
      price: q.price,
      changesPercentage: q.changesPercentage,
      change: q.change,
    }));

    const result = { quotes, timestamp: Date.now() };
    cache = { data: result, ts: Date.now() };
    return res.status(200).json(result);
  } catch {
    return res.status(200).json({ quotes: [], timestamp: Date.now() });
  }
}
