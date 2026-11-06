import { useState } from "react";
import { ChartStage } from "@/components/charts/ChartStage";
import type { LessonBlock } from "@/data/lessons-stocks/types";
import type { Zone } from "@/lib/charts/types";
import { gradeZone } from "@/lib/lessons/grading";
import { CheckButton } from "./CheckButton";
import { Feedback } from "./Feedback";
import { useAttempt } from "./useAttempt";

type Data = Extract<LessonBlock, { type: "chartZone" }>;

export function ChartZoneBlock({ block, onAnswered }: { block: Data; onAnswered: (firstTry: boolean) => void }) {
  const [zone, setZone] = useState<Zone | null>(null);
  const { result, solved, check, reset } = useAttempt(onAnswered);

  return (
    <div>
      <h2 className="text-2xl leading-snug text-foreground">{block.prompt}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tap the chart to place a zone, then drag its edges into place.</p>
      <div className="mt-4">
        <ChartStage
          timeframes={block.chart.timeframes}
          initialTimeframe={block.chart.initial}
          mode={solved ? "view" : "markZone"}
          zone={zone}
          onZoneChange={(next) => {
            setZone(next);
            reset();
          }}
          overlays={solved ? { zones: [{ ...block.answer, label: "The zone" }] } : undefined}
        />
      </div>
      {!solved && <CheckButton onClick={() => zone && check(gradeZone(zone, block.answer))} disabled={!zone} />}
      {result && (
        <Feedback good={solved}>{solved ? block.explanation : "Close, but not quite. Adjust the top and bottom edges so they cover the area and try again."}</Feedback>
      )}
    </div>
  );
}
