import { savedCents, sweepableCents, type Challenge } from "./challenges";
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

const ALREADY_SWEPT = "That slot's money was already swept to investing, so it stays filled.";

/** The sheet as stored now, rather than the copy that was on screen. */
async function stored(store: BudgetStore, sheet: Challenge): Promise<Challenge> {
  return (await store.listChallenges()).find((c) => c.id === sheet.id) ?? sheet;
}

/** Fills one slot. The store records the saving and marks the slot in one step, so quick taps can't overwrite each other. */
export async function completeSlot(store: BudgetStore, challenge: Challenge, index: number, today: string, goalCents: number | null): Promise<Challenge> {
  if (String(index) in challenge.completed || index < 0 || index >= challenge.slots.length) return challenge;
  await store.fillSlot(challenge.id, index, today);
  try {
    await recordNewMilestones(store, goalCents);
  } catch {
    // The slot is saved; milestones are checked again next time.
  }
  return stored(store, challenge);
}

/** Un-ticks a slot tapped by mistake, removing its saving in the same step. Swept money stays swept. */
export async function uncompleteSlot(store: BudgetStore, challenge: Challenge, index: number): Promise<Challenge> {
  if (!challenge.completed[String(index)]) return challenge;
  if (savedCents(challenge) - challenge.slots[index] < challenge.sweptCents) throw new Error(ALREADY_SWEPT);
  try {
    await store.unfillSlot(challenge.id, index);
  } catch (error) {
    if (error instanceof Error && /already swept/i.test(error.message)) throw new Error(ALREADY_SWEPT);
    throw error;
  }
  return stored(store, challenge);
}

/** Records the sheet's saved, not-yet-swept money as moved into her investing goal, never more than her savings. */
export async function sweepChallenge(store: BudgetStore, challenge: Challenge, today: string): Promise<Challenge> {
  if (sweepableCents(challenge) <= 0) return challenge;
  await store.sweepSheet(challenge.id, today);
  return stored(store, challenge);
}
