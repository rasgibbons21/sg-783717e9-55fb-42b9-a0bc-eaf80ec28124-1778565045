import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: { table: string; op: string; args: unknown[] }[] = [];
let result: { data: unknown; error: unknown } = { data: null, error: null };
let user: { id: string } | null = { id: "user-1" };

vi.mock("@/integrations/supabase/client", () => {
  const builder = (table: string) => {
    const chain: Record<string, unknown> = {};
    for (const op of ["select", "insert", "upsert", "update", "delete", "eq", "gte", "in", "is", "order", "limit"]) {
      chain[op] = (...args: unknown[]) => {
        calls.push({ table, op, args });
        return chain;
      };
    }
    chain.maybeSingle = async () => result;
    chain.single = async () => result;
    chain.then = (resolve: (value: unknown) => void) => resolve(result);
    return chain;
  };
  return {
    supabase: {
      from: (table: string) => builder(table),
      rpc: async (name: string) => {
        calls.push({ table: name, op: "rpc", args: [] });
        return result;
      },
      auth: { getUser: async () => ({ data: { user }, error: null }) },
    },
  };
});

import { BudgetError, addEntry, getBalance, getPlan, listMilestones, recordMilestones, savePlan } from "./api";
import type { Plan } from "./types";

const plan: Plan = {
  currency: "USD",
  payCents: 200000,
  payFrequency: "monthly",
  nextPayday: "2026-11-30",
  bills: [{ name: "Rent", amountCents: 90000, frequency: "monthly" }],
  savePct: 10,
  goalCents: null,
  interestPct: 0,
  timeZone: "America/Chicago",
};

beforeEach(() => {
  calls.length = 0;
  result = { data: null, error: null };
  user = { id: "user-1" };
});

describe("budget data", () => {
  it("reads a plan back into Bloom's shape", async () => {
    result = {
      data: {
        currency: "USD",
        pay_cents: 200000,
        pay_frequency: "monthly",
        next_payday: "2026-11-30",
        bills: [{ name: "Rent", amountCents: 90000, frequency: "monthly" }],
        save_pct: 10,
        goal_cents: null,
        interest_pct: "0.00",
        time_zone: "America/Chicago",
      },
      error: null,
    };
    await expect(getPlan()).resolves.toEqual(plan);
  });

  it("returns no plan when she hasn't made one", async () => {
    await expect(getPlan()).resolves.toBeNull();
  });

  it("saves a plan as her own row", async () => {
    await savePlan(plan);
    const upsert = calls.find((c) => c.op === "upsert")!;
    expect(upsert.table).toBe("budget_plans");
    expect(upsert.args[0]).toMatchObject({ user_id: "user-1", pay_cents: 200000, pay_frequency: "monthly", save_pct: 10, time_zone: "America/Chicago" });
  });

  it("refuses more than 15 bills", async () => {
    const bills = Array.from({ length: 16 }, (_, i) => ({ name: `Bill ${i}`, amountCents: 100, frequency: "monthly" as const }));
    await expect(savePlan({ ...plan, bills })).rejects.toBeInstanceOf(BudgetError);
  });

  it("turns a database error into a kind message", async () => {
    result = { data: null, error: { message: "duplicate key value violates unique constraint" } };
    await expect(addEntry({ kind: "expense", amountCents: 1250, category: "groceries", note: null, occurredOn: "2026-11-08" })).rejects.toThrow(
      "That didn't save. Please try again.",
    );
  });

  it("asks her to sign in again when the session is gone", async () => {
    user = null;
    await expect(savePlan(plan)).rejects.toThrow("Please sign in again.");
  });

  it("reads her balance", async () => {
    result = { data: 45000, error: null };
    await expect(getBalance()).resolves.toBe(45000);
  });

  it("lists milestones and whether she has seen them", async () => {
    result = { data: [{ amount_cents: 10000, seen_at: "2026-11-01T00:00:00Z" }, { amount_cents: 25000, seen_at: null }], error: null };
    await expect(listMilestones()).resolves.toEqual([
      { amountCents: 10000, seen: true },
      { amountCents: 25000, seen: false },
    ]);
  });

  it("records new milestones without repeating old ones", async () => {
    await recordMilestones([25000]);
    const upsert = calls.find((c) => c.op === "upsert")!;
    expect(upsert.args).toEqual([[{ user_id: "user-1", amount_cents: 25000 }], { onConflict: "user_id,amount_cents", ignoreDuplicates: true }]);
  });

  it("does nothing when there are no new milestones", async () => {
    await recordMilestones([]);
    expect(calls).toEqual([]);
  });
});
