/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import {
  Zap, Eye, AlertTriangle, Clock,
  RefreshCw, ArrowUpRight, Target, ShieldCheck,
} from "lucide-react";
import type { SignalResult } from "@/lib/strategies";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

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
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-white/5 p-4 animate-pulse" style={{ background: "#121821" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="flex-1"><div className="h-4 w-20 rounded bg-white/5 mb-1" /><div className="h-3 w-14 rounded bg-white/5" /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && currentSignals.length === 0 && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: "linear-gradient(145deg, rgba(39,183,200,0.06), rgba(7,8,12,1))", border: "1px solid rgba(39,183,200,0.15)" }}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(39,183,200,0.1)" }}>
              {activeTab === "active" ? "⚡" : activeTab === "near" ? "⚠️" : activeTab === "watch" ? "👁" : "🕐"}
            </div>
            <p className="text-sm font-semibold text-[#F3EDE3]/80 mb-1">
              No {TABS.find(t => t.id === activeTab)?.label.toLowerCase()} setups right now
            </p>
            <p className="text-xs text-[#F3EDE3]/40 max-w-xs mx-auto">
              Setups appear when stocks match your strategy rules. Next scan runs when the tape updates.
            </p>
          </div>
        )}

        {/* Signal cards */}
        {!loading && currentSignals.length > 0 && (
          <div className="space-y-2">
            {currentSignals.map(({ candidate: c, signal: sig }, i) => {
              const stateColor = sig.state === "ACTIVE" ? "#49B06E" : sig.state === "NEAR_TRIGGER" ? "#F59E0B" : "#27B7C8";
              return (
                <motion.div
                  key={`${c.symbol}-${sig.strategyId}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => { haptic(); router.push(`/scanner/${c.symbol}`); }}
                  className="rounded-2xl border p-4 cursor-pointer active:scale-[0.98] transition-all"
                  style={{ background: "linear-gradient(145deg, #121821, #171E28)", borderColor: `${stateColor}25` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{ background: `${stateColor}20`, color: stateColor, border: `1px solid ${stateColor}40` }}
                      >
                        {sig.score}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#F3EDE3]">{c.symbol}</span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: `${stateColor}20`, color: stateColor }}
                          >
                            {sig.state.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#F3EDE3]/40">{sig.strategyName}</span>
                          <span className="text-[10px] text-[#F3EDE3]/25">{timeAgo(sig.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-bold text-sm" style={{ color: c.change >= 0 ? "#49B06E" : "#EF4444" }}>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {c.change >= 0 ? "+" : ""}{c.change.toFixed(1)}%
                      </div>
                      <span className="text-[10px] text-[#F3EDE3]/30">${c.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-3 mb-2 text-[10px] text-[#F3EDE3]/40">
                    <span>RVOL {c.rvol.toFixed(1)}x</span>
                    <span>Vol {formatVolume(c.volume)}</span>
                    {c.catalystHeadline && <span className="truncate max-w-[140px]">{c.catalystHeadline}</span>}
                  </div>

                  {/* Entry/Stop/Target */}
                  {sig.entryZone && (
                    <div className="rounded-lg p-2 flex flex-wrap gap-3 text-[10px]" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-[#49B06E]" />
                        <span className="text-[#49B06E] font-medium">{sig.entryZone}</span>
                      </div>
                      {sig.invalidationLevel && (
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#EF4444]" />
                          <span className="text-[#EF4444] font-medium">{sig.invalidationLevel}</span>
                        </div>
                      )}
                      {sig.rr && (
                        <span className="text-[#27B7C8] font-medium">R:R {sig.rr}</span>
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  {sig.reason && (
                    <p className="text-[10px] text-[#F3EDE3]/30 mt-2">{sig.reason}</p>
                  )}
                </motion.div>
              );
            })}
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
