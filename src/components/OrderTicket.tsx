import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Minus, Plus } from "lucide-react";
import type { Levels } from "@/components/charts/ChartStage";
import type { Instrument } from "@/config/instruments";
import { SETUP_TYPES, TIMEFRAMES, type SetupType, type Timeframe } from "@/config/setups";
import { riskReward } from "@/lib/charts/detectors";
import { marginFor, pnlFor, riskPct, type Direction } from "@/lib/practice/maths";
import { money, practiceFetch } from "@/lib/practice/api";
import { cn } from "@/lib/utils";

interface Props {
  instrument: Instrument;
  price: number | null;
  marketOpen: boolean;
  buyingPower: number;
  balance: number;
  /** Lines dragged on the chart, which fill the stop and target. */
  levels: Levels;
  timeframe: Timeframe;
  onPlaced: () => void;
  /** The setup a lesson asked Practice to open with. */
  initialSetup?: SetupType;
}

const fieldClass =
  "mt-1 h-12 w-full rounded-2xl border border-border bg-secondary px-4 text-base font-normal text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export function OrderTicket({ instrument, price, marketOpen, buyingPower, balance, levels, timeframe: chartTimeframe, onPlaced, initialSetup }: Props) {
  const [direction, setDirection] = useState<Direction>("long");
  const [shares, setShares] = useState(1);
  const [stop, setStop] = useState("");
  const [target, setTarget] = useState("");
  const [setup, setSetup] = useState<SetupType>(initialSetup ?? "FVG");

  useEffect(() => {
    if (initialSetup) setSetup(initialSetup);
  }, [initialSetup]);
  const [timeframe, setTimeframe] = useState<Timeframe>(chartTimeframe);
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState<{ good: boolean; text: string } | null>(null);

  useEffect(() => {
    setStop("");
    setTarget("");
    setShares(1);
    setMessage(null);
  }, [instrument.symbol]);

  useEffect(() => setTimeframe(chartTimeframe), [chartTimeframe]);

  // Lines dragged on the chart fill the plan.
  useEffect(() => {
    if (levels.stop !== undefined) setStop(levels.stop.toFixed(2));
    if (levels.target !== undefined) setTarget(levels.target.toFixed(2));
    if (levels.stop !== undefined && levels.entry !== undefined) setDirection(levels.stop < levels.entry ? "long" : "short");
  }, [levels.stop, levels.target, levels.entry]);

  const stopValue = Number(stop);
  const targetValue = target ? Number(target) : null;
  const stopOnRightSide = price != null && stopValue > 0 && (direction === "long" ? stopValue < price : stopValue > price);
  const cost = price != null ? marginFor(instrument.symbol, price, shares) : null;
  const risk = stopOnRightSide && price != null ? Math.abs(pnlFor(instrument.symbol, direction, price, stopValue, shares)) : null;
  // Measured against available cash, exactly as the server records it for the process score.
  const riskPercent = risk != null ? riskPct(risk, buyingPower) : null;
  const targetOnRightSide = !targetValue || (price != null && (direction === "long" ? targetValue > price : targetValue < price));
  const rr = price != null && stopOnRightSide && targetValue ? riskReward(price, stopValue, targetValue) : null;
  const canPlace = marketOpen && price != null && stopOnRightSide && targetOnRightSide && !placing;

  const place = async () => {
    setPlacing(true);
    setMessage(null);
    const { ok, data } = await practiceFetch("/api/practice/trades", {
      method: "POST",
      body: JSON.stringify({
        ticker: instrument.symbol,
        direction,
        shares,
        stop_price: stopValue,
        target_price: targetValue,
        setup_type: setup,
        timeframe,
        thesis: note.trim() || null,
      }),
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
    setNote("");
    setMessage({ good: true, text: "Your practice trade is open, with its plan recorded." });
    onPlaced();
  };

  return (
    <section className="rounded-3xl border border-[var(--bloom-rule)] bg-card p-5" aria-label="New practice trade">
      <h2 className="text-2xl text-foreground">Plan the trade</h2>

      <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Direction">
        {(
          [
            ["long", "Buy", "You expect it may rise"],
            ["short", "Sell", "You expect it may fall"],
          ] as const
        ).map(([value, label, hint]) => (
          <motion.button
            key={value}
            whileTap={{ scale: 0.97 }}
            type="button"
            aria-pressed={direction === value}
            onClick={() => setDirection(value)}
            className={cn(
              "rounded-2xl border p-3 text-left",
              direction === value ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground",
            )}
          >
            <span className="block font-semibold">{label}</span>
            <span className="block text-xs opacity-80">{hint}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-foreground">
          Setup
          <select value={setup} onChange={(e) => setSetup(e.target.value as SetupType)} className={fieldClass}>
            {SETUP_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-foreground">
          Timeframe
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value as Timeframe)} className={fieldClass}>
            {TIMEFRAMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-5 text-sm font-medium text-foreground">Shares</p>
      <div className="mt-1 flex items-center gap-3">
        <button type="button" aria-label="Fewer shares" onClick={() => setShares((n) => Math.max(1, n - 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-border active:scale-90">
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={shares}
          onChange={(e) => setShares(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
          aria-label="Number of shares"
          className="h-11 w-20 rounded-2xl border border-border bg-secondary text-center text-base text-foreground"
        />
        <button type="button" aria-label="More shares" onClick={() => setShares((n) => n + 1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-border active:scale-90">
          <Plus className="h-4 w-4" />
        </button>
        {cost != null && <span className="text-sm text-muted-foreground">Costs about {money(cost)}</span>}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-foreground">
          Stop
          <input type="number" inputMode="decimal" step="any" value={stop} onChange={(e) => setStop(e.target.value)} className={fieldClass} placeholder={direction === "long" ? "Below price" : "Above price"} />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Target (optional)
          <input type="number" inputMode="decimal" step="any" value={target} onChange={(e) => setTarget(e.target.value)} className={fieldClass} />
        </label>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-secondary p-3 text-center text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Risk</dt>
          <dd className="font-medium text-foreground">{risk != null ? money(risk) : "-"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Of balance</dt>
          <dd className={cn("font-medium", riskPercent != null && riskPercent > 1 ? "text-[var(--bloom-blush)]" : "text-foreground")}>
            {riskPercent != null ? `${riskPercent.toFixed(1)}%` : "-"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Reward to risk</dt>
          <dd className={cn("font-medium", rr != null && rr >= 1.5 ? "text-[var(--bloom-sage-text)]" : "text-foreground")}>{rr != null ? `1 : ${rr.toFixed(1)}` : "-"}</dd>
        </div>
      </dl>
      {!targetOnRightSide && (
        <p className="mt-2 text-sm text-foreground">When you {direction === "long" ? "buy" : "sell"}, your target needs to be {direction === "long" ? "above" : "below"} the current price.</p>
      )}
      {stop && !stopOnRightSide && price != null && (
        <p className="mt-2 text-sm text-foreground">When you {direction === "long" ? "buy" : "sell"}, your stop needs to be {direction === "long" ? "below" : "above"} the current price.</p>
      )}

      <label className="mt-4 block text-sm font-medium text-foreground">
        Your reasoning
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="For example: 1H rising, sweep of the lows, bullish gap on the 5m."
          className="mt-1 w-full rounded-2xl border border-border bg-secondary p-3 text-base text-foreground outline-none focus:border-primary"
        />
      </label>
      <p className="mt-1 text-xs text-muted-foreground">Practice orders fill at the current price. A stop, a reward at least 1.5 times the risk, 1% risk or less and a note each add to your process score.</p>

      {message && (
        <p role="status" className={cn("mt-3 rounded-2xl p-3 text-sm text-foreground", message.good ? "bg-[rgba(143,160,136,0.18)]" : "bg-accent")}>
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
