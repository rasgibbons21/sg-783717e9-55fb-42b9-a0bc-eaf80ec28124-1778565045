import { useState, useEffect, useCallback, useRef } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { PreTradeChecklist, type ChecklistResult } from "@/components/PreTradeChecklist";
import { ActiveTradeCard } from "@/components/ActiveTradeCard";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { marketService } from "@/services/marketService";
import {
  TrendingUp, BookOpen, X,
  AlertTriangle, Plus, Lock, Search, Sparkles, NotebookPen, Loader2, Trophy,
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

// ── Trade Review Modal ─────────────────────────────────────────────────────
interface TradeReview {
  score_pl: number; score_rr: number; score_entry: number;
  score_exit: number; score_discipline: number; overall_grade: string;
  what_went_well: string; what_to_improve: string;
  followed_plan: string; remember_next: string;
}
interface ReviewState {
  review: TradeReview | null;
  journal_id: string | null;
  loading: boolean;
  error: string;
  ticker: string;
  pnl: number;
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "bg-[#49B06E]" : score >= 55 ? "bg-yellow-400" : "bg-[#ef4444]";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-[#F4F7FA]/50 uppercase tracking-wide">{label}</span>
        <span className="text-[10px] font-mono text-[#F4F7FA]/70">{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#0E1B30] overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function gradeColor(g: string) {
  if (g === "A") return "text-[#49B06E] bg-[#49B06E]/10 border-[#49B06E]/30";
  if (g === "B") return "text-[#27B7C8] bg-[#27B7C8]/10 border-[#27B7C8]/30";
  if (g === "C") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  if (g === "D") return "text-orange-400 bg-orange-400/10 border-orange-400/30";
  return "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30";
}

function TradeReviewModal({ state, onClose }: { state: ReviewState; onClose: () => void }) {
  const { review, journal_id, loading, error, ticker, pnl } = state;
  const win = pnl >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0E1B30] rounded-2xl border border-[#27B7C8]/30 p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#27B7C8]" />
            <h2 className="font-serif text-base font-bold text-[#F4F7FA]">Trade Review — {ticker}</h2>
          </div>
          <button onClick={onClose} className="text-[#F4F7FA]/30 hover:text-[#F4F7FA]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* P/L banner */}
        <div className={`flex items-center justify-between rounded-lg px-4 py-3 mb-4 ${win ? "bg-[#49B06E]/10 border border-[#49B06E]/20" : "bg-[#ef4444]/10 border border-[#ef4444]/20"}`}>
          <span className="text-xs text-[#F4F7FA]/50">Final P/L</span>
          <span className={`font-mono font-bold ${win ? "text-[#49B06E]" : "text-[#ef4444]"}`}>
            {win ? "+" : ""}${Math.abs(pnl).toFixed(2)}
          </span>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <Loader2 className="w-5 h-5 text-[#27B7C8] animate-spin" />
            <span className="text-sm text-[#F4F7FA]/50">Pansy is reviewing your process…</span>
          </div>
        )}

        {!loading && error && (
          <p className="text-xs text-[#ef4444] bg-[#ef4444]/10 rounded-lg px-3 py-3 mb-4">{error}</p>
        )}

        {!loading && review && (
          <>
            {/* Grade + discipline score */}
            <div className="flex items-center gap-4 mb-5">
              <div className={`text-3xl font-bold font-mono w-16 h-16 rounded-xl border flex items-center justify-center flex-shrink-0 ${gradeColor(review.overall_grade)}`}>
                {review.overall_grade}
              </div>
              <div className="flex-1 space-y-2">
                <ScoreBar label="P/L Quality" score={review.score_pl} />
                <ScoreBar label="Risk/Reward" score={review.score_rr} />
                <ScoreBar label="Entry" score={review.score_entry} />
                <ScoreBar label="Exit" score={review.score_exit} />
                <ScoreBar label="Discipline" score={review.score_discipline} />
              </div>
            </div>

            {/* Pansy commentary */}
            <div className="space-y-3 mb-4">
              {[
                { label: "What went well", text: review.what_went_well, color: "text-[#49B06E]" },
                { label: "What to improve", text: review.what_to_improve, color: "text-[#ef4444]" },
                { label: "Did you follow your plan?", text: review.followed_plan, color: "text-[#27B7C8]" },
                { label: "Remember next time", text: review.remember_next, color: "text-yellow-400" },
              ].map(({ label, text, color }) => (
                <div key={label} className="rounded-lg bg-[#16264A] border border-[#27B7C8]/10 px-4 py-3">
                  <p className={`text-[10px] uppercase tracking-wide font-semibold mb-1 ${color}`}>{label}</p>
                  <p className="text-sm text-[#F4F7FA]/80 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            {journal_id && (
              <Link href="/journal" className="flex items-center gap-2 text-xs text-[#27B7C8] hover:underline mb-3">
                <NotebookPen className="w-3.5 h-3.5" />
                Open journal entry to add notes
              </Link>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#16264A] border border-[#27B7C8]/20 text-[#F4F7FA]/70 font-semibold text-sm hover:bg-[#27B7C8]/10 transition-colors"
        >
          Close
        </button>
        <p className="mt-3 text-[10px] text-[#F4F7FA]/25 text-center">
          Educational simulator — not a brokerage, not financial advice.
        </p>
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
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const [tab, setTab] = useState<"open" | "closed">("open");
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const priceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Fetch live prices for all open positions
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
        results.forEach(({ ticker, price }) => {
          if (price != null) next[ticker] = price;
        });
        return next;
      });
    } catch { /* non-fatal */ } finally {
      setPricesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isPro) loadData();
    else if (!authLoading && !isPro) setLoading(false);
  }, [authLoading, isPro, loadData]);

  // Live price polling — start once data loads, refresh every 60s
  useEffect(() => {
    const open = trades.filter(t => t.status === "open");
    if (open.length === 0) return;
    refreshPrices(open);
    priceIntervalRef.current = setInterval(() => refreshPrices(open), 60000);
    return () => {
      if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
    };
  }, [trades, refreshPrices]);

  const handleOpenTrade = async (result: ChecklistResult) => {
    const res = await apiFetch("/api/practice/trades", {
      method: "POST",
      body: JSON.stringify({
        ticker: result.ticker,
        direction: result.direction,
        shares: result.shares,
        entry_price: result.entry_price,
        stop_price: result.stop_price,
        target_price: result.target_price,
        thesis: result.thesis || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to open trade");
    setShowOpenModal(false);
    await loadData();
  };

  const handleCloseTrade = async (exitPrice: number, exitReason: string) => {
    if (!closingTrade) return;
    const tradeId = closingTrade.id;
    const ticker = closingTrade.ticker;

    const res = await apiFetch("/api/practice/close", {
      method: "POST",
      body: JSON.stringify({ trade_id: tradeId, exit_price: exitPrice, exit_reason: exitReason || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to close trade");

    setClosingTrade(null);
    await loadData();

    // Show review modal immediately (loading state), then fetch review async
    setReviewState({ review: null, journal_id: null, loading: true, error: "", ticker, pnl: data.pnl });
    apiFetch("/api/practice/review", {
      method: "POST",
      body: JSON.stringify({ trade_id: tradeId }),
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) setReviewState(prev => prev ? { ...prev, loading: false, error: d.error || "Review unavailable" } : null);
      else setReviewState(prev => prev ? { ...prev, loading: false, review: d.review, journal_id: d.journal_id } : null);
    }).catch(() => {
      setReviewState(prev => prev ? { ...prev, loading: false, error: "Review unavailable — try again" } : null);
    });
  };

  const handleCloseHalf = async (trade: Trade, exitPrice: number, exitReason: string) => {
    const res = await apiFetch("/api/practice/close-half", {
      method: "POST",
      body: JSON.stringify({ trade_id: trade.id, exit_price: exitPrice, exit_reason: exitReason || undefined }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to close half");
    await loadData();
  };

  const handleMoveStop = async (trade: Trade, newStop: number) => {
    const res = await apiFetch("/api/practice/update", {
      method: "POST",
      body: JSON.stringify({ trade_id: trade.id, stop_price: newStop }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update stop");
    setTrades(prev => prev.map(t => t.id === trade.id ? data.trade : t));
  };

  const handleAdjustTarget = async (trade: Trade, newTarget: number) => {
    const res = await apiFetch("/api/practice/update", {
      method: "POST",
      body: JSON.stringify({ trade_id: trade.id, target_price: newTarget }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update target");
    setTrades(prev => prev.map(t => t.id === trade.id ? data.trade : t));
  };

  const handleAddNote = async (trade: Trade, note: string) => {
    const res = await apiFetch("/api/practice/update", {
      method: "POST",
      body: JSON.stringify({ trade_id: trade.id, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save note");
    setTrades(prev => prev.map(t => t.id === trade.id ? data.trade : t));
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

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setShowOpenModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#49B06E] text-white font-semibold hover:bg-[#49B06E]/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Open Position
                </button>
                <Link
                  href="/research"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#16264A] border border-[#27B7C8]/30 text-[#27B7C8] font-semibold text-sm hover:bg-[#27B7C8]/10 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Research
                </Link>
                <Link
                  href="/journal"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#16264A] border border-[#27B7C8]/30 text-[#27B7C8] font-semibold text-sm hover:bg-[#27B7C8]/10 transition-colors"
                >
                  <NotebookPen className="w-4 h-4" />
                  Journal
                </Link>
                <Link
                  href="/progression"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#16264A] border border-[#27B7C8]/30 text-[#27B7C8] font-semibold text-sm hover:bg-[#27B7C8]/10 transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  Progress
                </Link>
              </div>

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
                      <ActiveTradeCard
                        key={t.id}
                        trade={t}
                        currentPrice={livePrices[t.ticker] ?? null}
                        priceLoading={pricesLoading}
                        onClose={setClosingTrade}
                        onCloseHalf={handleCloseHalf}
                        onMoveStop={handleMoveStop}
                        onAdjustTarget={handleAdjustTarget}
                        onAddNote={handleAddNote}
                      />
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
        <PreTradeChecklist
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
      {reviewState && (
        <TradeReviewModal
          state={reviewState}
          onClose={() => setReviewState(null)}
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
