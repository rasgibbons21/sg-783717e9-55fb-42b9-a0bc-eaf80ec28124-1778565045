import { getInstrument } from "@/config/instruments";

const SUNDAY = 0;
const FRIDAY = 5;
const SATURDAY = 6;
const FOREX_CHANGEOVER = 17 * 60; // 5pm New York
const INDEX_OPEN = 9 * 60 + 30; // 9:30am New York
const INDEX_CLOSE = 16 * 60; // 4pm New York

const NEW_YORK = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function newYorkClock(now: Date): { day: number; minutes: number } {
  const parts = Object.fromEntries(NEW_YORK.formatToParts(now).map((part) => [part.type, part.value]));
  return { day: DAYS.indexOf(parts.weekday), minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/**
 * Metals and forex rest from Friday to Sunday at 5pm New York. Indices follow the US
 * trading day, because their prices come from the cash index. Short daily pauses and
 * holidays aren't modelled. Older stock positions are never blocked.
 */
export function isMarketOpen(symbol: string, now: Date): boolean {
  const instrument = getInstrument(symbol);
  if (!instrument) return true;
  const { day, minutes } = newYorkClock(now);

  if (instrument.assetClass === "index") {
    return day !== SATURDAY && day !== SUNDAY && minutes >= INDEX_OPEN && minutes < INDEX_CLOSE;
  }
  if (day === SATURDAY) return false;
  if (day === FRIDAY) return minutes < FOREX_CHANGEOVER;
  if (day === SUNDAY) return minutes >= FOREX_CHANGEOVER;
  return true;
}

export function marketRestingMessage(symbol: string): string {
  return getInstrument(symbol)?.assetClass === "index"
    ? "This market is resting right now. It's open on weekdays from 9:30am to 4pm New York time."
    : "The market is resting right now. It reopens on Sunday at 5pm New York time.";
}
