import Link from "next/link";
import { ProgressLine } from "@/components/ProgressLine";
import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { RiskNote } from "@/components/RiskNote";
import { ALL_LESSONS, MODULES, firstIncomplete, lessonsInModule } from "@/data/lessons-stocks";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { cn } from "@/lib/utils";

export default function LessonsPage() {
  const { completed } = useLearningProgress();
  const done = new Set(completed);
  const nextUp = firstIncomplete(completed);
  const finishedCount = ALL_LESSONS.filter((lesson) => done.has(lesson.slug)).length;

  return (
    <>
      <SEO title="Lessons - Bloom" description="Learn stock analysis with free, interactive chart lessons, from candles to fair value gaps." />
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="relative overflow-hidden rounded-3xl bg-secondary p-6">
            <p className="text-sm font-semibold text-muted-foreground">Your learning path</p>
            <h1 className="mt-1 max-w-[80%] text-3xl font-semibold leading-tight text-foreground">From reading a chart to planning a trade</h1>
            <p className="mt-2 text-base text-muted-foreground">
              {finishedCount} of {ALL_LESSONS.length} lessons finished. Go at your own pace.
            </p>
            <div className="mt-4">
              <ProgressLine done={finishedCount} total={ALL_LESSONS.length} label="Lessons finished" />
            </div>
          </div>

          <div className="mt-8 space-y-8">
            {MODULES.map((mod) => (
              <section key={mod.id} aria-labelledby={`module-${mod.id}`}>
                <p className="text-sm font-semibold text-muted-foreground">Module {mod.number}</p>
                <h2 id={`module-${mod.id}`} className="text-2xl font-semibold text-foreground">{mod.title}</h2>
                <p className="mt-1 text-base text-muted-foreground">{mod.subtitle}</p>
                <div className="mt-3 space-y-2">
                  {lessonsInModule(mod.id).map((lesson) => {
                    const isDone = done.has(lesson.slug);
                    const isNext = nextUp?.slug === lesson.slug;
                    return (
                      <motion.div key={lesson.slug} whileTap={{ scale: 0.98 }}>
                        <Link
                          href={`/lessons/${lesson.slug}`}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border border-border bg-card p-4",
                            isNext && "border-primary shadow-[var(--bloom-shadow)]",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                              isDone ? "bg-primary text-primary-foreground" : "bg-accent text-foreground",
                            )}
                          >
                            {isDone ? <Check className="h-5 w-5" aria-label="Finished" /> : <Clock className="h-4 w-4" aria-hidden="true" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-foreground">{lesson.title}</span>
                            <span className="block text-sm text-muted-foreground">
                              {isNext ? "Up next · " : ""}
                              {lesson.minutes} min
                            </span>
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {finishedCount === ALL_LESSONS.length && (
            <div className="mt-8 rounded-3xl bg-accent/60 p-5">
              <h2 className="text-xl font-semibold text-foreground">You&apos;ve finished every lesson</h2>
              <p className="mt-1 text-base text-muted-foreground">Keep sharpening your process in Practice, or see where to practise for real when you feel ready.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/practice" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Go to Practice</Link>
                <Link href="/brokers" className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary">Where to practise for real</Link>
              </div>
            </div>
          )}

          <div className="mt-8">
            <RiskNote />
          </div>
        </div>
      </Layout>
    </>
  );
}
