export const CORE_PLAN = {
  monthlyPrice: 4.99,
  yearlyPrice: 39.99,
  yearlyMonthly: (39.99 / 12).toFixed(2),
  lifetimePrice: 69.99,
  monthlyLabel: "$4.99/mo",
  yearlyLabel: "$39.99/yr",
  lifetimeLabel: "$69.99 one-time",
  yearlySavingsLabel: "Best Value",
  benefits: [
    "Stock screener — scored and ranked across 8 day-trading strategies.",
    "Price alerts — get notified when screens match or levels hit.",
    "Pansy AI analyst — entries, stops at invalidation, and take profit targets.",
    "Market briefings — Pansy watches news and top gainers.",
    "TradingView charts — interactive charting for U.S. stocks.",
    "Paper trading simulator — practice strategies risk-free with $10K virtual capital.",
  ],
} as const;

export const PLUS_PLAN = {
  monthlyPrice: 9.99,
  yearlyPrice: 79.99,
  yearlyMonthly: (79.99 / 12).toFixed(2),
  benefits: [
    "Everything in Core, plus:",
    "Morning Tape — daily movers with clues before the open.",
    "Open Radar — gap / open-drive watchlist with levels.",
    "Theme Desk — personalized stock baskets (For You screens).",
    "Level Seeker — high/low levels with invalidation markers.",
  ],
} as const;

export const RADAR_PRO_PLAN = {
  monthlyPrice: 19.99,
  yearlyPrice: 149.99,
  yearlyMonthly: (149.99 / 12).toFixed(2),
  benefits: [
    "Everything in Plus, plus:",
    "Options tape — real-time unusual activity feed.",
    "Unlimited Pansy analysis — no daily caps.",
    "Priority screener refresh — faster scan cycles.",
    "Full education library — 150+ lessons, 32 strategies.",
  ],
} as const;

export const FOUNDERS_PLAN = {
  monthlyPrice: 4.99,
  yearlyPrice: 39.99,
  lifetimePrice: 69.99,
  regularMonthlyPrice: 9.99,
  regularYearlyPrice: 79.99,
  regularLifetimePrice: 149.99,
} as const;

export const APPLICATION_ID = "app.shebloomswealth.mobile";
