export type SubscriptionTier = "free" | "desk" | "pro";

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

// Bloom is completely free, so every member has everything.
const FULL_ACCESS: Entitlements = {
  tier: "free",
  maxAlerts: Infinity,
  maxSavedScreens: Infinity,
  maxJournalEntries: Infinity,
  backtestTier: "none",
  scannerFull: false,
  paperFull: true,
  journalAnalytics: true,
  weeklyRecap: false,
};

export function getEntitlements(_tier: SubscriptionTier): Entitlements {
  return FULL_ACCESS;
}

export const APPLICATION_ID = "app.shebloomswealth.mobile";
