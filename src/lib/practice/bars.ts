export interface DailyBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface RawBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/** Reads the provider's daily prices, newest first in either known shape, into oldest-first chart bars. */
export function parseDailyBars(raw: unknown): DailyBar[] {
  const wrapped = (raw as { historical?: unknown } | null)?.historical;
  const list = Array.isArray(raw) ? raw : Array.isArray(wrapped) ? wrapped : [];
  return (list as RawBar[])
    .slice()
    .reverse()
    .map((bar) => ({ time: bar.date, open: bar.open, high: bar.high, low: bar.low, close: bar.close, volume: bar.volume ?? 0 }));
}
