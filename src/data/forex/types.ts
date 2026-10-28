export interface ForexLessonSection {
  heading: string;
  content: string;
}

export interface ForexQuizQuestion {
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface ForexLesson {
  module: string;
  slug: string;
  title: string;
  subtitle: string;
  pansyIntro: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readingMinutes: number;
  sections: ForexLessonSection[];
  keyTakeaways: string[];
  quiz: ForexQuizQuestion[];
  brokerContext: string[];
  seoKeywords: string[];
}
