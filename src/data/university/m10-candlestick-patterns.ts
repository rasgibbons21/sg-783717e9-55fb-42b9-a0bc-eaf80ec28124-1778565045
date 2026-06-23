import type { UniversityLesson } from "@/data/university/m1-chart-reading";

export const M10_LESSONS: UniversityLesson[] = [
  // Content will be populated from bloom-university-candlestick-patterns.md
];

export function getM10LessonBySlug(slug: string): UniversityLesson | undefined {
  return M10_LESSONS.find((l) => l.slug === slug);
}
