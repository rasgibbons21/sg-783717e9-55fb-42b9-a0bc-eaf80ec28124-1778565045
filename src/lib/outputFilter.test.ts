import { describe, expect, it } from "vitest";
import { scrubDirectives } from "./outputFilter";

const flagged = (text: string) => scrubDirectives(text) !== text;

describe("scrubDirectives", () => {
  it("catches direct trade calls on gold and other instruments", () => {
    for (const call of [
      "Buy XAUUSD now",
      "sell gold at 4000",
      "You should buy gold today.",
      "enter around 4,010",
      "set your stop loss at 3990",
      "take profit at 4050",
      "short EURUSD here",
      "price target of 4200",
    ]) {
      expect(flagged(call), call).toBe(true);
    }
  });

  it("catches promises", () => {
    expect(flagged("This is guaranteed to work.")).toBe(true);
    expect(flagged("It's risk-free money.")).toBe(true);
  });

  it("leaves plain teaching alone", () => {
    for (const teaching of [
      "A stop loss is a level you choose to limit a loss.",
      "Many beginners buy too large a position.",
      "When you sell, your stop sits above the current price.",
      "Gold is often written as XAUUSD.",
      "Take profit means closing a trade while it is in profit.",
      "When you buy EURUSD, you expect the euro to rise.",
      "Traders can buy or sell gold as a CFD.",
    ]) {
      expect(scrubDirectives(teaching), teaching).toBe(teaching);
    }
  });

  it("replaces a trade call with a warm offer to teach", () => {
    expect(scrubDirectives("Buy XAUUSD now")).toContain("I can't give trade calls");
  });
});
