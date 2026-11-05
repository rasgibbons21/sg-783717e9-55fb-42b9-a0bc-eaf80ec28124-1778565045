export type AssetClass = "metal" | "forex" | "index";

export interface Instrument {
  symbol: string;
  name: string;
  /** How we describe it to a complete beginner. */
  plainName: string;
  assetClass: AssetClass;
  unitsPerLot: number;
  /** "ounce", "euro" and so on, for explaining what a lot means. */
  unitName: string;
  leverage: number;
  decimals: number;
  /** The symbol our price provider uses. */
  feedSymbol: string;
  /** True when the first currency is the dollar and results arrive in yen. */
  quoteInJpy?: boolean;
  /** True when the first currency is the dollar, so one unit is worth one dollar. */
  usdBase?: boolean;
}

export const INSTRUMENTS: Instrument[] = [
  { symbol: "XAUUSD", name: "Gold", plainName: "Gold, in US dollars per ounce", assetClass: "metal", unitsPerLot: 100, unitName: "ounce", leverage: 20, decimals: 2, feedSymbol: "XAUUSD" },
  { symbol: "XAGUSD", name: "Silver", plainName: "Silver, in US dollars per ounce", assetClass: "metal", unitsPerLot: 5000, unitName: "ounce", leverage: 10, decimals: 3, feedSymbol: "XAGUSD" },
  { symbol: "EURUSD", name: "Euro / Dollar", plainName: "How many dollars one euro buys", assetClass: "forex", unitsPerLot: 100000, unitName: "euro", leverage: 30, decimals: 4, feedSymbol: "EURUSD" },
  { symbol: "GBPUSD", name: "Pound / Dollar", plainName: "How many dollars one pound buys", assetClass: "forex", unitsPerLot: 100000, unitName: "pound", leverage: 30, decimals: 4, feedSymbol: "GBPUSD" },
  { symbol: "USDJPY", name: "Dollar / Yen", plainName: "How many yen one dollar buys", assetClass: "forex", unitsPerLot: 100000, unitName: "dollar", leverage: 30, decimals: 3, feedSymbol: "USDJPY", quoteInJpy: true, usdBase: true },
  { symbol: "US30", name: "US 30", plainName: "30 well-known US companies", assetClass: "index", unitsPerLot: 1, unitName: "contract", leverage: 20, decimals: 1, feedSymbol: "^DJI" },
  { symbol: "US500", name: "US 500", plainName: "500 large US companies", assetClass: "index", unitsPerLot: 1, unitName: "contract", leverage: 20, decimals: 1, feedSymbol: "^GSPC" },
];

export function getInstrument(symbol: string): Instrument | undefined {
  const wanted = (symbol ?? "").toUpperCase().trim();
  return INSTRUMENTS.find((instrument) => instrument.symbol === wanted);
}
