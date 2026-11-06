export type NudgeKey = "ArrowUp" | "ArrowDown";

/** Moves a dragged price by one step with the arrow keys, kept inside the visible range. */
export function nudge(value: number, key: NudgeKey, step: number, min: number, max: number): number {
  if (key !== "ArrowUp" && key !== "ArrowDown") return value;
  const next = key === "ArrowUp" ? value + step : value - step;
  return Math.min(max, Math.max(min, Math.round(next * 10000) / 10000));
}
