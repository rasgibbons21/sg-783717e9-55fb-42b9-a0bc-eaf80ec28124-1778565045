import { useEffect, useState } from "react";
import { project, projectStepUp } from "@/lib/budget/maths";
import { formatMoney, parseMoney } from "@/lib/budget/money";
import type { PayFrequency } from "@/lib/budget/types";

const MONTHS = [6, 12, 24];

/** Where her savings get to if she keeps going, and how much faster if she steps it up a little each month. */
export function Projections({
  savePerPayday,
  payFrequency,
  currency,
  interestPct,
  onInterestChange,
}: {
  savePerPayday: number;
  payFrequency: PayFrequency;
  currency: string;
  interestPct: number;
  onInterestChange: (pct: number) => void;
}) {
  const money = (cents: number) => formatMoney(cents, currency);
  const [interest, setInterest] = useState(String(interestPct));
  const [step, setStep] = useState((Math.round(savePerPayday * 0.05) / 100).toFixed(2));

  useEffect(() => setInterest(String(interestPct)), [interestPct]);
  useEffect(() => setStep((Math.round(savePerPayday * 0.05) / 100).toFixed(2)), [savePerPayday]);

  const rate = Math.min(15, Math.max(0, Number(interest) || 0));
  const stepCents = parseMoney(step) ?? 0;

  return (
    <section className="bloom-rise rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]" aria-label="If you keep going">
      <h2 className="text-2xl text-foreground">If you keep going</h2>
      <p className="mt-2 text-base text-foreground">
        Save {money(savePerPayday)} per payday now = <span className="font-semibold">{money(project(savePerPayday, payFrequency, 12, rate))}</span> in a year.
        {stepCents > 0 && (
          <>
            {" "}
            Add {money(stepCents)} more each month and it becomes{" "}
            <span className="font-semibold text-[var(--bloom-sage-text)]">{money(projectStepUp(savePerPayday, payFrequency, 12, stepCents, rate))}</span>.
          </>
        )}
      </p>
      <table className="mt-4 w-full text-left text-base">
        <thead>
          <tr className="text-sm text-muted-foreground">
            <th className="pb-2 font-medium">In</th>
            <th className="pb-2 font-medium">As you are</th>
            <th className="pb-2 font-medium">Stepping up</th>
          </tr>
        </thead>
        <tbody>
          {MONTHS.map((months) => (
            <tr key={months} className="border-t border-border">
              <td className="py-2 text-muted-foreground">{months} months</td>
              <td className="py-2 text-foreground">{money(project(savePerPayday, payFrequency, months, rate))}</td>
              <td className="py-2 font-medium text-[var(--bloom-sage-text)]">{money(projectStepUp(savePerPayday, payFrequency, months, stepCents, rate))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-sm text-muted-foreground">
          Step up each month
          <input
            inputMode="decimal"
            value={step}
            onChange={(e) => setStep(e.target.value)}
            className="mt-1 h-11 w-full rounded-2xl border border-border bg-[var(--bloom-paper-raised)] px-3 text-base text-foreground"
          />
        </label>
        <label className="text-sm text-muted-foreground">
          Savings interest % a year
          <input
            inputMode="decimal"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            onBlur={() => {
              if (rate !== interestPct) onInterestChange(rate);
            }}
            className="mt-1 h-11 w-full rounded-2xl border border-border bg-[var(--bloom-paper-raised)] px-3 text-base text-foreground"
          />
        </label>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Estimates from your plan, not a guarantee.</p>
    </section>
  );
}
