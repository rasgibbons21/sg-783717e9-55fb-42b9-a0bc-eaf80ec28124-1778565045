import type { NextApiRequest, NextApiResponse } from "next";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_MS = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const finnhubKey = process.env.FINNHUB_API_KEY;
  const newsDataKey = process.env.NEWSDATA_API_KEY;
  const fmpKey = process.env.FMP_API_KEY;
  const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!finnhubKey && !newsDataKey && !fmpKey && !alphaVantageKey) {
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

      // 4. Alpha Vantage News Sentiment — adds sentiment + topics + extra articles
      if (alphaVantageKey) {
        try {
          const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets,economy_monetary,technology&limit=20&apikey=${alphaVantageKey}`;
          const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (r.ok) {
            const data = await r.json();
            const feed = data.feed ?? [];
            for (const item of feed) {
              if (!item.title) continue;
              const tickers = (item.ticker_sentiment ?? [])
                .filter((t: any) => t.ticker && !t.ticker.includes(":"))
                .map((t: any) => t.ticker);
              const score = parseFloat(item.overall_sentiment_score) || 0;
              const label: Article["sentiment"] =
                score >= 0.15 ? "Bullish" : score <= -0.15 ? "Bearish" : "Neutral";
              const topics = (item.topics ?? []).map((t: any) => t.topic).slice(0, 3);
              addArticle({
                id: item.url || String(Date.now() + Math.random()),
                title: item.title,
                summary: item.summary?.slice(0, 200),
                source: item.source || "Alpha Vantage",
                url: item.url,
                image: item.banner_image ?? undefined,
                publishedAt: item.time_published
                  ? `${item.time_published.slice(0, 4)}-${item.time_published.slice(4, 6)}-${item.time_published.slice(6, 8)}T${item.time_published.slice(9, 11)}:${item.time_published.slice(11, 13)}:00Z`
                  : new Date().toISOString(),
                category: topics[0] || "general",
                symbols: tickers,
                sentiment: label,
                sentimentScore: score,
                topics,
              });
            }

            // Enrich existing articles with sentiment from matching AV items
            const avByTitle = new Map<string, typeof feed[0]>();
            for (const item of feed) {
              if (item.title) avByTitle.set(item.title.toLowerCase().slice(0, 60), item);
            }
            for (const article of articles) {
              if (article.sentiment) continue;
              const match = avByTitle.get(article.title.toLowerCase().slice(0, 60));
              if (match) {
                const s = parseFloat(match.overall_sentiment_score) || 0;
                article.sentiment = s >= 0.15 ? "Bullish" : s <= -0.15 ? "Bearish" : "Neutral";
                article.sentimentScore = s;
                article.topics = (match.topics ?? []).map((t: any) => t.topic).slice(0, 3);
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
  sentiment?: "Bullish" | "Bearish" | "Neutral";
  sentimentScore?: number;
  topics?: string[];
}
