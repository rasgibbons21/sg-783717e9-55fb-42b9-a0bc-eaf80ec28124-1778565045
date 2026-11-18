import fs from "fs";
import { describe, expect, it } from "vitest";

const sql = () => fs.readFileSync("supabase/migrations/20261108_budget.sql", "utf8");
const count = (text: string, pattern: RegExp) => (text.match(pattern) ?? []).length;

describe("budget migration", () => {
  it("moves the older budget tracker table aside instead of silently keeping it", () => {
    const text = sql();
    // The 2026-08 tracker created budget_entries with amount/date columns. Keeping it would make every save fail.
    expect(text).toMatch(/column_name = 'kind'/);
    expect(text).toContain("ALTER TABLE public.budget_entries RENAME TO budget_entries_legacy");
    expect(text.indexOf("RENAME TO budget_entries_legacy")).toBeLessThan(text.indexOf("CREATE TABLE IF NOT EXISTS budget_entries"));
  });

  it("deletes budget data with her account", () => {
    expect(count(sql(), /REFERENCES auth\.users\(id\) ON DELETE CASCADE/g)).toBe(4);
  });

  it("keeps every table private to its owner", () => {
    const text = sql();
    expect(count(text, /ENABLE ROW LEVEL SECURITY/g)).toBe(4);
    expect(count(text, /CREATE POLICY/g)).toBe(16);
    expect(count(text, /auth\.uid\(\) = user_id/g)).toBeGreaterThanOrEqual(16);
  });

  it("announces each milestone only once", () => {
    expect(sql()).toContain("PRIMARY KEY (user_id, amount_cents)");
  });

  it("works out savings and investing with her own permissions", () => {
    const text = sql();
    expect(text).toContain("SECURITY INVOKER");
    expect(text).toContain("GRANT EXECUTE ON FUNCTION budget_balance() TO authenticated");
    expect(text).toContain("GRANT EXECUTE ON FUNCTION budget_invested() TO authenticated");
  });

  it("supports income, savings sweeps, custom categories and savings days", () => {
    const text = sql();
    expect(text).toContain("CHECK (kind IN ('expense','saving','withdrawal','income','sweep'))");
    expect(text).toContain("categories JSONB NOT NULL DEFAULT '[]'::jsonb");
    expect(text).toContain("savings_days TEXT NOT NULL DEFAULT 'payday'");
  });

  it("stores savings plan sheets", () => {
    const text = sql();
    expect(text).toContain("CREATE TABLE IF NOT EXISTS budget_challenges");
    expect(text).toContain("CHECK (template IN ('week52','sprint30','envelope100','custom'))");
    expect(text).toMatch(/jsonb_array_length\(slots\) BETWEEN 1 AND 366/);
  });

  it("checks amounts and choices in the database too", () => {
    const text = sql();
    expect(text).toContain("CHECK (save_pct BETWEEN 1 AND 50)");
    expect(text).toContain("char_length(note) <= 140");
  });

  it("can be run twice without failing", () => {
    const text = sql();
    expect(count(text, /CREATE TABLE IF NOT EXISTS/g)).toBe(4);
    expect(count(text, /DROP POLICY IF EXISTS/g)).toBe(16);
  });
});
