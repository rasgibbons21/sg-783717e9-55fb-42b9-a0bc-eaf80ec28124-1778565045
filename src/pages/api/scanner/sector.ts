import type { NextApiRequest, NextApiResponse } from "next";

const SECTOR_MAP: Record<string, string> = {
  XLK: "Technology",
  XLF: "Financial Services",
  XLE: "Energy",
  XLV: "Healthcare",
  XLC: "Communication Services",
  XLI: "Industrials",
  XLY: "Consumer Cyclical",
  XLP: "Consumer Defensive",
  XLB: "Basic Materials",
  XLRE: "Real Estate",
  XLU: "Utilities",
};

const cache: Record<string, { data: unknown; ts: number }> = {};
const CACHE_MS = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const etf = String(req.query.etf || "").toUpperCase();
  const sectorName = SECTOR_MAP[etf];
  if (!sectorName) return res.status(400).json({ error: "Invalid sector ETF" });

  if (cache[etf] && Date.now() - cache[etf].ts < CACHE_MS) {
    return res.status(200).json(cache[etf].data);
  }

  const fmpKey = process.env.FMP_API_KEY;
  if (!fmpKey) return res.status(500).json({ error: "API key not configured" });

  try {
    const url = `https://financialmodelingprep.com/stable/stock-screener?sector=${encodeURIComponent(sectorName)}&marketCapMoreThan=1000000000&isActivelyTrading=true&limit=8&apikey=${fmpKey}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error("FMP request failed");
    const raw = await r.json();

    const stocks = (Array.isArray(raw) ? raw : []).map((s: any) => ({
      symbol: s.symbol,
      name: s.companyName,
      price: s.price,
      change: s.changePercentage ?? 0,
      marketCap: s.marketCap,
      volume: s.volume,
    }));

    const result = { sector: sectorName, etf, stocks, timestamp: Date.now() };
    cache[etf] = { data: result, ts: Date.now() };
    return res.status(200).json(result);
  } catch {
    return res.status(200).json({ sector: sectorName, etf, stocks: [], timestamp: Date.now() });
  }
}
