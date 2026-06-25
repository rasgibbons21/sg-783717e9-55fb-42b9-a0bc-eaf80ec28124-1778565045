import type { OHLCBar } from "@/components/CandlestickChart";

// Maps our UI timeframe keys to FMP endpoint names
const FMP_ENDPOINT: Record<string, string> = {
  daily: "historical-price-full",
  "1hour": "1hour",
  "15min": "15min",
  "5min": "5min",
};

/**
 * Fetch OHLC bars from the already-deployed /api/stock-chart proxy (FMP).
 * No auth required — public market price data.
 */
export async function fetchOHLC(ticker: string, timeframe = "daily"): Promise<OHLCBar[]> {
  const sym = ticker.toUpperCase().trim();
  const ep = FMP_ENDPOINT[timeframe] ?? "historical-price-full";

  let url: string;
  if (timeframe === "daily") {
    url = `/api/stock-chart?ticker=${sym}&endpoint=historical-price-full&timeseries=90`;
  } else {
    url = `/api/stock-chart?ticker=${sym}&endpoint=${ep}`;
  }

  const res = await fetch(url);
  if (!res.ok) return [];
  const raw = await res.json();

  if (timeframe === "daily") {
    // { historical: [{date, open, high, low, close, volume}] } — newest-first
    const hist: { date: string; open: number; high: number; low: number; close: number; volume: number }[] =
      (raw as { historical?: typeof hist }).historical ?? [];
    return hist
      .slice()
      .reverse()
      .map(r => ({ time: r.date, open: r.open, high: r.high, low: r.low, close: r.close, volume: r.volume }));
  } else {
    // [{date: "2024-01-02 09:30:00", open, high, low, close, volume}] — newest-first
    const intraday: { date: string; open: number; high: number; low: number; close: number; volume: number }[] =
      Array.isArray(raw) ? raw : [];
    return intraday
      .slice()
      .reverse()
      .map(r => ({
        time: Math.floor(new Date(r.date).getTime() / 1000), // UTCTimestamp for lightweight-charts
        open: r.open,
        high: r.high,
        low: r.low,
        close: r.close,
        volume: r.volume,
      }));
  }
}
