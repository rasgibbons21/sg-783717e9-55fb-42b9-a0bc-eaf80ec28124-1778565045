import fs from "fs";
import { describe, expect, it } from "vitest";
import { PANSY_GENERAL_PERSONA } from "./pansyPersona";

const RULE =
  "Never tell a member what to do with her own savings, never name a stock or fund to buy, and never suggest an amount to invest. If asked, explain kindly that Bloom is education only and point her to the lessons and Ideas to study.";

describe("Pansy's budgeting knowledge", () => {
  it("knows pay yourself first and emergency funds", () => {
    expect(PANSY_GENERAL_PERSONA.toLowerCase()).toContain("pay yourself first");
    expect(PANSY_GENERAL_PERSONA.toLowerCase()).toContain("emergency fund");
    expect(PANSY_GENERAL_PERSONA).toContain("50/30/20");
  });

  it("never turns savings into investment advice", () => {
    expect(PANSY_GENERAL_PERSONA).toContain(RULE);
  });

  it("knows Bloom has a Budget section", () => {
    expect(PANSY_GENERAL_PERSONA).toContain("Budget & Savings");
  });
});

describe("budget copy on legal pages", () => {
  it("tells members their budget figures are private and deleted with their account", () => {
    const privacy = fs.readFileSync("src/pages/privacy.tsx", "utf8");
    expect(privacy).toContain("budget");
    expect(privacy).toContain("deleted with your account");
  });

  it("says budgeting estimates are not guarantees", () => {
    expect(fs.readFileSync("src/pages/terms.tsx", "utf8")).toContain("Budgeting tools are educational");
    expect(fs.readFileSync("src/pages/disclaimer.tsx", "utf8")).toContain("Budgeting tools are educational");
  });

  it("suggests budget questions in Ask Pansy", () => {
    const page = fs.readFileSync("src/pages/ask-pansy.tsx", "utf8");
    expect(page).toContain("How does pay yourself first work?");
    expect(page).toContain("How big should an emergency fund be?");
  });
});
