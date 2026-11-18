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

/** The members whose chosen savings day is today, each in her own time zone. */
export function dueForSavingsReminder(rows: PlanRow[], now: Date): string[] {
  return rows
    .filter((row) => {
      if (!SAVINGS_DAYS.includes(row.savings_days as SavingsDays)) return false;
      if (!PAY_FREQUENCIES.includes(row.pay_frequency as PayFrequency)) return false;
      const today = todayIn(row.time_zone || "UTC", now);
      return isSavingsDay(row.savings_days as SavingsDays, today, row.next_payday, row.pay_frequency as PayFrequency);
    })
    .map((row) => row.user_id);
}
