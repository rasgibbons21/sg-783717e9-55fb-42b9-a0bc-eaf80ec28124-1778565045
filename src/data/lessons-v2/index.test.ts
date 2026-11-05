import { describe, expect, it } from "vitest";
import { isInteractive } from "@/lib/lessons/engine";
import { ALL_LESSONS, MODULES, getLesson, nextLesson } from "./index";

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

  it("walks through lessons in order and stops at the end", () => {
    expect(nextLesson(ALL_LESSONS[0].slug)?.slug).toBe(ALL_LESSONS[1].slug);
    expect(nextLesson(ALL_LESSONS[ALL_LESSONS.length - 1].slug)).toBeNull();
  });
});
