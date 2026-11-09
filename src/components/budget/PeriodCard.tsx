import type { Allocation } from "@/lib/budget/maths";
import { formatMoney } from "@/lib/budget/money";

/** This pay period at a glance: savings first, then bills, then what's left to spend and per day. */
export function PeriodCard({
  split,
  spent,
  daysLeft,
  currency,
  onEdit,
}: {
  split: Allocation;
  spent: number;
  daysLeft: number;
  currency: string;
  onEdit: () => void;
}) {
  const money = (cents: number) => formatMoney(cents, currency);
  const left = Math.max(0, split.spend - spent);
  const perDay = Math.floor(left / Math.max(daysLeft, 1));
  const total = Math.max(split.pay, 1);
  const parts = [
    { label: "Savings", value: split.save, colour: "var(--bloom-sage)" },
    { label: "Bills", value: Math.min(split.bills, split.pay), colour: "var(--bloom-muted)" },
    { label: "Spending", value: split.spend, colour: "var(--bloom-blush)" },
  ];

  return (
    <section className="bloom-rise rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]" aria-label="This pay period">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl text-foreground">This pay period</h2>
        <button type="button" onClick={onEdit} className="min-h-[44px] px-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">
          Edit plan
        </button>
      </div>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        {parts.map((part) => (
          <span key={part.label} style={{ width: `${(part.value / total) * 100}%`, background: part.colour }} />
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        {parts.map((part) => (
          <div key={part.label}>
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ background: part.colour }} aria-hidden="true" />
              {part.label}
            </dt>
            <dd className="mt-0.5 font-medium text-foreground">{money(part.value)}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-base text-foreground">
        Left to spend: <span className="font-semibold">{money(left)}</span>
        {left > 0 && <span className="text-muted-foreground">, about {money(perDay)} a day until payday</span>}
      </p>
      {split.overspent && <p className="mt-2 text-sm text-muted-foreground">Your plan asks for more than your pay. Edit your plan and Pansy will help you rebalance.</p>}
    </section>
  );
}
