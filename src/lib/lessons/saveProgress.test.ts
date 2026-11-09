import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { completeLesson, flushPendingCompletions, queueCompletion } from "./saveProgress";

vi.mock("@/lib/practice/api", () => ({ practiceFetch: vi.fn() }));

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  });
});

afterEach(() => vi.unstubAllGlobals());

const ok = () => vi.fn(async () => ({ ok: true, status: 200, data: { isNew: true } }));
const down = () => vi.fn(async () => ({ ok: false, status: 0, data: { error: "offline" } }));

describe("completeLesson", () => {
  it("records the lesson through the server", async () => {
    const post = ok();
    await expect(completeLesson("what-is-gold-trading", 3, post)).resolves.toEqual({ saved: true, isNew: true });
    const [path, options] = post.mock.calls[0] as unknown as [string, { method: string; body: string }];
    expect(path).toBe("/api/lessons/complete");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ slug: "what-is-gold-trading", score: 3 });
  });

  it("retries after a failed save", async () => {
    const post = vi.fn().mockResolvedValueOnce({ ok: false, status: 0, data: {} }).mockResolvedValueOnce({ ok: true, status: 200, data: { isNew: false } });
    await expect(completeLesson("x", 1, post, 2, 0)).resolves.toEqual({ saved: true, isNew: false });
    expect(post).toHaveBeenCalledTimes(2);
  });

  it("reports failure when every retry fails", async () => {
    const post = down();
    await expect(completeLesson("x", 1, post, 2, 0)).resolves.toEqual({ saved: false, isNew: false });
    expect(post).toHaveBeenCalledTimes(3);
  });
});

describe("pending completions", () => {
  it("saves a queued lesson the next time Bloom loads", async () => {
    queueCompletion("why-gold-moves", 2);
    const post = ok();
    await expect(flushPendingCompletions(post, 0, 0)).resolves.toEqual(["why-gold-moves"]);
    expect(store.size === 0 || store.values().next().value === "{}").toBe(true);
  });

  it("keeps a lesson queued while the server can't be reached", async () => {
    queueCompletion("why-gold-moves", 2);
    await expect(flushPendingCompletions(down(), 0, 0)).resolves.toEqual([]);
    const post = ok();
    await expect(flushPendingCompletions(post, 0, 0)).resolves.toEqual(["why-gold-moves"]);
  });

  it("carries on when storage is unavailable", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() => queueCompletion("x", 1)).not.toThrow();
    await expect(flushPendingCompletions(ok(), 0, 0)).resolves.toEqual([]);
  });
});

describe("test scores", () => {
  it("sends the test total with the score", async () => {
    const post = ok();
    await completeLesson("fair-value-gaps", 4, post, 0, 0, 5);
    const [, options] = post.mock.calls[0] as unknown as [string, { body: string }];
    expect(JSON.parse(options.body)).toEqual({ slug: "fair-value-gaps", score: 4, total: 5 });
  });

  it("keeps the total with a queued lesson", async () => {
    queueCompletion("fair-value-gaps", 4, 5);
    const post = ok();
    await flushPendingCompletions(post, 0, 0);
    const [, options] = post.mock.calls[0] as unknown as [string, { body: string }];
    expect(JSON.parse(options.body)).toEqual({ slug: "fair-value-gaps", score: 4, total: 5 });
  });

  it("still sends lessons queued by an older version without a total", async () => {
    store.set("bloom-pending-completions", JSON.stringify({ "why-gold-moves": 2 }));
    const post = ok();
    await flushPendingCompletions(post, 0, 0);
    const [, options] = post.mock.calls[0] as unknown as [string, { body: string }];
    expect(JSON.parse(options.body)).toEqual({ slug: "why-gold-moves", score: 2 });
  });
});
