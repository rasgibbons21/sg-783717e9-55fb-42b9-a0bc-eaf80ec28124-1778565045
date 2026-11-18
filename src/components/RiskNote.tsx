import Link from "next/link";
import { BloomMark } from "@/components/brand/BloomMark";
import { cinderVaultCapitalUrl } from "@/config/ecosystem";

const COPY =
  "Bloom is for education only and isn't financial advice. Trading stocks involves risk, and you can lose money. Practice trades use simulated money, and practice results don't predict real results.";

/** The standing risk reminder. `footer` closes a page, `inline` sits inside a card or lesson. */
export function RiskNote({ variant = "inline" }: { variant?: "footer" | "inline" }) {
  if (variant === "footer") {
    const capital = cinderVaultCapitalUrl();
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
        <div className="mt-6 border-t border-[var(--bloom-rule)] pt-5">
          <p className="flex items-center justify-center gap-2 text-sm text-foreground">
            <BloomMark size={20} />
            <span className="font-serif">She Blooms Wealth</span>
          </p>
          <p className="mt-1">A product of CinderVault Enterprises Fintech Group</p>
          <p className="mt-1">
            Part of the group alongside{" "}
            {capital ? (
              <a href={capital} target="_blank" rel="noopener" className="underline underline-offset-2">
                CinderVault Capital
              </a>
            ) : (
              <span>CinderVault Capital</span>
            )}
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Cinder Vault Enterprises LLC</p>
        </div>
      </footer>
    );
  }

  return <p className="rounded-2xl bg-secondary px-4 py-3 text-xs leading-relaxed text-muted-foreground">{COPY}</p>;
}
