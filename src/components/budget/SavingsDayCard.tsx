import { useState } from "react";
import { BloomMark } from "@/components/brand/BloomMark";
import { formatMoney } from "@/lib/budget/money";

const KEY = "bloom-savings-day-dismissed";

export function readSavingsDayDismissed(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function dismissSavingsDay(today: string): void {
  try {
    localStorage.setItem(KEY, today);
  } catch {
    // Private browsing can block storage; the card simply shows again.
  }
}

/** Pansy's prominent savings-day card, with a direct button to fill the next blossom slot. */
export function SavingsDayCard({
  slotNumber,
  amountCents,
  currency,
  onFill,
  onNotToday,
}: {
  slotNumber: number;
  amountCents: number;
  currency: string;
  onFill: () => Promise<void>;
  onNotToday: () => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <section className="bloom-rise rounded-3xl bg-[var(--bloom-blush-soft)] p-6 shadow-[var(--bloom-shadow-lift)]" role="status" aria-label="Pansy's savings day">
      <div className="flex gap-3">
        <span className="shrink-0 rounded-full bg-[var(--bloom-paper)] p-2">
          <BloomMark size={36} />
        </span>
        <div>
          <p className="font-serif text-base text-muted-foreground">Pansy</p>
          <h2 className="mt-1 text-2xl leading-snug text-foreground">It&apos;s your savings day!</h2>
          <p className="mt-1 text-base text-foreground">Tap your next blossom slot to keep your streak blooming.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (busy) return;
            setBusy(true);
            try {
              await onFill();
            } finally {
              setBusy(false);
            }
          }}
          className="min-h-[44px] rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Saving..." : `Fill slot ${slotNumber} (${formatMoney(amountCents, currency)})`}
        </button>
        <button type="button" onClick={onNotToday} className="min-h-[44px] rounded-full px-4 text-sm font-medium text-muted-foreground">
          Not today
        </button>
      </div>
    </section>
  );
}
