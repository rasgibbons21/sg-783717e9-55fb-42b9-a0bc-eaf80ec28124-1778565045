export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";
export type BillFrequency = "weekly" | "monthly" | "yearly";

export interface Bill {
  name: string;
  amountCents: number;
  frequency: BillFrequency;
}

/** Her save-first plan. Money is always whole cents. Dates are YYYY-MM-DD in her own time zone. */
export interface Plan {
  currency: string;
  payCents: number;
  payFrequency: PayFrequency;
  nextPayday: string;
  bills: Bill[];
  savePct: number;
  goalCents: number | null;
  interestPct: number;
  timeZone: string;
  /** Her own spending categories, added to the built-in ones. */
  categories?: string[];
  savingsDays?: SavingsDays;
  /** She asked for browser or phone notifications on savings days. */
  notify?: boolean;
}

/** income: money in beyond her usual pay. sweep: savings recorded as moved into her investing goal. */
export type EntryKind = "expense" | "saving" | "withdrawal" | "income" | "sweep";

/** When Pansy reminds her to save. */
export type SavingsDays = "payday" | "fridays" | "sundays" | "daily" | "twice_monthly";

export const SAVINGS_DAYS_LABEL: Record<SavingsDays, string> = {
  payday: "On payday",
  fridays: "Payday Fridays",
  sundays: "Weekly Sundays",
  daily: "Every day",
  twice_monthly: "Twice a month (1st and 15th)",
};

export interface Entry {
  id: string;
  kind: EntryKind;
  amountCents: number;
  category: string;
  note: string | null;
  occurredOn: string;
}

export const CATEGORIES = ["groceries", "eating-out", "transport", "home", "health", "personal", "family", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  groceries: "Groceries",
  "eating-out": "Eating out",
  transport: "Transport",
  home: "Home",
  health: "Health",
  personal: "Personal",
  family: "Kids & family",
  other: "Other",
};

/** A zero-amount marker for a day she chose to log as "nothing today", so her streak still counts. */
export const NOTHING_TODAY = "none";

/** Names Bloom uses itself, which her own categories can never take. */
export const RESERVED_CATEGORIES = new Set<string>([
  ...CATEGORIES,
  ...Object.values(CATEGORY_LABEL).map((label) => label.toLowerCase()),
  NOTHING_TODAY,
  "challenge",
  "investing",
  "saving",
  "withdrawal",
  "income",
  "sweep",
]);

export const isReservedCategory = (name: string) => RESERVED_CATEGORIES.has(name.trim().toLowerCase());

export const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD", "NZD", "ZAR", "NGN", "KES", "GHS", "INR", "JMD", "TTD"] as const;

export const PAY_FREQUENCY_LABEL: Record<PayFrequency, string> = {
  weekly: "Every week",
  biweekly: "Every 2 weeks",
  semimonthly: "Twice a month",
  monthly: "Every month",
};
