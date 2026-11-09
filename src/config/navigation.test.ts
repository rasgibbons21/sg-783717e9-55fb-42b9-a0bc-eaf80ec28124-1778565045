import { describe, expect, it } from "vitest";
import { HEADER_ITEMS, TAB_ITEMS } from "./navigation";
import { RETIRED_ROUTES } from "./retiredRoutes.mjs";

const retiredRoots = RETIRED_ROUTES.map((r) => r.source.replace("/:path*", ""));

describe("navigation", () => {
  it("has the five tabs from the spec, with Budget", () => {
    expect(TAB_ITEMS.map((t) => t.href)).toEqual(["/home", "/lessons", "/practice", "/budget", "/ask-pansy"]);
  });

  it("includes Leaderboard, Brokers and Profile in the header", () => {
    expect(HEADER_ITEMS.map((t) => t.href)).toEqual(["/leaderboard", "/brokers", "/profile"]);
  });

  it("never links to a retired route", () => {
    for (const item of [...TAB_ITEMS, ...HEADER_ITEMS]) {
      expect(retiredRoots).not.toContain(item.href);
    }
  });
});
