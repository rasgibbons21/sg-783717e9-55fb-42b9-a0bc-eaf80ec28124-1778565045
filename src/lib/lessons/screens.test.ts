import { describe, expect, it } from "vitest";
import { getLesson } from "@/data/lessons-stocks";
import { emphasisFor, practiceHref, screensFor, summaryLine } from "./screens";

describe("lesson screens", () => {
  it("shows a title card before each new stage and the score after the last test question", () => {
    const lesson = getLesson("fair-value-gaps")!;
    const screens = screensFor(lesson);
    const kinds = screens.map((s) => (s.kind === "block" ? lesson.blocks[s.index].type : s.kind === "intro" ? `intro:${s.stage}` : "summary"));
    expect(kinds.filter((k) => k.startsWith("intro"))).toEqual(["intro:strategy", "intro:test", "intro:practice"]);
    expect(kinds.indexOf("summary")).toBe(kinds.indexOf("chartPlan") + 1);
    expect(kinds[kinds.length - 1]).toBe("practiceCta");
    expect(screens.filter((s) => s.kind === "block")).toHaveLength(lesson.blocks.length);
  });

  it("gives a concept lesson one title card and a score", () => {
    const lesson = getLesson("reading-a-stock-chart")!;
    const screens = screensFor(lesson);
    expect(screens.filter((s) => s.kind === "intro")).toEqual([{ kind: "intro", stage: "test" }]);
    expect(screens[screens.length - 1]).toEqual({ kind: "summary" });
  });
});

describe("strategy and practice helpers", () => {
  it("points each strategy step at its part of the chart", () => {
    expect(emphasisFor("skip")).toBeNull();
    expect(emphasisFor("context")).toBe("timeframe");
    expect(emphasisFor("stop")).toBe("stop");
  });

  it("links Practice with the setup and timeframe", () => {
    expect(practiceHref("Silver Bullet", "5m")).toBe("/practice?setup=Silver%20Bullet&tf=5m");
    expect(practiceHref("Supply & demand", "1H")).toBe("/practice?setup=Supply%20%26%20demand&tf=1H");
  });

  it("is kind at every score", () => {
    expect(summaryLine(5, 5)).toBe("Every one on the first try. Beautifully done.");
    expect(summaryLine(3, 5)).toBe("Lovely work. The ones you retried are the ones you'll remember.");
    expect(summaryLine(1, 5)).toBe("That's what practice is for. Have another read of the strategy any time.");
  });
});
