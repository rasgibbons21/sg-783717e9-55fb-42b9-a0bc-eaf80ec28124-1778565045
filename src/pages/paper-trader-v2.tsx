/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { AdMobBanner } from "@/components/AdMobBanner";
import Link from "next/link";
import { ALL_STRATEGIES } from "@/data/strategy-lab";
import {
  TrendingUp, TrendingDown, Trophy, Flame, X, ChevronRight,
  BarChart3, Wallet, ArrowUp, Loader2, Target,
  DollarSign, Zap, Crown, RefreshCw, BookOpen, Plus,
  Eye, Star, Lightbulb, AlertTriangle, Clock, Search,
} from "lucide-react";

const C = {
  navy: "#0E1B30",
  navyLight: "#162540",
  navyCard: "#1A2D4A",
  teal: "#27B7C8",
  tealDim: "rgba(39, 183, 200, 0.15)",
  emerald: "#49B06E",
  emeraldDim: "rgba(73, 176, 110, 0.15)",
  ivory: "#F4F7FA",
  ivoryDim: "rgba(244, 247, 250, 0.7)",
  red: "#E5484D",
  redDim: "rgba(229, 72, 77, 0.12)",
  textPrimary: "#F4F7FA",
  textSecondary: "rgba(244, 247, 250, 0.6)",
  textMuted: "rgba(244, 247, 250, 0.35)",
  border: "rgba(39, 183, 200, 0.15)",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  amber: "#FB923C",
  purple: "#A78BFA",
};

interface Account { id: string; cash_balance: number; initial_balance: number; }
interface Trade {
  id: string; ticker: string; direction: "long" | "short"; shares: number;
  entry_price: number; exit_price: number | null; stop_price: number | null;
  target_price: number | null; pnl: number | null; pnl_pct: number | null;
  status: "open" | "closed"; created_at: string; exit_at: string | null;
  thesis: string | null;
}
interface LeaderboardRow {
  user_id: string; display_name: string; total_pnl: number;
  total_trades: number; win_rate: number; rank: number;
}
interface WinLossState {
  show: boolean; pnl: number; streak: number; rank: number; isWin: boolean;
}
interface WatchlistItem {
  id: string; ticker: string; asset_type: string;
}

type TabView = "trade" | "positions" | "strategies" | "leaderboard";

function fmt(n: number) {
  return `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function haptic(style: "light" | "medium" | "heavy" = "light") {
  try {
    if ("vibrate" in navigator) navigator.vibrate(style === "light" ? 10 : style === "medium" ? 25 : 50);
  } catch {}
}

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

function TapButton({ children, onClick, style, className, disabled }: {
  children: React.ReactNode; onClick: () => void; style?: React.CSSProperties;
  className?: string; disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={() => { haptic("light"); onClick(); }}
      style={style}
      className={className}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}

function CountUp({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) =>
    `${prefix}${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  );
  useEffect(() => { spring.set(value); }, [value, spring]);
  return <motion.span>{display}</motion.span>;
}

const STRATEGY_TIPS = ALL_STRATEGIES
  .filter(s => s.category !== "Indicator Workshop")
  .slice(0, 12)
  .map(s => ({
    slug: s.slug,
    name: s.name,
    category: s.category,
    icon: s.icon,
    difficulty: s.difficulty,
    timeframe: s.timeframe,
    conditions: s.marketConditions,
    entry: s.sections.find(sec => sec.type === "entry")?.content.slice(0, 180) ?? "",
    stop: s.sections.find(sec => sec.type === "invalidation")?.content.slice(0, 120) ?? "",
  }));

export default function PaperTraderV2() {
  const { isPro, isTrial, trialDaysLeft, userId: subUserId } = useSubscription();
  const showAds = !isPro;
  const [account, setAccount] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [thesis, setThesis] = useState("");
  const [formError, setFormError] = useState("");
  const [isTrading, setIsTrading] = useState(false);
  const [isClosing, setIsClosing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<TabView>("trade");
  const [winLoss, setWinLoss] = useState<WinLossState | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  const symbolRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { setUserId(user.id); loadAll(user.id); }
      else setLoading(false);
    })();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = useCallback(async (uid?: string) => {
    try {
      const [accRes, tradeRes, lbRes] = await Promise.all([
        apiFetch("/api/practice/account"),
        apiFetch("/api/practice/trades"),
        apiFetch("/api/practice/leaderboard"),
      ]);

      if (accRes.ok) { const d = await accRes.json(); setAccount(d.account); }
      if (tradeRes.ok) { const d = await tradeRes.json(); setTrades(d.trades ?? []); }
      if (lbRes.ok) {
        const d = await lbRes.json();
        setLeaderboard(d.top ?? []);
        setMyRank(d.me ?? null);
      }

      const userIdToUse = uid || userId;
      if (userIdToUse) {
        const { data: wl } = await supabase
          .from("watchlist")
          .select("id, ticker, asset_type")
          .eq("user_id", userIdToUse)
          .order("added_at", { ascending: false })
          .limit(20);
        if (wl) setWatchlist(wl);
      }
    } catch (e) { console.error("Load error:", e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [userId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    haptic("light");
    await loadAll();
  }, [loadAll]);

  const openTrades = trades.filter(t => t.status === "open");
  const closedTrades = trades.filter(t => t.status === "closed");
  const wins = closedTrades.filter(t => (t.pnl ?? 0) > 0).length;
  const winRate = closedTrades.length > 0 ? Math.round((wins / closedTrades.length) * 100) : 0;
  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);

  let currentStreak = 0;
  for (const t of closedTrades) {
    if ((t.pnl ?? 0) > 0) currentStreak++;
    else break;
  }

  const portfolioValue = account
    ? account.cash_balance + openTrades.reduce((s, t) => s + t.entry_price * t.shares, 0)
    : 0;
  const totalReturn = account ? portfolioValue - account.initial_balance : 0;
  const totalReturnPct = account && account.initial_balance > 0
    ? ((totalReturn / account.initial_balance) * 100).toFixed(1) : "0.0";

  const executeTrade = useCallback(async () => {
    setFormError("");
    const sym = ticker.trim().toUpperCase();
    const qty = parseInt(shares, 10);
    const stop = parseFloat(stopPrice);

    if (!sym) { setFormError("Enter a stock symbol"); return; }
    if (!qty || qty <= 0) { setFormError("Enter shares"); return; }
    if (!stop || stop <= 0) { setFormError("Enter a stop-loss price"); return; }

    setIsTrading(true);
    haptic("medium");

    try {
      const res = await apiFetch("/api/practice/trades", {
        method: "POST",
        body: JSON.stringify({ ticker: sym, direction: "long", shares: qty, stop_price: stop, thesis: thesis.trim() || undefined }),
      });
      const d = await res.json();
      if (!res.ok) { setFormError(d.error || "Trade failed"); return; }

      haptic("heavy");
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 }, colors: [C.emerald, C.teal, C.ivory] });

      setTicker("");
      setShares("");
      setStopPrice("");
      setThesis("");
      symbolRef.current?.focus();
      await loadAll();
    } catch { setFormError("Network error"); }
    finally { setIsTrading(false); }
  }, [ticker, shares, stopPrice, thesis, loadAll]);

  const closeTrade = useCallback(async (tradeId: string) => {
    setIsClosing(tradeId);
    haptic("medium");

    try {
      const res = await apiFetch("/api/practice/close", {
        method: "POST",
        body: JSON.stringify({ trade_id: tradeId, exit_reason: "manual_close" }),
      });
      const d = await res.json();
      if (!res.ok) { setFormError(d.error || "Close failed"); return; }

      const pnl = d.pnl ?? 0;
      const isWin = pnl >= 0;
      const newStreak = isWin ? currentStreak + 1 : 0;

      if (isWin) {
        haptic("heavy");
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 }, colors: [C.emerald, C.teal, C.gold, C.ivory] });
      } else {
        haptic("medium");
      }

      setWinLoss({ show: true, pnl, streak: newStreak, rank: myRank?.rank ?? 0, isWin });
      timerRef.current = setTimeout(() => setWinLoss(null), 3500);

      await loadAll();
    } catch { setFormError("Network error"); }
    finally { setIsClosing(null); }
  }, [loadAll, currentStreak, myRank]);

  const selectFromWatchlist = (sym: string) => {
    setTicker(sym);
    setActiveTab("trade");
    haptic("light");
    setTimeout(() => symbolRef.current?.focus(), 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" style={{ background: C.navy }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 className="w-10 h-10" style={{ color: C.teal }} />
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Paper Trading Simulator — Practice Stock Trading Free | Bloom</title>
        <meta name="description" content="Practice buying and selling real stocks with $10,000 in virtual money. Real-time prices, interactive candlestick charts, trade journal, and P&amp;L tracking. Zero risk stock trading simulator for women learning to invest." />
      </Head>
      <Layout>
        <div className="min-h-screen pb-24" style={{ background: C.navy }}>

          {/* Trial Banner */}
          {isTrial && trialDaysLeft !== null && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="px-4 py-2.5 text-center text-xs font-medium flex items-center justify-center gap-2"
              style={{ background: C.tealDim, color: C.teal }}
            >
              <Zap className="w-3.5 h-3.5" />
              {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in trial
              <Link href="/subscription" className="underline font-bold ml-1">Go Pro</Link>
            </motion.div>
          )}

          {/* ══════ PORTFOLIO HEADER ══════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-4 pt-6 pb-2"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: C.textSecondary }}>
                Portfolio Value
              </p>
              <TapButton onClick={refresh} className="p-2 rounded-lg" style={{ color: C.textMuted }}>
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </TapButton>
            </div>

            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-4xl font-bold font-sans tracking-tight" style={{ color: C.textPrimary }}>
                <CountUp value={portfolioValue} />
              </span>
              <motion.span
                key={totalReturnPct}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-sm font-semibold px-2.5 py-1 rounded-full"
                style={{
                  color: totalReturn >= 0 ? C.emerald : C.red,
                  background: totalReturn >= 0 ? C.emeraldDim : C.redDim,
                }}
              >
                {totalReturn >= 0 ? "+" : ""}{totalReturnPct}%
              </motion.span>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { icon: <Wallet className="w-3.5 h-3.5" />, value: fmt(account?.cash_balance ?? 0), label: "Buying Power", color: C.teal },
                { icon: <DollarSign className="w-3.5 h-3.5" />, value: `${totalPnl >= 0 ? "+" : "-"}${fmt(totalPnl)}`, label: "Total P/L", color: totalPnl >= 0 ? C.emerald : C.red },
                { icon: <Target className="w-3.5 h-3.5" />, value: `${winRate}%`, label: "Win Rate", color: winRate >= 50 ? C.emerald : C.amber },
                { icon: <Flame className="w-3.5 h-3.5" />, value: `${currentStreak}`, label: "Win Streak", color: currentStreak > 0 ? C.amber : C.textMuted },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="rounded-xl p-2.5 text-center"
                  style={{ background: C.navyLight, border: `1px solid ${C.border}` }}
                >
                  <div className="flex items-center justify-center mb-1" style={{ color: C.textMuted }}>{s.icon}</div>
                  <p className="text-xs font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: C.textMuted }}>{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Rank badge */}
            {myRank && (
              <TapButton
                onClick={() => { setActiveTab("leaderboard"); }}
                className="flex items-center gap-2 px-3 py-2 rounded-full"
                style={{ background: C.tealDim, border: `1px solid ${C.border}` }}
              >
                <Trophy className="w-3.5 h-3.5" style={{ color: C.teal }} />
                <span className="text-xs font-medium" style={{ color: C.teal }}>
                  #{myRank.rank} on leaderboard
                </span>
                <ChevronRight className="w-3 h-3" style={{ color: C.teal }} />
              </TapButton>
            )}
          </motion.div>

          {/* ══════ TAB NAVIGATION ══════ */}
          <div className="px-4 mb-4 mt-2">
            <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: C.navyLight, border: `1px solid ${C.border}` }}>
              {([
                { key: "trade" as TabView, label: "Trade", icon: <Target className="w-3.5 h-3.5" /> },
                { key: "positions" as TabView, label: "Positions", icon: <BarChart3 className="w-3.5 h-3.5" />, badge: openTrades.length },
                { key: "strategies" as TabView, label: "Strategies", icon: <Lightbulb className="w-3.5 h-3.5" /> },
                { key: "leaderboard" as TabView, label: "Ranks", icon: <Trophy className="w-3.5 h-3.5" /> },
              ]).map(tab => (
                <TapButton
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all relative"
                  style={{
                    background: activeTab === tab.key ? `linear-gradient(135deg, ${C.teal}, ${C.emerald})` : "transparent",
                    color: activeTab === tab.key ? "#fff" : C.textSecondary,
                  }}
                >
                  {tab.icon}
                  <span className="hidden xs:inline">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                      style={{ background: C.amber, color: C.navy }}>
                      {tab.badge}
                    </span>
                  )}
                </TapButton>
              ))}
            </div>
          </div>

          {/* Ad: Top */}
          {showAds && (
            <div className="px-4 mb-3">
              <AdMobBanner format="banner" />
            </div>
          )}

          {/* ══════ TRADE TAB ══════ */}
          {activeTab === "trade" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 space-y-4">

              {/* Watchlist Panel */}
              {watchlist.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: C.navyLight, border: `1px solid ${C.border}` }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" style={{ color: C.teal }} />
                      <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>Your Watchlist</h3>
                    </div>
                    <Link href="/discover" className="text-[10px] font-medium flex items-center gap-1" style={{ color: C.teal }}>
                      <Plus className="w-3 h-3" /> Add
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="flex gap-2 p-3 min-w-max">
                      {watchlist.map((item, i) => (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => selectFromWatchlist(item.ticker)}
                          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all"
                          style={{
                            background: ticker === item.ticker ? C.tealDim : C.navy,
                            border: `1px solid ${ticker === item.ticker ? C.teal : C.border}`,
                          }}
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                            style={{ background: C.tealDim, color: C.teal }}>
                            {item.ticker.slice(0, 2)}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-mono font-bold" style={{ color: C.textPrimary }}>{item.ticker}</p>
                            <p className="text-[9px] capitalize" style={{ color: C.textMuted }}>{item.asset_type}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No watchlist — prompt */}
              {watchlist.length === 0 && (
                <Link href="/discover">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: C.tealDim, border: `1px solid ${C.border}` }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.teal + "20" }}>
                      <Search className="w-5 h-5" style={{ color: C.teal }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>Build your watchlist</p>
                      <p className="text-xs" style={{ color: C.textSecondary }}>Research stocks in Discover, then trade them here</p>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: C.teal }} />
                  </motion.div>
                </Link>
              )}

              {/* Trade Entry Form */}
              <div className="rounded-2xl p-4" style={{ background: C.navyLight, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4" style={{ color: C.teal }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.teal }}>
                    New Trade
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: C.textMuted }}>Symbol</label>
                    <input
                      ref={symbolRef}
                      type="text"
                      value={ticker}
                      onChange={e => setTicker(e.target.value.toUpperCase())}
                      placeholder="AAPL"
                      className="w-full px-3 py-3 rounded-xl text-sm font-mono font-semibold outline-none transition-all focus:ring-2 focus:ring-[#27B7C8]/30"
                      style={{ background: C.navy, color: C.textPrimary, border: `1px solid ${C.border}` }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: C.textMuted }}>Shares</label>
                    <input
                      type="number"
                      value={shares}
                      onChange={e => setShares(e.target.value)}
                      placeholder="10"
                      min="1"
                      className="w-full px-3 py-3 rounded-xl text-sm font-mono font-semibold outline-none transition-all focus:ring-2 focus:ring-[#27B7C8]/30"
                      style={{ background: C.navy, color: C.textPrimary, border: `1px solid ${C.border}` }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: C.textMuted }}>Stop $</label>
                    <input
                      type="number"
                      value={stopPrice}
                      onChange={e => setStopPrice(e.target.value)}
                      placeholder="180"
                      step="0.01"
                      className="w-full px-3 py-3 rounded-xl text-sm font-mono font-semibold outline-none transition-all focus:ring-2 focus:ring-[#27B7C8]/30"
                      style={{ background: C.navy, color: C.textPrimary, border: `1px solid ${C.border}` }}
                    />
                  </div>
                </div>

                {/* Trade thesis */}
                <div className="mb-3">
                  <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: C.textMuted }}>
                    Why this trade? (optional)
                  </label>
                  <input
                    type="text"
                    value={thesis}
                    onChange={e => setThesis(e.target.value)}
                    placeholder="e.g. Breakout above resistance with volume"
                    className="w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all focus:ring-2 focus:ring-[#27B7C8]/30"
                    style={{ background: C.navy, color: C.textPrimary, border: `1px solid ${C.border}` }}
                  />
                </div>

                <AnimatePresence>
                  {formError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs mb-3 px-1 flex items-center gap-1"
                      style={{ color: C.red }}
                    >
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {formError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <TapButton
                  onClick={executeTrade}
                  disabled={isTrading}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${C.emerald}, ${C.teal})`, color: "#fff", opacity: isTrading ? 0.7 : 1 }}
                >
                  {isTrading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
                  ) : (
                    <><ArrowUp className="w-4 h-4" /> BUY at Market</>
                  )}
                </TapButton>
              </div>

              {/* Open Positions Quick View */}
              {openTrades.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: C.navyLight, border: `1px solid ${C.border}` }}>
                  <TapButton
                    onClick={() => setActiveTab("positions")}
                    className="w-full px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: `1px solid ${C.border}` }}
                  >
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" style={{ color: C.teal }} />
                      <span className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                        {openTrades.length} Open Position{openTrades.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: C.textMuted }} />
                  </TapButton>
                  {openTrades.slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-2.5"
                      style={{ borderBottom: `1px solid rgba(39, 183, 200, 0.06)` }}>
                      <span className="text-xs font-mono font-bold" style={{ color: C.textPrimary }}>{t.ticker}</span>
                      <span className="text-[10px]" style={{ color: C.textMuted }}>
                        {t.shares} @ {fmt(t.entry_price)}
                      </span>
                      <div className="flex-1" />
                      <TapButton
                        onClick={() => closeTrade(t.id)}
                        disabled={isClosing === t.id}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                        style={{ background: C.redDim, color: C.red }}
                      >
                        {isClosing === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Close"}
                      </TapButton>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════ POSITIONS TAB ══════ */}
          {activeTab === "positions" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 space-y-4">

              {/* Open Positions */}
              <div className="rounded-2xl overflow-hidden" style={{ background: C.navyLight, border: `1px solid ${C.border}` }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>Open Positions</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: C.tealDim, color: C.teal }}>
                    {openTrades.length}
                  </span>
                </div>

                {openTrades.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <BarChart3 className="w-8 h-8 mx-auto mb-2" style={{ color: C.textMuted }} />
                    </motion.div>
                    <p className="text-sm" style={{ color: C.textSecondary }}>No open positions</p>
                    <p className="text-xs mt-1" style={{ color: C.textMuted }}>Go to Trade tab to place one</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {openTrades.map((t, i) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-4 py-3.5"
                        style={{ borderBottom: `1px solid rgba(39, 183, 200, 0.08)` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: C.emeraldDim }}>
                            <TrendingUp className="w-4 h-4" style={{ color: C.emerald }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-semibold" style={{ color: C.textPrimary }}>{t.ticker}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase"
                                style={{ background: C.emeraldDim, color: C.emerald }}>LONG</span>
                            </div>
                            <p className="text-[10px]" style={{ color: C.textMuted }}>
                              {t.shares} shares @ {fmt(t.entry_price)} &middot; Stop: {fmt(t.stop_price ?? 0)}
                            </p>
                            {t.thesis && (
                              <p className="text-[10px] mt-1 italic" style={{ color: C.textSecondary }}>
                                &ldquo;{t.thesis}&rdquo;
                              </p>
                            )}
                          </div>
                          <TapButton
                            onClick={() => closeTrade(t.id)}
                            disabled={isClosing === t.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: C.redDim, color: C.red }}
                          >
                            {isClosing === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Close"}
                          </TapButton>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Recent Closed Trades */}
              {closedTrades.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: C.navyLight, border: `1px solid ${C.border}` }}>
                  <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>Recent Trades</h3>
                  </div>
                  {closedTrades.slice(0, 10).map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: `1px solid rgba(39, 183, 200, 0.08)` }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: (t.pnl ?? 0) >= 0 ? C.emeraldDim : C.redDim }}>
                        {(t.pnl ?? 0) >= 0
                          ? <TrendingUp className="w-4 h-4" style={{ color: C.emerald }} />
                          : <TrendingDown className="w-4 h-4" style={{ color: C.red }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-mono font-semibold" style={{ color: C.textPrimary }}>{t.ticker}</span>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>
                          {t.shares} shares &middot; {new Date(t.exit_at ?? t.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-semibold" style={{ color: (t.pnl ?? 0) >= 0 ? C.emerald : C.red }}>
                          {(t.pnl ?? 0) >= 0 ? "+" : "-"}{fmt(t.pnl ?? 0)}
                        </span>
                        <p className="text-[10px] font-mono" style={{ color: (t.pnl_pct ?? 0) >= 0 ? C.emerald : C.red }}>
                          {(t.pnl_pct ?? 0) >= 0 ? "+" : ""}{(t.pnl_pct ?? 0).toFixed(2)}%
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════ STRATEGIES TAB ══════ */}
          {activeTab === "strategies" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4" style={{ color: C.amber }} />
                <p className="text-xs" style={{ color: C.textSecondary }}>
                  Study these strategies, then practice them with paper trades
                </p>
              </div>

              {STRATEGY_TIPS.map((strat, i) => {
                const isExpanded = expandedStrategy === strat.slug;
                const catColors: Record<string, string> = {
                  "Day Trading": C.amber,
                  "Swing Trading": C.teal,
                  "Long-Term Investing": C.emerald,
                };
                const accentColor = catColors[strat.category] ?? C.teal;

                return (
                  <motion.div
                    key={strat.slug}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: C.navyLight, border: `1px solid ${C.border}` }}
                  >
                    <TapButton
                      onClick={() => setExpandedStrategy(isExpanded ? null : strat.slug)}
                      className="w-full px-4 py-3.5 flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: accentColor + "15" }}>
                        {strat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold truncate" style={{ color: C.textPrimary }}>{strat.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                            style={{ background: accentColor + "15", color: accentColor }}>
                            {strat.category}
                          </span>
                          <span className="text-[10px]" style={{ color: C.textMuted }}>
                            {strat.difficulty} &middot; {strat.timeframe}
                          </span>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                        <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: C.textMuted }} />
                      </motion.div>
                    </TapButton>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${C.border}` }}>
                            <div className="pt-3">
                              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: accentColor }}>
                                Best Market Conditions
                              </p>
                              <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{strat.conditions}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: C.emerald }}>
                                Entry Logic
                              </p>
                              <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                                {strat.entry}...
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: C.red }}>
                                Stop / Invalidation
                              </p>
                              <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>
                                {strat.stop}...
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/university/strategy-lab/${strat.slug}`}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                                style={{ background: accentColor + "15", color: accentColor }}>
                                <BookOpen className="w-3.5 h-3.5" /> Full Lesson
                              </Link>
                              <TapButton
                                onClick={() => { setActiveTab("trade"); haptic("light"); }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                                style={{ background: `linear-gradient(135deg, ${C.emerald}, ${C.teal})`, color: "#fff" }}
                              >
                                <Target className="w-3.5 h-3.5" /> Practice Trade
                              </TapButton>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              <Link href="/university/strategy-lab"
                className="block text-center py-3 rounded-xl text-xs font-semibold"
                style={{ background: C.tealDim, color: C.teal, border: `1px solid ${C.border}` }}>
                View All {ALL_STRATEGIES.length} Strategies in Strategy Lab
              </Link>
            </motion.div>
          )}

          {/* ══════ LEADERBOARD TAB ══════ */}
          {activeTab === "leaderboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4">
              <div className="rounded-2xl overflow-hidden" style={{ background: C.navyLight, border: `1px solid ${C.border}` }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <Trophy className="w-5 h-5" style={{ color: C.teal }} />
                  <h2 className="text-sm font-bold" style={{ color: C.textPrimary }}>Top Traders</h2>
                </div>

                {leaderboard.length === 0 ? (
                  <div className="py-10 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: C.textMuted }} />
                    <p className="text-sm" style={{ color: C.textSecondary }}>No trades yet</p>
                    <p className="text-xs mt-1" style={{ color: C.textMuted }}>Close a trade to appear on the leaderboard</p>
                  </div>
                ) : (
                  <>
                    {leaderboard.map((entry, i) => {
                      const isMe = entry.user_id === userId;
                      const medals: Record<number, { bg: string; color: string }> = {
                        1: { bg: "rgba(255, 215, 0, 0.15)", color: C.gold },
                        2: { bg: "rgba(192, 192, 192, 0.15)", color: C.silver },
                        3: { bg: "rgba(205, 127, 50, 0.15)", color: C.bronze },
                      };
                      const medal = medals[entry.rank];
                      return (
                        <motion.div
                          key={entry.user_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 px-4 py-3.5"
                          style={{
                            background: isMe ? C.tealDim : "transparent",
                            borderBottom: `1px solid rgba(39, 183, 200, 0.08)`,
                          }}
                        >
                          <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: medal?.bg ?? "rgba(244, 247, 250, 0.08)", color: medal?.color ?? C.textSecondary }}>
                            {medal ? <Crown className="w-4 h-4" /> : entry.rank}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium" style={{ color: isMe ? C.teal : C.textPrimary }}>
                              {entry.display_name}
                              {isMe && <span className="text-[10px] ml-1.5 opacity-70">(you)</span>}
                            </span>
                            <p className="text-[10px]" style={{ color: C.textMuted }}>
                              {entry.total_trades} trades &middot; {entry.win_rate}% wins
                            </p>
                          </div>
                          <span className="text-sm font-mono font-semibold"
                            style={{ color: entry.total_pnl >= 0 ? C.emerald : C.red }}>
                            {entry.total_pnl >= 0 ? "+" : "-"}{fmt(entry.total_pnl)}
                          </span>
                        </motion.div>
                      );
                    })}

                    {myRank && !leaderboard.find(e => e.user_id === userId) && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex items-center gap-3 px-4 py-3.5"
                        style={{ background: C.tealDim, borderTop: `2px dashed ${C.border}` }}>
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "rgba(244, 247, 250, 0.08)", color: C.textSecondary }}>
                          {myRank.rank}
                        </span>
                        <div className="flex-1">
                          <span className="text-sm font-medium" style={{ color: C.teal }}>
                            {myRank.display_name} <span className="text-[10px] opacity-70">(you)</span>
                          </span>
                          <p className="text-[10px]" style={{ color: C.textMuted }}>
                            {myRank.total_trades} trades &middot; {myRank.win_rate}% wins
                          </p>
                        </div>
                        <span className="text-sm font-mono font-semibold"
                          style={{ color: myRank.total_pnl >= 0 ? C.emerald : C.red }}>
                          {myRank.total_pnl >= 0 ? "+" : "-"}{fmt(myRank.total_pnl)}
                        </span>
                      </motion.div>
                    )}
                  </>
                )}

                <div className="px-4 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
                  <p className="text-[10px] text-center" style={{ color: C.textMuted }}>
                    Rankings based on total P/L from closed trades
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Ad: Bottom */}
          {showAds && (
            <div className="px-4 mt-4 mb-3">
              <AdMobBanner format="rectangle" />
            </div>
          )}

          {/* Pro Upsell */}
          {showAds && (
            <div className="px-4 mb-4">
              <div className="rounded-2xl p-4" style={{
                background: `linear-gradient(135deg, ${C.tealDim}, ${C.emeraldDim})`,
                border: `1px solid rgba(39, 183, 200, 0.25)`,
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4" style={{ color: C.teal }} />
                  <span className="text-sm font-bold" style={{ color: C.textPrimary }}>Unlock Pro</span>
                </div>
                <p className="text-xs mb-3" style={{ color: C.textSecondary }}>
                  Remove ads, access advanced strategies, and get the full Bloom experience.
                </p>
                <Link href="/subscription"
                  className="inline-block px-5 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: `linear-gradient(135deg, ${C.emerald}, ${C.teal})`, color: "#fff" }}>
                  $4.99/mo — Subscribe
                </Link>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="px-4 pb-4">
            <p className="text-[10px] text-center leading-relaxed" style={{ color: C.textMuted }}>
              Bloom Paper Trader is an educational simulator using live market data. No real money. Not financial advice.
            </p>
          </div>

          {/* Win/Loss Overlay */}
          <AnimatePresence>
            {winLoss?.show && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6"
                style={{ background: winLoss.isWin ? "rgba(73, 176, 110, 0.95)" : "rgba(229, 72, 77, 0.92)" }}
                onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); setWinLoss(null); haptic("light"); }}
              >
                <motion.div
                  initial={{ scale: 0.3, y: 40 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 20 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="text-center"
                >
                  <motion.p
                    initial={{ scale: 0.2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 8, stiffness: 150, delay: 0.1 }}
                    className="text-6xl sm:text-8xl font-bold font-sans mb-4 text-white"
                  >
                    {winLoss.pnl >= 0 ? "+" : "-"}{fmt(winLoss.pnl)}
                  </motion.p>

                  {winLoss.streak > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-center gap-2 mb-3"
                    >
                      <Flame className="w-6 h-6" style={{ color: "#FFD54F" }} />
                      <span className="text-xl font-bold text-white">
                        {winLoss.streak} win{winLoss.streak > 1 ? "s" : ""} in a row!
                      </span>
                    </motion.div>
                  )}

                  {winLoss.rank > 0 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                      className="text-lg font-medium text-white/80">
                      Ranked #{winLoss.rank} on leaderboard
                    </motion.p>
                  )}

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.8 }}
                    className="text-sm mt-6 text-white">
                    Tap to close
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Layout>
    </>
  );
}
