import { useState } from "react";
import { X } from "lucide-react";
import { CATEGORIES, CATEGORY_LABEL, type Plan } from "@/lib/budget/types";

/** Her spending categories: the built-in ones, plus up to 20 of her own. */
export function CategoriesCard({ plan, onSave }: { plan: Plan; onSave: (plan: Plan) => Promise<void> }) {
  const own = plan.categories ?? [];
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const taken = new Set([...CATEGORIES.map((c) => CATEGORY_LABEL[c].toLowerCase()), ...own.map((c) => c.toLowerCase())]);
  const name = draft.trim();
  const canAdd = name.length > 0 && name.length <= 40 && !taken.has(name.toLowerCase()) && own.length < 20;

  const save = async (categories: string[]) => {
    setBusy(true);
    setProblem(null);
    try {
      await onSave({ ...plan, categories });
      setDraft("");
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "That didn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bloom-rise rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]" aria-label="Spending categories">
      <h2 className="text-2xl text-foreground">Spending categories</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <li key={c} className="rounded-full bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
            {CATEGORY_LABEL[c]}
          </li>
        ))}
        {own.map((c) => (
          <li key={c} className="flex items-center gap-1 rounded-full border border-[var(--bloom-blush)] bg-[var(--bloom-blush-soft)] py-1 pl-3 pr-1 text-sm text-foreground">
            {c}
            <button
              type="button"
              aria-label={`Remove ${c}`}
              disabled={busy}
              onClick={() => save(own.filter((x) => x !== c))}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--bloom-paper)]"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (canAdd) save([...own, name]);
        }}
      >
        <label className="sr-only" htmlFor="new-category">
          New category
        </label>
        <input
          id="new-category"
          maxLength={40}
          placeholder="Add your own, like Pets"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-11 flex-1 rounded-2xl border border-border bg-[var(--bloom-paper-raised)] px-3 text-base text-foreground"
        />
        <button type="submit" disabled={!canAdd || busy} className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
          Add
        </button>
      </form>
      {name && taken.has(name.toLowerCase()) && <p className="mt-2 text-sm text-muted-foreground">You already have that category.</p>}
      {problem && (
        <p className="mt-2 text-sm text-[var(--bloom-alert)]" role="alert">
          {problem}
        </p>
      )}
    </section>
  );
}
