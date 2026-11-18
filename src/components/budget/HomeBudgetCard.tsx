import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, Wallet } from "lucide-react";
import { savedCents, savingsDayPrompt, totalCents } from "@/lib/budget/challenges";
import { allocate, nextMilestone, periodBounds, safeToSpend, todayIn } from "@/lib/budget/maths";
import { formatMoney } from "@/lib/budget/money";
import { pickNudge } from "@/lib/budget/nudges";
import { budgetScreen } from "@/lib/budget/screens";
import { NOTHING_TODAY } from "@/lib/budget/types";
import { NudgeCard, dismissPayday, readPaydayDismissed } from "./NudgeCard";
import { SavingsDayCard, dismissSavingsDay, readSavingsDayDismissed } from "./SavingsDayCard";
import { SummaryCards } from "./SummaryCards";
import { useBudget } from "./useBudget";

/** On Home: the same single budget card as the Budget page, or an invitation to set up a plan. */
export function HomeBudgetCard() {
  const router = useRouter();
  const budget = useBudget();
  const { plan, entries, balance, milestones } = budget;
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const [savingsDayDismissed, setSavingsDayDismissed] = useState<string | null>(null);
  const budgetHref = process.env.NODE_ENV === "development" && router.query.pro === "1" ? "/budget?pro=1" : "/budget";

  useEffect(() => {
    setDismissedFor(readPaydayDismissed());
    setSavingsDayDismissed(readSavingsDayDismissed());
  }, []);

  const view = useMemo(() => {
    if (!plan) return null;
    const now = new Date();
    const today = todayIn(plan.timeZone, now);
    const bounds = periodBounds(plan.nextPayday, plan.payFrequency, today);
    const split = allocate(plan);
    const safe = safeToSpend(split, entries, bounds, today);
    const daysLeft = Math.max(1, Math.round((new Date(`${bounds.end}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000));
    const activeSheet = budget.challenges.find((c) => c.active) ?? null;
    return {
      today,
      start: bounds.start,
      save: split.save,
      safe,
      perDay: Math.floor(safe / daysLeft),
      activeSheet,
      savingsPrompt: savingsDayPrompt({ plan, sheet: activeSheet, entries, today, dismissedFor: savingsDayDismissed }),
      next: nextMilestone(balance, milestones.map((m) => m.amountCents), plan.goalCents),
      nudge: pickNudge({ plan, entries, unseenMilestones: milestones.filter((m) => !m.seen).map((m) => m.amountCents), now, paydayDismissedFor: dismissedFor }),
    };
  }, [plan, entries, balance, milestones, dismissedFor, savingsDayDismissed, budget.challenges]);

  const screen = budgetScreen(budget);
  // While loading, or if her plan couldn't load, show nothing rather than wrongly inviting her to set one up.
  if (screen === "loading" || screen === "error") return null;

  if (!plan || !view) {
    return (
      <Link
        href={budgetHref.replace("/budget", "/budget/setup")}
        className="flex items-center justify-between gap-3 rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)] transition-transform active:scale-[0.98]"
      >
        <span>
          <span className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Wallet className="h-5 w-5 text-[var(--bloom-sage-text)]" />
            Set up your savings plan with Pansy
          </span>
          <span className="mt-1 block text-base text-muted-foreground">Pay yourself first, with the maths shown. It takes two minutes.</span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </Link>
    );
  }

  const money = (cents: number) => formatMoney(cents, plan.currency);
  const unseen = milestones.filter((m) => !m.seen).map((m) => m.amountCents);

  return (
    <div className="space-y-3">
      <SummaryCards
        currency={plan.currency}
        savings={balance}
        invested={budget.invested}
        safe={view.safe}
        perDay={view.perDay}
        challenge={view.activeSheet ? { title: view.activeSheet.title, saved: savedCents(view.activeSheet), total: totalCents(view.activeSheet) } : null}
        href={budgetHref}
      />
      {view.savingsPrompt && view.activeSheet && (
        <SavingsDayCard
          slotNumber={view.savingsPrompt.index + 1}
          amountCents={view.savingsPrompt.amountCents}
          currency={plan.currency}
          onFill={() => budget.fillSlot(view.activeSheet!, view.savingsPrompt!.index).catch(() => undefined)}
          onNotToday={() => {
            dismissSavingsDay(view.today);
            setSavingsDayDismissed(view.today);
          }}
        />
      )}
      {view.nudge && (
        <NudgeCard
          nudge={view.nudge}
          currency={plan.currency}
          onSavedPlanned={() => budget.add({ kind: "saving", amountCents: view.save, category: "saving", note: null, occurredOn: view.today }).catch(() => { router.push(budgetHref); })}
          onSaveDifferent={() => router.push(budgetHref)}
          onNotThisTime={() => {
            dismissPayday(view.start);
            setDismissedFor(view.start);
          }}
          onAddSpending={() => router.push(budgetHref)}
          onNothingToday={() => budget.add({ kind: "expense", amountCents: 0, category: NOTHING_TODAY, note: null, occurredOn: view.today }).catch(() => undefined)}
          onOpenIdeas={() => {
            budget.markSeen(unseen);
            router.push(budgetHref);
          }}
          onDismissMilestone={() => budget.markSeen(unseen)}
        />
      )}
      <Link href={budgetHref} className="flex items-center justify-between gap-3 rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)] transition-transform active:scale-[0.98]">
        <span className="text-base text-foreground">
          Savings: <span className="font-semibold">{money(balance)}</span>
          {view.next ? <span className="text-muted-foreground"> · next milestone {money(view.next)}</span> : null}
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </Link>
    </div>
  );
}
