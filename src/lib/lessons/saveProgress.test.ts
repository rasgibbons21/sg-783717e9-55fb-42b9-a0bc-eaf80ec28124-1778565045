import { describe, expect, it, vi } from "vitest";
import { completeLesson } from "./saveProgress";

function fakeClient(results: { error: unknown }[]) {
  const upsert = vi.fn(async () => results.shift() ?? { error: null });
  return { client: { from: vi.fn(() => ({ upsert })) }, upsert };
}

describe("completeLesson", () => {
  it("saves once per member and lesson, so repeats can't earn extra blooms", async () => {
    const { client, upsert } = fakeClient([{ error: null }]);
    await expect(completeLesson(client as never, "user-1", "what-is-gold-trading", 3)).resolves.toBe(true);
    expect(client.from).toHaveBeenCalledWith("lesson_progress");
    const [row, options] = upsert.mock.calls[0] as unknown as [Record<string, unknown>, Record<string, unknown>];
    expect(row).toMatchObject({
      user_id: "user-1",
      lesson_id: "what-is-gold-trading",
      completed: true,
      quiz_completed: true,
      quiz_score: 3,
    });
    expect(options).toEqual({ onConflict: "user_id,lesson_id" });
  });

  it("retries after a failed save", async () => {
    const { client, upsert } = fakeClient([{ error: new Error("offline") }, { error: null }]);
    await expect(completeLesson(client as never, "user-1", "x", 1, 2, 0)).resolves.toBe(true);
    expect(upsert).toHaveBeenCalledTimes(2);
  });

  it("reports failure when every retry fails", async () => {
    const failure = { error: new Error("offline") };
    const { client, upsert } = fakeClient([failure, failure, failure]);
    await expect(completeLesson(client as never, "user-1", "x", 1, 2, 0)).resolves.toBe(false);
    expect(upsert).toHaveBeenCalledTimes(3);
  });
});
