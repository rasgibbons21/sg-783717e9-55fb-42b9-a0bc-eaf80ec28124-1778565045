import { periodBounds } from "./maths";
import type { Entry, PayFrequency, SavingsDays } from "./types";

export type TemplateId = "week52" | "sprint30" | "envelope100" | "custom";

/** A savings plan sheet: numbered slots she fills in, each one a small amount set aside. */
export interface Challenge {
  id: string;
  template: TemplateId;
  title: string;
  /** Each slot's amount, in cents. */
  slots: number[];
  /** Filled slots: slot index (as text) to the saving entry that recorded it. */
  completed: Record<string, string>;
  /** How much of this sheet she has already swept into her investing goal. */
  sweptCents: number;
  active: boolean;
}

export const TEMPLATES: { id: TemplateId; title: string; blurb: string }[] = [
  { id: "week52", title: "52-Week Challenge", blurb: "Save $1 more each week, $1 to $52, for $1,378 in a year." },
  { id: "sprint30", title: "30-Day Sprint", blurb: "Thirty daily blossoms of $10, for $300 of quick momentum." },
  { id: "envelope100", title: "100-Envelope Grid", blurb: "One hundred numbered envelopes, $1 to $100, totalling $5,050." },
  { id: "custom", title: "Custom Sheet", blurb: "Your own target, number of slots and amounts." },
];

const range = (count: number) => Array.from({ length: count }, (_, i) => i + 1);

export function templateSlots(template: Exclude<TemplateId, "custom">): number[] {
  if (template === "week52") return range(52).map((week) => week * 100);
  if (template === "sprint30") return range(30).map(() => 1000);
  return range(100).map((envelope) => envelope * 100);
}

export const MAX_SLOTS = 366;

/**
 * A custom sheet: either her target split across the slots, or her own amount per slot.
 * "increasing" grows step by step, like the 52-week challenge. Returns null if the sheet can't be made.
 */
export function customSlots(input: { targetCents?: number; perSlotCents?: number; count: number; pattern: "equal" | "increasing" }): number[] | null {
  const { count, pattern } = input;
  if (!Number.isInteger(count) || count < 1 || count > MAX_SLOTS) return null;
  if (input.perSlotCents !== undefined) {
    return input.perSlotCents >= 1 ? range(count).map(() => input.perSlotCents as number) : null;
  }
  const target = input.targetCents ?? 0;
  if (!Number.isInteger(target) || target < count) return null;
  let slots: number[];
  if (pattern === "equal") {
    const base = Math.floor(target / count);
    slots = range(count).map(() => base);
  } else {
    const weights = (count * (count + 1)) / 2;
    slots = range(count).map((i) => Math.floor((target * i) / weights));
  }
  slots[count - 1] += target - slots.reduce((a, b) => a + b, 0);
  return slots.every((value) => value >= 1) ? slots : null;
}

export const totalCents = (challenge: Challenge) => challenge.slots.reduce((a, b) => a + b, 0);

export function savedCents(challenge: Challenge): number {
  return Object.keys(challenge.completed).reduce((sum, index) => sum + (challenge.slots[Number(index)] ?? 0), 0);
}

export function progress(challenge: Challenge): number {
  const total = totalCents(challenge);
  return total > 0 ? savedCents(challenge) / total : 0;
}

export function nextSlotIndex(challenge: Challenge): number | null {
  const index = challenge.slots.findIndex((_, i) => !(String(i) in challenge.completed));
  return index >= 0 ? index : null;
}

export function sweepableCents(challenge: Challenge): number {
  return Math.max(0, savedCents(challenge) - challenge.sweptCents);
}

/** Whether today (YYYY-MM-DD, her time zone) is one of her chosen savings days. */
export function isSavingsDay(days: SavingsDays, today: string, nextPayday: string, payFrequency: PayFrequency): boolean {
  const date = new Date(`${today}T00:00:00Z`);
  if (days === "daily") return true;
  if (days === "fridays") return date.getUTCDay() === 5;
  if (days === "sundays") return date.getUTCDay() === 0;
  if (days === "twice_monthly") return date.getUTCDate() === 1 || date.getUTCDate() === 15;
  return periodBounds(nextPayday, payFrequency, today).start === today;
}

/**
 * Pansy's savings-day card: on one of her savings days, offer the next empty slot of her sheet,
 * unless she already filled a slot today or said "not today".
 */
export function savingsDayPrompt(input: {
  plan: { nextPayday: string; payFrequency: PayFrequency; savingsDays?: SavingsDays };
  sheet: Challenge | null;
  entries: Entry[];
  today: string;
  dismissedFor: string | null;
}): { index: number; amountCents: number } | null {
  const { plan, sheet, entries, today, dismissedFor } = input;
  if (!sheet || dismissedFor === today) return null;
  if (!isSavingsDay(plan.savingsDays ?? "payday", today, plan.nextPayday, plan.payFrequency)) return null;
  if (entries.some((e) => e.category === "challenge" && e.occurredOn === today)) return null;
  const index = nextSlotIndex(sheet);
  return index === null ? null : { index, amountCents: sheet.slots[index] };
}
