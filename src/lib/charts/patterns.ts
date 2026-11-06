// Seeded, repeatable example charts for lessons. Each pattern is a hand-shaped template
// around a price of 100. A seed only changes the overall price level and the volume
// noise, and scaling every price by the same factor never changes which pattern is
// present, so every answer stays correct. The tests check each builder with the detectors.

import { aggregateCandles } from "./aggregate";
import type { Candle, FVG, Zone } from "./types";

type Row = [open: number, high: number, low: number, close: number, volume?: number];

export interface Timeframe {
  label: string;
  candles: Candle[];
}

export interface Built<A> {
  candles: Candle[];
  answer: A;
  /** Daily, 1H and 5m views of the same prices, ending with this pattern on the 5m chart. */
  timeframes: Timeframe[];
}

/** Wednesday 4 November 2026, 9:30am in New York. */
const SESSION_START = Date.UTC(2026, 10, 4, 14, 30) / 1000;
const FIVE_MINUTES = 300;

function random(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 100) / 100;

// Small alternating bodies inside an identical high and low, so the lead-in has no swings or gaps.
const QUIET: Row[] = Array.from({ length: 10 }, (_, i) => (i % 2 === 0 ? [99.92, 100.2, 99.8, 100.08, 100] : [100.08, 100.2, 99.8, 99.92, 100]));

/** Flips a template upside down around 100, turning a bullish pattern into its bearish twin. */
function mirror(rows: Row[]): Row[] {
  return rows.map(([open, high, low, close, volume]) => [200 - open, 200 - low, 200 - high, 200 - close, volume]);
}

function toCandles(rows: Row[], rand: () => number, factor: number): Candle[] {
  return rows.map(([open, high, low, close, volume = 100], index) => ({
    time: SESSION_START + index * FIVE_MINUTES,
    open: round(open * factor),
    high: round(high * factor),
    low: round(low * factor),
    close: round(close * factor),
    volume: Math.round(volume * (0.9 + rand() * 0.2) * 1000),
  }));
}

/** A drifting path of earlier 5-minute candles that ends exactly where the pattern begins. */
function history(rand: () => number, endPrice: number, firstTime: number, count = 1500): Candle[] {
  const raw: Candle[] = [];
  let price = 100;
  for (let i = 0; i < count; i += 1) {
    const open = price;
    const close = open * (1 + 0.00025 + (rand() - 0.5) * 0.004);
    const high = Math.max(open, close) * (1 + rand() * 0.0015);
    const low = Math.min(open, close) * (1 - rand() * 0.0015);
    raw.push({ time: firstTime - (count - i) * FIVE_MINUTES, open, high, low, close, volume: Math.round((0.8 + rand() * 0.4) * 100000) });
    price = close;
  }
  const scale = endPrice / price;
  return raw.map((c) => ({ ...c, open: round(c.open * scale), high: round(c.high * scale), low: round(c.low * scale), close: round(c.close * scale) }));
}

function build<A>(seed: number, rows: Row[], answerFor: (candles: Candle[]) => A): Built<A> {
  const rand = random(seed);
  const factor = 0.6 + rand();
  const candles = toCandles(rows, rand, factor);
  const all = [...history(rand, candles[0].open, candles[0].time), ...candles];
  return {
    candles,
    answer: answerFor(candles),
    timeframes: [
      { label: "Daily", candles: aggregateCandles(all, 78).slice(-20) },
      { label: "1H", candles: aggregateCandles(all, 12).slice(-60) },
      { label: "5m", candles },
    ],
  };
}

const zoneOf = (c: Candle): Zone => ({ top: c.high, bottom: c.low });

// ── Fair value gaps ──────────────────────────────────────────────────────────

const BULLISH_FVG: Row[] = [
  ...QUIET,
  [100, 100.6, 99.8, 100.4, 110],
  // Its low dips under the lead-in highs, so the only gap is the one between candles 10 and 12.
  [100.4, 103.4, 100.1, 103.2, 380],
  [103.2, 104.2, 101.6, 103.8, 160],
  [103.8, 104.6, 103.0, 104.3, 120],
  [104.3, 104.5, 102.6, 102.8, 110],
  [102.8, 103.0, 101.4, 101.7, 120],
  [101.7, 103.2, 101.5, 103.0, 150],
  [103.0, 105.2, 102.9, 105.0, 200],
];

function gapAt(candles: Candle[], first: number, direction: FVG["direction"]): FVG {
  const [a, , c] = [candles[first], candles[first + 1], candles[first + 2]];
  return {
    indexes: [first, first + 1, first + 2],
    direction,
    zone: direction === "bullish" ? { bottom: a.high, top: c.low } : { top: a.low, bottom: c.high },
  };
}

export const bullishFVG = (seed: number) => build(seed, BULLISH_FVG, (c) => ({ fvg: gapAt(c, 10, "bullish") }));
export const bearishFVG = (seed: number) => build(seed, mirror(BULLISH_FVG), (c) => ({ fvg: gapAt(c, 10, "bearish") }));

const INVERSE_FVG: Row[] = [
  ...mirror([...QUIET, ...BULLISH_FVG.slice(10, 13)]),
  [96.2, 97.4, 95.8, 97.2, 140],
  [97.2, 98.9, 97.0, 98.7, 180],
  [98.7, 100.8, 98.5, 100.6, 320],
  [100.6, 101.0, 99.6, 99.9, 140],
  [99.9, 101.6, 99.7, 101.4, 170],
];

export const inverseFVG = (seed: number) => build(seed, INVERSE_FVG, (c) => ({ fvg: gapAt(c, 10, "bearish"), flipIndex: 15 }));

// ── Liquidity ────────────────────────────────────────────────────────────────

const SWEEP_LOW: Row[] = [
  ...QUIET,
  [100, 100.3, 99.0, 99.4, 110],
  [99.4, 100.2, 99.3, 100.0, 100],
  [100.0, 100.4, 99.6, 99.8, 100],
  [99.8, 100.0, 99.0, 99.2, 110],
  [99.2, 99.6, 98.5, 99.5, 260],
  [99.5, 100.6, 99.4, 100.5, 180],
  [100.5, 101.2, 100.3, 101.0, 150],
];

export const liquiditySweep = (seed: number, side: "low" | "high") =>
  build(seed, side === "low" ? SWEEP_LOW : mirror(SWEEP_LOW), (c) => ({ sweepIndex: 14, level: side === "low" ? c[10].low : c[10].high }));

// ── Order blocks and breakers ────────────────────────────────────────────────

const ORDER_BLOCK: Row[] = [
  ...QUIET,
  [100, 100.9, 99.9, 100.7, 100],
  [100.7, 100.8, 100.1, 100.3, 100],
  [100.3, 100.5, 99.6, 99.8, 100],
  [99.8, 100.0, 99.2, 99.4, 120],
  [99.4, 102.0, 99.3, 101.8, 400],
  [101.8, 102.6, 101.5, 102.4, 200],
  [102.4, 102.5, 100.4, 100.6, 140],
  [100.6, 100.9, 99.9, 100.7, 150],
  [100.7, 102.8, 100.5, 102.6, 220],
];

export const orderBlock = (seed: number, direction: "bullish" | "bearish") =>
  build(seed, direction === "bullish" ? ORDER_BLOCK : mirror(ORDER_BLOCK), (c) => ({ obIndex: 13, zone: zoneOf(c[13]), displacementIndex: 14 }));

const BREAKER: Row[] = [
  ...QUIET,
  [100, 100.8, 99.9, 100.6, 110],
  [100.6, 100.7, 99.0, 99.2, 200],
  [99.2, 99.4, 98.2, 98.5, 180],
  [98.5, 99.6, 98.4, 99.4, 150],
  [99.4, 101.3, 99.2, 101.1, 320],
  [101.1, 101.4, 100.5, 100.7, 140],
  [100.7, 102.2, 100.6, 102.0, 190],
];

export const breakerBlock = (seed: number) => build(seed, BREAKER, (c) => ({ obIndex: 10, zone: zoneOf(c[10]), brokenIndex: 14 }));

// ── Structure ────────────────────────────────────────────────────────────────

const STRUCTURE: Row[] = [
  [90, 100, 80, 95, 100],
  [95, 110, 90, 105, 110],
  [125, 140, 120, 130, 150],
  [115, 120, 100, 110, 120],
  [100, 110, 95, 105, 100],
  [110, 130, 105, 125, 140],
  [130, 155, 130, 150, 260],
  [130, 140, 110, 115, 160],
  [110, 120, 90, 92, 240],
  [92, 96, 90.5, 95, 120],
  [95, 98, 93, 94, 100],
].map(([o, h, l, c, v]) => [o * 0.7 + 30, h * 0.7 + 30, l * 0.7 + 30, c * 0.7 + 30, v] as Row);

export const structureBreak = (seed: number, kind: "BOS" | "CHoCH") =>
  build(seed, STRUCTURE, (c) => (kind === "BOS" ? { index: 6, level: c[2].high } : { index: 8, level: c[4].low }));

// ── Premium, discount, supply and demand ─────────────────────────────────────

const OTE: Row[] = [
  ...QUIET,
  [100, 100.5, 99.8, 100.4, 120],
  [100.4, 101.8, 100.3, 101.6, 180],
  [101.6, 103.0, 101.4, 102.8, 200],
  [102.8, 104.2, 102.6, 104.0, 210],
  [104.0, 105.0, 103.8, 104.6, 160],
  [104.6, 104.7, 103.2, 103.4, 120],
  [103.4, 103.6, 102.2, 102.4, 110],
  [102.4, 102.6, 101.3, 101.6, 100],
  [101.6, 103.4, 101.5, 103.2, 170],
];

export const ote = (seed: number) =>
  build(seed, OTE, (c) => {
    const swingLow = Math.min(...c.slice(10, 15).map((x) => x.low));
    const swingHigh = c[14].high;
    const range = swingHigh - swingLow;
    return { swingLow, swingHigh, zone: { top: swingHigh - 0.62 * range, bottom: swingHigh - 0.79 * range } };
  });

const DEMAND: Row[] = [
  ...QUIET,
  [99.9, 100.1, 99.7, 99.8, 90],
  [99.8, 100.0, 99.6, 99.9, 90],
  [99.9, 100.05, 99.7, 100.0, 90],
  [100.0, 102.4, 99.9, 102.2, 380],
  [102.2, 103.0, 102.0, 102.8, 180],
  [102.8, 102.9, 100.8, 101.0, 130],
  [101.0, 101.2, 99.9, 100.4, 120],
  [100.4, 102.6, 100.3, 102.5, 200],
];

export const supplyDemand = (seed: number, kind: "demand" | "supply") =>
  build(seed, kind === "demand" ? DEMAND : mirror(DEMAND), (c) => {
    const base = c.slice(10, 13);
    return { baseStart: 10, departureIndex: 13, zone: { top: Math.max(...base.map((x) => x.high)), bottom: Math.min(...base.map((x) => x.low)) } };
  });

const SUPPORT: Row[] = [
  [102, 102.5, 101.2, 101.4, 100],
  [101.4, 101.6, 100.0, 100.6, 140],
  [100.6, 102.0, 100.5, 101.8, 120],
  [101.8, 102.4, 101.0, 101.2, 100],
  [101.2, 101.4, 100.02, 100.3, 150],
  [100.3, 101.9, 100.2, 101.7, 120],
  [101.7, 102.1, 100.9, 101.0, 100],
  [101.0, 101.2, 99.98, 100.4, 160],
  [100.4, 102.2, 100.3, 102.0, 140],
];

export const supportResistance = (seed: number) => build(seed, SUPPORT, (c) => ({ level: round(c[1].low), touches: [1, 4, 7] }));

const BREAKOUT: Row[] = [
  ...QUIET,
  [100, 101.95, 99.9, 101.6, 130],
  [101.6, 101.8, 100.8, 101.0, 110],
  [101.0, 102.0, 100.9, 101.7, 130],
  [101.7, 101.9, 101.0, 101.3, 100],
  [101.3, 103.0, 101.2, 102.8, 350],
  [102.8, 103.1, 102.4, 102.6, 140],
  [102.6, 102.7, 101.9, 102.3, 120],
  [102.3, 103.8, 102.2, 103.6, 200],
];

export const breakoutRetest = (seed: number) => build(seed, BREAKOUT, (c) => ({ level: c[12].high, breakIndex: 14, retestIndex: 16 }));

// ── Models ───────────────────────────────────────────────────────────────────

const POWER_OF_3: Row[] = [
  ...QUIET,
  [100, 100.1, 99.2, 99.4, 180],
  [99.4, 99.9, 99.1, 99.8, 150],
  [99.8, 101.0, 99.7, 100.9, 300],
  [100.9, 101.8, 100.7, 101.6, 200],
  [101.6, 102.4, 101.4, 102.2, 180],
];

export const powerOf3 = (seed: number) =>
  build(seed, POWER_OF_3, () => ({ accumulation: [0, 9] as [number, number], manipulationIndex: 10, distributionStart: 12 }));

const CANDLE_RANGE: Row[] = [
  ...QUIET,
  [100, 101.5, 99.0, 100.8, 220],
  [100.8, 101.0, 98.6, 99.6, 240],
  [99.6, 100.9, 99.5, 100.7, 160],
  [100.7, 101.7, 100.6, 101.6, 180],
];

export const candleRange = (seed: number) => build(seed, CANDLE_RANGE, () => ({ rangeIndex: 10, sweepIndex: 11 }));

const SILVER_BULLET: Row[] = [
  [100, 100.3, 99.8, 100.1],
  [100.1, 100.4, 99.9, 100.2],
  [100.2, 100.3, 99.7, 99.9],
  [99.9, 100.2, 99.6, 100.0],
  [100.0, 100.4, 99.9, 100.3],
  [100.3, 100.5, 100.0, 100.1],
  [100.1, 100.3, 99.8, 99.9],
  [99.9, 100.2, 99.7, 100.0],
  [100.0, 100.3, 99.9, 100.2],
  [100.2, 100.6, 100.0, 100.4, 110],
  [100.4, 102.2, 100.3, 102.0, 380],
  [102.0, 102.8, 101.2, 102.6, 160],
  [102.6, 103.0, 102.2, 102.4, 120],
  [102.4, 102.5, 101.4, 101.6, 110],
  [101.6, 102.9, 101.5, 102.8, 150],
  [102.8, 103.6, 102.4, 103.4, 170],
  [103.4, 103.8, 102.8, 103.2, 120],
  [103.2, 103.5, 102.9, 103.4, 100],
  [103.4, 104.0, 103.3, 103.9, 140],
  [103.9, 104.1, 103.5, 103.7, 100],
  [103.7, 104.3, 103.6, 104.2, 120],
  [104.2, 104.4, 103.9, 104.0, 100],
  [104.0, 104.6, 103.9, 104.5, 130],
  [104.5, 104.7, 104.2, 104.4, 100],
];

/** The 10am to 11am New York window. Candle 6 starts at 10:00 and candle 18 at 11:00. */
export const silverBullet = (seed: number) =>
  build(seed, SILVER_BULLET, (c) => ({ windowStart: c[6].time, windowEnd: c[18].time, fvg: gapAt(c, 9, "bullish") }));
