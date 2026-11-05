import { describe, expect, it } from "vitest";
import { parseDailyBars } from "./bars";

const newer = { date: "2026-11-04", open: 2, high: 3, low: 1, close: 2, volume: 5 };
const older = { date: "2026-11-03", open: 1, high: 2, low: 1, close: 2, volume: 4 };

describe("parseDailyBars", () => {
  it("reads a flat list, oldest first", () => {
    expect(parseDailyBars([newer, older]).map((bar) => bar.time)).toEqual(["2026-11-03", "2026-11-04"]);
  });

  it("reads the older wrapped shape too", () => {
    expect(parseDailyBars({ historical: [newer, older] }).map((bar) => bar.time)).toEqual(["2026-11-03", "2026-11-04"]);
  });

  it("returns nothing for an unexpected answer", () => {
    expect(parseDailyBars({ error: "limit" })).toEqual([]);
    expect(parseDailyBars(null)).toEqual([]);
  });

  it("treats missing volume as zero, since gold and forex may have none", () => {
    expect(parseDailyBars([{ date: "2026-11-03", open: 1, high: 2, low: 1, close: 2 }])[0].volume).toBe(0);
  });
});
