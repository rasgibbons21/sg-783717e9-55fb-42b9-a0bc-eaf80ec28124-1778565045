import { useState, useEffect, useCallback, useRef } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { OrderTicket } from "@/components/OrderTicket";
import { ActiveTradeCard } from "@/components/ActiveTradeCard";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { marketService } from "@/services/marketService";
import { canShowExternalPayment } from "@/lib/payments";
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
function MetricCard({ label, value, sub, positive, icon }: { label: string; value: string; sub?: string; positive?: boolean | null; icon?: React.ReactNode }) {
  const color = positive === true ? "text-primary" : positive === false ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-2xl bg-card border border-accent/15 p-4 flex flex-col gap-1.5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2">
        {icon && <span className="text-accent/60">{icon}</span>}
        <span className="text-[11px] text-foreground/50 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
      {sub && <span className="text-xs text-foreground/40">{sub}</span>}
    </div>
  );
}


// ── Closed Trade Row ───────────────────────────────────────────────────────
function ClosedTradeRow({ trade }: { trade: Trade }) {
  const win = (trade.pnl ?? 0) >= 0;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-accent/10">
      <span className={`text-xs font-semibold w-5 ${win ? "text-primary" : "text-destructive"}`}>{win ? "W" : "L"}</span>
      <span className="font-mono text-sm text-foreground font-semibold w-14">{trade.ticker}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded ${trade.direction === "long" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
        {trade.direction[0].toUpperCase()}
      </span>
      <span className={`ml-auto text-sm font-mono font-bold ${win ? "text-primary" : "text-destructive"}`}>
        {win ? "+" : ""}{fmt(trade.pnl)}
      </span>
      <span className="text-xs text-foreground/40 w-14 text-right">{fmtPct(trade.pnl_pct)}</span>
    </div>
  );
}

// ── Close Trade Modal ──────────────────────────────────────────────────────
const CLOSE_REASONS = ["Hit target", "Stopped out", "Changed my mind", "Taking profit", "Cutting loss"];

function CloseTradeModal({ trade, currentPrice, onSubmit, onCancel }: {
  trade: Trade;
  currentPrice: number | null;
  onSubmit: (exitReason: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [exitReason, setExitReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleConfirm = async () => {
    setErr("");
    setLoading(true);
    try {
      await onSubmit(exitReason);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to close trade");
      setLoading(false);
    }
  };

  // P&L preview from the latest polled price (the actual fill is a fresh server quote).
  const previewPnl = currentPrice != null
    ? trade.direction === "long"
      ? (currentPrice - trade.entry_price) * trade.shares
      : (trade.entry_price - currentPrice) * trade.shares
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-2xl border border-accent/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-foreground">Close {trade.ticker} at market</h2>
          <button onClick={onCancel} className="text-foreground/40 hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-foreground/50 mb-4">
          {trade.direction.toUpperCase()} · {trade.shares} shares · Entry {fmt(trade.entry_price)}
          {currentPrice != null && <> · Now {fmt(currentPrice)}</>}
        </p>

        {previewPnl != null && (
          <p className={`text-sm font-mono font-bold rounded-lg px-3 py-2 mb-4 ${previewPnl >= 0 ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"}`}>
            Est. P&L: {previewPnl >= 0 ? "+" : ""}{fmt(previewPnl)} <span className="font-sans font-normal text-foreground/40">(fills at the live price)</span>
          </p>
        )}

        <label className="text-xs text-foreground/50 mb-1.5 block">Reason (optional)</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {CLOSE_REASONS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setExitReason(exitReason === r ? "" : r)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                exitReason === r ? "border-accent bg-accent/15 text-accent" : "border-accent/20 text-foreground/60 hover:border-accent/40"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {err && <p className="mb-3 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{err}</p>}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm disabled:opacity-50 hover:bg-accent/90 transition-colors"
        >
          {loading ? "Closing…" : "Close at market"}
        </button>
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
  const color = score >= 80 ? "bg-primary" : score >= 55 ? "bg-yellow-400" : "bg-destructive";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-foreground/50 uppercase tracking-wide">{label}</span>
        <span className="text-[10px] font-mono text-foreground/70">{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-background overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function gradeColor(g: string) {
  if (g === "A") return "text-primary bg-primary/10 border-primary/30";
  if (g === "B") return "text-accent bg-accent/10 border-accent/30";
  if (g === "C") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  if (g === "D") return "text-orange-400 bg-orange-400/10 border-orange-400/30";
  return "text-destructive bg-destructive/10 border-destructive/30";
}

function TradeReviewModal({ state, onClose }: { state: ReviewState; onClose: () => void }) {
  const { review, journal_id, loading, error, ticker, pnl } = state;
  const win = pnl >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background rounded-2xl border border-accent/30 p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h2 className="font-serif text-base font-bold text-foreground">Trade Review — {ticker}</h2>
          </div>
          <button onClick={onClose} className="text-foreground/30 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* P/L banner */}
        <div className={`flex items-center justify-between rounded-lg px-4 py-3 mb-4 ${win ? "bg-primary/10 border border-primary/20" : "bg-destructive/10 border border-destructive/20"}`}>
          <span className="text-xs text-foreground/50">Final P/L</span>
          <span className={`font-mono font-bold ${win ? "text-primary" : "text-destructive"}`}>
            {win ? "+" : ""}${Math.abs(pnl).toFixed(2)}
          </span>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
            <span className="text-sm text-foreground/50">Pansy is reviewing your process…</span>
          </div>
        )}

        {!loading && error && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-3 mb-4">{error}</p>
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
                { label: "What went well", text: review.what_went_well, color: "text-primary" },
                { label: "What to improve", text: review.what_to_improve, color: "text-destructive" },
                { label: "Did you follow your plan?", text: review.followed_plan, color: "text-accent" },
                { label: "Remember next time", text: review.remember_next, color: "text-yellow-400" },
              ].map(({ label, text, color }) => (
                <div key={label} className="rounded-lg bg-card border border-accent/10 px-4 py-3">
                  <p className={`text-[10px] uppercase tracking-wide font-semibold mb-1 ${color}`}>{label}</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            {journal_id && (
              <Link href="/journal" className="flex items-center gap-2 text-xs text-accent hover:underline mb-3">
                <NotebookPen className="w-3.5 h-3.5" />
                Open journal entry to add notes
              </Link>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-card border border-accent/20 text-foreground/70 font-semibold text-sm hover:bg-accent/10 transition-colors"
        >
          Close
        </button>
        <p className="mt-3 text-[10px] text-foreground/25 text-center">
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
      <div className="rounded-full bg-accent/10 p-6 border border-accent/20">
        <Lock className="w-10 h-10 text-accent" />
      </div>
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Bloom Practice Trader</h2>
        <p className="text-foreground/60 max-w-sm">
          {canShowExternalPayment
            ? "Practice trading with $10,000 in virtual cash — no real money, no real risk. Upgrade to Bloom Pro to unlock."
            : "This feature isn’t available in this version."}
        </p>
      </div>
      {canShowExternalPayment && (
        <Link
          href="/subscription"
          className="px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Upgrade to Pro
        </Link>
      )}
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

  const handleTradePlaced = async () => {
    setShowOpenModal(false);
    await loadData();
  };

  const handleCloseTrade = async (exitReason: string) => {
    if (!closingTrade) return;
    const tradeId = closingTrade.id;
    const ticker = closingTrade.ticker;

    // Market close — server fills at a fresh quote; no client exit price.
    const res = await apiFetch("/api/practice/close", {
      method: "POST",
      body: JSON.stringify({ trade_id: tradeId, exit_reason: exitReason || undefined }),
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

  const handleCloseHalf = async (trade: Trade, exitReason: string) => {
    const res = await apiFetch("/api/practice/close-half", {
      method: "POST",
      body: JSON.stringify({ trade_id: trade.id, exit_reason: exitReason || undefined }),
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
        <div className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">Practice Trader</h1>
                <p className="text-xs text-foreground/50">Build your skills risk-free with $10k virtual cash</p>
              </div>
            </div>
            <div className="flex items-start gap-2 mt-4 rounded-xl bg-accent/5 border border-accent/10 px-4 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-accent/60 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-foreground/40 leading-relaxed">
                Educational simulator — virtual money only. Not financial advice.
              </p>
            </div>
          </div>

          {/* Loading */}
          {(authLoading || (loading && isPro)) && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-sm text-foreground/40">Loading your portfolio...</p>
            </div>
          )}

          {/* Not Pro */}
          {showProGate && <ProGate />}

          {/* Error */}
          {!loading && !authLoading && isPro && error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">
              {error}
              <button onClick={loadData} className="ml-2 underline">Retry</button>
            </div>
          )}

          {/* Dashboard */}
          {!authLoading && !loading && isPro && !error && (
            <>
              {/* Portfolio Overview */}
              <div className="rounded-2xl bg-gradient-to-br from-card to-accent/5 border border-accent/15 p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-foreground/50 uppercase tracking-wider font-medium">Portfolio Value</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${metrics.totalPnl >= 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                    {metrics.totalPnl >= 0 ? "+" : ""}{fmt(metrics.totalPnl)} all time
                  </span>
                </div>
                <p className={`text-3xl font-bold font-mono mb-1 ${metrics.totalPnl > 0 ? "text-primary" : metrics.totalPnl < 0 ? "text-destructive" : "text-foreground"}`}>
                  {fmt(metrics.totalEquity)}
                </p>
                <p className="text-xs text-foreground/40">
                  {fmt(account?.cash_balance)} available · {metrics.open.length} open position{metrics.open.length !== 1 ? "s" : ""}
                </p>
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
                  label="Avg R:R"
                  value={metrics.avgRR != null ? `${metrics.avgRR.toFixed(1)}R` : "—"}
                  positive={metrics.avgRR != null ? metrics.avgRR >= 1.5 : null}
                />
              </div>

              {/* Discipline Score */}
              <div className="rounded-2xl bg-card border border-accent/15 p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent/70" />
                    <span className="text-sm font-semibold text-foreground">Discipline</span>
                  </div>
                  <span className={`text-2xl font-mono font-bold ${metrics.dScore >= 70 ? "text-primary" : metrics.dScore >= 40 ? "text-yellow-400" : "text-destructive"}`}>
                    {metrics.dScore}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-background/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${metrics.dScore >= 70 ? "bg-gradient-to-r from-primary/80 to-primary" : metrics.dScore >= 40 ? "bg-gradient-to-r from-yellow-400/80 to-yellow-400" : "bg-gradient-to-r from-destructive/80 to-destructive"}`}
                    style={{ width: `${metrics.dScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-foreground/35 mt-2.5">
                  Set a thesis, stop, and target on each trade to grow this score
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mb-6">
                <button
                  onClick={() => setShowOpenModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  Open New Position
                </button>
                <div className="grid grid-cols-3 gap-2.5 mt-3">
                  <Link
                    href="/research"
                    className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-card border border-accent/15 text-foreground/60 text-xs font-medium hover:bg-accent/5 hover:text-accent hover:border-accent/30 transition-all"
                  >
                    <Search className="w-4 h-4" />
                    Research
                  </Link>
                  <Link
                    href="/journal"
                    className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-card border border-accent/15 text-foreground/60 text-xs font-medium hover:bg-accent/5 hover:text-accent hover:border-accent/30 transition-all"
                  >
                    <NotebookPen className="w-4 h-4" />
                    Journal
                  </Link>
                  <Link
                    href="/progression"
                    className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-card border border-accent/15 text-foreground/60 text-xs font-medium hover:bg-accent/5 hover:text-accent hover:border-accent/30 transition-all"
                  >
                    <Trophy className="w-4 h-4" />
                    Progress
                  </Link>
                </div>
              </div>

              {/* Trades Tabs */}
              <div className="flex gap-1 mb-5 bg-card rounded-xl border border-accent/10 p-1">
                <button
                  onClick={() => setTab("open")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "open" ? "bg-accent/15 text-accent shadow-sm" : "text-foreground/40 hover:text-foreground/60"}`}
                >
                  Open{metrics.open.length > 0 && ` (${metrics.open.length})`}
                </button>
                <button
                  onClick={() => setTab("closed")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "closed" ? "bg-accent/15 text-accent shadow-sm" : "text-foreground/40 hover:text-foreground/60"}`}
                >
                  History{metrics.closed.length > 0 && ` (${metrics.closed.length})`}
                </button>
              </div>

              {tab === "open" && (
                <div className="space-y-3">
                  {metrics.open.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-accent/50" />
                      </div>
                      <p className="text-sm text-foreground/50 font-medium mb-1">No open positions yet</p>
                      <p className="text-xs text-foreground/30 max-w-[200px]">Research a stock, form a thesis, then open your first practice trade</p>
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
                    <div className="flex flex-col items-center py-12 text-center">
                      <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                        <Trophy className="w-6 h-6 text-accent/50" />
                      </div>
                      <p className="text-sm text-foreground/50 font-medium mb-1">No trade history yet</p>
                      <p className="text-xs text-foreground/30 max-w-[200px]">Your closed trades and Pansy&apos;s reviews will show up here</p>
                    </div>
                  ) : (
                    metrics.closed.map(t => <ClosedTradeRow key={t.id} trade={t} />)
                  )}
                </div>
              )}

              {/* Bottom disclaimer */}
              <div className="mt-8 text-center">
                <p className="text-[10px] text-foreground/25 leading-relaxed max-w-sm mx-auto">
                  Bloom Practice Trader is an educational simulator. It does not execute real trades, connect to any broker, or involve real money. Past simulated performance does not predict real market results. Not financial advice.
                </p>
              </div>
            </>
          )}
        </div>
      </Layout>

      {showOpenModal && (
        <OrderTicket
          buyingPower={account?.cash_balance ?? 0}
          onPlaced={handleTradePlaced}
          onClose={() => setShowOpenModal(false)}
        />
      )}
      {closingTrade && (
        <CloseTradeModal
          trade={closingTrade}
          currentPrice={livePrices[closingTrade.ticker] ?? null}
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
