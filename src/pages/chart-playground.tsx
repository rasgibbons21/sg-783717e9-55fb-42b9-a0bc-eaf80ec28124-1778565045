import { useState } from "react";
import type { GetServerSideProps } from "next";
import { ChartStage, type ChartEmphasis, type Levels } from "@/components/charts/ChartStage";
import { bullishFVG } from "@/lib/charts/patterns";
import type { Zone } from "@/lib/charts/types";

const EMPHASES: (ChartEmphasis | null)[] = [null, "pattern", "volume", "entry", "stop", "target", "timeframe"];

/** Development-only page for trying the chart interactions. Returns 404 in production. */
export default function ChartPlayground() {
  const built = bullishFVG(7);
  const shown = bullishFVG(11);
  const [selected, setSelected] = useState<number[]>([]);
  const [zone, setZone] = useState<Zone | null>(null);
  const [levels, setLevels] = useState<Levels>({});
  const [emphasisIndex, setEmphasisIndex] = useState(0);
  const gap = shown.answer.fvg.zone;
  const entry = Math.round(((gap.top + gap.bottom) / 2) * 100) / 100;
  const stop = Math.round(shown.candles[shown.answer.fvg.indexes[0]].low * 0.999 * 100) / 100;
  const viewLevels = { entry, stop, target: Math.round((entry + 2 * (entry - stop)) * 100) / 100 };

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4">
      <ChartStage timeframes={built.timeframes} mode="tapCandles" selected={selected} onSelect={setSelected} />
      <p className="text-sm">Selected: {selected.join(", ") || "none"}</p>
      <ChartStage timeframes={[{ label: "5m", candles: built.candles }]} mode="markZone" zone={zone} onZoneChange={setZone} />
      <p className="text-sm">Zone: {zone ? `${zone.bottom.toFixed(2)} to ${zone.top.toFixed(2)}` : "none"}</p>
      <ChartStage timeframes={[{ label: "5m", candles: built.candles }]} mode="placeLevels" levels={levels} onLevelsChange={setLevels} />
      <p className="text-sm">Levels: {JSON.stringify(levels)}</p>

      <h2 className="text-2xl">View with highlight and emphasis</h2>
      <div id="view-chart">
        <ChartStage
          timeframes={shown.timeframes}
          initialTimeframe="5m"
          highlight={{ kind: "zone", zone: gap }}
          levels={viewLevels}
          emphasis={EMPHASES[emphasisIndex]}
        />
      </div>
      <button type="button" className="h-11 rounded-full bg-primary px-5 text-primary-foreground" onClick={() => setEmphasisIndex((i) => (i + 1) % EMPHASES.length)}>
        Emphasis: {EMPHASES[emphasisIndex] ?? "none"}
      </button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () =>
  process.env.NODE_ENV === "development" ? { props: {} } : { notFound: true };
