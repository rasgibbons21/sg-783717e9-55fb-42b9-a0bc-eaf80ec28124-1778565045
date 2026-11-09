import { describe, expect, it } from "vitest";
import { parsePreselect } from "./preselect";

describe("parsePreselect", () => {
  it("accepts a known setup, timeframe and stock", () => {
    expect(parsePreselect({ setup: "FVG", tf: "5m", symbol: "AAPL" })).toEqual({ setup: "FVG", timeframe: "5m", symbol: "AAPL" });
  });

  it("ignores a setup with the wrong case", () => {
    expect(parsePreselect({ setup: "fvg" })).toEqual({});
  });

  it("ignores a timeframe Practice doesn't offer", () => {
    expect(parsePreselect({ tf: "4H" })).toEqual({});
  });

  it("ignores markets Practice no longer lists", () => {
    expect(parsePreselect({ symbol: "XAUUSD" })).toEqual({});
  });

  it("uses the first value when a parameter repeats", () => {
    expect(parsePreselect({ setup: ["Silver Bullet", "x"] })).toEqual({ setup: "Silver Bullet" });
  });

  it("returns nothing for an empty query", () => {
    expect(parsePreselect({})).toEqual({});
  });
});
