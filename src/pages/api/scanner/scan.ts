import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
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
import {
  evaluateGapAndGo,
  evaluateHodBreakout,
  evaluateRedToGreen,
  type SignalResult,
} from "@/lib/strategies";
import {
  fetchGainers,
  fetchQuotes,
  fetchProfiles,
  fetchNews,
  type NewsItem,
} from "@/lib/marketData";

let scanCache: { data: ScannerCandidate[]; ts: number } | null = null;
const CACHE_MS = 2 * 60 * 1000;
const STALE_CACHE_MS = 4 * 60 * 60 * 1000;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  if (!fmpKey && !finnhubKey) {
    return res.status(500).json({ error: "No API keys configured (need FMP_API_KEY or FINNHUB_API_KEY)" });
  }

  // Check cache (skip with ?fresh=1)
  if (scanCache && Date.now() - scanCache.ts < CACHE_MS && req.query.fresh !== "1") {
    return res.status(200).json({
      candidates: applyQueryFilters(scanCache.data, req.query),
      cached: true,
      timestamp: scanCache.ts,
      dataMode: "delayed",
    });
  }

  try {
    // Step 1: Get top gainers (FMP → Finnhub fallback)
    const { gainers, source: gainersSource } = await fetchGainers(fmpKey, finnhubKey);

    // Step 2: Filter to eligible price range
    // Finnhub fallback uses a fixed watchlist (not pre-filtered gainers),
    // so use looser thresholds to surface candidates
    const isFinnhub = gainersSource === "finnhub";
    const eligible = gainers.filter((g) =>
      g.price >= 1 && g.price <= (isFinnhub ? 50 : 20) &&
      g.changesPercentage >= (isFinnhub ? 3 : 5) &&
      (isFinnhub || g.volume > 50_000)
    );

    // Step 3: Get detailed quotes
    const symbols = eligible.slice(0, 30).map((g) => g.symbol);
    if (symbols.length === 0) {
      if (scanCache && Date.now() - scanCache.ts < STALE_CACHE_MS && req.query.fresh !== "1") {
        return res.status(200).json({
          candidates: applyQueryFilters(scanCache.data, req.query),
          cached: true,
          stale: true,
          timestamp: scanCache.ts,
          dataMode: "stale",
        });
      }
      return res.status(200).json({
        candidates: [],
        cached: false,
        timestamp: Date.now(),
        dataMode: gainersSource === "fmp" ? "delayed" : "finnhub-fallback",
        totalScanned: gainers.length,
        eligible: 0,
      });
    }

    // If gainers came from Finnhub, we already have quote data — skip re-fetching
    let quotes: FMPQuote[];
    let quotesSource: string;
    if (gainersSource === "finnhub") {
      quotes = eligible.slice(0, 30);
      quotesSource = "finnhub";
    } else {
      const qResult = await fetchQuotes(symbols, fmpKey, finnhubKey);
      quotes = qResult.quotes;
      quotesSource = qResult.source;
    }

    // Step 4: Get float data (FMP → Finnhub fallback)
    const floatMap = await fetchProfiles(symbols, fmpKey, finnhubKey);

    // Step 5: Get news for catalyst verification (FMP → Finnhub fallback)
    const newsResults = await fetchNews(symbols.slice(0, 15), fmpKey, finnhubKey);

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

        const hasCatalyst = catalystQuality === "strong" || catalystQuality === "moderate";
        const signals: SignalResult[] = [];

        const gapResult = evaluateGapAndGo(
          { price: q.price, changesPercentage: q.changesPercentage, volume: q.volume, avgVolume: q.avgVolume, previousClose: q.previousClose, dayHigh: q.dayHigh, open: q.open },
          floatShares,
          hasCatalyst,
        );
        gapResult.symbol = q.symbol;
        if (gapResult.state !== "INVALIDATED") signals.push(gapResult);

        const hodResult = evaluateHodBreakout(
          { price: q.price, dayHigh: q.dayHigh, volume: q.volume, avgVolume: q.avgVolume, changesPercentage: q.changesPercentage },
        );
        hodResult.symbol = q.symbol;
        if (hodResult.state !== "INVALIDATED") signals.push(hodResult);

        const r2gResult = evaluateRedToGreen(
          { price: q.price, open: q.open, previousClose: q.previousClose, volume: q.volume, avgVolume: q.avgVolume },
        );
        r2gResult.symbol = q.symbol;
        if (r2gResult.state !== "INVALIDATED") signals.push(r2gResult);

        signals.sort((a, b) => b.score - a.score);
        const topStrategy = signals.length > 0 ? signals[0].strategyId : null;

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
          setup: null,
          score,
          scoreBreakdown: breakdown,
          status: classifyCandidate(score, q.changesPercentage, rvol),
          flags,
          dataSource: `${gainersSource}/${quotesSource}`,
          timestamp: Date.now(),
          signals,
          topStrategy,
        };
      })
      .sort((a, b) => b.score - a.score);

    // Cache results
    scanCache = { data: candidates, ts: Date.now() };

    // Persist ACTIVE / NEAR_TRIGGER signals as alerts (fire-and-forget)
    persistAlerts(candidates).catch(() => {});

    return res.status(200).json({
      candidates: applyQueryFilters(candidates, req.query),
      cached: false,
      timestamp: Date.now(),
      dataMode: gainersSource === "fmp" ? "delayed" : "finnhub-fallback",
      totalScanned: gainers.length,
      eligible: eligible.length,
    });
  } catch (error: any) {
    console.error("Scanner error:", error?.message || error);
    if (scanCache && Date.now() - scanCache.ts < STALE_CACHE_MS && req.query.fresh !== "1") {
      return res.status(200).json({
        candidates: applyQueryFilters(scanCache.data, req.query),
        cached: true,
        stale: true,
        timestamp: scanCache.ts,
        dataMode: "stale",
      });
    }
    return res.status(200).json({
      candidates: [],
      cached: false,
      timestamp: Date.now(),
      dataMode: "error",
      error: error?.message || "Unknown scanner error",
    });
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

async function persistAlerts(candidates: ScannerCandidate[]) {
  const sb = getSupabaseAdmin();
  if (!sb) return;

  const rows: Array<Record<string, unknown>> = [];
  for (const c of candidates) {
    if (!c.signals) continue;
    for (const sig of c.signals) {
      if (sig.state !== "ACTIVE" && sig.state !== "NEAR_TRIGGER") continue;
      rows.push({
        user_id: null,
        symbol: c.symbol,
        strategy: sig.strategyId,
        signal_state: sig.state,
        score: sig.score,
        price: c.price,
        change_pct: c.change,
        entry_zone: sig.entryZone ?? null,
        stop_level: sig.invalidationLevel ?? null,
        target: sig.target1 ?? null,
        reason: sig.reason ?? null,
      });
    }
  }

  if (rows.length === 0) return;

  // Deduplicate: don't insert if same symbol+strategy was alerted in last 30 min
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: recent } = await sb
    .from("scanner_alerts")
    .select("symbol, strategy")
    .gte("created_at", thirtyMinAgo);

  const recentSet = new Set((recent ?? []).map((r: any) => `${r.symbol}:${r.strategy}`));
  const fresh = rows.filter((r) => !recentSet.has(`${r.symbol}:${r.strategy}`));
  if (fresh.length === 0) return;

  await sb.from("scanner_alerts").insert(fresh);
}

function classifyCatalyst(news: NewsItem[] | undefined): CatalystQuality {
  if (!news || news.length === 0) return "none";

  const now = Date.now();
  const recentNews = news.filter((n) => {
    const pubDate = n.publishedDate || n.date;
    if (!pubDate) return false;
    const age = now - new Date(pubDate).getTime();
    return age < 24 * 60 * 60 * 1000;
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
