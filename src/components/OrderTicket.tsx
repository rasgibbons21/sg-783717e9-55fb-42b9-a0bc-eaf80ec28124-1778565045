import { useState, useEffect, useCallback, useRef } from "react";
import { X, RefreshCw, ChevronDown, ChevronUp, Sparkles, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  symbol: string;
  name: string;
}

interface Props {
  buyingPower: number;
  onClose: () => void;
  onPlaced: () => void;
}

type Dir = "long" | "short";
const STOP_PCT = 0.07;
const RISK_PRESETS = [1, 2, 5];

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

  // Optional thesis section
  const [showThesis, setShowThesis] = useState(false);
  const [thesis, setThesis] = useState("");

  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState("");

  // ── Symbol search / autocomplete ────────────────────────────────────────
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickerRef = useRef<HTMLInputElement>(null);

  const searchSymbol = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/proxy/symbol-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleTickerChange = (val: string) => {
    setTicker(val.toUpperCase());
    setQuote(null);
    setStopTouched(false);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length >= 2) {
      searchTimeout.current = setTimeout(() => searchSymbol(val), 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const selectSymbol = (result: SearchResult) => {
    setTicker(result.symbol);
    setSearchResults([]);
    setShowResults(false);
    fetchQuote(result.symbol);
  };

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

  useEffect(() => {
    if (!quote || stopTouched) return;
    const suggested = direction === "long" ? quote.price * (1 - STOP_PCT) : quote.price * (1 + STOP_PCT);
    setStop(suggested.toFixed(2));
  }, [quote, direction, stopTouched]);

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
  const canPlace =
    !!quote &&
    sh > 0 &&
    cost <= buyingPower &&
    stopSideOk &&
    stopSaneOk &&
    !placing;

  // ── Risk-based quick sizing ───────────────────────────────────────────────
  const setSharesByRisk = (pct: number) => {
    if (price <= 0 || stopN <= 0) return;
    const riskDollars = (buyingPower * pct) / 100;
    const perShareRisk = Math.abs(price - stopN);
    if (perShareRisk <= 0) return;
    const maxShares = Math.floor(riskDollars / perShareRisk);
    const affordMax = Math.floor(buyingPower / price);
    setShares(String(Math.min(maxShares, affordMax)));
  };

  const setMaxShares = () => {
    if (price > 0) setShares(String(Math.floor(buyingPower / price)));
  };

  // ── Place ─────────────────────────────────────────────────────────────────
  const place = async () => {
    if (!canPlace) return;
    setPlacing(true);
    setErr("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { setErr("Session expired — please sign in again."); setPlacing(false); return; }
      const res = await fetch("/api/practice/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ticker: ticker.toUpperCase().trim(),
          direction,
          shares: sh,
          stop_price: stopN,
          target_price: targetN > 0 ? targetN : undefined,
          thesis: thesis.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onPlaced();
        return;
      }
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-background rounded-2xl border border-accent/30 my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-accent/10">
          <h2 className="font-serif text-lg font-bold text-foreground">New Trade</h2>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Ticker + direction */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
                <input
                  ref={tickerRef}
                  value={ticker}
                  onChange={(e) => handleTickerChange(e.target.value)}
                  onBlur={() => { setTimeout(() => setShowResults(false), 200); if (ticker && !showResults) fetchQuote(ticker); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { setShowResults(false); fetchQuote(ticker); } }}
                  onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                  placeholder="Search company or ticker"
                  autoFocus
                  className="w-full bg-card border border-accent/20 rounded-lg pl-8 pr-3 py-2.5 text-foreground text-sm uppercase focus:outline-none focus:border-accent"
                />
                {searchLoading && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                )}
              </div>
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-card border border-accent/20 rounded-lg overflow-hidden shadow-xl max-h-52 overflow-y-auto">
                  {searchResults.map((r) => (
                    <button
                      key={r.symbol}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectSymbol(r)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/10 transition-colors border-b border-accent/5 last:border-0"
                    >
                      <span className="font-mono font-bold text-sm text-accent w-14 shrink-0">{r.symbol}</span>
                      <span className="text-xs text-foreground/60 truncate">{r.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex rounded-lg overflow-hidden border border-accent/20">
              {(["long", "short"] as Dir[]).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDirection(d); setStopTouched(false); }}
                  className={`px-4 py-2.5 text-xs font-semibold capitalize ${
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
                  <p className="text-xs text-foreground/50">Market price</p>
                  <p className="text-xl font-bold text-foreground font-mono">{fmt(quote.price)}</p>
                  <p className="text-[10px] text-foreground/30">{ageSec}s ago</p>
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
              {/* Stop */}
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">Stop price</label>
                <input
                  type="number" min="0" step="any"
                  value={stop}
                  onChange={(e) => { setStop(e.target.value); setStopTouched(true); }}
                  className="w-full bg-card border border-accent/20 rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent"
                />
                {!stopTouched && stop && (
                  <p className="text-[10px] text-accent/70 mt-1">
                    Pansy set a 7% starting stop — adjust to your plan.
                  </p>
                )}
                {stopN > 0 && !stopSideOk && (
                  <p className="text-[10px] text-destructive mt-1">
                    {direction === "long" ? "Stop must be below entry." : "Stop must be above entry."}
                  </p>
                )}
              </div>

              {/* Shares + quick risk sizing */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-foreground/50">Shares</label>
                  <button onClick={setMaxShares} className="text-[10px] text-accent hover:underline">Max</button>
                </div>
                <input
                  type="number" min="0" step="any"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="0"
                  className="w-full bg-card border border-accent/20 rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent"
                />

                {/* Risk preset buttons */}
                {stopSideOk && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-foreground/30">Risk:</span>
                    {RISK_PRESETS.map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setSharesByRisk(pct)}
                        className="px-2.5 py-1 rounded-md text-[10px] font-semibold border border-accent/20 text-foreground/60 hover:border-accent/40 hover:text-accent transition-colors"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                )}

                {sh > 0 && (
                  <div className="flex justify-between mt-1.5 text-xs">
                    <span className="text-foreground/50">Cost: <span className="font-mono text-foreground">{fmt(cost)}</span></span>
                    <span className={bpAfter < 0 ? "text-destructive" : "text-foreground/50"}>
                      Left: <span className="font-mono">{fmt(bpAfter)}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Target (optional, inline) */}
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">Target <span className="text-foreground/30">(optional)</span></label>
                <input
                  type="number" min="0" step="any"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Take-profit price"
                  className="w-full bg-card border border-accent/20 rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent"
                />
                {dollarRisk != null && (
                  <div className="flex justify-between mt-1.5 text-xs">
                    <span className="text-foreground/50">
                      Risk: <span className="font-mono text-foreground">{fmt(dollarRisk)}</span>
                    </span>
                    <span className="text-foreground/50">
                      R/R: <span className="font-mono text-foreground">{rr != null ? `1 : ${rr.toFixed(1)}` : "—"}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Thesis toggle — optional, collapsible */}
              <div>
                <button
                  onClick={() => setShowThesis(!showThesis)}
                  className="flex items-center gap-2 text-xs text-accent/70 hover:text-accent transition-colors w-full"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Add your thesis</span>
                  <span className="text-foreground/20 text-[10px]">(optional — helps Pansy coach you later)</span>
                  {showThesis ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                </button>
                {showThesis && (
                  <textarea
                    value={thesis}
                    onChange={(e) => setThesis(e.target.value)}
                    rows={2}
                    placeholder="Why this trade? What has to be true?"
                    className="mt-2 w-full bg-card border border-accent/20 rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent resize-none"
                  />
                )}
              </div>

              {/* Pansy trade coaching */}
              {(() => {
                const tips: { text: string; severity: "warn" | "tip" | "good" }[] = [];

                const bpPct = price > 0 && sh > 0 ? (cost / buyingPower) * 100 : 0;
                if (bpPct > 50) tips.push({ text: `You're putting ${Math.round(bpPct)}% of your buying power into one trade. Consider sizing down — most pros risk 1-5% per trade.`, severity: "warn" });
                else if (bpPct > 25) tips.push({ text: `${Math.round(bpPct)}% of buying power on one trade is aggressive. Make sure you're comfortable with the risk.`, severity: "tip" });

                if (sh > 0 && stopN <= 0) tips.push({ text: "No stop loss = no exit plan. Every trade needs a level where your thesis is wrong.", severity: "warn" });
                if (stopN > 0 && !stopSideOk) tips.push({ text: `Your stop is on the wrong side of entry. ${direction === "long" ? "For a long, stop goes below entry." : "For a short, stop goes above entry."}`, severity: "warn" });
                if (stopN > 0 && stopSideOk && price > 0) {
                  const stopPct = Math.abs(price - stopN) / price * 100;
                  if (stopPct > 20) tips.push({ text: `Your stop is ${stopPct.toFixed(1)}% away — that's a wide stop. Are you sure you want that much risk per share?`, severity: "tip" });
                  else if (stopPct < 1) tips.push({ text: `Stop is only ${stopPct.toFixed(1)}% away — very tight. You might get stopped out by normal price movement.`, severity: "tip" });
                }

                if (rr != null && rr < 1) tips.push({ text: `R/R is 1:${rr.toFixed(1)} — you're risking more than you could gain. Aim for at least 1:1.5.`, severity: "warn" });
                else if (rr != null && rr >= 1 && rr < 1.5) tips.push({ text: `R/R is 1:${rr.toFixed(1)} — not bad, but 1:2 or better gives you room to be wrong and still profit overall.`, severity: "tip" });
                else if (rr != null && rr >= 2) tips.push({ text: `R/R of 1:${rr.toFixed(1)} — solid setup! Even if you're wrong half the time, the math works in your favor.`, severity: "good" });

                if (sh > 0 && !showThesis) tips.push({ text: "Write a thesis! Trades without a plan are just gambling. What has to be true for this to work?", severity: "tip" });

                if (dollarRisk != null && dollarRisk > buyingPower * 0.05) tips.push({ text: `You're risking $${dollarRisk.toFixed(2)} (${((dollarRisk / buyingPower) * 100).toFixed(1)}% of your account). Most pros keep risk under 2% per trade.`, severity: "warn" });

                if (tips.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🌺</span>
                      <span className="text-[10px] font-semibold text-accent/70 uppercase tracking-wider">Pansy&apos;s Notes</span>
                    </div>
                    {tips.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs leading-relaxed"
                        style={{
                          background: tip.severity === "warn" ? "rgba(239,68,68,0.08)" : tip.severity === "good" ? "rgba(132,204,22,0.08)" : "rgba(39,183,200,0.08)",
                          border: `1px solid ${tip.severity === "warn" ? "rgba(239,68,68,0.15)" : tip.severity === "good" ? "rgba(132,204,22,0.15)" : "rgba(39,183,200,0.15)"}`,
                          color: tip.severity === "warn" ? "#fca5a5" : tip.severity === "good" ? "#bef264" : "rgba(255,255,255,0.6)",
                        }}
                      >
                        <span className="shrink-0 mt-0.5">{tip.severity === "warn" ? "⚠️" : tip.severity === "good" ? "✅" : "💡"}</span>
                        <span>{tip.text}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {err && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{err}</p>}
            </>
          )}
        </div>

        {/* Sticky footer */}
        {quote && (
          <div className="p-4 border-t border-accent/10">
            <button
              onClick={place}
              disabled={!canPlace}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {placing ? "Placing…" : direction === "long"
                ? `Buy ${sh > 0 ? sh + " " : ""}${ticker || ""}`.trim()
                : `Short ${sh > 0 ? sh + " " : ""}${ticker || ""}`.trim()}
            </button>
            {!canPlace && sh > 0 && cost > buyingPower && (
              <p className="text-[10px] text-destructive text-center mt-2">Not enough buying power</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
