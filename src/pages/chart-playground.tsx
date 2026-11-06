import { useState } from "react";
import type { GetServerSideProps } from "next";
import { ChartStage, type Levels } from "@/components/charts/ChartStage";
import { bullishFVG } from "@/lib/charts/patterns";
import type { Zone } from "@/lib/charts/types";

/** Development-only page for trying the chart interactions. Returns 404 in production. */
export default function ChartPlayground() {
  const built = bullishFVG(7);
  const [selected, setSelected] = useState<number[]>([]);
  const [zone, setZone] = useState<Zone | null>(null);
  const [levels, setLevels] = useState<Levels>({});

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4">
      <ChartStage timeframes={built.timeframes} mode="tapCandles" selected={selected} onSelect={setSelected} />
      <p className="text-sm">Selected: {selected.join(", ") || "none"}</p>
      <ChartStage timeframes={[{ label: "5m", candles: built.candles }]} mode="markZone" zone={zone} onZoneChange={setZone} />
      <p className="text-sm">Zone: {zone ? `${zone.bottom.toFixed(2)} to ${zone.top.toFixed(2)}` : "none"}</p>
      <ChartStage timeframes={[{ label: "5m", candles: built.candles }]} mode="placeLevels" levels={levels} onLevelsChange={setLevels} />
      <p className="text-sm">Levels: {JSON.stringify(levels)}</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () =>
  process.env.NODE_ENV === "development" ? { props: {} } : { notFound: true };
