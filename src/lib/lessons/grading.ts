import type { Levels } from "@/components/charts/ChartStage";
import type { Zone } from "@/lib/charts/types";

export function gradeFind(selected: number[], answer: number[]): boolean {
  const picked = new Set(selected);
  return picked.size === answer.length && answer.every((index) => picked.has(index));
}

const normalise = (zone: Zone): Zone => ({ top: Math.max(zone.top, zone.bottom), bottom: Math.min(zone.top, zone.bottom) });

/** A drawn zone counts when most of it lines up with the true zone (overlap divided by the combined span). */
export function gradeZone(drawn: Zone, answer: Zone, minOverlap = 0.6): boolean {
  const a = normalise(drawn);
  const b = normalise(answer);
  const overlap = Math.max(0, Math.min(a.top, b.top) - Math.max(a.bottom, b.bottom));
  const union = Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom);
  return union > 0 && overlap / union >= minOverlap;
}

export interface PlanRules {
  direction: "long" | "short";
  entryZone: Zone;
  invalidation: number;
  minRR: number;
}

export const PLAN_REASONS = {
  missing: "Place your entry, stop and target first.",
  entry: "Your entry should sit inside the zone.",
  stop: "Your stop should sit beyond the point where the idea is wrong.",
  reward: "Aim for a reward at least 1.5 times your risk.",
} as const;

export function gradePlan(levels: Levels, rules: PlanRules): { ok: boolean; reasons: string[] } {
  const { entry, stop, target } = levels;
  if (entry === undefined || stop === undefined || target === undefined) return { ok: false, reasons: [PLAN_REASONS.missing] };

  const zone = normalise(rules.entryZone);
  const long = rules.direction === "long";
  const reasons: string[] = [];

  if (entry < zone.bottom || entry > zone.top) reasons.push(PLAN_REASONS.entry);
  if (long ? stop >= rules.invalidation : stop <= rules.invalidation) reasons.push(PLAN_REASONS.stop);

  const risk = long ? entry - stop : stop - entry;
  const reward = long ? target - entry : entry - target;
  if (risk <= 0 || reward <= 0 || reward / risk < rules.minRR) {
    reasons.push(rules.minRR === 1.5 ? PLAN_REASONS.reward : `Aim for a reward at least ${rules.minRR} times your risk.`);
  }

  return { ok: reasons.length === 0, reasons };
}
