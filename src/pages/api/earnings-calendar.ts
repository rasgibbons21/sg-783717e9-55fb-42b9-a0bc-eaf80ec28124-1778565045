import type { NextApiRequest, NextApiResponse } from "next";

export interface EarningsEntry {
  symbol: string;
  date: string;
  time: "bmo" | "amc" | "dmh" | "";
  epsEstimated: number | null;
  epsPrevious: number | null;
  revenue: number | null;
  revenueEstimated: number | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const fmpKey = process.env.FMP_API_KEY;
  if (!fmpKey) return res.status(500).json({ error: "FMP key not configured" });

  const now = new Date();
  const from = now.toISOString().slice(0, 10);

  const to = new Date(now);
  to.setDate(to.getDate() + 14);
  const toStr = to.toISOString().slice(0, 10);

  try {
    const url = `https://financialmodelingprep.com/stable/earning-calendar?from=${from}&to=${toStr}&apikey=${fmpKey}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!r.ok) return res.status(502).json({ error: `FMP returned ${r.status}` });

    const raw: Array<{
      symbol?: string;
      date?: string;
      time?: string;
      epsEstimated?: number;
      eps?: number;
      revenue?: number;
      revenueEstimated?: number;
    }> = await r.json();

    if (!Array.isArray(raw)) return res.status(502).json({ error: "Unexpected response" });

    const entries: EarningsEntry[] = raw
      .filter((d) => d.symbol && d.date)
      .map((d) => ({
        symbol: d.symbol!.toUpperCase(),
        date: d.date!,
        time: (d.time === "bmo" || d.time === "amc" || d.time === "dmh" ? d.time : "") as EarningsEntry["time"],
        epsEstimated: d.epsEstimated ?? null,
        epsPrevious: d.eps ?? null,
        revenue: d.revenue ?? null,
        revenueEstimated: d.revenueEstimated ?? null,
      }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.symbol.localeCompare(b.symbol));

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=1800");
    return res.status(200).json(entries);
  } catch (e) {
    console.error("Earnings calendar error:", e);
    return res.status(500).json({ error: "Failed to fetch earnings calendar" });
  }
}
