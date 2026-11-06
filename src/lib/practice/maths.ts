import { getInstrument } from "@/config/instruments";

export type Direction = "long" | "short";

const round = (value: number, places: number) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function lotsToUnits(symbol: string, lots: number): number {
  const instrument = getInstrument(symbol);
  if (!instrument) throw new Error(`Unknown instrument: ${symbol}`);
  return round(lots * instrument.unitsPerLot, 4);
}

/** The simulated money set aside while a trade is open. Older stock positions reserve full cost. */
export function marginFor(ticker: string, price: number, units: number): number {
  const instrument = getInstrument(ticker);
  if (!instrument) return price * units;
  const notionalInDollars = instrument.usdBase ? units : price * units;
  return notionalInDollars / instrument.leverage;
}

/** The result of a trade, in dollars and before rounding for storage. */
/** Risk as a percentage of the simulated cash available, the same figure the ticket shows. */
export function riskPct(risk: number, cash: number): number {
  return cash > 0 ? Math.round((risk / cash) * 10000) / 100 : 0;
}

export function pnlFor(ticker: string, direction: Direction, entry: number, exit: number, units: number): number {
  const move = direction === "long" ? exit - entry : entry - exit;
  const result = move * units;
  return getInstrument(ticker)?.quoteInJpy ? result / exit : result;
}
