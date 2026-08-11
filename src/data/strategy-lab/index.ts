import type { Strategy, StrategyCategory, StrategyFilter, IndicatorStrategy } from "./types";
import { isIndicatorStrategy } from "./types";
import { DAY_TRADING_STRATEGIES } from "./day-trading";
import { SWING_TRADING_STRATEGIES } from "./swing-trading";
import { LONG_TERM_STRATEGIES } from "./long-term";
import { INDICATOR_STRATEGIES } from "./indicators";

export type { Strategy, StrategyCategory, StrategyFilter, IndicatorStrategy };
export { isIndicatorStrategy };

export const ALL_STRATEGIES: Strategy[] = [
  ...DAY_TRADING_STRATEGIES,
  ...SWING_TRADING_STRATEGIES,
  ...LONG_TERM_STRATEGIES,
  ...INDICATOR_STRATEGIES,
];

export const STRATEGY_CATEGORIES: { label: string; slug: StrategyCategory; icon: string; description: string }[] = [
  { label: "Day Trading", slug: "Day Trading", icon: "⚡", description: "Intraday strategies for active trading sessions" },
  { label: "Swing Trading", slug: "Swing Trading", icon: "🌊", description: "Multi-day strategies following trends and setups" },
  { label: "Long-Term Investing", slug: "Long-Term Investing", icon: "🌱", description: "Strategies for building wealth over years" },
  { label: "Indicator Workshop", slug: "Indicator Workshop", icon: "🔧", description: "Understand what indicators actually measure" },
];

export const STRATEGY_FILTERS: StrategyFilter[] = [
  "All",
  "Day Trading",
  "Swing Trading",
  "Long-Term Investing",
  "Trend",
  "Momentum",
  "Breakouts",
  "Mean Reversion",
  "Income",
  "Risk Management",
];

export function getStrategyBySlug(slug: string): Strategy | undefined {
  return ALL_STRATEGIES.find((s) => s.slug === slug);
}

export function getStrategiesByCategory(category: StrategyCategory): Strategy[] {
  return ALL_STRATEGIES.filter((s) => s.category === category);
}

export function getStrategiesByFilter(filter: StrategyFilter): Strategy[] {
  if (filter === "All") return ALL_STRATEGIES;
  return ALL_STRATEGIES.filter((s) => s.filters.includes(filter));
}

export function getIndicatorStrategies(): IndicatorStrategy[] {
  return ALL_STRATEGIES.filter(isIndicatorStrategy);
}

export function getStrategyCount(): { total: number; byCategory: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  for (const s of ALL_STRATEGIES) {
    byCategory[s.category] = (byCategory[s.category] || 0) + 1;
  }
  return { total: ALL_STRATEGIES.length, byCategory };
}
