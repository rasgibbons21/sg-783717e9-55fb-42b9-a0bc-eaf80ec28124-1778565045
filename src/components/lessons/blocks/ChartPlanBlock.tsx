import { useState } from "react";
import { ChartStage, type Levels } from "@/components/charts/ChartStage";
import type { LessonBlock } from "@/data/lessons-stocks/types";
import { gradePlan } from "@/lib/lessons/grading";
import { CheckButton } from "./CheckButton";
import { Feedback } from "./Feedback";
import { useAttempt } from "./useAttempt";

type Data = Extract<LessonBlock, { type: "chartPlan" }>;

export function ChartPlanBlock({ block, onAnswered }: { block: Data; onAnswered: (firstTry: boolean) => void }) {
  const [levels, setLevels] = useState<Levels>({});
  const [reasons, setReasons] = useState<string[]>([]);
  const { result, solved, check, reset } = useAttempt(onAnswered);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Plan the trade</p>
      <h2 className="mt-1 text-2xl leading-snug text-foreground">{block.prompt}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Drag the Entry, Stop and Target lines. This is a {block.direction === "long" ? "buy" : "sell"} idea.
      </p>
      <div className="mt-4">
        <ChartStage
          timeframes={block.chart.timeframes}
          initialTimeframe={block.chart.initial}
          mode={solved ? "view" : "placeLevels"}
          levels={levels}
          onLevelsChange={(next) => {
            setLevels(next);
            reset();
          }}
          overlays={{ zones: [{ ...block.entryZone, label: "Entry zone" }], lines: [{ price: block.invalidation, label: "Idea is wrong past here" }] }}
        />
      </div>
      {!solved && (
        <CheckButton
          onClick={() => {
            const graded = gradePlan(levels, block);
            setReasons(graded.reasons);
            check(graded.ok);
          }}
        >
          Check my plan
        </CheckButton>
      )}
      {result && (
        <Feedback good={solved}>
          {solved ? (
            block.explanation
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </Feedback>
      )}
    </div>
  );
}
