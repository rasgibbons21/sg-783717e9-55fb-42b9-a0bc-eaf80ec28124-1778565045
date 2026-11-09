import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { todayIn } from "@/lib/budget/maths";
import { parseMoney } from "@/lib/budget/money";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  type Entry,
  type EntryKind,
} from "@/lib/budget/types";
import { cn } from "@/lib/utils";

const TITLES: Record<EntryKind, string> = {
  expense: "Add spending",
  saving: "Add to savings",
  withdrawal: "Move money out of savings",
};

const fieldClass =
  "mt-2 h-12 w-full rounded-2xl border border-border bg-[var(--bloom-paper-raised)] px-4 text-base text-foreground outline-none focus:border-[var(--bloom-gold)] focus:ring-2 focus:ring-[var(--bloom-gold)]/30";

/** One sheet for adding or editing spending, savings and withdrawals. It keeps her values if saving fails. */
export function AddSpendingSheet({
  open,
  onOpenChange,
  kind,
  timeZone,
  editing,
  defaultAmount,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: EntryKind;
  timeZone: string;
  editing?: Entry | null;
  defaultAmount?: number;
  onSubmit: (entry: Omit<Entry, "id">) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("groceries");
  const [note, setNote] = useState("");
  const [day, setDay] = useState(todayIn(timeZone));
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAmount(
      editing
        ? (editing.amountCents / 100).toFixed(2)
        : defaultAmount
          ? (defaultAmount / 100).toFixed(2)
          : "",
    );
    setCategory(editing?.category ?? "groceries");
    setNote(editing?.note ?? "");
    setDay(editing?.occurredOn ?? todayIn(timeZone));
    setProblem(null);
  }, [open, editing, defaultAmount, timeZone]);

  const cents = parseMoney(amount);
  const valid = cents !== null && cents > 0 && /^\d{4}-\d{2}-\d{2}$/.test(day);
  const entryKind = editing?.kind ?? kind;

  const submit = async () => {
    if (!valid || cents === null) return;
    setBusy(true);
    setProblem(null);
    try {
      await onSubmit({
        kind: entryKind,
        amountCents: cents,
        category: entryKind === "expense" ? category : entryKind,
        note: note.trim() ? note.trim().slice(0, 140) : null,
        occurredOn: day,
      });
      onOpenChange(false);
    } catch (error) {
      setProblem(
        error instanceof Error
          ? error.message
          : "That didn't save. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[90vh] max-w-xl overflow-y-auto rounded-t-3xl bg-[var(--bloom-paper)]"
      >
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl font-normal">
            {editing ? "Edit entry" : TITLES[entryKind]}
          </SheetTitle>
          <SheetDescription>
            {entryKind === "expense"
              ? "Small amounts count too."
              : "Every amount you set aside adds up."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label
            className="mt-4 block text-sm font-medium text-muted-foreground"
            htmlFor="entry-amount"
          >
            Amount
          </label>
          <input
            id="entry-amount"
            inputMode="decimal"
            autoComplete="off"
            autoFocus
            placeholder="12.50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={cn(fieldClass, "text-2xl")}
          />
          {amount && !valid && (
            <p className="mt-2 text-sm text-[var(--bloom-blush-text)]">
              Please enter an amount like 12.50.
            </p>
          )}

          {entryKind === "expense" && (
            <>
              <p className="mt-5 text-sm font-medium text-muted-foreground">
                Category
              </p>
              <div
                className="mt-2 flex flex-wrap gap-2"
                role="radiogroup"
                aria-label="Category"
              >
                {CATEGORIES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={category === value}
                    onClick={() => setCategory(value)}
                    className={cn(
                      "min-h-[44px] rounded-full border px-4 text-sm",
                      category === value
                        ? "border-[var(--bloom-ink)] bg-[var(--bloom-ink)] text-[var(--bloom-paper)]"
                        : "border-border text-foreground",
                    )}
                  >
                    {CATEGORY_LABEL[value]}
                  </button>
                ))}
              </div>
            </>
          )}

          <label
            className="mt-5 block text-sm font-medium text-muted-foreground"
            htmlFor="entry-note"
          >
            Note (optional)
          </label>
          <input
            id="entry-note"
            maxLength={140}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={fieldClass}
          />

          <label
            className="mt-5 block text-sm font-medium text-muted-foreground"
            htmlFor="entry-day"
          >
            Date
          </label>
          <input
            id="entry-day"
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className={fieldClass}
          />

          {problem && (
            <p
              className="mt-4 text-sm text-[var(--bloom-blush-text)]"
              role="alert"
            >
              {problem}
            </p>
          )}

          <button
            type="submit"
            disabled={!valid || busy}
            className="mt-6 h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground disabled:opacity-40"
          >
            {busy ? "Saving..." : problem ? "Try again" : "Save"}
          </button>
        </form>
        {editing && onDelete && (
          <button
            type="button"
            onClick={async () => {
              setBusy(true);
              try {
                await onDelete(editing.id);
                onOpenChange(false);
              } catch (error) {
                setProblem(
                  error instanceof Error
                    ? error.message
                    : "That didn't save. Please try again.",
                );
              } finally {
                setBusy(false);
              }
            }}
            className="mt-3 h-12 w-full rounded-full text-base font-medium text-[var(--bloom-blush-text)]"
          >
            Delete entry
          </button>
        )}
      </SheetContent>
    </Sheet>
  );
}
