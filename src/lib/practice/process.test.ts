import { describe, expect, it } from "vitest";
import { countsForStockBoard, processScore } from "./process";

const base = { entry_price: 100, stop_price: 98, target_price: 106, risk_pct: 1, thesis: "Bullish FVG after a sweep, 1H rising", direction: "long" as const };

describe("processScore", () => {
  it("gives full marks to a complete, careful plan", () => {
    expect(processScore(base)).toBe(100);
  });

  it("drops points for a missing target and a blank note", () => {
    expect(processScore({ ...base, target_price: null, thesis: "   " })).toBe(50);
  });

  it("gives nothing for risk when the risk wasn't recorded", () => {
    expect(processScore({ ...base, risk_pct: null })).toBe(75);
  });

  it("gives nothing for reward when it's under 1.5 times the risk", () => {
    expect(processScore({ ...base, target_price: 102 })).toBe(75);
  });

  it("drops points for risking more than 1%", () => {
    expect(processScore({ ...base, risk_pct: 2.5 })).toBe(75);
  });

  it("scores sells the same way", () => {
    expect(processScore({ ...base, direction: "short", stop_price: 102, target_price: 94 })).toBe(100);
  });

  it("scores a trade with no stop and nothing else as zero", () => {
    expect(processScore({ entry_price: 100, stop_price: null, target_price: null, risk_pct: null, thesis: null, direction: "long" })).toBe(0);
  });
});

describe("countsForStockBoard", () => {
  it("counts listed stocks and older stock trades", () => {
    expect(countsForStockBoard("AAPL")).toBe(true);
    expect(countsForStockBoard("SPY")).toBe(true);
    expect(countsForStockBoard("BRKB")).toBe(true);
  });

  it("leaves out gold, forex and index trades", () => {
    for (const ticker of ["XAUUSD", "XAGUSD", "EURUSD", "USDJPY", "US500", "US30"]) {
      expect(countsForStockBoard(ticker)).toBe(false);
    }
  });
});
