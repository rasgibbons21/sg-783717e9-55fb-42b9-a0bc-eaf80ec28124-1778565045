import { motion } from "framer-motion";
import { formatMoney } from "@/lib/budget/money";
import { CATEGORY_LABEL, NOTHING_TODAY, type Category, type Entry } from "@/lib/budget/types";

const label = (entry: Entry) =>
  entry.kind === "saving" ? "Saved" : entry.kind === "withdrawal" ? "Moved out of savings" : CATEGORY_LABEL[entry.category as Category] ?? "Spending";

const shortDate = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });

/** Her latest entries. Tap to edit; on a phone, swipe left to delete. */
export function EntryList({ entries, currency, onEdit, onDelete }: { entries: Entry[]; currency: string; onEdit: (entry: Entry) => void; onDelete: (entry: Entry) => void }) {
  const shown = entries.filter((e) => e.category !== NOTHING_TODAY).slice(0, 20);

  return (
    <section className="bloom-rise rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]" aria-label="Recent entries">
      <h2 className="text-2xl text-foreground">Recent</h2>
      {shown.length === 0 ? (
        <p className="mt-3 text-base text-muted-foreground">Nothing logged yet. Your entries will appear here.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {shown.map((entry) => (
            <li key={entry.id} className="relative overflow-hidden">
              <button
                type="button"
                aria-label={`Delete ${label(entry)} ${formatMoney(entry.amountCents, currency)}`}
                onClick={() => onDelete(entry)}
                className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-[var(--bloom-blush-soft)] text-sm font-medium text-[var(--bloom-blush-text)]"
                tabIndex={-1}
              >
                Delete
              </button>
              <motion.button
                type="button"
                drag="x"
                dragConstraints={{ left: -96, right: 0 }}
                dragElastic={0.1}
                onClick={() => onEdit(entry)}
                className="relative flex min-h-[56px] w-full items-center justify-between gap-3 bg-card py-3 text-left"
              >
                <span>
                  <span className="block text-base text-foreground">{label(entry)}</span>
                  <span className="block text-sm text-muted-foreground">
                    {shortDate(entry.occurredOn)}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </span>
                </span>
                <span className={entry.kind === "saving" ? "font-medium text-[var(--bloom-sage-text)]" : "font-medium text-foreground"}>
                  {entry.kind === "saving" ? "+" : "−"}
                  {formatMoney(entry.amountCents, currency)}
                </span>
              </motion.button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
