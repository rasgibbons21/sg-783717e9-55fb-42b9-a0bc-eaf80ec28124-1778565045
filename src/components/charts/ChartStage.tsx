import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { nudge, type NudgeKey } from "@/lib/charts/keyboard";
import { riskReward } from "@/lib/charts/detectors";
import { priceScale } from "@/lib/charts/scale";
import { defaultLevels as spacedLevels, defaultZone, handleHitRects } from "@/lib/charts/levels";
import type { Candle, Zone } from "@/lib/charts/types";
import { useDrag } from "./useDrag";
import { cn } from "@/lib/utils";

export type ChartMode = "view" | "tapCandles" | "markZone" | "placeLevels";

export interface Levels {
  entry?: number;
  stop?: number;
  target?: number;
}

export interface ChartStageProps {
  timeframes: { label: string; candles: Candle[] }[];
  initialTimeframe?: string;
  onTimeframeChange?: (label: string) => void;
  mode?: ChartMode;
  selected?: number[];
  onSelect?: (indexes: number[]) => void;
  zone?: Zone | null;
  onZoneChange?: (zone: Zone) => void;
  levels?: Levels;
  onLevelsChange?: (levels: Levels) => void;
  overlays?: {
    zones?: (Zone & { label?: string })[];
    lines?: { price: number; label: string }[];
    bands?: { fromIndex: number; toIndex: number; label: string }[];
  };
  height?: number;
  caption?: string;
}

const HIT = 44;
const PAD_X = 8;
const PRICE_PAD = 14;
const LEVEL_STYLE: Record<keyof Levels, { label: string; colour: string }> = {
  entry: { label: "Planned entry", colour: "var(--bloom-gold)" },
  stop: { label: "Stop", colour: "var(--bloom-blush)" },
  target: { label: "Target", colour: "var(--bloom-sage)" },
};

function useWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(340);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function DragLine({
  svgRef,
  y,
  width,
  label,
  colour,
  onMoveTo,
  onKey,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  y: number;
  width: number;
  label: string;
  colour: string;
  onMoveTo: (y: number) => void;
  onKey: (key: NudgeKey) => void;
}) {
  const drag = useDrag(svgRef, onMoveTo);
  return (
    <g
      role="slider"
      aria-label={`${label} line. Use the up and down arrow keys to move it.`}
      aria-valuetext={label}
      tabIndex={0}
      className="cursor-ns-resize outline-none focus-visible:[&>line]:stroke-[3]"
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault();
          onKey(event.key);
        }
      }}
      {...drag}
    >
      <rect x={0} y={y - HIT / 2} width={width} height={HIT} fill="transparent" />
      <line x1={0} x2={width} y1={y} y2={y} stroke={colour} strokeWidth={1.5} strokeDasharray="5 4" />
      <rect x={width - 66} y={y - 11} width={62} height={22} rx={11} fill="var(--bloom-paper-raised)" stroke={colour} />
      <text x={width - 35} y={y + 4} textAnchor="middle" fontSize={11} fill={colour}>
        {label}
      </text>
    </g>
  );
}

export function ChartStage({
  timeframes,
  initialTimeframe,
  onTimeframeChange,
  mode = "view",
  selected = [],
  onSelect,
  zone,
  onZoneChange,
  levels = {},
  onLevelsChange,
  overlays,
  height = 300,
  caption = "Illustrative example",
}: ChartStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const width = useWidth(wrapRef);
  const [timeframe, setTimeframe] = useState(initialTimeframe ?? timeframes[timeframes.length - 1]?.label);

  useEffect(() => {
    if (initialTimeframe) setTimeframe(initialTimeframe);
  }, [initialTimeframe]);

  const candles = useMemo(() => timeframes.find((t) => t.label === timeframe)?.candles ?? [], [timeframes, timeframe]);
  const priceHeight = Math.round(height * 0.74);
  const volumeTop = priceHeight + 10;
  const volumeHeight = height - volumeTop;

  const { min, max } = useMemo(() => {
    const prices = candles.flatMap((c) => [c.high, c.low]);
    for (const z of overlays?.zones ?? []) prices.push(z.top, z.bottom);
    if (prices.length === 0) return { min: 0, max: 1 };
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    const margin = (high - low) * 0.06 || 1;
    return { min: low - margin, max: high + margin };
  }, [candles, overlays]);

  const scale = priceScale(min, max, priceHeight, PRICE_PAD);
  const step = (max - min) * 0.005;
  const plotWidth = Math.max(width - PAD_X * 2, 10);
  const slot = plotWidth / Math.max(candles.length, 1);
  const maxVolume = Math.max(...candles.map((c) => c.volume), 1);
  const clampPrice = (price: number) => Math.round(Math.min(max, Math.max(min, price)) * 100) / 100;
  const priceAt = (y: number) => clampPrice(scale.toPrice(y));

  // Zone handles: dragging either edge, or the middle to move it whole.
  const setZoneEdge = (edge: "top" | "bottom") => (y: number) => {
    if (!zone) return;
    onZoneChange?.({ ...zone, [edge]: priceAt(y) });
  };
  const topDrag = useDrag(svgRef, setZoneEdge("top"));
  const bottomDrag = useDrag(svgRef, setZoneEdge("bottom"));

  const placeZoneAt = (y: number) => onZoneChange?.(defaultZone(priceAt(y), min, max, priceHeight, PRICE_PAD));

  const defaultLevels = (): Levels => {
    const last = candles[candles.length - 1]?.close ?? (min + max) / 2;
    return spacedLevels(last, min, max, priceHeight, PRICE_PAD);
  };

  useEffect(() => {
    if (mode === "placeLevels" && levels.entry === undefined && candles.length > 0) onLevelsChange?.(defaultLevels());
    // Placing default lines once per chart is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, candles.length]);

  // Kept in a ref so quick taps in a row all count, even before the screen updates.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const toggleCandle = (index: number) => {
    if (mode !== "tapCandles") return;
    const current = selectedRef.current;
    const next = current.includes(index) ? current.filter((i) => i !== index) : [...current, index].sort((a, b) => a - b);
    selectedRef.current = next;
    onSelect?.(next);
  };

  const rr =
    levels.entry !== undefined && levels.stop !== undefined && levels.target !== undefined
      ? riskReward(levels.entry, levels.stop, levels.target)
      : null;

  const zoneTop = zone ? Math.max(zone.top, zone.bottom) : 0;
  const zoneBottom = zone ? Math.min(zone.top, zone.bottom) : 0;

  return (
    <div className="rounded-3xl bg-[var(--bloom-paper)] p-3 text-[var(--bloom-ink)] shadow-[var(--bloom-shadow)]">
      {timeframes.length > 1 && (
        <div className="mb-3 grid grid-flow-col gap-1 rounded-full bg-secondary p-1" role="tablist" aria-label="Timeframe">
          {timeframes.map(({ label }) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={timeframe === label}
              onClick={() => {
                setTimeframe(label);
                onTimeframeChange?.(label);
              }}
              className={cn(
                "h-9 rounded-full text-sm font-medium transition-colors",
                timeframe === label ? "bg-[var(--bloom-gold)] text-[var(--bloom-ink)]" : "text-[var(--bloom-muted)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div ref={wrapRef} className="w-full" style={{ touchAction: mode === "view" || mode === "tapCandles" ? "pan-y" : "none" }}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-label={`${timeframe ?? ""} price chart with volume`}
          onPointerDown={(event) => {
            if (mode === "markZone" && !zone && svgRef.current) placeZoneAt(event.clientY - svgRef.current.getBoundingClientRect().top);
          }}
          style={{ maxWidth: "100%", touchAction: mode === "markZone" || mode === "placeLevels" ? "none" : undefined }}
        >
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={0} x2={width} y1={priceHeight * f} y2={priceHeight * f} stroke="var(--bloom-rule)" strokeWidth={0.5} />
          ))}
          <line x1={0} x2={width} y1={priceHeight + 4} y2={priceHeight + 4} stroke="var(--bloom-rule)" />

          {overlays?.zones?.map((z, i) => (
            <g key={`overlay-${i}`}>
              <rect x={0} width={width} y={scale.toY(Math.max(z.top, z.bottom))} height={Math.abs(scale.toY(z.bottom) - scale.toY(z.top))} fill="var(--bloom-gold)" fillOpacity={0.14} />
              {z.label && (
                <text x={6} y={scale.toY(Math.max(z.top, z.bottom)) + 13} fontSize={11} fill="var(--bloom-gold)">
                  {z.label}
                </text>
              )}
            </g>
          ))}
          {overlays?.bands?.map((band, i) => {
            const x = PAD_X + slot * band.fromIndex;
            const bandWidth = slot * (band.toIndex - band.fromIndex + 1);
            return (
              <g key={`band-${i}`}>
                <rect x={x} y={0} width={bandWidth} height={priceHeight} fill="var(--bloom-gold)" fillOpacity={0.08} />
                <line x1={x} x2={x} y1={0} y2={priceHeight} stroke="var(--bloom-gold)" strokeDasharray="3 3" strokeOpacity={0.6} />
                <line x1={x + bandWidth} x2={x + bandWidth} y1={0} y2={priceHeight} stroke="var(--bloom-gold)" strokeDasharray="3 3" strokeOpacity={0.6} />
                <text x={x + 4} y={12} fontSize={11} fill="var(--bloom-gold)">
                  {band.label}
                </text>
              </g>
            );
          })}
          {overlays?.lines?.map((line, i) => (
            <g key={`line-${i}`}>
              <line x1={0} x2={width} y1={scale.toY(line.price)} y2={scale.toY(line.price)} stroke="var(--bloom-gold)" strokeDasharray="2 4" />
              <text x={6} y={scale.toY(line.price) - 4} fontSize={11} fill="var(--bloom-gold)">
                {line.label}
              </text>
            </g>
          ))}

          {candles.map((candle, index) => {
            const x = PAD_X + slot * index + slot / 2;
            const rising = candle.close >= candle.open;
            const colour = rising ? "var(--bloom-sage)" : "var(--bloom-blush)";
            const top = scale.toY(Math.max(candle.open, candle.close));
            const bodyHeight = Math.max(1.5, Math.abs(scale.toY(candle.open) - scale.toY(candle.close)));
            const isSelected = selected.includes(index);
            const volumeBar = (candle.volume / maxVolume) * (volumeHeight - 4);
            const interactive = mode === "tapCandles";
            return (
              <g
                key={`${candle.time}-${index}`}
                onClick={() => toggleCandle(index)}
                onKeyDown={(event) => {
                  if (interactive && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    toggleCandle(index);
                  }
                }}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-pressed={interactive ? isSelected : undefined}
                aria-label={interactive ? `Candle ${index + 1}, ${rising ? "up" : "down"}` : undefined}
                className={interactive ? "cursor-pointer outline-none" : undefined}
              >
                {interactive && <rect x={x - slot / 2} y={0} width={slot} height={height} fill="transparent" />}
                {isSelected && <rect x={x - slot / 2 + 0.5} y={2} width={slot - 1} height={priceHeight - 4} rx={4} fill="none" stroke="var(--bloom-gold)" strokeWidth={1.5} />}
                <line x1={x} x2={x} y1={scale.toY(candle.high)} y2={scale.toY(candle.low)} stroke={colour} strokeWidth={1} />
                <rect x={x - slot * 0.3} y={top} width={Math.max(slot * 0.6, 1)} height={bodyHeight} fill={colour} />
                <rect x={x - slot * 0.3} y={height - volumeBar} width={Math.max(slot * 0.6, 1)} height={volumeBar} fill={colour} fillOpacity={0.35} />
              </g>
            );
          })}

          {mode === "markZone" && zone && (
            <g>
              <rect x={0} width={width} y={scale.toY(zoneTop)} height={Math.max(scale.toY(zoneBottom) - scale.toY(zoneTop), 1)} fill="var(--bloom-gold)" fillOpacity={0.18} stroke="var(--bloom-gold)" />
              {(["top", "bottom"] as const).map((edge) => {
                const price = edge === "top" ? zone.top : zone.bottom;
                const y = scale.toY(price);
                const drag = edge === "top" ? topDrag : bottomDrag;
                const hit = handleHitRects(scale.toY(zone.top), scale.toY(zone.bottom), HIT)[scale.toY(price) <= scale.toY(edge === "top" ? zone.bottom : zone.top) ? "top" : "bottom"];
                return (
                  <g
                    key={edge}
                    role="slider"
                    tabIndex={0}
                    aria-label={`${edge === "top" ? "Top" : "Bottom"} of your zone. Use the up and down arrow keys to move it.`}
                    className="cursor-ns-resize outline-none"
                    onKeyDown={(event) => {
                      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                        event.preventDefault();
                        onZoneChange?.({ ...zone, [edge]: nudge(price, event.key, step, min, max) });
                      }
                    }}
                    {...drag}
                  >
                    <rect x={0} y={hit.y} width={width} height={hit.height} fill="transparent" />
                    <circle cx={width / 2} cy={y} r={9} fill="var(--bloom-gold)" stroke="var(--bloom-ink)" strokeWidth={2} />
                  </g>
                );
              })}
            </g>
          )}

          {mode === "placeLevels" &&
            (Object.keys(LEVEL_STYLE) as (keyof Levels)[]).map((key) =>
              levels[key] === undefined ? null : (
                <DragLine
                  key={key}
                  svgRef={svgRef}
                  y={scale.toY(levels[key] as number)}
                  width={width}
                  label={LEVEL_STYLE[key].label}
                  colour={LEVEL_STYLE[key].colour}
                  onMoveTo={(y) => onLevelsChange?.({ ...levels, [key]: priceAt(y) })}
                  onKey={(k) => onLevelsChange?.({ ...levels, [key]: nudge(levels[key] as number, k, step, min, max) })}
                />
              ),
            )}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[var(--bloom-muted)]">
        <span>{caption}</span>
        {mode === "placeLevels" && rr !== null && (
          <span className="font-medium text-[var(--bloom-gold)]" aria-live="polite">
            Reward to risk 1 : {rr.toFixed(1)}
          </span>
        )}
        {mode === "markZone" && !zone && (
          <button
            type="button"
            onClick={() => placeZoneAt(priceHeight / 2)}
            className="rounded-full border border-[var(--bloom-gold)] px-3 py-1.5 font-medium text-[var(--bloom-gold)]"
          >
            Tap the chart, or place a zone here
          </button>
        )}
      </div>
    </div>
  );
}
