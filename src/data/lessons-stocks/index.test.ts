import { describe, expect, it } from "vitest";
import { findFVGs, volumeConfirms } from "@/lib/charts/detectors";
import { isInteractive } from "@/lib/lessons/engine";
import type { LessonBlock } from "./types";
import { ALL_LESSONS, MODULES, firstIncomplete, getLesson, hasFinishedCourse, nextLesson } from "./index";

const blocksOf = <T extends LessonBlock["type"]>(type: T) =>
  ALL_LESSONS.flatMap((lesson) => lesson.blocks.filter((b): b is Extract<LessonBlock, { type: T }> => b.type === type).map((block) => ({ lesson, block })));

const candlesFor = (chart: { timeframes: { label: string; candles: { high: number; low: number; close: number; volume: number }[] }[] }, label: string) =>
  chart.timeframes.find((t) => t.label === label)!.candles;

describe("stock curriculum", () => {
  it("has seven modules in the spec's order", () => {
    expect(MODULES.map((m) => m.id)).toEqual(["foundations", "structure", "liquidity", "imbalances", "institutional", "models", "execution"]);
  });

  it("has 26 lessons, starting with how to read a stock chart", () => {
    expect(ALL_LESSONS).toHaveLength(26);
    expect(ALL_LESSONS[0].slug).toBe("reading-a-stock-chart");
  });

  it("gives every lesson a unique slug, a module and a practice hint", () => {
    const slugs = ALL_LESSONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const lesson of ALL_LESSONS) {
      expect(slugs.filter((s) => s === lesson.slug)).toHaveLength(1);
      expect(MODULES.map((m) => m.id)).toContain(lesson.moduleId);
      expect(lesson.practiceHint.length).toBeGreaterThan(0);
      expect(lesson.blocks.some(isInteractive), lesson.slug).toBe(true);
    }
  });

  it("teaches every setup with the six-step template", () => {
    const setups = ALL_LESSONS.filter((l) => l.kind === "setup");
    expect(setups.length).toBeGreaterThanOrEqual(14);
    for (const lesson of setups) {
      const order = lesson.blocks.map((b) => b.type);
      const spot = order.findIndex((t) => t === "chartFind" || t === "chartZone");
      const context = order.indexOf("scenario", spot);
      const volume = order.indexOf("chartVolume", context);
      const timeframe = order.indexOf("chartTimeframe", volume);
      const plan = order.indexOf("chartPlan", timeframe);
      expect([spot, context, volume, timeframe, plan].every((i) => i >= 0), lesson.slug).toBe(true);
      expect(JSON.stringify(lesson.blocks), lesson.slug).toContain("When to skip it");
    }
  });

  it("covers every setup named in the spec", () => {
    for (const slug of [
      "fair-value-gaps",
      "inverse-fvg",
      "order-blocks",
      "breaker-blocks",
      "liquidity-sweeps",
      "break-of-structure",
      "change-of-character",
      "optimal-trade-entry",
      "silver-bullet",
      "supply-and-demand",
      "support-and-resistance",
      "breakout-and-retest",
      "candle-range-theory",
      "power-of-three",
    ]) {
      expect(getLesson(slug)?.kind, slug).toBe("setup");
    }
  });

  it("stays on stocks, with no trade calls and no unexplained terms", () => {
    const banned = /\b(gold|forex|xauusd|cfds?|ounces?|lots?|krm|signals?|buy now|sell now|guaranteed)\b/i;
    for (const lesson of ALL_LESSONS) {
      const text = JSON.stringify({ ...lesson, blocks: lesson.blocks.map((b) => ({ ...b, chart: undefined })) });
      expect(text.match(banned)?.[0], lesson.slug).toBeUndefined();
    }
  });

  it("only asks for candles that exist on the chart", () => {
    for (const { lesson, block } of blocksOf("chartFind")) {
      const candles = candlesFor(block.chart, block.chart.initial);
      expect(block.answer.length, lesson.slug).toBeGreaterThan(0);
      for (const index of block.answer) expect(index, lesson.slug).toBeLessThan(candles.length);
    }
  });

  it("marks the real gap in the fair value gap lesson", () => {
    const block = getLesson("fair-value-gaps")!.blocks.find((b) => b.type === "chartFind") as Extract<LessonBlock, { type: "chartFind" }>;
    const gaps = findFVGs(candlesFor(block.chart, block.chart.initial) as never).map((g) => g.indexes.join(","));
    expect(gaps).toContain(block.answer.join(","));
  });

  it("shades the Silver Bullet window on the chart, so the question can be answered", () => {
    const block = getLesson("silver-bullet")!.blocks.find((b) => b.type === "chartFind") as Extract<LessonBlock, { type: "chartFind" }>;
    const band = block.chart.bands?.[0];
    expect(band?.label).toBe("10:00 to 11:00 New York");
    for (const index of block.answer) {
      expect(index).toBeGreaterThanOrEqual(band!.fromIndex);
      expect(index).toBeLessThanOrEqual(band!.toIndex);
    }
  });

  it("asks zone questions inside the visible price range", () => {
    for (const { lesson, block } of blocksOf("chartZone")) {
      const candles = candlesFor(block.chart, block.chart.initial);
      const low = Math.min(...candles.map((c) => c.low));
      const high = Math.max(...candles.map((c) => c.high));
      expect(block.answer.bottom, lesson.slug).toBeGreaterThanOrEqual(low);
      expect(block.answer.top, lesson.slug).toBeLessThanOrEqual(high);
      expect(block.answer.top, lesson.slug).toBeGreaterThan(block.answer.bottom);
    }
  });

  it("gives volume answers the detector agrees with", () => {
    for (const { lesson, block } of blocksOf("chartVolume")) {
      expect(volumeConfirms(candlesFor(block.chart, block.chart.initial) as never, block.index), lesson.slug).toBe(block.confirms);
    }
  });

  it("asks about a timeframe the chart has, with a bias answer that matches the chart", () => {
    for (const { lesson, block } of blocksOf("chartTimeframe")) {
      const candles = candlesFor(block.chart, block.expectTimeframe);
      expect(candles.length, lesson.slug).toBeGreaterThan(0);
      if (block.options[0].startsWith("Rising")) {
        const rising = candles[candles.length - 1].close > candles[0].close;
        expect(block.correct, lesson.slug).toBe(rising ? 0 : 1);
      }
    }
  });

  it("only sets trade plans that can be completed on the chart", () => {
    for (const { lesson, block } of blocksOf("chartPlan")) {
      const candles = candlesFor(block.chart, block.chart.initial);
      const low = Math.min(...candles.map((c) => c.low));
      const high = Math.max(...candles.map((c) => c.high));
      const entry = (block.entryZone.top + block.entryZone.bottom) / 2;
      const long = block.direction === "long";
      expect(long ? block.invalidation < block.entryZone.bottom : block.invalidation > block.entryZone.top, lesson.slug).toBe(true);
      const stop = long ? block.invalidation - (entry - block.invalidation) * 0.05 : block.invalidation + (block.invalidation - entry) * 0.05;
      const target = long ? entry + (entry - stop) * block.minRR : entry - (stop - entry) * block.minRR;
      expect(long ? target <= high : target >= low, `${lesson.slug} target ${target.toFixed(2)} vs ${long ? high : low}`).toBe(true);
      expect(long ? stop >= low * 0.97 : stop <= high * 1.03, lesson.slug).toBe(true);
    }
  });

  it("walks through lessons in order and knows when the course is finished", () => {
    expect(nextLesson(ALL_LESSONS[0].slug)?.slug).toBe(ALL_LESSONS[1].slug);
    expect(nextLesson(ALL_LESSONS[ALL_LESSONS.length - 1].slug)).toBeNull();
    const every = ALL_LESSONS.map((l) => l.slug);
    expect(firstIncomplete([])?.slug).toBe("reading-a-stock-chart");
    expect(hasFinishedCourse(every)).toBe(true);
    expect(hasFinishedCourse([...every.slice(1), "what-is-gold-trading"])).toBe(false);
  });
});
