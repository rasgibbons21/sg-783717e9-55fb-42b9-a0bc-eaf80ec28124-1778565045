import Link from "next/link";
import { BloomMark } from "@/components/brand/BloomMark";
import type { LessonBlock } from "@/data/lessons-stocks/types";
import { practiceHref } from "@/lib/lessons/screens";

type Data = Extract<LessonBlock, { type: "practiceCta" }>;

/** Hands her to Practice with this setup and timeframe already picked. */
export function PracticeCtaBlock({ block }: { block: Data }) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <BloomMark size={44} />
      <h2 className="mt-4 text-2xl leading-snug text-foreground">Practise this on a stock</h2>
      <p className="mt-2 max-w-sm text-base leading-relaxed text-muted-foreground">{block.body}</p>
      <Link
        href={practiceHref(block.setup, block.timeframe)}
        className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground"
      >
        Practise this on a stock
      </Link>
      <p className="mt-3 text-sm text-muted-foreground">Or finish the lesson first and practise later.</p>
    </div>
  );
}
