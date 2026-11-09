import fs from "fs";
import { describe, expect, it } from "vitest";

const sql = () => fs.readFileSync("supabase/migrations/20261108_budget.sql", "utf8");
const count = (text: string, pattern: RegExp) => (text.match(pattern) ?? []).length;

describe("budget migration", () => {
  it("deletes budget data with her account", () => {
    expect(count(sql(), /REFERENCES auth\.users\(id\) ON DELETE CASCADE/g)).toBe(3);
  });

  it("keeps every table private to its owner", () => {
    const text = sql();
    expect(count(text, /ENABLE ROW LEVEL SECURITY/g)).toBe(3);
    expect(count(text, /CREATE POLICY/g)).toBe(12);
    expect(count(text, /auth\.uid\(\) = user_id/g)).toBeGreaterThanOrEqual(12);
  });

  it("announces each milestone only once", () => {
    expect(sql()).toContain("PRIMARY KEY (user_id, amount_cents)");
  });

  it("works out the balance with her own permissions", () => {
    const text = sql();
    expect(text).toContain("SECURITY INVOKER");
    expect(text).toContain("GRANT EXECUTE ON FUNCTION budget_balance() TO authenticated");
  });

  it("checks amounts and choices in the database too", () => {
    const text = sql();
    expect(text).toContain("CHECK (save_pct BETWEEN 1 AND 50)");
    expect(text).toContain("CHECK (kind IN ('expense','saving','withdrawal'))");
    expect(text).toContain("char_length(note) <= 140");
  });

  it("can be run twice without failing", () => {
    const text = sql();
    expect(count(text, /CREATE TABLE IF NOT EXISTS/g)).toBe(3);
    expect(count(text, /DROP POLICY IF EXISTS/g)).toBe(12);
  });
});
