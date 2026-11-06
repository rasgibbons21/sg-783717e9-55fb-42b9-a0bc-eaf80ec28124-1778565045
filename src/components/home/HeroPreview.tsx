import { useMemo, useState } from "react";
import Link from "next/link";
import { ChartStage } from "@/components/charts/ChartStage";
import { bullishFVG } from "@/lib/charts/patterns";
import { gradeFind } from "@/lib/lessons/grading";

/** A taste of the first exercise: find the three candles of a fair value gap. */
export function HeroPreview() {
  const built = useMemo(() => bullishFVG(7), []);
  const [selected, setSelected] = useState<number[]>([]);
  const found = gradeFind(selected, built.answer.fvg.indexes);

  return (
    <div className="mx-auto mt-12 max-w-xl text-left">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bloom-gold)]">Try it now</p>
      <p className="mt-2 text-center font-serif text-2xl text-foreground">Tap the three candles that form the gap.</p>
      <div className="mt-4">
        <ChartStage
          timeframes={[{ label: "5m", candles: built.candles }]}
          mode={found ? "view" : "tapCandles"}
          selected={selected}
          onSelect={setSelected}
          overlays={found ? { zones: [{ ...built.answer.fvg.zone, label: "Fair value gap" }] } : undefined}
          height={240}
        />
      </div>
      <p className="mt-3 min-h-[3rem] text-center text-base text-muted-foreground" aria-live="polite">
        {found ? (
          <>
            That&apos;s a fair value gap.{" "}
            <Link href="/onboarding" className="font-semibold text-[var(--bloom-gold)] underline underline-offset-4">
              Learn what to do with it
            </Link>
          </>
        ) : selected.length >= 3 ? (
          "Not quite. Look for three candles where the first and third wicks don't overlap."
        ) : (
          "Look for a fast move that leaves a space between two wicks."
        )}
      </p>
    </div>
  );
}
