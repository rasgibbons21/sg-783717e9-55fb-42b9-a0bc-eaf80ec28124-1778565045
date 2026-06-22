export interface UniversityModule {
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  lessonCount: number;
  estimatedHours: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  badgeName: string;
  certificateName: string;
}

export const UNIVERSITY_MODULES: UniversityModule[] = [
  {
    slug: "m1-chart-reading",
    number: 1,
    title: "Chart Reading",
    subtitle: "Learn to read price action the way experienced traders do — candlesticks, structure, volume, and the story they tell together.",
    icon: "📊",
    lessonCount: 10,
    estimatedHours: 1.5,
    difficulty: "Beginner",
    badgeName: "Chart Reader",
    certificateName: "Certificate of Completion — Chart Reading",
  },
  {
    slug: "m2-chart-patterns",
    number: 2,
    title: "Chart Patterns",
    subtitle: "The visual formations that appear again and again on price charts — and the psychology that creates them.",
    icon: "🔺",
    lessonCount: 13,
    estimatedHours: 2.5,
    difficulty: "Intermediate",
    badgeName: "Pattern Spotter",
    certificateName: "Certificate of Completion — Chart Patterns",
  },
  {
    slug: "m3-indicators",
    number: 3,
    title: "Indicators",
    subtitle: "Moving averages, RSI, MACD, Bollinger Bands, and more — what they measure, how to read them, and when not to use them.",
    icon: "📈",
    lessonCount: 13,
    estimatedHours: 3,
    difficulty: "Intermediate",
    badgeName: "Indicator Analyst",
    certificateName: "Certificate of Completion — Indicators",
  },
  {
    slug: "m4-trading-signals",
    number: 4,
    title: "Trading Signals",
    subtitle: "How experienced traders read signals in combination — never in isolation — to form a complete thesis.",
    icon: "⚡",
    lessonCount: 9,
    estimatedHours: 2,
    difficulty: "Intermediate",
    badgeName: "Signal Reader",
    certificateName: "Certificate of Completion — Trading Signals",
  },
  {
    slug: "m5-strategies",
    number: 5,
    title: "Strategies",
    subtitle: "Trend following, breakout, swing, momentum, ETF investing, dividend investing, DCA — the frameworks serious investors use.",
    icon: "🗺️",
    lessonCount: 9,
    estimatedHours: 2.5,
    difficulty: "Advanced",
    badgeName: "Strategist",
    certificateName: "Certificate of Completion — Strategies",
  },
  {
    slug: "m6-entering",
    number: 6,
    title: "Entering",
    subtitle: "How traders think about entry — position sizing, risk-to-reward, and the conditions that justify a thesis.",
    icon: "🚪",
    lessonCount: 6,
    estimatedHours: 1.5,
    difficulty: "Advanced",
    badgeName: "Entry Thinker",
    certificateName: "Certificate of Completion — Entering",
  },
  {
    slug: "m7-managing",
    number: 7,
    title: "Managing",
    subtitle: "What happens after entry — scaling, trailing, and protecting what you have without micromanaging every tick.",
    icon: "⚖️",
    lessonCount: 6,
    estimatedHours: 1.5,
    difficulty: "Advanced",
    badgeName: "Position Manager",
    certificateName: "Certificate of Completion — Managing",
  },
  {
    slug: "m8-exiting",
    number: 8,
    title: "Exiting",
    subtitle: "Invalidation levels, measured moves, and the discipline of taking gains — frameworks, never formulas.",
    icon: "🏁",
    lessonCount: 6,
    estimatedHours: 1.5,
    difficulty: "Advanced",
    badgeName: "Clean Exiter",
    certificateName: "Certificate of Completion — Exiting",
  },
  {
    slug: "m9-psychology",
    number: 9,
    title: "Psychology",
    subtitle: "Fear, greed, FOMO, revenge trading, patience, journaling — the mental game that separates consistent investors from impulsive ones.",
    icon: "🧠",
    lessonCount: 9,
    estimatedHours: 2,
    difficulty: "Advanced",
    badgeName: "Mindset Mastery",
    certificateName: "Certificate of Completion — Psychology",
  },
];

export function getModuleBySlug(slug: string): UniversityModule | undefined {
  return UNIVERSITY_MODULES.find((m) => m.slug === slug);
}
