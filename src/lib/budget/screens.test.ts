import { describe, expect, it } from "vitest";
import { budgetScreen } from "./screens";

const plan = { currency: "USD" };

describe("budgetScreen", () => {
  it("waits while loading", () => {
    expect(budgetScreen({ loading: true, error: null, plan: null })).toBe("loading");
  });

  it("shows the error, not a blank setup, when her plan couldn't load", () => {
    expect(budgetScreen({ loading: false, error: "We couldn't load your budget. Please try again.", plan: null })).toBe("error");
  });

  it("invites setup only when there is truly no plan", () => {
    expect(budgetScreen({ loading: false, error: null, plan: null })).toBe("setup");
  });

  it("shows her plan when it loaded, even if a later refresh failed", () => {
    expect(budgetScreen({ loading: false, error: "We couldn't load your budget. Please try again.", plan })).toBe("plan");
  });
});
