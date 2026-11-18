import { useState } from "react";
import { BloomMark } from "@/components/brand/BloomMark";
import { Switch } from "@/components/ui/switch";
import { enableSavingsNotifications, PUSH_MESSAGE } from "@/lib/budget/push";
import { SAVINGS_DAYS_LABEL, type Plan, type SavingsDays } from "@/lib/budget/types";
import { cn } from "@/lib/utils";

const ORDER: SavingsDays[] = ["payday", "fridays", "sundays", "daily", "twice_monthly"];

/** Her savings days, and whether Pansy may also send a browser or phone notification on them. */
export function RemindersCard({ plan, onSave }: { plan: Plan; onSave: (plan: Plan) => Promise<void> }) {
  const days = plan.savingsDays ?? "payday";
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async (next: Plan, confirmation: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await onSave(next);
      setMessage(confirmation);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "That didn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bloom-rise rounded-3xl bg-card p-6 shadow-[var(--bloom-shadow)]" aria-label="Pansy's reminders">
      <div className="flex items-center gap-3">
        <BloomMark size={32} />
        <h2 className="text-2xl text-foreground">Pansy&apos;s reminders</h2>
      </div>
      <p className="mt-2 text-base text-muted-foreground">Choose your savings days. On those days Pansy will remind you to fill your next blossom slot.</p>
      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Savings days">
        {ORDER.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={days === value}
            disabled={busy}
            onClick={() => save({ ...plan, savingsDays: value }, `Saved. Your savings days are now: ${SAVINGS_DAYS_LABEL[value]}.`)}
            className={cn(
              "min-h-[44px] rounded-full border px-4 text-sm",
              days === value ? "border-[var(--bloom-ink)] bg-[var(--bloom-ink)] text-[var(--bloom-paper)]" : "border-border text-foreground",
            )}
          >
            {SAVINGS_DAYS_LABEL[value]}
          </button>
        ))}
      </div>
      <label className="mt-5 flex min-h-[44px] items-center justify-between gap-3">
        <span>
          <span className="block text-base text-foreground">Browser and phone notifications</span>
          <span className="block text-sm text-muted-foreground">Optional. Pansy always reminds you here in the app too.</span>
        </span>
        <Switch
          checked={plan.notify ?? false}
          disabled={busy}
          onCheckedChange={async (on) => {
            if (!on) return save({ ...plan, notify: false }, "Notifications are off. Pansy will remind you in the app.");
            setBusy(true);
            const result = await enableSavingsNotifications();
            setBusy(false);
            if (result === "on") return save({ ...plan, notify: true }, "Notifications are on for your savings days.");
            setMessage(PUSH_MESSAGE[result]);
          }}
          aria-label="Browser and phone notifications"
        />
      </label>
      {message && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
