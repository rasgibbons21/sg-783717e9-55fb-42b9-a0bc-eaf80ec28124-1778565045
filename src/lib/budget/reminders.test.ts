import { describe, expect, it } from "vitest";
import { dueForSavingsReminder, SAVINGS_REMINDER } from "./reminders";

const row = (user_id: string, savings_days: string, time_zone = "America/Chicago") => ({
  user_id,
  savings_days,
  next_payday: "2026-11-13",
  pay_frequency: "biweekly",
  time_zone,
});

describe("dueForSavingsReminder", () => {
  // 2026-11-20 15:00 UTC is Friday 9am in Chicago and Friday 4pm in Lagos.
  const fridayMorning = new Date("2026-11-20T15:00:00Z");

  it("picks members whose savings day is today in their own time zone", () => {
    const due = dueForSavingsReminder([row("a", "fridays"), row("b", "sundays"), row("c", "daily"), row("d", "payday")], fridayMorning);
    expect(due).toEqual(["a", "c"]);
  });

  it("uses each member's local date", () => {
    // 2026-11-21 03:00 UTC is still Friday evening in Chicago, but Saturday in Lagos.
    const late = new Date("2026-11-21T03:00:00Z");
    expect(dueForSavingsReminder([row("chicago", "fridays"), row("lagos", "fridays", "Africa/Lagos")], late)).toEqual(["chicago"]);
  });

  it("skips rows with settings it doesn't recognise", () => {
    expect(dueForSavingsReminder([row("x", "hourly")], fridayMorning)).toEqual([]);
  });

  it("speaks in Pansy's voice", () => {
    expect(SAVINGS_REMINDER.body).toBe("It's your savings day! Tap your next blossom slot to keep your streak blooming.");
    expect(SAVINGS_REMINDER.url).toBe("/budget");
  });
});
