import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

let existingScore: number | null = null;
const updates: Record<string, unknown>[] = [];
const upserts: Record<string, unknown>[] = [];

vi.mock("@/lib/requireProUser", () => ({
  requireLoggedInUser: async () => ({ user: { id: "user-1" }, error: null }),
  sendAuthError: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => {
      const chain: Record<string, unknown> = {
        upsert: (row: Record<string, unknown>) => {
          upserts.push(row);
          return chain;
        },
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({ data: { test_score: existingScore }, error: null }),
        update: (row: Record<string, unknown>) => {
          updates.push(row);
          return chain;
        },
        then: (resolve: (value: unknown) => void) => resolve({ data: [{ lesson_id: "x" }], error: null }),
      };
      return chain;
    },
  }),
}));

import handler from "@/pages/api/lessons/complete";

function call(body: Record<string, unknown>) {
  const res = { statusCode: 0, body: undefined as unknown, status(code: number) { this.statusCode = code; return this; }, json(data: unknown) { this.body = data; return this; }, end() { return this; } };
  return handler({ method: "POST", body } as NextApiRequest, res as unknown as NextApiResponse).then(() => res);
}

beforeEach(() => {
  existingScore = null;
  updates.length = 0;
  upserts.length = 0;
});

describe("lesson completion with a test score", () => {
  it("stores a valid score", async () => {
    const res = await call({ slug: "fair-value-gaps", score: 4, total: 5 });
    expect(res.statusCode).toBe(200);
    expect(updates).toEqual([{ test_score: 4, test_total: 5 }]);
  });

  it("keeps the better score", async () => {
    existingScore = 3;
    await call({ slug: "fair-value-gaps", score: 2, total: 5 });
    expect(updates).toEqual([]);
    await call({ slug: "fair-value-gaps", score: 5, total: 5 });
    expect(updates).toEqual([{ test_score: 5, test_total: 5 }]);
  });

  it("ignores a wrong total but still completes", async () => {
    const res = await call({ slug: "fair-value-gaps", score: 4, total: 9 });
    expect(res.statusCode).toBe(200);
    expect(upserts).toHaveLength(1);
    expect(updates).toEqual([]);
  });

  it("ignores a score above the total", async () => {
    await call({ slug: "fair-value-gaps", score: 6, total: 5 });
    expect(updates).toEqual([]);
  });

  it("rejects an unknown lesson", async () => {
    const res = await call({ slug: "no-such-lesson", score: 1, total: 1 });
    expect(res.statusCode).toBe(400);
  });
});
