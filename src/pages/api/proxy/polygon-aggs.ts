import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticker, type, from, to } = req.query;

  // Input validation
  if (!ticker || typeof ticker !== "string") {
    return res.status(400).json({ error: "Ticker symbol is required" });
  }

  if (!/^[A-Z0-9]{1,10}$/.test(ticker.toUpperCase())) {
    return res.status(400).json({ error: "Invalid ticker symbol format" });
  }

  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    let url: string;

    if (type === "prev") {
      // Previous day aggregate
      url = `https://api.polygon.io/v2/aggs/ticker/${ticker.toUpperCase()}/prev?adjusted=true&apiKey=${apiKey}`;
    } else if (type === "range" && from && to) {
      // Date range aggregates
      url = `https://api.polygon.io/v2/aggs/ticker/${ticker.toUpperCase()}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`;
    } else {
      return res.status(400).json({ error: "Invalid query parameters. Use type=prev or type=range with from/to dates" });
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Polygon aggregates proxy error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch aggregates" });
  }
}