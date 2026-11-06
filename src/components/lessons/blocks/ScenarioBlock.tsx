import { useState } from "react";
import { motion } from "framer-motion";
import type { LessonBlock } from "@/data/lessons-stocks/types";
import { cn } from "@/lib/utils";
import { Feedback } from "./Feedback";

type ScenarioData = Extract<LessonBlock, { type: "scenario" }>;

export function ScenarioBlock({ block, onAnswered }: { block: ScenarioData; onAnswered: (firstTry: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const choice = picked === null ? null : block.choices[picked];

  const pick = (index: number) => {
    if (solved) return;
    setPicked(index);
    setTries((count) => count + 1);
    if (block.choices[index].good) {
      setSolved(true);
      onAnswered(tries === 0);
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What would you do?</p>
      <h2 className="mt-2 text-2xl font-semibold leading-snug text-foreground">{block.prompt}</h2>
      <div className="mt-4 space-y-3">
        {block.choices.map((option, index) => (
          <motion.button
            key={option.label}
            whileTap={{ scale: 0.98 }}
            onClick={() => pick(index)}
            className={cn(
              "w-full rounded-2xl border border-border bg-card p-4 text-left text-base text-foreground",
              picked === index && (option.good ? "border-primary bg-[rgba(143,160,136,0.18)]" : "border-[var(--bloom-blush)] bg-accent/50"),
            )}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
      {choice && (
        <Feedback good={choice.good}>
          {choice.outcome}
          {!choice.good && " Try another choice to see what could happen."}
        </Feedback>
      )}
    </div>
  );
}
