export const PRO_PLAN = {
  monthlyPrice: 7.99,
  yearlyPrice: 57.99,
  yearlyMonthly: (57.99 / 12).toFixed(2),
  monthlyLabel: "$7.99/mo",
  yearlyLabel: "$57.99/yr",
  yearlySavingsLabel: "Save 40% · nearly 5 months free",
  benefits: [
    "Save your portfolio — your holdings and progress, there every time you come back.",
    "Unlock every locked lesson — the income-stream playbooks (real estate, digital products, affiliate, REITs, LLC, cash-flow business) plus the full trading-psychology system.",
    "Unlimited analysis — research any stock or ETF, as often as you want.",
    "Daily price charts and the latest news — on every stock and ETF you look up.",
    "Pansy, unlimited — ask your guide anything, anytime, with no daily limit.",
    "Your whole journey, tracked — completed lessons, saved analyses, progress over time.",
  ],
} as const;
