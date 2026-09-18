export const PRO_PLAN = {
  monthlyPrice: 4.99,
  yearlyPrice: 29.99,
  yearlyMonthly: (29.99 / 12).toFixed(2),
  lifetimePrice: 69.99,
  monthlyLabel: "$4.99/mo",
  yearlyLabel: "$29.99/yr",
  lifetimeLabel: "$69.99 one-time",
  yearlySavingsLabel: "Save 50%",
  benefits: [
    "AI-powered stock & crypto scanner — Gap-and-Go signals + crypto movers, scored and ranked daily.",
    "Pansy's trade analysis — AI trade plans with entry, stop, and targets on every top signal.",
    "Real-time TradingView charts — interactive charting for stocks, crypto, and forex.",
    "Unlimited market research — analyze any ticker, any time, no daily limits.",
    "Paper trading simulator — practice strategies risk-free with $10K virtual capital.",
    "Full education library — 150+ lessons, 32 strategies, and the trading psychology system.",
  ],
} as const;

export const FOUNDERS_PLAN = {
  monthlyPrice: 4.99,
  yearlyPrice: 29.99,
  lifetimePrice: 69.99,
  regularMonthlyPrice: 9.99,
  regularYearlyPrice: 59.99,
  regularLifetimePrice: 149.99,
} as const;
