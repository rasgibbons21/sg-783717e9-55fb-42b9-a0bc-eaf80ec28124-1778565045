import { CountUp } from "@/components/ui/CountUp";
import { formatMoney } from "@/lib/budget/money";

/** Her savings balance, the gold line to the next milestone, and her logging streak. */
export function SavingsCard({
  balance,
  currency,
  next,
  previous,
  streakDays,
  onAddSaving,
  onWithdraw,
}: {
  balance: number;
  currency: string;
  next: number | null;
  previous: number;
  streakDays: number;
  onAddSaving: () => void;
  onWithdraw: () => void;
}) {
  const money = (cents: number) => formatMoney(cents, currency);
  const progress = next ? Math.max(0, Math.min(1, (balance - previous) / Math.max(next - previous, 1))) : 1;

  return (
    <section className="bloom-rise rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]" aria-label="Your savings">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Your savings</p>
      <p className="mt-2 font-serif text-5xl leading-none text-foreground">
        <CountUp value={balance} format={money} />
      </p>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label="Progress to your next milestone">
        <div className="h-full rounded-full bg-[var(--bloom-gold)] transition-[width] duration-700" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{next ? `Next milestone: ${money(next)}` : "Every milestone reached. Beautiful."}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {streakDays > 0 ? `${streakDays} ${streakDays === 1 ? "day" : "days"} logged in a row` : "Log today to start a streak"}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={onAddSaving} className="min-h-[44px] rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
          Add to savings
        </button>
        <button type="button" onClick={onWithdraw} className="min-h-[44px] rounded-full px-4 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
          Move money out of savings
        </button>
      </div>
    </section>
  );
}
