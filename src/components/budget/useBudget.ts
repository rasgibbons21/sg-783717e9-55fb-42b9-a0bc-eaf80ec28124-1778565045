import { useCallback, useEffect, useMemo, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { BudgetError } from "@/lib/budget/api";
import { createMemoryStore, type BudgetStore } from "@/lib/budget/devStore";
import { addEntryAndCheckMilestones, completeSlot, recordNewMilestones, sweepChallenge, uncompleteSlot } from "@/lib/budget/actions";
import type { Challenge } from "@/lib/budget/challenges";
import type { NewChallenge } from "@/lib/budget/devStore";
import { periodBounds, todayIn } from "@/lib/budget/maths";
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
  /** What she has swept from savings into her investing goal. */
  invested: number;
  challenges: Challenge[];
  milestones: { amountCents: number; seen: boolean }[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  add: (entry: Omit<Entry, "id">) => Promise<void>;
  update: (id: string, entry: Partial<Omit<Entry, "id">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  savePlan: (plan: Plan) => Promise<void>;
  markSeen: (amounts: number[]) => Promise<void>;
  createSheet: (sheet: NewChallenge) => Promise<void>;
  fillSlot: (sheet: Challenge, index: number) => Promise<void>;
  unfillSlot: (sheet: Challenge, index: number) => Promise<void>;
  sweep: (sheet: Challenge) => Promise<void>;
  archiveSheet: (sheet: Challenge) => Promise<void>;
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
  const [invested, setInvested] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
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
        const [nextEntries, nextBalance, nextMilestones, nextInvested, nextChallenges] = await Promise.all([
          store.listEntries(loadSince(nextPlan)),
          store.getBalance(),
          store.listMilestones(),
          store.getInvested(),
          store.listChallenges(),
        ]);
        setEntries(nextEntries);
        setBalance(nextBalance);
        setMilestones(nextMilestones);
        setInvested(nextInvested);
        setChallenges(nextChallenges);
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

  // Writes throw a BudgetError only when the write itself failed, so a form keeps her values and shows the message.
  // Once the write succeeds, the milestone check and the refresh can't turn it into a false "didn't save".
  const add = useCallback(
    async (entry: Omit<Entry, "id">) => {
      await addEntryAndCheckMilestones(store, entry, plan?.goalCents ?? null);
      await reload();
    },
    [store, plan, reload],
  );

  const update = useCallback(
    async (id: string, entry: Partial<Omit<Entry, "id">>) => {
      await store.updateEntry(id, entry);
      try {
        await recordNewMilestones(store, plan?.goalCents ?? null);
      } catch {
        // The change is saved; milestones are checked again next time.
      }
      await reload();
    },
    [store, plan, reload],
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

  const today = () => todayIn(plan?.timeZone ?? "UTC");

  // Sheet actions throw only when nothing was saved, and the screen always refreshes afterwards.
  const createSheet = useCallback(
    async (sheet: NewChallenge) => {
      await store.createChallenge(sheet);
      await reload();
    },
    [store, reload],
  );

  const fillSlot = useCallback(
    async (sheet: Challenge, index: number) => {
      try {
        await completeSlot(store, sheet, index, today(), plan?.goalCents ?? null);
      } finally {
        await reload();
      }
    },
    // today() reads plan, which is listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, plan, reload],
  );

  const unfillSlot = useCallback(
    async (sheet: Challenge, index: number) => {
      try {
        await uncompleteSlot(store, sheet, index);
      } finally {
        await reload();
      }
    },
    [store, reload],
  );

  const sweep = useCallback(
    async (sheet: Challenge) => {
      try {
        await sweepChallenge(store, sheet, today());
      } finally {
        await reload();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, plan, reload],
  );

  const archiveSheet = useCallback(
    async (sheet: Challenge) => {
      await store.updateChallenge(sheet.id, { active: false });
      await reload();
    },
    [store, reload],
  );

  return {
    plan,
    entries,
    balance,
    invested,
    challenges,
    milestones,
    loading,
    error,
    reload,
    add,
    update,
    remove,
    savePlan,
    markSeen,
    createSheet,
    fillSlot,
    unfillSlot,
    sweep,
    archiveSheet,
  };
}
