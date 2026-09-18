import {
  Brain, Search, PieChart, Shield, TrendingUp, BarChart3,
  BookOpen, Bell, LineChart, Zap, Rocket, Target, Newspaper,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface AcademyTool {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  tag?: string;
  category: "analysis" | "screening" | "monitoring" | "research";
  isPremium: boolean;
  features: string[];
}

export const ACADEMY_TOOLS: AcademyTool[] = [
  {
    slug: "stock-analyzer",
    name: "AI Stock Analyzer",
    description: "Deep fundamental + technical analysis powered by AI. Get instant insights on any ticker.",
    icon: Brain,
    tag: "Most Popular",
    category: "analysis",
    isPremium: true,
    features: [
      "Fundamental analysis with real financial data",
      "Technical indicator breakdown",
      "AI-generated bull & bear case",
      "Risk assessment and valuation insights",
    ],
  },
  {
    slug: "smart-screener",
    name: "Smart Screener",
    description: "Filter thousands of stocks by 50+ criteria. Find hidden gems before the crowd.",
    icon: Search,
    category: "screening",
    isPremium: true,
    features: [
      "Filter by market cap, P/E, dividend yield",
      "Sector and industry screening",
      "Volume and momentum filters",
      "Save and share custom screens",
    ],
  },
  {
    slug: "portfolio-xray",
    name: "Portfolio X-Ray",
    description: "See your real diversification, risk exposure, and sector overlap in seconds.",
    icon: PieChart,
    category: "analysis",
    isPremium: true,
    features: [
      "Sector and industry breakdown",
      "Concentration risk detection",
      "Overlap analysis across holdings",
      "AI diversification recommendations",
    ],
  },
  {
    slug: "risk-assessment",
    name: "Risk Assessment",
    description: "Understand your downside before you invest. Stress-test against historical crashes.",
    icon: Shield,
    category: "analysis",
    isPremium: true,
    features: [
      "Historical crash scenario testing",
      "Portfolio beta and volatility analysis",
      "Drawdown simulation",
      "Risk-adjusted return metrics",
    ],
  },
  {
    slug: "technical-charts",
    name: "Technical Charts",
    description: "Professional charting with 80+ indicators, pattern recognition, and AI annotations.",
    icon: TrendingUp,
    category: "analysis",
    isPremium: true,
    features: [
      "Candlestick and line charts",
      "Moving averages, RSI, MACD, Bollinger Bands",
      "AI pattern recognition",
      "Multi-timeframe analysis",
    ],
  },
  {
    slug: "market-sentiment",
    name: "Market Sentiment",
    description: "Real-time fear & greed, social buzz, and institutional flow in one dashboard.",
    icon: BarChart3,
    category: "monitoring",
    isPremium: true,
    features: [
      "Fear & Greed index tracking",
      "News sentiment analysis",
      "Social media buzz metrics",
      "Institutional flow indicators",
    ],
  },
  {
    slug: "earnings-tracker",
    name: "Earnings Tracker",
    description: "Never miss an earnings date. AI-predicted beats/misses with historical accuracy.",
    icon: BookOpen,
    category: "monitoring",
    isPremium: true,
    features: [
      "Upcoming earnings calendar",
      "Historical earnings surprise data",
      "AI beat/miss predictions",
      "Pre and post-earnings analysis",
    ],
  },
  {
    slug: "smart-alerts",
    name: "Smart Alerts",
    description: "Price, volume, and news alerts that actually matter. Zero noise, all signal.",
    icon: Bell,
    category: "monitoring",
    isPremium: true,
    features: [
      "Custom price target alerts",
      "Unusual volume notifications",
      "Breaking news alerts",
      "Technical breakout detection",
    ],
  },
  {
    slug: "sector-rotation",
    name: "Sector Rotation",
    description: "Track capital flows across sectors. Know where the smart money is moving.",
    icon: LineChart,
    category: "monitoring",
    isPremium: true,
    features: [
      "Sector ETF performance comparison",
      "Capital flow visualization",
      "Rotation cycle identification",
      "Historical sector strength rankings",
    ],
  },
  {
    slug: "options-flow",
    name: "Options Flow",
    description: "See unusual options activity and large block trades as they happen.",
    icon: Zap,
    tag: "Advanced",
    category: "monitoring",
    isPremium: true,
    features: [
      "Unusual options activity feed",
      "Large block trade detection",
      "Put/call ratio tracking",
      "Options volume analysis",
    ],
  },
  {
    slug: "ipo-tracker",
    name: "IPO Tracker",
    description: "Track upcoming IPOs, lockup expirations, and post-IPO performance analytics.",
    icon: Rocket,
    category: "research",
    isPremium: true,
    features: [
      "Upcoming IPO calendar",
      "Lockup expiration dates",
      "Post-IPO performance tracking",
      "IPO market trends analysis",
    ],
  },
  {
    slug: "watchlist-builder",
    name: "Watchlist Builder",
    description: "Organize, tag, and monitor your ideas. AI alerts when your targets are ready.",
    icon: Target,
    category: "screening",
    isPremium: true,
    features: [
      "Create multiple watchlists",
      "Tag and categorize stocks",
      "Real-time price monitoring",
      "AI entry point suggestions",
    ],
  },
  {
    slug: "research-reports",
    name: "AI Research Reports",
    description: "Institutional-grade research reports generated in seconds. Save hours of analysis.",
    icon: Newspaper,
    tag: "New",
    category: "research",
    isPremium: true,
    features: [
      "Comprehensive company overview",
      "Financial statement analysis",
      "Valuation and peer comparison",
      "Risk factors and outlook",
    ],
  },
];

export const TOOL_CATEGORIES = [
  { key: "all", label: "All Tools" },
  { key: "analysis", label: "Analysis" },
  { key: "screening", label: "Screening" },
  { key: "monitoring", label: "Monitoring" },
  { key: "research", label: "Research" },
] as const;

export function getToolBySlug(slug: string): AcademyTool | undefined {
  return ACADEMY_TOOLS.find((t) => t.slug === slug);
}
