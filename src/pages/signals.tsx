/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Sparkline } from "@/components/Sparkline";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Eye, AlertTriangle, Clock,
  RefreshCw, ArrowUpRight, ArrowDownRight, Target, ShieldCheck,
  ChevronDown, ChevronUp, Info, TrendingUp,
} from "lucide-react";
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
  score: number;
  status: string;
  catalyst: string;
  catalystHeadline: string | null;
  signals?: SignalResult[];
  timestamp: number;
}

type Tab = "active" | "near" | "watch" | "recent";

const TABS: Array<{ id: Tab; label: string; icon: typeof Zap; color: string }> = [
  { id: "active", label: "Active", icon: Zap, color: "#49B06E" },
  { id: "near", label: "Near", icon: AlertTriangle, color: "#F59E0B" },
  { id: "watch", label: "Watch", icon: Eye, color: "#27B7C8" },
  { id: "recent", label: "Recent", icon: Clock, color: "#A855F7" },
];

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

const STATE_MAP: Record<string, Tab> = {
  ACTIVE: "active",
  NEAR_TRIGGER: "near",
  WATCH: "watch",
};

function SignalCard({ candidate: c, signal: sig, onTap }: {
  candidate: ScanCandidate; signal: SignalResult; onTap: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const stateColor = sig.state === "ACTIVE" ? "#49B06E" : sig.state === "NEAR_TRIGGER" ? "#F59E0B" : "#27B7C8";
  const up = c.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ background: "linear-gradient(145deg, #121821, #161D26)", border: `1px solid ${stateColor}18` }}
    >
      {/* Main row — always visible */}
      <button
        onClick={() => { haptic(); setExpanded(e => !e); }}
        className="w-full p-3.5 text-left active:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 mb-2">
          {/* Score badge */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: `${stateColor}15`, color: stateColor, border: `1px solid ${stateColor}30` }}
          >
            {sig.score}
          </div>

          {/* Ticker + state */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-[#F3EDE3]">{c.symbol}</span>
              <span
                className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${stateColor}15`, color: stateColor }}
              >
                {sig.state.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-[#F3EDE3]/40">{sig.strategyName}</span>
              <span className="text-[10px] text-[#F3EDE3]/20">{timeAgo(sig.timestamp)}</span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="flex-shrink-0">
            <Sparkline symbol={c.symbol} width={64} height={26} />
          </div>

          {/* Price + change */}
          <div className="text-right flex-shrink-0 ml-1">
            <div className="flex items-center gap-0.5 font-bold text-sm" style={{ color: up ? "#49B06E" : "#EF4444" }}>
              {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {up ? "+" : ""}{c.change.toFixed(1)}%
            </div>
            <span className="text-[10px] text-[#F3EDE3]/30">${c.price.toFixed(2)}</span>
          </div>

          {/* Expand arrow */}
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-[#F3EDE3]/15 flex-shrink-0" />
            : <ChevronDown className="w-3.5 h-3.5 text-[#F3EDE3]/15 flex-shrink-0" />
          }
        </div>

        {/* Quick metrics */}
        <div className="flex items-center gap-3 text-[10px] text-[#F3EDE3]/30">
          <span className="font-medium" style={{ color: c.rvol >= 5 ? "#49B06E" : undefined }}>RVOL {c.rvol.toFixed(1)}x</span>
          <span>Vol {formatVolume(c.volume)}</span>
          {c.catalystHeadline && <span className="truncate max-w-[140px]">{c.catalystHeadline}</span>}
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 border-t border-white/5 pt-3 space-y-2.5">

              {/* Entry / Stop / Target */}
              {sig.entryZone && (
                <div className="rounded-lg p-3 grid grid-cols-3 gap-2 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <p className="text-[9px] text-[#49B06E] font-bold uppercase tracking-wider mb-0.5">Entry</p>
                    <p className="text-sm font-bold text-[#F3EDE3]">{sig.entryZone}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#EF4444] font-bold uppercase tracking-wider mb-0.5">Stop</p>
                    <p className="text-sm font-bold text-[#F3EDE3]">{sig.invalidationLevel ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#27B7C8] font-bold uppercase tracking-wider mb-0.5">Target</p>
                    <p className="text-sm font-bold text-[#F3EDE3]">{sig.target1 ?? "—"}</p>
                  </div>
                </div>
              )}

              {/* R:R badge */}
              {sig.rr && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(39,183,200,0.1)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.2)" }}>
                    R:R {sig.rr}
                  </span>
                </div>
              )}

              {/* Conditions breakdown */}
              {(sig.conditionsPassed.length > 0 || sig.conditionsFailed.length > 0) && (
                <div className="space-y-1">
                  <p className="text-[9px] text-[#F3EDE3]/25 uppercase tracking-wider font-bold">Conditions</p>
                  {sig.conditionsPassed.map((c, i) => (
                    <div key={`p-${i}`} className="flex items-center gap-2 text-[11px]">
                      <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] bg-[#49B06E]/15 text-[#49B06E]">✓</span>
                      <span className="text-[#F3EDE3]/50">{c}</span>
                    </div>
                  ))}
                  {sig.conditionsFailed.map((c, i) => (
                    <div key={`f-${i}`} className="flex items-center gap-2 text-[11px]">
                      <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] bg-[#EF4444]/15 text-[#EF4444]">✗</span>
                      <span className="text-[#F3EDE3]/25">{c}</span>
                    </div>
                  ))}
                  {sig.conditionsMissing.map((c, i) => (
                    <div key={`m-${i}`} className="flex items-center gap-2 text-[11px]">
                      <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] bg-white/5 text-[#F3EDE3]/20">?</span>
                      <span className="text-[#F3EDE3]/20">{c}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reason */}
              {sig.reason && (
                <div className="rounded-lg p-2.5 flex items-start gap-2" style={{ background: "rgba(39,183,200,0.04)", border: "1px solid rgba(39,183,200,0.08)" }}>
                  <Info className="w-3.5 h-3.5 text-[#27B7C8] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#F3EDE3]/40 leading-relaxed">{sig.reason}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); haptic(); onTap(); }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
                  style={{ background: "rgba(39,183,200,0.12)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.25)" }}
                >
                  View Chart
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); haptic(); }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center"
                  style={{ background: "rgba(255,255,255,0.04)", color: "#F3EDE3", opacity: 0.6, border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  Paper Trade
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SignalsPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<ScanCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [lastScan, setLastScan] = useState<number | null>(null);

  const loadScan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scanner/scan");
      const data = res.ok ? await res.json() : { candidates: [] };
      setCandidates(data.candidates || []);
      setLastScan(data.timestamp || Date.now());
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadScan(); }, [loadScan]);

  const signalsByTab = (tab: Tab): Array<{ candidate: ScanCandidate; signal: SignalResult }> => {
    const results: Array<{ candidate: ScanCandidate; signal: SignalResult }> = [];
    for (const c of candidates) {
      if (!c.signals) continue;
      for (const sig of c.signals) {
        const mapped = STATE_MAP[sig.state];
        if (tab === "recent" || mapped === tab) {
          results.push({ candidate: c, signal: sig });
        }
      }
    }
    results.sort((a, b) => b.signal.score - a.signal.score);
    return results;
  };

  const currentSignals = signalsByTab(activeTab);

  const tabCounts: Record<Tab, number> = {
    active: signalsByTab("active").length,
    near: signalsByTab("near").length,
    watch: signalsByTab("watch").length,
    recent: candidates.reduce((sum, c) => sum + (c.signals?.length || 0), 0),
  };

  return (
    <Layout>
      <SEO title="Bloom Radar | Signals" description="Active setups matched by your trading strategies." />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#F3EDE3]">Signals</h1>
            <p className="text-xs text-[#F3EDE3]/40 mt-0.5">
              Strategy setups
              {lastScan && <> &middot; Updated {timeAgo(lastScan)}</>}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.85, rotate: 180 }}
            onClick={() => { haptic(); loadScan(); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(39,183,200,0.1)", border: "1px solid rgba(39,183,200,0.2)" }}
          >
            <RefreshCw className={`w-4 h-4 text-[#27B7C8] ${loading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => { haptic(); setActiveTab(tab.id); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: isActive ? `${tab.color}15` : "transparent",
                  color: isActive ? tab.color : "#F3EDE3",
                  opacity: isActive ? 1 : 0.5,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tabCounts[tab.id] > 0 && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: `${tab.color}20`, color: tab.color }}
                  >
                    {tabCounts[tab.id]}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl p-3.5 animate-pulse" style={{ background: "#121821", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5" />
                  <div className="flex-1"><div className="h-4 w-20 rounded bg-white/5 mb-1" /><div className="h-3 w-16 rounded bg-white/5" /></div>
                  <div className="w-16 h-7 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && currentSignals.length === 0 && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: "linear-gradient(145deg, rgba(39,183,200,0.06), rgba(7,8,12,1))", border: "1px solid rgba(39,183,200,0.15)" }}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(39,183,200,0.1)" }}>
              {activeTab === "active" ? "⚡" : activeTab === "near" ? "⚠️" : activeTab === "watch" ? "👁" : "🕐"}
            </div>
            <p className="text-sm font-semibold text-[#F3EDE3]/80 mb-1">
              No {TABS.find(t => t.id === activeTab)?.label.toLowerCase()} setups right now
            </p>
            <p className="text-xs text-[#F3EDE3]/40 max-w-xs mx-auto mb-4">
              {isMarketClosed()
                ? "Markets are closed right now. Signals appear during market hours (Mon–Fri, 9:30 AM – 4:00 PM ET)."
                : "Setups appear when stocks match your strategy rules. Next scan runs when the tape updates."
              }
            </p>
            <div className="rounded-xl p-3 text-left" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] text-[#F3EDE3]/25 uppercase tracking-wider font-bold mb-2">What you&apos;d see here</p>
              <div className="space-y-2 text-[11px] text-[#F3EDE3]/35">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-[#49B06E]" />
                  <span><strong className="text-[#F3EDE3]/50">Entry zone</strong> — where the strategy says to watch</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span><strong className="text-[#F3EDE3]/50">Stop / invalidation</strong> — level where the thesis breaks</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-[#27B7C8]" />
                  <span><strong className="text-[#F3EDE3]/50">Target &amp; R:R</strong> — projected move and risk-to-reward</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signal cards */}
        {!loading && currentSignals.length > 0 && (
          <div className="space-y-2">
            {currentSignals.map(({ candidate, signal }) => (
              <SignalCard
                key={`${candidate.symbol}-${signal.strategyId}`}
                candidate={candidate}
                signal={signal}
                onTap={() => router.push(`/scanner/${candidate.symbol}`)}
              />
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl p-3 mt-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[10px] text-[#F3EDE3]/30 leading-relaxed">
            <strong className="text-[#F3EDE3]/40">Educational decision support only.</strong>{" "}
            Signal states reflect rule alignment, not trade recommendations. Score measures how many conditions passed — not win probability.
            Day trading involves significant risk of loss. Verify all data.
          </p>
        </div>
      </div>
    </Layout>
  );
}
