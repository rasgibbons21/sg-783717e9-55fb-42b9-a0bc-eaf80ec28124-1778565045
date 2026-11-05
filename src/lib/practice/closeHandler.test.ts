import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";

let openTrade: Record<string, unknown>;
let closeWins = true;
const tradeUpdates: Record<string, unknown>[] = [];
const statusFilters: unknown[] = [];
const rpcCalls: { name: string; args: Record<string, unknown> }[] = [];
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
    rpc: async (name: string, args: Record<string, unknown>) => {
      rpcCalls.push({ name, args });
      return { data: 0, error: null };
    },
    from: (table: string) => {
      let updating = false;
      const chain: Record<string, unknown> = {
        select: () => chain,
        eq: (column: string, value: unknown) => {
          if (updating && column === "status") statusFilters.push(value);
          return chain;
        },
        maybeSingle: async () =>
          updating
            ? { data: closeWins ? { ...openTrade, status: "closed", exit_at: new Date().toISOString() } : null, error: null }
            : { data: null, error: null },
        single: async () => {
          if (table === "practice_trades") return { data: openTrade, error: null };
          return { data: { id: "acct-1", cash_balance: 5000 }, error: null };
        },
        update: (row: Record<string, unknown>) => {
          updating = true;
          if (table === "practice_trades") tradeUpdates.push(row);
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
    statusFilters.length = 0;
    rpcCalls.length = 0;
    closeWins = true;
    marketOpen.mockReset().mockReturnValue(true);
    quote.mockReset();
  });

  it("closes an older stock position and releases its full cost", async () => {
    openTrade = { id: "trade-1", ticker: "AAPL", direction: "long", shares: 5, entry_price: 200, status: "open" };
    quote.mockResolvedValue({ price: 210, ts: 1 });
    const res = await call();
    expect(res.statusCode).toBe(200);
    expect(tradeUpdates[0]).toMatchObject({ pnl: 50, exit_price: 210 });
    expect(rpcCalls).toEqual([{ name: "practice_release_cash", args: { p_account_id: "acct-1", p_delta: 1050 } }]);
  });

  it("releases only the margin on gold, plus the result", async () => {
    openTrade = { id: "trade-1", ticker: "XAUUSD", direction: "short", shares: 1, entry_price: 4000, status: "open" };
    quote.mockResolvedValue({ price: 3990, ts: 1 });
    await call();
    expect(tradeUpdates[0]).toMatchObject({ pnl: 10 });
    expect(rpcCalls[0].args).toEqual({ p_account_id: "acct-1", p_delta: 210 });
  });

  it("pays out only once when two devices close the same trade", async () => {
    openTrade = { id: "trade-1", ticker: "XAUUSD", direction: "long", shares: 1, entry_price: 4000, status: "open" };
    quote.mockResolvedValue({ price: 3950, ts: 1 });
    closeWins = false;
    const res = await call();
    expect(statusFilters).toContain("open");
    expect(res.statusCode).toBe(200);
    expect((res.body as { alreadyClosed: boolean }).alreadyClosed).toBe(true);
    expect(rpcCalls).toHaveLength(0);
  });

  it("leaves the trade open and unchanged when no price is available", async () => {
    openTrade = { id: "trade-1", ticker: "XAUUSD", direction: "long", shares: 1, entry_price: 4000, status: "open" };
    quote.mockResolvedValue(null);
    const res = await call();
    expect(res.statusCode).toBe(502);
    expect(tradeUpdates).toHaveLength(0);
    expect(rpcCalls).toHaveLength(0);
  });

  it("waits while the market is resting", async () => {
    openTrade = { id: "trade-1", ticker: "XAUUSD", direction: "long", shares: 1, entry_price: 4000, status: "open" };
    marketOpen.mockReturnValue(false);
    const res = await call();
    expect(res.statusCode).toBe(409);
    expect(tradeUpdates).toHaveLength(0);
  });
});
