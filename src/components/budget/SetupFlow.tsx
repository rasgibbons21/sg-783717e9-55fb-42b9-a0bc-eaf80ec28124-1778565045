import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { BloomMark } from "@/components/brand/BloomMark";
import { allocate, project } from "@/lib/budget/maths";
import { currencyForCountry, customCurrency, formatMoney, parseMoney } from "@/lib/budget/money";
import { CURRENCIES, PAY_FREQUENCY_LABEL, type BillFrequency, type PayFrequency, type Plan } from "@/lib/budget/types";
import { cn } from "@/lib/utils";

const STEPS = 5;
const FREQUENCIES: PayFrequency[] = ["weekly", "biweekly", "semimonthly", "monthly"];
const BILL_FREQUENCIES: { value: BillFrequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "yearly", label: "Yearly" },
];

interface BillDraft {
  name: string;
  amount: string;
  frequency: BillFrequency;
}

const fieldClass =
  "mt-2 h-12 w-full rounded-2xl border border-border bg-[var(--bloom-paper-raised)] px-4 text-base text-foreground outline-none focus:border-[var(--bloom-gold)] focus:ring-2 focus:ring-[var(--bloom-gold)]/30";

const localToday = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

function Pansy({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 pt-1">
        <BloomMark size={36} />
      </div>
      <div>
        <p className="font-serif text-base text-muted-foreground">Pansy</p>
        <div className="mt-1 text-lg leading-relaxed text-foreground">{children}</div>
      </div>
    </div>
  );
}

/** Pansy's guided, save-first setup. Code does all the maths, so the numbers are always exact. */
export function SetupFlow({ initial, country, onSave }: { initial: Plan | null; country: string | null; onSave: (plan: Plan) => Promise<void> }) {
  const [step, setStep] = useState(0);
  const [listedCurrency, setCurrency] = useState(initial?.currency ?? currencyForCountry(country));
  const initialIsOther = Boolean(initial && !(CURRENCIES as readonly string[]).includes(initial.currency));
  const [useOther, setUseOther] = useState(initialIsOther);
  const [otherCode, setOtherCode] = useState(initialIsOther ? (initial?.currency ?? "") : "");
  const currency = useOther ? (customCurrency(otherCode) ?? "USD") : listedCurrency;
  const [pay, setPay] = useState(initial ? (initial.payCents / 100).toFixed(2) : "");
  const [frequency, setFrequency] = useState<PayFrequency>(initial?.payFrequency ?? "monthly");
  const [nextPayday, setNextPayday] = useState(initial?.nextPayday ?? localToday());
  const [bills, setBills] = useState<BillDraft[]>(
    initial?.bills.map((b) => ({ name: b.name, amount: (b.amountCents / 100).toFixed(2), frequency: b.frequency })) ?? [],
  );
  const [savePct, setSavePct] = useState(initial?.savePct ?? 10);
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  // Her country arrives after the first render; use it unless she already has a plan.
  useEffect(() => {
    if (!initial && country) setCurrency(currencyForCountry(country));
  }, [country, initial]);

  const payCents = parseMoney(pay);
  const billCents = bills.map((b) => parseMoney(b.amount));
  const billsValid = bills.every((b, i) => b.name.trim().length > 0 && b.name.trim().length <= 40 && (billCents[i] ?? 0) > 0);
  const money = (cents: number) => formatMoney(cents, currency);

  const plan: Plan | null = useMemo(
    () =>
      payCents && payCents > 0
        ? {
            currency,
            payCents,
            payFrequency: frequency,
            nextPayday,
            bills: bills.map((b, i) => ({ name: b.name.trim(), amountCents: billCents[i] ?? 0, frequency: b.frequency })).filter((b) => b.amountCents > 0 && b.name),
            savePct,
            goalCents: initial?.goalCents ?? null,
            interestPct: initial?.interestPct ?? 0,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          }
        : null,
    // billCents is derived from bills.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency, payCents, frequency, nextPayday, bills, savePct, initial],
  );
  const split = plan ? allocate(plan) : null;

  const canContinue = [!useOther || customCurrency(otherCode) !== null, Boolean(payCents && payCents > 0 && nextPayday), billsValid, true, true][step];

  const finish = async () => {
    if (!plan) return;
    setSaving(true);
    setProblem(null);
    try {
      await onSave(plan);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "That didn't save. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 pb-10 pt-6">
      <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step + 1} aria-label="Setup progress">
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-[var(--bloom-gold)]" : "bg-secondary")} />
        ))}
      </div>

      <section key={step} className="bloom-rise mt-6 rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]" style={{ animationDuration: "250ms" }}>
        {step === 0 && (
          <>
            <Pansy>Hello. Let&apos;s build a calm savings plan together. First, which currency are you paid in?</Pansy>
            <label className="mt-6 block text-sm font-medium text-muted-foreground" htmlFor="currency">
              Currency
            </label>
            <select
              id="currency"
              value={useOther ? "OTHER" : listedCurrency}
              onChange={(e) => {
                if (e.target.value === "OTHER") return setUseOther(true);
                setUseOther(false);
                setCurrency(e.target.value);
              }}
              className={fieldClass}
            >
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
              <option value="OTHER">Other</option>
            </select>
            {useOther && (
              <>
                <label className="mt-4 block text-sm font-medium text-muted-foreground" htmlFor="currency-code">
                  Your currency&apos;s 3-letter code, such as PHP or MXN
                </label>
                <input
                  id="currency-code"
                  maxLength={3}
                  autoCapitalize="characters"
                  autoComplete="off"
                  value={otherCode}
                  onChange={(e) => setOtherCode(e.target.value.toUpperCase())}
                  className={fieldClass}
                />
                {otherCode && customCurrency(otherCode) === null && (
                  <p className="mt-2 text-sm text-[var(--bloom-blush-text)]">Please enter three letters, like PHP.</p>
                )}
              </>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <Pansy>How much do you take home each payday, after tax? And how often are you paid?</Pansy>
            <label className="mt-6 block text-sm font-medium text-muted-foreground" htmlFor="pay">
              Take-home pay
            </label>
            <input id="pay" inputMode="decimal" autoComplete="off" placeholder="2,000" value={pay} onChange={(e) => setPay(e.target.value)} className={fieldClass} />
            {pay && !(payCents && payCents > 0) && <p className="mt-2 text-sm text-[var(--bloom-blush-text)]">Please enter an amount like 2,000 or 1250.50.</p>}
            <p className="mt-5 text-sm font-medium text-muted-foreground">How often</p>
            <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="How often you are paid">
              {FREQUENCIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={frequency === value}
                  onClick={() => setFrequency(value)}
                  className={cn(
                    "min-h-[44px] rounded-2xl border px-3 text-sm font-medium",
                    frequency === value ? "border-[var(--bloom-ink)] bg-[var(--bloom-ink)] text-[var(--bloom-paper)]" : "border-border text-foreground",
                  )}
                >
                  {PAY_FREQUENCY_LABEL[value]}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-sm font-medium text-muted-foreground" htmlFor="payday">
              Your next payday
            </label>
            <input id="payday" type="date" value={nextPayday} onChange={(e) => setNextPayday(e.target.value)} className={fieldClass} />
          </>
        )}

        {step === 2 && (
          <>
            <Pansy>Any fixed bills, like rent, your phone or transport? You can skip this and add them later.</Pansy>
            <div className="mt-6 space-y-3">
              {bills.map((bill, index) => (
                <div key={index} className="rounded-2xl border border-border p-3">
                  <div className="flex gap-2">
                    <input
                      aria-label={`Bill ${index + 1} name`}
                      placeholder="Rent"
                      maxLength={40}
                      value={bill.name}
                      onChange={(e) => setBills(bills.map((b, i) => (i === index ? { ...b, name: e.target.value } : b)))}
                      className={cn(fieldClass, "mt-0")}
                    />
                    <button
                      type="button"
                      aria-label={`Remove bill ${index + 1}`}
                      onClick={() => setBills(bills.filter((_, i) => i !== index))}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-muted-foreground hover:bg-secondary"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      aria-label={`Bill ${index + 1} amount`}
                      inputMode="decimal"
                      placeholder="900"
                      value={bill.amount}
                      onChange={(e) => setBills(bills.map((b, i) => (i === index ? { ...b, amount: e.target.value } : b)))}
                      className={cn(fieldClass, "mt-0")}
                    />
                    <select
                      aria-label={`Bill ${index + 1} how often`}
                      value={bill.frequency}
                      onChange={(e) => setBills(bills.map((b, i) => (i === index ? { ...b, frequency: e.target.value as BillFrequency } : b)))}
                      className={cn(fieldClass, "mt-0")}
                    >
                      {BILL_FREQUENCIES.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
            {!billsValid && <p className="mt-2 text-sm text-[var(--bloom-blush-text)]">Each bill needs a name and an amount.</p>}
            {bills.length < 15 && (
              <button
                type="button"
                onClick={() => setBills([...bills, { name: "", amount: "", frequency: "monthly" }])}
                className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground"
              >
                <Plus className="h-4 w-4" /> Add a bill
              </button>
            )}
          </>
        )}

        {step === 3 && split && (
          <>
            <Pansy>
              Here&apos;s the heart of it: pay yourself first. Before any bills or spending, a set share of every payday goes straight into savings.
              Even a small amount, done every time, adds up.
            </Pansy>
            <label className="mt-6 block text-sm font-medium text-muted-foreground" htmlFor="save-pct">
              Save {savePct}% of each payday
            </label>
            <input
              id="save-pct"
              type="range"
              min={1}
              max={50}
              step={1}
              value={savePct}
              onChange={(e) => setSavePct(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--bloom-gold)]"
            />
            <p className="mt-4 text-center font-serif text-4xl text-foreground">{money(split.save)}</p>
            <p className="text-center text-sm text-muted-foreground">into savings every payday</p>
          </>
        )}

        {step === 4 && split && plan && (
          <>
            <Pansy>Here&apos;s your plan, with the maths shown.</Pansy>
            <dl className="mt-6 space-y-3 text-base">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Your pay</dt>
                <dd className="font-medium text-foreground">{money(split.pay)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">1. Savings first ({plan.savePct}%)</dt>
                <dd className="font-medium text-[var(--bloom-sage-text)]">− {money(split.save)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">2. Bills</dt>
                <dd className="font-medium text-foreground">− {money(split.bills)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <dt className="text-foreground">3. Left to spend</dt>
                <dd className="font-semibold text-foreground">{money(split.spend)}</dd>
              </div>
            </dl>
            {!split.overspent && <p className="mt-2 text-sm text-muted-foreground">That&apos;s about {money(split.perDay)} a day until your next payday.</p>}

            {split.overspent && split.suggestedPct !== null && (
              <div className="mt-4 rounded-2xl bg-[var(--bloom-blush-soft)] p-4 text-base text-foreground" role="status">
                Your bills and savings come to more than your pay. Saving {split.suggestedPct}% would still leave room for everyday spending.
                <button
                  type="button"
                  onClick={() => setSavePct(split.suggestedPct as number)}
                  className="mt-3 block min-h-[44px] rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
                >
                  Use {split.suggestedPct}%
                </button>
              </div>
            )}
            {split.billsExceedPay && (
              <div className="mt-4 rounded-2xl bg-[var(--bloom-blush-soft)] p-4 text-base text-foreground" role="status">
                Your bills are more than your pay right now. Let&apos;s look at them together before choosing a savings amount.
              </div>
            )}

            <h3 className="mt-6 text-xl text-foreground">If you keep going</h3>
            <ul className="mt-2 space-y-1 text-base text-foreground">
              {[6, 12, 24].map((months) => (
                <li key={months} className="flex justify-between">
                  <span className="text-muted-foreground">In {months} months</span>
                  <span className="font-medium">{money(project(split.save, plan.payFrequency, months, plan.interestPct))}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">Estimates from your plan, not a guarantee.</p>
            {problem && <p className="mt-4 text-sm text-[var(--bloom-blush-text)]" role="alert">{problem}</p>}
          </>
        )}
      </section>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="h-12 flex-1 rounded-full border border-border text-base font-medium text-foreground">
            Back
          </button>
        )}
        <motion.button
          type="button"
          whileTap={canContinue ? { scale: 0.97 } : undefined}
          disabled={!canContinue || saving}
          onClick={() => (step === STEPS - 1 ? finish() : setStep(step + 1))}
          className="h-12 flex-[2] rounded-full bg-primary text-base font-semibold text-primary-foreground disabled:opacity-40"
        >
          {step === STEPS - 1 ? (saving ? "Saving..." : "Start my plan") : step === 2 && bills.length === 0 ? "Skip for now" : "Continue"}
        </motion.button>
      </div>
    </div>
  );
}
