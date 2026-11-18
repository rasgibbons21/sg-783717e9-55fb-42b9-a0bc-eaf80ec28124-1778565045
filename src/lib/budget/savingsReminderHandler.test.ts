import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

const sent: { endpoint: string; payload: string }[] = [];
const queried: { table: string; filters: unknown[] }[] = [];
let plans: Record<string, unknown>[] = [];

vi.mock("web-push", () => ({
  setVapidDetails: vi.fn(),
  sendNotification: vi.fn(async (sub: { endpoint: string }, payload: string) => {
    sent.push({ endpoint: sub.endpoint, payload });
  }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => {
      const filters: unknown[] = [];
      queried.push({ table, filters });
      const chain: Record<string, unknown> = {
        select: () => chain,
        eq: (...args: unknown[]) => {
          filters.push(["eq", ...args]);
          return chain;
        },
        in: (...args: unknown[]) => {
          filters.push(["in", ...args]);
          const ids = args[1] as string[];
          return Promise.resolve({ data: ids.map((id) => ({ id: `s-${id}`, user_id: id, endpoint: `https://push/${id}`, p256dh: "k", auth_key: "a" })), error: null });
        },
        delete: () => chain,
        insert: async () => ({ error: null }),
        then: (resolve: (value: unknown) => void) => resolve({ data: plans, error: null }),
      };
      return chain;
    },
  }),
}));

import handler from "@/pages/api/push/savings-reminder";

function call(headers: Record<string, string>, method = "GET") {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: unknown) {
      this.body = data;
      return this;
    },
  };
  return handler({ method, headers } as unknown as NextApiRequest, res as unknown as NextApiResponse).then(() => res);
}

beforeEach(() => {
  sent.length = 0;
  queried.length = 0;
  process.env.CRON_SECRET = "secret";
  process.env.VAPID_PUBLIC_KEY = "pub";
  process.env.VAPID_PRIVATE_KEY = "priv";
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-20T15:00:00Z")); // a Friday
  plans = [
    { user_id: "fri", savings_days: "fridays", next_payday: "2026-11-13", pay_frequency: "biweekly", time_zone: "America/Chicago" },
    { user_id: "sun", savings_days: "sundays", next_payday: "2026-11-13", pay_frequency: "biweekly", time_zone: "America/Chicago" },
  ];
});

describe("savings reminder cron", () => {
  it("refuses callers without the cron secret", async () => {
    expect((await call({})).statusCode).toBe(401);
    expect((await call({ authorization: "Bearer wrong" })).statusCode).toBe(401);
    expect(sent).toEqual([]);
  });

  it("only asks plans that opted in, and only reminds members whose savings day it is", async () => {
    const res = await call({ authorization: "Bearer secret" });
    expect(res.statusCode).toBe(200);
    expect(queried[0]).toMatchObject({ table: "budget_plans", filters: [["eq", "notify", true]] });
    expect(sent.map((s) => s.endpoint)).toEqual(["https://push/fri"]);
    expect(JSON.parse(sent[0].payload)).toMatchObject({ url: "/budget" });
  });

  it("also accepts the older cron header", async () => {
    expect((await call({ "x-cron-secret": "secret" }, "POST")).statusCode).toBe(200);
  });
});
