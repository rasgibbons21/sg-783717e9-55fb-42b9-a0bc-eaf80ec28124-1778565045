import type { NextApiRequest, NextApiResponse } from "next";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_MS = 3 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  if (!fmpKey && !finnhubKey) {
    return res.status(500).json({ error: "No news API key configured" });
  }

  const { type = "general" } = req.query;
  const cacheKey = `news:${type}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return res.status(200).json(cached.data);
  }

  try {
    const articles: Article[] = [];

    if (type === "general") {
      // General market news from Finnhub
      if (finnhubKey) {
        const url = `https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`;
        const r = await fetch(url);
        if (r.ok) {
          const data = await r.json();
          for (const a of data.slice(0, 20)) {
            articles.push({
              id: String(a.id),
              title: a.headline,
              summary: a.summary,
              source: a.source,
              url: a.url,
              image: a.image,
              publishedAt: new Date(a.datetime * 1000).toISOString(),
              category: a.category,
              symbols: a.related?.split(",").filter(Boolean) ?? [],
            });
          }
        }
      }

      // Supplement with FMP general news
      if (fmpKey && articles.length < 10) {
        const url = `https://financialmodelingprep.com/api/v3/stock_news?limit=20&apiKey=${fmpKey}`;
        const r = await fetch(url);
        if (r.ok) {
          const data = await r.json();
          for (const a of data) {
            articles.push({
              id: a.url || String(Date.now()),
              title: a.title,
              summary: a.text?.slice(0, 200),
              source: a.site,
              url: a.url,
              image: a.image,
              publishedAt: a.publishedDate,
              category: "general",
              symbols: a.symbol ? [a.symbol] : [],
            });
          }
        }
      }
    }

    const result = { articles: articles.slice(0, 25), timestamp: Date.now() };
    cache.set(cacheKey, { data: result, ts: Date.now() });
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("News fetch error:", error);
    return res.status(500).json({ error: "Failed to fetch news" });
  }
}

interface Article {
  id: string;
  title: string;
  summary?: string;
  source: string;
  url: string;
  image?: string;
  publishedAt: string;
  category: string;
  symbols: string[];
}
