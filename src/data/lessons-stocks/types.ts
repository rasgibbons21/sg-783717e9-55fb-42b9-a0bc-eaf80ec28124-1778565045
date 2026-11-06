import type { Candle as ChartCandle, Zone } from "@/lib/charts/types";

export type { ChartCandle as Candle };

/** The timeframes a lesson chart offers, and the one it opens on. */
export interface ChartSpec {
  timeframes: { label: string; candles: ChartCandle[] }[];
  initial: string;
  /** Shaded stretches of candles, such as a time window. Indexes refer to the initial timeframe. */
  bands?: { fromIndex: number; toIndex: number; label: string }[];
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
