import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { Instrument } from "@/config/instruments";
import { lotsToUnits, marginFor, pnlFor, type Direction } from "@/lib/practice/maths";
import { money, practiceFetch } from "@/lib/practice/api";
import { cn } from "@/lib/utils";

const LOT_CHOICES = [0.01, 0.02, 0.05, 0.1, 0.5];

interface Props {
  instrument: Instrument;
  price: number | null;
  marketOpen: boolean;
  buyingPower: number;
  balance: number;
  onPlaced: () => void;
}

export function OrderTicket({ instrument, price, marketOpen, buyingPower, balance, onPlaced }: Props) {
  const [direction, setDirection] = useState<Direction>("long");
  const [lots, setLots] = useState(0.01);
  const [stop, setStop] = useState("");
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<{ good: boolean; text: string } | null>(null);

  useEffect(() => {
    setStop("");
    setLots(0.01);
    setMessage(null);
  }, [instrument.symbol]);

  const units = lotsToUnits(instrument.symbol, lots);
  const stopValue = Number(stop);
  const stopOnRightSide = price != null && stopValue > 0 && (direction === "long" ? stopValue < price : stopValue > price);
  const margin = price != null ? marginFor(instrument.symbol, price, units) : null;
  const risk = stopOnRightSide && price != null ? Math.abs(pnlFor(instrument.symbol, direction, price, stopValue, units)) : null;
  const riskPercent = risk != null && balance > 0 ? (risk / balance) * 100 : null;
  const canPlace = marketOpen && price != null && stopOnRightSide && !placing;

  const place = async () => {
    setPlacing(true);
    setMessage(null);
    const { ok, data } = await practiceFetch("/api/practice/trades", {
      method: "POST",
      body: JSON.stringify({ ticker: instrument.symbol, direction, lots, stop_price: stopValue }),
    });
    setPlacing(false);
    if (!ok) {
      setMessage({ good: false, text: data.error ?? "That didn't go through. Nothing has been charged, so please try again." });
      return;
    }
    try {
      navigator?.vibrate?.(12);
    } catch {
      // Vibration isn't available on every device.
    }
    setStop("");
    setMessage({ good: true, text: "Your practice trade is open. Well done for setting a stop." });
    onPlaced();
  };

  return (
    <section className="rounded-3xl bg-card p-5 shadow-[var(--bloom-shadow)]" aria-label="New practice trade">
      <h2 className="text-xl font-semibold text-foreground">Try a practice trade</h2>

      <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Direction">
        {(
          [
            ["long", "Buy", "If you think it may rise"],
            ["short", "Sell", "If you think it may fall"],
          ] as const
        ).map(([value, label, hint]) => (
          <motion.button
            key={value}
            whileTap={{ scale: 0.97 }}
            aria-pressed={direction === value}
            onClick={() => setDirection(value)}
            className={cn(
              "rounded-2xl border p-3 text-left",
              direction === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground",
            )}
          >
            <span className="block font-semibold">{label}</span>
            <span className="block text-xs opacity-80">{hint}</span>
          </motion.button>
        ))}
      </div>

      <p className="mt-5 text-sm font-semibold text-foreground">Size</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {LOT_CHOICES.map((choice) => (
          <button
            key={choice}
            aria-pressed={lots === choice}
            onClick={() => setLots(choice)}
            className={cn(
              "h-10 rounded-full border px-4 text-sm font-medium transition-transform active:scale-95",
              lots === choice ? "border-primary bg-accent text-foreground" : "border-border text-muted-foreground",
            )}
          >
            {choice}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {lots} lot is {units.toLocaleString("en-US")} {instrument.unitName}
        {units === 1 ? "" : "s"}
        {instrument.assetClass === "metal" ? ` of ${instrument.name.toLowerCase()}` : ""}.
        {margin != null && ` It sets aside about ${money(margin)} of your simulated money.`}
      </p>

      <label className="mt-5 block text-sm font-semibold text-foreground">
        Your stop
        <input
          type="number"
          inputMode="decimal"
          step="any"
          value={stop}
          onChange={(event) => setStop(event.target.value)}
          placeholder={price != null ? `A price ${direction === "long" ? "below" : "above"} ${price.toFixed(instrument.decimals)}` : "Price"}
          className="mt-1 h-12 w-full rounded-2xl border border-border bg-background px-4 text-base font-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <p className="mt-2 text-sm text-muted-foreground">
        {risk != null && riskPercent != null
          ? `If your stop is reached, you'd lose about ${money(risk)}, which is ${riskPercent.toFixed(1)}% of your balance.`
          : stop && !stopOnRightSide
            ? `When you ${direction === "long" ? "buy" : "sell"}, your stop needs to be ${direction === "long" ? "below" : "above"} the current price.`
            : "A stop closes your trade at a price you choose, so you decide your loss while you're calm."}
      </p>

      {riskPercent != null && riskPercent > 2 && (
        <p className="mt-2 rounded-2xl bg-accent/70 p-3 text-sm text-foreground">
          That's more than 2% of your balance on one trade. A smaller size or closer stop would be gentler.
        </p>
      )}

      {message && (
        <p role="status" className={cn("mt-3 rounded-2xl p-3 text-sm text-foreground", message.good ? "bg-[#E6ECE3]" : "bg-accent/70")}>
          {message.text}
        </p>
      )}

      <motion.button
        whileTap={canPlace ? { scale: 0.97 } : undefined}
        disabled={!canPlace}
        onClick={place}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground disabled:opacity-40"
      >
        {placing ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Placing" /> : !marketOpen ? "The market is resting" : `Place practice ${direction === "long" ? "buy" : "sell"}`}
      </motion.button>
      <p className="mt-2 text-center text-xs text-muted-foreground">Simulated money. Available to use: {money(buyingPower)}</p>
    </section>
  );
}
