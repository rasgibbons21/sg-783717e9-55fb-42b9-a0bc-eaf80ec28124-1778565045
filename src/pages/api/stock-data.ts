import type { NextApiRequest, NextApiResponse } from "next";

// Simple in-memory cache for the server route
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 60000; // 60 seconds

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tickers } = req.query;

  if (!tickers || typeof tickers !== "string") {
    return res.status(400).json({ error: "Tickers parameter is required" });
  }

  const apiKey = process.env.FMP_API_KEY;
  
  if (!apiKey) {
    console.error("FMP_API_KEY is missing in environment variables");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Check cache first
  const now = Date.now();
  const cached = cache.get(tickers);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return res.status(200).json(cached.data);
  }

  try {
    const url = `https://financialmodelingprep.com/api/v3/quote/${tickers}?apiKey=${apiKey}`;
    const response = await fetch(url);
    
    if (response.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    if (!response.ok) {
      throw new Error(`FMP API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the successful response
    cache.set(tickers, { data, timestamp: now });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching from FMP:", error);
    return res.status(500).json({ error: "Failed to fetch stock data" });
  }
}