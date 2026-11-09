import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Lesson, LessonBlock } from "@/data/lessons-stocks/types";
import { canAdvance, isInteractive, resumeAt, saveResume, stagesOf, testCount } from "@/lib/lessons/engine";
import { screensFor } from "@/lib/lessons/screens";
import { clearCompletion, completeLesson, queueCompletion } from "@/lib/lessons/saveProgress";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { TextBlock } from "./blocks/TextBlock";
import { PansyBlock } from "./blocks/PansyBlock";
import { QuizBlock } from "./blocks/QuizBlock";
import { ScenarioBlock } from "./blocks/ScenarioBlock";
import { OrderBlock } from "./blocks/OrderBlock";
import { ChartFindBlock } from "./blocks/ChartFindBlock";
import { ChartZoneBlock } from "./blocks/ChartZoneBlock";
import { ChartVolumeBlock } from "./blocks/ChartVolumeBlock";
import { ChartTimeframeBlock } from "./blocks/ChartTimeframeBlock";
import { ChartPlanBlock } from "./blocks/ChartPlanBlock";
import { WorkedExampleBlock } from "./blocks/WorkedExampleBlock";
import { StrategyBlock } from "./blocks/StrategyBlock";
import { PracticeCtaBlock } from "./blocks/PracticeCtaBlock";
import { LessonComplete } from "./LessonComplete";
import { StageBar } from "./StageBar";
import { StageIntro } from "./StageIntro";
import { TestSummary } from "./TestSummary";

type SaveState = "saving" | "saved" | "failed";

function Block({ block, onAnswered }: { block: LessonBlock; onAnswered: (firstTry: boolean) => void }) {
  switch (block.type) {
    case "text":
      return <TextBlock body={block.body} />;
    case "pansy":
      return <PansyBlock body={block.body} />;
    case "quiz":
      return <QuizBlock block={block} onAnswered={onAnswered} />;
    case "scenario":
      return <ScenarioBlock block={block} onAnswered={onAnswered} />;
    case "order":
      return <OrderBlock block={block} onAnswered={onAnswered} />;
    case "chartFind":
      return <ChartFindBlock block={block} onAnswered={onAnswered} />;
    case "chartZone":
      return <ChartZoneBlock block={block} onAnswered={onAnswered} />;
    case "chartVolume":
      return <ChartVolumeBlock block={block} onAnswered={onAnswered} />;
    case "chartTimeframe":
      return <ChartTimeframeBlock block={block} onAnswered={onAnswered} />;
    case "chartPlan":
      return <ChartPlanBlock block={block} onAnswered={onAnswered} />;
    case "workedExample":
      return <WorkedExampleBlock block={block} />;
    case "strategy":
      return <StrategyBlock block={block} />;
    case "practiceCta":
      return <PracticeCtaBlock block={block} />;
  }
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const { userId } = useSubscription();
  const screens = useMemo(() => screensFor(lesson), [lesson]);
  const stages = useMemo(() => stagesOf(lesson), [lesson]);
  const total = useMemo(() => testCount(lesson), [lesson]);
  const [position, setPosition] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saving");
  const [isNew, setIsNew] = useState(true);
  const [score, setScore] = useState(0);
  const firstTryScore = useRef(0);

  useEffect(() => {
    const resumedBlock = resumeAt(lesson);
    const resumedScreen = screens.findIndex((screen) => screen.kind === "block" && screen.index === resumedBlock);
    setPosition(resumedScreen >= 0 ? resumedScreen : 0);
    setAnswered(false);
    setFinished(false);
    setSaveState("saving");
    firstTryScore.current = 0;
    setScore(0);
  }, [lesson, screens]);

  const save = useCallback(async () => {
    setSaveState("saving");
    if (process.env.NODE_ENV === "development" && userId === "dev-preview") {
      setSaveState("saved");
      return;
    }
    // Kept on this device until the server confirms, so a lost connection can't lose the lesson.
    queueCompletion(lesson.slug, firstTryScore.current);
    const result = await completeLesson(lesson.slug, firstTryScore.current);
    if (result.saved) {
      clearCompletion(lesson.slug);
      saveResume(lesson.slug, 0);
      setIsNew(result.isNew);
    }
    setSaveState(result.saved ? "saved" : "failed");
  }, [lesson.slug, userId]);

  const screen = screens[position];
  const block = screen?.kind === "block" ? lesson.blocks[screen.index] : null;
  const stageOf = (s: (typeof screens)[number]) => (s.kind === "block" ? lesson.blocks[s.index].stage : s.kind === "intro" ? s.stage : "test");
  const currentStage = screen ? stageOf(screen) : stages[0];
  const stageScreens = screens.filter((s) => stageOf(s) === currentStage);
  const progress = (stageScreens.indexOf(screen) + 1) / Math.max(stageScreens.length, 1);

  const onAnswered = (firstTry: boolean) => {
    setAnswered(true);
    if (firstTry && block?.stage === "test") {
      firstTryScore.current += 1;
      setScore(firstTryScore.current);
    }
    try {
      navigator?.vibrate?.(10);
    } catch {
      // Vibration isn't available on every device.
    }
  };

  const advance = () => {
    if (position + 1 >= screens.length) {
      setFinished(true);
      save();
      window.scrollTo({ top: 0 });
      return;
    }
    const next = screens[position + 1];
    if (next.kind === "block") saveResume(lesson.slug, next.index);
    setPosition(position + 1);
    setAnswered(false);
    window.scrollTo({ top: 0 });
  };

  if (finished) return <LessonComplete lesson={lesson} saveState={saveState} isNew={isNew} onRetrySave={save} />;
  if (!screen) return null;

  const ready = block ? canAdvance(block, answered) : true;
  const label = !ready && block && isInteractive(block) ? "Choose an answer to continue" : position + 1 >= screens.length ? "Finish lesson" : "Continue";

  return (
    <div className="mx-auto max-w-xl px-4 pb-6 pt-5">
      <StageBar stages={stages} current={currentStage} progress={progress} />
      <p className="mt-4 text-sm font-medium text-muted-foreground">{lesson.title}</p>

      <div
        key={position}
        className="bloom-rise mt-4 min-h-[320px] rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)]"
        style={{ animationDuration: "250ms" }}
      >
        {screen.kind === "intro" && <StageIntro stage={screen.stage} />}
        {screen.kind === "summary" && <TestSummary score={score} total={total} />}
        {block && <Block block={block} onAnswered={onAnswered} />}
      </div>

      <motion.button
        whileTap={ready ? { scale: 0.97 } : undefined}
        onClick={advance}
        disabled={!ready}
        className="mt-6 h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
      >
        {label}
      </motion.button>
    </div>
  );
}
