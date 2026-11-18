import { describe, expect, it } from "vitest";
import {
  TEMPLATES,
  customSlots,
  isSavingsDay,
  savingsDayPrompt,
  nextSlotIndex,
  progress,
  savedCents,
  sweepableCents,
  templateSlots,
  type Challenge,
} from "./challenges";

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const challenge = (over: Partial<Challenge> = {}): Challenge => ({
  id: "c1",
  template: "week52",
  title: "52-Week Challenge",
  slots: templateSlots("week52"),
  completed: {},
  sweptCents: 0,
  active: true,
  ...over,
});

describe("templates", () => {
  it("builds the 52-week challenge toward $1,378", () => {
    const slots = templateSlots("week52");
    expect(slots).toHaveLength(52);
    expect(slots[0]).toBe(100);
    expect(slots[51]).toBe(5200);
    expect(sum(slots)).toBe(137800);
  });

  it("builds a 30-day sprint", () => {
    const slots = templateSlots("sprint30");
    expect(slots).toHaveLength(30);
    expect(sum(slots)).toBe(30000);
  });

  it("builds 100 envelopes from $1 to $100, totalling $5,050", () => {
    const slots = templateSlots("envelope100");
    expect(slots).toHaveLength(100);
    expect(slots[99]).toBe(10000);
    expect(sum(slots)).toBe(505000);
  });

  it("names every template", () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(["week52", "sprint30", "envelope100", "custom"]);
  });
});

describe("custom sheets", () => {
  it("splits her target evenly, with the cents landing on the last slot", () => {
    const slots = customSlots({ targetCents: 100000, count: 3, pattern: "equal" });
    expect(slots).toEqual([33333, 33333, 33334]);
  });

  it("grows step by step toward her target", () => {
    const slots = customSlots({ targetCents: 150000, count: 5, pattern: "increasing" });
    expect(sum(slots)).toBe(150000);
    expect(slots[0]).toBeLessThan(slots[4]);
    expect(slots.every((value, i) => i === 0 || value >= slots[i - 1])).toBe(true);
  });

  it("uses her own amount per slot", () => {
    expect(customSlots({ perSlotCents: 2500, count: 4, pattern: "equal" })).toEqual([2500, 2500, 2500, 2500]);
  });

  it("refuses sheets that can't be made", () => {
    expect(customSlots({ targetCents: 100, count: 0, pattern: "equal" })).toBeNull();
    expect(customSlots({ targetCents: 100, count: 400, pattern: "equal" })).toBeNull();
    expect(customSlots({ targetCents: 2, count: 5, pattern: "equal" })).toBeNull();
  });
});

describe("progress", () => {
  it("adds up completed slots and finds the next one", () => {
    const c = challenge({ completed: { "0": "e1", "2": "e3" } });
    expect(savedCents(c)).toBe(100 + 300);
    expect(nextSlotIndex(c)).toBe(1);
    expect(progress(c)).toBeCloseTo(400 / 137800, 6);
  });

  it("has no next slot once every slot is filled", () => {
    const slots = [100, 200];
    expect(nextSlotIndex(challenge({ slots, completed: { "0": "a", "1": "b" } }))).toBeNull();
  });

  it("only sweeps what hasn't been swept yet", () => {
    expect(sweepableCents(challenge({ completed: { "0": "e1", "1": "e2" }, sweptCents: 100 }))).toBe(200);
    expect(sweepableCents(challenge({ completed: {}, sweptCents: 0 }))).toBe(0);
  });
});

describe("savings days", () => {
  // 2026-11-20 is a Friday, 2026-11-22 a Sunday.
  it("knows each kind of savings day", () => {
    expect(isSavingsDay("fridays", "2026-11-20", "2026-11-30", "monthly")).toBe(true);
    expect(isSavingsDay("fridays", "2026-11-21", "2026-11-30", "monthly")).toBe(false);
    expect(isSavingsDay("sundays", "2026-11-22", "2026-11-30", "monthly")).toBe(true);
    expect(isSavingsDay("daily", "2026-11-21", "2026-11-30", "monthly")).toBe(true);
    expect(isSavingsDay("twice_monthly", "2026-11-15", "2026-11-30", "monthly")).toBe(true);
    expect(isSavingsDay("twice_monthly", "2026-11-01", "2026-11-30", "monthly")).toBe(true);
    expect(isSavingsDay("twice_monthly", "2026-11-16", "2026-11-30", "monthly")).toBe(false);
  });

  it("treats payday as her savings day", () => {
    expect(isSavingsDay("payday", "2026-11-13", "2026-11-13", "biweekly")).toBe(true);
    expect(isSavingsDay("payday", "2026-11-27", "2026-11-13", "biweekly")).toBe(true);
    expect(isSavingsDay("payday", "2026-11-20", "2026-11-13", "biweekly")).toBe(false);
  });
});

describe("savingsDayPrompt", () => {
  const plan = { nextPayday: "2026-11-30", payFrequency: "monthly" as const, savingsDays: "fridays" as const };
  const sheet = challenge({ slots: [100, 200, 300], completed: { "0": "e1" } });

  it("offers her next slot on a savings day", () => {
    expect(savingsDayPrompt({ plan, sheet, entries: [], today: "2026-11-20", dismissedFor: null })).toEqual({ index: 1, amountCents: 200 });
  });

  it("stays quiet on other days", () => {
    expect(savingsDayPrompt({ plan, sheet, entries: [], today: "2026-11-21", dismissedFor: null })).toBeNull();
  });

  it("stays quiet once she filled a slot today or said not today", () => {
    const filledToday = [{ id: "e9", kind: "saving" as const, amountCents: 200, category: "challenge", note: null, occurredOn: "2026-11-20" }];
    expect(savingsDayPrompt({ plan, sheet, entries: filledToday, today: "2026-11-20", dismissedFor: null })).toBeNull();
    expect(savingsDayPrompt({ plan, sheet, entries: [], today: "2026-11-20", dismissedFor: "2026-11-20" })).toBeNull();
  });

  it("stays quiet without a sheet or when the sheet is full", () => {
    expect(savingsDayPrompt({ plan, sheet: null, entries: [], today: "2026-11-20", dismissedFor: null })).toBeNull();
    const full = challenge({ slots: [100], completed: { "0": "e1" } });
    expect(savingsDayPrompt({ plan, sheet: full, entries: [], today: "2026-11-20", dismissedFor: null })).toBeNull();
  });
});
