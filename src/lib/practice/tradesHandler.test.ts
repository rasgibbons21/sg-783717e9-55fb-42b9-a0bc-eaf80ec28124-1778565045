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

const stockOrder = { ticker: "AAPL", direction: "long", shares: 2, stop_price: 190, setup_type: "FVG", timeframe: "1H" };

describe("opening a practice trade", () => {
  beforeEach(() => {
    inserted.length = 0;
    rpcCalls.length = 0;
    reserveResult = 9600;
    insertFails = false;
    quote.mockReset().mockResolvedValue({ price: 200, ts: 1 });
    marketOpen.mockReset().mockReturnValue(true);
  });

  it("opens whole shares, reserves the full cost and records the plan", async () => {
    const res = await call(stockOrder);
    expect(res.statusCode).toBe(201);
    expect(inserted[0]).toMatchObject({
      ticker: "AAPL",
      shares: 2,
      entry_price: 200,
      stop_price: 190,
      risk_amount: 20,
      setup_type: "FVG",
      timeframe: "1H",
      risk_pct: 0.2,
    });
    expect(rpcCalls[0]).toEqual({ name: "practice_reserve_cash", args: { p_account_id: "acct-1", p_amount: 400 } });
  });

  it("opens nothing when another order has already used the money", async () => {
    reserveResult = null;
    const res = await call(stockOrder);
    expect(res.statusCode).toBe(400);
    expect(inserted).toHaveLength(0);
  });

  it("gives the money back if the trade can't be saved", async () => {
    insertFails = true;
    const res = await call(stockOrder);
    expect(res.statusCode).toBe(500);
    expect(rpcCalls.map((c) => c.name)).toEqual(["practice_reserve_cash", "practice_release_cash"]);
    expect(rpcCalls[1].args).toEqual({ p_account_id: "acct-1", p_delta: 400 });
  });

  it("rests kindly outside stock hours, and charges nothing", async () => {
    marketOpen.mockReturnValue(false);
    const res = await call(stockOrder);
    expect(res.statusCode).toBe(409);
    expect((res.body as { error: string }).error).toContain("9:30am to 4pm New York time");
    expect(inserted).toHaveLength(0);
    expect(rpcCalls).toHaveLength(0);
  });

  it("charges nothing when no price is available", async () => {
    quote.mockResolvedValue(null);
    const res = await call(stockOrder);
    expect(res.statusCode).toBe(502);
    expect(inserted).toHaveLength(0);
    expect(rpcCalls).toHaveLength(0);
  });

  it("no longer opens gold or other retired markets", async () => {
    const res = await call({ ...stockOrder, ticker: "XAUUSD", stop_price: 3950 });
    expect(res.statusCode).toBe(400);
    expect((res.body as { error: string }).error).toBe("That market isn't available in Practice anymore.");
    expect(inserted).toHaveLength(0);
  });

  it("asks for whole shares", async () => {
    for (const shares of [0, -1, 1.5, "many"]) {
      const res = await call({ ...stockOrder, shares });
      expect(res.statusCode).toBe(400);
    }
    expect(inserted).toHaveLength(0);
  });

  it("needs a setup and a timeframe from the lessons", async () => {
    for (const plan of [{ setup_type: undefined }, { timeframe: undefined }, { setup_type: "A hunch" }, { timeframe: "2m" }]) {
      const res = await call({ ...stockOrder, ...plan });
      expect(res.statusCode).toBe(400);
    }
    expect(inserted).toHaveLength(0);
  });

  it("stops one trade from risking too much of the balance", async () => {
    const res = await call({ ...stockOrder, shares: 40, stop_price: 140 });
    expect(res.statusCode).toBe(400);
    expect((res.body as { error: string }).error).toContain("smaller");
    expect(rpcCalls).toHaveLength(0);
  });
});
