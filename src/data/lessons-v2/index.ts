import { M1_GOLD_BASICS } from "./m1-gold-basics";
import { M2_HOW_IT_WORKS } from "./m2-how-it-works";
import { M3_FIRST_CHART } from "./m3-first-chart";
import { M4_STAYING_SAFE } from "./m4-staying-safe";
import { M5_DEMO_ACCOUNT } from "./m5-demo-account";
import { M6_BEYOND_GOLD } from "./m6-beyond-gold";
import type { Lesson, LessonModule } from "./types";

export const MODULES: LessonModule[] = [
  { id: "gold-basics", number: 1, title: "Gold basics", subtitle: "What gold trading is and why the price moves." },
  { id: "how-it-works", number: 2, title: "How it works", subtitle: "Lots, leverage and the costs of trading." },
  { id: "first-chart", number: 3, title: "Your first chart", subtitle: "Reading candles, trends, floors and ceilings." },
  { id: "staying-safe", number: 4, title: "Staying safe", subtitle: "Small risks, stop losses and common mistakes." },
  { id: "demo-account", number: 5, title: "Your demo account", subtitle: "Trying a broker's platform with pretend money." },
  { id: "beyond-gold", number: 6, title: "Beyond gold", subtitle: "Forex pairs, indices, silver and other metals." },
];

export const ALL_LESSONS: Lesson[] = [
  ...M1_GOLD_BASICS,
  ...M2_HOW_IT_WORKS,
  ...M3_FIRST_CHART,
  ...M4_STAYING_SAFE,
  ...M5_DEMO_ACCOUNT,
  ...M6_BEYOND_GOLD,
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
