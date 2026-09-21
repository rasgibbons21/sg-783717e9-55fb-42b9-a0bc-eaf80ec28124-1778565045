// Bloom Radar scanner engine — scoring, filtering, types, and strategy evaluation

import type { SignalResult, StrategyId } from "./strategies";

export interface ScannerCandidate {
  symbol: string;
  price: number;
  change: number;       // % daily change
  changeAbs: number;    // $ daily change
  prevClose: number;
  volume: number;       // absolute shares traded
  avgVolume: number;    // average volume
  rvol: number;         // relative volume (volume / avgVolume)
  marketCap: number;
  float: number | null; // shares float, null if unknown
  catalyst: CatalystQuality;
  catalystHeadline: string | null;
  setup: SetupType | null;
  score: number;        // 0-100 evidence score
  scoreBreakdown: ScoreBreakdown;
  status: CandidateStatus;
  flags: string[];      // warnings/notes
  dataSource: string;
  timestamp: number;
  signals?: SignalResult[];
  topStrategy?: StrategyId | null;
}

export type CatalystQuality = "strong" | "moderate" | "weak" | "unverified" | "none";
export type SetupType = "bull-flag" | "micro-pullback" | "hod-breakout" | "continuation";
export type CandidateStatus = "qualified" | "watchlist" | "near-miss" | "rejected" | "data-unavailable";

export interface ScoreBreakdown {
  priceRange: number;      // 0-10
  dailyGain: number;       // 0-10
  relativeVolume: number;  // 0-15
  absoluteVolume: number;  // 0-10
  catalyst: number;        // 0-15
  float: number;           // 0-10
  setup: number;           // 0-15
  confirmation: number;    // 0-10
  rewardRisk: number;      // 0-5
  penalties: number;       // negative
}

export interface ScannerFilters {
  catalystOnly: boolean;
  minRvol: number;
  maxPrice: number;
  minPrice: number;
  minChange: number;
  sortBy: ScannerSort;
}

export type ScannerSort = "score" | "change" | "rvol" | "float" | "volume";

export const DEFAULT_FILTERS: ScannerFilters = {
  catalystOnly: false,
  minRvol: 5,
  maxPrice: 20,
  minPrice: 2,
  minChange: 10,
  sortBy: "score",
};

export interface FMPScreenerResult {
  symbol: string;
  companyName: string;
  marketCap: number;
  price: number;
  change: number;
  changesPercentage: number;
  volume: number;
  avgVolume?: number;
  exchange: string;
  sector?: string;
  industry?: string;
  country?: string;
  sharesFloat?: number;
  sharesOutstanding?: number;
}

export interface FMPQuote {
  symbol: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  sharesOutstanding: number;
}

export function scoreCandidate(
  quote: FMPQuote,
  floatShares: number | null,
  catalystQuality: CatalystQuality,
): ScoreBreakdown {
  const breakdown: ScoreBreakdown = {
    priceRange: 0,
    dailyGain: 0,
    relativeVolume: 0,
    absoluteVolume: 0,
    catalyst: 0,
    float: 0,
    setup: 0,
    confirmation: 0,
    rewardRisk: 0,
    penalties: 0,
  };

  // Price range (0-10)
  if (quote.price >= 2 && quote.price <= 10) {
    breakdown.priceRange = 10;
  } else if (quote.price > 10 && quote.price <= 20) {
    breakdown.priceRange = 5;
  } else if (quote.price > 1 && quote.price < 2) {
    breakdown.priceRange = 2;
  }

  // Daily gain (0-10)
  const changePct = quote.changesPercentage;
  if (changePct >= 20) {
    breakdown.dailyGain = 10;
  } else if (changePct >= 10) {
    breakdown.dailyGain = 7;
  } else if (changePct >= 5) {
    breakdown.dailyGain = 3;
  }

  // Relative volume (0-15)
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  if (rvol >= 10) {
    breakdown.relativeVolume = 15;
  } else if (rvol >= 5) {
    breakdown.relativeVolume = 10;
  } else if (rvol >= 3) {
    breakdown.relativeVolume = 5;
  } else if (rvol >= 2) {
    breakdown.relativeVolume = 2;
  }

  // Absolute volume (0-10)
  if (quote.volume >= 5_000_000) {
    breakdown.absoluteVolume = 10;
  } else if (quote.volume >= 1_000_000) {
    breakdown.absoluteVolume = 7;
  } else if (quote.volume >= 500_000) {
    breakdown.absoluteVolume = 4;
  } else if (quote.volume >= 100_000) {
    breakdown.absoluteVolume = 2;
  }

  // Catalyst (0-15)
  const catalystScores: Record<CatalystQuality, number> = {
    strong: 15, moderate: 10, weak: 5, unverified: 2, none: 0,
  };
  breakdown.catalyst = catalystScores[catalystQuality];

  // Float (0-10)
  if (floatShares !== null) {
    const floatM = floatShares / 1_000_000;
    if (floatM <= 5) {
      breakdown.float = 10;
    } else if (floatM <= 10) {
      breakdown.float = 8;
    } else if (floatM <= 20) {
      breakdown.float = 6;
    } else if (floatM <= 50) {
      breakdown.float = 3;
    }
  }

  // Penalties
  if (changePct > 50) breakdown.penalties -= 5; // extreme extension
  if (rvol < 5 && rvol > 0) breakdown.penalties -= 3;
  if (quote.volume < 100_000) breakdown.penalties -= 5;
  if (floatShares === null) breakdown.penalties -= 3;
  if (catalystQuality === "none") breakdown.penalties -= 5;

  return breakdown;
}

export function totalScore(b: ScoreBreakdown): number {
  const raw = b.priceRange + b.dailyGain + b.relativeVolume + b.absoluteVolume +
    b.catalyst + b.float + b.setup + b.confirmation + b.rewardRisk + b.penalties;
  return Math.max(0, Math.min(100, raw));
}

export function classifyCandidate(score: number, changePct: number, rvol: number): CandidateStatus {
  if (score >= 60) return "qualified";
  if (score >= 45) return "watchlist";
  if (score >= 30) return "near-miss";
  return "rejected";
}

export function filterAndSort(
  candidates: ScannerCandidate[],
  filters: ScannerFilters,
): ScannerCandidate[] {
  const filtered = candidates.filter((c) => {
    if (c.price < filters.minPrice || c.price > filters.maxPrice) return false;
    if (c.change < filters.minChange) return false;
    if (c.rvol < filters.minRvol) return false;
    if (filters.catalystOnly && (c.catalyst === "none" || c.catalyst === "unverified")) return false;
    return true;
  });

  const sortFns: Record<ScannerSort, (a: ScannerCandidate, b: ScannerCandidate) => number> = {
    score: (a, b) => b.score - a.score,
    change: (a, b) => b.change - a.change,
    rvol: (a, b) => b.rvol - a.rvol,
    float: (a, b) => {
      if (a.float === null) return 1;
      if (b.float === null) return -1;
      return a.float - b.float;
    },
    volume: (a, b) => b.volume - a.volume,
  };

  filtered.sort(sortFns[filters.sortBy] || sortFns.score);
  return filtered;
}
