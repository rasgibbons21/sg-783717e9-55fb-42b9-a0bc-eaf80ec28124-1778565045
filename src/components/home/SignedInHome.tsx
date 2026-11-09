import { useEffect, useState } from "react";
import { ProgressLine } from "@/components/ProgressLine";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flower2 } from "lucide-react";
import { HomeBudgetCard } from "@/components/budget/HomeBudgetCard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ALL_LESSONS, firstIncomplete } from "@/data/lessons-stocks";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { supabase } from "@/integrations/supabase/client";

interface Standing {
  rank: number;
  gap: number | null;
}

function useLearningStanding(): Standing | null {
  const { userId } = useSubscription();
  const [standing, setStanding] = useState<Standing | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch("/api/gems/leaderboard", { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (!res.ok) return;
        const view = await res.json();
        if (view.me) setStanding({ rank: view.me.rank, gap: view.gap_to_next ?? null });
      } catch {
        // The leaderboard card simply stays in its welcoming state.
      }
    })();
  }, [userId]);

  return standing;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function SignedInHome() {
  const { userName } = useSubscription();
  const { completed, loading } = useLearningProgress();
  const standing = useLearningStanding();
  const nextUp = firstIncomplete(completed);
  const finishedCount = ALL_LESSONS.filter((lesson) => completed.includes(lesson.slug)).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="relative overflow-hidden rounded-3xl bg-secondary p-6">
        <p className="text-base text-muted-foreground">{greeting()}{userName ? `, ${userName}` : ""}</p>
        <h1 className="mt-1 max-w-[80%] text-3xl font-semibold leading-tight text-foreground">
          {finishedCount === 0 ? "Let's start with how to read a chart" : "Your skills are building"}
        </h1>
        <div className="mt-4">
          <ProgressLine done={finishedCount} total={ALL_LESSONS.length} label="Lessons finished" />
        </div>
      </div>

      {!loading &&
        (nextUp ? (
          <motion.div whileTap={{ scale: 0.98 }}>
            <Link href={`/lessons/${nextUp.slug}`} className="flex items-center justify-between gap-3 rounded-3xl bg-primary p-5 text-primary-foreground">
              <span>
                <span className="block text-sm opacity-80">{finishedCount === 0 ? "Your first lesson" : "Continue your lesson"}</span>
                <span className="mt-0.5 block font-serif text-xl font-semibold">{nextUp.title}</span>
                <span className="mt-1 block text-sm opacity-80">{nextUp.minutes} minutes</span>
              </span>
              <ArrowRight className="h-6 w-6 shrink-0" />
            </Link>
          </motion.div>
        ) : (
          <div className="rounded-3xl bg-accent/60 p-5">
            <h2 className="text-xl font-semibold text-foreground">You&apos;ve finished every lesson</h2>
            <p className="mt-1 text-base text-muted-foreground">That&apos;s a real achievement. Keep sharpening your process in Practice.</p>
          </div>
        ))}

      <HomeBudgetCard />

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/practice" className="block rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)] transition-transform active:scale-[0.98]">
          <h2 className="text-xl font-semibold text-foreground">Practise with structure</h2>
          <p className="mt-1 text-base text-muted-foreground">Plan trades on real stock charts with simulated money.</p>
        </Link>

        <Link href="/leaderboard" className="block rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)] transition-transform active:scale-[0.98]">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Flower2 className="h-5 w-5 text-primary" />
            {standing ? `You're number ${standing.rank}` : "The leaderboards"}
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            {standing?.gap
              ? `${standing.gap} more points to reach the next place.`
              : standing
                ? "See who's learning alongside you."
                : "Finish a lesson to join the learning leaderboard."}
          </p>
        </Link>

        <Link href="/ask-pansy" className="block rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)] transition-transform active:scale-[0.98]">
          <h2 className="text-xl font-semibold text-foreground">Ask Pansy</h2>
          <p className="mt-1 text-base text-muted-foreground">Any question at all, in your own words.</p>
        </Link>

        <Link href="/brokers" className="block rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)] transition-transform active:scale-[0.98]">
          <h2 className="text-xl font-semibold text-foreground">Where to practise for real</h2>
          <p className="mt-1 text-base text-muted-foreground">When you feel ready, see what brokers offer in your country.</p>
        </Link>
      </div>
    </div>
  );
}
