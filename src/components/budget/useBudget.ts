import { useCallback, useEffect, useMemo, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { BudgetError } from "@/lib/budget/api";
import { createMemoryStore, type BudgetStore } from "@/lib/budget/devStore";
import { newlyReached, periodBounds, todayIn } from "@/lib/budget/maths";
import { supabaseStore } from "@/lib/budget/store";
import type { Entry, Plan } from "@/lib/budget/types";

// One memory store for the whole dev-preview session, so data survives moving between pages.
let previewStore: BudgetStore | null = null;

const shiftDays = (day: string, days: number) => new Date(new Date(`${day}T00:00:00Z`).getTime() + days * 86_400_000).toISOString().slice(0, 10);

/** How far back to load: the previous pay period, and at least 60 days for the streak. */
function loadSince(plan: Plan): string {
  const today = todayIn(plan.timeZone);
  const current = periodBounds(plan.nextPayday, plan.payFrequency, today);
  const previous = periodBounds(plan.nextPayday, plan.payFrequency, shiftDays(current.start, -1));
  const sixtyDays = shiftDays(today, -60);
  return previous.start < sixtyDays ? previous.start : sixtyDays;
}

export interface BudgetState {
  plan: Plan | null;
  entries: Entry[];
  balance: number;
  milestones: { amountCents: number; seen: boolean }[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  add: (entry: Omit<Entry, "id">) => Promise<void>;
  update: (id: string, entry: Partial<Omit<Entry, "id">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  savePlan: (plan: Plan) => Promise<void>;
  markSeen: (amounts: number[]) => Promise<void>;
}

const message = (error: unknown) => (error instanceof BudgetError ? error.message : "Something went wrong. Please try again.");

export function useBudget(): BudgetState {
  const { userId, isLoggedIn } = useSubscription();
  const store = useMemo<BudgetStore>(() => {
    if (process.env.NODE_ENV === "development" && userId === "dev-preview") return (previewStore ??= createMemoryStore());
    return supabaseStore;
  }, [userId]);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [balance, setBalance] = useState(0);
  const [milestones, setMilestones] = useState<{ amountCents: number; seen: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const nextPlan = await store.getPlan();
      setPlan(nextPlan);
      if (nextPlan) {
        const [nextEntries, nextBalance, nextMilestones] = await Promise.all([store.listEntries(loadSince(nextPlan)), store.getBalance(), store.listMilestones()]);
        setEntries(nextEntries);
        setBalance(nextBalance);
        setMilestones(nextMilestones);
      }
      setError(null);
    } catch (problem) {
      setError(message(problem));
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, store]);

  useEffect(() => {
    reload();
  }, [reload]);

  /** After money moves in or out of savings, record any milestone she has just reached. */
  const afterSavingsChange = useCallback(async () => {
    const [nextBalance, known] = await Promise.all([store.getBalance(), store.listMilestones()]);
    const fresh = newlyReached(nextBalance, known.map((m) => m.amountCents), plan?.goalCents ?? null);
    if (fresh.length > 0) await store.recordMilestones(fresh);
  }, [store, plan]);

  // Writes throw a BudgetError so a form can keep her values and show the message beside them.
  const add = useCallback(
    async (entry: Omit<Entry, "id">) => {
      await store.addEntry(entry);
      if (entry.kind !== "expense") await afterSavingsChange();
      await reload();
    },
    [store, afterSavingsChange, reload],
  );

  const update = useCallback(
    async (id: string, entry: Partial<Omit<Entry, "id">>) => {
      await store.updateEntry(id, entry);
      await afterSavingsChange();
      await reload();
    },
    [store, afterSavingsChange, reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await store.deleteEntry(id);
      await reload();
    },
    [store, reload],
  );

  const savePlan = useCallback(
    async (next: Plan) => {
      await store.savePlan(next);
      await reload();
    },
    [store, reload],
  );

  const markSeen = useCallback(
    async (amounts: number[]) => {
      try {
        await store.markMilestonesSeen(amounts);
        setMilestones((current) => current.map((m) => (amounts.includes(m.amountCents) ? { ...m, seen: true } : m)));
      } catch {
        // Marking seen can wait until next time; the celebration still worked.
      }
    },
    [store],
  );

  return { plan, entries, balance, milestones, loading, error, reload, add, update, remove, savePlan, markSeen };
}
