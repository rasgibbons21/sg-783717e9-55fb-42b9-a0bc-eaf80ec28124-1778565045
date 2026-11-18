import fs from "fs";
import { describe, expect, it } from "vitest";
import { cinderVaultCapitalUrl } from "./ecosystem";

describe("corporate footer", () => {
  it("credits the group on every page", () => {
    const footer = fs.readFileSync("src/components/RiskNote.tsx", "utf8");
    expect(footer).toContain("A product of CinderVault Enterprises Fintech Group");
    expect(footer).toContain("CinderVault Capital");
  });

  it("links CinderVault Capital only to a real https address", () => {
    expect(cinderVaultCapitalUrl("https://cindervault.example")).toBe("https://cindervault.example");
    expect(cinderVaultCapitalUrl("javascript:alert(1)")).toBeNull();
    expect(cinderVaultCapitalUrl("")).toBeNull();
    expect(cinderVaultCapitalUrl(undefined)).toBeNull();
  });
});
