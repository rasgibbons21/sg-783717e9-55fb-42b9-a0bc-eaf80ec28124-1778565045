import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, LineChart, MessageCircleHeart, Trophy } from "lucide-react";
import { BloomMark } from "@/components/brand/BloomMark";
import { RiskNote } from "@/components/RiskNote";
import { HeroPreview } from "./HeroPreview";

const PROMISES = [
  { icon: BookOpen, title: "Interactive lessons", body: "Mark zones, tap candles and drag your entry, stop and target, from fair value gaps to order blocks." },
  { icon: LineChart, title: "Practise on real stocks", body: "Use the same chart tools on SPY, Apple and more, with simulated money and a process score for every trade." },
  { icon: Trophy, title: "A community of progress", body: "Learning and practice leaderboards that celebrate steady skill, not lucky wins." },
  { icon: MessageCircleHeart, title: "Pansy, your companion", body: "Ask about any concept, in your own words, whenever you need it." },
];

const PATH = ["Read the chart", "Mark the zone", "Confirm with volume", "Line up the timeframes", "Plan the trade", "Practise it"];

export function SignedOutHero() {
  return (
    <>
      <section className="relative overflow-hidden px-4 pb-16 pt-14 md:pt-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(55% 40% at 50% 0%, rgba(196,165,116,0.16), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="bloom-rise mx-auto w-fit">
            <BloomMark size={52} />
          </div>
          <p className="bloom-rise mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--bloom-gold)]" style={{ animationDelay: "80ms" }}>
            Stock analysis for women
          </p>
          <h1 className="bloom-rise-soft mt-4 text-5xl leading-[1.05] text-foreground md:text-7xl" style={{ animationDelay: "140ms" }}>
            Learn to read stocks with skill. Free.
          </h1>
          <p className="bloom-rise mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: "300ms" }}>
            Structure, liquidity and fair value gaps, taught precisely and practised safely. Build a real skill instead of following tips.
          </p>
          <div className="bloom-rise mt-8" style={{ animationDelay: "450ms" }}>
            <motion.span whileTap={{ scale: 0.97 }} whileHover={{ y: -1 }} className="inline-block">
              <Link href="/onboarding" className="group inline-flex h-14 items-center gap-2 rounded-full bg-primary px-9 text-lg font-semibold text-primary-foreground">
                Start free
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </motion.span>
            <p className="mt-3 text-sm text-muted-foreground">No card. Nothing to pay.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Already with us?{" "}
              <Link href="/onboarding?mode=login" className="underline underline-offset-2">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="bloom-rise relative" style={{ animationDelay: "650ms" }}>
          <HeroPreview />
        </div>
      </section>

      <section className="border-y border-[var(--bloom-rule)] px-4 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-4xl text-foreground">A precise way to learn</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-3xl border border-[var(--bloom-rule)] bg-card p-6">
                <Icon className="h-5 w-5 text-[var(--bloom-gold)]" />
                <h3 className="mt-4 text-2xl text-foreground">{title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-4xl text-foreground">Every setup, the same six steps</h2>
          <ol className="mt-8">
            {PATH.map((step, index) => (
              <li key={step} className="flex items-baseline gap-5 border-b border-[var(--bloom-rule)] py-4 last:border-b-0">
                <span className="font-serif text-2xl text-[var(--bloom-gold)]">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-lg text-foreground">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <Link href="/onboarding" className="inline-flex h-12 items-center rounded-full bg-primary px-7 font-semibold text-primary-foreground transition-transform active:scale-95">
              Start my first lesson
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-xl px-4 pt-4">
        <RiskNote />
      </div>
    </>
  );
}
