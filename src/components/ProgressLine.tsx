/** A thin gold progress rule with a count, used for lessons and modules. */
export function ProgressLine({ done, total, label }: { done: number; total: number; label?: string }) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-[var(--bloom-rule)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={label ?? "Progress"}
      >
        <div className="h-full rounded-full bg-[var(--bloom-gold)] transition-[width] duration-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {label ? `${label}: ` : ""}
        {done} of {total}
      </p>
    </div>
  );
}
