import type { Candle as ChartCandle, Zone } from "@/lib/charts/types";

/** The simple candle shape used by the older chartTap block, which goes once the gold lessons are retired. */
export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

export type SliderOutcomeKey = "leverage" | "lotSize" | "riskPercent";

/** The timeframes a lesson chart offers, and the one it opens on. */
export interface ChartSpec {
  timeframes: { label: string; candles: ChartCandle[] }[];
  initial: string;
}

export type LessonBlock =
  | { type: "text"; body: string }
  | { type: "pansy"; body: string }
  | { type: "quiz"; q: string; options: string[]; correct: number; explanation: string }
  /** `steps` are written in the correct order; the player deals them out shuffled. */
  | { type: "order"; prompt: string; steps: string[]; explanation: string }
  | { type: "scenario"; prompt: string; choices: { label: string; outcome: string; good: boolean }[] }
  | { type: "chartFind"; prompt: string; chart: ChartSpec; answer: number[]; explanation: string }
  | { type: "chartZone"; prompt: string; chart: ChartSpec; answer: Zone; explanation: string }
  | { type: "chartVolume"; prompt: string; chart: ChartSpec; index: number; confirms: boolean; explanation: string }
  | {
      type: "chartTimeframe";
      prompt: string;
      chart: ChartSpec;
      expectTimeframe: string;
      q: string;
      options: string[];
      correct: number;
      explanation: string;
    }
  | {
      type: "chartPlan";
      prompt: string;
      chart: ChartSpec;
      direction: "long" | "short";
      entryZone: Zone;
      invalidation: number;
      minRR: number;
      explanation: string;
    }
  // Older blocks, kept only until the gold lessons are removed.
  | { type: "chartTap"; prompt: string; candles: Candle[]; correctIndexes: number[]; explanation: string }
  | {
      type: "slider";
      prompt: string;
      min: number;
      max: number;
      step: number;
      initial: number;
      unit: string;
      outcomeKey: SliderOutcomeKey;
      note: string;
    };

export interface Lesson {
  slug: string;
  moduleId: string;
  title: string;
  subtitle: string;
  minutes: number;
  /** Setup lessons follow the six-step template: spot it, context, volume, timeframes, plan, practise. */
  kind?: "concept" | "setup";
  blocks: LessonBlock[];
  /** One line saying what to try in Practice after this lesson. */
  practiceHint: string;
}

export interface LessonModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
}
