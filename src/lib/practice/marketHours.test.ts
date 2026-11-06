import { describe, expect, it } from "vitest";
import { isMarketOpen, marketRestingMessage } from "./marketHours";

const at = (iso: string) => new Date(iso);

describe("metals and forex hours", () => {
  it("is open midweek", () => {
    expect(isMarketOpen("XAUUSD", at("2026-11-04T12:00:00Z"))).toBe(true);
  });

  it("closes at 5pm New York on Friday, in winter", () => {
    expect(isMarketOpen("XAUUSD", at("2026-11-06T21:59:00Z"))).toBe(true);
    expect(isMarketOpen("XAUUSD", at("2026-11-06T22:30:00Z"))).toBe(false);
  });

  it("closes an hour earlier in UTC during US daylight saving", () => {
    expect(isMarketOpen("XAUUSD", at("2026-07-10T20:59:00Z"))).toBe(true);
    expect(isMarketOpen("XAUUSD", at("2026-07-10T21:30:00Z"))).toBe(false);
  });

  it("stays closed on Saturday", () => {
    expect(isMarketOpen("EURUSD", at("2026-11-07T12:00:00Z"))).toBe(false);
  });

  it("reopens at 5pm New York on Sunday, in winter and in summer", () => {
    expect(isMarketOpen("XAUUSD", at("2026-11-08T21:59:00Z"))).toBe(false);
    expect(isMarketOpen("XAUUSD", at("2026-11-08T22:30:00Z"))).toBe(true);
    expect(isMarketOpen("XAUUSD", at("2026-07-12T21:30:00Z"))).toBe(true);
  });
});

describe("index hours", () => {
  it("is open during the US trading day", () => {
    expect(isMarketOpen("US500", at("2026-11-04T15:00:00Z"))).toBe(true);
  });

  it("rests before 9:30am and after 4pm New York", () => {
    expect(isMarketOpen("US500", at("2026-11-04T14:00:00Z"))).toBe(false);
    expect(isMarketOpen("US30", at("2026-11-04T21:30:00Z"))).toBe(false);
  });

  it("rests at the weekend", () => {
    expect(isMarketOpen("US500", at("2026-11-07T15:00:00Z"))).toBe(false);
  });
});

describe("US stock and ETF hours", () => {
  it("is open during the US trading day", () => {
    expect(isMarketOpen("AAPL", at("2026-11-04T15:00:00Z"))).toBe(true);
    expect(isMarketOpen("SPY", at("2026-11-04T20:59:00Z"))).toBe(true);
  });

  it("rests before 9:30am, after 4pm and at the weekend", () => {
    expect(isMarketOpen("AAPL", at("2026-11-04T14:00:00Z"))).toBe(false);
    expect(isMarketOpen("AAPL", at("2026-11-04T21:30:00Z"))).toBe(false);
    expect(isMarketOpen("AAPL", at("2026-11-07T15:00:00Z"))).toBe(false);
  });

  it("explains stock hours kindly", () => {
    expect(marketRestingMessage("AAPL")).toContain("9:30am to 4pm New York time");
  });
});

describe("older stock positions", () => {
  it("are never blocked from closing", () => {
    expect(isMarketOpen("BRKB", at("2026-11-07T12:00:00Z"))).toBe(true);
  });
});

describe("marketRestingMessage", () => {
  it("explains each market's hours kindly", () => {
    expect(marketRestingMessage("XAUUSD")).toContain("resting");
    expect(marketRestingMessage("XAUUSD")).toContain("Sunday");
    expect(marketRestingMessage("US500")).toContain("resting");
    expect(marketRestingMessage("US500")).toContain("New York time");
  });
});
