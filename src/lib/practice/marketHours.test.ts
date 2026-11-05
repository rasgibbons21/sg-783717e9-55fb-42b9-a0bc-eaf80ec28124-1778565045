import { describe, expect, it } from "vitest";
import { MARKET_RESTING_MESSAGE, isMarketOpen } from "./marketHours";

// 6 November 2026 is a Friday.
const at = (iso: string) => new Date(iso);

describe("isMarketOpen", () => {
  it("is open midweek", () => {
    expect(isMarketOpen("XAUUSD", at("2026-11-04T12:00:00Z"))).toBe(true);
  });

  it("closes on Friday evening UTC", () => {
    expect(isMarketOpen("XAUUSD", at("2026-11-06T21:59:00Z"))).toBe(true);
    expect(isMarketOpen("XAUUSD", at("2026-11-06T22:30:00Z"))).toBe(false);
  });

  it("stays closed on Saturday", () => {
    expect(isMarketOpen("EURUSD", at("2026-11-07T12:00:00Z"))).toBe(false);
  });

  it("reopens on Sunday evening UTC", () => {
    expect(isMarketOpen("XAUUSD", at("2026-11-08T21:59:00Z"))).toBe(false);
    expect(isMarketOpen("XAUUSD", at("2026-11-08T22:30:00Z"))).toBe(true);
  });

  it("never blocks closing an older stock position", () => {
    expect(isMarketOpen("AAPL", at("2026-11-07T12:00:00Z"))).toBe(true);
  });

  it("explains the closure kindly", () => {
    expect(MARKET_RESTING_MESSAGE).toContain("resting");
  });
});
