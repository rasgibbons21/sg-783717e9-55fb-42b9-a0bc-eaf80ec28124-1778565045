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
      "go long and set your stop at 2300",
      "consider buying gold at 2300",
      "Buy gold.",
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

  it("leaves honest warnings about guarantees alone", () => {
    const warning = "Nothing in trading is guaranteed, and there is no such thing as risk-free returns.";
    expect(scrubDirectives(warning)).toBe(warning);
  });

  it("leaves clearly labelled examples alone", () => {
    for (const example of [
      "For example, say you buy gold at $2,000 and place a stop-loss at $1,990.",
      "Imagine you sell gold at 4000 in a made-up trade.",
    ]) {
      expect(scrubDirectives(example), example).toBe(example);
    }
  });

  it("replaces the whole sentence, keeps the rest, and offers to teach only once", () => {
    const result = scrubDirectives("Gold often moves with the dollar. Buy gold now. Sell gold at 4000. Stops help you manage risk.");
    expect(result).toContain("Gold often moves with the dollar.");
    expect(result).toContain("Stops help you manage risk.");
    expect(result).not.toMatch(/buy gold now/i);
    expect(result.match(/I can't give trade calls/g)).toHaveLength(1);
  });

  it("keeps paragraph breaks", () => {
    expect(scrubDirectives("First idea.\n\nSecond idea.")).toBe("First idea.\n\nSecond idea.");
  });
});
