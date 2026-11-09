import { describe, expect, it } from "vitest";
import { createMemoryStore } from "./devStore";

describe("in-memory budget store for the dev preview", () => {
  it("keeps a plan and entries, and works out the balance", async () => {
    const store = createMemoryStore();
    expect(await store.getPlan()).toBeNull();
    const saved = await store.addEntry({ kind: "saving", amountCents: 50000, category: "saving", note: null, occurredOn: "2026-11-08" });
    await store.addEntry({ kind: "withdrawal", amountCents: 10000, category: "withdrawal", note: null, occurredOn: "2026-11-08" });
    await store.addEntry({ kind: "expense", amountCents: 999, category: "groceries", note: null, occurredOn: "2026-11-08" });
    expect(await store.getBalance()).toBe(40000);
    await store.updateEntry(saved.id, { amountCents: 60000 });
    expect(await store.getBalance()).toBe(50000);
    await store.deleteEntry(saved.id);
    expect(await store.getBalance()).toBe(-10000);
  });

  it("lists entries newest first from a date", async () => {
    const store = createMemoryStore();
    await store.addEntry({ kind: "expense", amountCents: 1, category: "other", note: null, occurredOn: "2026-11-01" });
    await store.addEntry({ kind: "expense", amountCents: 2, category: "other", note: null, occurredOn: "2026-11-05" });
    expect((await store.listEntries("2026-11-02")).map((e) => e.amountCents)).toEqual([2]);
  });

  it("records each milestone once and marks it seen", async () => {
    const store = createMemoryStore();
    await store.recordMilestones([10000, 25000]);
    await store.recordMilestones([10000]);
    expect(await store.listMilestones()).toEqual([
      { amountCents: 10000, seen: false },
      { amountCents: 25000, seen: false },
    ]);
    await store.markMilestonesSeen([10000]);
    expect((await store.listMilestones())[0]).toEqual({ amountCents: 10000, seen: true });
  });
});
