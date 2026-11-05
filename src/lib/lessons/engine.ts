import type { LessonBlock, SliderOutcomeKey } from "@/data/lessons-v2/types";

const READING_BLOCKS: LessonBlock["type"][] = ["text", "pansy"];
const OUNCES_PER_LOT = 100;
const EXAMPLE_MARGIN = 100;
const EXAMPLE_BALANCE = 10_000;

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

export interface SliderOutcome {
  text: string;
  controlled?: number;
  adverseMoveCost?: number;
  ounces?: number;
  riskAmount?: number;
}

const money = (value: number) => `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function sliderOutcome(key: SliderOutcomeKey, value: number): SliderOutcome {
  if (key === "leverage") {
    const controlled = EXAMPLE_MARGIN * value;
    const adverseMoveCost = controlled / 100;
    return {
      controlled,
      adverseMoveCost,
      text: `With ${money(EXAMPLE_MARGIN)} of your own money you control ${money(controlled)} of gold. If gold falls just 1%, you lose ${money(adverseMoveCost)}.`,
    };
  }
  if (key === "lotSize") {
    const ounces = Math.round(value * OUNCES_PER_LOT * 100) / 100;
    return {
      ounces,
      text: `${value} lot is ${ounces} ${ounces === 1 ? "ounce" : "ounces"} of gold. Each $1 move in the gold price changes your result by ${money(ounces)}.`,
    };
  }
  const riskAmount = (EXAMPLE_BALANCE * value) / 100;
  return {
    riskAmount,
    text: `On a ${money(EXAMPLE_BALANCE)} practice account, a ${value}% risk means this trade can lose about ${money(riskAmount)} before your stop closes it.`,
  };
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
