import type { NextApiRequest, NextApiResponse } from "next";
import {
  type ScannerCandidate,
  type FMPQuote,
  type CatalystQuality,
  scoreCandidate,
  totalScore,
  classifyCandidate,
  filterAndSort,
  DEFAULT_FILTERS,
} from "@/lib/scanner";

let scanCache: { data: ScannerCandidate[]; ts: number } | null = null;
const CACHE_MS = 2 * 60 * 1000;
const STALE_CACHE_MS = 60 * 60 * 1000; // serve stale data up to 1 hour

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "FMP_API_KEY not configured" });

  const finnhubKey = process.env.FINNHUB_API_KEY;

  // Check cache
  if (scanCache && Date.now() - scanCache.ts < CACHE_MS) {
    return res.status(200).json({
      candidates: applyQueryFilters(scanCache.data, req.query),
      cached: true,
      timestamp: scanCache.ts,
      dataMode: "delayed",
    });
  }

  try {
    // Step 1: Get top gainers from FMP
    const gainersUrl = `https://financialmodelingprep.com/api/v3/stock_market/gainers?apiKey=${apiKey}`;
    const gainersRes = await fetch(gainersUrl);
    if (!gainersRes.ok) throw new Error(`FMP gainers: ${gainersRes.status}`);
    const gainers: FMPQuote[] = await gainersRes.json();

    // Step 2: Filter to eligible price range first (save API calls)
    const eligible = gainers.filter((g) =>
      g.price >= 1 && g.price <= 20 &&
      g.changesPercentage >= 5 &&
      g.volume > 50_000
    );

    // Step 3: Get detailed quotes for eligible symbols
    const symbols = eligible.slice(0, 30).map((g) => g.symbol);
    if (symbols.length === 0) {
      return res.status(200).json({ candidates: [], cached: false, timestamp: Date.now(), dataMode: "live" });
    }

    const quotesUrl = `https://financialmodelingprep.com/api/v3/quote/${symbols.join(",")}?apiKey=${apiKey}`;
    const quotesRes = await fetch(quotesUrl);
    if (!quotesRes.ok) throw new Error(`FMP quotes: ${quotesRes.status}`);
    const quotes: FMPQuote[] = await quotesRes.json();

    // Step 4: Get float data for top candidates
    const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${symbols.join(",")}?apiKey=${apiKey}`;
    const profileRes = await fetch(profileUrl);
    const profiles: Array<{ symbol: string; floatShares?: number; description?: string }> =
      profileRes.ok ? await profileRes.json() : [];
    const floatMap = new Map(profiles.map((p) => [p.symbol, p.floatShares ?? null]));

    // Step 5: Get news for catalyst verification
    const newsResults = await fetchNewsForSymbols(symbols.slice(0, 15), apiKey, finnhubKey);

    // Step 6: Score each candidate
    const candidates: ScannerCandidate[] = quotes
      .filter((q) => q.price > 0 && q.changesPercentage > 0)
      .map((q) => {
        const floatShares = floatMap.get(q.symbol) ?? null;
        const news = newsResults.get(q.symbol);
        const catalystQuality = classifyCatalyst(news);
        const breakdown = scoreCandidate(q, floatShares, catalystQuality);
        const score = totalScore(breakdown);
        const rvol = q.avgVolume > 0 ? Math.round((q.volume / q.avgVolume) * 10) / 10 : 0;

        const flags: string[] = [];
        if (q.price > 10) flags.push("Above preferred $10 price range");
        if (q.changesPercentage > 50) flags.push("Extreme move — halt/reversal risk");
        if (rvol < 5) flags.push("Below 5x RVOL threshold");
        if (floatShares === null) flags.push("Float data unavailable");
        if (q.volume < 1_000_000) flags.push("Below 1M volume — liquidity risk");

        return {
          symbol: q.symbol,
          price: q.price,
          change: Math.round(q.changesPercentage * 100) / 100,
          changeAbs: Math.round(q.change * 100) / 100,
          prevClose: q.previousClose,
          volume: q.volume,
          avgVolume: q.avgVolume,
          rvol,
          marketCap: q.marketCap,
          float: floatShares,
          catalyst: catalystQuality,
          catalystHeadline: news?.[0]?.title ?? null,
          setup: null, // setup detection requires chart analysis
          score,
          scoreBreakdown: breakdown,
          status: classifyCandidate(score, q.changesPercentage, rvol),
          flags,
          dataSource: "FMP",
          timestamp: Date.now(),
        };
      })
      .sort((a, b) => b.score - a.score);

    // Cache results
    scanCache = { data: candidates, ts: Date.now() };

    return res.status(200).json({
      candidates: applyQueryFilters(candidates, req.query),
      cached: false,
      timestamp: Date.now(),
      dataMode: "delayed",
      totalScanned: gainers.length,
      eligible: eligible.length,
    });
  } catch (error: any) {
    console.error("Scanner error:", error);
    if (scanCache && Date.now() - scanCache.ts < STALE_CACHE_MS) {
      return res.status(200).json({
        candidates: applyQueryFilters(scanCache.data, req.query),
        cached: true,
        stale: true,
        timestamp: scanCache.ts,
        dataMode: "stale",
      });
    }
    return res.status(200).json({ candidates: [], cached: false, timestamp: Date.now(), dataMode: "offline" });
  }
}

function applyQueryFilters(candidates: ScannerCandidate[], query: Record<string, any>): ScannerCandidate[] {
  const filters = {
    ...DEFAULT_FILTERS,
    minPrice: Number(query.minPrice) || DEFAULT_FILTERS.minPrice,
    maxPrice: Number(query.maxPrice) || DEFAULT_FILTERS.maxPrice,
    minChange: Number(query.minChange) || DEFAULT_FILTERS.minChange,
    minRvol: Number(query.minRvol) || DEFAULT_FILTERS.minRvol,
    catalystOnly: query.catalystOnly === "true",
    sortBy: (query.sortBy as any) || DEFAULT_FILTERS.sortBy,
  };
  return filterAndSort(candidates, filters);
}

interface NewsItem {
  title: string;
  publishedDate?: string;
  date?: string;
  text?: string;
  url?: string;
  site?: string;
}

async function fetchNewsForSymbols(
  symbols: string[],
  fmpKey: string,
  finnhubKey?: string,
): Promise<Map<string, NewsItem[]>> {
  const newsMap = new Map<string, NewsItem[]>();

  // Batch FMP news (supports comma-separated tickers)
  try {
    const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbols.join(",")}&limit=50&apiKey=${fmpKey}`;
    const res = await fetch(url);
    if (res.ok) {
      const articles: Array<NewsItem & { symbol?: string }> = await res.json();
      for (const a of articles) {
        if (!a.symbol) continue;
        const sym = a.symbol.toUpperCase();
        if (!newsMap.has(sym)) newsMap.set(sym, []);
        newsMap.get(sym)!.push(a);
      }
    }
  } catch {}

  return newsMap;
}

function classifyCatalyst(news: NewsItem[] | undefined): CatalystQuality {
  if (!news || news.length === 0) return "none";

  const now = Date.now();
  const recentNews = news.filter((n) => {
    const pubDate = n.publishedDate || n.date;
    if (!pubDate) return false;
    const age = now - new Date(pubDate).getTime();
    return age < 24 * 60 * 60 * 1000; // within 24 hours
  });

  if (recentNews.length === 0) return "unverified";

  const headline = (recentNews[0].title || "").toLowerCase();
  const strongKeywords = ["fda", "approval", "earnings", "revenue", "acquisition", "merger", "contract", "partnership", "clinical", "trial results"];
  const moderateKeywords = ["launch", "update", "analyst", "upgrade", "downgrade", "product", "agreement"];

  if (strongKeywords.some((k) => headline.includes(k))) return "strong";
  if (moderateKeywords.some((k) => headline.includes(k))) return "moderate";
  if (recentNews.length >= 2) return "moderate";
  return "weak";
}
