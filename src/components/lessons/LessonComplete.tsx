import { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import type { Lesson } from "@/data/lessons-v2/types";
import { lessonsInModule, nextLesson } from "@/data/lessons-v2";
import { Botanical } from "@/components/brand/Botanical";
import { RiskNote } from "@/components/RiskNote";
import { useBrokerNotice } from "@/hooks/useBrokerNotice";

export const BLOOMS_PER_LESSON = 5;

interface Props {
  lesson: Lesson;
  saveState: "saving" | "saved" | "failed";
  onRetrySave: () => void;
}

export function LessonComplete({ lesson, saveState, onRetrySave }: Props) {
  const notice = useBrokerNotice();
  const next = nextLesson(lesson.slug);
  const moduleLessons = lessonsInModule(lesson.moduleId);
  const finishedModule = moduleLessons[moduleLessons.length - 1]?.slug === lesson.slug;

  useEffect(() => {
    try {
      navigator?.vibrate?.([12, 40, 18]);
    } catch {
      // Vibration isn't available on every device.
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.45 },
      colors: ["#EFD9D3", "#C2A15A", "#3F4F3E", "#B98A72"],
      scalar: 0.85,
    });
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-8 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 14 }}>
        <Botanical variant="bloom" className="mx-auto h-28 w-28" />
      </motion.div>
      <h1 className="mt-2 text-3xl font-semibold text-foreground">Lovely work</h1>
      <p className="mt-2 text-base text-muted-foreground">
        You finished <strong className="text-foreground">{lesson.title}</strong>
      </p>

      {saveState === "saved" && (
        <p className="mt-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-foreground">
          A new bloom in your garden, worth {BLOOMS_PER_LESSON} points
        </p>
      )}
      {saveState === "saving" && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Saving your progress...
        </p>
      )}
      {saveState === "failed" && (
        <div className="mt-3 rounded-2xl bg-accent/70 p-4 text-sm text-foreground" role="alert">
          <p>We couldn&apos;t save your progress just now, so your bloom is waiting.</p>
          <button onClick={onRetrySave} className="mt-2 h-10 rounded-full bg-primary px-4 font-semibold text-primary-foreground">
            Try saving again
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3 text-left">
        {next && (
          <Link
            href={`/lessons/${next.slug}`}
            className="flex items-center justify-between rounded-3xl bg-primary p-5 text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <span>
              <span className="block text-sm opacity-80">Next lesson</span>
              <span className="block font-serif text-lg font-semibold">{next.title}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </Link>
        )}

        <Link href="/practice" className="block rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)] transition-transform active:scale-[0.98]">
          <span className="block font-serif text-lg font-semibold text-foreground">Practise this, safely</span>
          <span className="mt-1 block text-base text-muted-foreground">{lesson.practiceHint}</span>
        </Link>

        <Link href="/leaderboard" className="block rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)] transition-transform active:scale-[0.98]">
          <span className="block font-serif text-lg font-semibold text-foreground">See your place</span>
          <span className="mt-1 block text-base text-muted-foreground">Every lesson moves you up the learning leaderboard.</span>
        </Link>

        {notice !== "us" && (
          <Link
            href="/brokers"
            className={`block rounded-3xl p-5 transition-transform active:scale-[0.98] ${finishedModule ? "bg-accent/70" : "border border-border"}`}
          >
            <span className="block font-serif text-lg font-semibold text-foreground">
              {finishedModule ? "You've finished this module. Curious about a demo?" : "When you feel ready, try a free demo"}
            </span>
            <span className="mt-1 block text-base text-muted-foreground">
              {finishedModule
                ? "A demo account lets you try a real broker's platform with pretend money. See what's available in your country, whenever you're ready."
                : "There's no rush. See how a broker's practice account works."}
            </span>
          </Link>
        )}
      </div>

      <div className="mt-6 text-left">
        <RiskNote />
      </div>
    </div>
  );
}
