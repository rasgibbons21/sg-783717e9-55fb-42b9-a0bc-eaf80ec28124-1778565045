import { useState } from "react";
import { motion } from "framer-motion";
import { ChartStage } from "@/components/charts/ChartStage";
import type { LessonBlock } from "@/data/lessons-stocks/types";
import { cn } from "@/lib/utils";
import { Feedback } from "./Feedback";
import { useAttempt } from "./useAttempt";

type Data = Extract<LessonBlock, { type: "chartTimeframe" }>;

export function ChartTimeframeBlock({ block, onAnswered }: { block: Data; onAnswered: (firstTry: boolean) => void }) {
  const [timeframe, setTimeframe] = useState(block.chart.initial);
  const [visited, setVisited] = useState(block.chart.initial === block.expectTimeframe);
  const [picked, setPicked] = useState<number | null>(null);
  const { result, solved, check } = useAttempt(onAnswered);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Line up the timeframes</p>
      <h2 className="mt-1 text-2xl leading-snug text-foreground">{block.prompt}</h2>
      <div className="mt-4">
        <ChartStage
          timeframes={block.chart.timeframes}
          initialTimeframe={block.chart.initial}
          onTimeframeChange={(label) => {
            setTimeframe(label);
            if (label === block.expectTimeframe) setVisited(true);
          }}
        />
      </div>

      {!visited ? (
        <p className="mt-4 rounded-2xl bg-secondary p-4 text-base text-foreground">Switch to the {block.expectTimeframe} chart to answer.</p>
      ) : (
        <div className="mt-4">
          <p className="text-lg text-foreground">{block.q}</p>
          <div className="mt-3 space-y-2">
            {block.options.map((option, index) => (
              <motion.button
                key={option}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setPicked(index);
                  check(index === block.correct);
                }}
                className={cn(
                  "w-full rounded-2xl border border-border bg-card p-4 text-left text-base text-foreground",
                  picked === index && (index === block.correct ? "border-[var(--bloom-sage)]" : "border-[var(--bloom-blush)]"),
                )}
              >
                {option}
              </motion.button>
            ))}
          </div>
        </div>
      )}
      {result && (
        <Feedback good={solved}>{solved ? block.explanation : `Not quite. Look again at the ${timeframe} chart and try another answer.`}</Feedback>
      )}
    </div>
  );
}
