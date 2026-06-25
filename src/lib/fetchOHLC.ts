import type { OHLCBar } from "@/components/CandlestickChart";

const YAHOO_PARAMS: Record<string, { interval: string; range: string }> = {
  daily:  { interval: "1d",  range: "3mo" },
  "1hour":  { interval: "1h",  range: "5d"  },
  "15min":  { interval: "15m", range: "5d"  },
  "5min":   { interval: "5m",  range: "2d"  },
};

export async function fetchOHLC(ticker: string, timeframe = "daily"): Promise<OHLCBar[]> {
  const sym = ticker.toUpperCase().trim();
  const { interval, range } = YAHOO_PARAMS[timeframe] ?? YAHOO_PARAMS.daily;

  const res = await fetch(`/api/proxy/yahoo-chart?ticker=${sym}&interval=${interval}&range=${range}`);
  if (!res.ok) return [];
  const raw = await res.json();

  const result = raw?.chart?.result?.[0];
  if (!result) return [];

  const timestamps: number[] = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0] ?? {};
  const opens: (number | null)[]   = quote.open   ?? [];
  const highs: (number | null)[]   = quote.high   ?? [];
  const lows: (number | null)[]    = quote.low    ?? [];
  const closes: (number | null)[]  = quote.close  ?? [];
  const volumes: (number | null)[] = quote.volume ?? [];

  const bars: OHLCBar[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const o = opens[i], h = highs[i], l = lows[i], c = closes[i];
    if (o == null || h == null || l == null || c == null) continue;

    const ts = timestamps[i];
    const time: string | number = timeframe === "daily"
      ? new Date(ts * 1000).toISOString().slice(0, 10)
      : ts;

    bars.push({ time, open: o, high: h, low: l, close: c, volume: volumes[i] ?? 0 });
  }
  return bars;
}
