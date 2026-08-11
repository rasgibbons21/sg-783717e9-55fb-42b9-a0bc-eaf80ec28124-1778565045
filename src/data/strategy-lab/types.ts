export type StrategyCategory =
  | "Day Trading"
  | "Swing Trading"
  | "Long-Term Investing"
  | "Indicator Workshop"
  | "Risk Management";

export type StrategyFilter =
  | "All"
  | "Day Trading"
  | "Swing Trading"
  | "Long-Term Investing"
  | "Trend"
  | "Momentum"
  | "Breakouts"
  | "Mean Reversion"
  | "Income"
  | "Risk Management";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type StrategyStatus = "not_started" | "learning" | "practicing" | "mastered";

export interface OHLCBar {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartAnnotation {
  type: "support" | "resistance" | "trendline" | "entry" | "stop" | "target" | "label" | "range" | "vwap" | "ema";
  price?: number;
  price2?: number;
  time?: string;
  time2?: string;
  label: string;
  color?: string;
}

export interface ChartExercise {
  id: string;
  type: "spot_setup" | "build_trade" | "good_vs_bad" | "scorecard";
  title: string;
  instruction: string;
  chartData: OHLCBar[];
  chartDataB?: OHLCBar[];
  annotations?: ChartAnnotation[];
  hiddenAnnotations?: ChartAnnotation[];
  question?: string;
  options?: { label: string; correct: boolean; explanation: string }[];
  correctSetup?: string;
  pansyExplanation: string;
}

export interface QuizQuestion {
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface StrategySection {
  type: "overview" | "why" | "when-appropriate" | "when-inappropriate" | "setup" | "entry" | "invalidation" | "exit" | "position-sizing" | "visual" | "practice" | "mistakes" | "takeaway";
  heading: string;
  content: string;
}

export interface PansyCoaching {
  intro: string;
  duringChart: string[];
  afterQuiz: string[];
  encouragement: string;
  warning: string;
}

export interface ToolbeltSummary {
  bestStudiedDuring: string;
  lookFor: string;
  avoid: string;
  confirmation: string;
  invalidation: string;
}

export interface Strategy {
  slug: string;
  name: string;
  category: StrategyCategory;
  filters: StrategyFilter[];
  difficulty: Difficulty;
  timeframe: string;
  marketConditions: string;
  icon: string;
  lessonCount: number;
  sections: StrategySection[];
  diagram: string;
  quiz: QuizQuestion[];
  chartExercises: ChartExercise[];
  pansy: PansyCoaching;
  toolbelt: ToolbeltSummary;
}

export interface IndicatorStrategy extends Strategy {
  indicatorType: string;
  whatItMeasures: string;
  whatItDoesNot: string;
  commonSettings: string;
  falseSignals: string;
  beginnerMistakes: string;
  whenNotToUse: string;
  combineWithPriceAction: string;
}

export function isIndicatorStrategy(s: Strategy): s is IndicatorStrategy {
  return "indicatorType" in s;
}
