import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

const inserted: Record<string, unknown>[] = [];
const accountUpdates: Record<string, unknown>[] = [];
const quote = vi.fn();
const marketOpen = vi.fn();

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
    from: (table: string) => {
      const chain: Record<string, unknown> = {
        select: () => chain,
        eq: () => chain,
        single: async () =>
          table === "practice_account"
            ? { data: { id: "acct-1", cash_balance: 10000 }, error: null }
            : { data: { ...inserted[inserted.length - 1], id: "trade-1" }, error: null },
        insert: (row: Record<string, unknown>) => {
          inserted.push(row);
          return chain;
        },
        update: (row: Record<string, unknown>) => {
          accountUpdates.push(row);
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
    accountUpdates.length = 0;
    quote.mockReset().mockResolvedValue({ price: 4000, ts: 1 });
    marketOpen.mockReset().mockReturnValue(true);
  });

  it("opens gold from lots and reserves only the margin", async () => {
    const res = await call(goldOrder);
    expect(res.statusCode).toBe(201);
    expect(inserted[0]).toMatchObject({ ticker: "XAUUSD", shares: 1, entry_price: 4000, stop_price: 3950, risk_amount: 50 });
    expect(accountUpdates[0]).toMatchObject({ cash_balance: 9800 });
  });

  it("rests kindly when the market is closed, and charges nothing", async () => {
    marketOpen.mockReturnValue(false);
    const res = await call(goldOrder);
    expect(res.statusCode).toBe(409);
    expect((res.body as { error: string }).error).toContain("resting");
    expect(inserted).toHaveLength(0);
    expect(accountUpdates).toHaveLength(0);
  });

  it("charges nothing when no price is available", async () => {
    quote.mockResolvedValue(null);
    const res = await call(goldOrder);
    expect(res.statusCode).toBe(502);
    expect(inserted).toHaveLength(0);
    expect(accountUpdates).toHaveLength(0);
  });

  it("does not open new stock trades", async () => {
    const res = await call({ ...goldOrder, ticker: "AAPL" });
    expect(res.statusCode).toBe(400);
    expect(inserted).toHaveLength(0);
  });

  it("rejects lot sizes that aren't positive", async () => {
    for (const lots of [0, -1, "many"]) {
      const res = await call({ ...goldOrder, lots });
      expect(res.statusCode).toBe(400);
    }
    expect(inserted).toHaveLength(0);
  });

  it("explains when simulated funds won't cover the margin", async () => {
    const res = await call({ ...goldOrder, lots: 10 });
    expect(res.statusCode).toBe(400);
    expect(inserted).toHaveLength(0);
  });
});
