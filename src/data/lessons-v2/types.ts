export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

export type SliderOutcomeKey = "leverage" | "lotSize" | "riskPercent";

export type LessonBlock =
  | { type: "text"; body: string }
  | { type: "pansy"; body: string }
  | { type: "chartTap"; prompt: string; candles: Candle[]; correctIndexes: number[]; explanation: string }
  | { type: "quiz"; q: string; options: string[]; correct: number; explanation: string }
  /** `steps` are written in the correct order; the player deals them out shuffled. */
  | { type: "order"; prompt: string; steps: string[]; explanation: string }
  | { type: "scenario"; prompt: string; choices: { label: string; outcome: string; good: boolean }[] }
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
