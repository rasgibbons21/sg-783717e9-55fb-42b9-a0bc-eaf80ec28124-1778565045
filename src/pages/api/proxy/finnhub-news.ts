import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticker, from, to } = req.query;

  // Input validation
  if (ticker && typeof ticker !== "string") {
    return res.status(400).json({ error: "Invalid ticker parameter" });
  }

  if (ticker && !/^[A-Z0-9]{1,10}$/.test(ticker.toUpperCase())) {
    return res.status(400).json({ error: "Invalid ticker symbol format" });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    let url: string;
    
    if (ticker) {
      // Company-specific news
      if (!from || !to) {
        return res.status(400).json({ error: "from and to dates required for company news" });
      }
      url = `https://finnhub.io/api/v1/company-news?symbol=${ticker.toUpperCase()}&from=${from}&to=${to}&token=${apiKey}`;
    } else {
      // General market news
      url = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Finnhub news proxy error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch news" });
  }
}