import { useState } from "react";
import { ChartStage } from "@/components/charts/ChartStage";
import type { LessonBlock } from "@/data/lessons-stocks/types";
import { emphasisFor } from "@/lib/lessons/screens";
import { cn } from "@/lib/utils";

type Data = Extract<LessonBlock, { type: "strategy" }>;

/** The setup's playbook beside a chart with the plan drawn. Each step points at its part of the chart. */
export function StrategyBlock({ block }: { block: Data }) {
  const [step, setStep] = useState(0);
  const current = block.steps[step];
  const { entry, stop, target } = block.plan;

  return (
    <div>
      <h2 className="text-2xl leading-snug text-foreground">{block.title}</h2>
      <div className="mt-4">
        <ChartStage
          timeframes={block.chart.timeframes}
          initialTimeframe={block.chart.initial}
          levels={{ entry, stop, target }}
          emphasis={emphasisFor(current.focus)}
          caption="Illustrative example"
        />
      </div>
      <ol className="mt-4 space-y-2">
        {block.steps.map((item, index) => (
          <li key={item.label}>
            <button
              type="button"
              aria-current={index === step ? "step" : undefined}
              onClick={() => setStep(index)}
              className={cn(
                "min-h-[44px] w-full rounded-2xl px-4 py-3 text-left transition-colors",
                index === step ? "bg-[var(--bloom-paper-raised)] shadow-[var(--bloom-shadow)]" : "bg-transparent hover:bg-secondary",
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    index === step ? "bg-[var(--bloom-gold)] text-[var(--bloom-ink)]" : "bg-secondary text-muted-foreground",
                  )}
                >
                  {index + 1}
                </span>
                <span className="text-base font-medium text-foreground">{item.label}</span>
              </span>
              {index === step && <span className="mt-2 block pl-10 text-base leading-relaxed text-foreground">{item.body}</span>}
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="h-11 flex-1 rounded-full border border-border text-sm font-medium text-foreground disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(block.steps.length - 1, s + 1))}
          disabled={step === block.steps.length - 1}
          className="h-11 flex-1 rounded-full border border-border text-sm font-medium text-foreground disabled:opacity-40"
        >
          Next step
        </button>
      </div>
    </div>
  );
}
