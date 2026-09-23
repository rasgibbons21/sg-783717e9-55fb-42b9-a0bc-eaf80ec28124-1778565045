import type { NextApiRequest, NextApiResponse } from "next";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_MS = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const finnhubKey = process.env.FINNHUB_API_KEY;
  const newsDataKey = process.env.NEWSDATA_API_KEY;
  const fmpKey = process.env.FMP_API_KEY;

  if (!finnhubKey && !newsDataKey && !fmpKey) {
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
    const seen = new Set<string>();

    const addArticle = (a: Article) => {
      const key = a.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return;
      seen.add(key);
      articles.push(a);
    };

    if (type === "general") {
      // 1. Finnhub — primary source for real-time market news
      if (finnhubKey) {
        try {
          const url = `https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`;
          const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (r.ok) {
            const data = await r.json();
            for (const a of data.slice(0, 15)) {
              addArticle({
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
        } catch {}
      }

      // 2. NewsData.io — broad business news, good headlines & images
      if (newsDataKey && articles.length < 20) {
        try {
          const url = `https://newsdata.io/api/1/latest?apikey=${newsDataKey}&category=business&country=us&language=en&size=10`;
          const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (r.ok) {
            const data = await r.json();
            for (const a of data.results ?? []) {
              if (!a.title) continue;
              addArticle({
                id: a.article_id || a.link || String(Date.now() + Math.random()),
                title: a.title,
                summary: a.description?.slice(0, 200) ?? undefined,
                source: a.source_name || a.source_id || "NewsData",
                url: a.link,
                image: a.image_url ?? undefined,
                publishedAt: a.pubDate || new Date().toISOString(),
                category: (a.category ?? []).join(", ") || "business",
                symbols: [],
              });
            }
          }
        } catch {}
      }

      // 3. FMP fallback
      if (fmpKey && articles.length < 10) {
        try {
          const url = `https://financialmodelingprep.com/stable/news/stock-latest?limit=15&apikey=${fmpKey}`;
          const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (r.ok) {
            const data = await r.json();
            if (Array.isArray(data)) {
              for (const a of data) {
                addArticle({
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
        } catch {}
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
