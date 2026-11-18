import type { Challenge } from "./challenges";
import { balance, invested } from "./maths";
import type { Entry, Plan } from "./types";

export type NewChallenge = Pick<Challenge, "template" | "title" | "slots">;
export type ChallengeChanges = Partial<Pick<Challenge, "completed" | "sweptCents" | "active" | "title">>;

/** Everything the budget screens need from storage. The real one is Supabase; the dev preview uses memory. */
export interface BudgetStore {
  getPlan(): Promise<Plan | null>;
  savePlan(plan: Plan): Promise<void>;
  getBalance(): Promise<number>;
  getInvested(): Promise<number>;
  listEntries(since: string): Promise<Entry[]>;
  addEntry(entry: Omit<Entry, "id">): Promise<Entry>;
  updateEntry(id: string, entry: Partial<Omit<Entry, "id">>): Promise<void>;
  deleteEntry(id: string): Promise<void>;
  listMilestones(): Promise<{ amountCents: number; seen: boolean }[]>;
  recordMilestones(amounts: number[]): Promise<void>;
  markMilestonesSeen(amounts: number[]): Promise<void>;
  listChallenges(): Promise<Challenge[]>;
  createChallenge(challenge: NewChallenge): Promise<Challenge>;
  updateChallenge(id: string, changes: ChallengeChanges): Promise<void>;
  deleteChallenge(id: string): Promise<void>;
}

/** A store kept in memory, for trying the budget in the development preview without a real account. */
export function createMemoryStore(): BudgetStore {
  let plan: Plan | null = null;
  let entries: Entry[] = [];
  let challenges: Challenge[] = [];
  const milestones = new Map<number, boolean>();
  let nextId = 1;

  return {
    getPlan: async () => plan,
    savePlan: async (next) => {
      plan = next;
    },
    getBalance: async () => balance(entries),
    getInvested: async () => invested(entries),
    listEntries: async (since) =>
      entries.filter((e) => e.occurredOn >= since).sort((a, b) => (a.occurredOn < b.occurredOn ? 1 : a.occurredOn > b.occurredOn ? -1 : Number(b.id) - Number(a.id))),
    addEntry: async (entry) => {
      const saved = { ...entry, id: String(nextId++) };
      entries = [...entries, saved];
      return saved;
    },
    updateEntry: async (id, changes) => {
      entries = entries.map((e) => (e.id === id ? { ...e, ...changes } : e));
    },
    deleteEntry: async (id) => {
      entries = entries.filter((e) => e.id !== id);
    },
    listMilestones: async () => [...milestones.entries()].sort(([a], [b]) => a - b).map(([amountCents, seen]) => ({ amountCents, seen })),
    recordMilestones: async (amounts) => {
      for (const amount of amounts) if (!milestones.has(amount)) milestones.set(amount, false);
    },
    markMilestonesSeen: async (amounts) => {
      for (const amount of amounts) if (milestones.has(amount)) milestones.set(amount, true);
    },
    listChallenges: async () => challenges.map((c) => ({ ...c, completed: { ...c.completed } })).reverse(),
    createChallenge: async (input) => {
      const created: Challenge = { ...input, id: `c${nextId++}`, completed: {}, sweptCents: 0, active: true };
      challenges = [...challenges, created];
      return { ...created, completed: {} };
    },
    updateChallenge: async (id, changes) => {
      challenges = challenges.map((c) => (c.id === id ? { ...c, ...changes } : c));
    },
    deleteChallenge: async (id) => {
      challenges = challenges.filter((c) => c.id !== id);
    },
  };
}
