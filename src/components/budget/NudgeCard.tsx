import { useEffect } from "react";
import { BloomMark } from "@/components/brand/BloomMark";
import { formatMoney } from "@/lib/budget/money";
import type { Nudge } from "@/lib/budget/nudges";

export const PAYDAY_DISMISSED_KEY = "bloom-budget-payday-dismissed";

export function readPaydayDismissed(): string | null {
  try {
    return localStorage.getItem(PAYDAY_DISMISSED_KEY);
  } catch {
    return null;
  }
}

export function dismissPayday(periodStart: string): void {
  try {
    localStorage.setItem(PAYDAY_DISMISSED_KEY, periodStart);
  } catch {
    // Private browsing can block storage; the card will simply ask again next time.
  }
}

/** The one gentle card at a time: a milestone, the payday check-in, or logging today. */
export function NudgeCard({
  nudge,
  currency,
  onSavedPlanned,
  onSaveDifferent,
  onNotThisTime,
  onAddSpending,
  onNothingToday,
  onOpenIdeas,
}: {
  nudge: Exclude<Nudge, null>;
  currency: string;
  onSavedPlanned: () => void;
  onSaveDifferent: () => void;
  onNotThisTime: () => void;
  onAddSpending: () => void;
  onNothingToday: () => void;
  onOpenIdeas: () => void;
}) {
  useEffect(() => {
    if (nudge.kind !== "milestone") return;
    try {
      navigator.vibrate?.(15);
    } catch {
      // Not every device can vibrate.
    }
  }, [nudge]);

  const button = "min-h-[44px] rounded-full px-5 text-sm font-semibold";

  return (
    <section className="bloom-rise rounded-3xl bg-[var(--bloom-paper-raised)] p-6 shadow-[var(--bloom-shadow-lift)]" role="status">
      {nudge.kind === "milestone" && (
        <div className="flex flex-col items-center text-center">
          <span className="bloom-grow rounded-full bg-[var(--bloom-sage-soft)] p-3">
            <BloomMark size={48} />
          </span>
          <h2 className="mt-4 text-3xl text-foreground">You reached {formatMoney(nudge.amountCents, currency)} in savings</h2>
          <p className="mt-2 text-base text-muted-foreground">That&apos;s discipline, and it shows. Pansy has some places to start studying.</p>
          <button type="button" onClick={onOpenIdeas} className={`${button} mt-5 bg-primary text-primary-foreground`}>
            Ideas to study
          </button>
        </div>
      )}

      {nudge.kind === "payday" && (
        <>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Payday check-in</p>
          <h2 className="mt-2 text-2xl text-foreground">Did you move {formatMoney(nudge.saveCents, currency)} into savings?</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={onSavedPlanned} className={`${button} bg-primary text-primary-foreground`}>
              Yes, I did
            </button>
            <button type="button" onClick={onSaveDifferent} className={`${button} border border-border text-foreground`}>
              A different amount
            </button>
            <button type="button" onClick={onNotThisTime} className={`${button} text-muted-foreground`}>
              Not this time
            </button>
          </div>
        </>
      )}

      {nudge.kind === "logToday" && (
        <>
          <h2 className="text-2xl text-foreground">Nothing logged today. Anything to add?</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={onAddSpending} className={`${button} bg-primary text-primary-foreground`}>
              Add spending
            </button>
            <button type="button" onClick={onNothingToday} className={`${button} border border-border text-foreground`}>
              Nothing today
            </button>
          </div>
        </>
      )}
    </section>
  );
}
