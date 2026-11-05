import { useState } from "react";
import { motion } from "framer-motion";
import type { LessonBlock } from "@/data/lessons-v2/types";
import { cn } from "@/lib/utils";
import { Feedback } from "./Feedback";

type QuizData = Extract<LessonBlock, { type: "quiz" }>;

export function QuizBlock({ block, onAnswered }: { block: QuizData; onAnswered: (firstTry: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const solved = picked === block.correct;

  const pick = (index: number) => {
    if (solved) return;
    setPicked(index);
    setTries((count) => count + 1);
    if (index === block.correct) onAnswered(tries === 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold leading-snug text-foreground">{block.q}</h2>
      <div className="mt-4 space-y-3">
        {block.options.map((option, index) => (
          <motion.button
            key={option}
            whileTap={{ scale: 0.98 }}
            onClick={() => pick(index)}
            className={cn(
              "w-full rounded-2xl border border-border bg-card p-4 text-left text-base text-foreground transition-colors",
              picked === index && index === block.correct && "border-primary bg-[#E6ECE3]",
              picked === index && index !== block.correct && "border-[var(--bloom-clay)] bg-accent/50",
            )}
          >
            {option}
          </motion.button>
        ))}
      </div>
      {picked !== null && (
        <Feedback good={solved}>{solved ? block.explanation : "Not quite, and that's completely fine. Have another look and try again."}</Feedback>
      )}
    </div>
  );
}
