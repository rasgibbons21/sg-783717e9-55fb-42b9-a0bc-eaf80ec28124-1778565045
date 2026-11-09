import { ChartStage } from "@/components/charts/ChartStage";
import type { LessonBlock } from "@/data/lessons-stocks/types";

type Data = Extract<LessonBlock, { type: "workedExample" }>;

/** The pattern already marked, so she sees it before she has to find it. */
export function WorkedExampleBlock({ block }: { block: Data }) {
  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Worked example</p>
      <div className="mt-3">
        <ChartStage
          timeframes={block.chart.timeframes}
          initialTimeframe={block.chart.initial}
          highlight={block.highlight}
          emphasis="pattern"
          caption="Illustrative example"
        />
      </div>
      <p className="mt-4 text-base leading-relaxed text-foreground">{block.caption}</p>
    </div>
  );
}
