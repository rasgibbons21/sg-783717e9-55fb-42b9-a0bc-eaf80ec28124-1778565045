import { getInstrument } from "@/config/instruments";

export const MARKET_RESTING_MESSAGE = "The market is resting right now. It reopens on Sunday evening, UTC.";

const FRIDAY = 5;
const SATURDAY = 6;
const SUNDAY = 0;
const CLOSE_HOUR_UTC = 22;

/**
 * Metals, forex and index CFDs close from Friday 22:00 to Sunday 22:00 UTC.
 * Short daily pauses and holidays aren't modelled. Older stock positions are never blocked.
 */
export function isMarketOpen(symbol: string, now: Date): boolean {
  if (!getInstrument(symbol)) return true;
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  if (day === SATURDAY) return false;
  if (day === FRIDAY && hour >= CLOSE_HOUR_UTC) return false;
  if (day === SUNDAY && hour < CLOSE_HOUR_UTC) return false;
  return true;
}
