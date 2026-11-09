import { volumeConfirms } from "@/lib/charts/detectors";
import type { Built } from "@/lib/charts/patterns";
import type { Zone } from "@/lib/charts/types";
import type { SetupType, Timeframe } from "@/config/setups";
import type { BaseBlock, ChartSpec, Lesson, LessonBlock, RawLesson, Stage, StrategyStep } from "./types";

type Block<T extends BaseBlock["type"]> = Extract<BaseBlock, { type: T }>;

/** All three timeframes, opening on the 5-minute chart where the pattern is. */
export const chartOf = (built: Built<unknown>, initial = "5m"): ChartSpec => ({ timeframes: built.timeframes, initial });

/** Just the 5-minute chart, for exercises where switching timeframes would distract. */
export const chart5m = (built: Built<unknown>): ChartSpec => ({ timeframes: [{ label: "5m", candles: built.candles }], initial: "5m" });

export const BIAS_OPTIONS = ["Rising: higher highs and higher lows", "Falling: lower highs and lower lows", "Sideways: no clear direction"];

export const text = (body: string): Block<"text"> => ({ type: "text", body });
export const pansy = (body: string): Block<"pansy"> => ({ type: "pansy", body });

export function find(built: Built<unknown>, prompt: string, answer: number[], explanation: string, bands?: ChartSpec["bands"]): Block<"chartFind"> {
  return { type: "chartFind", prompt, chart: { ...chart5m(built), ...(bands ? { bands } : {}) }, answer, explanation };
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

/** A chart with the answer already drawn, shown before she is asked to find one herself. */
export function example(built: Built<unknown>, highlight: Block<"workedExample">["highlight"], caption: string): Block<"workedExample"> {
  return { type: "workedExample", chart: chart5m(built), highlight, caption };
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
  /** The same setup on a fresh chart, already marked. */
  example: Block<"workedExample">;
  /** What Practice opens with after the lesson. */
  practice: { setup: SetupType; timeframe: Timeframe };
}

const round2 = (value: number) => Math.round(value * 100) / 100;
const staged = (stage: Stage) => (block: BaseBlock): LessonBlock => ({ ...block, stage });

/** The setup playbook, built from the parts each lesson already has, so no step can disagree with its test. */
export function strategyFrom(parts: SetupParts): Block<"strategy"> {
  const { plan: rules } = parts;
  const long = rules.direction === "long";
  const entry = round2((rules.entryZone.top + rules.entryZone.bottom) / 2);
  const stop = beyond(rules.invalidation, long ? "below" : "above", 0.001);
  const risk = Math.abs(entry - stop);
  const target = round2(long ? entry + 2 * risk : entry - 2 * risk);
  const goodContext = parts.context.choices.find((choice) => choice.good)?.outcome ?? "";
  const steps: StrategyStep[] = [
    { label: "Spot it", body: parts.spot.explanation, focus: "pattern" },
    { label: "Check the context", body: goodContext, focus: "context" },
    { label: "Confirm with volume", body: parts.volume.explanation, focus: "volume" },
    { label: "Check the higher timeframe", body: parts.timeframe.explanation, focus: "timeframe" },
    { label: "Entry", body: "Enter inside the zone, not before price reaches it.", focus: "entry" },
    { label: "Stop", body: "Place your stop just beyond the level that proves the idea wrong.", focus: "stop" },
    { label: "Target", body: "Aim for at least 1.5 times your risk. This example uses 2 to 1.", focus: "target" },
    { label: "When to skip it", body: parts.skip, focus: "skip" },
  ];
  return {
    type: "strategy",
    title: `How to trade ${parts.title}`,
    chart: rules.chart,
    plan: { direction: rules.direction, entry, stop, target },
    steps,
  };
}

/**
 * Concept lessons: the reading up to the first question is the lesson. From the first question on,
 * everything is the test, including short explanations between questions, so the lesson reads Lesson then Test.
 */
export function stageConcept(lesson: RawLesson): Lesson {
  const reading = new Set<BaseBlock["type"]>(["text", "pansy", "workedExample"]);
  const firstQuestion = lesson.blocks.findIndex((block) => !reading.has(block.type));
  return {
    ...lesson,
    blocks: lesson.blocks.map((block, index) => staged(firstQuestion >= 0 && index >= firstQuestion ? "test" : "lesson")(block)),
  };
}

/** Every setup runs Lesson (with a worked example), Strategy, Test (spot, context, volume, timeframe, plan) and Practice. */
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
      ...[...parts.intro.map(text), ...(parts.pansyNote ? [pansy(parts.pansyNote)] : []), parts.example].map(staged("lesson")),
      staged("strategy")(strategyFrom(parts)),
      ...[parts.spot, parts.context, parts.volume, parts.timeframe, parts.plan].map(staged("test")),
      staged("practice")({
        type: "practiceCta",
        setup: parts.practice.setup,
        timeframe: parts.practice.timeframe,
        body: `Practise ${parts.title} on a stock, on the ${parts.practice.timeframe} chart.`,
      }),
    ],
  };
}

/** Moves a price a small step past a level, for placing an invalidation just beyond a zone. */
export const beyond = (price: number, direction: "below" | "above", amount = 0.002) =>
  Math.round(price * (direction === "below" ? 1 - amount : 1 + amount) * 100) / 100;
