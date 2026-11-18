import Link from "next/link";
import { CountUp } from "@/components/ui/CountUp";
import { formatMoney } from "@/lib/budget/money";

const card = "bloom-rise block rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)]";

function Wrap({ children, label, href }: { children: React.ReactNode; label: string; href?: string }) {
  return href ? (
    <Link href={href} className={`${card} transition-transform active:scale-[0.98]`} aria-label={label}>
      {children}
    </Link>
  ) : (
    <section className={card} aria-label={label}>
      {children}
    </section>
  );
}

/** The three cards at the top of the dashboard: Total Portfolio, Safe to Spend and Savings Challenge Progress. */
export function SummaryCards({
  currency,
  savings,
  invested,
  safe,
  perDay,
  challenge,
  href,
}: {
  currency: string;
  savings: number;
  invested: number;
  safe: number;
  perDay: number;
  /** The active savings plan sheet, if she has one. */
  challenge: { title: string; saved: number; total: number } | null;
  /** Where the cards link to, such as the Budget page. */
  href?: string;
}) {
  const money = (cents: number) => formatMoney(cents, currency);
  const pct = challenge && challenge.total > 0 ? Math.round((challenge.saved / challenge.total) * 100) : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Wrap href={href} label="Total portfolio">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Portfolio</p>
        <p className="mt-2 font-serif text-3xl leading-none text-foreground">
          <CountUp value={savings + invested} format={money} />
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {money(savings)} saved · {money(invested)} investing
        </p>
      </Wrap>
      <Wrap href={href} label="Safe to spend">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Safe to Spend</p>
        <p className="mt-2 font-serif text-3xl leading-none text-[var(--bloom-sage-text)]">
          <CountUp value={safe} format={money} />
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{safe > 0 ? `About ${money(perDay)} a day until payday` : "Your spending money for this pay period is used up"}</p>
      </Wrap>
      <Wrap href={href} label="Savings challenge progress">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Savings Challenge</p>
        {challenge ? (
          <>
            <p className="mt-2 font-serif text-3xl leading-none text-foreground">{pct}%</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
              <div className="h-full rounded-full bg-[var(--bloom-sage)]" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {challenge.title}: {money(challenge.saved)} of {money(challenge.total)}
            </p>
          </>
        ) : (
          <p className="mt-2 text-base text-foreground">Start a savings plan sheet to see your progress bloom.</p>
        )}
      </Wrap>
    </div>
  );
}
