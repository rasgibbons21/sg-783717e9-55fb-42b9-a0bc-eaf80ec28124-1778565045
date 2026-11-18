import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabase as typedClient } from "@/integrations/supabase/client";
import type { Challenge } from "./challenges";
import type { ChallengeChanges, NewChallenge } from "./devStore";
import { isReservedCategory, type Entry, type Plan, type SavingsDays } from "./types";

/** A kind, plain message for anything that goes wrong. Raw database errors never reach the screen. */
export class BudgetError extends Error {}

const SAVE_FAILED = "That didn't save. Please try again.";
const LOAD_FAILED = "We couldn't load your budget. Please try again.";

// The budget tables aren't in the generated database types, so they are read through an untyped view of the client
// and mapped by hand below.
const db = typedClient as unknown as SupabaseClient;

export const BillsSchema = z
  .array(
    z.object({
      name: z.string().trim().min(1).max(40),
      amountCents: z.number().int().positive(),
      frequency: z.enum(["weekly", "monthly", "yearly"]),
    }),
  )
  .max(15);

export const CategoriesSchema = z
  .array(z.string().trim().min(1).max(40).refine((name) => !isReservedCategory(name)))
  .max(20);

interface PlanRow {
  currency: string;
  pay_cents: number;
  pay_frequency: Plan["payFrequency"];
  next_payday: string;
  bills: Plan["bills"];
  save_pct: number;
  goal_cents: number | null;
  interest_pct: number | string;
  time_zone: string;
  categories?: string[] | null;
  savings_days?: SavingsDays | null;
  notify?: boolean | null;
}

interface ChallengeRow {
  id: string;
  template: Challenge["template"];
  title: string;
  slots: number[];
  completed: Record<string, string> | null;
  swept_cents: number;
  active: boolean;
}

interface EntryRow {
  id: string;
  kind: Entry["kind"];
  amount_cents: number;
  category: string;
  note: string | null;
  occurred_on: string;
}

const toPlan = (row: PlanRow): Plan => ({
  currency: row.currency,
  payCents: Number(row.pay_cents),
  payFrequency: row.pay_frequency,
  nextPayday: row.next_payday,
  bills: row.bills ?? [],
  savePct: Number(row.save_pct),
  goalCents: row.goal_cents === null ? null : Number(row.goal_cents),
  interestPct: Number(row.interest_pct),
  timeZone: row.time_zone,
  categories: row.categories ?? [],
  savingsDays: row.savings_days ?? "payday",
  notify: row.notify ?? false,
});

const toChallenge = (row: ChallengeRow): Challenge => ({
  id: row.id,
  template: row.template,
  title: row.title,
  slots: (row.slots ?? []).map(Number),
  completed: row.completed ?? {},
  sweptCents: Number(row.swept_cents),
  active: row.active,
});

const toEntry = (row: EntryRow): Entry => ({
  id: row.id,
  kind: row.kind,
  amountCents: Number(row.amount_cents),
  category: row.category,
  note: row.note,
  occurredOn: row.occurred_on,
});

async function userId(): Promise<string> {
  const { data } = await db.auth.getUser();
  if (!data.user) throw new BudgetError("Please sign in again.");
  return data.user.id;
}

function check<T>(response: { data: T; error: unknown }, message: string): T {
  if (response.error) throw new BudgetError(message);
  return response.data;
}

export async function getPlan(): Promise<Plan | null> {
  const row = check(await db.from("budget_plans").select("*").maybeSingle(), LOAD_FAILED) as PlanRow | null;
  return row ? toPlan(row) : null;
}

export async function savePlan(plan: Plan): Promise<void> {
  const bills = BillsSchema.safeParse(plan.bills);
  if (!bills.success) throw new BudgetError("Please check your bills. You can add up to 15, each with a name and an amount.");
  const categories = CategoriesSchema.safeParse(plan.categories ?? []);
  if (!categories.success) throw new BudgetError("Please check your categories. You can add up to 20, each up to 40 characters.");
  const user_id = await userId();
  check(
    await db.from("budget_plans").upsert({
      user_id,
      currency: plan.currency,
      pay_cents: plan.payCents,
      pay_frequency: plan.payFrequency,
      next_payday: plan.nextPayday,
      bills: bills.data,
      save_pct: plan.savePct,
      goal_cents: plan.goalCents,
      interest_pct: plan.interestPct,
      time_zone: plan.timeZone,
      categories: categories.data,
      savings_days: plan.savingsDays ?? "payday",
      notify: plan.notify ?? false,
      updated_at: new Date().toISOString(),
    }),
    SAVE_FAILED,
  );
}

export async function getBalance(): Promise<number> {
  return Number(check(await db.rpc("budget_balance"), LOAD_FAILED) ?? 0);
}

export async function getInvested(): Promise<number> {
  return Number(check(await db.rpc("budget_invested"), LOAD_FAILED) ?? 0);
}

export async function listChallenges(): Promise<Challenge[]> {
  const rows = check(await db.from("budget_challenges").select("id, template, title, slots, completed, swept_cents, active").order("created_at", { ascending: false }), LOAD_FAILED) as
    | ChallengeRow[]
    | null;
  return (rows ?? []).map(toChallenge);
}

export async function createChallenge(challenge: NewChallenge): Promise<Challenge> {
  const user_id = await userId();
  const row = check(
    await db.from("budget_challenges").insert({ user_id, template: challenge.template, title: challenge.title, slots: challenge.slots }).select("id, template, title, slots, completed, swept_cents, active").single(),
    SAVE_FAILED,
  ) as ChallengeRow;
  return toChallenge(row);
}

export async function updateChallenge(id: string, changes: ChallengeChanges): Promise<void> {
  const row: Record<string, unknown> = {};
  if (changes.sweptCents !== undefined) row.swept_cents = changes.sweptCents;
  if (changes.completed !== undefined) row.completed = changes.completed;
  if (changes.active !== undefined) row.active = changes.active;
  if (changes.title !== undefined) row.title = changes.title;
  check(await db.from("budget_challenges").update(row).eq("id", id), SAVE_FAILED);
}

export async function deleteChallenge(id: string): Promise<void> {
  check(await db.from("budget_challenges").delete().eq("id", id), SAVE_FAILED);
}

export async function listEntries(since: string): Promise<Entry[]> {
  const rows = check(
    await db.from("budget_entries").select("id, kind, amount_cents, category, note, occurred_on").gte("occurred_on", since).order("occurred_on", { ascending: false }).order("created_at", { ascending: false }).limit(500),
    LOAD_FAILED,
  ) as EntryRow[] | null;
  return (rows ?? []).map(toEntry);
}

export async function addEntry(entry: Omit<Entry, "id">): Promise<Entry> {
  const user_id = await userId();
  const row = check(
    await db
      .from("budget_entries")
      .insert({ user_id, kind: entry.kind, amount_cents: entry.amountCents, category: entry.category, note: entry.note, occurred_on: entry.occurredOn })
      .select("id, kind, amount_cents, category, note, occurred_on")
      .single(),
    SAVE_FAILED,
  ) as EntryRow;
  return toEntry(row);
}

export async function updateEntry(id: string, entry: Partial<Omit<Entry, "id">>): Promise<void> {
  const changes: Record<string, unknown> = {};
  if (entry.kind !== undefined) changes.kind = entry.kind;
  if (entry.amountCents !== undefined) changes.amount_cents = entry.amountCents;
  if (entry.category !== undefined) changes.category = entry.category;
  if (entry.note !== undefined) changes.note = entry.note;
  if (entry.occurredOn !== undefined) changes.occurred_on = entry.occurredOn;
  check(await db.from("budget_entries").update(changes).eq("id", id), SAVE_FAILED);
}

export async function deleteEntry(id: string): Promise<void> {
  check(await db.from("budget_entries").delete().eq("id", id), SAVE_FAILED);
}

export async function listMilestones(): Promise<{ amountCents: number; seen: boolean }[]> {
  const rows = check(await db.from("budget_milestones").select("amount_cents, seen_at").order("amount_cents"), LOAD_FAILED) as
    | { amount_cents: number; seen_at: string | null }[]
    | null;
  return (rows ?? []).map((row) => ({ amountCents: Number(row.amount_cents), seen: row.seen_at !== null }));
}

/** Records milestones once. A milestone already recorded, on any device, is left alone. */
export async function recordMilestones(amounts: number[]): Promise<void> {
  if (amounts.length === 0) return;
  const user_id = await userId();
  check(
    await db.from("budget_milestones").upsert(
      amounts.map((amount_cents) => ({ user_id, amount_cents })),
      { onConflict: "user_id,amount_cents", ignoreDuplicates: true },
    ),
    SAVE_FAILED,
  );
}

export async function markMilestonesSeen(amounts: number[]): Promise<void> {
  if (amounts.length === 0) return;
  check(await db.from("budget_milestones").update({ seen_at: new Date().toISOString() }).in("amount_cents", amounts).is("seen_at", null), SAVE_FAILED);
}

/** Fills a slot and records its saving in one database step (budget_fill_slot). */
export async function fillSlot(sheetId: string, index: number, day: string): Promise<void> {
  check(await db.rpc("budget_fill_slot", { sheet_id: sheetId, slot_index: index, day }), SAVE_FAILED);
}

/** Un-fills a slot and removes its saving in one database step. "already swept" is passed through for the sheet to explain. */
export async function unfillSlot(sheetId: string, index: number): Promise<void> {
  const { error } = await db.rpc("budget_unfill_slot", { sheet_id: sheetId, slot_index: index });
  if (error) {
    const message = (error as { message?: string }).message ?? "";
    throw new BudgetError(/already swept/i.test(message) ? "already swept" : SAVE_FAILED);
  }
}

/** Sweeps the sheet's unswept savings to investing, capped at her savings, in one database step. */
export async function sweepSheet(sheetId: string, day: string): Promise<number> {
  return Number(check(await db.rpc("budget_sweep", { sheet_id: sheetId, day }), SAVE_FAILED) ?? 0);
}
