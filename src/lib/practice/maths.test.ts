import { describe, expect, it } from "vitest";
import { getInstrument, INSTRUMENTS, LISTED_INSTRUMENTS } from "@/config/instruments";
import { lotsToUnits, marginFor, pnlFor } from "./maths";

describe("instruments", () => {
  it("offers exactly the spec's US stocks and ETFs in Practice", () => {
    expect(LISTED_INSTRUMENTS.map((i) => i.symbol)).toEqual([
      "SPY", "QQQ", "IWM", "DIA", "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "AMD", "JPM", "KO", "DIS",
    ]);
    for (const instrument of LISTED_INSTRUMENTS) {
      expect(["stock", "etf"]).toContain(instrument.assetClass);
      expect(instrument.leverage).toBe(1);
      expect(instrument.feed).toBe("finnhub");
    }
  });

  it("keeps older instruments only so open positions can close", () => {
    expect(getInstrument("xauusd")?.listed).toBe(false);
    expect(INSTRUMENTS.filter((i) => !i.listed).map((i) => i.symbol)).toEqual(["XAUUSD", "XAGUSD", "EURUSD", "GBPUSD", "USDJPY", "US30", "US500"]);
  });

  it("does not recognise an unlisted ticker", () => {
    expect(getInstrument("BRKB")).toBeUndefined();
  });
});

describe("lotsToUnits", () => {
  it("turns a micro lot of gold into one ounce", () => {
    expect(lotsToUnits("XAUUSD", 0.01)).toBe(1);
  });

  it("uses each instrument's own lot size", () => {
    expect(lotsToUnits("XAGUSD", 0.01)).toBe(50);
    expect(lotsToUnits("EURUSD", 0.01)).toBe(1000);
    expect(lotsToUnits("US500", 0.5)).toBe(0.5);
  });

  it("avoids floating point noise", () => {
    expect(lotsToUnits("XAUUSD", 0.07)).toBe(7);
  });
});

describe("marginFor", () => {
  it("reserves a fraction of the trade's value", () => {
    expect(marginFor("XAUUSD", 4000, 1)).toBe(200);
    expect(marginFor("EURUSD", 1.1, 1000)).toBeCloseTo(36.67, 2);
  });

  it("values dollar-based pairs in dollars", () => {
    expect(marginFor("USDJPY", 150, 1000)).toBeCloseTo(33.33, 2);
  });

  it("reserves the full cost of shares, with no leverage", () => {
    expect(marginFor("AAPL", 200, 5)).toBe(1000);
    expect(marginFor("SPY", 600, 2)).toBe(1200);
  });

  it("reserves full cost for older stock positions", () => {
    expect(marginFor("BRKB", 200, 5)).toBe(1000);
  });
});

describe("pnlFor", () => {
  it("handles buying and selling gold", () => {
    expect(pnlFor("XAUUSD", "long", 4000, 4010, 1)).toBe(10);
    expect(pnlFor("XAUUSD", "short", 4000, 4010, 1)).toBe(-10);
  });

  it("converts yen results into dollars at the exit rate", () => {
    expect(pnlFor("USDJPY", "long", 150, 151, 1000)).toBeCloseTo(6.62, 2);
  });

  it("still works for older stock positions", () => {
    expect(pnlFor("AAPL", "long", 200, 210, 5)).toBe(50);
  });
});
