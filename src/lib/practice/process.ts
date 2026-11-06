import { getInstrument } from "@/config/instruments";

export interface PlannedTrade {
  entry_price: number;
  stop_price: number | null;
  target_price: number | null;
  risk_pct?: number | null;
  thesis?: string | null;
  direction: "long" | "short";
}

/** Out of 100: 25 each for a stop, a reward at least 1.5 times the risk, risk of 1% or less, and a note. */
export function processScore(trade: PlannedTrade): number {
  const entry = Number(trade.entry_price);
  const stop = trade.stop_price == null ? null : Number(trade.stop_price);
  const target = trade.target_price == null ? null : Number(trade.target_price);
  let score = 0;

  if (stop !== null) score += 25;
  if (stop !== null && target !== null) {
    const long = trade.direction === "long";
    const risk = long ? entry - stop : stop - entry;
    const reward = long ? target - entry : entry - target;
    if (risk > 0 && reward / risk >= 1.5) score += 25;
  }
  if (trade.risk_pct != null && Number(trade.risk_pct) <= 1) score += 25;
  if (trade.thesis && trade.thesis.trim().length > 0) score += 25;
  return score;
}

/** The practice leaderboard ranks stock trades only. Older trades on stocks we no longer list still count. */
export function countsForStockBoard(ticker: string): boolean {
  const instrument = getInstrument(ticker);
  return !instrument || instrument.assetClass === "stock" || instrument.assetClass === "etf";
}
