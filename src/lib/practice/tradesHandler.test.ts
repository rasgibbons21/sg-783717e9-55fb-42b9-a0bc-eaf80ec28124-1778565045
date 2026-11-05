import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

const inserted: Record<string, unknown>[] = [];
const rpcCalls: { name: string; args: Record<string, unknown> }[] = [];
const quote = vi.fn();
const marketOpen = vi.fn();
let reserveResult: number | null = 9800;
let insertFails = false;

vi.mock("@/lib/requireProUser", () => ({
  requireLoggedInUser: async () => ({ user: { id: "user-1" }, error: null }),
  sendAuthError: vi.fn(),
}));
vi.mock("@/lib/serverQuote", () => ({ getServerQuote: (ticker: string) => quote(ticker) }));
vi.mock("@/lib/practice/marketHours", async (original) => ({
  ...(await original<object>()),
  isMarketOpen: (symbol: string) => marketOpen(symbol),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: async (name: string, args: Record<string, unknown>) => {
      rpcCalls.push({ name, args });
      return { data: name === "practice_reserve_cash" ? reserveResult : 10000, error: null };
    },
    from: (table: string) => {
      const chain: Record<string, unknown> = {
        select: () => chain,
        eq: () => chain,
        single: async () => {
          if (table === "practice_account") return { data: { id: "acct-1", cash_balance: 10000 }, error: null };
          if (insertFails) return { data: null, error: { message: "insert failed" } };
          return { data: { ...inserted[inserted.length - 1], id: "trade-1" }, error: null };
        },
        insert: (row: Record<string, unknown>) => {
          inserted.push(row);
          return chain;
        },
      };
      return chain;
    },
  }),
}));

import handler from "@/pages/api/practice/trades";

function call(body: Record<string, unknown>) {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return handler({ method: "POST", body } as unknown as NextApiRequest, res as unknown as NextApiResponse).then(() => res);
}

const goldOrder = { ticker: "XAUUSD", direction: "long", lots: 0.01, stop_price: 3950 };

describe("opening a practice trade", () => {
  beforeEach(() => {
    inserted.length = 0;
    rpcCalls.length = 0;
    reserveResult = 9800;
    insertFails = false;
    quote.mockReset().mockResolvedValue({ price: 4000, ts: 1 });
    marketOpen.mockReset().mockReturnValue(true);
  });

  it("opens gold from lots and reserves only the margin", async () => {
    const res = await call(goldOrder);
    expect(res.statusCode).toBe(201);
    expect(inserted[0]).toMatchObject({ ticker: "XAUUSD", shares: 1, entry_price: 4000, stop_price: 3950, risk_amount: 50 });
    expect(rpcCalls[0]).toEqual({ name: "practice_reserve_cash", args: { p_account_id: "acct-1", p_amount: 200 } });
  });

  it("opens nothing when another order has already used the money", async () => {
    reserveResult = null;
    const res = await call(goldOrder);
    expect(res.statusCode).toBe(400);
    expect(inserted).toHaveLength(0);
  });

  it("gives the money back if the trade can't be saved", async () => {
    insertFails = true;
    const res = await call(goldOrder);
    expect(res.statusCode).toBe(500);
    expect(rpcCalls.map((c) => c.name)).toEqual(["practice_reserve_cash", "practice_release_cash"]);
    expect(rpcCalls[1].args).toEqual({ p_account_id: "acct-1", p_delta: 200 });
  });

  it("rests kindly when the market is closed, and charges nothing", async () => {
    marketOpen.mockReturnValue(false);
    const res = await call(goldOrder);
    expect(res.statusCode).toBe(409);
    expect((res.body as { error: string }).error).toContain("resting");
    expect(inserted).toHaveLength(0);
    expect(rpcCalls).toHaveLength(0);
  });

  it("charges nothing when no price is available", async () => {
    quote.mockResolvedValue(null);
    const res = await call(goldOrder);
    expect(res.statusCode).toBe(502);
    expect(inserted).toHaveLength(0);
    expect(rpcCalls).toHaveLength(0);
  });

  it("does not open new stock trades", async () => {
    const res = await call({ ...goldOrder, ticker: "AAPL" });
    expect(res.statusCode).toBe(400);
    expect(inserted).toHaveLength(0);
  });

  it("rejects lot sizes below the smallest size", async () => {
    for (const lots of [0, -1, "many", 0.001]) {
      const res = await call({ ...goldOrder, lots });
      expect(res.statusCode).toBe(400);
    }
    expect(inserted).toHaveLength(0);
  });

  it("stops one trade from risking too much of the balance", async () => {
    const res = await call({ ...goldOrder, lots: 0.5, stop_price: 3900 });
    expect(res.statusCode).toBe(400);
    expect((res.body as { error: string }).error).toContain("smaller");
    expect(rpcCalls).toHaveLength(0);
  });
});
