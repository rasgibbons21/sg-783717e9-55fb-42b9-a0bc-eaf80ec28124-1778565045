import Link from "next/link";
import { BloomMark } from "@/components/brand/BloomMark";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getInstrument } from "@/config/instruments";
import { IDEAS, IDEAS_FOOTER, IDEAS_LEAD, STUDY_LABEL } from "@/data/budget/ideas";
import { getLesson } from "@/data/lessons-stocks";

/** Places to start studying once savings reach a milestone. Education only: the same for everyone, and never tied to her balance. */
export function IdeasPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[90vh] max-w-xl overflow-y-auto rounded-t-3xl bg-[var(--bloom-paper)]">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <BloomMark size={36} />
            <SheetTitle className="font-serif text-2xl font-normal">Ideas to study</SheetTitle>
          </div>
          <SheetDescription className="text-base leading-relaxed text-foreground">{IDEAS_LEAD}</SheetDescription>
        </SheetHeader>
        <div className="mt-5 space-y-4">
          {IDEAS.map((idea) => {
            const lesson = getLesson(idea.lessonSlug);
            return (
              <article key={idea.title} className="rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)]">
                <h3 className="text-xl text-foreground">{idea.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-foreground">{idea.explainer}</p>
                {lesson && (
                  <Link href={`/lessons/${lesson.slug}`} className="mt-2 inline-block text-sm font-medium text-foreground underline underline-offset-4">
                    Lesson: {lesson.title}
                  </Link>
                )}
                <ul className="mt-4 space-y-2">
                  {idea.examples.map((ticker) => (
                    <li key={ticker} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--bloom-paper-raised)] px-4 py-3">
                      <span>
                        <span className="block font-medium text-foreground">{ticker}</span>
                        <span className="block text-xs text-muted-foreground">{getInstrument(ticker)?.plainName ?? ""}</span>
                        <span className="mt-0.5 block text-xs font-medium text-[var(--bloom-sage-text)]">{STUDY_LABEL}</span>
                      </span>
                      <Link
                        href={`/practice?symbol=${encodeURIComponent(ticker)}`}
                        className="inline-flex min-h-[44px] shrink-0 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground"
                      >
                        Practise it
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{IDEAS_FOOTER}</p>
      </SheetContent>
    </Sheet>
  );
}
