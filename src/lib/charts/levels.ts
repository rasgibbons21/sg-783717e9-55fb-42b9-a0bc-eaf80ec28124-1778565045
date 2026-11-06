import { priceScale } from "./scale";
import type { Zone } from "./types";

const MIN_GAP_PX = 56;
const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Starting Entry, Stop and Target lines for a buy plan, spaced far enough apart in
 * pixels that each line can be grabbed on its own, and kept inside the chart.
 */
export function defaultLevels(lastClose: number, min: number, max: number, height: number, pad: number) {
  const scale = priceScale(min, max, height, pad);
  const top = pad;
  const bottom = height - pad;
  // Entry needs room for the target two gaps above it and the stop one gap below it.
  const entryY = Math.min(Math.max(scale.toY(lastClose), top + MIN_GAP_PX * 2), bottom - MIN_GAP_PX);
  return {
    entry: round(scale.toPrice(entryY)),
    stop: round(scale.toPrice(entryY + MIN_GAP_PX)),
    target: round(scale.toPrice(entryY - MIN_GAP_PX * 2)),
  };
}

/** A starting zone around a tapped price, tall enough to grab both edges. */
export function defaultZone(centre: number, min: number, max: number, height: number, pad: number): Zone {
  const scale = priceScale(min, max, height, pad);
  const half = MIN_GAP_PX / 2;
  const centreY = Math.min(Math.max(scale.toY(centre), pad + half), height - pad - half);
  return { top: round(scale.toPrice(centreY - half)), bottom: round(scale.toPrice(centreY + half)) };
}

/**
 * Hit areas for a zone's two edges. The top edge's area reaches upwards and the bottom
 * edge's downwards, meeting halfway between them, so the two never overlap.
 */
export function handleHitRects(topY: number, bottomY: number, hit: number) {
  const upper = Math.min(topY, bottomY);
  const lower = Math.max(topY, bottomY);
  const middle = (upper + lower) / 2;
  const inward = Math.min(hit / 2, middle - upper);
  return {
    top: { y: upper - (hit - inward), height: hit },
    bottom: { y: lower - inward, height: hit },
  };
}
