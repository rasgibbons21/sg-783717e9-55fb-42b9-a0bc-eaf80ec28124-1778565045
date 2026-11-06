import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getInstrument } from "@/config/instruments";
import { pnlFor } from "@/lib/practice/maths";
import { money, type PracticeTrade } from "@/lib/practice/api";
import { cn } from "@/lib/utils";

interface Props {
  trade: PracticeTrade;
  currentPrice: number | null;
  onClose: (trade: PracticeTrade, reason: string) => Promise<void>;
}

export function ActiveTradeCard({ trade, currentPrice, onClose }: Props) {
  const [closing, setClosing] = useState(false);
  const instrument = getInstrument(trade.ticker);
  const decimals = instrument?.decimals ?? 2;
  const entry = Number(trade.entry_price);
  const units = Number(trade.shares);
  const pnl = currentPrice != null ? pnlFor(trade.ticker, trade.direction, entry, currentPrice, units) : null;

  const close = async () => {
    setClosing(true);
    await onClose(trade, "Closed by me");
    setClosing(false);
  };

  return (
    <article className="rounded-3xl bg-card p-4 shadow-[var(--bloom-shadow)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{instrument?.name ?? trade.ticker}</h3>
          <p className="text-sm text-muted-foreground">
            {trade.direction === "long" ? "Bought" : "Sold"} at {entry.toFixed(decimals)}
            {trade.stop_price != null && ` · Stop ${Number(trade.stop_price).toFixed(decimals)}`}
          </p>
        </div>
        <p className={cn("text-right text-lg font-semibold", pnl == null ? "text-muted-foreground" : pnl >= 0 ? "text-primary" : "text-[var(--bloom-blush)]")}>
          {pnl == null ? "..." : `${pnl >= 0 ? "+" : "-"}${money(Math.abs(pnl))}`}
          <span className="block text-xs font-normal text-muted-foreground">simulated</span>
        </p>
      </div>
      <button
        onClick={close}
        disabled={closing}
        className="mt-3 flex h-10 w-full items-center justify-center rounded-full border border-primary text-sm font-semibold text-primary transition-transform active:scale-[0.98] disabled:opacity-50"
      >
        {closing ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Closing" /> : "Close this trade"}
      </button>
    </article>
  );
}
