import { describe, expect, it } from "vitest";
import { getEntitlements } from "./proPlan";

describe("getEntitlements", () => {
  it("free tier has full access", () => {
    const free = getEntitlements("free");
    expect(free).toEqual(getEntitlements("desk"));
    expect(free.paperFull).toBe(true);
    expect(free.journalAnalytics).toBe(true);
  });
});
