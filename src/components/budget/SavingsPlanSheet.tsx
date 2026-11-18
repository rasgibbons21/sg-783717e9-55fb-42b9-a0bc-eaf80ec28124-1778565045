import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Printer } from "lucide-react";
import { BloomMark } from "@/components/brand/BloomMark";
import {
  TEMPLATES,
  customSlots,
  nextSlotIndex,
  progress,
  savedCents,
  sweepableCents,
  templateSlots,
  totalCents,
  type Challenge,
  type TemplateId,
} from "@/lib/budget/challenges";
import type { NewChallenge } from "@/lib/budget/devStore";
import { formatMoney, parseMoney } from "@/lib/budget/money";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-1 h-11 w-full rounded-2xl border border-border bg-[var(--bloom-paper-raised)] px-3 text-base text-foreground outline-none focus:border-[var(--bloom-gold)] focus:ring-2 focus:ring-[var(--bloom-gold)]/30";

function CustomForm({ currency, onCreate }: { currency: string; onCreate: (sheet: NewChallenge) => Promise<void> }) {
  const [title, setTitle] = useState("My savings sheet");
  const [mode, setMode] = useState<"target" | "perSlot">("target");
  const [target, setTarget] = useState("1,000");
  const [perSlot, setPerSlot] = useState("25");
  const [count, setCount] = useState("20");
  const [pattern, setPattern] = useState<"equal" | "increasing">("equal");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const slots = useMemo(() => {
    const n = Number(count);
    if (!Number.isInteger(n)) return null;
    if (mode === "perSlot") {
      const cents = parseMoney(perSlot);
      return cents ? customSlots({ perSlotCents: cents, count: n, pattern: "equal" }) : null;
    }
    const cents = parseMoney(target);
    return cents ? customSlots({ targetCents: cents, count: n, pattern }) : null;
  }, [mode, target, perSlot, count, pattern]);

  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!slots || !title.trim()) return;
        setBusy(true);
        setProblem(null);
        try {
          await onCreate({ template: "custom", title: title.trim().slice(0, 60), slots });
        } catch (error) {
          setProblem(error instanceof Error ? error.message : "That didn't save. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="text-sm text-muted-foreground">
        Name
        <input className={fieldClass} maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <div className="flex gap-2" role="radiogroup" aria-label="How to set amounts">
        {(["target", "perSlot"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={mode === value}
            onClick={() => setMode(value)}
            className={cn("min-h-[44px] flex-1 rounded-full border px-3 text-sm", mode === value ? "border-[var(--bloom-ink)] bg-[var(--bloom-ink)] text-[var(--bloom-paper)]" : "border-border")}
          >
            {value === "target" ? "A target amount" : "An amount per slot"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {mode === "target" ? (
          <label className="text-sm text-muted-foreground">
            Target
            <input className={fieldClass} inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
          </label>
        ) : (
          <label className="text-sm text-muted-foreground">
            Each slot
            <input className={fieldClass} inputMode="decimal" value={perSlot} onChange={(e) => setPerSlot(e.target.value)} />
          </label>
        )}
        <label className="text-sm text-muted-foreground">
          Number of slots
          <input className={fieldClass} inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))} />
        </label>
      </div>
      {mode === "target" && (
        <div className="flex gap-2" role="radiogroup" aria-label="Slot pattern">
          {(["equal", "increasing"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={pattern === value}
              onClick={() => setPattern(value)}
              className={cn("min-h-[44px] flex-1 rounded-full border px-3 text-sm", pattern === value ? "border-[var(--bloom-ink)] bg-[var(--bloom-ink)] text-[var(--bloom-paper)]" : "border-border")}
            >
              {value === "equal" ? "Same each time" : "Growing each time"}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {slots
          ? `${slots.length} slots, ${formatMoney(slots.reduce((a, b) => a + b, 0), currency)} in total.`
          : "Choose up to 366 slots, with at least one cent in each."}
      </p>
      {problem && (
        <p className="text-sm text-[var(--bloom-alert)]" role="alert">
          {problem}
        </p>
      )}
      <button type="submit" disabled={!slots || busy} className="h-12 rounded-full bg-primary text-base font-semibold text-primary-foreground disabled:opacity-40">
        {busy ? "Saving..." : "Start this sheet"}
      </button>
    </form>
  );
}

/** The interactive savings plan sheet: pick a template, tap slots to make them bloom, and sweep savings to investing. */
export function SavingsPlanSheet({
  sheets,
  currency,
  onCreate,
  onFill,
  onUnfill,
  onSweep,
  onArchive,
}: {
  sheets: Challenge[];
  currency: string;
  onCreate: (sheet: NewChallenge) => Promise<void>;
  onFill: (sheet: Challenge, index: number) => Promise<void>;
  onUnfill: (sheet: Challenge, index: number) => Promise<void>;
  onSweep: (sheet: Challenge) => Promise<void>;
  onArchive: (sheet: Challenge) => Promise<void>;
}) {
  const active = sheets.filter((s) => s.active);
  const [tab, setTab] = useState<TemplateId>(active[0]?.template ?? "week52");
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const sheet = active.find((s) => s.template === tab) ?? null;
  const info = TEMPLATES.find((t) => t.id === tab)!;
  const money = (cents: number) => formatMoney(cents, currency);

  const run = async (work: () => Promise<void>) => {
    setProblem(null);
    try {
      await work();
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "That didn't save. Please try again.");
    }
  };

  return (
    <section className="savings-sheet bloom-rise rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]" aria-label="Savings plan sheet">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Savings plan sheet</p>
          <h2 className="mt-1 text-2xl text-foreground">{sheet?.title ?? info.title}</h2>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground"
          aria-label="Print this sheet"
        >
          <Printer className="h-5 w-5" />
        </button>
      </div>

      <div className="no-print mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Savings plan templates">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            role="tab"
            aria-selected={tab === template.id}
            onClick={() => setTab(template.id)}
            className={cn(
              "min-h-[44px] rounded-2xl border px-3 py-2 text-left text-sm font-medium",
              tab === template.id ? "border-[var(--bloom-ink)] bg-[var(--bloom-ink)] text-[var(--bloom-paper)]" : "border-border text-foreground",
            )}
          >
            {template.title}
          </button>
        ))}
      </div>

      {!sheet && (
        <div className="mt-5">
          <p className="text-base text-muted-foreground">{info.blurb((cents) => money(cents).replace(/.00$/, ""))}</p>
          {tab === "custom" ? (
            <CustomForm currency={currency} onCreate={onCreate} />
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await run(() => onCreate({ template: tab, title: info.title, slots: templateSlots(tab) }));
                setBusy(false);
              }}
              className="mt-4 h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground disabled:opacity-40"
            >
              {busy ? "Saving..." : `Start the ${info.title}`}
            </button>
          )}
        </div>
      )}

      {sheet && (
        <>
          <div className="mt-5 flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">
              {Object.keys(sheet.completed).length} of {sheet.slots.length} blossoms
            </span>
            <span className="font-medium text-foreground">
              {money(savedCents(sheet))} of {money(totalCents(sheet))}
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress(sheet) * 100)}
            aria-label="Savings plan progress"
          >
            <div className="h-full rounded-full bg-[var(--bloom-sage)] transition-[width] duration-700" style={{ width: `${progress(sheet) * 100}%` }} />
          </div>

          <ol className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-8" aria-label="Savings slots">
            {sheet.slots.map((amount, index) => {
              const filled = String(index) in sheet.completed;
              const next = nextSlotIndex(sheet) === index;
              return (
                <li key={index}>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    disabled={busySlot !== null}
                    aria-pressed={filled}
                    aria-label={`Slot ${index + 1}, ${money(amount)}, ${filled ? "filled" : "empty"}`}
                    onClick={async () => {
                      if (filled && !window.confirm(`Un-fill slot ${index + 1}? This removes ${money(amount)} from your savings.`)) return;
                      setBusySlot(index);
                      await run(() => (filled ? onUnfill(sheet, index) : onFill(sheet, index)));
                      setBusySlot(null);
                      if (!filled) {
                        try {
                          navigator.vibrate?.(12);
                        } catch {
                          // Not every device can vibrate.
                        }
                      }
                    }}
                    className={cn(
                      "flex aspect-square min-h-[48px] w-full flex-col items-center justify-center rounded-full border text-[11px] leading-tight transition-colors",
                      filled
                        ? "border-[var(--bloom-sage)] bg-[var(--bloom-sage-soft)] text-[var(--bloom-sage-text)]"
                        : next
                          ? "border-[var(--bloom-blush)] bg-[var(--bloom-blush-soft)] text-foreground"
                          : "border-border bg-[var(--bloom-paper-raised)] text-muted-foreground",
                    )}
                  >
                    {filled ? <BloomMark size={18} /> : <span className="font-semibold">{index + 1}</span>}
                    <span>{money(amount).replace(/\.00$/, "")}</span>
                  </motion.button>
                </li>
              );
            })}
          </ol>

          {problem && (
            <p className="mt-3 text-sm text-[var(--bloom-alert)]" role="alert">
              {problem}
            </p>
          )}

          <div className="no-print mt-5 rounded-2xl bg-secondary/60 p-4">
            <p className="text-sm text-foreground">
              Ready to invest: <span className="font-semibold">{money(sweepableCents(sheet))}</span>
              {sheet.sweptCents > 0 && <span className="text-muted-foreground"> · {money(sheet.sweptCents)} swept so far</span>}
            </p>
            <button
              type="button"
              disabled={sweepableCents(sheet) === 0 || busy}
              onClick={async () => {
                setBusy(true);
                await run(() => onSweep(sheet));
                setBusy(false);
              }}
              className="mt-3 h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground disabled:opacity-40"
            >
              Sweep to Investments
            </button>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Bloom records this move to your investing goal. Move the money yourself at your bank or broker. Education only, not investment advice.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Start this sheet again? Your filled slots stay in your savings.")) run(() => onArchive(sheet));
            }}
            className="no-print mt-3 min-h-[44px] text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Start this sheet again
          </button>
        </>
      )}
    </section>
  );
}
