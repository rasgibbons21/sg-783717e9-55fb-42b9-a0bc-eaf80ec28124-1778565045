import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export function SignUpBanner() {
  return (
    <div
      className="sticky top-14 left-0 right-0 z-40 px-4 py-2.5"
      style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.12), rgba(73,176,110,0.08))", borderBottom: "1px solid rgba(39,183,200,0.15)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <UserPlus className="w-4 h-4 flex-shrink-0" style={{ color: "var(--r-teal)" }} />
          <p className="text-xs font-medium truncate" style={{ color: "var(--r-ivory)" }}>
            Sign up free to save your progress and pick up where you left off
          </p>
        </div>
        <Link href="/onboarding" className="shrink-0">
          <Button
            size="sm"
            className="h-8 px-4 text-xs font-bold rounded-lg"
            style={{ background: "var(--r-teal)", color: "var(--r-bg)" }}
          >
            Sign up free
          </Button>
        </Link>
      </div>
    </div>
  );
}
