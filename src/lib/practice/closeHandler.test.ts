import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

let openTrade: Record<string, unknown>;
const tradeUpdates: Record<string, unknown>[] = [];
const accountUpdates: Record<string, unknown>[] = [];
const quote = vi.fn();
const marketOpen = vi.fn();

vi.mock("@/lib/requireProUser", () => ({
  requireLoggedInUser: async () => ({ user: { id: "user-1" }, error: null }),
  sendAuthError: vi.fn(),
}));
vi.mock("@/lib/achievementChecker", () => ({ checkTradeAchievements: vi.fn(async () => []) }));
vi.mock("@/lib/serverQuote", () => ({ getServerQuote: (ticker: string) => quote(ticker) }));
vi.mock("@/lib/practice/marketHours", async (original) => ({
  ...(await original<object>()),
  isMarketOpen: (symbol: string) => marketOpen(symbol),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: (table: string) => {
      const result = () =>
        table === "practice_account"
          ? { data: { id: "acct-1", cash_balance: 5000 }, error: null }
          : { data: { ...openTrade, status: "closed" }, error: null };
      const chain: Record<string, unknown> = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => result(),
        single: async () => (table === "practice_trades" ? { data: openTrade, error: null } : result()),
        update: (row: Record<string, unknown>) => {
          (table === "practice_account" ? accountUpdates : tradeUpdates).push(row);
          return chain;
        },
        insert: () => chain,
        then: (resolve: (value: unknown) => void) => resolve({ data: null, error: null }),
      };
      return chain;
    },
  }),
}));

import handler from "@/pages/api/practice/close";

function call() {
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
    end() {
      return this;
    },
  };
  return handler({ method: "POST", body: { trade_id: "trade-1" } } as unknown as NextApiRequest, res as unknown as NextApiResponse).then(() => res);
}

describe("closing a practice trade", () => {
  beforeEach(() => {
    tradeUpdates.length = 0;
    accountUpdates.length = 0;
    marketOpen.mockReset().mockReturnValue(true);
    quote.mockReset();
  });

  it("closes an older stock position and releases its full cost", async () => {
    openTrade = { id: "trade-1", ticker: "AAPL", direction: "long", shares: 5, entry_price: 200, status: "open" };
    quote.mockResolvedValue({ price: 210, ts: 1 });
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(tradeUpdates[0]).toMatchObject({ pnl: 50, exit_price: 210 });
    expect(accountUpdates[0]).toMatchObject({ cash_balance: 6050 });
  });

  it("releases only the margin on gold, plus the result", async () => {
    openTrade = { id: "trade-1", ticker: "XAUUSD", direction: "short", shares: 1, entry_price: 4000, status: "open" };
    quote.mockResolvedValue({ price: 3990, ts: 1 });
    await call();
    expect(tradeUpdates[0]).toMatchObject({ pnl: 10 });
    expect(accountUpdates[0]).toMatchObject({ cash_balance: 5210 });
  });

  it("leaves the trade open and unchanged when no price is available", async () => {
    openTrade = { id: "trade-1", ticker: "XAUUSD", direction: "long", shares: 1, entry_price: 4000, status: "open" };
    quote.mockResolvedValue(null);
    const res = await call();
    expect(res.statusCode).toBe(502);
    expect(tradeUpdates).toHaveLength(0);
    expect(accountUpdates).toHaveLength(0);
  });

  it("waits while the market is resting", async () => {
    openTrade = { id: "trade-1", ticker: "XAUUSD", direction: "long", shares: 1, entry_price: 4000, status: "open" };
    marketOpen.mockReturnValue(false);
    const res = await call();
    expect(res.statusCode).toBe(409);
    expect(tradeUpdates).toHaveLength(0);
  });
});
