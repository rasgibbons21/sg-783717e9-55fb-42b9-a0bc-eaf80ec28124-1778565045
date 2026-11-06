import type { Candle } from "./types";

/** Combines every `size` candles into one higher-timeframe candle. A short final group stays as it is. */
export function aggregateCandles(candles: Candle[], size: number): Candle[] {
  const result: Candle[] = [];
  for (let start = 0; start < candles.length; start += size) {
    const group = candles.slice(start, start + size);
    result.push({
      time: group[0].time,
      open: group[0].open,
      high: Math.max(...group.map((c) => c.high)),
      low: Math.min(...group.map((c) => c.low)),
      close: group[group.length - 1].close,
      volume: group.reduce((sum, c) => sum + c.volume, 0),
    });
  }
  return result;
}
