import { describe, expect, it } from "vitest";
import { gradeFind, gradePlan, gradeZone } from "./grading";

describe("gradeFind", () => {
  it("accepts the right candles in any order", () => {
    expect(gradeFind([3, 2, 4], [2, 3, 4])).toBe(true);
  });
  it("rejects missing or extra candles", () => {
    expect(gradeFind([2, 3], [2, 3, 4])).toBe(false);
    expect(gradeFind([1, 2, 3, 4], [2, 3, 4])).toBe(false);
  });
});

describe("gradeZone", () => {
  const answer = { top: 110, bottom: 100 };
  it("accepts a close match", () => {
    expect(gradeZone({ top: 110.5, bottom: 101 }, answer)).toBe(true);
  });
  it("accepts a zone dragged upside down", () => {
    expect(gradeZone({ top: 100.5, bottom: 110 }, answer)).toBe(true);
  });
  it("rejects a zone that only half covers the answer", () => {
    expect(gradeZone({ top: 115, bottom: 105 }, answer)).toBe(false);
  });
  it("accepts a zone with most of the answer covered", () => {
    expect(gradeZone({ top: 110, bottom: 102 }, answer)).toBe(true);
  });
});

describe("gradePlan", () => {
  const longRules = { direction: "long" as const, entryZone: { top: 102, bottom: 100 }, invalidation: 99, minRR: 1.5 };

  it("accepts a sound long plan", () => {
    expect(gradePlan({ entry: 101, stop: 98.5, target: 106 }, longRules)).toEqual({ ok: true, reasons: [] });
  });

  it("explains a stop that sits inside the idea", () => {
    const result = gradePlan({ entry: 101, stop: 99.5, target: 106 }, longRules);
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain("Your stop should sit beyond the point where the idea is wrong.");
  });

  it("explains a reward that's too small", () => {
    const result = gradePlan({ entry: 101, stop: 98.5, target: 102.5 }, longRules);
    expect(result.reasons).toContain("Aim for a reward at least 1.5 times your risk.");
  });

  it("explains an entry outside the zone", () => {
    const result = gradePlan({ entry: 104, stop: 98.5, target: 112 }, longRules);
    expect(result.reasons).toContain("Your entry should sit inside the zone.");
  });

  it("copes with missing levels without crashing", () => {
    expect(gradePlan({}, longRules).ok).toBe(false);
    expect(gradePlan({ entry: 101 }, longRules).ok).toBe(false);
  });

  it("works the same way for a short plan", () => {
    const shortRules = { direction: "short" as const, entryZone: { top: 102, bottom: 100 }, invalidation: 103, minRR: 1.5 };
    expect(gradePlan({ entry: 101, stop: 103.5, target: 96 }, shortRules).ok).toBe(true);
    expect(gradePlan({ entry: 101, stop: 102.5, target: 96 }, shortRules).reasons).toContain(
      "Your stop should sit beyond the point where the idea is wrong.",
    );
  });

  it("treats a target on the wrong side as no reward", () => {
    expect(gradePlan({ entry: 101, stop: 98.5, target: 95 }, longRules).reasons).toContain("Aim for a reward at least 1.5 times your risk.");
  });
});
