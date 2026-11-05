import { useState } from "react";
import type { LessonBlock } from "@/data/lessons-v2/types";
import { Feedback } from "./Feedback";

type ChartData = Extract<LessonBlock, { type: "chartTap" }>;

const WIDTH = 320;
const HEIGHT = 190;
const PAD = 12;

export function ChartTapBlock({ block, onAnswered }: { block: ChartData; onAnswered: (firstTry: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const solved = picked !== null && block.correctIndexes.includes(picked);

  const high = Math.max(...block.candles.map((c) => c.high));
  const low = Math.min(...block.candles.map((c) => c.low));
  const y = (price: number) => PAD + ((high - price) / (high - low || 1)) * (HEIGHT - PAD * 2);
  const slot = (WIDTH - PAD * 2) / block.candles.length;

  const pick = (index: number) => {
    if (solved) return;
    setPicked(index);
    setTries((count) => count + 1);
    if (block.correctIndexes.includes(index)) onAnswered(tries === 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold leading-snug text-foreground">{block.prompt}</h2>
      <div className="mt-4 rounded-3xl bg-card p-3 shadow-[var(--bloom-shadow)]">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="group" aria-label="Simple gold price chart. Tap a candle to choose it.">
          {block.candles.map((candle, index) => {
            const x = PAD + slot * index + slot / 2;
            const rising = candle.close >= candle.open;
            const colour = rising ? "var(--bloom-sage)" : "var(--bloom-clay)";
            const top = y(Math.max(candle.open, candle.close));
            const bodyHeight = Math.max(2, Math.abs(y(candle.open) - y(candle.close)));
            const isPicked = picked === index;
            return (
              <g
                key={`${index}-${candle.open}`}
                role="button"
                tabIndex={0}
                aria-label={`Candle ${index + 1} of ${block.candles.length}, ${rising ? "rising" : "falling"}`}
                aria-pressed={isPicked}
                onClick={() => pick(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    pick(index);
                  }
                }}
                className="cursor-pointer outline-none"
              >
                <rect x={x - slot / 2} y={0} width={slot} height={HEIGHT} rx={8} fill={isPicked ? "var(--bloom-blush)" : "transparent"} fillOpacity={0.7} />
                <line x1={x} x2={x} y1={y(candle.high)} y2={y(candle.low)} stroke={colour} strokeWidth={1.5} />
                <rect x={x - slot * 0.28} y={top} width={slot * 0.56} height={bodyHeight} rx={2} fill={colour} />
              </g>
            );
          })}
        </svg>
        <p className="mt-1 text-center text-xs text-muted-foreground">Illustrative example, not a real price chart.</p>
      </div>
      {picked !== null && (
        <Feedback good={solved}>{solved ? block.explanation : "Not that one, but good thinking. Have another look and tap a different candle."}</Feedback>
      )}
    </div>
  );
}
