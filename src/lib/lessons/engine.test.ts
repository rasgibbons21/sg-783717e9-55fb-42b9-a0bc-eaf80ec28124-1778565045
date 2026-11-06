import { afterEach, describe, expect, it, vi } from "vitest";
import {
  canAdvance,
  isInteractive,
  isOrderCorrect,
  loadResume,
  saveResume,
  shuffleNotSolved,
} from "./engine";

const steps = ["Choose an instrument", "Set a stop", "Choose a lot size", "Place the trade"];

describe("order blocks", () => {
  it("recognises the correct order", () => {
    expect(isOrderCorrect(steps, [...steps])).toBe(true);
    expect(isOrderCorrect(steps, [steps[1], steps[0], steps[2], steps[3]])).toBe(false);
  });

  it("never deals the steps out already solved", () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const dealt = shuffleNotSolved(steps, seed);
      expect(isOrderCorrect(steps, dealt)).toBe(false);
      expect([...dealt].sort()).toEqual([...steps].sort());
    }
  });
});

describe("advancing", () => {
  it("lets reading blocks advance straight away", () => {
    expect(isInteractive({ type: "text", body: "x" })).toBe(false);
    expect(canAdvance({ type: "pansy", body: "x" }, false)).toBe(true);
  });

  it("treats every chart exercise as interactive", () => {
    const chart = { timeframes: [], initial: "5m" };
    expect(isInteractive({ type: "chartFind", prompt: "", chart, answer: [], explanation: "" })).toBe(true);
    expect(isInteractive({ type: "chartPlan", prompt: "", chart, direction: "long", entryZone: { top: 1, bottom: 0 }, invalidation: 0, minRR: 1.5, explanation: "" })).toBe(true);
  });

  it("holds interactive blocks until answered", () => {
    const quiz = { type: "quiz" as const, q: "?", options: ["a", "b"], correct: 0, explanation: "x" };
    expect(isInteractive(quiz)).toBe(true);
    expect(canAdvance(quiz, false)).toBe(false);
    expect(canAdvance(quiz, true)).toBe(true);
  });
});

describe("resume", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("remembers the block a member reached", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });
    saveResume("what-is-gold-trading", 3);
    expect(loadResume("what-is-gold-trading")).toBe(3);
    expect(loadResume("another-lesson")).toBe(0);
  });

  it("starts from the beginning when storage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() => saveResume("what-is-gold-trading", 3)).not.toThrow();
    expect(loadResume("what-is-gold-trading")).toBe(0);
  });

  it("ignores a corrupted saved value", () => {
    vi.stubGlobal("localStorage", { getItem: () => "not-a-number", setItem: () => undefined });
    expect(loadResume("what-is-gold-trading")).toBe(0);
  });
});
