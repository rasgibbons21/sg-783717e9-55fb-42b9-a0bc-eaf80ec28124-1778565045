// Server-side data bundle for Pansy routes. Omits any line whose value is unavailable.

export interface StockBundle {
  price: string;
  changePercent: string;
  low52: string | null;
  high52: string | null;
  perf1m: string | null;
  perfYTD: string | null;
  perf1y: string | null;
  pe: string | null;
  fpe: string | null;
  marketCap: string | null;
  sector: string | null;
  shortDescription: string | null;
  headlines: string | null;
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtMarketCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtMultiple(n: number): string {
  return `${n.toFixed(1)}×`;
}

async function safeFetch(url: string, timeoutMs = 6000): Promise<unknown> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function fetchStockBundle(
  ticker: string,
  fallbackPrice?: number,
  fallbackChangePercent?: number
): Promise<StockBundle> {
  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const sym = ticker.toUpperCase();

  const [quoteData, profileData, perfData, newsItems] = await Promise.all([
    fmpKey
      ? safeFetch(`https://financialmodelingprep.com/api/v3/quote/${sym}?apikey=${fmpKey}`)
      : null,
    fmpKey
      ? safeFetch(`https://financialmodelingprep.com/api/v3/profile/${sym}?apikey=${fmpKey}`)
      : null,
    fmpKey
      ? safeFetch(`https://financialmodelingprep.com/api/v3/stock-price-change/${sym}?apikey=${fmpKey}`)
      : null,
    finnhubKey ? fetchFinnhubNews(sym, finnhubKey) : [],
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quote = Array.isArray(quoteData) ? (quoteData[0] as any) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = Array.isArray(profileData) ? (profileData[0] as any) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perf = Array.isArray(perfData) ? (perfData[0] as any) : null;

  const rawPrice: number | undefined = quote?.price ?? fallbackPrice;
  const rawChange: number | undefined = quote?.changesPercentage ?? fallbackChangePercent;
  const yearHigh: number | undefined = quote?.yearHigh;
  const yearLow: number | undefined = quote?.yearLow;
  const rawPE: number | undefined = quote?.pe;
  const rawMarketCap: number | undefined = quote?.marketCap;
  const rawFPE: number | undefined = profile?.forwardPE ?? undefined;
  const rawSector: string | undefined = profile?.sector ?? undefined;
  const rawDesc: string | undefined = profile?.description ?? undefined;
  const raw1m: number | undefined = perf?.["1M"] ?? undefined;
  const rawYTD: number | undefined = perf?.ytd ?? undefined;
  const raw1y: number | undefined = perf?.["1Y"] ?? undefined;

  return {
    price: rawPrice != null ? fmtCurrency(rawPrice) : "$—",
    changePercent: rawChange != null ? fmtPct(rawChange) : "—",
    low52: yearLow != null ? fmtCurrency(yearLow) : null,
    high52: yearHigh != null ? fmtCurrency(yearHigh) : null,
    perf1m: raw1m != null ? fmtPct(raw1m) : null,
    perfYTD: rawYTD != null ? fmtPct(rawYTD) : null,
    perf1y: raw1y != null ? fmtPct(raw1y) : null,
    pe: rawPE != null && rawPE > 0 ? fmtMultiple(rawPE) : null,
    fpe: rawFPE != null && rawFPE > 0 ? fmtMultiple(rawFPE) : null,
    marketCap: rawMarketCap != null && rawMarketCap > 0 ? fmtMarketCap(rawMarketCap) : null,
    sector: rawSector || null,
    shortDescription: rawDesc ? rawDesc.slice(0, 300).trimEnd() + (rawDesc.length > 300 ? "..." : "") : null,
    headlines: (newsItems as string[]).length > 0
      ? (newsItems as string[]).map((h, i) => `${i + 1}. ${h}`).join(" / ")
      : null,
  };
}

/** Builds the data block for injection into the system prompt — omits unavailable lines. */
export function buildDataBlock(bundle: StockBundle): string {
  const lines: string[] = [];

  lines.push(`- Price: ${bundle.price} (${bundle.changePercent} today)`);

  if (bundle.low52 && bundle.high52) {
    lines.push(`- 52-week range: ${bundle.low52} – ${bundle.high52}`);
  }

  const perfParts: string[] = [];
  if (bundle.perf1m) perfParts.push(`${bundle.perf1m} past month`);
  if (bundle.perfYTD) perfParts.push(`${bundle.perfYTD} YTD`);
  if (bundle.perf1y) perfParts.push(`${bundle.perf1y} past year`);
  if (perfParts.length > 0) lines.push(`- Performance: ${perfParts.join(", ")}`);

  const valParts: string[] = [];
  if (bundle.pe) valParts.push(`P/E ${bundle.pe}`);
  if (bundle.fpe) valParts.push(`forward P/E ${bundle.fpe}`);
  if (bundle.marketCap) valParts.push(`market cap ${bundle.marketCap}`);
  if (valParts.length > 0) lines.push(`- Valuation: ${valParts.join(", ")}`);

  if (bundle.sector && bundle.shortDescription) {
    lines.push(`- Sector / business: ${bundle.sector} — ${bundle.shortDescription}`);
  } else if (bundle.sector) {
    lines.push(`- Sector: ${bundle.sector}`);
  }

  if (bundle.headlines) {
    lines.push(`- Recent headlines: ${bundle.headlines}`);
  }

  return lines.join("\n");
}

async function fetchFinnhubNews(symbol: string, key: string): Promise<string[]> {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  const toStr = to.toISOString().split("T")[0];
  const fromStr = from.toISOString().split("T")[0];
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromStr}&to=${toStr}&token=${key}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .slice(0, 5)
      .map((item: { headline?: string }) => item.headline ?? "")
      .filter(Boolean);
  } catch {
    return [];
  }
}
