import { useState } from "react";
import type { LessonBlock } from "@/data/lessons-stocks/types";
import { sliderOutcome } from "@/lib/lessons/engine";

type SliderData = Extract<LessonBlock, { type: "slider" }>;

export function SliderBlock({ block, onAnswered }: { block: SliderData; onAnswered: (firstTry: boolean) => void }) {
  const [value, setValue] = useState(block.initial);
  const [moved, setMoved] = useState(false);

  const change = (next: number) => {
    setValue(next);
    if (!moved) {
      setMoved(true);
      onAnswered(true);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold leading-snug text-foreground">{block.prompt}</h2>
      <div className="mt-5 rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)]">
        <p className="text-center font-serif text-4xl font-semibold text-primary">
          {value}
          <span className="ml-1 text-xl">{block.unit}</span>
        </p>
        <input
          type="range"
          aria-label={block.prompt}
          min={block.min}
          max={block.max}
          step={block.step}
          value={value}
          onChange={(event) => change(Number(event.target.value))}
          className="mt-4 h-8 w-full accent-[var(--bloom-sage)]"
        />
        <p aria-live="polite" className="mt-3 text-base leading-relaxed text-foreground">
          {sliderOutcome(block.outcomeKey, value).text}
        </p>
      </div>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{moved ? block.note : "Move the slider to see what changes."}</p>
    </div>
  );
}
