import { describe, expect, it } from "vitest";
import {
  allocate,
  balance,
  ladderCents,
  newlyReached,
  nextMilestone,
  perPayday,
  periodBounds,
  periodSpending,
  project,
  projectStepUp,
  streak,
  todayIn,
} from "./maths";
import { NOTHING_TODAY, type Entry, type Plan } from "./types";

const plan = (over: Partial<Plan> = {}): Plan => ({
  currency: "USD",
  payCents: 200000,
  payFrequency: "monthly",
  nextPayday: "2026-11-30",
  bills: [{ name: "Rent", amountCents: 90000, frequency: "monthly" }],
  savePct: 10,
  goalCents: null,
  interestPct: 0,
  timeZone: "America/Chicago",
  ...over,
});

let id = 0;
const entry = (kind: Entry["kind"], amountCents: number, occurredOn: string, category = "groceries"): Entry => ({
  id: String((id += 1)),
  kind,
  amountCents,
  category,
  note: null,
  occurredOn,
});

describe("perPayday", () => {
  it("spreads a bill across paydays", () => {
    expect(perPayday({ name: "Rent", amountCents: 120000, frequency: "monthly" }, "biweekly")).toBe(55385);
    expect(perPayday({ name: "Phone", amountCents: 5000, frequency: "monthly" }, "monthly")).toBe(5000);
    expect(perPayday({ name: "Insurance", amountCents: 120000, frequency: "yearly" }, "monthly")).toBe(10000);
    expect(perPayday({ name: "Bus", amountCents: 2000, frequency: "weekly" }, "weekly")).toBe(2000);
  });
});

describe("allocate", () => {
  it("takes savings first, then bills, and shows what's left", () => {
    expect(allocate(plan())).toEqual({
      pay: 200000,
      save: 20000,
      bills: 90000,
      spend: 90000,
      perDay: 3000,
      overspent: false,
      suggestedPct: null,
      billsExceedPay: false,
    });
  });

  it("suggests a savings rate that fits when the plan overspends", () => {
    const result = allocate(plan({ payCents: 100000, savePct: 30, bills: [{ name: "Rent", amountCents: 80000, frequency: "monthly" }] }));
    expect(result.overspent).toBe(true);
    expect(result.spend).toBe(0);
    expect(result.perDay).toBe(0);
    expect(result.suggestedPct).toBe(20);
    expect(result.billsExceedPay).toBe(false);
  });

  it("says so kindly when bills alone are more than pay", () => {
    const result = allocate(plan({ payCents: 100000, bills: [{ name: "Rent", amountCents: 120000, frequency: "monthly" }] }));
    expect(result.billsExceedPay).toBe(true);
    expect(result.suggestedPct).toBeNull();
    expect(result.spend).toBe(0);
  });
});

describe("projections", () => {
  it("adds up savings with no interest", () => {
    expect(project(5000, "biweekly", 12, 0)).toBe(130000);
  });

  it("compounds monthly when she adds interest", () => {
    expect(project(10000, "monthly", 12, 12)).toBe(126825);
  });

  it("grows faster when she steps her savings up each month", () => {
    expect(projectStepUp(5000, "biweekly", 12, 500, 0)).toBe(201500);
    expect(projectStepUp(5000, "biweekly", 12, 0, 0)).toBe(project(5000, "biweekly", 12, 0));
  });
});

describe("balance", () => {
  it("counts savings in and withdrawals out, and ignores spending", () => {
    expect(balance([entry("saving", 50000, "2026-11-01"), entry("withdrawal", 10000, "2026-11-02"), entry("expense", 9999, "2026-11-02")])).toBe(40000);
  });
});

describe("todayIn", () => {
  it("uses her local day, not the server's", () => {
    expect(todayIn("America/Chicago", new Date("2026-11-09T05:30:00Z"))).toBe("2026-11-08");
    expect(todayIn("Africa/Lagos", new Date("2026-11-08T23:30:00Z"))).toBe("2026-11-09");
  });
});

describe("periodBounds", () => {
  it("rolls a payday saved months ago forward to the current period", () => {
    expect(periodBounds("2026-08-07", "biweekly", "2026-11-08")).toEqual({ start: "2026-10-30", end: "2026-11-13" });
    expect(periodBounds("2026-08-07", "weekly", "2026-11-08")).toEqual({ start: "2026-11-06", end: "2026-11-13" });
  });

  it("keeps a month-end payday at the end of shorter months", () => {
    expect(periodBounds("2026-01-31", "monthly", "2026-11-08")).toEqual({ start: "2026-10-31", end: "2026-11-30" });
  });

  it("alternates the 1st and 16th for twice-monthly pay", () => {
    expect(periodBounds("2026-11-16", "semimonthly", "2026-11-20")).toEqual({ start: "2026-11-16", end: "2026-12-01" });
    expect(periodBounds("2026-11-16", "semimonthly", "2026-11-03")).toEqual({ start: "2026-11-01", end: "2026-11-16" });
  });

  it("starts a new period on payday itself", () => {
    expect(periodBounds("2026-11-13", "biweekly", "2026-11-13")).toEqual({ start: "2026-11-13", end: "2026-11-27" });
  });

  it("works when the saved payday is still ahead", () => {
    expect(periodBounds("2026-11-30", "monthly", "2026-11-08")).toEqual({ start: "2026-10-30", end: "2026-11-30" });
  });
});

describe("periodSpending", () => {
  it("counts spending since the period started", () => {
    const entries = [entry("expense", 1000, "2026-10-29"), entry("expense", 2000, "2026-10-30"), entry("expense", 3000, "2026-11-08"), entry("saving", 5000, "2026-11-01")];
    expect(periodSpending(entries, { start: "2026-10-30", end: "2026-11-13" }, "2026-11-08")).toBe(5000);
  });
});

describe("streak", () => {
  it("counts days in a row ending today", () => {
    expect(streak([entry("expense", 100, "2026-11-06"), entry("expense", 100, "2026-11-07"), entry("expense", 100, "2026-11-08")], "2026-11-08")).toBe(3);
  });

  it("still counts when she hasn't logged yet today", () => {
    expect(streak([entry("expense", 100, "2026-11-06"), entry("expense", 100, "2026-11-07")], "2026-11-08")).toBe(2);
  });

  it("resets after a missed day", () => {
    expect(streak([entry("expense", 100, "2026-11-05")], "2026-11-08")).toBe(0);
  });

  it("counts a no-spend day she logged", () => {
    expect(streak([entry("expense", 0, "2026-11-07", NOTHING_TODAY), entry("expense", 100, "2026-11-08")], "2026-11-08")).toBe(2);
  });
});

describe("milestones", () => {
  it("builds the ladder in cents, with her goal and no duplicates", () => {
    expect(ladderCents(null).slice(0, 3)).toEqual([10000, 25000, 50000]);
    expect(ladderCents(50000).filter((c) => c === 50000)).toHaveLength(1);
    expect(ladderCents(70000)).toContain(70000);
  });

  it("doesn't announce a milestone twice after a withdrawal", () => {
    expect(newlyReached(60000, [10000, 25000, 50000], null)).toEqual([]);
  });

  it("announces each new milestone once, including her goal", () => {
    expect(newlyReached(60000, [10000], 50000)).toEqual([25000, 50000]);
  });

  it("names the next milestone ahead", () => {
    expect(nextMilestone(60000, [10000, 25000, 50000], null)).toBe(100000);
    expect(nextMilestone(60000, [], 70000)).toBe(70000);
  });
});
