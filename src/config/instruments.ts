export type AssetClass = "stock" | "etf" | "metal" | "forex" | "index";

export interface Instrument {
  symbol: string;
  name: string;
  /** How we describe it to a beginner. */
  plainName: string;
  assetClass: AssetClass;
  /** Listed instruments appear in Practice. The rest stay only so older open positions can close. */
  listed: boolean;
  /** Which price provider quotes it. */
  feed: "finnhub" | "fmp";
  unitsPerLot: number;
  /** "share", "ounce" and so on, for explaining sizes. */
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

const stock = (symbol: string, name: string, plainName: string, assetClass: "stock" | "etf" = "stock"): Instrument => ({
  symbol,
  name,
  plainName,
  assetClass,
  listed: true,
  feed: "finnhub",
  unitsPerLot: 1,
  unitName: "share",
  leverage: 1,
  decimals: 2,
  feedSymbol: symbol,
});

const legacy = (instrument: Omit<Instrument, "listed" | "feed">): Instrument => ({ ...instrument, listed: false, feed: "fmp" });

export const INSTRUMENTS: Instrument[] = [
  stock("SPY", "SPY", "Tracks the S&P 500, 500 large US companies", "etf"),
  stock("QQQ", "QQQ", "Tracks the Nasdaq-100, large US tech-heavy companies", "etf"),
  stock("IWM", "IWM", "Tracks the Russell 2000, smaller US companies", "etf"),
  stock("DIA", "DIA", "Tracks the Dow Jones, 30 well-known US companies", "etf"),
  stock("AAPL", "Apple", "Apple Inc."),
  stock("MSFT", "Microsoft", "Microsoft Corporation"),
  stock("NVDA", "Nvidia", "Nvidia Corporation"),
  stock("AMZN", "Amazon", "Amazon.com, Inc."),
  stock("GOOGL", "Alphabet", "Alphabet Inc., Google's parent company"),
  stock("META", "Meta", "Meta Platforms, Inc."),
  stock("TSLA", "Tesla", "Tesla, Inc."),
  stock("AMD", "AMD", "Advanced Micro Devices, Inc."),
  stock("JPM", "JPMorgan", "JPMorgan Chase & Co."),
  stock("KO", "Coca-Cola", "The Coca-Cola Company"),
  stock("DIS", "Disney", "The Walt Disney Company"),
  legacy({ symbol: "XAUUSD", name: "Gold", plainName: "Gold, in US dollars per ounce", assetClass: "metal", unitsPerLot: 100, unitName: "ounce", leverage: 20, decimals: 2, feedSymbol: "XAUUSD" }),
  legacy({ symbol: "XAGUSD", name: "Silver", plainName: "Silver, in US dollars per ounce", assetClass: "metal", unitsPerLot: 5000, unitName: "ounce", leverage: 10, decimals: 3, feedSymbol: "XAGUSD" }),
  legacy({ symbol: "EURUSD", name: "Euro / Dollar", plainName: "How many dollars one euro buys", assetClass: "forex", unitsPerLot: 100000, unitName: "euro", leverage: 30, decimals: 4, feedSymbol: "EURUSD" }),
  legacy({ symbol: "GBPUSD", name: "Pound / Dollar", plainName: "How many dollars one pound buys", assetClass: "forex", unitsPerLot: 100000, unitName: "pound", leverage: 30, decimals: 4, feedSymbol: "GBPUSD" }),
  legacy({ symbol: "USDJPY", name: "Dollar / Yen", plainName: "How many yen one dollar buys", assetClass: "forex", unitsPerLot: 100000, unitName: "dollar", leverage: 30, decimals: 3, feedSymbol: "USDJPY", quoteInJpy: true, usdBase: true }),
  legacy({ symbol: "US30", name: "US 30", plainName: "30 well-known US companies", assetClass: "index", unitsPerLot: 1, unitName: "contract", leverage: 20, decimals: 1, feedSymbol: "^DJI" }),
  legacy({ symbol: "US500", name: "US 500", plainName: "500 large US companies", assetClass: "index", unitsPerLot: 1, unitName: "contract", leverage: 20, decimals: 1, feedSymbol: "^GSPC" }),
];

export const LISTED_INSTRUMENTS = INSTRUMENTS.filter((instrument) => instrument.listed);

export function getInstrument(symbol: string): Instrument | undefined {
  const wanted = (symbol ?? "").toUpperCase().trim();
  return INSTRUMENTS.find((instrument) => instrument.symbol === wanted);
}
