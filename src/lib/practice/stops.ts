import type { Direction } from "./maths";

export type AutoExitReason = "Stopped out" | "Hit target";

interface Levels {
  direction: Direction;
  stop_price: number | null;
  target_price: number | null;
}

/** Whether this price has reached the trade's stop or target. The stop is checked first, as the safer reading. */
export function exitReasonAt(trade: Levels, price: number): AutoExitReason | null {
  const { direction, stop_price: stop, target_price: target } = trade;
  if (stop != null && (direction === "long" ? price <= stop : price >= stop)) return "Stopped out";
  if (target != null && (direction === "long" ? price >= target : price <= target)) return "Hit target";
  return null;
}
