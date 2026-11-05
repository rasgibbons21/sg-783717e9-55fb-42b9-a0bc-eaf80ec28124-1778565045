import { M1_GOLD_BASICS } from "./m1-gold-basics";
import type { Lesson, LessonModule } from "./types";

export const MODULES: LessonModule[] = [
  { id: "gold-basics", number: 1, title: "Gold basics", subtitle: "What gold trading is and why the price moves." },
];

export const ALL_LESSONS: Lesson[] = [...M1_GOLD_BASICS];

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
