/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { OrderTicket } from "@/components/OrderTicket";
import { ActiveTradeCard } from "@/components/ActiveTradeCard";
import { RiskRewardCalculator } from "@/components/RiskRewardCalculator";
import { PositionSizeCalculator } from "@/components/PositionSizeCalculator";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { marketService } from "@/services/marketService";
import { canShowExternalPayment } from "@/lib/payments";
import {
  TrendingUp, BookOpen, X, AlertTriangle, Plus, Lock, Search,
  Sparkles, NotebookPen, Loader2, Trophy, BarChart3, Globe,
  Calculator, Calendar, Settings, Wallet, LayoutDashboard,
  Bell, ChevronDown, Bookmark, Menu, DollarSign, Clock,
  ArrowUpRight, ArrowDownRight, Target, Sun, Moon,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Account {
  id: string;
  cash_balance: number;
  initial_balance: number;
  created_at: string;
}

interface Trade {
  id: string;
  ticker: string;
  direction: "long" | "short";
  shares: number;
  entry_price: number;
  exit_price: number | null;
  stop_price: number | null;
  target_price: number | null;
  pnl: number | null;
  pnl_pct: number | null;
  risk_amount: number | null;
  thesis: string | null;
  exit_reason: string | null;
  status: "open" | "closed";
  entry_at: string;
  exit_at: string | null;
}

interface PageProps {
  requiresClientAuth?: boolean;
}

interface MarketQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
}

// ── Theme Colors ──────────────────────────────────────────────────────────
const C = {
  bg: "#0a1e1e",
  sidebar: "#0d2a2a",
  card: "#0d2626",
  cardBorder: "#1a4040",
  accent: "#84cc16",
  accentDim: "rgba(132,204,22,0.15)",
  text: "#ffffff",
  textDim: "rgba(255,255,255,0.5)",
  textMuted: "rgba(255,255,255,0.3)",
  red: "#ef4444",
  green: "#84cc16",
};

// ── Helpers ────────────────────────────────────────────────────────────────
async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = await getToken();
  return fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
  });
}

function fmt(n: number | null | undefined, prefix = "$") {
  if (n == null) return "—";
  return `${prefix}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtCompact(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return n.toFixed(0);
}

// ── Compute metrics ───────────────────────────────────────────────────────
function computeMetrics(account: Account | null, trades: Trade[]) {
  const open = trades.filter(t => t.status === "open");
  const closed = trades.filter(t => t.status === "closed");
  const wins = closed.filter(t => (t.pnl ?? 0) > 0);
  const losses = closed.filter(t => (t.pnl ?? 0) <= 0);
  const winRate = closed.length ? Math.round((wins.length / closed.length) * 100) : null;
  const avgWin = wins.length ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : null;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : null;
  const avgRR = avgWin != null && avgLoss != null && avgLoss > 0 ? avgWin / avgLoss : null;
  const dScore = trades.length
    ? Math.min(100, Math.round(
        trades.reduce((s, t) => s + (t.thesis ? 10 : 0) + (t.stop_price ? 10 : 0) + (t.target_price ? 5 : 0), 0) / trades.length
      ))
    : 0;
  const openValue = open.reduce((s, t) => s + t.entry_price * t.shares, 0);
  const totalEquity = (account?.cash_balance ?? 0) + openValue;
  const totalPnl = totalEquity - (account?.initial_balance ?? 10000);
  const totalPnlPct = (account?.initial_balance ?? 10000) > 0
    ? ((totalPnl / (account?.initial_balance ?? 10000)) * 100) : 0;
  return { open, closed, wins, losses, winRate, avgWin, avgLoss, avgRR, dScore, totalEquity, totalPnl, totalPnlPct, openValue };
}

// ── Close Trade Modal ─────────────────────────────────────────────────────
const CLOSE_REASONS = ["Hit target", "Stopped out", "Changed my mind", "Taking profit", "Cutting loss"];

function CloseTradeModal({ trade, currentPrice, onSubmit, onCancel }: {
  trade: Trade; currentPrice: number | null;
  onSubmit: (exitReason: string) => Promise<void>; onCancel: () => void;
}) {
  const [exitReason, setExitReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const handleConfirm = async () => {
    setErr(""); setLoading(true);
    try { await onSubmit(exitReason); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Failed to close trade"); setLoading(false); }
  };
  const previewPnl = currentPrice != null
    ? trade.direction === "long" ? (currentPrice - trade.entry_price) * trade.shares : (trade.entry_price - currentPrice) * trade.shares
    : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl p-6" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: C.text }}>Close {trade.ticker} at market</h2>
          <button onClick={onCancel} style={{ color: C.textDim }}><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs mb-4" style={{ color: C.textDim }}>
          {trade.direction.toUpperCase()} · {trade.shares} shares · Entry {fmt(trade.entry_price)}
          {currentPrice != null && <> · Now {fmt(currentPrice)}</>}
        </p>
        {previewPnl != null && (
          <p className="text-sm font-mono font-bold rounded-lg px-3 py-2 mb-4" style={{
            color: previewPnl >= 0 ? C.green : C.red,
            background: previewPnl >= 0 ? "rgba(132,204,22,0.1)" : "rgba(239,68,68,0.1)",
          }}>
            Est. P&L: {previewPnl >= 0 ? "+" : ""}{fmt(previewPnl)}
          </p>
        )}
        <label className="text-xs mb-1.5 block" style={{ color: C.textDim }}>Reason (optional)</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {CLOSE_REASONS.map(r => (
            <button key={r} type="button" onClick={() => setExitReason(exitReason === r ? "" : r)}
              className="px-3 py-1.5 rounded-full text-xs border transition-colors"
              style={{
                borderColor: exitReason === r ? C.accent : C.cardBorder,
                background: exitReason === r ? C.accentDim : "transparent",
                color: exitReason === r ? C.accent : C.textDim,
              }}>
              {r}
            </button>
          ))}
        </div>
        {err && <p className="mb-3 text-sm rounded-lg px-3 py-2" style={{ color: C.red, background: "rgba(239,68,68,0.1)" }}>{err}</p>}
        <button onClick={handleConfirm} disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-colors"
          style={{ background: C.accent, color: "#0a1e1e" }}>
          {loading ? "Closing…" : "Close at market"}
        </button>
      </div>
    </div>
  );
}

// ── Trade Review Modal ────────────────────────────────────────────────────
interface TradeReview {
  score_pl: number; score_rr: number; score_entry: number;
  score_exit: number; score_discipline: number; overall_grade: string;
  what_went_well: string; what_to_improve: string;
  followed_plan: string; remember_next: string;
}
interface ReviewState {
  review: TradeReview | null; journal_id: string | null;
  loading: boolean; error: string; ticker: string; pnl: number;
}

function DashScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? C.green : score >= 55 ? "#facc15" : C.red;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wide" style={{ color: C.textDim }}>{label}</span>
        <span className="text-[10px] font-mono" style={{ color: C.textDim }}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function gradeColor(g: string) {
  if (g === "A") return { color: C.green, bg: "rgba(132,204,22,0.1)", border: "rgba(132,204,22,0.3)" };
  if (g === "B") return { color: "#22d3ee", bg: "rgba(34,211,238,0.1)", border: "rgba(34,211,238,0.3)" };
  if (g === "C") return { color: "#facc15", bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)" };
  if (g === "D") return { color: "#fb923c", bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)" };
  return { color: C.red, bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" };
}

function TradeReviewModal({ state, onClose }: { state: ReviewState; onClose: () => void }) {
  const { review, journal_id, loading, error, ticker, pnl } = state;
  const win = pnl >= 0;
  const gc = review ? gradeColor(review.overall_grade) : null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: C.accent }} />
            <h2 className="text-base font-bold" style={{ color: C.text }}>Trade Review — {ticker}</h2>
          </div>
          <button onClick={onClose} style={{ color: C.textMuted }}><X className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center justify-between rounded-lg px-4 py-3 mb-4" style={{
          background: win ? "rgba(132,204,22,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${win ? "rgba(132,204,22,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}>
          <span className="text-xs" style={{ color: C.textDim }}>Final P/L</span>
          <span className="font-mono font-bold" style={{ color: win ? C.green : C.red }}>
            {win ? "+" : ""}${Math.abs(pnl).toFixed(2)}
          </span>
        </div>
        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.accent }} />
            <span className="text-sm" style={{ color: C.textDim }}>Pansy is reviewing your process…</span>
          </div>
        )}
        {!loading && error && <p className="text-xs rounded-lg px-3 py-3 mb-4" style={{ color: C.red, background: "rgba(239,68,68,0.1)" }}>{error}</p>}
        {!loading && review && gc && (
          <>
            <div className="flex items-center gap-4 mb-5">
              <div className="text-3xl font-bold font-mono w-16 h-16 rounded-xl border flex items-center justify-center flex-shrink-0"
                style={{ color: gc.color, background: gc.bg, borderColor: gc.border }}>
                {review.overall_grade}
              </div>
              <div className="flex-1 space-y-2">
                <DashScoreBar label="P/L Quality" score={review.score_pl} />
                <DashScoreBar label="Risk/Reward" score={review.score_rr} />
                <DashScoreBar label="Entry" score={review.score_entry} />
                <DashScoreBar label="Exit" score={review.score_exit} />
                <DashScoreBar label="Discipline" score={review.score_discipline} />
              </div>
            </div>
            <div className="space-y-3 mb-4">
              {[
                { label: "What went well", text: review.what_went_well, c: C.green },
                { label: "What to improve", text: review.what_to_improve, c: C.red },
                { label: "Did you follow your plan?", text: review.followed_plan, c: "#22d3ee" },
                { label: "Remember next time", text: review.remember_next, c: "#facc15" },
              ].map(({ label, text, c }) => (
                <div key={label} className="rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.cardBorder}` }}>
                  <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: c }}>{label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>{text}</p>
                </div>
              ))}
            </div>
            {journal_id && (
              <Link href="/journal" className="flex items-center gap-2 text-xs hover:underline mb-3" style={{ color: C.accent }}>
                <NotebookPen className="w-3.5 h-3.5" /> Open journal entry to add notes
              </Link>
            )}
          </>
        )}
        <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold text-sm transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", color: C.textDim, border: `1px solid ${C.cardBorder}` }}>
          Close
        </button>
        <p className="mt-3 text-[10px] text-center" style={{ color: C.textMuted }}>
          Educational simulator — not a brokerage, not financial advice.
        </p>
      </div>
    </div>
  );
}

// ── Portfolio Chart (SVG) ─────────────────────────────────────────────────
function PortfolioChart({ equity, initial }: { equity: number; initial: number }) {
  const data = useMemo(() => {
    const months = 6;
    const pts: number[] = [];
    for (let i = 0; i <= months; i++) {
      const progress = i / months;
      const base = initial + (equity - initial) * progress;
      const noise = (Math.sin(i * 2.1 + 1.3) * 0.04 + Math.cos(i * 3.7) * 0.02) * initial;
      pts.push(Math.max(0, base + noise));
    }
    return pts;
  }, [equity, initial]);

  const W = 460, H = 180;
  const pad = { t: 10, r: 10, b: 28, l: 52 };
  const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
  const min = Math.min(...data) * 0.97, max = Math.max(...data) * 1.03;
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: pad.l + (i / (data.length - 1)) * pw,
    y: pad.t + ph - ((v - min) / range) * ph,
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${points[points.length - 1].x},${pad.t + ph} L${points[0].x},${pad.t + ph} Z`;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const now = new Date();
  const startMonth = (now.getMonth() - 5 + 12) % 12;
  const labels = Array.from({ length: 7 }, (_, i) => months[(startMonth + i) % 12]);

  const gridLines = 5;
  const gridVals = Array.from({ length: gridLines }, (_, i) => min + (range * i) / (gridLines - 1));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.accent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={C.accent} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridVals.map((v, i) => {
        const y = pad.t + ph - ((v - min) / range) * ph;
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={pad.l - 6} y={y + 3} textAnchor="end" fill={C.textMuted} fontSize="9" fontFamily="monospace">
              {fmtCompact(v)}
            </text>
          </g>
        );
      })}
      {labels.map((m, i) => (
        <text key={i} x={pad.l + (i / (labels.length - 1)) * pw} y={H - 6} textAnchor="middle"
          fill={C.textMuted} fontSize="9">{m}</text>
      ))}
      <path d={area} fill="url(#chartFill)" />
      <path d={line} fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 0} fill={C.accent} />
      ))}
      {/* tooltip on last point */}
      {points.length > 0 && (
        <g>
          <rect x={points[points.length - 1].x - 48} y={points[points.length - 1].y - 24}
            width="96" height="18" rx="4" fill="rgba(0,0,0,0.7)" />
          <text x={points[points.length - 1].x} y={points[points.length - 1].y - 12}
            textAnchor="middle" fill={C.text} fontSize="9" fontFamily="monospace">
            {fmt(data[data.length - 1])} total
          </text>
        </g>
      )}
    </svg>
  );
}

// ── Economic Events ───────────────────────────────────────────────────────
const SAMPLE_EVENTS = [
  { time: "08:30", name: "CPI MoM", impact: "high" },
  { time: "08:30", name: "Core CPI YoY", impact: "high" },
  { time: "10:00", name: "Consumer Sentiment", impact: "medium" },
  { time: "10:00", name: "New Home Sales", impact: "medium" },
  { time: "13:00", name: "Fed Rate Decision", impact: "high" },
  { time: "14:00", name: "FOMC Minutes", impact: "high" },
  { time: "14:30", name: "Initial Jobless Claims", impact: "medium" },
  { time: "16:00", name: "Treasury Budget", impact: "low" },
];

function EconomicEvents() {
  const today = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateStr = `${dayNames[today.getDay()]}, ${monthNames[today.getMonth()]} ${today.getDate()}`;

  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: C.text }}>Economic Events</h3>
        <Calendar className="w-4 h-4" style={{ color: C.textDim }} />
      </div>
      <p className="text-xs mb-3" style={{ color: C.accent }}>{dateStr}</p>
      <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
        {SAMPLE_EVENTS.map((evt, i) => (
          <div key={i} className="flex items-center gap-3 py-2 px-2 rounded-lg transition-colors hover:bg-white/[0.03]">
            <span className="text-xs font-mono w-12 flex-shrink-0" style={{ color: C.textDim }}>{evt.time}</span>
            <span className="text-xs flex-1" style={{ color: C.text }}>{evt.name}</span>
            <div className="flex gap-0.5">
              {[0, 1, 2].map(j => (
                <div key={j} className="w-1.5 h-3 rounded-sm" style={{
                  background: j < (evt.impact === "high" ? 3 : evt.impact === "medium" ? 2 : 1)
                    ? (evt.impact === "high" ? C.red : evt.impact === "medium" ? "#facc15" : C.green)
                    : "rgba(255,255,255,0.08)",
                }} />
              ))}
            </div>
            <Bookmark className="w-3.5 h-3.5 flex-shrink-0 cursor-pointer transition-colors hover:text-lime-400" style={{ color: C.textMuted }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Markets Panel ─────────────────────────────────────────────────────────
const WATCH_TICKERS = [
  { ticker: "AAPL", name: "Apple Inc" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "GOOGL", name: "Alphabet" },
  { ticker: "TSLA", name: "Tesla Inc" },
];

function MarketsPanel({ quotes }: { quotes: MarketQuote[] }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: C.text }}>Markets</h3>
        <BarChart3 className="w-4 h-4" style={{ color: C.textDim }} />
      </div>
      <div className="space-y-1">
        {quotes.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: C.textDim }} />
          </div>
        ) : (
          quotes.map(q => (
            <Link key={q.ticker} href={`/stock/${q.ticker}`}
              className="flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors hover:bg-white/[0.03] cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: C.accentDim, color: C.accent }}>
                {q.ticker.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: C.text }}>{q.ticker}</p>
                <p className="text-[10px] truncate" style={{ color: C.textMuted }}>{q.name}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-mono font-medium" style={{ color: C.text }}>${q.price.toFixed(2)}</p>
                <p className="text-[10px] font-mono" style={{ color: q.change >= 0 ? C.green : C.red }}>
                  {q.change >= 0 ? "+" : ""}{q.change.toFixed(2)}%
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

// ── Position Size Calculator ──────────────────────────────────────────────
function PositionCalculator() {
  const [entryPrice, setEntryPrice] = useState("150.00");
  const [stopLoss, setStopLoss] = useState("145.00");
  const [balance, setBalance] = useState("10000");
  const [riskPct, setRiskPct] = useState("2");
  const [result, setResult] = useState<{ units: number; risk: number } | null>(null);

  const calculate = () => {
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const bal = parseFloat(balance);
    const pct = parseFloat(riskPct);
    if (isNaN(entry) || isNaN(stop) || isNaN(bal) || isNaN(pct) || entry === stop) return;
    const riskAmount = (bal * pct) / 100;
    const priceDiff = Math.abs(entry - stop);
    const units = priceDiff > 0 ? riskAmount / priceDiff : 0;
    setResult({ units, risk: riskAmount });
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${C.cardBorder}`,
    color: C.text,
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: C.text }}>Position Size Calculator</h3>
        <Calculator className="w-4 h-4" style={{ color: C.textDim }} />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: C.textDim }}>Entry Price</label>
            <input type="text" value={entryPrice} onChange={e => setEntryPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-lime-500/50"
              style={inputStyle} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: C.textDim }}>Stop Loss</label>
            <input type="text" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-lime-500/50"
              style={inputStyle} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: C.textDim }}>Account Balance</label>
            <input type="text" value={balance} onChange={e => setBalance(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-lime-500/50"
              style={inputStyle} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: C.textDim }}>Risk %</label>
            <input type="text" value={riskPct} onChange={e => setRiskPct(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none focus:ring-1 focus:ring-lime-500/50"
              style={inputStyle} />
          </div>
        </div>
        {result && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg px-3 py-2.5" style={{ background: C.accentDim }}>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: C.textDim }}>Units</p>
              <p className="text-sm font-mono font-bold" style={{ color: C.accent }}>{result.units.toFixed(3)}</p>
            </div>
            <div className="rounded-lg px-3 py-2.5" style={{ background: C.accentDim }}>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: C.textDim }}>Amount at Risk</p>
              <p className="text-sm font-mono font-bold" style={{ color: C.accent }}>${result.risk.toFixed(2)}</p>
            </div>
          </div>
        )}
        <button onClick={calculate} className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: C.accent, color: "#0a1e1e" }}>
          Calculate
        </button>
      </div>
    </div>
  );
}

// ── Market Hours ──────────────────────────────────────────────────────────
const MARKETS = [
  { name: "New York", tz: "America/New_York", open: 9.5, close: 16, abbr: "NYSE" },
  { name: "London", tz: "Europe/London", open: 8, close: 16.5, abbr: "LSE" },
  { name: "Tokyo", tz: "Asia/Tokyo", open: 9, close: 15, abbr: "TSE" },
];

function getMarketInfo(tz: string, openH: number, closeH: number) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour: "numeric", minute: "numeric", hour12: false, weekday: "short",
  }).formatToParts(now);
  const h = parseInt(parts.find(p => p.type === "hour")?.value || "0");
  const m = parseInt(parts.find(p => p.type === "minute")?.value || "0");
  const weekday = parts.find(p => p.type === "weekday")?.value || "";

  const mins = h * 60 + m;
  const openMins = Math.round(openH * 60);
  const closeMins = Math.round(closeH * 60);

  const isWeekend = weekday === "Sat" || weekday === "Sun";
  const isOpen = !isWeekend && mins >= openMins && mins < closeMins;

  let remaining = "";
  if (isOpen) {
    const left = closeMins - mins;
    remaining = left >= 60 ? `${Math.floor(left / 60)}h ${left % 60}m left` : `${left}m left`;
  } else {
    let daysToAdd = 0;
    if (weekday === "Sat") daysToAdd = 2;
    else if (weekday === "Sun") daysToAdd = 1;
    else if (mins >= closeMins) daysToAdd = weekday === "Fri" ? 3 : 1;

    let toOpen: number;
    if (daysToAdd === 0) {
      toOpen = openMins - mins;
    } else {
      toOpen = (24 * 60 - mins) + (daysToAdd - 1) * 24 * 60 + openMins;
    }

    if (toOpen >= 24 * 60) {
      const d = Math.floor(toOpen / (24 * 60));
      const hr = Math.floor((toOpen % (24 * 60)) / 60);
      remaining = `${d}d ${hr}h to open`;
    } else {
      remaining = toOpen >= 60 ? `${Math.floor(toOpen / 60)}h ${toOpen % 60}m to open` : `${toOpen}m to open`;
    }
  }
  return { isOpen, remaining, time: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}` };
}

function MarketHoursPanel() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: C.text }}>Market Hours</h3>
        <Globe className="w-4 h-4" style={{ color: C.textDim }} />
      </div>
      <div className="space-y-2.5">
        {MARKETS.map(mkt => {
          const info = getMarketInfo(mkt.tz, mkt.open, mkt.close);
          return (
            <div key={mkt.name} className="flex items-center gap-3 p-3 rounded-xl transition-colors"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.cardBorder}` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: info.isOpen ? C.accentDim : "rgba(255,255,255,0.05)" }}>
                {info.isOpen
                  ? <Sun className="w-4 h-4" style={{ color: C.accent }} />
                  : <Moon className="w-4 h-4" style={{ color: C.textMuted }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: C.text }}>{mkt.name}</p>
                <p className="text-[10px]" style={{ color: C.textMuted }}>{mkt.abbr} · {info.time}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{
                  background: info.isOpen ? C.accentDim : "rgba(255,255,255,0.05)",
                  color: info.isOpen ? C.accent : C.textMuted,
                }}>
                  {info.isOpen ? "Open" : "Closed"}
                </span>
                <p className="text-[10px] mt-0.5" style={{ color: C.textDim }}>{info.remaining}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────
type View = "dashboard" | "trades" | "discover" | "journal" | "progress";

const SIDEBAR_ITEMS: { id: View | "link"; icon: any; label: string; href?: string }[] = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "trades", icon: TrendingUp, label: "Trades" },
  { id: "link", icon: Search, label: "Discover", href: "/discover" },
  { id: "link", icon: Wallet, label: "Assets", href: "/research" },
  { id: "journal", icon: NotebookPen, label: "Journal", href: "/journal" },
  { id: "link", icon: Calendar, label: "Calendar", href: "/learn" },
  { id: "link", icon: Settings, label: "Settings", href: "/profile" },
];

function Sidebar({ view, setView, open, onClose }: {
  view: View; setView: (v: View) => void; open: boolean; onClose: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-auto
        h-screen w-[220px] flex-shrink-0 flex flex-col
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `} style={{ background: C.sidebar, borderRight: `1px solid ${C.cardBorder}` }}>
        {/* Brand */}
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.accentDim }}>
            <TrendingUp className="w-5 h-5" style={{ color: C.accent }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: C.text }}>Bloom Trader</p>
            <p className="text-[10px]" style={{ color: C.textMuted }}>Practice Mode</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={onClose}>
            <X className="w-5 h-5" style={{ color: C.textDim }} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item, i) => {
            const Icon = item.icon;
            const isActive = item.id !== "link" && view === item.id;

            if (item.href) {
              return (
                <Link key={i} href={item.href} onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors"
                  style={{ color: C.textDim }}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            }

            return (
              <button key={i} onClick={() => { setView(item.id as View); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: isActive ? C.accentDim : "transparent",
                  color: isActive ? C.accent : C.textDim,
                }}>
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Promo card */}
        <div className="px-3 pb-4">
          <div className="rounded-xl p-4" style={{ background: `linear-gradient(135deg, rgba(132,204,22,0.15), rgba(132,204,22,0.05))`, border: `1px solid rgba(132,204,22,0.2)` }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" style={{ color: C.accent }} />
              <p className="text-xs font-semibold" style={{ color: C.accent }}>Learn more</p>
            </div>
            <p className="text-[10px] leading-relaxed mb-3" style={{ color: C.textDim }}>
              Build your skills with Bloom University — free courses on stocks, ETFs, and market fundamentals.
            </p>
            <Link href="/learn" onClick={onClose}
              className="block text-center text-[10px] font-semibold py-1.5 rounded-lg transition-all hover:brightness-110"
              style={{ background: C.accent, color: "#0a1e1e" }}>
              Start Learning
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Closed Trade Row (dashboard themed) ───────────────────────────────────
function ClosedTradeRow({ trade }: { trade: Trade }) {
  const win = (trade.pnl ?? 0) >= 0;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.03]"
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.cardBorder}` }}>
      <span className="text-xs font-semibold w-5" style={{ color: win ? C.green : C.red }}>{win ? "W" : "L"}</span>
      <span className="font-mono text-sm font-semibold w-14" style={{ color: C.text }}>{trade.ticker}</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
        background: trade.direction === "long" ? "rgba(132,204,22,0.15)" : "rgba(239,68,68,0.15)",
        color: trade.direction === "long" ? C.green : C.red,
      }}>
        {trade.direction[0].toUpperCase()}
      </span>
      <span className="ml-auto text-sm font-mono font-bold" style={{ color: win ? C.green : C.red }}>
        {win ? "+" : ""}{fmt(trade.pnl)}
      </span>
      <span className="text-xs w-14 text-right" style={{ color: C.textMuted }}>{fmtPct(trade.pnl_pct)}</span>
    </div>
  );
}

// ── Gate: non-Pro ─────────────────────────────────────────────────────────
function ProGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
      <div className="rounded-full p-6" style={{ background: C.accentDim, border: `1px solid rgba(132,204,22,0.2)` }}>
        <Lock className="w-10 h-10" style={{ color: C.accent }} />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.text }}>Bloom Practice Trader</h2>
        <p className="max-w-sm" style={{ color: C.textDim }}>
          {canShowExternalPayment
            ? "Practice trading with $10,000 in virtual cash — no real money, no real risk. Upgrade to Bloom Pro to unlock."
            : "This feature isn't available in this version."}
        </p>
      </div>
      {canShowExternalPayment && (
        <Link href="/subscription" className="px-8 py-3 rounded-xl font-semibold transition-all hover:brightness-110"
          style={{ background: C.accent, color: "#0a1e1e" }}>
          Upgrade to Pro
        </Link>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ── MAIN PAGE ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
export default function PracticePage(_props: PageProps) {
  const { isPro, isLoading: authLoading } = useSubscription();

  // ── Data state ──────────────────────────────────────────────────────────
  const [account, setAccount] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const [tab, setTab] = useState<"open" | "closed">("open");
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const priceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Dashboard state ─────────────────────────────────────────────────────
  const [view, setView] = useState<View>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [marketQuotes, setMarketQuotes] = useState<MarketQuote[]>([]);

  // ── Load account + trades ───────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [accRes, tradesRes] = await Promise.all([
        apiFetch("/api/practice/account"),
        apiFetch("/api/practice/trades"),
      ]);
      if (!accRes.ok) throw new Error("Could not load account");
      if (!tradesRes.ok) throw new Error("Could not load trades");
      const { account: acc } = await accRes.json();
      const { trades: tr } = await tradesRes.json();
      setAccount(acc); setTrades(tr);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch live prices for open positions ────────────────────────────────
  const refreshPrices = useCallback(async (openTrades: Trade[]) => {
    if (openTrades.length === 0) return;
    setPricesLoading(true);
    const tickers = [...new Set(openTrades.map(t => t.ticker))];
    try {
      const results = await Promise.all(
        tickers.map(async ticker => {
          const q = await marketService.getRealTimeQuote(ticker);
          return { ticker, price: q?.c ?? null };
        })
      );
      setLivePrices(prev => {
        const next = { ...prev };
        results.forEach(({ ticker, price }) => { if (price != null) next[ticker] = price; });
        return next;
      });
    } catch { /* non-fatal */ } finally { setPricesLoading(false); }
  }, []);

  // ── Fetch market quotes for the Markets panel ───────────────────────────
  const loadMarketQuotes = useCallback(async () => {
    try {
      const results = await Promise.all(
        WATCH_TICKERS.map(async ({ ticker, name }) => {
          const q = await marketService.getRealTimeQuote(ticker);
          return q ? { ticker, name, price: q.c, change: q.dp } : null;
        })
      );
      setMarketQuotes(results.filter(Boolean) as MarketQuote[]);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    if (!authLoading && isPro) { loadData(); loadMarketQuotes(); }
    else if (!authLoading && !isPro) setLoading(false);
  }, [authLoading, isPro, loadData, loadMarketQuotes]);

  useEffect(() => {
    const open = trades.filter(t => t.status === "open");
    if (open.length === 0) return;
    refreshPrices(open);
    priceIntervalRef.current = setInterval(() => refreshPrices(open), 60000);
    return () => { if (priceIntervalRef.current) clearInterval(priceIntervalRef.current); };
  }, [trades, refreshPrices]);

  // ── Trade handlers ──────────────────────────────────────────────────────
  const handleTradePlaced = async () => { setShowOpenModal(false); await loadData(); };

  const handleCloseTrade = async (exitReason: string) => {
    if (!closingTrade) return;
    const tradeId = closingTrade.id;
    const ticker = closingTrade.ticker;
    const res = await apiFetch("/api/practice/close", {
      method: "POST", body: JSON.stringify({ trade_id: tradeId, exit_reason: exitReason || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to close trade");
    setClosingTrade(null);
    await loadData();
    setReviewState({ review: null, journal_id: null, loading: true, error: "", ticker, pnl: data.pnl });
    apiFetch("/api/practice/review", { method: "POST", body: JSON.stringify({ trade_id: tradeId }) })
      .then(async r => {
        const d = await r.json();
        if (!r.ok) setReviewState(prev => prev ? { ...prev, loading: false, error: d.error || "Review unavailable" } : null);
        else setReviewState(prev => prev ? { ...prev, loading: false, review: d.review, journal_id: d.journal_id } : null);
      })
      .catch(() => setReviewState(prev => prev ? { ...prev, loading: false, error: "Review unavailable — try again" } : null));
  };

  const handleCloseHalf = async (trade: Trade, exitReason: string) => {
    const res = await apiFetch("/api/practice/close-half", {
      method: "POST", body: JSON.stringify({ trade_id: trade.id, exit_reason: exitReason || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to close half");
    await loadData();
  };

  const handleMoveStop = async (trade: Trade, newStop: number) => {
    const res = await apiFetch("/api/practice/update", {
      method: "POST", body: JSON.stringify({ trade_id: trade.id, stop_price: newStop }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update stop");
    setTrades(prev => prev.map(t => t.id === trade.id ? data.trade : t));
  };

  const handleAdjustTarget = async (trade: Trade, newTarget: number) => {
    const res = await apiFetch("/api/practice/update", {
      method: "POST", body: JSON.stringify({ trade_id: trade.id, target_price: newTarget }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update target");
    setTrades(prev => prev.map(t => t.id === trade.id ? data.trade : t));
  };

  const handleAddNote = async (trade: Trade, note: string) => {
    const res = await apiFetch("/api/practice/update", {
      method: "POST", body: JSON.stringify({ trade_id: trade.id, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save note");
    setTrades(prev => prev.map(t => t.id === trade.id ? data.trade : t));
  };

  const showProGate = !authLoading && !isPro;
  const metrics = computeMetrics(account, trades);

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Head><title>Bloom Practice Trader</title></Head>
      <Layout>
        <div className="min-h-screen" style={{ background: C.bg }}>

          {/* ── Top Bar ──────────────────────────────────────────────── */}
          <div className="sticky top-16 z-30 px-4 lg:px-6 py-3 flex items-center gap-3 border-b"
            style={{ background: C.bg, borderColor: C.cardBorder }}>
            {/* Mobile hamburger */}
            <button className="lg:hidden p-1.5 rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}
              style={{ color: C.textDim }}>
              <Menu className="w-5 h-5" />
            </button>

            {/* Balance pills */}
            {!loading && account && (
              <div className="flex items-center gap-4 flex-1 min-w-0 overflow-x-auto">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <DollarSign className="w-4 h-4" style={{ color: C.accent }} />
                  <span className="text-sm font-mono font-bold" style={{ color: C.text }}>
                    {fmt(metrics.totalEquity)}
                  </span>
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{
                    color: metrics.totalPnlPct >= 0 ? C.green : C.red,
                    background: metrics.totalPnlPct >= 0 ? "rgba(132,204,22,0.1)" : "rgba(239,68,68,0.1)",
                  }}>
                    {metrics.totalPnlPct >= 0 ? "+" : ""}{metrics.totalPnlPct.toFixed(2)}%
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Cash</span>
                  <span className="text-xs font-mono" style={{ color: C.textDim }}>{fmt(account.cash_balance)}</span>
                </div>
                <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: C.textMuted }}>Positions</span>
                  <span className="text-xs font-mono" style={{ color: C.textDim }}>{metrics.open.length}</span>
                </div>
              </div>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              <button onClick={() => { setView("trades"); setShowOpenModal(true); }}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: C.accent, color: "#0a1e1e" }}>
                <Plus className="w-3.5 h-3.5" />
                New Trade
              </button>
              <button className="p-2 rounded-lg transition-colors" style={{ color: C.textDim }}>
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Body: Sidebar + Main ─────────────────────────────── */}
          <div className="flex">
            <Sidebar view={view} setView={setView} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 min-w-0 p-4 lg:p-6 pb-24">

              {/* Loading */}
              {(authLoading || (loading && isPro)) && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.accent }} />
                  <p className="text-sm" style={{ color: C.textDim }}>Loading your portfolio...</p>
                </div>
              )}

              {/* Not Pro */}
              {showProGate && <ProGate />}

              {/* Error */}
              {!loading && !authLoading && isPro && error && (
                <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{
                  color: C.red, background: "rgba(239,68,68,0.1)", border: `1px solid rgba(239,68,68,0.2)`,
                }}>
                  {error}
                  <button onClick={loadData} className="ml-2 underline">Retry</button>
                </div>
              )}

              {/* ════════════════════════════════════════════════════ */}
              {/* DASHBOARD VIEW                                      */}
              {/* ════════════════════════════════════════════════════ */}
              {!authLoading && !loading && isPro && !error && view === "dashboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                  {/* ── Left Column ─────────────────────────────────── */}
                  <div className="space-y-5">
                    {/* Balance Card */}
                    <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wider font-medium" style={{ color: C.textDim }}>Total Balance</span>
                        <button className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg"
                          style={{ color: C.textDim, background: "rgba(255,255,255,0.05)" }}>
                          6 Month <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-3xl font-bold font-mono" style={{ color: C.text }}>
                          {fmt(metrics.totalEquity)}
                        </span>
                        <span className="text-sm font-mono flex items-center gap-1" style={{ color: metrics.totalPnl >= 0 ? C.green : C.red }}>
                          {metrics.totalPnl >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {metrics.totalPnlPct >= 0 ? "+" : ""}{metrics.totalPnlPct.toFixed(2)}%
                        </span>
                      </div>
                      <PortfolioChart equity={metrics.totalEquity} initial={account?.initial_balance ?? 10000} />
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
                        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textDim }}>Win Rate</p>
                        <p className="text-xl font-bold font-mono" style={{ color: metrics.winRate != null && metrics.winRate >= 50 ? C.green : metrics.winRate != null ? C.red : C.text }}>
                          {metrics.winRate != null ? `${metrics.winRate}%` : "—"}
                        </p>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>{metrics.wins.length}W / {metrics.losses.length}L</p>
                      </div>
                      <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
                        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.textDim }}>Avg R:R</p>
                        <p className="text-xl font-bold font-mono" style={{ color: metrics.avgRR != null && metrics.avgRR >= 1.5 ? C.green : C.text }}>
                          {metrics.avgRR != null ? `${metrics.avgRR.toFixed(1)}R` : "—"}
                        </p>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>Risk/Reward</p>
                      </div>
                    </div>

                    {/* Discipline */}
                    <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.cardBorder}` }}>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" style={{ color: C.accent }} />
                          <span className="text-xs font-semibold" style={{ color: C.text }}>Discipline</span>
                        </div>
                        <span className="text-xl font-mono font-bold" style={{
                          color: metrics.dScore >= 70 ? C.green : metrics.dScore >= 40 ? "#facc15" : C.red,
                        }}>{metrics.dScore}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{
                          width: `${metrics.dScore}%`,
                          background: metrics.dScore >= 70 ? C.green : metrics.dScore >= 40 ? "#facc15" : C.red,
                        }} />
                      </div>
                      <p className="text-[10px] mt-2" style={{ color: C.textMuted }}>
                        Thesis + stop + target on each trade grows this score
                      </p>
                    </div>
                  </div>

                  {/* ── Center Column ───────────────────────────────── */}
                  <div className="space-y-5">
                    <EconomicEvents />
                    <MarketsPanel quotes={marketQuotes} />
                  </div>

                  {/* ── Right Column ────────────────────────────────── */}
                  <div className="space-y-5">
                    <PositionCalculator />
                    <MarketHoursPanel />
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════ */}
              {/* TRADES VIEW                                         */}
              {/* ════════════════════════════════════════════════════ */}
              {!authLoading && !loading && isPro && !error && view === "trades" && (
                <div className="max-w-2xl">
                  {/* Open Position CTA */}
                  <button onClick={() => setShowOpenModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold mb-6 transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ background: C.accent, color: "#0a1e1e" }}>
                    <Plus className="w-5 h-5" />
                    Open New Position
                  </button>

                  {/* Tabs */}
                  <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.cardBorder}` }}>
                    <button onClick={() => setTab("open")}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: tab === "open" ? C.accentDim : "transparent",
                        color: tab === "open" ? C.accent : C.textDim,
                      }}>
                      Open{metrics.open.length > 0 && ` (${metrics.open.length})`}
                    </button>
                    <button onClick={() => setTab("closed")}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        background: tab === "closed" ? C.accentDim : "transparent",
                        color: tab === "closed" ? C.accent : C.textDim,
                      }}>
                      History{metrics.closed.length > 0 && ` (${metrics.closed.length})`}
                    </button>
                  </div>

                  {/* Open Trades */}
                  {tab === "open" && (
                    <div className="space-y-3">
                      {metrics.open.length === 0 ? (
                        <div className="flex flex-col items-center py-14 text-center">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: C.accentDim }}>
                            <Sparkles className="w-6 h-6" style={{ color: C.accent }} />
                          </div>
                          <p className="text-sm font-medium mb-1" style={{ color: C.textDim }}>No open positions yet</p>
                          <p className="text-xs max-w-[220px]" style={{ color: C.textMuted }}>
                            Research a stock, form a thesis, then open your first practice trade
                          </p>
                        </div>
                      ) : (
                        metrics.open.map(t => (
                          <ActiveTradeCard key={t.id} trade={t}
                            currentPrice={livePrices[t.ticker] ?? null} priceLoading={pricesLoading}
                            onClose={setClosingTrade} onCloseHalf={handleCloseHalf}
                            onMoveStop={handleMoveStop} onAdjustTarget={handleAdjustTarget}
                            onAddNote={handleAddNote} />
                        ))
                      )}
                    </div>
                  )}

                  {/* Closed Trades */}
                  {tab === "closed" && (
                    <div className="space-y-2">
                      {metrics.closed.length === 0 ? (
                        <div className="flex flex-col items-center py-14 text-center">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: C.accentDim }}>
                            <Trophy className="w-6 h-6" style={{ color: C.accent }} />
                          </div>
                          <p className="text-sm font-medium mb-1" style={{ color: C.textDim }}>No trade history yet</p>
                          <p className="text-xs max-w-[220px]" style={{ color: C.textMuted }}>
                            Your closed trades and Pansy&apos;s reviews will show up here
                          </p>
                        </div>
                      ) : (
                        metrics.closed.map(t => <ClosedTradeRow key={t.id} trade={t} />)
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Trading Tools ─────────────────────────────────────── */}
              {!authLoading && !loading && isPro && !error && view === "trades" && (
                <div className="max-w-2xl mt-8 space-y-6">
                  <RiskRewardCalculator />
                  <PositionSizeCalculator />
                </div>
              )}

              {/* ── Mobile FAB ──────────────────────────────────────── */}
              <button onClick={() => { setView("trades"); setShowOpenModal(true); }}
                className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-xl sm:hidden transition-all hover:scale-105 active:scale-95"
                style={{ background: C.accent, color: "#0a1e1e", boxShadow: `0 4px 20px rgba(132,204,22,0.3)` }}>
                <Plus className="w-6 h-6" />
              </button>

              {/* Footer disclaimer */}
              {!authLoading && !loading && isPro && !error && (
                <div className="mt-10 text-center">
                  <p className="text-[10px] leading-relaxed max-w-md mx-auto" style={{ color: C.textMuted }}>
                    Bloom Practice Trader is an educational simulator. It does not execute real trades, connect to any broker, or involve real money. Past simulated performance does not predict real market results. Not financial advice.
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </Layout>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {showOpenModal && (
        <OrderTicket buyingPower={account?.cash_balance ?? 0} onPlaced={handleTradePlaced} onClose={() => setShowOpenModal(false)} />
      )}
      {closingTrade && (
        <CloseTradeModal trade={closingTrade} currentPrice={livePrices[closingTrade.ticker] ?? null}
          onSubmit={handleCloseTrade} onCancel={() => setClosingTrade(null)} />
      )}
      {reviewState && (
        <TradeReviewModal state={reviewState} onClose={() => setReviewState(null)} />
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const result = await requireProUserSSR(req as Parameters<typeof requireProUserSSR>[0]);
  if (result.status === "not-pro") return { props: {} };
  if (result.status === "unauthenticated") return { redirect: { destination: "/auth", permanent: false } };
  return { props: { requiresClientAuth: result.status === "no-cookie" } };
};
