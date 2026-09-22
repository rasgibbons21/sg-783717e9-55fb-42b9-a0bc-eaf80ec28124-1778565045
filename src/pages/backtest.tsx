import { useState, useEffect, useCallback } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, TrendingUp, TrendingDown, Target, Shield,
  Loader2, AlertTriangle, ChevronDown, Clock, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps { requiresClientAuth?: boolean }

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch(path: string) {
  const token = await getToken();
  return fetch(path, { headers: { Authorization: `Bearer ${token}` } });
}

const STRATEGY_COLORS: Record<string, string> = {
  "gap-and-go": "#49B06E",
  "hod-breakout": "#EC4899",
  "red-to-green": "#10B981",
};

const STRATEGY_ICONS: Record<string, string> = {
  "gap-and-go": "🚀",
  "hod-breakout": "🔝",
  "red-to-green": "🔀",
};

interface BacktestData {
  summary: {
    totalSignals: number;
    resolved: number;
    pending: number;
    wins: number;
    t2Wins: number;
    stopped: number;
    expired: number;
    winRate: number;
    avgPnl: number;
  };
  byStrategy: Record<string, {
    name: string;
    total: number;
    wins: number;
    stopped: number;
    expired: number;
    avgPnl: number;
    bestPnl: number;
    worstPnl: number;
  }>;
  dailyPerformance: Array<{ date: string; total: number; wins: number; pnl: number }>;
  recentTrades: Array<{
    symbol: string;
    strategyId: string;
    strategyName: string;
    score: number;
    priceAtSignal: number;
    changePct: number;
    entry: number;
    stop: number;
    target1: number;
    target2: number;
    outcome: string;
    outcomePnlPct: number;
    scannedAt: string;
  }>;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const result = await requireProUserSSR(req as Parameters<typeof requireProUserSSR>[0]);
  if (result.status === "not-pro" || result.status === "unauthenticated") {
    return { redirect: { destination: "/subscription", permanent: false } };
  }
  if (result.status === "no-cookie") {
    return { props: { requiresClientAuth: true } };
  }
  return { props: {} };
};

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
      <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color }}>{label}</p>
      <p className="text-sm font-bold text-[#F3EDE3]">{value}</p>
      {sub && <p className="text-[8px] mt-0.5" style={{ color: `${color}80` }}>{sub}</p>}
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    win_t1: { label: "T1 Hit", color: "#49B06E", bg: "rgba(73,176,110,0.1)" },
    win_t2: { label: "T2 Hit", color: "#27B7C8", bg: "rgba(39,183,200,0.1)" },
    stopped: { label: "Stopped", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
    expired: { label: "Expired", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
    pending: { label: "Pending", color: "#F3EDE3", bg: "rgba(255,255,255,0.05)" },
  };
  const s = map[outcome] ?? map.pending;
  return (
    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}

function CumPnlChart({ daily }: { daily: BacktestData["dailyPerformance"] }) {
  if (daily.length < 2) return null;
  const w = 300, h = 60, pad = 4;
  let cum = 0;
  const points = daily.map(d => { cum += d.pnl; return cum; });
  const min = Math.min(0, ...points);
  const max = Math.max(0, ...points);
  const range = max - min || 1;
  const coords = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = pad + ((max - v) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const zeroY = pad + ((max - 0) / range) * (h - pad * 2);
  const lastVal = points[points.length - 1];
  const color = lastVal >= 0 ? "#49B06E" : "#EF4444";

  return (
    <div className="mb-4">
      <p className="text-[9px] text-[#F3EDE3]/30 uppercase tracking-wide mb-1">Cumulative Hypothetical P/L %</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[60px]">
        <line x1={pad} y1={zeroY} x2={w - pad} y2={zeroY} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <polyline points={coords} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx={Number(coords.split(" ").pop()?.split(",")[0])} cy={Number(coords.split(" ").pop()?.split(",")[1])} r="3" fill={color} />
      </svg>
      <div className="flex justify-between text-[8px] text-[#F3EDE3]/20 mt-0.5">
        <span>{daily[0].date}</span>
        <span>{daily[daily.length - 1].date}</span>
      </div>
    </div>
  );
}

export default function BacktestPage(_props: PageProps) {
  const { isPro, isLoading: authLoading } = useSubscription();
  const [data, setData] = useState<BacktestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);
  const [strategy, setStrategy] = useState("all");
  const [showTrades, setShowTrades] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/api/scanner/backtest?days=${days}&strategy=${strategy}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to load");
      setData(d);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading backtest data");
    } finally {
      setLoading(false);
    }
  }, [days, strategy]);

  useEffect(() => {
    if (!authLoading && isPro) load();
    else if (!authLoading) setLoading(false);
  }, [authLoading, isPro, load]);

  const s = data?.summary;

  return (
    <>
      <Head><title>Strategy Performance — Radar</title></Head>
      <Layout>
        <div className="min-h-screen bg-[#07080C] px-4 py-4 max-w-lg mx-auto pb-32">

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#27B7C8]" />
              <h1 className="text-2xl font-bold text-[#F3EDE3]">Strategy Performance</h1>
            </div>
            <p className="text-xs text-[#F3EDE3]/40 mt-0.5">How scanner picks have performed over time</p>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg px-3 py-2 mb-4 flex items-start gap-2" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#F59E0B]/80 leading-relaxed">
              <strong>HYPOTHETICAL / HISTORICAL SIMULATION.</strong> This is NOT a live brokerage account.
              Past results do not guarantee future performance. All signals are educational only.
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {[7, 14, 30, 90].map(d => (
                <button
                  key={d}
                  onClick={() => { haptic(); setDays(d); }}
                  className="px-3 py-1.5 text-[10px] font-medium transition-colors"
                  style={{
                    background: days === d ? "rgba(39,183,200,0.15)" : "transparent",
                    color: days === d ? "#27B7C8" : "rgba(243,237,227,0.35)",
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
            <select
              className="flex-1 bg-[#07080C] border border-white/8 rounded-lg px-2 py-1.5 text-[10px] text-[#F3EDE3] focus:outline-none"
              value={strategy}
              onChange={e => { haptic(); setStrategy(e.target.value); }}
            >
              <option value="all">All Strategies</option>
              <option value="gap-and-go">Gap & Go</option>
              <option value="hod-breakout">HOD Breakout</option>
              <option value="red-to-green">Red to Green</option>
            </select>
          </div>

          {(authLoading || loading) && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-5 h-5 text-[#27B7C8] animate-spin" />
              <span className="text-sm text-[#F3EDE3]/50">Loading performance data…</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 px-4 py-3 text-sm text-[#ef4444] mb-4">
              {error} <button onClick={load} className="underline ml-2">Retry</button>
            </div>
          )}

          {!loading && !error && data && s && (
            <>
              {s.totalSignals === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#27B7C8]/10 flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-[#27B7C8]/60" />
                  </div>
                  <p className="text-sm font-medium text-[#F3EDE3]/50 mb-1">Accumulating data</p>
                  <p className="text-xs text-[#F3EDE3]/30 max-w-[280px]">
                    The scanner logs each signal it finds. As data builds up from daily scans,
                    you&apos;ll see win rates, average returns, and strategy breakdowns here.
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-[10px] text-[#27B7C8]/50">
                    <Clock className="w-3 h-3" />
                    <span>Check back after a few trading days</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <StatCard label="Signals" value={s.totalSignals} color="#27B7C8" sub={`${s.pending} pending`} />
                    <StatCard label="Win Rate" value={`${s.winRate}%`} color={s.winRate >= 50 ? "#49B06E" : "#EF4444"} sub={`${s.wins}/${s.resolved}`} />
                    <StatCard label="Avg P/L" value={`${s.avgPnl >= 0 ? "+" : ""}${s.avgPnl}%`} color={s.avgPnl >= 0 ? "#49B06E" : "#EF4444"} />
                    <StatCard label="Stopped" value={s.stopped} color="#EF4444" sub={`${s.expired} exp`} />
                  </div>

                  {/* Cumulative P/L chart */}
                  {data.dailyPerformance.length >= 2 && <CumPnlChart daily={data.dailyPerformance} />}

                  {/* Strategy breakdown */}
                  {Object.keys(data.byStrategy).length > 0 && (
                    <div className="mb-4">
                      <p className="text-[9px] text-[#F3EDE3]/30 uppercase tracking-wide mb-2">Strategy Breakdown</p>
                      <div className="space-y-2">
                        {Object.entries(data.byStrategy).map(([id, st]) => {
                          const color = STRATEGY_COLORS[id] ?? "#27B7C8";
                          const icon = STRATEGY_ICONS[id] ?? "📊";
                          const wr = st.total > 0 ? Math.round((st.wins / st.total) * 100) : 0;
                          return (
                            <div
                              key={id}
                              className="rounded-xl p-3"
                              style={{ background: `${color}06`, border: `1px solid ${color}12` }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{icon}</span>
                                  <span className="text-xs font-semibold text-[#F3EDE3]">{st.name}</span>
                                </div>
                                <span className="text-[10px] font-bold" style={{ color }}>
                                  {wr}% WR
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-1.5">
                                <div className="text-center">
                                  <p className="text-[8px] text-[#F3EDE3]/25">Signals</p>
                                  <p className="text-[11px] font-bold text-[#F3EDE3]">{st.total}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[8px] text-[#F3EDE3]/25">Wins</p>
                                  <p className="text-[11px] font-bold text-[#49B06E]">{st.wins}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[8px] text-[#F3EDE3]/25">Best</p>
                                  <p className="text-[11px] font-bold text-[#49B06E]">+{st.bestPnl}%</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[8px] text-[#F3EDE3]/25">Worst</p>
                                  <p className="text-[11px] font-bold text-[#EF4444]">{st.worstPnl}%</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent trades */}
                  {data.recentTrades.length > 0 && (
                    <div>
                      <button
                        onClick={() => { haptic(); setShowTrades(!showTrades); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-t-xl"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-[#27B7C8]" />
                          <span className="text-xs font-semibold text-[#F3EDE3]/70">Recent Signals</span>
                          <span className="text-[9px] text-[#F3EDE3]/30">({data.recentTrades.length})</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#F3EDE3]/30 transition-transform ${showTrades ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {showTrades && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden rounded-b-xl"
                            style={{ background: "rgba(255,255,255,0.02)", borderLeft: "1px solid rgba(255,255,255,0.05)", borderRight: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                          >
                            <div className="divide-y divide-white/5">
                              {data.recentTrades.map((t, i) => {
                                const color = STRATEGY_COLORS[t.strategyId] ?? "#27B7C8";
                                return (
                                  <div key={i} className="px-3 py-2.5 flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-[#F3EDE3]">{t.symbol}</span>
                                        <span className="text-[9px] font-medium" style={{ color }}>{t.strategyName}</span>
                                        <OutcomeBadge outcome={t.outcome} />
                                      </div>
                                      <div className="flex items-center gap-3 mt-0.5 text-[9px] text-[#F3EDE3]/30">
                                        <span>${t.priceAtSignal.toFixed(2)}</span>
                                        <span>{t.changePct >= 0 ? "+" : ""}{t.changePct}%</span>
                                        <span>Score {t.score}</span>
                                        <span>{new Date(t.scannedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                      </div>
                                    </div>
                                    {t.outcomePnlPct != null && t.outcome !== "pending" && (
                                      <span className="text-xs font-bold" style={{ color: t.outcomePnlPct >= 0 ? "#49B06E" : "#EF4444" }}>
                                        {t.outcomePnlPct >= 0 ? "+" : ""}{t.outcomePnlPct}%
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Bottom disclaimer */}
                  <p className="text-[9px] text-[#F3EDE3]/20 text-center mt-6 leading-relaxed max-w-xs mx-auto">
                    HYPOTHETICAL RESULTS. These signals are generated by an automated scanner using delayed market data.
                    Past performance does not indicate future results. Not financial advice.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  );
}
