import { volumeConfirms } from "@/lib/charts/detectors";
import type { Built } from "@/lib/charts/patterns";
import type { Zone } from "@/lib/charts/types";
import type { ChartSpec, Lesson, LessonBlock } from "./types";

type Block<T extends LessonBlock["type"]> = Extract<LessonBlock, { type: T }>;

/** All three timeframes, opening on the 5-minute chart where the pattern is. */
export const chartOf = (built: Built<unknown>, initial = "5m"): ChartSpec => ({ timeframes: built.timeframes, initial });

/** Just the 5-minute chart, for exercises where switching timeframes would distract. */
export const chart5m = (built: Built<unknown>): ChartSpec => ({ timeframes: [{ label: "5m", candles: built.candles }], initial: "5m" });

export const BIAS_OPTIONS = ["Rising: higher highs and higher lows", "Falling: lower highs and lower lows", "Sideways: no clear direction"];

export const text = (body: string): Block<"text"> => ({ type: "text", body });
export const pansy = (body: string): Block<"pansy"> => ({ type: "pansy", body });

export function find(built: Built<unknown>, prompt: string, answer: number[], explanation: string): Block<"chartFind"> {
  return { type: "chartFind", prompt, chart: chart5m(built), answer, explanation };
}

export function zone(built: Built<unknown>, prompt: string, answer: Zone, explanation: string): Block<"chartZone"> {
  return { type: "chartZone", prompt, chart: chart5m(built), answer, explanation };
}

/** A volume question whose answer comes from the detector, so it can never disagree with the chart. */
export function volume(built: Built<unknown>, index: number, prompt: string, ifStrong: string, ifWeak: string): Block<"chartVolume"> {
  const confirms = volumeConfirms(built.candles, index);
  return { type: "chartVolume", prompt, chart: chart5m(built), index, confirms, explanation: confirms ? ifStrong : ifWeak };
}

/** "What's the bias on the 1H?" with the right answer read from the chart itself. */
export function bias(built: Built<unknown>, prompt: string, ifRising: string, ifFalling: string): Block<"chartTimeframe"> {
  const hour = built.timeframes.find((t) => t.label === "1H")!.candles;
  const rising = hour[hour.length - 1].close > hour[0].close;
  return {
    type: "chartTimeframe",
    prompt,
    chart: chartOf(built),
    expectTimeframe: "1H",
    q: "What is the bias on the 1H chart?",
    options: BIAS_OPTIONS,
    correct: rising ? 0 : 1,
    explanation: rising ? ifRising : ifFalling,
  };
}

export function plan(
  built: Built<unknown>,
  direction: "long" | "short",
  entryZone: Zone,
  invalidation: number,
  prompt: string,
  explanation: string,
): Block<"chartPlan"> {
  return { type: "chartPlan", prompt, chart: chart5m(built), direction, entryZone, invalidation, minRR: 1.5, explanation };
}

export function scenario(prompt: string, good: [string, string], bad: [string, string]): Block<"scenario"> {
  return {
    type: "scenario",
    prompt,
    choices: [
      { label: bad[0], outcome: bad[1], good: false },
      { label: good[0], outcome: good[1], good: true },
    ],
  };
}

interface SetupParts {
  slug: string;
  moduleId: string;
  title: string;
  subtitle: string;
  minutes: number;
  intro: string[];
  spot: Block<"chartFind"> | Block<"chartZone">;
  context: Block<"scenario">;
  volume: Block<"chartVolume">;
  timeframe: Block<"chartTimeframe">;
  plan: Block<"chartPlan">;
  skip: string;
  practiceHint: string;
  pansyNote?: string;
}

/** Every setup follows the same six steps: spot it, context, volume, timeframes, plan, then practise. */
export function setupLesson(parts: SetupParts): Lesson {
  return {
    slug: parts.slug,
    moduleId: parts.moduleId,
    title: parts.title,
    subtitle: parts.subtitle,
    minutes: parts.minutes,
    kind: "setup",
    practiceHint: parts.practiceHint,
    blocks: [
      ...parts.intro.map(text),
      ...(parts.pansyNote ? [pansy(parts.pansyNote)] : []),
      parts.spot,
      parts.context,
      parts.volume,
      parts.timeframe,
      parts.plan,
      text(`When to skip it\n\n${parts.skip}`),
    ],
  };
}

/** Moves a price a small step past a level, for placing an invalidation just beyond a zone. */
export const beyond = (price: number, direction: "below" | "above", amount = 0.002) =>
  Math.round(price * (direction === "below" ? 1 - amount : 1 + amount) * 100) / 100;
