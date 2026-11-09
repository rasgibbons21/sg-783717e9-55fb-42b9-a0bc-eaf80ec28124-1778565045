import type { Stage } from "@/data/lessons-stocks/types";
import { STAGE_LABEL } from "@/lib/lessons/engine";
import { cn } from "@/lib/utils";

/** The lesson's stages as labelled segments. Finished stages are gold, and the current one fills as she goes. */
export function StageBar({ stages, current, progress }: { stages: Stage[]; current: Stage; progress: number }) {
  const currentIndex = stages.indexOf(current);
  return (
    <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }} aria-label="Lesson stages">
      {stages.map((stage, index) => {
        const fill = index < currentIndex ? 1 : index === currentIndex ? Math.max(0.08, Math.min(1, progress)) : 0;
        return (
          <li key={stage} aria-current={stage === current ? "step" : undefined}>
            <span className="block h-1.5 overflow-hidden rounded-full bg-secondary">
              <span className="block h-full rounded-full bg-[var(--bloom-gold)] transition-[width] duration-500" style={{ width: `${fill * 100}%` }} />
            </span>
            <span className={cn("mt-1.5 block text-xs", stage === current ? "font-semibold text-foreground" : "text-muted-foreground")}>
              {STAGE_LABEL[stage]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
