import { savedCents, type Challenge } from "./challenges";
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
  /** Fills a slot and records its saving in one step. Filling a filled slot changes nothing. */
  fillSlot(sheetId: string, index: number, day: string): Promise<void>;
  /** Un-fills a slot and removes its saving in one step. Throws "already swept" if that money was swept. */
  unfillSlot(sheetId: string, index: number): Promise<void>;
  /** Sweeps the sheet's unswept savings to investing, capped at her savings. Returns the amount. */
  sweepSheet(sheetId: string, day: string): Promise<number>;
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
    // These mirror the database functions: each reads the stored sheet, never a copy from the screen.
    fillSlot: async (sheetId, index, day) => {
      const sheet = challenges.find((c) => c.id === sheetId);
      if (!sheet) throw new Error("sheet not found");
      const key = String(index);
      if (key in sheet.completed) return;
      if (index < 0 || index >= sheet.slots.length) throw new Error("no such slot");
      const entry: Entry = {
        id: String(nextId++),
        kind: "saving",
        amountCents: sheet.slots[index],
        category: "challenge",
        note: `${sheet.title}: slot ${index + 1}`.slice(0, 140),
        occurredOn: day,
      };
      entries = [...entries, entry];
      sheet.completed = { ...sheet.completed, [key]: entry.id };
    },
    unfillSlot: async (sheetId, index) => {
      const sheet = challenges.find((c) => c.id === sheetId);
      if (!sheet) throw new Error("sheet not found");
      const key = String(index);
      const entryId = sheet.completed[key];
      if (!entryId) return;
      if (savedCents(sheet) - sheet.slots[index] < sheet.sweptCents) throw new Error("already swept");
      entries = entries.filter((e) => e.id !== entryId);
      sheet.completed = Object.fromEntries(Object.entries(sheet.completed).filter(([k]) => k !== key));
    },
    sweepSheet: async (sheetId, day) => {
      const sheet = challenges.find((c) => c.id === sheetId);
      if (!sheet) throw new Error("sheet not found");
      const amount = Math.min(savedCents(sheet) - sheet.sweptCents, balance(entries));
      if (amount <= 0) return 0;
      entries = [
        ...entries,
        { id: String(nextId++), kind: "sweep", amountCents: amount, category: "investing", note: `Swept from ${sheet.title}`.slice(0, 140), occurredOn: day },
      ];
      sheet.sweptCents += amount;
      return amount;
    },
  };
}
