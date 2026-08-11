/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Trophy, Flame, X, ChevronRight,
  BarChart3, Wallet, ArrowUp, ArrowDown, Loader2, Target,
  DollarSign, Zap, Crown, RefreshCw,
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

function fmt(n: number) {
  return `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function haptic(style: "light" | "medium" | "heavy" = "light") {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(style === "light" ? 10 : style === "medium" ? 25 : 50);
    }
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

function PulseGlow({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ boxShadow: [`0 0 0px ${color}`, `0 0 20px ${color}`, `0 0 0px ${color}`] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
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

export default function PaperTraderV2() {
  const { isPro, isTrial, trialDaysLeft } = useSubscription();
  const [account, setAccount] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [formError, setFormError] = useState("");
  const [isTrading, setIsTrading] = useState(false);
  const [isClosing, setIsClosing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [winLoss, setWinLoss] = useState<WinLossState | null>(null);

  const symbolRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { setUserId(user.id); loadAll(); }
      else setLoading(false);
    })();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAll = useCallback(async () => {
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
    } catch (e) { console.error("Load error:", e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

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
        body: JSON.stringify({ ticker: sym, direction: "long", shares: qty, stop_price: stop }),
      });
      const d = await res.json();
      if (!res.ok) { setFormError(d.error || "Trade failed"); return; }

      haptic("heavy");
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 }, colors: [C.emerald, C.teal, C.ivory] });

      setTicker("");
      setShares("");
      setStopPrice("");
      symbolRef.current?.focus();
      await loadAll();
    } catch { setFormError("Network error"); }
    finally { setIsTrading(false); }
  }, [ticker, shares, stopPrice, loadAll]);

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
        confetti({
          particleCount: 100, spread: 70, origin: { y: 0.5 },
          colors: [C.emerald, C.teal, C.gold, C.ivory],
        });
      } else {
        haptic("medium");
      }

      setWinLoss({
        show: true, pnl, streak: newStreak,
        rank: myRank?.rank ?? 0, isWin,
      });
      timerRef.current = setTimeout(() => setWinLoss(null), 3500);

      await loadAll();
    } catch { setFormError("Network error"); }
    finally { setIsClosing(null); }
  }, [loadAll, currentStreak, myRank]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" style={{ background: C.navy }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10" style={{ color: C.teal }} />
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Paper Trader | Bloom</title>
        <meta name="description" content="Practice trading with zero risk. Build your skills, track your streak, climb the leaderboard." />
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

          {/* Portfolio Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-4 pt-6 pb-4"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs uppercase tracking-wider" style={{ color: C.textSecondary }}>
                Portfolio Value
              </p>
              <TapButton
                onClick={refresh}
                className="p-2 rounded-lg transition-colors"
                style={{ color: C.textMuted }}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </TapButton>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
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

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" style={{ color: C.textMuted }} />
                <span className="text-xs" style={{ color: C.textSecondary }}>
                  {fmt(account?.cash_balance ?? 0)} buying power
                </span>
              </div>
              {currentStreak > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255, 160, 0, 0.15)" }}
                >
                  <Flame className="w-3.5 h-3.5" style={{ color: "#FFA000" }} />
                  <span className="text-xs font-bold" style={{ color: "#FFA000" }}>{currentStreak}</span>
                </motion.div>
              )}
            </div>

            {/* Rank Badge */}
            {myRank && (
              <TapButton
                onClick={() => { setShowLeaderboard(true); haptic("light"); }}
                className="flex items-center gap-2 px-3 py-2 rounded-full transition-all"
                style={{ background: C.tealDim, border: `1px solid ${C.border}` }}
              >
                <Trophy className="w-3.5 h-3.5" style={{ color: C.teal }} />
                <span className="text-xs font-medium" style={{ color: C.teal }}>
                  #{myRank.rank} on leaderboard &middot; {winRate}% win rate
                </span>
                <ChevronRight className="w-3 h-3" style={{ color: C.teal }} />
              </TapButton>
            )}
          </motion.div>

          {/* Trade Entry Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 mb-6"
          >
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

              <AnimatePresence>
                {formError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs mb-3 px-1"
                    style={{ color: C.red }}
                  >
                    {formError}
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
          </motion.div>

          {/* Leaderboard Mini-Card */}
          {leaderboard.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-4 mb-6"
            >
              <TapButton
                onClick={() => setShowLeaderboard(true)}
                className="w-full rounded-2xl p-4 flex items-center justify-between transition-all"
                style={{ background: `linear-gradient(135deg, ${C.navyLight}, ${C.navyCard})`, border: `1px solid ${C.border}` }}
              >
                <div className="flex items-center gap-3">
                  <PulseGlow color={C.tealDim}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: C.tealDim }}>
                      <Trophy className="w-5 h-5" style={{ color: C.teal }} />
                    </div>
                  </PulseGlow>
                  <div className="text-left">
                    <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>Top Traders</p>
                    <p className="text-xs" style={{ color: C.textSecondary }}>
                      {leaderboard[0]?.display_name} leads with +{fmt(leaderboard[0]?.total_pnl ?? 0)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: C.textMuted }} />
              </TapButton>
            </motion.div>
          )}

          {/* Open Positions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="px-4 mb-6"
          >
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
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>Place a trade above to get started</p>
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
                      className="flex items-center gap-3 px-4 py-3.5 group"
                      style={{ borderBottom: `1px solid rgba(39, 183, 200, 0.08)` }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: t.direction === "long" ? C.emeraldDim : C.redDim }}
                      >
                        {t.direction === "long"
                          ? <TrendingUp className="w-4 h-4" style={{ color: C.emerald }} />
                          : <TrendingDown className="w-4 h-4" style={{ color: C.red }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold" style={{ color: C.textPrimary }}>{t.ticker}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase"
                            style={{ background: C.emeraldDim, color: C.emerald }}>
                            {t.direction}
                          </span>
                        </div>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>
                          {t.shares} shares @ {fmt(t.entry_price)} &middot; Stop: {fmt(t.stop_price ?? 0)}
                        </p>
                      </div>
                      <TapButton
                        onClick={() => closeTrade(t.id)}
                        disabled={isClosing === t.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: C.redDim, color: C.red }}
                      >
                        {isClosing === t.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Close"}
                      </TapButton>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* Performance Stats */}
          {closedTrades.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-4 mb-6"
            >
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total P/L", value: `${totalPnl >= 0 ? "+" : "-"}${fmt(totalPnl)}`, color: totalPnl >= 0 ? C.emerald : C.red, icon: DollarSign },
                  { label: "Win Rate", value: `${winRate}%`, color: winRate >= 50 ? C.emerald : C.red, icon: Target },
                  { label: "Trades", value: `${closedTrades.length}`, color: C.teal, icon: BarChart3 },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="rounded-xl p-3 text-center"
                    style={{ background: C.navyLight, border: `1px solid ${C.border}` }}
                  >
                    <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: C.textMuted }} />
                    <p className="text-base font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[10px]" style={{ color: C.textMuted }}>{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Closed Trades */}
          {closedTrades.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="px-4 mb-6"
            >
              <div className="rounded-2xl overflow-hidden" style={{ background: C.navyLight, border: `1px solid ${C.border}` }}>
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>Recent Trades</h3>
                </div>
                {closedTrades.slice(0, 8).map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                    style={{ borderBottom: `1px solid rgba(39, 183, 200, 0.08)` }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: (t.pnl ?? 0) >= 0 ? C.emeraldDim : C.redDim }}
                    >
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
            </motion.div>
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
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-lg font-medium text-white/80"
                    >
                      Ranked #{winLoss.rank} on leaderboard
                    </motion.p>
                  )}

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 0.8 }}
                    className="text-sm mt-6 text-white"
                  >
                    Tap to close
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Leaderboard Modal */}
          <AnimatePresence>
            {showLeaderboard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => { setShowLeaderboard(false); haptic("light"); }}
              >
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-md rounded-2xl overflow-hidden"
                  style={{ background: C.navyLight, border: `1px solid ${C.border}` }}
                >
                  <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" style={{ color: C.teal }} />
                      <h2 className="text-base font-bold" style={{ color: C.textPrimary }}>Top Traders</h2>
                    </div>
                    <TapButton onClick={() => setShowLeaderboard(false)} style={{ color: C.textMuted }}>
                      <X className="w-5 h-5" />
                    </TapButton>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    {leaderboard.map((entry, i) => {
                      const isMe = entry.user_id === userId;
                      return (
                        <motion.div
                          key={entry.user_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-3 px-5 py-3.5"
                          style={{
                            background: isMe ? C.tealDim : "transparent",
                            borderBottom: `1px solid rgba(39, 183, 200, 0.08)`,
                          }}
                        >
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background: entry.rank <= 3
                                ? entry.rank === 1 ? C.gold : entry.rank === 2 ? C.silver : C.bronze
                                : "rgba(244, 247, 250, 0.08)",
                              color: entry.rank <= 3 ? C.navy : C.textSecondary,
                            }}
                          >
                            {entry.rank <= 3 ? (
                              <Crown className="w-4 h-4" />
                            ) : entry.rank}
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
                          <span
                            className="text-sm font-mono font-semibold"
                            style={{ color: entry.total_pnl >= 0 ? C.emerald : C.red }}
                          >
                            {entry.total_pnl >= 0 ? "+" : "-"}{fmt(entry.total_pnl)}
                          </span>
                        </motion.div>
                      );
                    })}

                    {myRank && !leaderboard.find(e => e.user_id === userId) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 px-5 py-3.5"
                        style={{ background: C.tealDim, borderTop: `2px dashed ${C.border}` }}
                      >
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
                  </div>

                  <div className="px-5 py-3" style={{ borderTop: `1px solid ${C.border}` }}>
                    <p className="text-[10px] text-center" style={{ color: C.textMuted }}>
                      Rankings based on total P/L from closed trades
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </Layout>
    </>
  );
}
