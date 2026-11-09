import { describe, expect, it } from "vitest";
import { testSummary } from "./scores";

describe("testSummary", () => {
  it("averages first-try scores across lessons with a test", () => {
    const summary = testSummary([
      { lesson_id: "fair-value-gaps", test_score: 4, test_total: 5 },
      { lesson_id: "order-blocks", test_score: 5, test_total: 5 },
      { lesson_id: "reading-a-stock-chart", test_score: null, test_total: null },
    ]);
    expect(summary.averagePct).toBe(90);
    expect(summary.best).toEqual([
      { slug: "fair-value-gaps", score: 4, total: 5 },
      { slug: "order-blocks", score: 5, total: 5 },
    ]);
  });

  it("has no average before any test is saved", () => {
    expect(testSummary([])).toEqual({ averagePct: null, best: [] });
    expect(testSummary([{ lesson_id: "x", test_score: 0, test_total: 0 }]).averagePct).toBeNull();
  });
});
