import { Check, Sprout } from "lucide-react";

/** Kind feedback after an answer. A wrong answer is a nudge to try again, never a penalty. */
export function Feedback({ good, children }: { good: boolean; children: React.ReactNode }) {
  return (
    <div
      role="status"
      style={{ animationDuration: "250ms" }}
      className={`bloom-rise mt-4 flex gap-3 rounded-2xl p-4 text-base leading-relaxed text-foreground ${good ? "bg-[#E6ECE3]" : "bg-accent/70"}`}
    >
      {good ? <Check className="mt-1 h-5 w-5 shrink-0 text-primary" /> : <Sprout className="mt-1 h-5 w-5 shrink-0 text-primary" />}
      <div>{children}</div>
    </div>
  );
}
