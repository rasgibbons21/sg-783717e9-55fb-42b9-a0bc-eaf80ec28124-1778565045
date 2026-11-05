import Link from "next/link";

const COPY =
  "Bloom is for education only and isn't financial advice. Trading gold, forex and other CFDs is high risk, and you can lose money quickly. Practice trades use simulated money.";

/** The standing risk reminder. `footer` closes a page, `inline` sits inside a card or lesson. */
export function RiskNote({ variant = "inline" }: { variant?: "footer" | "inline" }) {
  if (variant === "footer") {
    return (
      <footer className="mx-auto max-w-3xl px-4 pb-6 pt-10 text-center text-xs leading-relaxed text-muted-foreground">
        <p>{COPY}</p>
        <p className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
          <Link href="/disclaimer" className="underline underline-offset-2">Disclaimer</Link>
          <Link href="/terms" className="underline underline-offset-2">Terms</Link>
          <Link href="/privacy" className="underline underline-offset-2">Privacy</Link>
          <Link href="/refund-policy" className="underline underline-offset-2">Refunds</Link>
          <Link href="/delete-account" className="underline underline-offset-2">Delete account</Link>
          <Link href="/contact" className="underline underline-offset-2">Contact</Link>
        </p>
      </footer>
    );
  }

  return <p className="rounded-2xl bg-secondary px-4 py-3 text-xs leading-relaxed text-muted-foreground">{COPY}</p>;
}
