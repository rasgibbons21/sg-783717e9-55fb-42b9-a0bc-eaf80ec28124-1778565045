import { useState, useEffect, useCallback } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp, BookOpen, X, ChevronDown, ChevronUp,
  AlertTriangle, Plus, Lock
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

// ── Helpers ────────────────────────────────────────────────────────────────
async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
  });
  return res;
}

function fmt(n: number | null | undefined, prefix = "$") {
  if (n == null) return "—";
  return `${prefix}${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(n: number | null | undefined) {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

// ── Metric Card ────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean | null }) {
  const color = positive === true ? "text-[#49B06E]" : positive === false ? "text-[#ef4444]" : "text-[#F4F7FA]";
  return (
    <div className="rounded-xl bg-[#16264A] border border-[#27B7C8]/20 p-4 flex flex-col gap-1">
      <span className="text-xs text-[#F4F7FA]/50 uppercase tracking-wide">{label}</span>
      <span className={`text-xl font-bold font-mono ${color}`}>{value}</span>
      {sub && <span className="text-xs text-[#F4F7FA]/40">{sub}</span>}
    </div>
  );
}

// ── Open Trade Row ─────────────────────────────────────────────────────────
function OpenTradeRow({ trade, onClose }: { trade: Trade; onClose: (t: Trade) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg bg-[#16264A] border border-[#27B7C8]/20 overflow-hidden">
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${trade.direction === "long" ? "bg-[#49B06E]" : "bg-[#ef4444]"}`} />
        <span className="font-mono font-semibold text-[#F4F7FA]">{trade.ticker}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${trade.direction === "long" ? "bg-[#49B06E]/20 text-[#49B06E]" : "bg-[#ef4444]/20 text-[#ef4444]"}`}>
          {trade.direction.toUpperCase()}
        </span>
        <span className="ml-auto text-sm text-[#F4F7FA]/60">{trade.shares}sh @ {fmt(trade.entry_price)}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-[#F4F7FA]/40" /> : <ChevronDown className="w-4 h-4 text-[#F4F7FA]/40" />}
      </div>
      {expanded && (
        <div className="border-t border-[#27B7C8]/10 p-3 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2 text-xs text-[#F4F7FA]/60">
            <span>Stop: {fmt(trade.stop_price)}</span>
            <span>Target: {fmt(trade.target_price)}</span>
            <span>Risk: {fmt(trade.risk_amount)}</span>
            <span>Cost: {fmt(trade.entry_price * trade.shares)}</span>
          </div>
          {trade.thesis && (
            <p className="text-xs text-[#F4F7FA]/50 italic border-l-2 border-[#27B7C8]/30 pl-2">{trade.thesis}</p>
          )}
          <button
            onClick={() => onClose(trade)}
            className="w-full mt-2 py-2 rounded-lg bg-[#27B7C8]/20 text-[#27B7C8] text-sm font-semibold hover:bg-[#27B7C8]/30 transition-colors"
          >
            Close Position
          </button>
        </div>
      )}
    </div>
  );
}

// ── Closed Trade Row ───────────────────────────────────────────────────────
function ClosedTradeRow({ trade }: { trade: Trade }) {
  const win = (trade.pnl ?? 0) >= 0;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#16264A] border border-[#27B7C8]/10">
      <span className={`text-xs font-semibold w-5 ${win ? "text-[#49B06E]" : "text-[#ef4444]"}`}>{win ? "W" : "L"}</span>
      <span className="font-mono text-sm text-[#F4F7FA] font-semibold w-14">{trade.ticker}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded ${trade.direction === "long" ? "bg-[#49B06E]/15 text-[#49B06E]" : "bg-[#ef4444]/15 text-[#ef4444]"}`}>
        {trade.direction[0].toUpperCase()}
      </span>
      <span className={`ml-auto text-sm font-mono font-bold ${win ? "text-[#49B06E]" : "text-[#ef4444]"}`}>
        {win ? "+" : ""}{fmt(trade.pnl)}
      </span>
      <span className="text-xs text-[#F4F7FA]/40 w-14 text-right">{fmtPct(trade.pnl_pct)}</span>
    </div>
  );
}

// ── Open Trade Modal ───────────────────────────────────────────────────────
function OpenTradeModal({ onSubmit, onClose }: {
  onSubmit: (form: Record<string, string>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ticker: "", direction: "long", shares: "", entry_price: "", stop_price: "", target_price: "", thesis: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to open trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0E1B30] rounded-2xl border border-[#27B7C8]/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-[#F4F7FA]">Open New Position</h2>
          <button onClick={onClose} className="text-[#F4F7FA]/40 hover:text-[#F4F7FA]"><X className="w-5 h-5" /></button>
        </div>
        {err && <p className="mb-3 text-sm text-[#ef4444] bg-[#ef4444]/10 rounded-lg px-3 py-2">{err}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#F4F7FA]/50 mb-1 block">Ticker *</label>
              <input
                className="w-full bg-[#16264A] border border-[#27B7C8]/20 rounded-lg px-3 py-2 text-[#F4F7FA] font-mono uppercase text-sm focus:outline-none focus:border-[#27B7C8]"
                value={form.ticker}
                onChange={e => set("ticker", e.target.value)}
                placeholder="AAPL"
                required
                maxLength={10}
              />
            </div>
            <div>
              <label className="text-xs text-[#F4F7FA]/50 mb-1 block">Direction *</label>
              <select
                className="w-full bg-[#16264A] border border-[#27B7C8]/20 rounded-lg px-3 py-2 text-[#F4F7FA] text-sm focus:outline-none focus:border-[#27B7C8]"
                value={form.direction}
                onChange={e => set("direction", e.target.value)}
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#F4F7FA]/50 mb-1 block">Shares *</label>
              <input
                type="number" min="0.0001" step="any"
                className="w-full bg-[#16264A] border border-[#27B7C8]/20 rounded-lg px-3 py-2 text-[#F4F7FA] text-sm focus:outline-none focus:border-[#27B7C8]"
                value={form.shares}
                onChange={e => set("shares", e.target.value)}
                placeholder="10"
                required
              />
            </div>
            <div>
              <label className="text-xs text-[#F4F7FA]/50 mb-1 block">Entry Price *</label>
              <input
                type="number" min="0.0001" step="any"
                className="w-full bg-[#16264A] border border-[#27B7C8]/20 rounded-lg px-3 py-2 text-[#F4F7FA] text-sm focus:outline-none focus:border-[#27B7C8]"
                value={form.entry_price}
                onChange={e => set("entry_price", e.target.value)}
                placeholder="150.00"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#F4F7FA]/50 mb-1 block">Stop Price</label>
              <input
                type="number" min="0" step="any"
                className="w-full bg-[#16264A] border border-[#27B7C8]/20 rounded-lg px-3 py-2 text-[#F4F7FA] text-sm focus:outline-none focus:border-[#27B7C8]"
                value={form.stop_price}
                onChange={e => set("stop_price", e.target.value)}
                placeholder="145.00"
              />
            </div>
            <div>
              <label className="text-xs text-[#F4F7FA]/50 mb-1 block">Target Price</label>
              <input
                type="number" min="0" step="any"
                className="w-full bg-[#16264A] border border-[#27B7C8]/20 rounded-lg px-3 py-2 text-[#F4F7FA] text-sm focus:outline-none focus:border-[#27B7C8]"
                value={form.target_price}
                onChange={e => set("target_price", e.target.value)}
                placeholder="165.00"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#F4F7FA]/50 mb-1 block">Thesis (why are you entering?)</label>
            <textarea
              className="w-full bg-[#16264A] border border-[#27B7C8]/20 rounded-lg px-3 py-2 text-[#F4F7FA] text-sm focus:outline-none focus:border-[#27B7C8] resize-none"
              value={form.thesis}
              onChange={e => set("thesis", e.target.value)}
              rows={2}
              placeholder="Breakout above resistance, strong earnings..."
            />
          </div>
          {form.shares && form.entry_price && (
            <p className="text-xs text-[#27B7C8]/80 bg-[#27B7C8]/10 rounded-lg px-3 py-2">
              Total cost: {fmt(parseFloat(form.shares) * parseFloat(form.entry_price))}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#49B06E] text-white font-semibold text-sm disabled:opacity-50 hover:bg-[#49B06E]/90 transition-colors"
          >
            {loading ? "Opening…" : "Open Position"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Close Trade Modal ──────────────────────────────────────────────────────
function CloseTradeModal({ trade, onSubmit, onCancel }: {
  trade: Trade;
  onSubmit: (exitPrice: number, exitReason: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [exitPrice, setExitPrice] = useState("");
  const [exitReason, setExitReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await onSubmit(parseFloat(exitPrice), exitReason);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to close trade");
    } finally {
      setLoading(false);
    }
  };

  const ep = parseFloat(exitPrice);
  const previewPnl = exitPrice && !isNaN(ep)
    ? trade.direction === "long"
      ? (ep - trade.entry_price) * trade.shares
      : (trade.entry_price - ep) * trade.shares
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0E1B30] rounded-2xl border border-[#27B7C8]/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-[#F4F7FA]">Close {trade.ticker}</h2>
          <button onClick={onCancel} className="text-[#F4F7FA]/40 hover:text-[#F4F7FA]"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-[#F4F7FA]/50 mb-4">
          {trade.direction.toUpperCase()} · {trade.shares} shares · Entry {fmt(trade.entry_price)}
        </p>
        {err && <p className="mb-3 text-sm text-[#ef4444] bg-[#ef4444]/10 rounded-lg px-3 py-2">{err}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-[#F4F7FA]/50 mb-1 block">Exit Price *</label>
            <input
              type="number" min="0.0001" step="any"
              className="w-full bg-[#16264A] border border-[#27B7C8]/20 rounded-lg px-3 py-2 text-[#F4F7FA] text-sm focus:outline-none focus:border-[#27B7C8]"
              value={exitPrice}
              onChange={e => setExitPrice(e.target.value)}
              placeholder="155.00"
              required
            />
          </div>
          <div>
            <label className="text-xs text-[#F4F7FA]/50 mb-1 block">Exit Reason</label>
            <input
              className="w-full bg-[#16264A] border border-[#27B7C8]/20 rounded-lg px-3 py-2 text-[#F4F7FA] text-sm focus:outline-none focus:border-[#27B7C8]"
              value={exitReason}
              onChange={e => setExitReason(e.target.value)}
              placeholder="Hit target / stopped out / reversal..."
            />
          </div>
          {previewPnl != null && (
            <p className={`text-sm font-mono font-bold rounded-lg px-3 py-2 ${previewPnl >= 0 ? "text-[#49B06E] bg-[#49B06E]/10" : "text-[#ef4444] bg-[#ef4444]/10"}`}>
              P&L: {previewPnl >= 0 ? "+" : ""}{fmt(previewPnl)}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#27B7C8] text-[#0E1B30] font-semibold text-sm disabled:opacity-50 hover:bg-[#27B7C8]/90 transition-colors"
          >
            {loading ? "Closing…" : "Confirm Close"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Compute metrics ────────────────────────────────────────────────────────
function computeMetrics(account: Account | null, trades: Trade[]) {
  const open = trades.filter(t => t.status === "open");
  const closed = trades.filter(t => t.status === "closed");
  const wins = closed.filter(t => (t.pnl ?? 0) > 0);
  const losses = closed.filter(t => (t.pnl ?? 0) <= 0);
  const winRate = closed.length ? Math.round((wins.length / closed.length) * 100) : null;
  const avgWin = wins.length ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : null;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : null;
  const avgRR = avgWin != null && avgLoss != null && avgLoss > 0 ? avgWin / avgLoss : null;

  // Discipline score: +10 for thesis, +10 for stop, +5 for target (per trade, max 100)
  const dScore = trades.length
    ? Math.min(
        100,
        Math.round(
          trades.reduce((s, t) => s + (t.thesis ? 10 : 0) + (t.stop_price ? 10 : 0) + (t.target_price ? 5 : 0), 0) /
            trades.length
        )
      )
    : 0;

  const openValue = open.reduce((s, t) => s + t.entry_price * t.shares, 0);
  const totalEquity = (account?.cash_balance ?? 0) + openValue;
  const totalPnl = totalEquity - (account?.initial_balance ?? 10000);

  return { open, closed, wins, losses, winRate, avgWin, avgLoss, avgRR, dScore, totalEquity, totalPnl, openValue };
}

// ── Gate: non-Pro ──────────────────────────────────────────────────────────
function ProGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
      <div className="rounded-full bg-[#27B7C8]/10 p-6 border border-[#27B7C8]/20">
        <Lock className="w-10 h-10 text-[#27B7C8]" />
      </div>
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#F4F7FA] mb-2">Bloom Practice Trader</h2>
        <p className="text-[#F4F7FA]/60 max-w-sm">
          Practice trading with $10,000 in virtual cash — no real money, no real risk. Upgrade to Bloom Pro to unlock.
        </p>
      </div>
      <Link
        href="/subscription"
        className="px-8 py-3 rounded-xl bg-[#49B06E] text-white font-semibold hover:bg-[#49B06E]/90 transition-colors"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PracticePage(_props: PageProps) {
  const { isPro, isLoading: authLoading } = useSubscription();
  const [account, setAccount] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [closingTrade, setClosingTrade] = useState<Trade | null>(null);
  const [tab, setTab] = useState<"open" | "closed">("open");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [accRes, tradesRes] = await Promise.all([
        apiFetch("/api/practice/account"),
        apiFetch("/api/practice/trades"),
      ]);
      if (!accRes.ok) throw new Error("Could not load account");
      if (!tradesRes.ok) throw new Error("Could not load trades");
      const { account: acc } = await accRes.json();
      const { trades: tr } = await tradesRes.json();
      setAccount(acc);
      setTrades(tr);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isPro) loadData();
    else if (!authLoading && !isPro) setLoading(false);
  }, [authLoading, isPro, loadData]);

  const handleOpenTrade = async (form: Record<string, string>) => {
    const res = await apiFetch("/api/practice/trades", {
      method: "POST",
      body: JSON.stringify({
        ticker: form.ticker,
        direction: form.direction,
        shares: parseFloat(form.shares),
        entry_price: parseFloat(form.entry_price),
        stop_price: form.stop_price ? parseFloat(form.stop_price) : undefined,
        target_price: form.target_price ? parseFloat(form.target_price) : undefined,
        thesis: form.thesis || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to open trade");
    setShowOpenModal(false);
    await loadData();
  };

  const handleCloseTrade = async (exitPrice: number, exitReason: string) => {
    if (!closingTrade) return;
    const res = await apiFetch("/api/practice/close", {
      method: "POST",
      body: JSON.stringify({ trade_id: closingTrade.id, exit_price: exitPrice, exit_reason: exitReason || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to close trade");
    setClosingTrade(null);
    await loadData();
  };

  const showProGate = !authLoading && !isPro;
  const metrics = computeMetrics(account, trades);

  return (
    <>
      <Head>
        <title>Bloom Practice Trader</title>
      </Head>
      <Layout>
        <div className="min-h-screen bg-[#0E1B30] px-4 py-6 max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <TrendingUp className="w-6 h-6 text-[#27B7C8]" />
              <h1 className="font-serif text-2xl font-bold text-[#F4F7FA]">Practice Trader</h1>
            </div>
            {/* Disclaimer — always visible */}
            <div className="flex items-start gap-2 mt-3 rounded-lg bg-[#27B7C8]/10 border border-[#27B7C8]/20 px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-[#27B7C8] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#27B7C8]/90 leading-relaxed">
                <strong>Educational simulator — not a brokerage.</strong> All trades use virtual money only. This is not financial advice and does not constitute real trading or investment activity.
              </p>
            </div>
          </div>

          {/* Loading */}
          {(authLoading || (loading && isPro)) && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-[#16264A] animate-pulse" />
              ))}
            </div>
          )}

          {/* Not Pro */}
          {showProGate && <ProGate />}

          {/* Error */}
          {!loading && !authLoading && isPro && error && (
            <div className="rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 px-4 py-3 text-sm text-[#ef4444] mb-4">
              {error}
              <button onClick={loadData} className="ml-2 underline">Retry</button>
            </div>
          )}

          {/* Dashboard */}
          {!authLoading && !loading && isPro && !error && (
            <>
              {/* Account Summary */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <MetricCard
                  label="Total Equity"
                  value={fmt(metrics.totalEquity)}
                  sub={`${metrics.totalPnl >= 0 ? "+" : ""}${fmt(metrics.totalPnl)} all time`}
                  positive={metrics.totalPnl > 0 ? true : metrics.totalPnl < 0 ? false : null}
                />
                <MetricCard
                  label="Cash Available"
                  value={fmt(account?.cash_balance)}
                  sub={`${metrics.open.length} open position${metrics.open.length !== 1 ? "s" : ""}`}
                />
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <MetricCard
                  label="Win Rate"
                  value={metrics.winRate != null ? `${metrics.winRate}%` : "—"}
                  sub={`${metrics.wins.length}W / ${metrics.losses.length}L`}
                  positive={metrics.winRate != null ? metrics.winRate >= 50 : null}
                />
                <MetricCard
                  label="Avg Winner"
                  value={fmt(metrics.avgWin)}
                  positive={metrics.avgWin != null ? true : null}
                />
                <MetricCard
                  label="Avg Loser"
                  value={metrics.avgLoss != null ? `-${fmt(metrics.avgLoss)}` : "—"}
                  positive={metrics.avgLoss != null ? false : null}
                />
                <MetricCard
                  label="Avg Risk/Reward"
                  value={metrics.avgRR != null ? `${metrics.avgRR.toFixed(2)}R` : "—"}
                  positive={metrics.avgRR != null ? metrics.avgRR >= 1.5 : null}
                />
              </div>

              {/* Discipline & Progress */}
              <div className="rounded-xl bg-[#16264A] border border-[#27B7C8]/20 p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#27B7C8]" />
                    <span className="text-sm font-semibold text-[#F4F7FA]">Discipline Score</span>
                  </div>
                  <span className={`text-lg font-mono font-bold ${metrics.dScore >= 70 ? "text-[#49B06E]" : metrics.dScore >= 40 ? "text-yellow-400" : "text-[#ef4444]"}`}>
                    {metrics.dScore}/100
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#0E1B30] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${metrics.dScore >= 70 ? "bg-[#49B06E]" : metrics.dScore >= 40 ? "bg-yellow-400" : "bg-[#ef4444]"}`}
                    style={{ width: `${metrics.dScore}%` }}
                  />
                </div>
                <p className="text-xs text-[#F4F7FA]/40 mt-2">
                  Score improves when you set a thesis, stop, and target before entering. ({trades.length} trade{trades.length !== 1 ? "s" : ""} tracked)
                </p>
              </div>

              {/* New Trade Button */}
              <button
                onClick={() => setShowOpenModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#49B06E] text-white font-semibold mb-6 hover:bg-[#49B06E]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Open New Position
              </button>

              {/* Trades Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setTab("open")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "open" ? "bg-[#27B7C8]/20 text-[#27B7C8]" : "text-[#F4F7FA]/40 hover:text-[#F4F7FA]"}`}
                >
                  Open ({metrics.open.length})
                </button>
                <button
                  onClick={() => setTab("closed")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === "closed" ? "bg-[#27B7C8]/20 text-[#27B7C8]" : "text-[#F4F7FA]/40 hover:text-[#F4F7FA]"}`}
                >
                  Closed ({metrics.closed.length})
                </button>
              </div>

              {tab === "open" && (
                <div className="space-y-3">
                  {metrics.open.length === 0 ? (
                    <div className="text-center py-10 text-[#F4F7FA]/30 text-sm">
                      No open positions. Hit &ldquo;Open New Position&rdquo; to start practicing.
                    </div>
                  ) : (
                    metrics.open.map(t => (
                      <OpenTradeRow key={t.id} trade={t} onClose={setClosingTrade} />
                    ))
                  )}
                </div>
              )}

              {tab === "closed" && (
                <div className="space-y-2">
                  {metrics.closed.length === 0 ? (
                    <div className="text-center py-10 text-[#F4F7FA]/30 text-sm">
                      No closed trades yet.
                    </div>
                  ) : (
                    metrics.closed.map(t => <ClosedTradeRow key={t.id} trade={t} />)
                  )}
                </div>
              )}

              {/* Bottom disclaimer */}
              <div className="mt-8 text-center">
                <p className="text-[10px] text-[#F4F7FA]/25 leading-relaxed max-w-sm mx-auto">
                  Bloom Practice Trader is an educational simulator. It does not execute real trades, connect to any broker, or involve real money. Past simulated performance does not predict real market results. Not financial advice.
                </p>
              </div>
            </>
          )}
        </div>
      </Layout>

      {showOpenModal && (
        <OpenTradeModal
          onSubmit={handleOpenTrade}
          onClose={() => setShowOpenModal(false)}
        />
      )}
      {closingTrade && (
        <CloseTradeModal
          trade={closingTrade}
          onSubmit={handleCloseTrade}
          onCancel={() => setClosingTrade(null)}
        />
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const result = await requireProUserSSR(req as Parameters<typeof requireProUserSSR>[0]);

  if (result.status === "not-pro") {
    return { props: {} }; // page renders ProGate client-side (client confirms via API)
  }
  if (result.status === "unauthenticated") {
    return { redirect: { destination: "/auth", permanent: false } };
  }
  // "ok" or "no-cookie" — render page; Pro check happens client-side via API
  return { props: { requiresClientAuth: result.status === "no-cookie" } };
};
