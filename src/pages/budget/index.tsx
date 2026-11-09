import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Loader2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { BloomMark } from "@/components/brand/BloomMark";
import { AddSpendingSheet } from "@/components/budget/AddSpendingSheet";
import { EntryList } from "@/components/budget/EntryList";
import { IdeasPanel } from "@/components/budget/IdeasPanel";
import { Milestones } from "@/components/budget/Milestones";
import { NudgeCard, dismissPayday, readPaydayDismissed } from "@/components/budget/NudgeCard";
import { PeriodCard } from "@/components/budget/PeriodCard";
import { Projections } from "@/components/budget/Projections";
import { SavingsCard } from "@/components/budget/SavingsCard";
import { useBudget } from "@/components/budget/useBudget";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { sampleAllocation, SAMPLE_PLAN } from "@/data/budget/sample";
import { allocate, ladderCents, nextMilestone, periodBounds, periodSpending, streak, todayIn } from "@/lib/budget/maths";
import { formatMoney } from "@/lib/budget/money";
import { pickNudge } from "@/lib/budget/nudges";
import { NOTHING_TODAY, type Entry, type EntryKind } from "@/lib/budget/types";

const daysBetween = (from: string, to: string) => Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86_400_000);

function SignedOutPreview() {
  const split = sampleAllocation();
  const money = (cents: number) => formatMoney(cents, SAMPLE_PLAN.currency, "en-US");
  return (
    <div className="mx-auto max-w-xl px-4 pb-10 pt-8">
      <div className="flex items-center gap-3">
        <BloomMark size={40} />
        <p className="font-serif text-lg text-muted-foreground">Pansy</p>
      </div>
      <h1 className="mt-4 text-4xl leading-tight text-foreground">Grow your savings, calmly.</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
        Tell Pansy what you earn. She takes savings first, shows you the maths, and helps you stay on track, one day at a time.
      </p>
      <section className="mt-6 rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Example</p>
        <p className="mt-2 text-base text-foreground">Pay of {money(split.pay)} a month, saving 10%, with {money(split.bills)} rent:</p>
        <dl className="mt-4 space-y-2 text-base">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">1. Savings first</dt>
            <dd className="font-medium text-[var(--bloom-sage-text)]">{money(split.save)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">2. Bills</dt>
            <dd className="font-medium text-foreground">{money(split.bills)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <dt className="text-foreground">3. Left to spend</dt>
            <dd className="font-semibold text-foreground">{money(split.spend)}</dd>
          </div>
        </dl>
      </section>
      <Link
        href={`/onboarding?returnTo=${encodeURIComponent("/budget/setup")}`}
        className="mt-6 flex h-12 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground"
      >
        Start free with Pansy
      </Link>
    </div>
  );
}

function BudgetHome() {
  const router = useRouter();
  const budget = useBudget();
  const { plan, entries, balance, milestones } = budget;
  const [sheet, setSheet] = useState<{ open: boolean; kind: EntryKind; editing: Entry | null; defaultAmount?: number }>({ open: false, kind: "expense", editing: null });
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const preview = process.env.NODE_ENV === "development" && router.query.pro === "1" ? "?pro=1" : "";

  useEffect(() => setDismissedFor(readPaydayDismissed()), []);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!budget.loading && !budget.error && !plan) router.replace(`/budget/setup${preview}`);
  }, [budget.loading, budget.error, plan, router, preview]);

  const view = useMemo(() => {
    if (!plan) return null;
    const today = todayIn(plan.timeZone, now);
    const bounds = periodBounds(plan.nextPayday, plan.payFrequency, today);
    const reached = milestones.map((m) => m.amountCents);
    const next = nextMilestone(balance, reached, plan.goalCents);
    const ladder = ladderCents(plan.goalCents);
    const previous = next ? [...ladder].reverse().find((amount) => amount < next) ?? 0 : 0;
    return {
      today,
      bounds,
      split: allocate(plan),
      spent: periodSpending(entries, bounds, today),
      todayTotal: entries.filter((e) => e.kind === "expense" && e.occurredOn === today).reduce((sum, e) => sum + e.amountCents, 0),
      streakDays: streak(entries, today),
      reached,
      next,
      previous,
      nudge: pickNudge({ plan, entries, unseenMilestones: milestones.filter((m) => !m.seen).map((m) => m.amountCents), now, paydayDismissedFor: dismissedFor }),
    };
  }, [plan, entries, balance, milestones, now, dismissedFor]);

  if (budget.error && !plan) {
    return (
      <div className="mx-auto max-w-xl px-4 pt-10 text-center">
        <p className="text-lg text-foreground">{budget.error}</p>
        <button type="button" onClick={budget.reload} className="mt-4 h-12 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground">
          Try again
        </button>
      </div>
    );
  }
  if (!plan || !view) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  const money = (cents: number) => formatMoney(cents, plan.currency);
  const openSheet = (kind: EntryKind, editing: Entry | null = null, defaultAmount?: number) => setSheet({ open: true, kind, editing, defaultAmount });
  const openIdeas = () => {
    setIdeasOpen(true);
    const unseen = milestones.filter((m) => !m.seen).map((m) => m.amountCents);
    if (unseen.length > 0) budget.markSeen(unseen);
  };

  return (
    <div className="mx-auto max-w-xl space-y-5 px-4 pb-10 pt-6">
      <header>
        <p className="font-serif text-lg text-muted-foreground">Budget &amp; savings</p>
        <h1 className="text-4xl leading-tight text-foreground">Pay yourself first</h1>
      </header>

      {budget.error && <p className="text-sm text-[var(--bloom-blush-text)]" role="alert">{budget.error}</p>}

      <SavingsCard
        balance={balance}
        currency={plan.currency}
        next={view.next}
        previous={view.previous}
        streakDays={view.streakDays}
        onAddSaving={() => openSheet("saving", null, view.split.save)}
        onWithdraw={() => openSheet("withdrawal")}
      />

      {view.nudge && (
        <NudgeCard
          nudge={view.nudge}
          currency={plan.currency}
          onSavedPlanned={() => budget.add({ kind: "saving", amountCents: view.split.save, category: "saving", note: null, occurredOn: view.today }).catch(() => openSheet("saving", null, view.split.save))}
          onSaveDifferent={() => openSheet("saving", null, view.split.save)}
          onNotThisTime={() => {
            dismissPayday(view.bounds.start);
            setDismissedFor(view.bounds.start);
          }}
          onAddSpending={() => openSheet("expense")}
          onNothingToday={() => budget.add({ kind: "expense", amountCents: 0, category: NOTHING_TODAY, note: null, occurredOn: view.today }).catch(() => undefined)}
          onOpenIdeas={openIdeas}
        />
      )}

      <PeriodCard
        split={view.split}
        spent={view.spent}
        daysLeft={daysBetween(view.today, view.bounds.end)}
        currency={plan.currency}
        onEdit={() => router.push(`/budget/setup${preview}`)}
      />

      <section className="bloom-rise rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]" aria-label="Today">
        <h2 className="text-2xl text-foreground">Today</h2>
        <p className="mt-1 text-base text-muted-foreground">Spent so far: {money(view.todayTotal)}</p>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => openSheet("expense")}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground"
        >
          <Plus className="h-5 w-5" /> Add spending
        </motion.button>
      </section>

      <EntryList entries={entries} currency={plan.currency} onEdit={(entry) => openSheet(entry.kind, entry)} onDelete={(entry) => budget.remove(entry.id).catch(() => undefined)} />

      <Projections
        savePerPayday={view.split.save}
        payFrequency={plan.payFrequency}
        currency={plan.currency}
        interestPct={plan.interestPct}
        onInterestChange={(pct) => budget.savePlan({ ...plan, interestPct: pct }).catch(() => undefined)}
      />

      <Milestones reached={view.reached} balance={balance} goalCents={plan.goalCents} currency={plan.currency} onOpenIdeas={openIdeas} />

      <AddSpendingSheet
        open={sheet.open}
        onOpenChange={(open) => setSheet((s) => ({ ...s, open }))}
        kind={sheet.kind}
        timeZone={plan.timeZone}
        editing={sheet.editing}
        defaultAmount={sheet.defaultAmount}
        onSubmit={(entry) => (sheet.editing ? budget.update(sheet.editing.id, entry) : budget.add(entry))}
        onDelete={budget.remove}
      />
      <IdeasPanel open={ideasOpen} onOpenChange={setIdeasOpen} />

      <p className="px-2 text-center text-xs leading-relaxed text-muted-foreground">
        Budgeting tools are for education. Estimates are not guarantees.
      </p>
    </div>
  );
}

export default function BudgetPage() {
  const { isLoggedIn, isLoading } = useSubscription();
  return (
    <>
      <SEO title="Budget & savings - Bloom" description="Pay yourself first with Pansy: a calm savings plan, daily spending and the maths shown." />
      <Layout>
        {isLoading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading" />
          </div>
        ) : isLoggedIn ? (
          <BudgetHome />
        ) : (
          <SignedOutPreview />
        )}
      </Layout>
    </>
  );
}
