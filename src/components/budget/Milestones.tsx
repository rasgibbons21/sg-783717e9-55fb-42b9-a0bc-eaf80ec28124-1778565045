import { BloomMark } from "@/components/brand/BloomMark";
import { ladderCents } from "@/lib/budget/maths";
import { formatMoney } from "@/lib/budget/money";

/** Reached milestones as gold blooms, with the next one outlined. */
export function Milestones({
  reached,
  balance,
  goalCents,
  currency,
  onOpenIdeas,
}: {
  reached: number[];
  balance: number;
  goalCents: number | null;
  currency: string;
  onOpenIdeas: () => void;
}) {
  const done = new Set(reached);
  const ladder = ladderCents(goalCents);
  const nextIndex = ladder.findIndex((amount) => !done.has(amount) && amount > balance);
  const shown = ladder.slice(0, Math.max(nextIndex + 1, Math.min(3, ladder.length)));

  return (
    <section className="bloom-rise rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]" aria-label="Milestones">
      <h2 className="text-2xl text-foreground">Milestones</h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {shown.map((amount) => {
          const isReached = done.has(amount);
          return (
            <li key={amount} className={isReached ? "flex flex-col items-center" : "flex flex-col items-center opacity-50"}>
              <span className={isReached ? "rounded-full bg-[var(--bloom-sage-soft)] p-2" : "rounded-full border border-dashed border-border p-2"}>
                <BloomMark size={28} />
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                {formatMoney(amount, currency).replace(/\.00$/, "")}
                {amount === goalCents ? " goal" : ""}
              </span>
            </li>
          );
        })}
      </ul>
      {reached.length > 0 && (
        <button type="button" onClick={onOpenIdeas} className="mt-5 min-h-[44px] rounded-full border border-[var(--bloom-gold)] px-5 text-sm font-medium text-foreground">
          Ideas to study
        </button>
      )}
    </section>
  );
}
