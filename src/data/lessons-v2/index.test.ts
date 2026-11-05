import { describe, expect, it } from "vitest";
import { isInteractive } from "@/lib/lessons/engine";
import { ALL_LESSONS, MODULES, firstIncomplete, getLesson, hasFinishedCourse, nextLesson } from "./index";

describe("lesson data", () => {
  it("starts with the first gold lesson", () => {
    expect(ALL_LESSONS[0].slug).toBe("what-is-gold-trading");
    expect(getLesson("what-is-gold-trading")?.title).toBeTruthy();
    expect(getLesson("not-a-lesson")).toBeUndefined();
  });

  it("gives every lesson a unique slug", () => {
    const slugs = ALL_LESSONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("makes every lesson interactive", () => {
    for (const lesson of ALL_LESSONS) {
      expect(lesson.blocks.some(isInteractive), lesson.slug).toBe(true);
    }
  });

  it("gives every lesson a module and a practice hint", () => {
    const moduleIds = MODULES.map((m) => m.id);
    for (const lesson of ALL_LESSONS) {
      expect(moduleIds, lesson.slug).toContain(lesson.moduleId);
      expect(lesson.practiceHint.length, lesson.slug).toBeGreaterThan(0);
    }
  });

  it("follows the six modules in the spec's order", () => {
    expect(MODULES.map((m) => m.id)).toEqual([
      "gold-basics",
      "how-it-works",
      "first-chart",
      "staying-safe",
      "demo-account",
      "beyond-gold",
    ]);
    for (const mod of MODULES) {
      const count = ALL_LESSONS.filter((l) => l.moduleId === mod.id).length;
      expect(count, mod.id).toBeGreaterThanOrEqual(2);
      expect(count, mod.id).toBeLessThanOrEqual(4);
    }
  });

  it("covers every topic the spec names", () => {
    for (const slug of ["how-leverage-works", "opening-a-demo", "reading-candles", "stop-losses", "common-beginner-mistakes", "major-forex-pairs", "what-are-indices", "silver-and-other-metals"]) {
      expect(getLesson(slug), slug).toBeDefined();
    }
  });

  it("never uses trade-call or tool wording", () => {
    const banned = /\b(signals?|scanners?|setups?|edge|upgrade|buy now|sell now|guaranteed to (rise|fall))\b/i;
    for (const lesson of ALL_LESSONS) {
      const text = JSON.stringify(lesson).replace("Gold is guaranteed to jump this week", "");
      expect(text.match(banned)?.[0], lesson.slug).toBeUndefined();
    }
  });

  it("reminds members that demo availability depends on their country", () => {
    const text = JSON.stringify(getLesson("opening-a-demo"));
    expect(text).toContain("XM");
    expect(text).toContain("IC Markets");
    expect(text).toContain("depends on your country");
    expect(text).toContain("US residents");
    expect(text).toContain("commission");
  });

  it("keeps a risk message in the leverage and staying-safe lessons", () => {
    expect(JSON.stringify(getLesson("how-leverage-works"))).toMatch(/lose money/);
    expect(JSON.stringify(getLesson("what-is-gold-trading"))).toMatch(/high risk/);
  });

  it("has chart answers that point at real candles", () => {
    for (const lesson of ALL_LESSONS) {
      for (const block of lesson.blocks) {
        if (block.type !== "chartTap") continue;
        for (const index of block.correctIndexes) {
          expect(index, lesson.slug).toBeLessThan(block.candles.length);
        }
      }
    }
  });

  it("counts the course as finished only when every lesson is done", () => {
    const every = ALL_LESSONS.map((l) => l.slug);
    expect(hasFinishedCourse(every)).toBe(true);
    expect(hasFinishedCourse(every.slice(1))).toBe(false);
    expect(hasFinishedCourse([...every.slice(1), "an-old-lesson"])).toBe(false);
  });

  it("finds the first unfinished lesson", () => {
    expect(firstIncomplete([])?.slug).toBe(ALL_LESSONS[0].slug);
    expect(firstIncomplete([ALL_LESSONS[0].slug])?.slug).toBe(ALL_LESSONS[1].slug);
    expect(firstIncomplete(ALL_LESSONS.map((l) => l.slug))).toBeNull();
  });

  it("walks through lessons in order and stops at the end", () => {
    expect(nextLesson(ALL_LESSONS[0].slug)?.slug).toBe(ALL_LESSONS[1].slug);
    expect(nextLesson(ALL_LESSONS[ALL_LESSONS.length - 1].slug)).toBeNull();
  });
});
