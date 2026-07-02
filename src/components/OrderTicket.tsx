import { useState, useEffect, useCallback } from "react";
import { X, RefreshCw } from "lucide-react";

interface Props {
  buyingPower: number;
  onClose: () => void;
  onPlaced: () => void;
}

type Dir = "long" | "short";
const TRENDS = ["Uptrend", "Downtrend", "Sideways"];
const PATTERNS = ["Breakout", "Pullback", "Reversal", "Support bounce", "Resistance reject", "Other"];
const STOP_PCT = 0.07; // Pansy's suggested starting stop distance

const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export function OrderTicket({ buyingPower, onClose, onPlaced }: Props) {
  const [ticker, setTicker] = useState("");
  const [direction, setDirection] = useState<Dir>("long");
  const [quote, setQuote] = useState<{ price: number; ts: number } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteErr, setQuoteErr] = useState("");
  const [ageSec, setAgeSec] = useState(0);

  const [shares, setShares] = useState("");
  const [stop, setStop] = useState("");
  const [stopTouched, setStopTouched] = useState(false);
  const [target, setTarget] = useState("");
  const [thesis, setThesis] = useState("");
  const [trend, setTrend] = useState("");
  const [pattern, setPattern] = useState("");

  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState("");

  // ── Live quote ──────────────────────────────────────────────────────────
  const fetchQuote = useCallback(async (sym: string) => {
    if (!/^[A-Za-z0-9]{1,10}$/.test(sym)) return;
    setQuoteLoading(true);
    setQuoteErr("");
    try {
      const res = await fetch(`/api/proxy/finnhub-quote?ticker=${sym.toUpperCase()}`);
      const data = await res.json();
      const price = Number(data?.c);
      if (!res.ok || !price || price <= 0) {
        setQuote(null);
        setQuoteErr("Couldn't get a price for that ticker.");
      } else {
        setQuote({ price, ts: Date.now() });
      }
    } catch {
      setQuote(null);
      setQuoteErr("Couldn't reach the market right now.");
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  // Prefill Pansy's suggested stop when a fresh quote arrives (until user edits it)
  useEffect(() => {
    if (!quote || stopTouched) return;
    const suggested = direction === "long" ? quote.price * (1 - STOP_PCT) : quote.price * (1 + STOP_PCT);
    setStop(suggested.toFixed(2));
  }, [quote, direction, stopTouched]);

  // "quote as of Xs ago" ticker
  useEffect(() => {
    if (!quote) return;
    const id = setInterval(() => setAgeSec(Math.round((Date.now() - quote.ts) / 1000)), 1000);
    setAgeSec(0);
    return () => clearInterval(id);
  }, [quote]);

  // ── Derived numbers ───────────────────────────────────────────────────────
  const price = quote?.price ?? 0;
  const sh = parseFloat(shares) || 0;
  const stopN = parseFloat(stop) || 0;
  const targetN = parseFloat(target) || 0;
  const cost = sh * price;
  const bpAfter = buyingPower - cost;
  const dollarRisk = stopN > 0 && sh > 0 ? Math.abs(price - stopN) * sh : null;
  const rr =
    targetN > 0 && stopN > 0 && Math.abs(price - stopN) > 0
      ? Math.abs(targetN - price) / Math.abs(price - stopN)
      : null;

  // ── Validation ────────────────────────────────────────────────────────────
  const stopSideOk =
    stopN > 0 && (direction === "long" ? stopN < price : stopN > price);
  const stopSaneOk = stopN > 0 && price > 0 && Math.abs(price - stopN) / price <= 0.5;
  const stopVeryTight = stopN > 0 && price > 0 && Math.abs(price - stopN) / price < 0.005;
  const canPlace =
    !!quote &&
    sh > 0 &&
    cost <= buyingPower &&
    stopSideOk &&
    stopSaneOk &&
    thesis.trim().length >= 10 &&
    !!trend &&
    !!pattern &&
    !placing;

  const stopHint = !stop
    ? ""
    : !stopSideOk
      ? direction === "long"
        ? "A long's stop sits below your entry."
        : "A short's stop sits above your entry."
      : !stopSaneOk
        ? "That stop is more than 50% away — check for a typo."
        : stopVeryTight
          ? "Very tight — you may get shaken out."
          : "";

  const setMaxShares = () => {
    if (price > 0) setShares(String(Math.floor(buyingPower / price)));
  };

  // ── Place ─────────────────────────────────────────────────────────────────
  const place = async () => {
    if (!canPlace) return;
    setPlacing(true);
    setErr("");
    const composedThesis = `[Trend: ${trend} · Pattern: ${pattern}] ${thesis.trim()}`;
    try {
      const res = await fetch("/api/practice/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: ticker.toUpperCase().trim(),
          direction,
          shares: sh,
          stop_price: stopN,
          target_price: targetN > 0 ? targetN : undefined,
          thesis: composedThesis,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onPlaced();
        return;
      }
      // Structured insufficient-buying-power → re-quote inline with the fresh fill
      if (typeof data.fill_price === "number") {
        setQuote({ price: data.fill_price, ts: Date.now() });
        if (typeof data.cost === "number" && typeof data.buying_power === "number") {
          setErr(
            `Price moved to ${fmt(data.fill_price)} — that's ${fmt(data.cost)}, over your ${fmt(
              data.buying_power
            )} buying power. Lower your shares.`
          );
        } else {
          setErr(data.error || "Adjust your order and try again.");
        }
      } else {
        setErr(data.error || "Couldn't place that trade.");
      }
    } catch {
      setErr("Network error — please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const chip = (val: string, sel: string, set: (v: string) => void, options: string[], label: string) => (
    <div>
      <label className="text-xs text-foreground/50 mb-1.5 block">{label} *</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => set(o)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              sel === o
                ? "border-accent bg-accent/15 text-accent"
                : "border-accent/20 text-foreground/60 hover:border-accent/40"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-background rounded-2xl border border-accent/30 my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-accent/10">
          <h2 className="font-serif text-lg font-bold text-foreground">New Trade</h2>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Ticker + direction */}
          <div className="flex gap-2">
            <input
              value={ticker}
              onChange={(e) => { setTicker(e.target.value.toUpperCase()); setQuote(null); setStopTouched(false); }}
              onBlur={() => ticker && fetchQuote(ticker)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchQuote(ticker); }}
              placeholder="Ticker (e.g. AAPL)"
              className="flex-1 bg-card border border-accent/20 rounded-lg px-3 py-2 text-foreground text-sm uppercase focus:outline-none focus:border-accent"
            />
            <div className="flex rounded-lg overflow-hidden border border-accent/20">
              {(["long", "short"] as Dir[]).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDirection(d); setStopTouched(false); }}
                  className={`px-3 py-2 text-xs font-semibold capitalize ${
                    direction === d ? (d === "long" ? "bg-primary text-primary-foreground" : "bg-destructive text-white") : "text-foreground/50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Live price */}
          <div className="rounded-xl bg-card border border-accent/10 px-4 py-3 flex items-center justify-between">
            {quoteLoading ? (
              <span className="text-sm text-foreground/50">Getting live price…</span>
            ) : quote ? (
              <>
                <div>
                  <p className="text-xs text-foreground/50">Market — fills at ~</p>
                  <p className="text-lg font-bold text-foreground font-mono">{fmt(quote.price)}</p>
                  <p className="text-[10px] text-foreground/40">quote as of {ageSec}s ago</p>
                </div>
                <button onClick={() => fetchQuote(ticker)} className="text-accent hover:text-accent/80" title="Refresh quote">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </>
            ) : (
              <span className="text-sm text-foreground/40">{quoteErr || "Enter a ticker to get a live price."}</span>
            )}
          </div>

          {quote && (
            <>
              {/* Shares + cost */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-foreground/50">Shares *</label>
                  <button onClick={setMaxShares} className="text-[10px] text-accent hover:underline">Max</button>
                </div>
                <input
                  type="number" min="0" step="any"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="0"
                  className="w-full bg-card border border-accent/20 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent"
                />
                <div className="flex justify-between mt-1.5 text-xs">
                  <span className="text-foreground/50">Cost: <span className="font-mono text-foreground">{fmt(cost)}</span></span>
                  <span className={bpAfter < 0 ? "text-destructive" : "text-foreground/50"}>
                    Buying power after: <span className="font-mono">{fmt(bpAfter)}</span>
                  </span>
                </div>
              </div>

              {/* Stop (mandatory) */}
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">Stop *</label>
                <input
                  type="number" min="0" step="any"
                  value={stop}
                  onChange={(e) => { setStop(e.target.value); setStopTouched(true); }}
                  className="w-full bg-card border border-accent/20 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent"
                />
                {!stopTouched && (
                  <p className="text-[10px] text-accent/80 mt-1 leading-relaxed">
                    🌸 Pansy&apos;s suggested starting point — adjust it to your own plan. This isn&apos;t a recommendation, just a place to begin.
                  </p>
                )}
                {stopHint && <p className={`text-[10px] mt-1 ${stopVeryTight ? "text-yellow-400" : "text-destructive"}`}>{stopHint}</p>}
              </div>

              {/* Target (optional) + risk/RR */}
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">Target (optional)</label>
                <input
                  type="number" min="0" step="any"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-card border border-accent/20 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent"
                />
                <div className="flex justify-between mt-1.5 text-xs">
                  <span className="text-foreground/50">
                    Risk: <span className="font-mono text-foreground">{dollarRisk != null ? fmt(dollarRisk) : "—"}</span>
                  </span>
                  <span className="text-foreground/50">
                    R/R: <span className="font-mono text-foreground">{rr != null ? `1 : ${rr.toFixed(1)}` : "add a target"}</span>
                  </span>
                </div>
              </div>

              {/* Intentionality */}
              {chip(trend, trend, setTrend, TRENDS, "The trend")}
              {chip(pattern, pattern, setPattern, PATTERNS, "Entry signal")}
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">Your thesis * <span className="text-foreground/30">(min 10 chars)</span></label>
                <textarea
                  value={thesis}
                  onChange={(e) => setThesis(e.target.value)}
                  rows={2}
                  placeholder="Why this trade? What has to be true for it to work?"
                  className="w-full bg-card border border-accent/20 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {err && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{err}</p>}
            </>
          )}
        </div>

        {/* Sticky footer */}
        {quote && (
          <div className="p-4 border-t border-accent/10 flex items-center gap-3">
            <div className="text-xs text-foreground/50 flex-1">
              {dollarRisk != null && <>Risk <span className="font-mono text-foreground">{fmt(dollarRisk)}</span></>}
            </div>
            <button
              onClick={place}
              disabled={!canPlace}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {placing ? "Placing…" : `Buy ${sh > 0 ? sh : ""} ${ticker || ""}`.trim()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
