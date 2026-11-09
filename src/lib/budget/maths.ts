import type { Bill, BillFrequency, Entry, PayFrequency, Plan } from "./types";

export const PAYDAYS_PER_YEAR: Record<PayFrequency, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };
export const DAYS_IN_PERIOD: Record<PayFrequency, number> = { weekly: 7, biweekly: 14, semimonthly: 15, monthly: 30 };
const BILLS_PER_YEAR: Record<BillFrequency, number> = { weekly: 52, monthly: 12, yearly: 1 };

/** A bill's share of each payday, in cents. */
export function perPayday(bill: Bill, pay: PayFrequency): number {
  return Math.round((bill.amountCents * BILLS_PER_YEAR[bill.frequency]) / PAYDAYS_PER_YEAR[pay]);
}

export interface Allocation {
  pay: number;
  save: number;
  bills: number;
  spend: number;
  perDay: number;
  overspent: boolean;
  /** The highest whole savings % that still leaves room to spend, when the plan overspends. */
  suggestedPct: number | null;
  billsExceedPay: boolean;
}

/** Pay yourself first: savings come out first, then bills, and the rest is hers to spend. */
export function allocate(plan: Plan): Allocation {
  const pay = plan.payCents;
  const save = Math.round((pay * plan.savePct) / 100);
  const bills = plan.bills.reduce((sum, bill) => sum + perPayday(bill, plan.payFrequency), 0);
  const left = pay - save - bills;
  const overspent = left < 0;
  const billsExceedPay = bills > pay;
  const fits = Math.floor(((pay - bills) / pay) * 100);
  const suggestedPct = overspent && !billsExceedPay && fits >= 1 ? Math.min(fits, 50) : null;
  const spend = Math.max(0, left);
  return { pay, save, bills, spend, perDay: Math.floor(spend / DAYS_IN_PERIOD[plan.payFrequency]), overspent, suggestedPct, billsExceedPay };
}

/**
 * Savings after `months`, adding the monthly share of each payday's saving and compounding interest monthly.
 * `stepPerMonth` raises what she saves each month by that much after every month, matching "add $Z more each month".
 */
export function projectStepUp(savePerPayday: number, pay: PayFrequency, months: number, stepPerMonth: number, annualRatePct: number): number {
  const paydaysPerMonth = PAYDAYS_PER_YEAR[pay] / 12;
  const rate = annualRatePct / 1200;
  let total = 0;
  for (let month = 1; month <= months; month += 1) {
    const contribution = savePerPayday * paydaysPerMonth + stepPerMonth * (month - 1);
    total = total * (1 + rate) + contribution;
  }
  return Math.round(total);
}

export function project(savePerPayday: number, pay: PayFrequency, months: number, annualRatePct: number): number {
  return projectStepUp(savePerPayday, pay, months, 0, annualRatePct);
}

export function balance(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + (e.kind === "saving" ? e.amountCents : e.kind === "withdrawal" ? -e.amountCents : 0), 0);
}

/** Today's date where she lives, as YYYY-MM-DD. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

// Plain calendar dates, handled in UTC so no time zone can shift them.
const toDate = (day: string) => new Date(`${day}T00:00:00Z`);
const toDay = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (day: string, days: number) => toDay(new Date(toDate(day).getTime() + days * 86_400_000));
const daysBetween = (from: string, to: string) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / 86_400_000);
const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
const monthDay = (year: number, month: number, day: number) => {
  const y = year + Math.floor(month / 12);
  const m = ((month % 12) + 12) % 12;
  return toDay(new Date(Date.UTC(y, m, Math.min(day, daysInMonth(y, m)))));
};

/**
 * The pay period today falls in: it starts on the latest payday on or before today and ends on the next one.
 * A payday saved long ago, or one still ahead, is rolled to the current period.
 */
export function periodBounds(nextPayday: string, pay: PayFrequency, today: string): { start: string; end: string } {
  if (pay === "weekly" || pay === "biweekly") {
    const step = pay === "weekly" ? 7 : 14;
    const periods = Math.floor(daysBetween(nextPayday, today) / step);
    const start = addDays(nextPayday, periods * step);
    return { start, end: addDays(start, step) };
  }
  const now = toDate(today);
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const anchorDay = toDate(nextPayday).getUTCDate();
  if (pay === "semimonthly") {
    // Her two paydays, 15 days apart, taken from the payday she gave. The 15th (or a month-end payday) pairs with the last day.
    const anchor = toDate(nextPayday);
    const monthEnd = anchorDay === daysInMonth(anchor.getUTCFullYear(), anchor.getUTCMonth());
    const first = monthEnd || anchorDay === 15 ? 15 : anchorDay > 15 ? anchorDay - 15 : anchorDay;
    const secondIsEnd = monthEnd || first === 15;
    const paydays = [-1, 0, 1].flatMap((offset) => [
      monthDay(year, month + offset, first),
      monthDay(year, month + offset, secondIsEnd ? 31 : first + 15),
    ]);
    const start = paydays.filter((day) => day <= today).pop() as string;
    const end = paydays.find((day) => day > today) as string;
    return { start, end };
  }
  let offset = 0;
  if (monthDay(year, month, anchorDay) > today) offset = -1;
  return { start: monthDay(year, month + offset, anchorDay), end: monthDay(year, month + offset + 1, anchorDay) };
}

export function periodSpending(entries: Entry[], bounds: { start: string; end: string }, today: string): number {
  return entries.filter((e) => e.kind === "expense" && e.occurredOn >= bounds.start && e.occurredOn <= today).reduce((sum, e) => sum + e.amountCents, 0);
}

/** Days in a row she logged anything, ending today, or yesterday if she hasn't logged yet today. */
export function streak(entries: Entry[], today: string): number {
  const days = new Set(entries.map((e) => e.occurredOn));
  let cursor = days.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (days.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export const MILESTONE_LADDER = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];

export function ladderCents(goalCents: number | null): number[] {
  const ladder = MILESTONE_LADDER.map((amount) => amount * 100);
  if (goalCents && goalCents > 0) ladder.push(goalCents);
  return [...new Set(ladder)].sort((a, b) => a - b);
}

export function nextMilestone(balanceCents: number, reached: number[], goalCents: number | null): number | null {
  const done = new Set(reached);
  return ladderCents(goalCents).find((amount) => amount > balanceCents && !done.has(amount)) ?? null;
}

/** Milestones her balance has reached that haven't been announced yet. */
export function newlyReached(balanceCents: number, reached: number[], goalCents: number | null): number[] {
  const done = new Set(reached);
  return ladderCents(goalCents).filter((amount) => amount <= balanceCents && !done.has(amount));
}
