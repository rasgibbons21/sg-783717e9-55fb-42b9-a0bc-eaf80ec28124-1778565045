import { describe, expect, it } from "vitest";
import { detectBreaks, findFVGs, volumeConfirms } from "./detectors";
import {
  breakerBlock,
  breakoutRetest,
  bearishFVG,
  bullishFVG,
  candleRange,
  inverseFVG,
  liquiditySweep,
  orderBlock,
  ote,
  powerOf3,
  silverBullet,
  structureBreak,
  supplyDemand,
  supportResistance,
} from "./patterns";
import type { Candle } from "./types";

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

function expectValid(candles: Candle[]) {
  for (const c of candles) {
    expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close));
    expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close));
    expect(c.volume).toBeGreaterThan(0);
  }
}

const newYorkHour = (seconds: number) =>
  Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", hourCycle: "h23" }).format(new Date(seconds * 1000)));

describe.each(SEEDS)("pattern builders with seed %i", (seed) => {
  it("builds fair value gaps the detector agrees with", () => {
    for (const built of [bullishFVG(seed), bearishFVG(seed)]) {
      expectValid(built.candles);
      expect(findFVGs(built.candles)).toContainEqual(built.answer.fvg);
      expect(volumeConfirms(built.candles, built.answer.fvg.indexes[1])).toBe(true);
    }
    expect(bullishFVG(seed).answer.fvg.direction).toBe("bullish");
    expect(bearishFVG(seed).answer.fvg.direction).toBe("bearish");
  });

  it("builds an inverse FVG that flips on a close through the gap", () => {
    const { candles, answer } = inverseFVG(seed);
    expectValid(candles);
    expect(findFVGs(candles)).toContainEqual(answer.fvg);
    const after = candles.slice(answer.fvg.indexes[2] + 1);
    const firstFlip = after.findIndex((c) => c.close > answer.fvg.zone.top) + answer.fvg.indexes[2] + 1;
    expect(answer.flipIndex).toBe(firstFlip);
  });

  it("builds liquidity sweeps on both sides", () => {
    const low = liquiditySweep(seed, "low");
    expectValid(low.candles);
    expect(low.candles.slice(0, low.answer.sweepIndex).every((c) => c.low >= low.answer.level)).toBe(true);
    expect(low.candles[low.answer.sweepIndex].low).toBeLessThan(low.answer.level);
    expect(low.candles[low.answer.sweepIndex].close).toBeGreaterThan(low.answer.level);
    expect(volumeConfirms(low.candles, low.answer.sweepIndex)).toBe(true);

    const high = liquiditySweep(seed, "high");
    expect(high.candles.slice(0, high.answer.sweepIndex).every((c) => c.high <= high.answer.level)).toBe(true);
    expect(high.candles[high.answer.sweepIndex].high).toBeGreaterThan(high.answer.level);
    expect(high.candles[high.answer.sweepIndex].close).toBeLessThan(high.answer.level);
  });

  it("builds order blocks followed by a displacement that breaks structure", () => {
    for (const direction of ["bullish", "bearish"] as const) {
      const { candles, answer } = orderBlock(seed, direction);
      expectValid(candles);
      const ob = candles[answer.obIndex];
      expect(direction === "bullish" ? ob.close < ob.open : ob.close > ob.open).toBe(true);
      expect(answer.zone).toEqual({ top: ob.high, bottom: ob.low });
      expect(answer.displacementIndex).toBe(answer.obIndex + 1);
      expect(volumeConfirms(candles, answer.displacementIndex)).toBe(true);
      expect(detectBreaks(candles)).toContainEqual(expect.objectContaining({ index: answer.displacementIndex, direction }));
    }
  });

  it("builds a breaker block that price closes through", () => {
    const { candles, answer } = breakerBlock(seed);
    expectValid(candles);
    expect(candles[answer.brokenIndex].close).toBeGreaterThan(answer.zone.top);
    const between = candles.slice(answer.obIndex + 1, answer.brokenIndex);
    expect(between.some((c) => c.low < answer.zone.bottom)).toBe(true);
    expect(between.every((c) => c.close <= answer.zone.top)).toBe(true);
  });

  it("builds both kinds of structure break", () => {
    for (const kind of ["BOS", "CHoCH"] as const) {
      const { candles, answer } = structureBreak(seed, kind);
      expectValid(candles);
      expect(detectBreaks(candles)).toContainEqual(expect.objectContaining({ index: answer.index, kind, level: answer.level }));
    }
  });

  it("builds an optimal trade entry retracement into the 62% to 79% zone", () => {
    const { candles, answer } = ote(seed);
    expectValid(candles);
    const range = answer.swingHigh - answer.swingLow;
    expect(answer.zone.top).toBeCloseTo(answer.swingHigh - 0.62 * range, 6);
    expect(answer.zone.bottom).toBeCloseTo(answer.swingHigh - 0.79 * range, 6);
    const peak = candles.findIndex((c) => c.high === answer.swingHigh);
    expect(candles.slice(peak + 1).some((c) => c.low <= answer.zone.top && c.low >= answer.zone.bottom)).toBe(true);
  });

  it("builds supply and demand zones from a tight base and a strong departure", () => {
    for (const kind of ["demand", "supply"] as const) {
      const { candles, answer } = supplyDemand(seed, kind);
      expectValid(candles);
      const base = candles.slice(answer.baseStart, answer.departureIndex);
      expect(base.every((c) => c.low >= answer.zone.bottom && c.high <= answer.zone.top)).toBe(true);
      expect(volumeConfirms(candles, answer.departureIndex)).toBe(true);
    }
  });

  it("builds support that holds on every touch", () => {
    const { candles, answer } = supportResistance(seed);
    expectValid(candles);
    for (const index of answer.touches) expect(Math.abs(candles[index].low - answer.level) / answer.level).toBeLessThan(0.001);
    expect(candles.every((c) => c.close >= answer.level)).toBe(true);
  });

  it("builds a breakout and retest", () => {
    const { candles, answer } = breakoutRetest(seed);
    expectValid(candles);
    expect(candles.slice(0, answer.breakIndex).every((c) => c.close <= answer.level)).toBe(true);
    expect(candles[answer.breakIndex].close).toBeGreaterThan(answer.level);
    const retest = candles[answer.retestIndex];
    expect(Math.abs(retest.low - answer.level) / answer.level).toBeLessThan(0.002);
    expect(retest.close).toBeGreaterThanOrEqual(answer.level);
  });

  it("builds the three phases of Power of 3", () => {
    const { candles, answer } = powerOf3(seed);
    expectValid(candles);
    const [start, end] = answer.accumulation;
    const range = candles.slice(start, end + 1);
    const high = Math.max(...range.map((c) => c.high));
    const low = Math.min(...range.map((c) => c.low));
    expect(candles[answer.manipulationIndex].low).toBeLessThan(low);
    const firstCloseAbove = candles.findIndex((c, i) => i > answer.manipulationIndex && c.close > high);
    expect(answer.distributionStart).toBe(firstCloseAbove);
  });

  it("builds a candle range sweep that closes back inside", () => {
    const { candles, answer } = candleRange(seed);
    expectValid(candles);
    const range = candles[answer.rangeIndex];
    const sweep = candles[answer.sweepIndex];
    expect(sweep.low).toBeLessThan(range.low);
    expect(sweep.close).toBeGreaterThan(range.low);
    expect(sweep.close).toBeLessThan(range.high);
  });

  it("builds a Silver Bullet gap inside the 10am to 11am New York window", () => {
    const { candles, answer } = silverBullet(seed);
    expectValid(candles);
    expect(findFVGs(candles)).toContainEqual(answer.fvg);
    for (const index of answer.fvg.indexes) expect(newYorkHour(candles[index].time)).toBe(10);
    expect(newYorkHour(answer.windowStart)).toBe(10);
    expect(newYorkHour(answer.windowEnd)).toBe(11);
  });

  it("leaves exactly one gap to find, so a correct-looking pick is never marked wrong", () => {
    expect(findFVGs(bullishFVG(seed).candles)).toEqual([bullishFVG(seed).answer.fvg]);
    expect(findFVGs(bearishFVG(seed).candles)).toEqual([bearishFVG(seed).answer.fvg]);
    expect(findFVGs(silverBullet(seed).candles)).toEqual([silverBullet(seed).answer.fvg]);
    const inverse = inverseFVG(seed);
    expect(findFVGs(inverse.candles).filter((g) => g.direction === "bearish")).toEqual([inverse.answer.fvg]);
  });

  it("gives every pattern higher timeframes built from the same prices", () => {
    const { candles, timeframes } = bullishFVG(seed);
    expect(timeframes.map((t) => t.label)).toEqual(["Daily", "1H", "5m"]);
    expect(timeframes[2].candles).toEqual(candles);
    expect(timeframes[1].candles.length).toBeGreaterThan(10);
    expect(timeframes[0].candles.length).toBeGreaterThan(5);
    expect(timeframes[1].candles.at(-1)!.close).toBe(candles.at(-1)!.close);
  });
});

it("repeats exactly for the same seed", () => {
  expect(bullishFVG(4)).toEqual(bullishFVG(4));
  expect(bullishFVG(4).candles).not.toEqual(bullishFVG(5).candles);
});
