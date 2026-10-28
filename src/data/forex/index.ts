export type { ForexLesson, ForexLessonSection, ForexQuizQuestion } from "./types";
export { FOREX_MODULES, getForexModuleById } from "./modules";
export type { ForexModule } from "./modules";
export { M1_FOUNDATIONS } from "./m1-foundations";
export { M2_BROKER_PLATFORM } from "./m2-broker-platform";
export { M3_ANALYSIS } from "./m3-analysis";
export { M4_RISK_MINDSET } from "./m4-risk-mindset";

import type { ForexLesson } from "./types";
import { M1_FOUNDATIONS } from "./m1-foundations";
import { M2_BROKER_PLATFORM } from "./m2-broker-platform";
import { M3_ANALYSIS } from "./m3-analysis";
import { M4_RISK_MINDSET } from "./m4-risk-mindset";

const LESSONS_BY_MODULE: Record<string, ForexLesson[]> = {
  foundations: M1_FOUNDATIONS,
  "broker-platform": M2_BROKER_PLATFORM,
  analysis: M3_ANALYSIS,
  "risk-mindset": M4_RISK_MINDSET,
};

export function getAllForexLessons(): ForexLesson[] {
  return [
    ...M1_FOUNDATIONS,
    ...M2_BROKER_PLATFORM,
    ...M3_ANALYSIS,
    ...M4_RISK_MINDSET,
  ];
}

export function getForexLessonsByModule(moduleId: string): ForexLesson[] {
  return LESSONS_BY_MODULE[moduleId] ?? [];
}

export function getForexLessonBySlug(slug: string): ForexLesson | undefined {
  return getAllForexLessons().find((l) => l.slug === slug);
}
