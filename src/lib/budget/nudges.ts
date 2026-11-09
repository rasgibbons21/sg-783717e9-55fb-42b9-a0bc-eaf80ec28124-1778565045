import { allocate, periodBounds, todayIn } from "./maths";
import type { Entry, Plan } from "./types";

export type Nudge = { kind: "milestone"; amountCents: number } | { kind: "payday"; saveCents: number } | { kind: "logToday" } | null;

function localHour(timeZone: string, now: Date): number {
  try {
    return Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(now));
  } catch {
    return now.getUTCHours();
  }
}

/** The one gentle card to show, if any: the largest new milestone first, then the payday check-in, then logging today. */
export function pickNudge(input: { plan: Plan; entries: Entry[]; unseenMilestones: number[]; now: Date; paydayDismissedFor: string | null }): Nudge {
  const { plan, entries, unseenMilestones, now, paydayDismissedFor } = input;
  if (unseenMilestones.length > 0) return { kind: "milestone", amountCents: Math.max(...unseenMilestones) };

  const today = todayIn(plan.timeZone, now);
  const { start } = periodBounds(plan.nextPayday, plan.payFrequency, today);
  const savedThisPeriod = entries.some((e) => e.kind === "saving" && e.occurredOn >= start);
  if (!savedThisPeriod && paydayDismissedFor !== start) return { kind: "payday", saveCents: allocate(plan).save };

  const loggedToday = entries.some((e) => e.occurredOn === today);
  if (!loggedToday && localHour(plan.timeZone, now) >= 18) return { kind: "logToday" };
  return null;
}
