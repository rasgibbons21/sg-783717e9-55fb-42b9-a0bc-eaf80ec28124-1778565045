import { useState, useEffect, useCallback } from "react";
import { X, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import { CandlestickChart, type OHLCBar } from "@/components/CandlestickChart";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────
export interface ChecklistResult {
  ticker: string;
  direction: "long" | "short";
  shares: number;
  entry_price: number;
  stop_price?: number;
  target_price?: number;
  thesis: string;
}

interface Props {
  onSubmit: (result: ChecklistResult) => Promise<void>;
  onClose: () => void;
}

// ── Form state ─────────────────────────────────────────────────────────────
interface Form {
  ticker: string;
  direction: "long" | "short";
  thesis: string;
  trend: string;
  pattern: string;
  patternDetail: string;
  candlestick: string;
  indicator: string;
  support: string;
  resistance: string;
  shares: string;
  entryPrice: string;
  stopPrice: string;
  targetPrice: string;
}

const INITIAL: Form = {
  ticker: "", direction: "long", thesis: "", trend: "",
  pattern: "", patternDetail: "", candlestick: "", indicator: "",
  support: "", resistance: "", shares: "", entryPrice: "", stopPrice: "", targetPrice: "",
};

// ── Options ────────────────────────────────────────────────────────────────
const TRENDS = ["Uptrend", "Downtrend", "Sideways range", "Counter-trend bounce"];

const PATTERNS = [
  "Breakout above resistance", "Breakdown below support", "Bull flag / pennant",
  "Bear flag / pennant", "Pullback to support", "Bounce from support",
  "Cup & handle", "Double bottom", "Double top", "Head & shoulders",
  "Inverse head & shoulders", "Ascending / descending triangle",
  "Rising / falling wedge", "Channel trade", "Gap fill", "No clear pattern / other",
];

const CANDLESTICKS = [
  "Bullish engulfing", "Bearish engulfing", "Hammer / pin bar",
  "Shooting star / inverted hammer", "Doji reversal", "Morning star",
  "Evening star", "Marubozu (strong momentum candle)", "Inside bar breakout",
  "No specific candlestick / other",
];

// ── Helpers ────────────────────────────────────────────────────────────────
function inputCls(hasValue: boolean) {
  return `w-full bg-[#0E1B30] border ${hasValue ? "border-[#27B7C8]/40" : "border-[#27B7C8]/15"} rounded-lg px-3 py-2.5 text-[#F4F7FA] text-sm focus:outline-none focus:border-[#27B7C8] transition-colors`;
}


function chipCls(selected: boolean) {
  return `px-3 py-1.5 rounded-full text-xs border transition-colors cursor-pointer select-none ${
    selected
      ? "bg-[#27B7C8]/20 border-[#27B7C8] text-[#27B7C8]"
      : "bg-[#0E1B30] border-[#27B7C8]/15 text-[#F4F7FA]/50 hover:border-[#27B7C8]/40 hover:text-[#F4F7FA]/80"
  }`;
}

function calcRR(form: Form): { risk: number; reward: number; ratio: number } | null {
  const entry = parseFloat(form.entryPrice);
  const stop = parseFloat(form.stopPrice);
  const target = parseFloat(form.targetPrice);
  if (!entry || !stop || !target || isNaN(entry) || isNaN(stop) || isNaN(target)) return null;

  const risk = form.direction === "long"
    ? entry - stop
    : stop - entry;
  const reward = form.direction === "long"
    ? target - entry
    : entry - target;

  if (risk <= 0 || reward <= 0) return null;
  return { risk, reward, ratio: reward / risk };
}

function compileThesis(f: Form): string {
  const parts: string[] = [];
  if (f.thesis) parts.push(`Thesis: ${f.thesis}`);
  if (f.trend) parts.push(`Trend: ${f.trend}`);
  if (f.pattern) {
    const p = f.patternDetail ? `${f.pattern} — ${f.patternDetail}` : f.pattern;
    parts.push(`Pattern: ${p}`);
  }
  const sig: string[] = [];
  if (f.candlestick) sig.push(f.candlestick);
  if (f.indicator) sig.push(f.indicator);
  if (sig.length) parts.push(`Signal: ${sig.join(" / ")}`);
  const lvl: string[] = [];
  if (f.support) lvl.push(`Support $${f.support}`);
  if (f.resistance) lvl.push(`Resistance $${f.resistance}`);
  if (lvl.length) parts.push(`Key levels: ${lvl.join(", ")}`);
  return parts.join("\n");
}

// ── Mini chart panel ───────────────────────────────────────────────────────
function MiniChart({ ticker, priceLines }: { ticker: string; priceLines?: { entry?: number; stop?: number; target?: number } }) {
  const [bars, setBars] = useState<OHLCBar[]>([]);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (sym: string) => {
    if (!sym) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/practice/ohlc?ticker=${sym}&timeframe=daily`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { bars: b } = await res.json() as { bars: OHLCBar[] };
        setBars(b ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ticker) load(ticker);
  }, [ticker, load]);

  return (
    <div className="rounded-xl border border-[#27B7C8]/20 bg-[#0E1B30] overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#27B7C8]/80 hover:text-[#27B7C8] transition-colors"
      >
        <BarChart2 className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="font-mono font-semibold">{ticker}</span>
        <span className="text-[#F4F7FA]/30 ml-1">· Daily candles</span>
        <span className="ml-auto text-[#F4F7FA]/25">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-[#27B7C8]/10">
          {loading ? (
            <div className="flex items-center justify-center h-[220px] text-[#27B7C8]/40 text-xs">
              Loading chart…
            </div>
          ) : bars.length > 1 ? (
            <CandlestickChart data={bars} height={220} priceLines={priceLines} />
          ) : (
            <div className="flex items-center justify-center h-[220px] text-[#F4F7FA]/20 text-xs">
              No data
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Step components ────────────────────────────────────────────────────────
function PansyPrompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-5">
      <span className="text-xl flex-shrink-0 mt-0.5">🌸</span>
      <p className="text-sm text-[#F4F7FA]/70 leading-relaxed">{children}</p>
    </div>
  );
}

function StepSetup({ f, set }: { f: Form; set: (k: keyof Form, v: string) => void }) {
  return (
    <>
      <PansyPrompt>
        What are you looking at, and which way are you leaning? Name the ticker and tell me if you&apos;re going long or short.
      </PansyPrompt>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">Ticker</label>
          <input
            className={`${inputCls(!!f.ticker)} font-mono uppercase`}
            value={f.ticker}
            onChange={e => set("ticker", e.target.value.toUpperCase())}
            placeholder="AAPL"
            maxLength={10}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-2 block uppercase tracking-wide">Direction</label>
          <div className="grid grid-cols-2 gap-2">
            {(["long", "short"] as const).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => set("direction", d)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                  f.direction === d
                    ? d === "long"
                      ? "bg-[#49B06E]/15 border-[#49B06E] text-[#49B06E]"
                      : "bg-[#ef4444]/15 border-[#ef4444] text-[#ef4444]"
                    : "bg-[#0E1B30] border-[#27B7C8]/15 text-[#F4F7FA]/40"
                }`}
              >
                {d === "long" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {d === "long" ? "Long" : "Short"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StepThesis({ f, set }: { f: Form; set: (k: keyof Form, v: string) => void }) {
  return (
    <>
      <PansyPrompt>
        Before numbers, words. What is it about this setup that made you stop scrolling? Walk me through your thinking — the more specific, the better.
      </PansyPrompt>
      <div>
        <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">Your reason for this trade</label>
        <textarea
          className={`${inputCls(!!f.thesis)} resize-none`}
          rows={5}
          value={f.thesis}
          onChange={e => set("thesis", e.target.value)}
          placeholder="e.g. AAPL broke above the 52-week resistance on strong volume after a positive earnings beat. The broader tech sector is in an uptrend and I expect follow-through..."
          autoFocus
        />
        <p className="text-[10px] text-[#F4F7FA]/25 mt-1.5">Be specific. Vague entries are the first warning sign.</p>
      </div>
    </>
  );
}

function StepTrend({ f, set }: { f: Form; set: (k: keyof Form, v: string) => void }) {
  return (
    <>
      <PansyPrompt>
        What&apos;s the bigger picture telling you? Are you trading with the prevailing trend, against it, or working a move inside a range?
      </PansyPrompt>
      <div>
        <label className="text-xs text-[#F4F7FA]/40 mb-2 block uppercase tracking-wide">Trend you&apos;re trading</label>
        <div className="space-y-2">
          {TRENDS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => set("trend", t)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                f.trend === t
                  ? "bg-[#27B7C8]/10 border-[#27B7C8] text-[#F4F7FA]"
                  : "bg-[#0E1B30] border-[#27B7C8]/10 text-[#F4F7FA]/50 hover:border-[#27B7C8]/30 hover:text-[#F4F7FA]/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function StepPattern({ f, set }: { f: Form; set: (k: keyof Form, v: string) => void }) {
  return (
    <>
      <PansyPrompt>
        Every good entry has a reason to be <em>here</em> specifically. What&apos;s the pattern you&apos;re trading, and what&apos;s the candle or signal that says now is the time?
      </PansyPrompt>
      {f.ticker && <MiniChart ticker={f.ticker} />}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-2 block uppercase tracking-wide">Chart pattern</label>
          <div className="flex flex-wrap gap-2">
            {PATTERNS.map(p => (
              <button key={p} type="button" onClick={() => set("pattern", p)} className={chipCls(f.pattern === p)}>
                {p}
              </button>
            ))}
          </div>
          {f.pattern && (
            <input
              className={`${inputCls(!!f.patternDetail)} mt-2`}
              value={f.patternDetail}
              onChange={e => set("patternDetail", e.target.value)}
              placeholder="Add any detail about this pattern (optional)"
            />
          )}
        </div>
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-2 block uppercase tracking-wide">Candlestick confirmation</label>
          <div className="flex flex-wrap gap-2">
            {CANDLESTICKS.map(c => (
              <button key={c} type="button" onClick={() => set("candlestick", c)} className={chipCls(f.candlestick === c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">Indicator confirmation (optional)</label>
          <input
            className={inputCls(!!f.indicator)}
            value={f.indicator}
            onChange={e => set("indicator", e.target.value)}
            placeholder="e.g. RSI coming out of oversold, MACD crossover, above VWAP…"
          />
        </div>
      </div>
    </>
  );
}

function StepLevels({ f, set }: { f: Form; set: (k: keyof Form, v: string) => void }) {
  return (
    <>
      <PansyPrompt>
        Where&apos;s the floor, and where&apos;s the ceiling? Knowing your key levels is what separates a trade from a guess — and they&apos;ll anchor your risk plan in the next step.
      </PansyPrompt>
      {f.ticker && <MiniChart ticker={f.ticker} />}
      <div className="space-y-3">
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">Support level (price)</label>
          <input
            type="number" step="any" min="0"
            className={inputCls(!!f.support)}
            value={f.support}
            onChange={e => set("support", e.target.value)}
            placeholder="e.g. 148.50"
          />
          <p className="text-[10px] text-[#F4F7FA]/25 mt-1">Where buyers have stepped in before — your potential stop zone</p>
        </div>
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">Resistance level (price)</label>
          <input
            type="number" step="any" min="0"
            className={inputCls(!!f.resistance)}
            value={f.resistance}
            onChange={e => set("resistance", e.target.value)}
            placeholder="e.g. 162.00"
          />
          <p className="text-[10px] text-[#F4F7FA]/25 mt-1">Where sellers have pushed back before — your potential target zone</p>
        </div>
      </div>
    </>
  );
}

function StepPlan({ f, set }: { f: Form; set: (k: keyof Form, v: string) => void }) {
  const rr = calcRR(f);
  const noStop = !f.stopPrice;
  const poorRR = rr && rr.ratio < 1;
  const okRR = rr && rr.ratio >= 1 && rr.ratio < 1.5;
  const cost = f.shares && f.entryPrice
    ? parseFloat(f.shares) * parseFloat(f.entryPrice)
    : null;

  const planLines = {
    entry: f.entryPrice ? parseFloat(f.entryPrice) : undefined,
    stop: f.stopPrice ? parseFloat(f.stopPrice) : undefined,
    target: f.targetPrice ? parseFloat(f.targetPrice) : undefined,
  };

  return (
    <>
      <PansyPrompt>
        Numbers time. Where are you getting in, what price proves you wrong (your invalidation level), and where are you taking profit? I&apos;ll calculate your risk/reward from your own levels.
      </PansyPrompt>
      {f.ticker && <MiniChart ticker={f.ticker} priceLines={planLines} />}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">Shares *</label>
            <input
              type="number" step="any" min="0.0001"
              className={inputCls(!!f.shares)}
              value={f.shares}
              onChange={e => set("shares", e.target.value)}
              placeholder="10"
            />
          </div>
          <div>
            <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">Entry price *</label>
            <input
              type="number" step="any" min="0.0001"
              className={inputCls(!!f.entryPrice)}
              value={f.entryPrice}
              onChange={e => set("entryPrice", e.target.value)}
              placeholder="150.00"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">
            Invalidation level (stop) — where your thesis is wrong
          </label>
          <input
            type="number" step="any" min="0"
            className={inputCls(!!f.stopPrice)}
            value={f.stopPrice}
            onChange={e => set("stopPrice", e.target.value)}
            placeholder={f.support ? `e.g. just below support: ${f.support}` : "e.g. 145.00"}
          />
        </div>
        <div>
          <label className="text-xs text-[#F4F7FA]/40 mb-1.5 block uppercase tracking-wide">Take-profit target</label>
          <input
            type="number" step="any" min="0"
            className={inputCls(!!f.targetPrice)}
            value={f.targetPrice}
            onChange={e => set("targetPrice", e.target.value)}
            placeholder={f.resistance ? `e.g. near resistance: ${f.resistance}` : "e.g. 165.00"}
          />
        </div>

        {/* R/R display */}
        {rr && (
          <div className={`rounded-xl px-4 py-3 border ${
            rr.ratio >= 1.5 ? "bg-[#49B06E]/8 border-[#49B06E]/30" :
            rr.ratio >= 1 ? "bg-yellow-500/8 border-yellow-500/30" :
            "bg-[#ef4444]/8 border-[#ef4444]/30"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#F4F7FA]/50">Risk / Reward</span>
              <span className={`text-lg font-mono font-bold ${
                rr.ratio >= 1.5 ? "text-[#49B06E]" : rr.ratio >= 1 ? "text-yellow-400" : "text-[#ef4444]"
              }`}>
                1 : {rr.ratio.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-4 mt-1 text-[10px] text-[#F4F7FA]/35">
              <span>Risk ${rr.risk.toFixed(2)}/sh</span>
              <span>Reward ${rr.reward.toFixed(2)}/sh</span>
              {f.shares && <span>Total risk ${(rr.risk * parseFloat(f.shares)).toFixed(2)}</span>}
            </div>
          </div>
        )}

        {/* Cost preview */}
        {cost != null && !isNaN(cost) && (
          <p className="text-xs text-[#27B7C8]/70 bg-[#27B7C8]/8 rounded-lg px-3 py-2">
            Position cost: ${cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}

        {/* Warnings */}
        {noStop && (
          <div className="flex gap-2 items-start rounded-lg bg-[#ef4444]/8 border border-[#ef4444]/20 px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#ef4444]/90 leading-relaxed">
              No invalidation level set. Without a stop, you have no exit plan if the trade goes against you — and unlimited risk.
            </p>
          </div>
        )}
        {poorRR && (
          <div className="flex gap-2 items-start rounded-lg bg-[#ef4444]/8 border border-[#ef4444]/20 px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#ef4444]/90 leading-relaxed">
              Risk/reward is below 1:1. You&apos;re risking more than you could gain. Consider tightening your stop or moving your target.
            </p>
          </div>
        )}
        {okRR && (
          <div className="flex gap-2 items-start rounded-lg bg-yellow-500/8 border border-yellow-500/20 px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-400/90 leading-relaxed">
              Risk/reward is between 1:1 and 1.5:1. Aim for at least 1.5:1 to give winning trades room to justify losing ones.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function StepReview({ f }: { f: Form }) {
  const rr = calcRR(f);
  const cost = f.shares && f.entryPrice
    ? parseFloat(f.shares) * parseFloat(f.entryPrice)
    : null;

  return (
    <>
      <PansyPrompt>
        Here&apos;s your complete plan. You wrote every word of this — it&apos;s yours. If you still like it, open the trade.
      </PansyPrompt>
      <div className="space-y-3 text-sm">
        <div className="rounded-xl bg-[#0E1B30] border border-[#27B7C8]/15 divide-y divide-[#27B7C8]/10">
          {[
            ["Ticker", `${f.ticker} — ${f.direction.toUpperCase()}`],
            ["Position", `${f.shares} shares @ $${f.entryPrice}${cost != null ? ` = $${cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : ""}`],
            f.stopPrice && ["Invalidation", `$${f.stopPrice}`],
            f.targetPrice && ["Target", `$${f.targetPrice}`],
            rr && ["Risk / Reward", `1 : ${rr.ratio.toFixed(2)}`],
            ["Trend", f.trend],
            ["Pattern", f.pattern + (f.patternDetail ? ` — ${f.patternDetail}` : "")],
            f.candlestick && ["Signal", f.candlestick + (f.indicator ? ` / ${f.indicator}` : "")],
            (f.support || f.resistance) && ["Key levels", [f.support && `Support $${f.support}`, f.resistance && `Resistance $${f.resistance}`].filter(Boolean).join(", ")],
          ].filter(Boolean).map(([label, value]) => (
            <div key={label as string} className="flex gap-3 px-4 py-2.5">
              <span className="text-[#F4F7FA]/35 text-xs w-28 flex-shrink-0 pt-0.5">{label}</span>
              <span className="text-[#F4F7FA]/80 text-xs leading-relaxed">{value}</span>
            </div>
          ))}
        </div>
        {f.thesis && (
          <div className="rounded-xl bg-[#0E1B30] border border-[#27B7C8]/15 px-4 py-3">
            <p className="text-[10px] text-[#F4F7FA]/30 uppercase tracking-wide mb-1.5">Your thesis</p>
            <p className="text-xs text-[#F4F7FA]/70 leading-relaxed">{f.thesis}</p>
          </div>
        )}

        {/* Final warnings */}
        {!f.stopPrice && (
          <div className="flex gap-2 items-start rounded-lg bg-[#ef4444]/8 border border-[#ef4444]/20 px-3 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#ef4444]/80">No invalidation level — you&apos;re entering without a stop.</p>
          </div>
        )}
        {rr && rr.ratio < 1 && (
          <div className="flex gap-2 items-start rounded-lg bg-[#ef4444]/8 border border-[#ef4444]/20 px-3 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#ef4444]/80">Risk/reward is below 1:1 — risking more than you stand to gain.</p>
          </div>
        )}
      </div>
    </>
  );
}

// ── Step metadata ──────────────────────────────────────────────────────────
const STEPS = [
  { id: "setup",   label: "The Setup"     },
  { id: "thesis",  label: "Your Thesis"   },
  { id: "trend",   label: "The Trend"     },
  { id: "pattern", label: "Entry Signal"  },
  { id: "levels",  label: "Key Levels"    },
  { id: "plan",    label: "Risk Plan"     },
  { id: "review",  label: "Review"        },
];

function canAdvance(step: number, f: Form): boolean {
  if (step === 0) return !!f.ticker.trim() && !!f.direction;
  if (step === 1) return f.thesis.trim().length >= 10;
  if (step === 2) return !!f.trend;
  if (step === 3) return !!f.pattern;
  if (step === 4) return true; // levels optional but encouraged
  if (step === 5) return !!f.shares && !!f.entryPrice;
  return true;
}

// ── Main component ─────────────────────────────────────────────────────────
export function PreTradeChecklist({ onSubmit, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof Form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const ok = canAdvance(step, form);
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) return;
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setErr("");
    setSubmitting(true);
    try {
      await onSubmit({
        ticker: form.ticker,
        direction: form.direction,
        shares: parseFloat(form.shares),
        entry_price: parseFloat(form.entryPrice),
        stop_price: form.stopPrice ? parseFloat(form.stopPrice) : undefined,
        target_price: form.targetPrice ? parseFloat(form.targetPrice) : undefined,
        thesis: compileThesis(form),
      });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to open trade");
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepSetup f={form} set={set} />;
      case 1: return <StepThesis f={form} set={set} />;
      case 2: return <StepTrend f={form} set={set} />;
      case 3: return <StepPattern f={form} set={set} />;
      case 4: return <StepLevels f={form} set={set} />;
      case 5: return <StepPlan f={form} set={set} />;
      case 6: return <StepReview f={form} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#16264A] rounded-2xl border border-[#27B7C8]/25 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-[#27B7C8]/10 flex-shrink-0">
          <div className="flex-1">
            <p className="text-[10px] text-[#27B7C8]/60 uppercase tracking-widest mb-0.5">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="font-serif text-base font-bold text-[#F4F7FA]">
              {STEPS[step].label}
            </h2>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i === step ? "w-4 h-2 bg-[#27B7C8]" :
                  i < step ? "w-2 h-2 bg-[#49B06E]" :
                  "w-2 h-2 bg-[#27B7C8]/20"
                }`}
              />
            ))}
          </div>
          <button onClick={onClose} className="text-[#F4F7FA]/30 hover:text-[#F4F7FA] ml-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
          {renderStep()}
          {err && (
            <div className="mt-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 px-3 py-2.5 text-xs text-[#ef4444]">
              {err}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-4 border-t border-[#27B7C8]/10 flex gap-3 flex-shrink-0">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#27B7C8]/20 text-[#F4F7FA]/50 text-sm hover:text-[#F4F7FA] hover:border-[#27B7C8]/40 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          {!isLast ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!ok}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
                ok
                  ? "bg-[#27B7C8] text-[#0E1B30] hover:bg-[#27B7C8]/90"
                  : "bg-[#27B7C8]/20 text-[#27B7C8]/40 cursor-not-allowed"
              }`}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#49B06E] text-white text-sm font-semibold hover:bg-[#49B06E]/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                "Opening…"
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Open This Trade
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
