import { describe, expect, it } from "vitest";
import { aggregateCandles } from "./aggregate";
import { consequentEncroachment, detectBreaks, findFVGs, findSwings, isPremium, riskReward, volumeConfirms } from "./detectors";
import { priceScale } from "./scale";
import type { Candle } from "./types";

let t = 0;
const c = (open: number, high: number, low: number, close: number, volume = 100): Candle => ({ time: (t += 60), open, high, low, close, volume });

describe("findFVGs", () => {
  it("finds a bullish gap and its exact zone", () => {
    const candles = [c(100, 101, 99, 100.5), c(100.5, 105, 100.4, 104.8, 300), c(104.8, 106, 103, 105.5)];
    expect(findFVGs(candles)).toEqual([{ indexes: [0, 1, 2], direction: "bullish", zone: { bottom: 101, top: 103 } }]);
  });

  it("finds a bearish gap and its exact zone", () => {
    const candles = [c(105, 106, 104, 104.5), c(104.5, 104.6, 99, 99.5, 300), c(99.5, 101, 98, 98.5)];
    expect(findFVGs(candles)).toEqual([{ indexes: [0, 1, 2], direction: "bearish", zone: { top: 104, bottom: 101 } }]);
  });

  it("finds nothing when the wicks overlap", () => {
    const candles = [c(100, 102, 99, 101), c(101, 103, 100, 102.5), c(102.5, 103.5, 101.5, 103)];
    expect(findFVGs(candles)).toEqual([]);
  });
});

describe("consequentEncroachment", () => {
  it("is the middle of the gap", () => {
    expect(consequentEncroachment({ top: 110, bottom: 100 })).toBe(105);
  });
});

describe("aggregateCandles", () => {
  it("builds higher-timeframe candles, keeping a short last bucket honest", () => {
    t = 0;
    const lower = [
      c(10, 12, 9, 11, 5),
      c(11, 13, 10, 12, 5),
      c(12, 14, 11, 13, 5),
      c(13, 15, 12, 14, 5),
      c(14, 16, 13, 15, 5),
      c(15, 17, 14, 16, 5),
      c(16, 18, 15, 17, 5),
    ];
    const higher = aggregateCandles(lower, 3);
    expect(higher).toHaveLength(3);
    expect(higher[0]).toEqual({ time: lower[0].time, open: 10, high: 14, low: 9, close: 13, volume: 15 });
    expect(higher[2]).toEqual({ time: lower[6].time, open: 16, high: 18, low: 15, close: 17, volume: 5 });
  });

  it("returns nothing for no candles", () => {
    expect(aggregateCandles([], 3)).toEqual([]);
  });
});

describe("priceScale", () => {
  it("maps prices to the chart and back", () => {
    const scale = priceScale(100, 200, 300, 0);
    expect(scale.toY(200)).toBe(0);
    expect(scale.toY(100)).toBe(300);
    expect(scale.toPrice(scale.toY(150))).toBeCloseTo(150);
  });

  it("copes with a flat range", () => {
    expect(Number.isFinite(priceScale(100, 100, 300).toY(100))).toBe(true);
  });
});

describe("volumeConfirms", () => {
  const base = Array.from({ length: 10 }, () => c(10, 11, 9, 10, 100));
  it("confirms a move on clearly higher volume", () => {
    expect(volumeConfirms([...base, c(10, 13, 10, 12.8, 200)], 10)).toBe(true);
  });
  it("does not confirm a move on ordinary volume", () => {
    expect(volumeConfirms([...base, c(10, 13, 10, 12.8, 120)], 10)).toBe(false);
  });
  it("can't confirm without earlier candles to compare", () => {
    expect(volumeConfirms([c(10, 13, 10, 12.8, 500)], 0)).toBe(false);
  });
});

describe("isPremium and riskReward", () => {
  it("splits a range into premium and discount", () => {
    expect(isPremium(80, 0, 100)).toBe(true);
    expect(isPremium(20, 0, 100)).toBe(false);
  });
  it("measures reward against risk", () => {
    expect(riskReward(100, 98, 106)).toBe(3);
    expect(riskReward(100, 102, 94)).toBe(3);
  });
});

describe("structure", () => {
  const series = [
    c(9, 10, 8, 9.5),
    c(9.5, 11, 9, 10.5),
    c(12.5, 14, 12, 13),
    c(11.5, 12, 10, 11),
    c(10, 11, 9.5, 10.5),
    c(11, 13, 10.5, 12.5),
    c(13, 15.5, 13, 15),
    c(13, 14, 11, 11.5),
    c(11, 12, 9, 9.2),
  ];

  it("finds swing highs and lows", () => {
    const swings = findSwings(series);
    expect(swings).toContainEqual({ index: 2, type: "high", price: 14 });
    expect(swings).toContainEqual({ index: 4, type: "low", price: 9.5 });
  });

  it("labels a continuation break BOS and the first break against the trend CHoCH", () => {
    expect(detectBreaks(series)).toEqual([
      { index: 6, kind: "BOS", direction: "bullish", level: 14 },
      { index: 8, kind: "CHoCH", direction: "bearish", level: 9.5 },
    ]);
  });
});
