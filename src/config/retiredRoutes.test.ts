import { describe, expect, it } from "vitest";
import { RETIRED_ROUTES } from "./retiredRoutes.mjs";

const sources = RETIRED_ROUTES.map((r) => r.source);

describe("RETIRED_ROUTES", () => {
  it("every retired route has a destination", () => {
    for (const route of RETIRED_ROUTES) {
      expect(route.destination).toMatch(/^\//);
      expect(route.permanent).toBe(true);
    }
  });

  it("sources cover the spec", () => {
    for (const expected of [
      "/scanner/:path*",
      "/signals",
      "/gap-and-go-scanner",
      "/stock/:path*",
      "/university/:path*",
      "/forex/:path*",
      "/academy/:path*",
      "/learn",
      "/subscription/:path*",
    ]) {
      expect(sources).toContain(expected);
    }
  });

  it("no destination is itself retired", () => {
    for (const route of RETIRED_ROUTES) {
      expect(sources).not.toContain(route.destination);
    }
  });
});
