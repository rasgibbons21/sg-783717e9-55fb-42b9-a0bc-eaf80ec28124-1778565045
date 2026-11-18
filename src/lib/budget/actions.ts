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

/**
 * Fills one slot of a savings plan sheet: records it as a saving, then marks the slot.
 * If the sheet can't be updated, the saving is removed again so nothing is counted twice.
 */
export async function completeSlot(store: BudgetStore, challenge: Challenge, index: number, today: string, goalCents: number | null): Promise<Challenge> {
  const key = String(index);
  if (key in challenge.completed || index < 0 || index >= challenge.slots.length) return challenge;
  const entry = await store.addEntry({
    kind: "saving",
    amountCents: challenge.slots[index],
    category: "challenge",
    note: `${challenge.title}: slot ${index + 1}`.slice(0, 140),
    occurredOn: today,
  });
  const completed = { ...challenge.completed, [key]: entry.id };
  try {
    await store.updateChallenge(challenge.id, { completed });
  } catch (error) {
    await store.deleteEntry(entry.id).catch(() => undefined);
    throw error;
  }
  try {
    await recordNewMilestones(store, goalCents);
  } catch {
    // The slot is saved; milestones are checked again next time.
  }
  return { ...challenge, completed };
}

/** Un-ticks a slot tapped by mistake, removing the saving it recorded. Swept money stays swept. */
export async function uncompleteSlot(store: BudgetStore, challenge: Challenge, index: number): Promise<Challenge> {
  const key = String(index);
  const entryId = challenge.completed[key];
  if (!entryId) return challenge;
  if (savedCents(challenge) - challenge.slots[index] < challenge.sweptCents) {
    throw new Error("That slot's money was already swept to investing, so it stays filled.");
  }
  const completed = { ...challenge.completed };
  delete completed[key];
  await store.updateChallenge(challenge.id, { completed });
  await store.deleteEntry(entryId).catch(() => undefined);
  return { ...challenge, completed };
}

/** Records the sheet's saved, not-yet-swept money as moved into her investing goal. */
export async function sweepChallenge(store: BudgetStore, challenge: Challenge, today: string): Promise<Challenge> {
  const amount = sweepableCents(challenge);
  if (amount <= 0) return challenge;
  const entry = await store.addEntry({ kind: "sweep", amountCents: amount, category: "investing", note: `Swept from ${challenge.title}`.slice(0, 140), occurredOn: today });
  const sweptCents = challenge.sweptCents + amount;
  try {
    await store.updateChallenge(challenge.id, { sweptCents });
  } catch (error) {
    await store.deleteEntry(entry.id).catch(() => undefined);
    throw error;
  }
  return { ...challenge, sweptCents };
}
