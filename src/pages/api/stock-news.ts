import type { NextApiRequest, NextApiResponse } from "next";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes for news

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticker } = req.query;

  if (!ticker || typeof ticker !== "string") {
    return res.status(400).json({ error: "Ticker parameter is required" });
  }

  const apiKey = process.env.FMP_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const now = Date.now();
  const cached = cache.get(ticker);
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return res.status(200).json(cached.data);
  }

  try {
    const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${ticker}&limit=10&apiKey=${apiKey}`;
    const response = await fetch(url);
    
    if (response.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    if (!response.ok) {
      throw new Error(`FMP API responded with status: ${response.status}`);
    }

    const data = await response.json();
    cache.set(ticker, { data, timestamp: now });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching news from FMP:", error);
    return res.status(500).json({ error: "Failed to fetch news data" });
  }
}