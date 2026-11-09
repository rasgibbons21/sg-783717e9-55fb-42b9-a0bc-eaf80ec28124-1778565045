import { allocate } from "@/lib/budget/maths";
import type { Plan } from "@/lib/budget/types";

/** The example shown to visitors before they sign up. It runs through the real maths, so it can never disagree. */
export const SAMPLE_PLAN: Plan = {
  currency: "USD",
  payCents: 200000,
  payFrequency: "monthly",
  nextPayday: "2026-11-30",
  bills: [{ name: "Rent", amountCents: 90000, frequency: "monthly" }],
  savePct: 10,
  goalCents: null,
  interestPct: 0,
  timeZone: "UTC",
};

export const sampleAllocation = () => allocate(SAMPLE_PLAN);
