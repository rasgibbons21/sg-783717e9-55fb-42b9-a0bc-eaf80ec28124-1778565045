import { isSavingsDay } from "./challenges";
import { todayIn } from "./maths";
import type { PayFrequency, SavingsDays } from "./types";

const SAVINGS_DAYS: SavingsDays[] = ["payday", "fridays", "sundays", "daily", "twice_monthly"];
const PAY_FREQUENCIES: PayFrequency[] = ["weekly", "biweekly", "semimonthly", "monthly"];

export const SAVINGS_REMINDER = {
  title: "Pansy: it's your savings day",
  body: "It's your savings day! Tap your next blossom slot to keep your streak blooming.",
  url: "/budget",
};

interface PlanRow {
  user_id: string;
  savings_days: string;
  next_payday: string;
  pay_frequency: string;
  time_zone: string;
}

/** Notifications only go out between 8am and 9pm her time; otherwise Pansy reminds her in the app. */
export const QUIET_BEFORE = 8;
export const QUIET_FROM = 21;

function localHour(timeZone: string, now: Date): number {
  try {
    return Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(now));
  } catch {
    return now.getUTCHours();
  }
}

/** The members whose chosen savings day is today, each in her own time zone, and only in her daytime. */
export function dueForSavingsReminder(rows: PlanRow[], now: Date): string[] {
  return rows
    .filter((row) => {
      if (!SAVINGS_DAYS.includes(row.savings_days as SavingsDays)) return false;
      if (!PAY_FREQUENCIES.includes(row.pay_frequency as PayFrequency)) return false;
      const hour = localHour(row.time_zone || "UTC", now);
      if (hour < QUIET_BEFORE || hour >= QUIET_FROM) return false;
      const today = todayIn(row.time_zone || "UTC", now);
      return isSavingsDay(row.savings_days as SavingsDays, today, row.next_payday, row.pay_frequency as PayFrequency);
    })
    .map((row) => row.user_id);
}
