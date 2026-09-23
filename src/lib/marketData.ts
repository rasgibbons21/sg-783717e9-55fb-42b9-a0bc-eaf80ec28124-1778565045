// Market data layer: FMP primary, Finnhub fallback.
// Each function tries FMP first; on failure (401, timeout, etc.) it
// falls back to Finnhub so the scanner stays alive.

import type { FMPQuote } from "./scanner";

const TIMEOUT = 8_000;

function abortAfter(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

// ── Gainers ────────────────────────────────────────────────────────
// FMP has a dedicated endpoint; Finnhub does not.
// Fallback: poll a watchlist of commonly-traded small caps via Finnhub
// and return any that are up significantly today.

// Front-loaded with sub-$20 volatile small/mid-caps that actually trigger scanner rules.
// Large caps go last — they rarely gap 5%+ intraday.
const FALLBACK_WATCHLIST = [
  // Volatile sub-$20 small caps (most likely to trigger)
  "NIO","LCID","SOFI","RIVN","SNAP","RIOT","FCEL","PLUG","SOUN","JOBY",
  "DNA","OPEN","WISH","BB","NOK","CLOV","WKHS","SPCE","PHUN","KULR",
  "BTBT","RUM","DJT","SKLZ","QS","FFIE","MULN","SNDL","ASTS","GSAT",
  "TELL","NKLA","GRAB","VFS","PSNY","GOEV","BEEM","HIMS","STEM","AEHR",
  // Mid-caps that occasionally move big
  "MARA","HOOD","UPST","AFRM","RKLB","IONQ","DKNG","COIN","SQ","SMCI",
  // Large caps (reference, rarely trigger)
  "TSLA","AMD","NVDA","AAPL","AMZN","META","PLTR","INTC","MU","ENPH",
];

export interface GainersResult {
  gainers: FMPQuote[];
  source: "fmp" | "finnhub";
}

export async function fetchGainers(fmpKey?: string, finnhubKey?: string): Promise<GainersResult> {
  // Try FMP first
  if (fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/stable/biggest-gainers?apikey=${fmpKey}`;
      const res = await fetch(url, { signal: abortAfter(TIMEOUT) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return { gainers: data, source: "fmp" };
        }
      }
      console.warn(`FMP gainers failed: ${res.status}`);
    } catch (e) {
      console.warn("FMP gainers error:", e);
    }
  }

  // Fallback: Finnhub quotes for watchlist, filter to gainers
  if (finnhubKey) {
    try {
      const gainers = await finnhubWatchlistScan(finnhubKey);
      if (gainers.length > 0) {
        return { gainers, source: "finnhub" };
      }
    } catch (e) {
      console.warn("Finnhub watchlist scan error:", e);
    }
  }

  return { gainers: [], source: "fmp" };
}

async function finnhubWatchlistScan(key: string): Promise<FMPQuote[]> {
  // Finnhub free tier: 60 calls/min. Scan 40 small caps (front-loaded in list).
  const batch = FALLBACK_WATCHLIST.slice(0, 40);
  const results: FMPQuote[] = [];

  const promises = batch.map(async (sym) => {
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${key}`;
      const res = await fetch(url, { signal: abortAfter(6000) });
      if (!res.ok) return null;
      const d = await res.json();
      if (!d || !d.c || d.c <= 0) return null;

      const price = d.c;
      const prevClose = d.pc || 0;
      const open = d.o || prevClose;
      const change = price - prevClose;
      const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

      if (changePct < 3) return null; // only return meaningful gainers

      return {
        symbol: sym,
        price,
        changesPercentage: Math.round(changePct * 100) / 100,
        change: Math.round(change * 100) / 100,
        dayLow: d.l || price,
        dayHigh: d.h || price,
        yearHigh: d.h || price,
        yearLow: d.l || price,
        marketCap: 0,
        priceAvg50: 0,
        priceAvg200: 0,
        volume: d.v || 0,
        avgVolume: d.v ? Math.round(d.v / 1.5) : 0, // estimate; Finnhub doesn't provide avgVol in /quote
        open,
        previousClose: prevClose,
        sharesOutstanding: 0,
      } as FMPQuote;
    } catch {
      return null;
    }
  });

  const settled = await Promise.allSettled(promises);
  for (const r of settled) {
    if (r.status === "fulfilled" && r.value) results.push(r.value);
  }

  results.sort((a, b) => b.changesPercentage - a.changesPercentage);
  return results;
}

// Stable API returns `changePercentage`; our FMPQuote type uses `changesPercentage`
function normalizeFmpQuote(q: Record<string, unknown>): Record<string, unknown> {
  if (q.changePercentage !== undefined && q.changesPercentage === undefined) {
    q.changesPercentage = q.changePercentage;
  }
  return q;
}

// ── Batch Quotes ───────────────────────────────────────────────────

export async function fetchQuotes(
  symbols: string[],
  fmpKey?: string,
  finnhubKey?: string,
): Promise<{ quotes: FMPQuote[]; source: string }> {
  // Try FMP batch quote
  if (fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/stable/batch-quote?symbols=${symbols.join(",")}&apikey=${fmpKey}`;
      const res = await fetch(url, { signal: abortAfter(TIMEOUT) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return { quotes: data.map(normalizeFmpQuote) as unknown as FMPQuote[], source: "fmp" };
        }
      }
    } catch {}
  }

  // Fallback: Finnhub individual quotes
  if (finnhubKey) {
    const quotes = await Promise.all(
      symbols.slice(0, 20).map(async (sym): Promise<FMPQuote | null> => {
        try {
          const url = `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${finnhubKey}`;
          const res = await fetch(url, { signal: abortAfter(6000) });
          if (!res.ok) return null;
          const d = await res.json();
          if (!d?.c || d.c <= 0) return null;

          const price = d.c;
          const prevClose = d.pc || 0;
          return {
            symbol: sym,
            price,
            changesPercentage: prevClose > 0 ? Math.round(((price - prevClose) / prevClose) * 10000) / 100 : 0,
            change: Math.round((price - prevClose) * 100) / 100,
            dayLow: d.l || price,
            dayHigh: d.h || price,
            yearHigh: d.h || price,
            yearLow: d.l || price,
            marketCap: 0,
            priceAvg50: 0,
            priceAvg200: 0,
            volume: d.v || 0,
            avgVolume: d.v ? Math.round(d.v / 1.5) : 0,
            open: d.o || prevClose,
            previousClose: prevClose,
            sharesOutstanding: 0,
          } as FMPQuote;
        } catch {
          return null;
        }
      }),
    );
    const valid = quotes.filter((q): q is FMPQuote => q !== null);
    if (valid.length > 0) return { quotes: valid, source: "finnhub" };
  }

  return { quotes: [], source: "none" };
}

// ── Profiles / Float ───────────────────────────────────────────────

export async function fetchProfiles(
  symbols: string[],
  fmpKey?: string,
  finnhubKey?: string,
): Promise<Map<string, number | null>> {
  const floatMap = new Map<string, number | null>();

  // Try FMP batch profile
  if (fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/stable/profile?symbol=${symbols.join(",")}&apikey=${fmpKey}`;
      const res = await fetch(url, { signal: abortAfter(TIMEOUT) });
      if (res.ok) {
        const profiles: Array<{ symbol: string; floatShares?: number }> = await res.json();
        for (const p of profiles) floatMap.set(p.symbol, p.floatShares ?? null);
        return floatMap;
      }
    } catch {}
  }

  // Fallback: Finnhub profile2 (individual, limited)
  if (finnhubKey) {
    const batch = symbols.slice(0, 10);
    await Promise.all(
      batch.map(async (sym) => {
        try {
          const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${finnhubKey}`;
          const res = await fetch(url, { signal: abortAfter(6000) });
          if (!res.ok) return;
          const d = await res.json();
          floatMap.set(sym, d.shareOutstanding ? d.shareOutstanding * 1_000_000 : null);
        } catch {}
      }),
    );
  }

  return floatMap;
}

// ── News ───────────────────────────────────────────────────────────

export interface NewsItem {
  title: string;
  publishedDate?: string;
  date?: string;
  text?: string;
  url?: string;
  site?: string;
}

export async function fetchNews(
  symbols: string[],
  fmpKey?: string,
  finnhubKey?: string,
): Promise<Map<string, NewsItem[]>> {
  const newsMap = new Map<string, NewsItem[]>();

  // Try FMP batch news
  if (fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/stable/news/stock-latest?tickers=${symbols.join(",")}&limit=50&apikey=${fmpKey}`;
      const res = await fetch(url, { signal: abortAfter(TIMEOUT) });
      if (res.ok) {
        const articles: Array<NewsItem & { symbol?: string }> = await res.json();
        for (const a of articles) {
          if (!a.symbol) continue;
          const sym = (a.symbol as string).toUpperCase();
          if (!newsMap.has(sym)) newsMap.set(sym, []);
          newsMap.get(sym)!.push(a);
        }
        if (newsMap.size > 0) return newsMap;
      }
    } catch {}
  }

  // Fallback: Finnhub company-news (individual per symbol, recent 7 days)
  if (finnhubKey) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const from = weekAgo.toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);

    const batch = symbols.slice(0, 10);
    await Promise.all(
      batch.map(async (sym) => {
        try {
          const url = `https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${from}&to=${to}&token=${finnhubKey}`;
          const res = await fetch(url, { signal: abortAfter(6000) });
          if (!res.ok) return;
          const articles: Array<{ headline?: string; datetime?: number; summary?: string; url?: string; source?: string }> = await res.json();
          if (!Array.isArray(articles)) return;
          const mapped: NewsItem[] = articles.slice(0, 5).map((a) => ({
            title: a.headline || "",
            publishedDate: a.datetime ? new Date(a.datetime * 1000).toISOString() : undefined,
            text: a.summary,
            url: a.url,
            site: a.source,
          }));
          if (mapped.length > 0) newsMap.set(sym, mapped);
        } catch {}
      }),
    );
  }

  return newsMap;
}
