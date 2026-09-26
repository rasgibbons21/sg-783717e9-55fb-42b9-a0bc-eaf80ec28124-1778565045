export type SubscriptionTier = "free" | "desk" | "pro";

export const DESK_PLAN = {
  monthlyPrice: 7.99,
  yearlyPrice: 69,
  yearlyMonthly: (69 / 12).toFixed(2),
  yearlySavings: "2+ months free",
  tagline: "Scan the open. Alert the setup. Log the trade.",
  cta: "$7.99/mo or $69/yr — Run the desk.",
} as const;

export const PRO_PLAN = {
  monthlyPrice: 24.99,
  yearlyPrice: 199,
  yearlyMonthly: (199 / 12).toFixed(2),
  yearlySavings: "2+ months free",
  tagline: "More alerts, full journal review, backtest the rule.",
  cta: "$24.99/mo or $199/yr — More alerts. Full journal. Backtest.",
} as const;

export interface Entitlements {
  tier: SubscriptionTier;
  maxAlerts: number;
  maxSavedScreens: number;
  maxJournalEntries: number;
  backtestTier: "none" | "preset" | "custom";
  scannerFull: boolean;
  paperFull: boolean;
  journalAnalytics: boolean;
  weeklyRecap: boolean;
}

const TIER_ENTITLEMENTS: Record<SubscriptionTier, Entitlements> = {
  free: {
    tier: "free",
    maxAlerts: 3,
    maxSavedScreens: 1,
    maxJournalEntries: 10,
    backtestTier: "none",
    scannerFull: false,
    paperFull: false,
    journalAnalytics: false,
    weeklyRecap: false,
  },
  desk: {
    tier: "desk",
    maxAlerts: 15,
    maxSavedScreens: 5,
    maxJournalEntries: Infinity,
    backtestTier: "preset",
    scannerFull: true,
    paperFull: true,
    journalAnalytics: false,
    weeklyRecap: false,
  },
  pro: {
    tier: "pro",
    maxAlerts: 75,
    maxSavedScreens: 25,
    maxJournalEntries: Infinity,
    backtestTier: "custom",
    scannerFull: true,
    paperFull: true,
    journalAnalytics: true,
    weeklyRecap: true,
  },
};

export function getEntitlements(tier: SubscriptionTier): Entitlements {
  return TIER_ENTITLEMENTS[tier];
}

export const FEATURE_MATRIX = [
  { label: "Scanner", free: "Delayed", desk: "Full session scans", pro: "Faster refresh" },
  { label: "Saved screens", free: "1", desk: "5", pro: "25" },
  { label: "Alerts", free: "3", desk: "15", pro: "75" },
  { label: "Paper trading", free: "Limited", desk: "Full", pro: "Full + history" },
  { label: "Journal", free: "10 entries", desk: "Unlimited", pro: "Stats & recap" },
  { label: "Backtest", free: "—", desk: "2–3 presets", pro: "Custom + deep" },
  { label: "Academy", free: "Open", desk: "Open", pro: "Open" },
] as const;

export const APPLICATION_ID = "app.shebloomswealth.mobile";

// Legacy aliases — kept so existing imports don't break during migration.
// Remove once all references are updated.
export const CORE_PLAN = {
  monthlyPrice: DESK_PLAN.monthlyPrice,
  yearlyPrice: DESK_PLAN.yearlyPrice,
  yearlyMonthly: DESK_PLAN.yearlyMonthly,
  lifetimePrice: 69.99,
  monthlyLabel: `$${DESK_PLAN.monthlyPrice}/mo`,
  yearlyLabel: `$${DESK_PLAN.yearlyPrice}/yr`,
  lifetimeLabel: "$69.99 one-time",
  yearlySavingsLabel: "Best Value",
  benefits: [] as string[],
} as const;

export const FOUNDERS_PLAN = {
  monthlyPrice: DESK_PLAN.monthlyPrice,
  yearlyPrice: DESK_PLAN.yearlyPrice,
  lifetimePrice: 69.99,
  regularMonthlyPrice: 9.99,
  regularYearlyPrice: 79.99,
  regularLifetimePrice: 149.99,
} as const;
