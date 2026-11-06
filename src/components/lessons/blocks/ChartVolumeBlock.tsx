import { motion } from "framer-motion";
import { ChartStage } from "@/components/charts/ChartStage";
import type { LessonBlock } from "@/data/lessons-stocks/types";
import { Feedback } from "./Feedback";
import { useAttempt } from "./useAttempt";

type Data = Extract<LessonBlock, { type: "chartVolume" }>;

const CHOICES = [
  { label: "Yes, volume confirms it", value: true },
  { label: "No, volume is weak", value: false },
];

export function ChartVolumeBlock({ block, onAnswered }: { block: Data; onAnswered: (firstTry: boolean) => void }) {
  const { result, solved, check } = useAttempt(onAnswered);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Read the volume</p>
      <h2 className="mt-1 text-2xl leading-snug text-foreground">{block.prompt}</h2>
      <p className="mt-1 text-sm text-muted-foreground">The outlined candle is the one to judge. Volume bars sit under the chart.</p>
      <div className="mt-4">
        <ChartStage timeframes={block.chart.timeframes} initialTimeframe={block.chart.initial} selected={[block.index]} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CHOICES.map((choice) => (
          <motion.button
            key={choice.label}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => check(choice.value === block.confirms)}
            className="rounded-2xl border border-border bg-card p-4 text-left text-base text-foreground"
          >
            {choice.label}
          </motion.button>
        ))}
      </div>
      {result && <Feedback good={solved}>{solved ? block.explanation : "Compare that bar with the ones before it, then try again."}</Feedback>}
    </div>
  );
}
