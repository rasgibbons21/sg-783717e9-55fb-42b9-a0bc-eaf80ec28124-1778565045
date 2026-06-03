import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticker, endpoint } = req.query;

  // Input validation
  if (!ticker || typeof ticker !== "string") {
    return res.status(400).json({ error: "Ticker symbol is required" });
  }

  if (!/^[A-Z0-9]{1,10}$/.test(ticker.toUpperCase())) {
    return res.status(400).json({ error: "Invalid ticker symbol format" });
  }

  if (!endpoint || typeof endpoint !== "string") {
    return res.status(400).json({ error: "Endpoint is required" });
  }

  const validEndpoints = ["ratios", "key-metrics", "etf-sector-weightings"];
  if (!validEndpoints.includes(endpoint)) {
    return res.status(400).json({ error: "Invalid endpoint" });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const url = `https://financialmodelingprep.com/api/v3/${endpoint}/${ticker.toUpperCase()}?apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("FMP proxy error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch data" });
  }
}