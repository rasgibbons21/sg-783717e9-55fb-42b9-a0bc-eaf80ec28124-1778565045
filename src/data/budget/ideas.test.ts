import { describe, expect, it } from "vitest";
import { LISTED_INSTRUMENTS } from "@/config/instruments";
import { getLesson } from "@/data/lessons-stocks";
import { IDEAS, IDEAS_FOOTER, IDEAS_LEAD, STUDY_LABEL } from "./ideas";

describe("Ideas to study", () => {
  it("has the four categories in order", () => {
    expect(IDEAS.map((idea) => idea.title)).toEqual(["Broad index ETFs", "Large established companies", "Dividend payers", "Growth and technology"]);
  });

  it("only uses stocks from the practice list", () => {
    const listed = LISTED_INSTRUMENTS.map((instrument) => instrument.symbol);
    for (const idea of IDEAS) for (const ticker of idea.examples) expect(listed, ticker).toContain(ticker);
  });

  it("links every category to a real lesson", () => {
    for (const idea of IDEAS) expect(getLesson(idea.lessonSlug), idea.lessonSlug).toBeDefined();
  });

  it("labels examples for study, never for buying", () => {
    expect(STUDY_LABEL).toBe("To study, not to buy");
    const text = [IDEAS_LEAD, IDEAS_FOOTER, ...IDEAS.flatMap((idea) => [idea.title, idea.explainer])].join(" ");
    expect(text.replace(/not to buy/gi, "")).not.toMatch(/\bbuy/i);
  });

  it("starts with the emergency fund and ends with the disclaimer", () => {
    expect(IDEAS_LEAD).toContain("emergency fund");
    expect(IDEAS_FOOTER).toContain("isn't investment advice");
  });
});
