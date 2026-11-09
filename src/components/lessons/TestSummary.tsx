import { BloomMark } from "@/components/brand/BloomMark";
import { summaryLine } from "@/lib/lessons/screens";

/** The end of the test stage: a kind score, never a fail. */
export function TestSummary({ score, total }: { score: number; total: number }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center text-center" role="status">
      <BloomMark size={44} />
      <p className="mt-5 text-sm font-medium uppercase tracking-wide text-muted-foreground">Your test</p>
      <h2 className="mt-1 text-4xl text-foreground">
        {score} of {total} on the first try
      </h2>
      <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">{summaryLine(score, total)}</p>
    </div>
  );
}
