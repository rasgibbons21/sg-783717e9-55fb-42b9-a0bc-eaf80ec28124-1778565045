import { describe, expect, it, vi } from "vitest";
import { addEntryAndCheckMilestones, singleFlight } from "./actions";
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
