import { BloomMark } from "@/components/brand/BloomMark";
import type { Stage } from "@/data/lessons-stocks/types";
import { STAGE_INTRO } from "@/lib/lessons/engine";

const STAGE_LINE: Record<Stage, string> = {
  lesson: "Take your time with this part.",
  strategy: "Here's how a careful trader would use what you just learned, step by step.",
  test: "Now it's your turn. Wrong answers are fine: you can always try again.",
  practice: "Try it on a real stock chart, with pretend money.",
};

/** A calm title card between stages. */
export function StageIntro({ stage }: { stage: Stage }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
      <BloomMark size={44} />
      <h2 className="mt-5 text-3xl leading-tight text-foreground">{STAGE_INTRO[stage]}</h2>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">{STAGE_LINE[stage]}</p>
    </div>
  );
}
