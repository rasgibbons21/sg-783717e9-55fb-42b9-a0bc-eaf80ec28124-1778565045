import { describe, expect, it } from "vitest";
import { HEADER_ITEMS, TAB_ITEMS } from "./navigation";
import { RETIRED_ROUTES } from "./retiredRoutes.mjs";

const retiredRoots = RETIRED_ROUTES.map((r) => r.source.replace("/:path*", ""));

describe("navigation", () => {
  it("has the five tabs from the spec", () => {
    expect(TAB_ITEMS.map((t) => t.href)).toEqual(["/home", "/lessons", "/practice", "/leaderboard", "/ask-pansy"]);
  });

  it("includes Brokers and Profile in the header", () => {
    expect(HEADER_ITEMS.map((t) => t.href)).toEqual(["/brokers", "/profile"]);
  });

  it("never links to a retired route", () => {
    for (const item of [...TAB_ITEMS, ...HEADER_ITEMS]) {
      expect(retiredRoots).not.toContain(item.href);
    }
  });
});
