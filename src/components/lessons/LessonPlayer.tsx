import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Lesson, LessonBlock } from "@/data/lessons-v2/types";
import { canAdvance, isInteractive, loadResume, saveResume } from "@/lib/lessons/engine";
import { completeLesson } from "@/lib/lessons/saveProgress";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { TextBlock } from "./blocks/TextBlock";
import { PansyBlock } from "./blocks/PansyBlock";
import { QuizBlock } from "./blocks/QuizBlock";
import { ScenarioBlock } from "./blocks/ScenarioBlock";
import { SliderBlock } from "./blocks/SliderBlock";
import { OrderBlock } from "./blocks/OrderBlock";
import { ChartTapBlock } from "./blocks/ChartTapBlock";
import { LessonComplete } from "./LessonComplete";

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
    case "slider":
      return <SliderBlock block={block} onAnswered={onAnswered} />;
    case "order":
      return <OrderBlock block={block} onAnswered={onAnswered} />;
    case "chartTap":
      return <ChartTapBlock block={block} onAnswered={onAnswered} />;
  }
}

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const { userId } = useSubscription();
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saving");
  const firstTryScore = useRef(0);

  useEffect(() => {
    const resumed = loadResume(lesson.slug);
    setIndex(resumed < lesson.blocks.length ? resumed : 0);
    setAnswered(false);
    setFinished(false);
    setSaveState("saving");
    firstTryScore.current = 0;
  }, [lesson]);

  const save = useCallback(async () => {
    setSaveState("saving");
    const isDevPreview = process.env.NODE_ENV === "development" && userId === "dev-preview";
    const saved = isDevPreview || (userId ? await completeLesson(supabase, userId, lesson.slug, firstTryScore.current) : false);
    setSaveState(saved ? "saved" : "failed");
  }, [lesson.slug, userId]);

  const block = lesson.blocks[index];
  const total = lesson.blocks.length;

  const onAnswered = (firstTry: boolean) => {
    setAnswered(true);
    if (firstTry) firstTryScore.current += 1;
    try {
      navigator?.vibrate?.(10);
    } catch {
      // Vibration isn't available on every device.
    }
  };

  const advance = () => {
    if (index + 1 >= total) {
      saveResume(lesson.slug, 0);
      setFinished(true);
      save();
      window.scrollTo({ top: 0 });
      return;
    }
    saveResume(lesson.slug, index + 1);
    setIndex(index + 1);
    setAnswered(false);
    window.scrollTo({ top: 0 });
  };

  if (finished) return <LessonComplete lesson={lesson} saveState={saveState} onRetrySave={save} />;
  if (!block) return null;

  const ready = canAdvance(block, answered);

  return (
    <div className="mx-auto max-w-xl px-4 pb-6 pt-5">
      <div className="flex items-center gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index + 1} aria-label="Lesson progress">
        {lesson.blocks.map((item, position) => (
          <span
            key={position}
            className={`h-1.5 flex-1 rounded-full transition-colors ${position <= index ? "bg-[var(--bloom-gold)]" : "bg-secondary"}`}
          />
        ))}
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{lesson.title}</p>

      <div key={index} className="bloom-rise mt-4 min-h-[320px]" style={{ animationDuration: "250ms" }}>
        <Block block={block} onAnswered={onAnswered} />
      </div>

      <motion.button
        whileTap={ready ? { scale: 0.97 } : undefined}
        onClick={advance}
        disabled={!ready}
        className="mt-6 h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
      >
        {!ready && isInteractive(block) ? "Choose an answer to continue" : index + 1 >= total ? "Finish lesson" : "Continue"}
      </motion.button>
    </div>
  );
}
