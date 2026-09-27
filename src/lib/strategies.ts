// Configurable day-trading strategy definitions
// Each strategy is a data object the scanner evaluates against real quotes/candles.
// Strategies that cannot be computed from the current data layer are marked unavailable.

export type SignalState =
  | "WATCH"         // conditions forming
  | "NEAR_TRIGGER"  // most rules true, confirmation missing
  | "ACTIVE"        // trigger hit
  | "INVALIDATED"   // rule broke
  | "TARGET_HIT"
  | "STOP_HIT";

export type StrategyId =
  | "gap-and-go"
  | "opening-range-breakout"
  | "first-pullback"
  | "vwap-reclaim"
  | "vwap-bounce"
  | "hod-breakout"
  | "bull-flag"
  | "red-to-green"
  | "earnings-gap"
  | "range-breakout"
  | "oversold-bounce"
  | "short-squeeze";

export type FutureStrategyId =
  | "abcd"
  | "flat-top-break"
  | "momentum-continuation"
  | "sr-break-retest"
  | "failed-vwap-reclaim"
  | "parabolic-fade";

export interface StrategyParam {
  key: string;
  label: string;
  type: "number" | "range" | "select" | "boolean";
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  unit?: string;
}

export interface StrategyCondition {
  id: string;
  label: string;
  description: string;
  dataRequired: string;
  computable: boolean;
}

export interface Strategy {
  id: StrategyId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;

  conditions: StrategyCondition[];
  dataRequired: string[];

  entry: string;
  invalidation: string;
  targets: string;
  rrDescription: string;
  regimeFit: string;
  alertRule: string;

  userParams: StrategyParam[];

  available: boolean;
  unavailableReason?: string;
}

export const STRATEGIES: Record<StrategyId, Strategy> = {
  "gap-and-go": {
    id: "gap-and-go",
    name: "Gap & Go",
    shortName: "GAP",
    description: "Small-cap gaps up on volume with catalyst. Enter on consolidation break above pre-market high.",
    icon: "🚀",
    color: "#49B06E",
    conditions: [
      { id: "price-range", label: "Price in range", description: "Price $2–$10 (configurable)", dataRequired: "quote", computable: true },
      { id: "gap-pct", label: "Gap ≥ threshold", description: "Pre-market gap ≥ 10% from prior close", dataRequired: "quote", computable: true },
      { id: "pm-volume", label: "Strong PM volume", description: "Relative volume ≥ threshold", dataRequired: "quote", computable: true },
      { id: "catalyst", label: "News catalyst", description: "Recent headline driving the move", dataRequired: "news", computable: true },
      { id: "float", label: "Low float preferred", description: "Float ≤ 20M shares preferred", dataRequired: "profile", computable: true },
      { id: "pmh-break", label: "PMH / OR / VWAP break", description: "Breaks above pre-market high, opening range, or VWAP", dataRequired: "intraday", computable: false },
    ],
    dataRequired: ["quote", "news", "profile", "intraday"],
    entry: "Break above pre-market high (PMH) or opening range high on volume",
    invalidation: "Close below VWAP or opening range low",
    targets: "T1: Prior resistance / whole-dollar level. T2: 2× risk from entry.",
    rrDescription: "Minimum 2:1 R:R. Stop at consolidation low or OR low.",
    regimeFit: "Best in trending/momentum markets. Weak in range-bound/low-vol sessions.",
    alertRule: "Alert when gap ≥ threshold AND RVOL ≥ threshold AND price in range",
    userParams: [
      { key: "minPrice", label: "Min Price", type: "number", default: 2, min: 0.5, max: 50, step: 0.5, unit: "$" },
      { key: "maxPrice", label: "Max Price", type: "number", default: 10, min: 2, max: 100, step: 1, unit: "$" },
      { key: "minGapPct", label: "Min Gap %", type: "number", default: 10, min: 3, max: 50, step: 1, unit: "%" },
      { key: "minRvol", label: "Min RVOL", type: "number", default: 5, min: 1, max: 30, step: 1, unit: "x" },
      { key: "maxFloat", label: "Max Float (M)", type: "number", default: 20, min: 1, max: 200, step: 1, unit: "M" },
    ],
    available: true,
  },

  "opening-range-breakout": {
    id: "opening-range-breakout",
    name: "Opening Range Breakout",
    shortName: "ORB",
    description: "Track the first 5/15/30-min range. Enter on break of ORH or ORL with volume and VWAP confirmation.",
    icon: "📐",
    color: "#27B7C8",
    conditions: [
      { id: "or-defined", label: "OR range defined", description: "Opening range high/low established", dataRequired: "intraday", computable: false },
      { id: "or-break", label: "OR breakout", description: "Price breaks ORH (long) or ORL (short)", dataRequired: "intraday", computable: false },
      { id: "volume-confirm", label: "Volume confirmation", description: "Break bar volume > average", dataRequired: "intraday", computable: false },
      { id: "vwap-align", label: "VWAP alignment", description: "Price above VWAP for long, below for short", dataRequired: "intraday", computable: false },
      { id: "market-direction", label: "Market direction", description: "SPY/QQQ trending in same direction", dataRequired: "quote", computable: true },
    ],
    dataRequired: ["intraday", "quote"],
    entry: "Break above ORH (long) or below ORL (short) on above-average volume",
    invalidation: "Close back inside the opening range",
    targets: "T1: 1× OR range from breakout. T2: 2× OR range.",
    rrDescription: "Stop at opposite side of OR. Typical 2:1–3:1.",
    regimeFit: "Works in most regimes. Strongest on trend days.",
    alertRule: "Alert when OR break occurs with volume confirmation",
    userParams: [
      { key: "orMinutes", label: "OR Period", type: "select", default: "15", options: ["5", "15", "30"] },
      { key: "minVolMultiple", label: "Min Volume Multiple", type: "number", default: 1.5, min: 1, max: 5, step: 0.5, unit: "x" },
    ],
    available: true,
  },

  "first-pullback": {
    id: "first-pullback",
    name: "First Pullback",
    shortName: "1PB",
    description: "Strong impulse move, then first pullback on declining volume forming a higher low. Enter on continuation.",
    icon: "🔄",
    color: "#A855F7",
    conditions: [
      { id: "impulse", label: "Strong impulse", description: "Initial move ≥ 5% in direction", dataRequired: "intraday", computable: false },
      { id: "pullback", label: "Pullback on declining vol", description: "Retrace with lower volume bars", dataRequired: "intraday", computable: false },
      { id: "hl-pattern", label: "HL/LH formed", description: "Higher low (long) or lower high (short)", dataRequired: "intraday", computable: false },
      { id: "continuation", label: "Continuation trigger", description: "Break above pullback high on volume", dataRequired: "intraday", computable: false },
    ],
    dataRequired: ["intraday"],
    entry: "Break above the pullback high with volume returning",
    invalidation: "Break below the pullback low (higher low invalidated)",
    targets: "T1: Retest of impulse high. T2: Measured move from impulse.",
    rrDescription: "Stop at pullback low. Typical 2:1–4:1.",
    regimeFit: "Trend days and momentum names. Avoid choppy sessions.",
    alertRule: "Alert when first pullback pattern detected after impulse",
    userParams: [
      { key: "minImpulsePct", label: "Min Impulse %", type: "number", default: 5, min: 2, max: 20, step: 1, unit: "%" },
    ],
    available: true,
  },

  "vwap-reclaim": {
    id: "vwap-reclaim",
    name: "VWAP Reclaim",
    shortName: "VRC",
    description: "Stock trading below VWAP reclaims it on volume. Signals potential trend reversal.",
    icon: "⬆️",
    color: "#F59E0B",
    conditions: [
      { id: "below-vwap", label: "Below VWAP", description: "Price was trading below VWAP", dataRequired: "intraday", computable: false },
      { id: "reclaim", label: "VWAP reclaim", description: "Price crosses above VWAP", dataRequired: "intraday", computable: false },
      { id: "volume-surge", label: "Volume on reclaim", description: "Above-average volume on the cross", dataRequired: "intraday", computable: false },
      { id: "context", label: "Supportive context", description: "Catalyst, sector strength, or market bid", dataRequired: "news", computable: true },
    ],
    dataRequired: ["intraday", "news"],
    entry: "Hold above VWAP for 2+ candles with volume",
    invalidation: "Fail back below VWAP",
    targets: "T1: Pre-market high or HOD. T2: Prior day levels.",
    rrDescription: "Stop just below VWAP. Typical 2:1.",
    regimeFit: "Recovery plays. Works when market is finding a bid after weakness.",
    alertRule: "Alert when VWAP reclaim occurs with volume",
    userParams: [
      { key: "holdCandles", label: "Min Hold Candles", type: "number", default: 2, min: 1, max: 5, step: 1 },
    ],
    available: true,
  },

  "vwap-bounce": {
    id: "vwap-bounce",
    name: "VWAP Bounce",
    shortName: "VWB",
    description: "Stock pulls back to VWAP, holds, and bounces. Buy the dip to the anchor.",
    icon: "🏀",
    color: "#06B6D4",
    conditions: [
      { id: "above-vwap", label: "Trending above VWAP", description: "Stock in an uptrend above VWAP", dataRequired: "intraday", computable: false },
      { id: "approach", label: "Approach VWAP", description: "Price pulls back toward VWAP", dataRequired: "intraday", computable: false },
      { id: "hold", label: "Hold at VWAP", description: "VWAP acts as support (wick or close near)", dataRequired: "intraday", computable: false },
      { id: "bounce", label: "Bounce + volume", description: "Price bounces off VWAP with volume", dataRequired: "intraday", computable: false },
    ],
    dataRequired: ["intraday"],
    entry: "Bounce candle close above VWAP with volume",
    invalidation: "Close below VWAP",
    targets: "T1: Prior swing high. T2: HOD.",
    rrDescription: "Stop below VWAP by 1 ATR. Typical 2:1–3:1.",
    regimeFit: "Trend days with clear directional bias. Avoid in chop.",
    alertRule: "Alert when VWAP touch + bounce detected",
    userParams: [],
    available: true,
  },

  "hod-breakout": {
    id: "hod-breakout",
    name: "High of Day Breakout",
    shortName: "HOD",
    description: "Stock approaches and breaks the high of day on volume. Continuation play.",
    icon: "🔝",
    color: "#EC4899",
    conditions: [
      { id: "near-hod", label: "Near HOD", description: "Within 2% of high of day", dataRequired: "quote", computable: true },
      { id: "volume-building", label: "Volume building", description: "Volume increasing into the high", dataRequired: "quote", computable: true },
      { id: "break-attempt", label: "Break attempt", description: "Price tests HOD level", dataRequired: "intraday", computable: false },
      { id: "confirm", label: "Break confirmed", description: "Close above HOD on volume", dataRequired: "intraday", computable: false },
    ],
    dataRequired: ["quote", "intraday"],
    entry: "Break above HOD with volume confirmation",
    invalidation: "Fail and close back below HOD",
    targets: "T1: Whole-dollar level above. T2: Measured move from base.",
    rrDescription: "Stop at last consolidation low. Typical 2:1.",
    regimeFit: "Strong trend days. Avoid in fading/exhaustion conditions.",
    alertRule: "Alert when price within 1% of HOD with rising volume",
    userParams: [
      { key: "hodProximityPct", label: "HOD Proximity %", type: "number", default: 2, min: 0.5, max: 5, step: 0.5, unit: "%" },
    ],
    available: true,
  },

  "bull-flag": {
    id: "bull-flag",
    name: "Bull Flag",
    shortName: "FLAG",
    description: "Strong impulse move (pole), then tight consolidation with declining volume (flag). Break on volume.",
    icon: "🏁",
    color: "#8B5CF6",
    conditions: [
      { id: "pole", label: "Strong impulse (pole)", description: "Sharp move up ≥ 5%", dataRequired: "quote", computable: true },
      { id: "coil", label: "Tight consolidation", description: "Price coils in narrow range", dataRequired: "intraday", computable: false },
      { id: "vol-dryup", label: "Volume dry-up", description: "Volume declines during flag", dataRequired: "intraday", computable: false },
      { id: "break-vol", label: "Break on volume", description: "Flag break with volume surge", dataRequired: "intraday", computable: false },
    ],
    dataRequired: ["quote", "intraday"],
    entry: "Break above the flag high on volume surge",
    invalidation: "Break below flag low",
    targets: "T1: Measured move (flag low to pole high added to breakout). T2: 1.5× measured.",
    rrDescription: "Stop at flag low. Typical 2:1–3:1.",
    regimeFit: "Momentum/trend days. Classic continuation pattern.",
    alertRule: "Alert when consolidation detected after impulse with declining volume",
    userParams: [
      { key: "minPolePct", label: "Min Pole %", type: "number", default: 5, min: 3, max: 20, step: 1, unit: "%" },
    ],
    available: true,
  },

  "red-to-green": {
    id: "red-to-green",
    name: "Red to Green",
    shortName: "R2G",
    description: "Stock opens red, then reclaims prior close on volume. Reversal play.",
    icon: "🔀",
    color: "#10B981",
    conditions: [
      { id: "open-red", label: "Opens red", description: "Open below prior close", dataRequired: "quote", computable: true },
      { id: "reclaim-close", label: "Reclaims prior close", description: "Price crosses above yesterday's close", dataRequired: "quote", computable: true },
      { id: "volume-on-cross", label: "Volume on cross", description: "Above-average volume when crossing green", dataRequired: "quote", computable: true },
    ],
    dataRequired: ["quote"],
    entry: "Hold above prior close for 2+ candles",
    invalidation: "Fail back below prior close",
    targets: "T1: Pre-market high. T2: HOD or whole-dollar level.",
    rrDescription: "Stop below the low of the red-to-green candle. Typical 2:1.",
    regimeFit: "Recovery days. Works when sellers exhaust early.",
    alertRule: "Alert when red open reclaims prior close on volume",
    userParams: [
      { key: "minVolMultiple", label: "Min Vol Multiple", type: "number", default: 1.5, min: 1, max: 5, step: 0.5, unit: "x" },
    ],
    available: true,
  },

  "earnings-gap": {
    id: "earnings-gap",
    name: "Earnings Gap",
    shortName: "ERN",
    description: "Stock gaps on earnings report with volume. High-conviction catalyst play.",
    icon: "📊",
    color: "#F97316",
    conditions: [
      { id: "has-earnings", label: "Earnings reported", description: "Earnings released today or yesterday", dataRequired: "earnings", computable: true },
      { id: "gap-pct", label: "Gap ≥ threshold", description: "Pre-market gap ≥ 5% from prior close", dataRequired: "quote", computable: true },
      { id: "volume-surge", label: "Volume surge", description: "Relative volume ≥ 3x", dataRequired: "quote", computable: true },
      { id: "direction", label: "Clear direction", description: "Gap and price momentum align", dataRequired: "quote", computable: true },
      { id: "pmh-hold", label: "Holds above gap level", description: "Price sustains above gap open", dataRequired: "intraday", computable: false },
    ],
    dataRequired: ["quote", "earnings", "intraday"],
    entry: "Break above first 5-min high on volume (gap up) or break below first 5-min low (gap down)",
    invalidation: "Fills more than 50% of the gap",
    targets: "T1: Measured move equal to gap size. T2: Next resistance/support level.",
    rrDescription: "Stop at 50% gap fill. Typical 2:1–3:1.",
    regimeFit: "Any regime — earnings override market conditions. Strongest in first 30 min.",
    alertRule: "Alert when stock gaps on earnings with volume ≥ 3x",
    userParams: [
      { key: "minGapPct", label: "Min Gap %", type: "number", default: 5, min: 2, max: 30, step: 1, unit: "%" },
      { key: "minRvol", label: "Min RVOL", type: "number", default: 3, min: 1, max: 20, step: 1, unit: "x" },
    ],
    available: true,
  },

  "range-breakout": {
    id: "range-breakout",
    name: "Range Breakout",
    shortName: "RNG",
    description: "Stock breaks out of multi-day consolidation range on volume. Trend-start signal.",
    icon: "💥",
    color: "#14B8A6",
    conditions: [
      { id: "range-defined", label: "Tight range detected", description: "5–20 day consolidation with ≤ 10% range", dataRequired: "daily", computable: true },
      { id: "break-above", label: "Breaks range high", description: "Current price above the range high", dataRequired: "daily", computable: true },
      { id: "volume-confirm", label: "Breakout volume", description: "Volume ≥ 2x average on breakout day", dataRequired: "quote", computable: true },
      { id: "close-strong", label: "Closes near highs", description: "Close in upper 25% of day range", dataRequired: "intraday", computable: false },
    ],
    dataRequired: ["daily", "quote", "intraday"],
    entry: "Hold above range high for 15+ minutes with volume",
    invalidation: "Close back inside the range",
    targets: "T1: Measured move (range height added to breakout). T2: 1.5× measured move.",
    rrDescription: "Stop at range midpoint. Typical 2:1–4:1.",
    regimeFit: "Works in all regimes. Often precedes multi-day trend moves.",
    alertRule: "Alert when price breaks multi-day range high on volume",
    userParams: [
      { key: "minDays", label: "Min Range Days", type: "number", default: 5, min: 3, max: 20, step: 1 },
      { key: "maxRangePct", label: "Max Range %", type: "number", default: 10, min: 3, max: 25, step: 1, unit: "%" },
    ],
    available: true,
  },

  "oversold-bounce": {
    id: "oversold-bounce",
    name: "Oversold Bounce",
    shortName: "OSB",
    description: "RSI drops below 30, then curls up on increasing volume. Mean reversion play.",
    icon: "📈",
    color: "#22C55E",
    conditions: [
      { id: "rsi-oversold", label: "RSI was oversold", description: "14-day RSI dropped below 30 recently", dataRequired: "daily", computable: true },
      { id: "rsi-curling", label: "RSI curling up", description: "RSI rising from oversold territory", dataRequired: "daily", computable: true },
      { id: "price-reversal", label: "Price reversal", description: "Price now green after multi-day decline", dataRequired: "quote", computable: true },
      { id: "volume-increase", label: "Volume pickup", description: "Volume increasing on bounce day", dataRequired: "quote", computable: true },
    ],
    dataRequired: ["daily", "quote"],
    entry: "First green candle after RSI crosses back above 30",
    invalidation: "New low below the oversold low",
    targets: "T1: 20-day moving average. T2: Prior swing high.",
    rrDescription: "Stop below the oversold low. Typical 2:1–3:1.",
    regimeFit: "Range-bound or recovery markets. Avoid in strong downtrends.",
    alertRule: "Alert when RSI crosses above 30 from below with volume",
    userParams: [
      { key: "rsiThreshold", label: "RSI Threshold", type: "number", default: 30, min: 15, max: 40, step: 5 },
    ],
    available: true,
  },

  "short-squeeze": {
    id: "short-squeeze",
    name: "Short Squeeze",
    shortName: "SQZ",
    description: "Low-float stock with extremely high daily volume relative to float. Squeeze potential.",
    icon: "🔥",
    color: "#EF4444",
    conditions: [
      { id: "low-float", label: "Low float", description: "Float ≤ 20M shares", dataRequired: "profile", computable: true },
      { id: "vol-to-float", label: "Volume vs float", description: "Daily volume ≥ 30% of float", dataRequired: "profile", computable: true },
      { id: "strong-move", label: "Strong move", description: "Price up ≥ 10% today", dataRequired: "quote", computable: true },
      { id: "rvol-extreme", label: "Extreme RVOL", description: "Relative volume ≥ 5x", dataRequired: "quote", computable: true },
      { id: "continuation", label: "Continuation building", description: "Price holding near highs of day", dataRequired: "intraday", computable: false },
    ],
    dataRequired: ["quote", "profile", "intraday"],
    entry: "New HOD break after consolidation with volume",
    invalidation: "Break below the prior consolidation low",
    targets: "T1: Next whole-dollar level. T2: 2× the move from today's open.",
    rrDescription: "Tight stop below consolidation. Typical 3:1+ (high R:R but volatile).",
    regimeFit: "Momentum/speculative days. Very volatile — small size only.",
    alertRule: "Alert when low-float stock has volume ≥ 30% of float with 10%+ gain",
    userParams: [
      { key: "maxFloat", label: "Max Float (M)", type: "number", default: 20, min: 1, max: 100, step: 5, unit: "M" },
      { key: "minChangePct", label: "Min Move %", type: "number", default: 10, min: 5, max: 50, step: 5, unit: "%" },
      { key: "minVolToFloat", label: "Min Vol/Float %", type: "number", default: 30, min: 10, max: 100, step: 10, unit: "%" },
    ],
    available: true,
  },
};

export const STRATEGY_LIST = Object.values(STRATEGIES);

export const FUTURE_STRATEGIES: Array<{ id: FutureStrategyId; name: string }> = [
  { id: "abcd", name: "ABCD Pattern" },
  { id: "flat-top-break", name: "Flat Top Breakout" },
  { id: "momentum-continuation", name: "Momentum Continuation" },
  { id: "sr-break-retest", name: "S/R Break & Retest" },
  { id: "failed-vwap-reclaim", name: "Failed VWAP Reclaim" },
  { id: "parabolic-fade", name: "Parabolic Fade" },
];

export interface SignalResult {
  symbol: string;
  strategyId: StrategyId;
  strategyName: string;
  state: SignalState;
  score: number;
  entryZone: string | null;
  invalidationLevel: string | null;
  target1: string | null;
  target2: string | null;
  rr: string | null;
  conditionsPassed: string[];
  conditionsFailed: string[];
  conditionsMissing: string[];
  reason: string;
  timestamp: number;
}

export function evaluateGapAndGo(
  quote: { price: number; changesPercentage: number; volume: number; avgVolume: number; previousClose: number; dayHigh: number; open: number },
  floatShares: number | null,
  hasCatalyst: boolean,
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const minPrice = Number(params.minPrice ?? 2);
  const maxPrice = Number(params.maxPrice ?? 10);
  const minGapPct = Number(params.minGapPct ?? 10);
  const minRvol = Number(params.minRvol ?? 5);
  const maxFloat = Number(params.maxFloat ?? 20);

  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const gapPct = quote.previousClose > 0
    ? ((quote.open - quote.previousClose) / quote.previousClose) * 100
    : quote.changesPercentage;
  const floatM = floatShares ? floatShares / 1_000_000 : null;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  if (quote.price >= minPrice && quote.price <= maxPrice) passed.push("price-range");
  else failed.push("price-range");

  if (gapPct >= minGapPct) passed.push("gap-pct");
  else failed.push("gap-pct");

  if (rvol >= minRvol) passed.push("pm-volume");
  else failed.push("pm-volume");

  if (hasCatalyst) passed.push("catalyst");
  else failed.push("catalyst");

  if (floatM !== null) {
    if (floatM <= maxFloat) passed.push("float");
    else failed.push("float");
  } else {
    missing.push("float");
  }

  missing.push("pmh-break");

  const computableTotal = passed.length + failed.length;
  const passRate = computableTotal > 0 ? passed.length / computableTotal : 0;

  let state: SignalState;
  if (passRate >= 0.8 && passed.length >= 3) state = "NEAR_TRIGGER";
  else if (passRate >= 0.5) state = "WATCH";
  else state = "INVALIDATED";

  const score = Math.round(passRate * 80 + (hasCatalyst ? 10 : 0) + (rvol >= 10 ? 10 : rvol >= 5 ? 5 : 0));

  const entryZone = state !== "INVALIDATED" ? `Above $${quote.dayHigh.toFixed(2)} (PMH/ORH)` : null;
  const stopLevel = state !== "INVALIDATED" && quote.open > 0 ? `$${(quote.open * 0.97).toFixed(2)} (below consolidation)` : null;
  const t1 = entryZone ? `$${(quote.dayHigh * 1.05).toFixed(2)} (5% above entry)` : null;
  const t2 = entryZone ? `$${(quote.dayHigh * 1.10).toFixed(2)} (10% above entry)` : null;
  const rr = entryZone ? "2:1 minimum" : null;

  const reasons: string[] = [];
  if (passed.includes("gap-pct")) reasons.push(`Gap ${gapPct.toFixed(1)}%`);
  if (passed.includes("pm-volume")) reasons.push(`RVOL ${rvol.toFixed(1)}x`);
  if (passed.includes("catalyst")) reasons.push("Has catalyst");
  if (floatM !== null && passed.includes("float")) reasons.push(`Float ${floatM.toFixed(1)}M`);

  return {
    symbol: "",
    strategyId: "gap-and-go",
    strategyName: "Gap & Go",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone,
    invalidationLevel: stopLevel,
    target1: t1,
    target2: t2,
    rr,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: reasons.join(" · ") || "Does not meet criteria",
    timestamp: Date.now(),
  };
}

export function evaluateHodBreakout(
  quote: { price: number; dayHigh: number; volume: number; avgVolume: number; changesPercentage: number },
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const hodProximityPct = Number(params.hodProximityPct ?? 2);
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const distToHod = quote.dayHigh > 0 ? ((quote.dayHigh - quote.price) / quote.dayHigh) * 100 : 100;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  if (distToHod <= hodProximityPct) passed.push("near-hod");
  else failed.push("near-hod");

  if (rvol >= 1.5) passed.push("volume-building");
  else failed.push("volume-building");

  missing.push("break-attempt");
  missing.push("confirm");

  const passRate = passed.length / (passed.length + failed.length || 1);
  let state: SignalState;
  if (passRate >= 1 && passed.length >= 2) state = "NEAR_TRIGGER";
  else if (passRate >= 0.5) state = "WATCH";
  else state = "INVALIDATED";

  const score = Math.round(passRate * 70 + (quote.changesPercentage >= 5 ? 15 : 5) + (rvol >= 3 ? 15 : 5));

  return {
    symbol: "",
    strategyId: "hod-breakout",
    strategyName: "HOD Breakout",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED" ? `Above $${quote.dayHigh.toFixed(2)}` : null,
    invalidationLevel: state !== "INVALIDATED" ? `Below $${(quote.dayHigh * 0.98).toFixed(2)}` : null,
    target1: state !== "INVALIDATED" ? `$${(quote.dayHigh * 1.03).toFixed(2)}` : null,
    target2: state !== "INVALIDATED" ? `$${(quote.dayHigh * 1.06).toFixed(2)}` : null,
    rr: state !== "INVALIDATED" ? "2:1" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: passed.length > 0 ? `${distToHod.toFixed(1)}% from HOD, RVOL ${rvol.toFixed(1)}x` : "Not near HOD",
    timestamp: Date.now(),
  };
}

export function evaluateRedToGreen(
  quote: { price: number; open: number; previousClose: number; volume: number; avgVolume: number },
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const minVolMultiple = Number(params.minVolMultiple ?? 1.5);
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const openedRed = quote.open < quote.previousClose;
  const reclaimedClose = quote.price > quote.previousClose;

  const passed: string[] = [];
  const failed: string[] = [];

  if (openedRed) passed.push("open-red");
  else failed.push("open-red");

  if (reclaimedClose) passed.push("reclaim-close");
  else failed.push("reclaim-close");

  if (rvol >= minVolMultiple) passed.push("volume-on-cross");
  else failed.push("volume-on-cross");

  const passRate = passed.length / 3;
  let state: SignalState;
  if (passRate >= 1) state = "ACTIVE";
  else if (passRate >= 0.67) state = "NEAR_TRIGGER";
  else if (openedRed) state = "WATCH";
  else state = "INVALIDATED";

  const score = Math.round(passRate * 80 + (rvol >= 3 ? 20 : rvol >= 1.5 ? 10 : 0));

  return {
    symbol: "",
    strategyId: "red-to-green",
    strategyName: "Red to Green",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED" ? `Above $${quote.previousClose.toFixed(2)}` : null,
    invalidationLevel: state !== "INVALIDATED" ? `Below $${(quote.open < quote.previousClose ? quote.open : quote.price * 0.97).toFixed(2)}` : null,
    target1: state !== "INVALIDATED" ? `$${(quote.previousClose * 1.03).toFixed(2)}` : null,
    target2: state !== "INVALIDATED" ? `$${(quote.previousClose * 1.06).toFixed(2)}` : null,
    rr: state !== "INVALIDATED" ? "2:1" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: [],
    reason: passed.length > 0 ? `${openedRed ? "Opened red" : ""}${reclaimedClose ? ", reclaimed close" : ""}${rvol >= minVolMultiple ? `, RVOL ${rvol.toFixed(1)}x` : ""}`.replace(/^, /, "") : "Did not open red",
    timestamp: Date.now(),
  };
}

export function evaluateOpeningRangeBreakout(
  quote: { price: number; open: number; dayHigh: number; dayLow: number; volume: number; avgVolume: number; changesPercentage: number },
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const minVolMultiple = Number(params.minVolMultiple ?? 1.5);
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const trendUp = quote.price > quote.open;
  const breakFromOpen = quote.open > 0 ? Math.abs(quote.price - quote.open) / quote.open * 100 : 0;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  missing.push("or-defined");
  missing.push("or-break");

  if (rvol >= minVolMultiple) passed.push("volume-confirm");
  else failed.push("volume-confirm");

  missing.push("vwap-align");

  if (Math.abs(quote.changesPercentage) >= 2) passed.push("market-direction");
  else failed.push("market-direction");

  const computableTotal = passed.length + failed.length;
  const passRate = computableTotal > 0 ? passed.length / computableTotal : 0;

  let state: SignalState;
  if (passRate >= 1 && breakFromOpen >= 3) state = "NEAR_TRIGGER";
  else if (passRate >= 0.5 && breakFromOpen >= 1) state = "WATCH";
  else state = "INVALIDATED";

  const score = Math.round(passRate * 60 + (rvol >= 3 ? 20 : 10) + (breakFromOpen >= 5 ? 20 : breakFromOpen >= 2 ? 10 : 0));

  const dir = trendUp ? "long" : "short";
  return {
    symbol: "",
    strategyId: "opening-range-breakout",
    strategyName: "ORB",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED"
      ? trendUp ? `Above $${quote.dayHigh.toFixed(2)}` : `Below $${quote.dayLow.toFixed(2)}`
      : null,
    invalidationLevel: state !== "INVALIDATED" ? `$${quote.open.toFixed(2)} (back inside OR)` : null,
    target1: state !== "INVALIDATED"
      ? trendUp ? `$${(quote.dayHigh * 1.03).toFixed(2)}` : `$${(quote.dayLow * 0.97).toFixed(2)}`
      : null,
    target2: state !== "INVALIDATED"
      ? trendUp ? `$${(quote.dayHigh * 1.06).toFixed(2)}` : `$${(quote.dayLow * 0.94).toFixed(2)}`
      : null,
    rr: state !== "INVALIDATED" ? "2:1" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: state !== "INVALIDATED"
      ? `${dir} bias, RVOL ${rvol.toFixed(1)}x, ${breakFromOpen.toFixed(1)}% from open`
      : "Insufficient momentum for ORB",
    timestamp: Date.now(),
  };
}

export function evaluateFirstPullback(
  quote: { price: number; open: number; dayHigh: number; dayLow: number; volume: number; avgVolume: number; changesPercentage: number },
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const minImpulsePct = Number(params.minImpulsePct ?? 5);
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const impulseDetected = quote.changesPercentage >= minImpulsePct;
  const dayRange = quote.dayHigh - quote.dayLow;
  const pullbackFromHod = dayRange > 0 ? (quote.dayHigh - quote.price) / dayRange : 0;
  const hasPulledBack = pullbackFromHod >= 0.15 && pullbackFromHod <= 0.6;
  const stillTrending = quote.price > quote.open && quote.changesPercentage > 0;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  if (impulseDetected) passed.push("impulse");
  else failed.push("impulse");

  if (hasPulledBack) passed.push("pullback");
  else failed.push("pullback");

  if (stillTrending && hasPulledBack) passed.push("hl-pattern");
  else missing.push("hl-pattern");

  missing.push("continuation");

  const computableTotal = passed.length + failed.length;
  const passRate = computableTotal > 0 ? passed.length / computableTotal : 0;

  let state: SignalState;
  if (passed.includes("impulse") && passed.includes("pullback") && stillTrending) state = "NEAR_TRIGGER";
  else if (impulseDetected && passRate >= 0.5) state = "WATCH";
  else state = "INVALIDATED";

  const pullbackLevel = quote.dayHigh > 0 ? quote.price : 0;
  const score = Math.round(passRate * 60 + (impulseDetected ? 20 : 0) + (rvol >= 3 ? 20 : rvol >= 1.5 ? 10 : 0));

  return {
    symbol: "",
    strategyId: "first-pullback",
    strategyName: "First Pullback",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED" ? `Above $${pullbackLevel.toFixed(2)} (pullback high)` : null,
    invalidationLevel: state !== "INVALIDATED" ? `Below $${(quote.price * 0.97).toFixed(2)} (HL break)` : null,
    target1: state !== "INVALIDATED" ? `$${quote.dayHigh.toFixed(2)} (retest HOD)` : null,
    target2: state !== "INVALIDATED" ? `$${(quote.dayHigh * 1.05).toFixed(2)} (measured move)` : null,
    rr: state !== "INVALIDATED" ? "2:1–4:1" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: state !== "INVALIDATED"
      ? `+${quote.changesPercentage.toFixed(1)}% impulse, ${(pullbackFromHod * 100).toFixed(0)}% pullback from HOD`
      : "No impulse or pullback pattern",
    timestamp: Date.now(),
  };
}

export function evaluateVwapReclaim(
  quote: { price: number; open: number; previousClose: number; dayHigh: number; dayLow: number; volume: number; avgVolume: number },
  hasCatalyst: boolean,
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const openedWeak = quote.open < quote.previousClose;
  const reclaimedAboveOpen = quote.price > quote.open;
  const dayMidpoint = (quote.dayHigh + quote.dayLow) / 2;
  const aboveMidpoint = quote.price > dayMidpoint;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  if (openedWeak) passed.push("below-vwap");
  else failed.push("below-vwap");

  if (openedWeak && reclaimedAboveOpen && aboveMidpoint) passed.push("reclaim");
  else if (openedWeak) missing.push("reclaim");
  else failed.push("reclaim");

  if (rvol >= (Number(params.holdCandles) || 1.5)) passed.push("volume-surge");
  else failed.push("volume-surge");

  if (hasCatalyst) passed.push("context");
  else failed.push("context");

  const computableTotal = passed.length + failed.length;
  const passRate = computableTotal > 0 ? passed.length / computableTotal : 0;

  let state: SignalState;
  if (passed.includes("below-vwap") && passed.includes("reclaim") && passRate >= 0.75) state = "NEAR_TRIGGER";
  else if (openedWeak && passRate >= 0.5) state = "WATCH";
  else state = "INVALIDATED";

  const score = Math.round(passRate * 70 + (hasCatalyst ? 15 : 0) + (rvol >= 3 ? 15 : 5));

  return {
    symbol: "",
    strategyId: "vwap-reclaim",
    strategyName: "VWAP Reclaim",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED" ? `Above $${quote.open.toFixed(2)} (hold above open)` : null,
    invalidationLevel: state !== "INVALIDATED" ? `Below $${quote.open.toFixed(2)}` : null,
    target1: state !== "INVALIDATED" ? `$${quote.dayHigh.toFixed(2)} (HOD)` : null,
    target2: state !== "INVALIDATED" ? `$${(quote.dayHigh * 1.03).toFixed(2)}` : null,
    rr: state !== "INVALIDATED" ? "2:1" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: state !== "INVALIDATED"
      ? `Opened weak, ${reclaimedAboveOpen ? "reclaimed" : "reclaiming"}, RVOL ${rvol.toFixed(1)}x`
      : "Did not open below value area",
    timestamp: Date.now(),
  };
}

export function evaluateVwapBounce(
  quote: { price: number; open: number; dayHigh: number; dayLow: number; volume: number; avgVolume: number; changesPercentage: number },
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const dayRange = quote.dayHigh - quote.dayLow;
  const dayMidpoint = (quote.dayHigh + quote.dayLow) / 2;
  const positionInRange = dayRange > 0 ? (quote.price - quote.dayLow) / dayRange : 0.5;
  const trendingUp = quote.changesPercentage > 0 && quote.price > quote.open;
  const nearMidpoint = Math.abs(quote.price - dayMidpoint) / (dayMidpoint || 1) < 0.03;
  const aboveMidpoint = quote.price >= dayMidpoint;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  if (trendingUp && aboveMidpoint) passed.push("above-vwap");
  else failed.push("above-vwap");

  if (positionInRange >= 0.3 && positionInRange <= 0.7) passed.push("approach");
  else failed.push("approach");

  missing.push("hold");

  if (trendingUp && rvol >= 1.5) passed.push("bounce");
  else if (trendingUp) missing.push("bounce");
  else failed.push("bounce");

  const computableTotal = passed.length + failed.length;
  const passRate = computableTotal > 0 ? passed.length / computableTotal : 0;

  let state: SignalState;
  if (passed.includes("above-vwap") && passed.includes("approach") && passRate >= 0.7) state = "NEAR_TRIGGER";
  else if (trendingUp && passRate >= 0.5) state = "WATCH";
  else state = "INVALIDATED";

  const score = Math.round(passRate * 60 + (trendingUp ? 20 : 0) + (rvol >= 3 ? 20 : rvol >= 1.5 ? 10 : 0));

  return {
    symbol: "",
    strategyId: "vwap-bounce",
    strategyName: "VWAP Bounce",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED" ? `Above $${dayMidpoint.toFixed(2)} (mid-range bounce)` : null,
    invalidationLevel: state !== "INVALIDATED" ? `Below $${dayMidpoint.toFixed(2)}` : null,
    target1: state !== "INVALIDATED" ? `$${quote.dayHigh.toFixed(2)} (HOD)` : null,
    target2: state !== "INVALIDATED" ? `$${(quote.dayHigh * 1.03).toFixed(2)}` : null,
    rr: state !== "INVALIDATED" ? "2:1–3:1" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: state !== "INVALIDATED"
      ? `${positionInRange >= 0.5 ? "Above" : "Near"} mid-range, RVOL ${rvol.toFixed(1)}x`
      : "Not trending above value area",
    timestamp: Date.now(),
  };
}

export function evaluateBullFlag(
  quote: { price: number; open: number; dayHigh: number; dayLow: number; volume: number; avgVolume: number; changesPercentage: number },
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const minPolePct = Number(params.minPolePct ?? 5);
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const hasStrongPole = quote.changesPercentage >= minPolePct;
  const dayRange = quote.dayHigh - quote.dayLow;
  const distFromHod = dayRange > 0 ? (quote.dayHigh - quote.price) / dayRange : 1;
  const tightAtTop = distFromHod <= 0.25;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  if (hasStrongPole) passed.push("pole");
  else failed.push("pole");

  if (tightAtTop && hasStrongPole) passed.push("coil");
  else if (hasStrongPole) failed.push("coil");
  else missing.push("coil");

  missing.push("vol-dryup");
  missing.push("break-vol");

  const computableTotal = passed.length + failed.length;
  const passRate = computableTotal > 0 ? passed.length / computableTotal : 0;

  let state: SignalState;
  if (passed.includes("pole") && passed.includes("coil")) state = "NEAR_TRIGGER";
  else if (hasStrongPole) state = "WATCH";
  else state = "INVALIDATED";

  const score = Math.round(passRate * 60 + (hasStrongPole ? 20 : 0) + (rvol >= 3 ? 20 : rvol >= 1.5 ? 10 : 0));

  return {
    symbol: "",
    strategyId: "bull-flag",
    strategyName: "Bull Flag",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED" ? `Above $${quote.dayHigh.toFixed(2)} (flag break)` : null,
    invalidationLevel: state !== "INVALIDATED" ? `Below $${(quote.price * 0.97).toFixed(2)} (flag low)` : null,
    target1: state !== "INVALIDATED" ? `$${(quote.dayHigh * 1.05).toFixed(2)} (measured move)` : null,
    target2: state !== "INVALIDATED" ? `$${(quote.dayHigh * 1.10).toFixed(2)} (1.5× measured)` : null,
    rr: state !== "INVALIDATED" ? "2:1–3:1" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: state !== "INVALIDATED"
      ? `+${quote.changesPercentage.toFixed(1)}% pole, ${(distFromHod * 100).toFixed(0)}% from HOD, RVOL ${rvol.toFixed(1)}x`
      : "No strong impulse detected",
    timestamp: Date.now(),
  };
}

// ── RSI helper ──────────────────────────────────────────────────────

export interface DailyCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function computeRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// ── Earnings Gap ────────────────────────────────────────────────────

export function evaluateEarningsGap(
  quote: { price: number; open: number; previousClose: number; dayHigh: number; dayLow: number; volume: number; avgVolume: number; changesPercentage: number },
  hasEarnings: boolean,
  hasCatalyst: boolean,
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const minGapPct = Number(params.minGapPct ?? 5);
  const minRvol = Number(params.minRvol ?? 3);
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const gapPct = quote.previousClose > 0
    ? ((quote.open - quote.previousClose) / quote.previousClose) * 100
    : quote.changesPercentage;
  const gapUp = gapPct >= minGapPct;
  const gapDown = gapPct <= -minGapPct;
  const hasGap = gapUp || gapDown;
  const dirAligned = gapUp ? quote.price >= quote.open : quote.price <= quote.open;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  if (hasEarnings) passed.push("has-earnings");
  else failed.push("has-earnings");

  if (hasGap) passed.push("gap-pct");
  else failed.push("gap-pct");

  if (rvol >= minRvol) passed.push("volume-surge");
  else failed.push("volume-surge");

  if (hasGap && dirAligned) passed.push("direction");
  else if (hasGap) failed.push("direction");
  else missing.push("direction");

  missing.push("pmh-hold");

  const computableTotal = passed.length + failed.length;
  const passRate = computableTotal > 0 ? passed.length / computableTotal : 0;

  let state: SignalState;
  if (hasEarnings && hasGap && passRate >= 0.75) state = "NEAR_TRIGGER";
  else if (hasEarnings && passRate >= 0.5) state = "WATCH";
  else if (hasGap && hasCatalyst && passRate >= 0.5) state = "WATCH";
  else state = "INVALIDATED";

  const score = Math.round(passRate * 70 + (hasEarnings ? 15 : 0) + (rvol >= 5 ? 15 : rvol >= 3 ? 10 : 0));

  const dir = gapUp ? "Gap up" : gapDown ? "Gap down" : "No gap";
  return {
    symbol: "",
    strategyId: "earnings-gap",
    strategyName: "Earnings Gap",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED"
      ? gapUp ? `Above $${quote.open.toFixed(2)} (gap open)` : `Below $${quote.open.toFixed(2)} (gap open)`
      : null,
    invalidationLevel: state !== "INVALIDATED"
      ? `$${((quote.open + quote.previousClose) / 2).toFixed(2)} (50% gap fill)`
      : null,
    target1: state !== "INVALIDATED"
      ? gapUp ? `$${(quote.open * 1.05).toFixed(2)}` : `$${(quote.open * 0.95).toFixed(2)}`
      : null,
    target2: state !== "INVALIDATED"
      ? gapUp ? `$${(quote.open * 1.10).toFixed(2)}` : `$${(quote.open * 0.90).toFixed(2)}`
      : null,
    rr: state !== "INVALIDATED" ? "2:1–3:1" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: state !== "INVALIDATED"
      ? `${dir} ${Math.abs(gapPct).toFixed(1)}%${hasEarnings ? " on earnings" : ""}, RVOL ${rvol.toFixed(1)}x`
      : "No earnings gap detected",
    timestamp: Date.now(),
  };
}

// ── Range Breakout ──────────────────────────────────────────────────

export function evaluateRangeBreakout(
  quote: { price: number; volume: number; avgVolume: number; dayHigh: number; dayLow: number; changesPercentage: number },
  candles: DailyCandle[],
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const minDays = Number(params.minDays ?? 5);
  const maxRangePct = Number(params.maxRangePct ?? 10);
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  let rangeHigh = 0;
  let rangeLow = Infinity;
  let consolidationDays = 0;
  let hasRange = false;

  if (candles.length >= minDays) {
    const lookback = candles.slice(-minDays);
    rangeHigh = Math.max(...lookback.map(c => c.high));
    rangeLow = Math.min(...lookback.map(c => c.low));
    const rangePct = rangeLow > 0 ? ((rangeHigh - rangeLow) / rangeLow) * 100 : 100;
    consolidationDays = lookback.length;
    hasRange = rangePct <= maxRangePct && consolidationDays >= minDays;

    if (hasRange) passed.push("range-defined");
    else failed.push("range-defined");

    if (hasRange && quote.price > rangeHigh) passed.push("break-above");
    else if (hasRange) failed.push("break-above");
    else missing.push("break-above");
  } else {
    missing.push("range-defined");
    missing.push("break-above");
  }

  if (rvol >= 2) passed.push("volume-confirm");
  else failed.push("volume-confirm");

  missing.push("close-strong");

  const computableTotal = passed.length + failed.length;
  const passRate = computableTotal > 0 ? passed.length / computableTotal : 0;

  let state: SignalState;
  if (passed.includes("range-defined") && passed.includes("break-above") && rvol >= 2) state = "ACTIVE";
  else if (passed.includes("range-defined") && passRate >= 0.5) state = "WATCH";
  else if (hasRange) state = "WATCH";
  else state = "INVALIDATED";

  const measuredMove = rangeHigh - rangeLow;
  const score = Math.round(passRate * 60 + (hasRange ? 20 : 0) + (rvol >= 3 ? 20 : rvol >= 2 ? 10 : 0));

  return {
    symbol: "",
    strategyId: "range-breakout",
    strategyName: "Range Breakout",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED" && rangeHigh > 0 ? `Above $${rangeHigh.toFixed(2)} (range high)` : null,
    invalidationLevel: state !== "INVALIDATED" && rangeHigh > 0
      ? `$${((rangeHigh + rangeLow) / 2).toFixed(2)} (range mid)`
      : null,
    target1: state !== "INVALIDATED" && rangeHigh > 0
      ? `$${(rangeHigh + measuredMove).toFixed(2)} (measured move)`
      : null,
    target2: state !== "INVALIDATED" && rangeHigh > 0
      ? `$${(rangeHigh + measuredMove * 1.5).toFixed(2)} (1.5× measured)`
      : null,
    rr: state !== "INVALIDATED" ? "2:1–4:1" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: state !== "INVALIDATED"
      ? `${consolidationDays}-day range, ${quote.price > rangeHigh ? "breaking out" : "near range high"}, RVOL ${rvol.toFixed(1)}x`
      : candles.length < minDays ? "Insufficient daily data" : "No consolidation range detected",
    timestamp: Date.now(),
  };
}

// ── Oversold Bounce ─────────────────────────────────────────────────

export function evaluateOversoldBounce(
  quote: { price: number; open: number; previousClose: number; volume: number; avgVolume: number; changesPercentage: number },
  candles: DailyCandle[],
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const rsiThreshold = Number(params.rsiThreshold ?? 30);
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  const closes = candles.map(c => c.close);
  const rsi = computeRSI(closes);
  const prevCloses = closes.slice(0, -1);
  const prevRsi = computeRSI(prevCloses);

  if (rsi !== null && prevRsi !== null) {
    const wasOversold = prevRsi <= rsiThreshold;
    const isCurling = rsi > prevRsi;
    const stillLow = rsi <= 50;

    if (wasOversold || rsi <= rsiThreshold) passed.push("rsi-oversold");
    else failed.push("rsi-oversold");

    if (wasOversold && isCurling && stillLow) passed.push("rsi-curling");
    else if (wasOversold) failed.push("rsi-curling");
    else missing.push("rsi-curling");
  } else {
    missing.push("rsi-oversold");
    missing.push("rsi-curling");
  }

  if (quote.changesPercentage > 0 && quote.price > quote.open) passed.push("price-reversal");
  else failed.push("price-reversal");

  if (rvol >= 1.5) passed.push("volume-increase");
  else failed.push("volume-increase");

  const computableTotal = passed.length + failed.length;
  const passRate = computableTotal > 0 ? passed.length / computableTotal : 0;

  let state: SignalState;
  if (passed.includes("rsi-oversold") && passed.includes("rsi-curling") && passRate >= 0.75) state = "ACTIVE";
  else if (passed.includes("rsi-oversold") && passRate >= 0.5) state = "NEAR_TRIGGER";
  else if (passed.includes("rsi-oversold")) state = "WATCH";
  else state = "INVALIDATED";

  const recentLow = candles.length > 0 ? Math.min(...candles.slice(-5).map(c => c.low)) : quote.price * 0.95;
  const sma20 = closes.length >= 20 ? closes.slice(-20).reduce((a, b) => a + b, 0) / 20 : null;
  const score = Math.round(passRate * 60 + (rsi !== null && rsi <= 30 ? 20 : 10) + (rvol >= 2 ? 20 : rvol >= 1.5 ? 10 : 0));

  return {
    symbol: "",
    strategyId: "oversold-bounce",
    strategyName: "Oversold Bounce",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED" ? `Above $${quote.price.toFixed(2)} (bounce confirmation)` : null,
    invalidationLevel: state !== "INVALIDATED" ? `Below $${recentLow.toFixed(2)} (new low)` : null,
    target1: sma20 && state !== "INVALIDATED" ? `$${sma20.toFixed(2)} (20-day MA)` : null,
    target2: state !== "INVALIDATED" && candles.length >= 5
      ? `$${Math.max(...candles.slice(-10).map(c => c.high)).toFixed(2)} (prior swing high)`
      : null,
    rr: state !== "INVALIDATED" ? "2:1–3:1" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: state !== "INVALIDATED"
      ? `RSI ${rsi?.toFixed(0) ?? "?"}, ${quote.changesPercentage > 0 ? "bouncing" : "still declining"}, RVOL ${rvol.toFixed(1)}x`
      : rsi !== null ? `RSI ${rsi.toFixed(0)} — not oversold` : "Insufficient data for RSI",
    timestamp: Date.now(),
  };
}

// ── Short Squeeze ───────────────────────────────────────────────────

export function evaluateShortSqueeze(
  quote: { price: number; open: number; dayHigh: number; dayLow: number; volume: number; avgVolume: number; changesPercentage: number },
  floatShares: number | null,
  params: Record<string, number | string | boolean> = {},
): SignalResult {
  const maxFloat = Number(params.maxFloat ?? 20);
  const minChangePct = Number(params.minChangePct ?? 10);
  const minVolToFloat = Number(params.minVolToFloat ?? 30);
  const rvol = quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const floatM = floatShares ? floatShares / 1_000_000 : null;
  const volToFloat = floatShares && floatShares > 0 ? (quote.volume / floatShares) * 100 : null;

  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];

  if (floatM !== null) {
    if (floatM <= maxFloat) passed.push("low-float");
    else failed.push("low-float");
  } else {
    missing.push("low-float");
  }

  if (volToFloat !== null) {
    if (volToFloat >= minVolToFloat) passed.push("vol-to-float");
    else failed.push("vol-to-float");
  } else {
    missing.push("vol-to-float");
  }

  if (quote.changesPercentage >= minChangePct) passed.push("strong-move");
  else failed.push("strong-move");

  if (rvol >= 5) passed.push("rvol-extreme");
  else failed.push("rvol-extreme");

  missing.push("continuation");

  const computableTotal = passed.length + failed.length;
  const passRate = computableTotal > 0 ? passed.length / computableTotal : 0;

  let state: SignalState;
  if (passRate >= 0.75 && passed.includes("strong-move")) state = "NEAR_TRIGGER";
  else if (passRate >= 0.5 && passed.includes("strong-move")) state = "WATCH";
  else state = "INVALIDATED";

  const score = Math.round(passRate * 60 + (volToFloat !== null && volToFloat >= 50 ? 20 : 10) + (rvol >= 10 ? 20 : rvol >= 5 ? 10 : 0));

  const reasons: string[] = [];
  if (floatM !== null) reasons.push(`Float ${floatM.toFixed(1)}M`);
  if (volToFloat !== null) reasons.push(`Vol/Float ${volToFloat.toFixed(0)}%`);
  reasons.push(`+${quote.changesPercentage.toFixed(1)}%`);
  reasons.push(`RVOL ${rvol.toFixed(1)}x`);

  return {
    symbol: "",
    strategyId: "short-squeeze",
    strategyName: "Short Squeeze",
    state,
    score: Math.min(100, Math.max(0, score)),
    entryZone: state !== "INVALIDATED" ? `Above $${quote.dayHigh.toFixed(2)} (new HOD)` : null,
    invalidationLevel: state !== "INVALIDATED" ? `Below $${(quote.price * 0.93).toFixed(2)}` : null,
    target1: state !== "INVALIDATED" ? `$${(quote.dayHigh * 1.10).toFixed(2)}` : null,
    target2: state !== "INVALIDATED" ? `$${(quote.dayHigh * 1.20).toFixed(2)}` : null,
    rr: state !== "INVALIDATED" ? "3:1+" : null,
    conditionsPassed: passed,
    conditionsFailed: failed,
    conditionsMissing: missing,
    reason: state !== "INVALIDATED" ? reasons.join(" · ") : "Does not meet squeeze criteria",
    timestamp: Date.now(),
  };
}
