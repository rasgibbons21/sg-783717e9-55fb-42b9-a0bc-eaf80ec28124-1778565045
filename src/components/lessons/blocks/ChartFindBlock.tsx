import { useState } from "react";
import { ChartStage } from "@/components/charts/ChartStage";
import type { LessonBlock } from "@/data/lessons-stocks/types";
import { gradeFind } from "@/lib/lessons/grading";
import { CheckButton } from "./CheckButton";
import { Feedback } from "./Feedback";
import { useAttempt } from "./useAttempt";

type Data = Extract<LessonBlock, { type: "chartFind" }>;

export function ChartFindBlock({ block, onAnswered }: { block: Data; onAnswered: (firstTry: boolean) => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const { result, solved, check, reset } = useAttempt(onAnswered);

  return (
    <div>
      <h2 className="text-2xl leading-snug text-foreground">{block.prompt}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tap candles to select them. Tap again to deselect.</p>
      <div className="mt-4">
        <ChartStage
          timeframes={block.chart.timeframes}
          initialTimeframe={block.chart.initial}
          mode={solved ? "view" : "tapCandles"}
          selected={selected}
          onSelect={(next) => {
            setSelected(next);
            reset();
          }}
        />
      </div>
      {!solved && <CheckButton onClick={() => check(gradeFind(selected, block.answer))} disabled={selected.length === 0} />}
      {result && <Feedback good={solved}>{solved ? block.explanation : "Not quite yet. Have another look at the candles and try again."}</Feedback>}
    </div>
  );
}
