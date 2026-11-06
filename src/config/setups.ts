/** The setups taught in the lessons, which members choose from when they plan a practice trade. */
export const SETUP_TYPES = [
  "FVG",
  "IFVG",
  "Order block",
  "Breaker block",
  "Liquidity sweep",
  "BOS",
  "CHoCH",
  "OTE",
  "Silver Bullet",
  "Supply & demand",
  "Support & resistance",
  "Breakout",
  "CRT",
  "Power of 3",
  "Other",
] as const;

export const TIMEFRAMES = ["Daily", "1H", "5m"] as const;

export type SetupType = (typeof SETUP_TYPES)[number];
export type Timeframe = (typeof TIMEFRAMES)[number];

/** The chart provider's name for each timeframe. */
export const FEED_TIMEFRAME: Record<Timeframe, string> = { Daily: "daily", "1H": "1hour", "5m": "5min" };
