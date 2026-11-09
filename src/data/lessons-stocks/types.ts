import type { Candle as ChartCandle, Zone } from "@/lib/charts/types";
import type { SetupType, Timeframe } from "@/config/setups";

export type { ChartCandle as Candle };

/** The timeframes a lesson chart offers, and the one it opens on. */
export interface ChartSpec {
  timeframes: { label: string; candles: ChartCandle[] }[];
  initial: string;
  /** Shaded stretches of candles, such as a time window. Indexes refer to the initial timeframe. */
  bands?: { fromIndex: number; toIndex: number; label: string }[];
}

/** Every lesson moves through these stages in order: learn it, see how to trade it, test it, practise it. */
export type Stage = "lesson" | "strategy" | "test" | "practice";

export interface StrategyStep {
  label: string;
  body: string;
  focus: "pattern" | "context" | "volume" | "timeframe" | "entry" | "stop" | "target" | "skip";
}

export type BaseBlock =
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
  /** A chart with the pattern already marked, so she sees it before she is asked to find it. */
  | { type: "workedExample"; chart: ChartSpec; highlight: { kind: "zone"; zone: Zone } | { kind: "candles"; indexes: number[] }; caption: string }
  /** The playbook for a setup, step by step, beside a chart with the plan drawn. */
  | {
      type: "strategy";
      title: string;
      chart: ChartSpec;
      plan: { direction: "long" | "short"; entry: number; stop: number; target: number };
      steps: StrategyStep[];
    }
  /** Hands her to Practice with the setup and timeframe already picked. */
  | { type: "practiceCta"; setup: SetupType; timeframe: Timeframe; body: string };

export type LessonBlock = BaseBlock & { stage: Stage };

export interface Lesson {
  slug: string;
  moduleId: string;
  title: string;
  subtitle: string;
  minutes: number;
  /** Setup lessons run Lesson, Strategy, Test and Practice. Concept lessons run Lesson and Test. */
  kind?: "concept" | "setup";
  blocks: LessonBlock[];
  /** One line saying what to try in Practice after this lesson. */
  practiceHint: string;
}

/** A lesson as written in a module file, before stages are attached. */
export type RawLesson = Omit<Lesson, "blocks"> & { blocks: BaseBlock[] };

export interface LessonModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
}
