import type { BudgetStore } from "./devStore";
import { newlyReached } from "./maths";
import type { Entry } from "./types";

/** Records any milestone her balance has just reached. Already-recorded milestones are left alone. */
export async function recordNewMilestones(store: BudgetStore, goalCents: number | null): Promise<void> {
  const [balance, known] = await Promise.all([store.getBalance(), store.listMilestones()]);
  const fresh = newlyReached(balance, known.map((m) => m.amountCents), goalCents);
  if (fresh.length > 0) await store.recordMilestones(fresh);
}

/**
 * Saves an entry, then checks milestones. Once the entry is saved this never throws, so she is never told
 * "that didn't save" about money that did save. A missed milestone is caught on the next change.
 */
export async function addEntryAndCheckMilestones(store: BudgetStore, entry: Omit<Entry, "id">, goalCents: number | null): Promise<Entry> {
  const saved = await store.addEntry(entry);
  if (entry.kind !== "expense") {
    try {
      await recordNewMilestones(store, goalCents);
    } catch {
      // The entry is safe; the milestone check runs again next time her savings change.
    }
  }
  return saved;
}

/** Wraps an action so repeated taps while it is running do nothing. */
export function singleFlight<T>(work: () => Promise<T>): () => Promise<T | undefined> {
  let running: Promise<T> | null = null;
  return () => {
    if (running) return Promise.resolve(undefined);
    running = work();
    return running.finally(() => {
      running = null;
    });
  };
}
