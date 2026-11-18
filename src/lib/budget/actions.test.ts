import { describe, expect, it, vi } from "vitest";
import { addEntryAndCheckMilestones, completeSlot, singleFlight, sweepChallenge, uncompleteSlot } from "./actions";
import { createMemoryStore } from "./devStore";

const saving = { kind: "saving" as const, amountCents: 50000, category: "saving", note: null, occurredOn: "2026-11-08" };

describe("addEntryAndCheckMilestones", () => {
  it("records milestones the saving reaches", async () => {
    const store = createMemoryStore();
    await addEntryAndCheckMilestones(store, saving, null);
    expect((await store.listMilestones()).map((m) => m.amountCents)).toEqual([10000, 25000, 50000]);
  });

  it("still succeeds when the milestone step fails, so she never saves the same money twice", async () => {
    const store = createMemoryStore();
    store.recordMilestones = vi.fn().mockRejectedValue(new Error("network"));
    await expect(addEntryAndCheckMilestones(store, saving, null)).resolves.toMatchObject({ amountCents: 50000 });
    expect(await store.getBalance()).toBe(50000);
  });

  it("skips milestones for spending", async () => {
    const store = createMemoryStore();
    store.recordMilestones = vi.fn();
    await addEntryAndCheckMilestones(store, { ...saving, kind: "expense", category: "groceries" }, null);
    expect(store.recordMilestones).not.toHaveBeenCalled();
  });
});

describe("singleFlight", () => {
  it("ignores a second tap while the first is still saving", async () => {
    let finish: () => void = () => undefined;
    const work = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const once = singleFlight(work);
    const first = once();
    once();
    once();
    expect(work).toHaveBeenCalledTimes(1);
    finish();
    await first;
    once();
    expect(work).toHaveBeenCalledTimes(2);
  });

  it("lets her try again after a failure", async () => {
    const work = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
    const once = singleFlight(work);
    await once().catch(() => undefined);
    await once();
    expect(work).toHaveBeenCalledTimes(2);
  });
});

describe("savings plan sheet actions", () => {
  const setup = async () => {
    const store = createMemoryStore();
    const sheet = await store.createChallenge({ template: "sprint30", title: "30-Day Sprint", slots: [1000, 1000, 1000] });
    return { store, sheet };
  };

  it("fills a slot as a saving and remembers which entry it was", async () => {
    const { store, sheet } = await setup();
    const filled = await completeSlot(store, sheet, 1, "2026-11-20", null);
    expect(Object.keys(filled.completed)).toEqual(["1"]);
    expect(await store.getBalance()).toBe(1000);
    expect((await store.listChallenges())[0].completed).toEqual(filled.completed);
  });

  it("doesn't double-fill a slot", async () => {
    const { store, sheet } = await setup();
    const once = await completeSlot(store, sheet, 0, "2026-11-20", null);
    await completeSlot(store, once, 0, "2026-11-20", null);
    expect(await store.getBalance()).toBe(1000);
  });

  it("undoes a slot she tapped by mistake", async () => {
    const { store, sheet } = await setup();
    const filled = await completeSlot(store, sheet, 0, "2026-11-20", null);
    const undone = await uncompleteSlot(store, filled, 0);
    expect(undone.completed).toEqual({});
    expect(await store.getBalance()).toBe(0);
  });

  it("keeps both slots when two fills start from the same sheet on screen", async () => {
    const { store, sheet } = await setup();
    await Promise.all([completeSlot(store, sheet, 0, "2026-11-20", null), completeSlot(store, sheet, 1, "2026-11-20", null)]);
    const [saved] = await store.listChallenges();
    expect(Object.keys(saved.completed).sort()).toEqual(["0", "1"]);
    expect(await store.getBalance()).toBe(2000);
  });

  it("never sweeps more than her savings, even after a withdrawal", async () => {
    const { store, sheet } = await setup();
    let current = await completeSlot(store, sheet, 0, "2026-11-20", null);
    current = await completeSlot(store, current, 1, "2026-11-20", null);
    await store.addEntry({ kind: "withdrawal", amountCents: 1500, category: "withdrawal", note: null, occurredOn: "2026-11-20" });
    current = await sweepChallenge(store, current, "2026-11-21");
    expect(await store.getInvested()).toBe(500);
    expect(await store.getBalance()).toBe(0);
    expect(current.sweptCents).toBe(500);
  });

  it("won't un-tick a slot whose money was already swept to investing", async () => {
    const { store, sheet } = await setup();
    let current = await completeSlot(store, sheet, 0, "2026-11-20", null);
    current = await sweepChallenge(store, current, "2026-11-21");
    await expect(uncompleteSlot(store, current, 0)).rejects.toThrow("already swept");
    expect(await store.getInvested()).toBe(1000);
  });

  it("sweeps saved slots into investing once", async () => {
    const { store, sheet } = await setup();
    let current = await completeSlot(store, sheet, 0, "2026-11-20", null);
    current = await completeSlot(store, current, 1, "2026-11-20", null);
    current = await sweepChallenge(store, current, "2026-11-21");
    expect(current.sweptCents).toBe(2000);
    expect(await store.getBalance()).toBe(0);
    expect(await store.getInvested()).toBe(2000);
    const again = await sweepChallenge(store, current, "2026-11-21");
    expect(await store.getInvested()).toBe(2000);
    expect(again.sweptCents).toBe(2000);
  });
});
