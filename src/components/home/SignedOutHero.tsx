import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, LineChart, MessageCircleHeart, Trophy, Wallet } from "lucide-react";
import { BloomMark } from "@/components/brand/BloomMark";
import { RiskNote } from "@/components/RiskNote";
import { sampleAllocation, SAMPLE_PLAN } from "@/data/budget/sample";
import { formatMoney } from "@/lib/budget/money";
import { HeroPreview } from "./HeroPreview";

const PROMISES = [
  { icon: BookOpen, title: "Interactive lessons", body: "Mark zones, tap candles and drag your entry, stop and target, from fair value gaps to order blocks." },
  { icon: LineChart, title: "Practise on real stocks", body: "Use the same chart tools on SPY, Apple and more, with simulated money and a process score for every trade." },
  { icon: Trophy, title: "A community of progress", body: "Learning and practice leaderboards that celebrate steady skill, not lucky wins." },
  { icon: Wallet, title: "Budget & savings with Pansy", body: "Pay yourself first, see the maths clearly, and log your daily spending in seconds." },
  { icon: MessageCircleHeart, title: "Pansy, your companion", body: "Ask about any concept, in your own words, whenever you need it." },
];

const PATH = ["Lesson: what it is", "Strategy: how to trade it", "Test: your turn", "Practice: try it with pretend money"];

function SavingsPreview() {
  const split = sampleAllocation();
  const money = (cents: number) => formatMoney(cents, SAMPLE_PLAN.currency, "en-US");
  const parts = [
    { label: "Savings first", value: split.save, colour: "var(--bloom-sage)" },
    { label: "Bills", value: split.bills, colour: "var(--bloom-muted)" },
    { label: "Left to spend", value: split.spend, colour: "var(--bloom-blush)" },
  ];
  return (
    <div className="mx-auto mt-6 max-w-md rounded-3xl bg-card p-6 text-left shadow-[var(--bloom-shadow)]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Example</p>
      <p className="mt-2 text-base text-foreground">Pay of {money(split.pay)}, saving 10% first:</p>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full" aria-hidden="true">
        {parts.map((part) => (
          <span key={part.label} style={{ width: `${(part.value / split.pay) * 100}%`, background: part.colour }} />
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        {parts.map((part) => (
          <div key={part.label}>
            <dt className="text-muted-foreground">{part.label}</dt>
            <dd className="font-medium text-foreground">{money(part.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

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
          <p className="bloom-rise mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground" style={{ animationDelay: "80ms" }}>
            Stock analysis for women
          </p>
          <h1 className="bloom-rise-soft mt-4 text-5xl leading-[1.05] text-foreground md:text-7xl" style={{ animationDelay: "140ms" }}>
            Learn to read stocks with skill. Free.
          </h1>
          <p className="bloom-rise mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground" style={{ animationDelay: "300ms" }}>
            Structure, liquidity and fair value gaps, taught precisely and practised safely, and grow your savings with Pansy along the way. Build a real skill instead of following tips.
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
          <SavingsPreview />
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
          <h2 className="text-center text-4xl text-foreground">Every lesson, four calm stages</h2>
          <ol className="mt-8">
            {PATH.map((step, index) => (
              <li key={step} className="flex items-baseline gap-5 border-b border-[var(--bloom-rule)] py-4 last:border-b-0">
                <span className="font-serif text-2xl text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
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
