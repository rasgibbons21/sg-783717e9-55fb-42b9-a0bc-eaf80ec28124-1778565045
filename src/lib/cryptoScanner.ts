// Crypto scanner engine — scoring, filtering, and types

export interface CryptoCandidate {
  symbol: string;        // e.g. "BTCUSD"
  name: string;          // e.g. "Bitcoin USD"
  price: number;
  change: number;        // 24h % change
  changeAbs: number;     // 24h $ change
  volume: number;        // 24h volume (USD)
  avgVolume: number;
  volumeRatio: number;   // volume / avgVolume
  marketCap: number;
  dayHigh: number;
  dayLow: number;
  priceAvg50: number;
  priceAvg200: number;
  score: number;
  scoreBreakdown: CryptoScoreBreakdown;
  status: CryptoStatus;
  flags: string[];
  timestamp: number;
}

export type CryptoStatus = "hot" | "moving" | "warming" | "quiet";

export interface CryptoScoreBreakdown {
  dailyChange: number;     // 0-20
  volumeSpike: number;     // 0-20
  marketCapTier: number;   // 0-15
  momentum: number;        // 0-15
  rangePosition: number;   // 0-10
  absoluteVolume: number;  // 0-10
  penalties: number;       // negative
}

export interface FMPCryptoQuote {
  symbol: string;
  name: string;
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
  exchange: string;
  timestamp: number;
}

export type CryptoSort = "score" | "change" | "volume" | "marketCap";

export function scoreCrypto(q: FMPCryptoQuote): CryptoScoreBreakdown {
  const breakdown: CryptoScoreBreakdown = {
    dailyChange: 0,
    volumeSpike: 0,
    marketCapTier: 0,
    momentum: 0,
    rangePosition: 0,
    absoluteVolume: 0,
    penalties: 0,
  };

  const pct = q.changesPercentage;
  if (pct >= 20) breakdown.dailyChange = 20;
  else if (pct >= 10) breakdown.dailyChange = 15;
  else if (pct >= 5) breakdown.dailyChange = 10;
  else if (pct >= 2) breakdown.dailyChange = 5;

  const vRatio = q.avgVolume > 0 ? q.volume / q.avgVolume : 0;
  if (vRatio >= 10) breakdown.volumeSpike = 20;
  else if (vRatio >= 5) breakdown.volumeSpike = 15;
  else if (vRatio >= 3) breakdown.volumeSpike = 10;
  else if (vRatio >= 2) breakdown.volumeSpike = 5;

  const mcap = q.marketCap;
  if (mcap >= 10_000_000_000) breakdown.marketCapTier = 5;
  else if (mcap >= 1_000_000_000) breakdown.marketCapTier = 10;
  else if (mcap >= 100_000_000) breakdown.marketCapTier = 15;
  else if (mcap >= 10_000_000) breakdown.marketCapTier = 8;

  if (q.priceAvg50 > 0 && q.price > q.priceAvg50) breakdown.momentum += 10;
  if (q.priceAvg200 > 0 && q.price > q.priceAvg200) breakdown.momentum += 5;

  const range = q.dayHigh - q.dayLow;
  if (range > 0) {
    const position = (q.price - q.dayLow) / range;
    if (position >= 0.9) breakdown.rangePosition = 10;
    else if (position >= 0.75) breakdown.rangePosition = 7;
    else if (position >= 0.5) breakdown.rangePosition = 4;
  }

  const vol24h = q.volume * q.price;
  if (vol24h >= 100_000_000) breakdown.absoluteVolume = 10;
  else if (vol24h >= 10_000_000) breakdown.absoluteVolume = 7;
  else if (vol24h >= 1_000_000) breakdown.absoluteVolume = 4;

  if (pct > 50) breakdown.penalties -= 5;
  if (vol24h < 100_000) breakdown.penalties -= 10;
  if (q.yearHigh > 0 && q.price < q.yearLow * 1.1) breakdown.penalties -= 5;

  return breakdown;
}

export function cryptoTotalScore(b: CryptoScoreBreakdown): number {
  const raw = b.dailyChange + b.volumeSpike + b.marketCapTier +
    b.momentum + b.rangePosition + b.absoluteVolume + b.penalties;
  return Math.max(0, Math.min(100, raw));
}

export function classifyCrypto(score: number): CryptoStatus {
  if (score >= 55) return "hot";
  if (score >= 40) return "moving";
  if (score >= 25) return "warming";
  return "quiet";
}

export function filterAndSortCrypto(
  candidates: CryptoCandidate[],
  sortBy: CryptoSort = "score",
): CryptoCandidate[] {
  const sorted = [...candidates];
  const fns: Record<CryptoSort, (a: CryptoCandidate, b: CryptoCandidate) => number> = {
    score: (a, b) => b.score - a.score,
    change: (a, b) => b.change - a.change,
    volume: (a, b) => b.volume - a.volume,
    marketCap: (a, b) => b.marketCap - a.marketCap,
  };
  sorted.sort(fns[sortBy] || fns.score);
  return sorted;
}
