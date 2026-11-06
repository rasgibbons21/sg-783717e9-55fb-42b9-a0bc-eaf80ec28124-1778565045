import type { Candle, FVG, StructureBreak, Swing, Zone } from "./types";

/** A three-candle imbalance: the first and third candles' wicks don't overlap. */
export function findFVGs(candles: Candle[]): FVG[] {
  const gaps: FVG[] = [];
  for (let i = 0; i + 2 < candles.length; i += 1) {
    const [first, , third] = [candles[i], candles[i + 1], candles[i + 2]];
    if (third.low > first.high) {
      gaps.push({ indexes: [i, i + 1, i + 2], direction: "bullish", zone: { bottom: first.high, top: third.low } });
    } else if (third.high < first.low) {
      gaps.push({ indexes: [i, i + 1, i + 2], direction: "bearish", zone: { top: first.low, bottom: third.high } });
    }
  }
  return gaps;
}

/** The middle of a gap, where price often reacts first. */
export function consequentEncroachment(zone: Zone): number {
  return (zone.top + zone.bottom) / 2;
}

/** Highs and lows that stand above or below `lookback` candles on each side. */
export function findSwings(candles: Candle[], lookback = 2): Swing[] {
  const swings: Swing[] = [];
  for (let i = lookback; i < candles.length - lookback; i += 1) {
    const neighbours = [...candles.slice(i - lookback, i), ...candles.slice(i + 1, i + 1 + lookback)];
    if (neighbours.every((c) => c.high < candles[i].high)) swings.push({ index: i, type: "high", price: candles[i].high });
    if (neighbours.every((c) => c.low > candles[i].low)) swings.push({ index: i, type: "low", price: candles[i].low });
  }
  return swings;
}

/**
 * A close beyond the latest confirmed swing. Breaking in the same direction as the
 * current trend is a break of structure (BOS); the first break against it is a change
 * of character (CHoCH). A swing is confirmed once `lookback` candles have formed after it.
 */
export function detectBreaks(candles: Candle[], lookback = 2): StructureBreak[] {
  const swings = findSwings(candles, lookback);
  const broken = new Set<number>();
  const breaks: StructureBreak[] = [];
  let trend: StructureBreak["direction"] | null = null;

  for (let i = 0; i < candles.length; i += 1) {
    const confirmed = swings.filter((s) => s.index + lookback < i && !broken.has(s.index * 2 + (s.type === "high" ? 0 : 1)));
    const lastHigh = [...confirmed].reverse().find((s) => s.type === "high");
    const lastLow = [...confirmed].reverse().find((s) => s.type === "low");
    const close = candles[i].close;

    if (lastHigh && close > lastHigh.price) {
      breaks.push({ index: i, kind: trend === "bearish" ? "CHoCH" : "BOS", direction: "bullish", level: lastHigh.price });
      broken.add(lastHigh.index * 2);
      trend = "bullish";
    } else if (lastLow && close < lastLow.price) {
      breaks.push({ index: i, kind: trend === "bullish" ? "CHoCH" : "BOS", direction: "bearish", level: lastLow.price });
      broken.add(lastLow.index * 2 + 1);
      trend = "bearish";
    }
  }
  return breaks;
}

/** Whether a candle traded on clearly more volume than the candles before it. */
export function volumeConfirms(candles: Candle[], index: number, factor = 1.5, window = 10): boolean {
  const earlier = candles.slice(Math.max(0, index - window), index);
  if (earlier.length === 0) return false;
  const average = earlier.reduce((sum, c) => sum + c.volume, 0) / earlier.length;
  return candles[index].volume >= average * factor;
}

/** The upper half of a range is premium (relatively expensive); the lower half is discount. */
export function isPremium(price: number, rangeLow: number, rangeHigh: number): boolean {
  return price > (rangeLow + rangeHigh) / 2;
}

/** How many times the risk the target would earn. */
export function riskReward(entry: number, stop: number, target: number): number {
  const risk = Math.abs(entry - stop);
  return risk === 0 ? 0 : Math.abs(target - entry) / risk;
}
