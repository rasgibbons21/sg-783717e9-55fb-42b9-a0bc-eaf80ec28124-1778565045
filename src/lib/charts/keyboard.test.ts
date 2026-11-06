import { describe, expect, it } from "vitest";
import { nudge } from "./keyboard";

describe("nudge", () => {
  it("moves a handle up or down by one step", () => {
    expect(nudge(100, "ArrowUp", 0.5, 90, 110)).toBe(100.5);
    expect(nudge(100, "ArrowDown", 0.5, 90, 110)).toBe(99.5);
  });

  it("stays inside the chart", () => {
    expect(nudge(109.9, "ArrowUp", 0.5, 90, 110)).toBe(110);
    expect(nudge(90.2, "ArrowDown", 0.5, 90, 110)).toBe(90);
  });

  it("ignores other keys", () => {
    expect(nudge(100, "Enter" as never, 0.5, 90, 110)).toBe(100);
  });
});
