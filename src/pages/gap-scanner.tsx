import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Sparkline } from "@/components/Sparkline";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, RefreshCw, ArrowUpRight, Target, ShieldCheck,
  TrendingUp, ChevronDown, ChevronUp, Loader2, Info,
} from "lucide-react";
import type { SignalResult } from "@/lib/strategies";
import { trackGapScannerView } from "@/lib/analytics";
import { TickerMark } from "@/components/TickerMark";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

function isPreMarket(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const t = et.getHours() * 60 + et.getMinutes();
  if (day === 0 || day === 6) return false;
  return t >= 240 && t < 570; // 4:00 AM - 9:30 AM ET
}

function isMarketOpen(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const t = et.getHours() * 60 + et.getMinutes();
  if (day === 0 || day === 6) return false;
  return t >= 570 && t < 960;
}

function formatVolume(v: number | undefined): string {
  if (v == null) return "";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

interface GapCandidate {
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
  gapSignal: SignalResult;
}

const STATE_COLORS: Record<string, string> = {
  ACTIVE: "#49B06E",
  NEAR_TRIGGER: "#F59E0B",
  WATCH: "#27B7C8",
};

function GapCard({ c, i, onClick }: { c: GapCandidate; i: number; onClick: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const sig = c.gapSignal;
  const stateColor = STATE_COLORS[sig.state] || "#27B7C8";

  const gapPctMatch = sig.reason?.match(/Gap ([\d.]+)%/);
  const gapPct = gapPctMatch ? gapPctMatch[1] : c.change.toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.03 }}
      className="rounded-xl overflow-hidden"
      style={{ background: "linear-gradient(145deg, #121821, #161D26)", border: `1px solid ${stateColor}18` }}
    >
      {/* Main row */}
      <div
        className="p-3.5 cursor-pointer active:bg-white/[0.02] transition-colors"
        onClick={() => { haptic(); onClick(); }}
      >
        <div className="flex items-center gap-3 mb-2">
          {/* Score */}
          <div
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
            style={{ background: `${stateColor}15`, border: `1px solid ${stateColor}30` }}
          >
            <span className="text-sm font-bold" style={{ color: stateColor }}>{sig.score}</span>
            <span className="text-[7px] uppercase font-bold tracking-wider" style={{ color: `${stateColor}80` }}>
              score
            </span>
          </div>

          <TickerMark ticker={c.symbol} />

          {/* Ticker + state */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-[#F3EDE3]">{c.symbol}</span>
              <span
                className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${stateColor}15`, color: stateColor }}
              >
                {sig.state.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold" style={{ color: "#49B06E" }}>
                Gap +{gapPct}%
              </span>
              <span className="text-[10px] text-[#F3EDE3]/30">
                RVOL {c.rvol.toFixed(1)}x
              </span>
              {c.float !== null && (
                <span className="text-[10px] text-[#F3EDE3]/30">
                  Float {(c.float / 1_000_000).toFixed(1)}M
                </span>
              )}
            </div>
          </div>

          {/* Sparkline */}
          <div className="flex-shrink-0">
            <Sparkline symbol={c.symbol} width={64} height={26} />
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0 ml-1">
            <div className="text-sm font-bold text-[#F3EDE3]">${c.price.toFixed(2)}</div>
            <div className="flex items-center gap-0.5 justify-end" style={{ color: "#49B06E" }}>
              <ArrowUpRight className="w-3 h-3" />
              <span className="text-xs font-bold">+{c.change.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Catalyst headline */}
        {c.catalystHeadline && (
          <p className="text-[10px] text-[#F3EDE3]/35 truncate mb-2 pl-[52px]">
            {c.catalystHeadline}
          </p>
        )}

        {/* Entry / Stop / Target row */}
        {sig.entryZone && (
          <div
            className="rounded-lg px-3 py-2 flex items-center gap-4 text-[10px] flex-wrap"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 text-[#49B06E]" />
              <span className="text-[#F3EDE3]/40">Entry</span>
              <span className="text-[#49B06E] font-semibold">{sig.entryZone}</span>
            </div>
            {sig.invalidationLevel && (
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#EF4444]" />
                <span className="text-[#F3EDE3]/40">Stop</span>
                <span className="text-[#EF4444] font-semibold">{sig.invalidationLevel}</span>
              </div>
            )}
            {sig.target1 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#27B7C8]" />
                <span className="text-[#F3EDE3]/40">T1</span>
                <span className="text-[#27B7C8] font-semibold">{sig.target1}</span>
              </div>
            )}
            {sig.rr && (
              <span className="ml-auto text-[#F3EDE3]/25 font-medium">R:R {sig.rr}</span>
            )}
          </div>
        )}
      </div>

      {/* Expand for checklist */}
      <div className="px-3.5 pb-1">
        <button
          onClick={(e) => { e.stopPropagation(); haptic(); setExpanded(!expanded); }}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] text-[#F3EDE3]/30 hover:text-[#F3EDE3]/50 transition-colors"
        >
          {expanded ? "Hide" : "Show"} checklist
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <p className="text-[9px] text-[#F3EDE3]/30 uppercase tracking-wider font-bold pt-2 mb-1.5">
                Gap & Go Checklist
              </p>
              {sig.conditionsPassed.map((c) => (
                <div key={c} className="flex items-center gap-2 text-[11px]">
                  <span className="text-[#49B06E]">&#10003;</span>
                  <span className="text-[#F3EDE3]/60">{formatCondition(c)}</span>
                </div>
              ))}
              {sig.conditionsFailed.map((c) => (
                <div key={c} className="flex items-center gap-2 text-[11px]">
                  <span className="text-[#EF4444]">&#10007;</span>
                  <span className="text-[#F3EDE3]/40">{formatCondition(c)}</span>
                </div>
              ))}
              {sig.conditionsMissing.map((c) => (
                <div key={c} className="flex items-center gap-2 text-[11px]">
                  <span className="text-[#F3EDE3]/20">?</span>
                  <span className="text-[#F3EDE3]/25">{formatCondition(c)} (needs live data)</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function formatCondition(id: string): string {
  const labels: Record<string, string> = {
    "price-range": "Price in $2-$10 range",
    "gap-pct": "Gap 10%+ from prev close",
    "pm-volume": "RVOL 5x+ (heavy volume)",
    "catalyst": "News catalyst present",
    "float": "Low float (< 20M shares)",
    "pmh-break": "Pre-market high breakout",
  };
  return labels[id] || id;
}

export default function GapScannerPage() {
  const router = useRouter();
  const [gaps, setGaps] = useState<GapCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { trackGapScannerView(); }, []);

  const loadGaps = useCallback(async (fresh = false) => {
    if (fresh) setRefreshing(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({
        minPrice: "1",
        maxPrice: "20",
        minChange: "3",
        minRvol: "2",
      });
      if (fresh) params.set("fresh", "1");
      const res = await fetch(`/api/scanner/scan?${params}`);
      if (!res.ok) return;
      const data = await res.json();

      const candidates = (data.candidates || []) as Array<{
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
        signals?: SignalResult[];
      }>;

      const gapCandidates: GapCandidate[] = [];
      for (const c of candidates) {
        const gapSignal = c.signals?.find(
          (s) => s.strategyId === "gap-and-go" && s.state !== "INVALIDATED"
        );
        if (gapSignal) {
          gapCandidates.push({
            symbol: c.symbol,
            price: c.price,
            change: c.change,
            changeAbs: c.changeAbs,
            volume: c.volume,
            rvol: c.rvol,
            float: c.float,
            catalyst: c.catalyst,
            catalystHeadline: c.catalystHeadline,
            score: c.score,
            gapSignal,
          });
        }
      }

      gapCandidates.sort((a, b) => b.gapSignal.score - a.gapSignal.score);
      setGaps(gapCandidates);
      setLastRefresh(new Date());
    } catch {
      /* network error */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadGaps(); }, [loadGaps]);

  const pm = isPreMarket();
  const open = isMarketOpen();

  return (
    <Layout>
      <SEO
        title="Radar | Gap Scanner"
        description="Pre-market gap-and-go scanner — find gapping stocks with volume and catalysts."
      />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(73,176,110,0.15)" }}
            >
              <Zap className="w-5 h-5" style={{ color: "#49B06E" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#F3EDE3]">Gap Scanner</h1>
              <p className="text-xs text-[#F3EDE3]/40">
                {pm ? "Pre-market is open" : open ? "Market is open" : "Market closed"} — Gap & Go setups
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9, rotate: 180 }}
            onClick={() => { haptic(); loadGaps(true); }}
            disabled={refreshing}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <RefreshCw className={`w-4 h-4 text-[#F3EDE3]/50 ${refreshing ? "animate-spin" : ""}`} />
          </motion.button>
        </div>

        {/* Status banner */}
        {pm && (
          <div
            className="rounded-xl px-3.5 py-2.5 mb-4 flex items-center gap-2"
            style={{ background: "rgba(73,176,110,0.08)", border: "1px solid rgba(73,176,110,0.15)" }}
          >
            <div className="w-2 h-2 rounded-full bg-[#49B06E] animate-pulse" />
            <span className="text-xs text-[#49B06E] font-semibold">Pre-market active</span>
            <span className="text-[10px] text-[#F3EDE3]/30 ml-auto">
              Scanning for gaps
            </span>
          </div>
        )}

        {!pm && !open && (
          <div
            className="rounded-xl px-3.5 py-2.5 mb-4 flex items-center gap-2"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <Info className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="text-xs text-[#F59E0B]/80">
              Showing last session&apos;s gaps. Pre-market opens 4:00 AM ET.
            </span>
          </div>
        )}

        {/* Last refresh */}
        {lastRefresh && (
          <p className="text-[10px] text-[#F3EDE3]/20 mb-3 px-1">
            Last scan: {lastRefresh.toLocaleTimeString()}
            {refreshing && " · Refreshing..."}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-5 h-5 text-[#49B06E] animate-spin" />
            <span className="text-sm text-[#F3EDE3]/50">Scanning for gaps…</span>
          </div>
        )}

        {/* Empty */}
        {!loading && gaps.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[#49B06E]/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-[#49B06E]/60" />
            </div>
            <p className="text-sm font-medium text-[#F3EDE3]/50 mb-1">No gap setups found</p>
            <p className="text-xs text-[#F3EDE3]/30 max-w-[280px]">
              No stocks are gapping with enough volume and catalyst right now.
              Check back during pre-market (4:00-9:30 AM ET).
            </p>
          </div>
        )}

        {/* Gap cards */}
        {!loading && gaps.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] text-[#F3EDE3]/30 uppercase tracking-wider font-bold px-1">
              {gaps.length} gap setup{gaps.length !== 1 ? "s" : ""} found
            </p>
            {gaps.map((g, i) => (
              <GapCard
                key={g.symbol}
                c={g}
                i={i}
                onClick={() => router.push(`/stock/${g.symbol}`)}
              />
            ))}
          </div>
        )}

        {/* How it works */}
        <div
          className="mt-8 rounded-xl p-4 space-y-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[10px] text-[#F3EDE3]/40 uppercase tracking-wider font-bold">
            How Gap & Go Works
          </p>
          <div className="space-y-2">
            {[
              { n: "1", label: "Gap up 10%+", desc: "Stock opens significantly higher than previous close" },
              { n: "2", label: "Volume surge", desc: "Relative volume 5x+ average — real interest, not noise" },
              { n: "3", label: "News catalyst", desc: "Earnings beat, FDA approval, contract — a reason for the move" },
              { n: "4", label: "Low float", desc: "Under 20M shares — fewer shares = faster moves" },
              { n: "5", label: "Break PMH", desc: "Entry above pre-market high confirms buyers in control" },
            ].map((step) => (
              <div key={step.n} className="flex items-start gap-2.5">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(73,176,110,0.15)", color: "#49B06E" }}
                >
                  {step.n}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F3EDE3]/70">{step.label}</p>
                  <p className="text-[10px] text-[#F3EDE3]/30">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 px-1">
          <p className="text-[10px] text-[#F3EDE3]/20 leading-relaxed">
            Scanner results use delayed data and are for educational purposes only.
            Always verify setups with your own analysis. Past patterns do not guarantee future results.
          </p>
        </div>
      </div>
    </Layout>
  );
}
