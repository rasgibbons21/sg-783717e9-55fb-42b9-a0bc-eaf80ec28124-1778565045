import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerQuote } from "./serverQuote";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("FMP_API_KEY", "fmp-test");
  vi.stubEnv("FINNHUB_API_KEY", "finnhub-test");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const respondWith = (body: unknown, ok = true) => fetchMock.mockResolvedValue({ ok, json: async () => body });

describe("getServerQuote", () => {
  it("prices gold from FMP", async () => {
    respondWith([{ price: 4012.5 }]);
    await expect(getServerQuote("XAUUSD")).resolves.toMatchObject({ price: 4012.5 });
    expect(fetchMock.mock.calls[0][0]).toContain("financialmodelingprep.com");
    expect(fetchMock.mock.calls[0][0]).toContain("symbol=XAUUSD");
  });

  it("encodes index symbols for the feed", async () => {
    respondWith([{ price: 6000 }]);
    await getServerQuote("US500");
    expect(fetchMock.mock.calls[0][0]).toContain("symbol=%5EGSPC");
  });

  it("prices listed stocks from Finnhub", async () => {
    respondWith({ c: 612.4 });
    await expect(getServerQuote("SPY")).resolves.toMatchObject({ price: 612.4 });
    expect(fetchMock.mock.calls[0][0]).toContain("finnhub.io");
    expect(fetchMock.mock.calls[0][0]).toContain("symbol=SPY");
  });

  it("still prices older stock positions from Finnhub", async () => {
    respondWith({ c: 210 });
    await expect(getServerQuote("AAPL")).resolves.toMatchObject({ price: 210 });
    expect(fetchMock.mock.calls[0][0]).toContain("finnhub.io");
  });

  it("returns null when the feed fails", async () => {
    fetchMock.mockRejectedValue(new Error("down"));
    await expect(getServerQuote("XAUUSD")).resolves.toBeNull();
  });

  it("returns null when the feed answers with no usable price", async () => {
    respondWith([]);
    await expect(getServerQuote("XAUUSD")).resolves.toBeNull();
    respondWith({ error: "limit" }, false);
    await expect(getServerQuote("EURUSD")).resolves.toBeNull();
  });
});
