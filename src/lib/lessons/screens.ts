import type { ChartEmphasis } from "@/components/charts/ChartStage";
import type { Lesson, Stage, StrategyStep } from "@/data/lessons-stocks/types";

/** What the player shows, one at a time: a stage's title card, a block, or the test score. */
export type Screen = { kind: "intro"; stage: Stage } | { kind: "block"; index: number } | { kind: "summary" };

export function screensFor(lesson: Lesson): Screen[] {
  const screens: Screen[] = [];
  const lastTest = lesson.blocks.map((block) => block.stage).lastIndexOf("test");
  lesson.blocks.forEach((block, index) => {
    if (index > 0 && lesson.blocks[index - 1].stage !== block.stage) screens.push({ kind: "intro", stage: block.stage });
    screens.push({ kind: "block", index });
    if (index === lastTest) screens.push({ kind: "summary" });
  });
  return screens;
}

/** Which part of the strategy chart each step points at. */
export function emphasisFor(focus: StrategyStep["focus"]): ChartEmphasis | null {
  if (focus === "skip") return null;
  if (focus === "context") return "timeframe";
  return focus;
}

export const practiceHref = (setup: string, timeframe: string) =>
  `/practice?setup=${encodeURIComponent(setup)}&tf=${encodeURIComponent(timeframe)}`;

export function summaryLine(score: number, total: number): string {
  if (total > 0 && score === total) return "Every one on the first try. Beautifully done.";
  if (score * 2 >= total) return "Lovely work. The ones you retried are the ones you'll remember.";
  return "That's what practice is for. Have another read of the strategy any time.";
}
