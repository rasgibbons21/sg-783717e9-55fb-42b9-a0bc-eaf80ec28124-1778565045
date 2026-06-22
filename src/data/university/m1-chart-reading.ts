// Stub — full M1 content lives on claude/university-pr1 branch
export interface LessonSection {
  type: "overview" | "why-matters" | "how-identify" | "psychology" | "how-read" | "mistakes" | "takeaway";
  heading: string;
  content: string;
}

export interface QuizQuestion {
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface UniversityLesson {
  module: string;
  slug: string;
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readingMinutes: number;
  sections: LessonSection[];
  diagram: string;
  quiz: QuizQuestion[];
  girlToGirlTip: string;
  videoSlot: null;
}

export const M1_LESSONS: UniversityLesson[] = [];

export function getM1LessonBySlug(slug: string): UniversityLesson | undefined {
  return M1_LESSONS.find((l) => l.slug === slug);
}
