import type { Candle } from "@/lib/charts/types";

/** Turns the Practice chart feed (dates for daily bars, seconds for intraday) into chart candles. */
export function toCandles(bars: { time: string | number; open: number; high: number; low: number; close: number; volume?: number }[]): Candle[] {
  return bars
    .map((bar) => ({
      time: typeof bar.time === "number" ? bar.time : Date.parse(`${bar.time}T00:00:00Z`) / 1000,
      open: Number(bar.open),
      high: Number(bar.high),
      low: Number(bar.low),
      close: Number(bar.close),
      volume: Number(bar.volume ?? 0),
    }))
    .filter((c) => [c.time, c.open, c.high, c.low, c.close].every(Number.isFinite));
}

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
