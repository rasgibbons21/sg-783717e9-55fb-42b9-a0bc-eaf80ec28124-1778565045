import type { BaseBlock as LessonBlock } from "@/data/lessons-stocks/types";

const READING_BLOCKS: LessonBlock["type"][] = ["text", "pansy"];

export function isInteractive(block: LessonBlock): boolean {
  return !READING_BLOCKS.includes(block.type);
}

export function canAdvance(block: LessonBlock, answered: boolean): boolean {
  return !isInteractive(block) || answered;
}

export function isOrderCorrect(steps: string[], attempt: string[]): boolean {
  return steps.length === attempt.length && steps.every((step, index) => step === attempt[index]);
}

/** A repeatable shuffle (so server and browser agree) that never deals the answer. */
export function shuffleNotSolved(steps: string[], seed: number): string[] {
  const dealt = [...steps];
  let state = seed + 1;
  for (let i = dealt.length - 1; i > 0; i -= 1) {
    state = (state * 16807) % 2147483647;
    const j = state % (i + 1);
    [dealt[i], dealt[j]] = [dealt[j], dealt[i]];
  }
  if (dealt.length > 1 && isOrderCorrect(steps, dealt)) dealt.push(dealt.shift() as string);
  return dealt;
}

const resumeKey = (slug: string) => `bloom-lesson-resume:${slug}`;

export function saveResume(slug: string, index: number): void {
  try {
    localStorage.setItem(resumeKey(slug), String(index));
  } catch {
    // Private browsing can block storage. The lesson still works without it.
  }
}

export function loadResume(slug: string): number {
  try {
    const value = Number(localStorage.getItem(resumeKey(slug)));
    return Number.isInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}
