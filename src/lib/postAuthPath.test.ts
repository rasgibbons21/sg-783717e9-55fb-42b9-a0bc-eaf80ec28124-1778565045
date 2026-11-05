import { describe, expect, it } from "vitest";
import { FIRST_LESSON_PATH, postAuthPath } from "./postAuthPath";

describe("postAuthPath", () => {
  it("sends a new member to the first lesson", () => {
    expect(postAuthPath(null)).toBe(FIRST_LESSON_PATH);
    expect(postAuthPath({ onboarding_complete: false })).toBe(FIRST_LESSON_PATH);
    expect(FIRST_LESSON_PATH).toBe("/lessons/what-is-gold-trading");
  });

  it("sends a returning member home", () => {
    expect(postAuthPath({ onboarding_complete: true })).toBe("/home");
  });

  it("returns to the lesson the visitor came from", () => {
    expect(postAuthPath({ onboarding_complete: true }, "/lessons/why-gold-moves")).toBe("/lessons/why-gold-moves");
  });

  it("ignores return paths that leave Bloom or lessons", () => {
    expect(postAuthPath({ onboarding_complete: true }, "https://evil.com")).toBe("/home");
    expect(postAuthPath({ onboarding_complete: true }, "//evil.com")).toBe("/home");
    expect(postAuthPath({ onboarding_complete: true }, "/lessons/..//evil.com")).toBe("/home");
    expect(postAuthPath({ onboarding_complete: true }, "/admin")).toBe("/home");
  });
});
