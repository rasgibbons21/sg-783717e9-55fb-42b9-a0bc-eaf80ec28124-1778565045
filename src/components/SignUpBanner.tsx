import Link from "next/link";

export function SignUpBanner() {
  return (
    <div className="border-b border-border bg-accent/60 px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <p className="text-sm text-foreground">Join free to save your progress as you learn.</p>
        <Link
          href="/onboarding"
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          Start free
        </Link>
      </div>
    </div>
  );
}
