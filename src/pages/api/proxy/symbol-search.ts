import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const q = (req.query.q as string || "").trim();
  if (!q || q.length < 1) return res.status(200).json({ results: [] });

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Search not configured" });

  try {
    const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) return res.status(200).json({ results: [] });

    const data = await response.json();
    const results = (data.result || [])
      .filter((r: any) => r.type === "Common Stock" && !r.symbol.includes("."))
      .slice(0, 8)
      .map((r: any) => ({
        symbol: r.symbol,
        name: r.description,
      }));

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ results });
  } catch {
    return res.status(200).json({ results: [] });
  }
}
