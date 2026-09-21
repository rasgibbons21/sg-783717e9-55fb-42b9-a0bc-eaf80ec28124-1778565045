/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Sparkline } from "@/components/Sparkline";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, RefreshCw, Filter, ArrowUpRight, Target,
  ShieldCheck, ChevronRight, X, TrendingUp,
} from "lucide-react";
import { STRATEGY_LIST, type StrategyId } from "@/lib/strategies";
import type { SignalResult } from "@/lib/strategies";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

function isMarketClosed(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const t = et.getHours() * 60 + et.getMinutes();
  return day === 0 || day === 6 || t < 570 || t >= 960;
}

interface ScanCandidate {
  symbol: string;
  price: number;
  change: number;
  changeAbs: number;
  volume: number;
  rvol: number;
  float: number | null;
  catalyst: string;
  catalystHeadline: string | null;
  score: number;
  status: string;
  signals?: SignalResult[];
  topStrategy?: StrategyId | null;
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

const STATE_COLORS: Record<string, string> = {
  ACTIVE: "#49B06E",
  NEAR_TRIGGER: "#F59E0B",
  WATCH: "#27B7C8",
  INVALIDATED: "#EF4444",
};

function ScannerCard({ c, i, onClick }: { c: ScanCandidate; i: number; onClick: () => void }) {
  const bestSignal = c.signals && c.signals.length > 0 ? c.signals[0] : null;
  const stateColor = bestSignal ? (STATE_COLORS[bestSignal.state] || "#F3EDE3") : "#27B7C8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.02 }}
      onClick={() => { haptic(); onClick(); }}
      className="rounded-xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
      style={{ background: "linear-gradient(145deg, #121821, #161D26)", border: `1px solid ${stateColor}18` }}
    >
      <div className="p-3.5">
        {/* Top row: Score + Symbol + Sparkline + Price */}
        <div className="flex items-center gap-3 mb-2">
          {/* Score badge */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: `${stateColor}15`, color: stateColor, border: `1px solid ${stateColor}30` }}
          >
            {bestSignal ? bestSignal.score : c.score}
          </div>

          {/* Ticker + state */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-[#F3EDE3]">{c.symbol}</span>
              {bestSignal && (
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: `${stateColor}15`, color: stateColor }}
                >
                  {bestSignal.state.replace("_", " ")}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#F3EDE3]/35">{bestSignal?.strategyName ?? "Scanning..."}</span>
          </div>

          {/* Sparkline */}
          <div className="flex-shrink-0">
            <Sparkline symbol={c.symbol} width={72} height={28} />
          </div>

          {/* Price + change */}
          <div className="text-right flex-shrink-0 ml-1">
            <div className="text-sm font-bold text-[#F3EDE3]">${c.price.toFixed(2)}</div>
            <div className="flex items-center gap-0.5 justify-end" style={{ color: "#49B06E" }}>
              <ArrowUpRight className="w-3 h-3" />
              <span className="text-xs font-bold">+{c.change.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="flex items-center gap-3 text-[10px] text-[#F3EDE3]/35 mb-2">
          <span className="font-medium" style={{ color: c.rvol >= 5 ? "#49B06E" : "#F3EDE3" + "60" }}>
            RVOL {c.rvol.toFixed(1)}x
          </span>
          <span>Vol {formatVolume(c.volume)}</span>
          {c.catalystHeadline && (
            <span className="truncate">{c.catalystHeadline}</span>
          )}
        </div>

        {/* Entry / Stop row */}
        {bestSignal && bestSignal.entryZone && (
          <div
            className="rounded-lg px-3 py-2 flex items-center gap-4 text-[10px]"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-[#49B06E]" />
              <span className="text-[#F3EDE3]/40">Entry</span>
              <span className="text-[#49B06E] font-semibold">{bestSignal.entryZone}</span>
            </div>
            {bestSignal.invalidationLevel && (
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#EF4444]" />
                <span className="text-[#F3EDE3]/40">Stop</span>
                <span className="text-[#EF4444] font-semibold">{bestSignal.invalidationLevel}</span>
              </div>
            )}
            {bestSignal.target1 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#27B7C8]" />
                <span className="text-[#F3EDE3]/40">Target</span>
                <span className="text-[#27B7C8] font-semibold">{bestSignal.target1}</span>
              </div>
            )}
            {bestSignal.rr && (
              <span className="ml-auto text-[#F3EDE3]/25 font-medium">R:R {bestSignal.rr}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ScannerIndex() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<ScanCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStrategies, setActiveStrategies] = useState<Set<StrategyId>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 1,
    maxPrice: 50,
    minRvol: 0,
    minChange: 3,
  });

  const loadScan = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        minPrice: String(filters.minPrice),
        maxPrice: String(filters.maxPrice),
        minRvol: String(filters.minRvol),
        minChange: String(filters.minChange),
      });
      const res = await fetch(`/api/scanner/scan?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadScan(); }, [loadScan]);

  const toggleStrategy = (id: StrategyId) => {
    haptic();
    setActiveStrategies(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = candidates.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toUpperCase();
      if (!c.symbol.includes(q)) return false;
    }
    if (activeStrategies.size > 0 && c.signals) {
      const hasMatch = c.signals.some(s => activeStrategies.has(s.strategyId));
      if (!hasMatch) return false;
    }
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toUpperCase();
    if (q && !filtered.some(c => c.symbol === q)) {
      router.push(`/scanner/${q}`);
    }
  };

  return (
    <Layout>
      <SEO title="She Blooms Wealth | Scanner" description="Scan for stock setups matching your day-trading strategies." />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#F3EDE3]">Scanner</h1>
            <p className="text-xs text-[#F3EDE3]/40 mt-0.5">Find setups matching your rules</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              onClick={() => { haptic(); loadScan(); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(39,183,200,0.1)", border: "1px solid rgba(39,183,200,0.2)" }}
            >
              <RefreshCw className={`w-4 h-4 text-[#27B7C8] ${loading ? "animate-spin" : ""}`} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => { haptic(); setShowFilters(!showFilters); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: showFilters ? "rgba(39,183,200,0.2)" : "rgba(39,183,200,0.1)",
                border: "1px solid rgba(39,183,200,0.2)",
              }}
            >
              <Filter className="w-4 h-4 text-[#27B7C8]" />
            </motion.button>
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <div
              className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(22,37,64,0.8)", border: "1px solid rgba(39,183,200,0.15)" }}
            >
              <Search className="w-4 h-4 text-[#F3EDE3]/30 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ticker..."
                className="flex-1 bg-transparent text-sm text-[#F3EDE3] placeholder:text-[#F3EDE3]/30 outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")}>
                  <X className="w-3.5 h-3.5 text-[#F3EDE3]/30" />
                </button>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="submit"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(39,183,200,0.2)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.3)" }}
            >
              Scan
            </motion.button>
          </div>
        </form>

        {/* Strategy chips */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {STRATEGY_LIST.map(s => {
            const active = activeStrategies.has(s.id);
            return (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleStrategy(s.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? `${s.color}20` : "rgba(255,255,255,0.05)",
                  color: active ? s.color : "#F3EDE3",
                  border: `1px solid ${active ? `${s.color}40` : "rgba(255,255,255,0.08)"}`,
                  opacity: s.available ? 1 : 0.5,
                }}
              >
                <span>{s.icon}</span>
                <span>{s.shortName}</span>
                {!s.available && <span className="text-[8px] opacity-60">*</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: "rgba(22,37,64,0.8)", border: "1px solid rgba(39,183,200,0.15)" }}
              >
                {[
                  { label: "Min Price", key: "minPrice", options: [1, 2, 5, 10], unit: "$" },
                  { label: "Max Price", key: "maxPrice", options: [10, 20, 50, 100], unit: "$" },
                  { label: "Min RVOL", key: "minRvol", options: [2, 5, 10, 15], unit: "x" },
                  { label: "Min Change", key: "minChange", options: [3, 5, 10, 20], unit: "%" },
                ].map(row => (
                  <div key={row.key} className="flex items-center justify-between">
                    <span className="text-xs text-[#F3EDE3]/60">{row.label}</span>
                    <div className="flex gap-1">
                      {row.options.map(v => (
                        <button
                          key={v}
                          onClick={() => setFilters(f => ({ ...f, [row.key]: v }))}
                          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                          style={{
                            background: (filters as any)[row.key] === v ? "rgba(39,183,200,0.2)" : "rgba(255,255,255,0.05)",
                            color: (filters as any)[row.key] === v ? "#27B7C8" : "#F3EDE380",
                            border: `1px solid ${(filters as any)[row.key] === v ? "rgba(39,183,200,0.3)" : "transparent"}`,
                          }}
                        >
                          {row.unit === "$" ? `$${v}` : `${v}${row.unit}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-[#F3EDE3]/25 font-medium uppercase tracking-wider">
              {filtered.length} setup{filtered.length !== 1 ? "s" : ""} found
            </span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl p-3.5 animate-pulse" style={{ background: "#121821", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5" />
                  <div className="flex-1">
                    <div className="h-4 w-16 rounded bg-white/5 mb-1" />
                    <div className="h-3 w-20 rounded bg-white/5" />
                  </div>
                  <div className="w-[72px] h-7 rounded bg-white/5" />
                  <div className="text-right">
                    <div className="h-4 w-14 rounded bg-white/5 mb-1" />
                    <div className="h-3 w-12 rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: "linear-gradient(145deg, rgba(39,183,200,0.06), rgba(7,8,12,1))", border: "1px solid rgba(39,183,200,0.15)" }}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(39,183,200,0.1)" }}>
              🔍
            </div>
            <p className="text-sm font-semibold text-[#F3EDE3]/80 mb-1">
              {searchQuery ? `No results for "${searchQuery}"` : "No setups found right now"}
            </p>
            <p className="text-xs text-[#F3EDE3]/40 max-w-xs mx-auto">
              {searchQuery
                ? "Try a different ticker or broaden your filters."
                : isMarketClosed()
                  ? "Markets are closed right now. Setups appear during market hours (Mon–Fri, 9:30 AM – 4:00 PM ET)."
                  : "Setups appear when stocks match your strategy rules. Check back when the tape gets active."
              }
            </p>
          </div>
        )}

        {/* Scanner cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map((c, i) => (
              <ScannerCard
                key={c.symbol}
                c={c}
                i={i}
                onClick={() => router.push(`/scanner/${c.symbol}`)}
              />
            ))}
          </div>
        )}

        {/* Unavailable strategies note */}
        {STRATEGY_LIST.some(s => !s.available) && (
          <div className="mt-6 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] text-[#F3EDE3]/30 leading-relaxed">
              <strong className="text-[#F3EDE3]/40">* Strategies marked with * require intraday candle data.</strong>{" "}
              ORB, First Pullback, VWAP Reclaim/Bounce, and Bull Flag will activate when the real-time data feed is connected.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
