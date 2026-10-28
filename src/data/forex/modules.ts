export interface ForexModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  lessonCount: number;
  difficulty: string;
}

export const FOREX_MODULES: ForexModule[] = [
  {
    id: "foundations",
    number: 1,
    title: "Foundations",
    subtitle: "What forex is, how currency pairs work, pips, lots, spreads, and the global trading sessions.",
    icon: "🌍",
    lessonCount: 5,
    difficulty: "Beginner",
  },
  {
    id: "broker-platform",
    number: 2,
    title: "Broker & Platform",
    subtitle: "Leverage, margin, choosing a regulated broker, account types, and mastering order types.",
    icon: "🏦",
    lessonCount: 5,
    difficulty: "Beginner",
  },
  {
    id: "analysis",
    number: 3,
    title: "Analysis",
    subtitle: "Reading candlesticks on forex charts, support/resistance, indicators, and fundamental drivers.",
    icon: "📊",
    lessonCount: 4,
    difficulty: "Intermediate",
  },
  {
    id: "risk-mindset",
    number: 4,
    title: "Risk & Mindset",
    subtitle: "Position sizing, risk/reward, building a plan, trading psychology, and going from demo to live.",
    icon: "🧠",
    lessonCount: 6,
    difficulty: "Intermediate",
  },
];

export function getForexModuleById(id: string): ForexModule | undefined {
  return FOREX_MODULES.find((m) => m.id === id);
}
