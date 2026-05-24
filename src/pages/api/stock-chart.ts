import type { NextApiRequest, NextApiResponse } from "next";

// Simple in-memory cache for the server route
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes for historical charts to save calls

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticker, endpoint, timeseries } = req.query;

  if (!ticker || typeof ticker !== "string" || !endpoint) {
    return res.status(400).json({ error: "Ticker and endpoint parameters are required" });
  }

  const apiKey = process.env.FMP_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const cacheKey = `${ticker}-${endpoint}-${timeseries || ''}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return res.status(200).json(cached.data);
  }

  try {
    let url = "";
    if (endpoint === "historical-price-full") {
      url = `https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?timeseries=${timeseries || 90}&apiKey=${apiKey}`;
    } else {
      url = `https://financialmodelingprep.com/api/v3/historical-chart/${endpoint}/${ticker}?apiKey=${apiKey}`;
    }

    const response = await fetch(url);
    
    if (response.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    if (!response.ok) {
      throw new Error(`FMP API responded with status: ${response.status}`);
    }

    const data = await response.json();
    cache.set(cacheKey, { data, timestamp: now });
    
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching chart data from FMP:", error);
    return res.status(500).json({ error: "Failed to fetch chart data" });
  }
}