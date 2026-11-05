import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Flower2, MessageCircleHeart, Sprout } from "lucide-react";
import { BloomMark } from "@/components/brand/BloomMark";
import { Botanical } from "@/components/brand/Botanical";
import { RiskNote } from "@/components/RiskNote";

const PROMISES = [
  { icon: BookOpen, title: "Interactive lessons", body: "Short, friendly steps you tap, drag and try, starting from what gold trading even is." },
  { icon: Sprout, title: "Safe practice", body: "Try what you've learned with simulated money, so a mistake costs you nothing." },
  { icon: Flower2, title: "A kind community", body: "Grow your garden and share your progress on our learning and practice leaderboards." },
  { icon: MessageCircleHeart, title: "Pansy, your companion", body: "Ask anything, in your own words, as many times as you like. No question is too small." },
];

const PATH = [
  "Join free, with no card",
  "Finish your first gold lesson",
  "Practise safely with simulated money",
  "Try a free broker demo when you're ready",
];

export function SignedOutHero() {
  return (
    <>
      <section className="relative overflow-hidden bg-secondary px-4 pb-14 pt-12">
        <Botanical variant="corner" className="pointer-events-none absolute -right-10 -top-6 h-64 w-52 opacity-80" />
        <Botanical variant="corner" className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-52 rotate-180 opacity-40" />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mx-auto w-fit">
            <BloomMark size={64} />
          </div>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] text-foreground md:text-6xl">Learn gold &amp; markets from zero. Free.</h1>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
            A calm place for women to learn gold trading and other markets, one small step at a time, with Pansy beside you.
          </p>
          <motion.div whileTap={{ scale: 0.97 }} className="mt-7 inline-block">
            <Link href="/onboarding" className="inline-flex h-14 items-center rounded-full bg-primary px-9 text-lg font-semibold text-primary-foreground">
              Start free
            </Link>
          </motion.div>
          <p className="mt-3 text-sm text-muted-foreground">No card. No upgrades. Everything is free.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Already with us?{" "}
            <Link href="/onboarding?mode=login" className="underline underline-offset-2">Sign in</Link>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="text-center text-3xl font-semibold text-foreground">Made for complete beginners</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary px-4 py-12">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-3xl font-semibold text-foreground">Your path, at your pace</h2>
          <ol className="mt-6 space-y-3">
            {PATH.map((step, index) => (
              <li key={step} className="flex items-center gap-4 rounded-2xl bg-card p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-serif font-semibold text-foreground">{index + 1}</span>
                <span className="text-base font-medium text-foreground">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-7 text-center">
            <Link href="/onboarding" className="inline-flex h-12 items-center rounded-full bg-primary px-7 font-semibold text-primary-foreground transition-transform active:scale-95">
              Start my first lesson
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-xl px-4 pt-8">
        <RiskNote />
      </div>
    </>
  );
}
