import { M1_FOUNDATIONS } from "./m1-foundations";
import { M2_STRUCTURE } from "./m2-structure";
import { M3_LIQUIDITY } from "./m3-liquidity";
import { M4_IMBALANCES } from "./m4-imbalances";
import { M5_INSTITUTIONAL } from "./m5-institutional";
import { M6_MODELS } from "./m6-models";
import { M7_EXECUTION } from "./m7-execution";
import type { Lesson, LessonModule } from "./types";

export const MODULES: LessonModule[] = [
  { id: "foundations", number: 1, title: "Foundations", subtitle: "Candles, volume and timeframes." },
  { id: "structure", number: 2, title: "Structure", subtitle: "Trend, breaks of structure and key levels." },
  { id: "liquidity", number: 3, title: "Liquidity", subtitle: "Where stops rest, sweeps, premium and discount." },
  { id: "imbalances", number: 4, title: "Imbalances", subtitle: "Fair value gaps and displacement." },
  { id: "institutional", number: 5, title: "Institutional zones", subtitle: "Order blocks, breakers and optimal entries." },
  { id: "models", number: 6, title: "Models and timing", subtitle: "Power of 3, the Silver Bullet, CRT and breakouts." },
  { id: "execution", number: 7, title: "Execution and risk", subtitle: "The full checklist, sizing and journaling." },
];

export const ALL_LESSONS: Lesson[] = [
  ...M1_FOUNDATIONS,
  ...M2_STRUCTURE,
  ...M3_LIQUIDITY,
  ...M4_IMBALANCES,
  ...M5_INSTITUTIONAL,
  ...M6_MODELS,
  ...M7_EXECUTION,
];

export function getLesson(slug: string): Lesson | undefined {
  return ALL_LESSONS.find((lesson) => lesson.slug === slug);
}

export function nextLesson(slug: string): Lesson | null {
  const index = ALL_LESSONS.findIndex((lesson) => lesson.slug === slug);
  return index >= 0 ? ALL_LESSONS[index + 1] ?? null : null;
}

export function lessonsInModule(moduleId: string): Lesson[] {
  return ALL_LESSONS.filter((lesson) => lesson.moduleId === moduleId);
}

/** The first lesson not yet finished, or null when the whole course is complete. */
export function firstIncomplete(completedSlugs: string[]): Lesson | null {
  const completed = new Set(completedSlugs);
  return ALL_LESSONS.find((lesson) => !completed.has(lesson.slug)) ?? null;
}

export function hasFinishedCourse(completedSlugs: string[]): boolean {
  return firstIncomplete(completedSlugs) === null;
}
