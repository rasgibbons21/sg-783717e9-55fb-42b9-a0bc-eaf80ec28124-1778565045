import { describe, expect, it } from "vitest";
import { pickNudge } from "./nudges";
import type { Entry, Plan } from "./types";

const plan: Plan = {
  currency: "USD",
  payCents: 200000,
  payFrequency: "biweekly",
  nextPayday: "2026-11-13",
  bills: [],
  savePct: 10,
  goalCents: null,
  interestPct: 0,
  timeZone: "America/Chicago",
};

// 2026-11-08 in Chicago (UTC-6). The current pay period started on 2026-10-30.
const morning = new Date("2026-11-08T15:00:00Z");
const evening = new Date("2026-11-09T00:05:00Z"); // 18:05 local
const beforeSix = new Date("2026-11-08T23:55:00Z"); // 17:55 local

const saving = (occurredOn: string): Entry => ({ id: "s", kind: "saving", amountCents: 20000, category: "saving", note: null, occurredOn });
const spent = (occurredOn: string): Entry => ({ id: "e", kind: "expense", amountCents: 500, category: "groceries", note: null, occurredOn });

describe("pickNudge", () => {
  it("celebrates a milestone before anything else", () => {
    expect(pickNudge({ plan, entries: [], unseenMilestones: [50000, 25000], now: evening, paydayDismissedFor: null })).toEqual({ kind: "milestone", amountCents: 25000 });
  });

  it("asks about payday savings before asking her to log", () => {
    expect(pickNudge({ plan, entries: [], unseenMilestones: [], now: evening, paydayDismissedFor: null })).toEqual({ kind: "payday", saveCents: 20000 });
  });

  it("doesn't ask about payday once she has saved this period", () => {
    expect(pickNudge({ plan, entries: [saving("2026-10-31"), spent("2026-11-08")], unseenMilestones: [], now: evening, paydayDismissedFor: null })).toBeNull();
  });

  it("still asks if her last saving was in the previous period", () => {
    expect(pickNudge({ plan, entries: [saving("2026-10-29")], unseenMilestones: [], now: morning, paydayDismissedFor: null })).toEqual({ kind: "payday", saveCents: 20000 });
  });

  it("stays quiet about payday once she said not this time", () => {
    expect(pickNudge({ plan, entries: [spent("2026-11-08")], unseenMilestones: [], now: evening, paydayDismissedFor: "2026-10-30" })).toBeNull();
  });

  it("asks her to log after 6pm her time when today is empty", () => {
    expect(pickNudge({ plan, entries: [saving("2026-11-01")], unseenMilestones: [], now: evening, paydayDismissedFor: null })).toEqual({ kind: "logToday" });
  });

  it("doesn't ask before 6pm", () => {
    expect(pickNudge({ plan, entries: [saving("2026-11-01")], unseenMilestones: [], now: beforeSix, paydayDismissedFor: null })).toBeNull();
  });
});
