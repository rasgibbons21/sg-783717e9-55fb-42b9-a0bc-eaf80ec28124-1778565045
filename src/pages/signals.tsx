/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, AlertTriangle,
  RefreshCw, Filter, ArrowUpRight, Eye,
  Newspaper, Sparkles, Target, ShieldCheck,
} from "lucide-react";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface ScannerCandidate {
  symbol: string;
  price: number;
  change: number;
  changeAbs: number;
  prevClose: number;
  volume: number;
  avgVolume: number;
  rvol: number;
  marketCap: number;
  float: number | null;
  catalyst: string;
  catalystHeadline: string | null;
  setup: string | null;
  score: number;
  scoreBreakdown: any;
  status: string;
  flags: string[];
  dataSource: string;
  timestamp: number;
}

interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  source: string;
  url: string;
  image?: string;
  publishedAt: string;
  symbols: string[];
}

interface PansyPick {
  symbol: string;
  confidence: "high" | "moderate" | "speculative";
  take: string;
  tradePlan: {
    entry: string;
    stop: string;
    target1: string;
    target2: string;
    riskReward: string;
  };
  keyFactors: string[];
}

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

function formatFloat(f: number | null): string {
  if (f === null) return "N/A";
  const m = f / 1_000_000;
  if (m < 1) return `${(f / 1_000).toFixed(0)}K`;
  return `${m.toFixed(1)}M`;
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CatalystBadge({ quality }: { quality: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    strong: { bg: "rgba(73,176,110,0.15)", text: "#49B06E", label: "Strong Catalyst" },
    moderate: { bg: "rgba(39,183,200,0.15)", text: "#27B7C8", label: "Moderate" },
    weak: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", label: "Weak" },
    unverified: { bg: "rgba(156,163,175,0.15)", text: "#9CA3AF", label: "Unverified" },
    none: { bg: "rgba(239,68,68,0.15)", text: "#EF4444", label: "No Catalyst" },
  };
  const s = styles[quality] || styles.none;
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "#49B06E" : score >= 50 ? "#27B7C8" : score >= 35 ? "#F59E0B" : "#EF4444";
  return (
    <div
      className="flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm"
      style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {score}
    </div>
  );
}

function SignalCard({ c, rank }: { c: ScannerCandidate; rank: number }) {
  const router = useRouter();
  const isQualified = c.status === "qualified";
  const floatM = c.float ? c.float / 1_000_000 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05, duration: 0.3 }}
      onClick={() => { haptic(); router.push(`/scanner/${c.symbol}`); }}
      className="rounded-2xl border p-4 cursor-pointer transition-all active:scale-[0.98]"
      style={{
        background: isQualified
          ? "linear-gradient(145deg, rgba(73,176,110,0.06), rgba(14,27,48,1))"
          : "linear-gradient(145deg, #0E1B30, #162540)",
        borderColor: isQualified ? "rgba(73,176,110,0.25)" : "rgba(39,183,200,0.15)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ScoreBadge score={c.score} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#F4F7FA]">{c.symbol}</span>
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: isQualified ? "rgba(73,176,110,0.2)" : "rgba(39,183,200,0.15)",
                  color: isQualified ? "#49B06E" : "#27B7C8",
                }}
              >
                {c.status === "qualified" ? "SIGNAL" : c.status === "watchlist" ? "WATCH" : "NEAR MISS"}
              </span>
            </div>
            <span className="text-xs text-[#F4F7FA]/40">${c.price.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[#49B06E] font-bold text-base">
            <ArrowUpRight className="w-4 h-4" />
            +{c.change.toFixed(1)}%
          </div>
          <span className="text-[10px] text-[#F4F7FA]/30">+${c.changeAbs.toFixed(2)}</span>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <div className="text-[10px] text-[#F4F7FA]/40 mb-0.5">RVOL</div>
          <div className="text-xs font-semibold" style={{ color: c.rvol >= 10 ? "#49B06E" : c.rvol >= 5 ? "#27B7C8" : "#F59E0B" }}>
            {c.rvol.toFixed(1)}x
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-[#F4F7FA]/40 mb-0.5">Volume</div>
          <div className="text-xs font-semibold text-[#F4F7FA]">{formatVolume(c.volume)}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-[#F4F7FA]/40 mb-0.5">Float</div>
          <div className="text-xs font-semibold" style={{ color: floatM !== null && floatM <= 20 ? "#49B06E" : "#F4F7FA" }}>
            {formatFloat(c.float)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-[#F4F7FA]/40 mb-0.5">Catalyst</div>
          <CatalystBadge quality={c.catalyst} />
        </div>
      </div>

      {/* Catalyst headline */}
      {c.catalystHeadline && (
        <p className="text-[11px] text-[#F4F7FA]/50 leading-relaxed mb-2 line-clamp-2">
          {c.catalystHeadline}
        </p>
      )}

      {/* Flags */}
      {c.flags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {c.flags.slice(0, 3).map((f, i) => (
            <span
              key={i}
              className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PansyPickCard({ pick, rank }: { pick: PansyPick; rank: number }) {
  const router = useRouter();
  const confColor = pick.confidence === "high" ? "#49B06E" : pick.confidence === "moderate" ? "#27B7C8" : "#F59E0B";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.4 }}
      onClick={() => { haptic(); router.push(`/scanner/${pick.symbol}`); }}
      className="rounded-2xl border p-4 cursor-pointer transition-all active:scale-[0.98]"
      style={{
        background: "linear-gradient(145deg, rgba(168,85,247,0.08), rgba(14,27,48,1))",
        borderColor: "rgba(168,85,247,0.25)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ background: "rgba(168,85,247,0.15)" }}
          >
            🌸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#F4F7FA]">{pick.symbol}</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                style={{ background: `${confColor}20`, color: confColor }}
              >
                {pick.confidence}
              </span>
            </div>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-purple-400/60" />
      </div>

      <p className="text-[13px] text-[#F4F7FA]/70 leading-relaxed mb-3">
        {pick.take}
      </p>

      <div
        className="rounded-xl p-3 mb-3 space-y-2"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <Target className="w-3 h-3 text-purple-400" />
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Hypothetical Trade Plan</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-[#F4F7FA]/40">Entry: </span>
            <span className="text-[#49B06E] font-medium">{pick.tradePlan.entry}</span>
          </div>
          <div>
            <span className="text-[#F4F7FA]/40">Stop: </span>
            <span className="text-[#EF4444] font-medium">{pick.tradePlan.stop}</span>
          </div>
          <div>
            <span className="text-[#F4F7FA]/40">Target 1: </span>
            <span className="text-[#27B7C8] font-medium">{pick.tradePlan.target1}</span>
          </div>
          <div>
            <span className="text-[#F4F7FA]/40">Target 2: </span>
            <span className="text-[#27B7C8] font-medium">{pick.tradePlan.target2}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 pt-1">
          <ShieldCheck className="w-3 h-3 text-[#49B06E]" />
          <span className="text-[10px] text-[#49B06E] font-semibold">R:R {pick.tradePlan.riskReward}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {pick.keyFactors.map((f, i) => (
          <span
            key={i}
            className="text-[9px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(168,85,247,0.1)", color: "rgba(168,85,247,0.7)" }}
          >
            {f}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function isMarketHours(): { open: boolean; message: string } {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const hour = et.getHours();
  const min = et.getMinutes();
  const time = hour * 60 + min;
  if (day === 0 || day === 6) return { open: false, message: "Markets are closed for the weekend" };
  if (time < 4 * 60) return { open: false, message: "Pre-market opens at 4:00 AM ET" };
  if (time < 9 * 60 + 30) return { open: false, message: "Pre-market is open — regular session at 9:30 AM ET" };
  if (time < 16 * 60) return { open: true, message: "Markets are open" };
  return { open: false, message: "Markets closed — scanner updates during trading hours" };
}

export default function SignalsPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<ScannerCandidate[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pansyPicks, setPansyPicks] = useState<PansyPick[]>([]);
  const [pansyNote, setPansyNote] = useState("");
  const [pansyLoading, setPansyLoading] = useState(false);
  const [filters, setFilters] = useState({
    catalystOnly: false,
    minRvol: 5,
    sortBy: "score" as string,
  });

  const loadPansyAnalysis = useCallback(async (scanCandidates: ScannerCandidate[]) => {
    const worthy = scanCandidates.filter(c => c.status === "qualified" || c.status === "watchlist");
    if (worthy.length === 0) return;
    setPansyLoading(true);
    try {
      const res = await fetch("/api/scanner/pansy-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: worthy.slice(0, 5) }),
      });
      if (res.ok) {
        const data = await res.json();
        setPansyPicks(data.picks || []);
        setPansyNote(data.marketNote || "");
      }
    } catch {} finally {
      setPansyLoading(false);
    }
  }, []);

  const loadScan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        minPrice: "2",
        maxPrice: "20",
        minChange: "5",
        minRvol: String(filters.minRvol),
        catalystOnly: String(filters.catalystOnly),
        sortBy: filters.sortBy,
      });
      const res = await fetch(`/api/scanner/scan?${params}`);
      if (!res.ok) throw new Error("Scanner unavailable");
      const data = await res.json();
      const results = data.candidates || [];
      setCandidates(results);
      setLastScan(data.timestamp);
      loadPansyAnalysis(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, loadPansyAnalysis]);

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const res = await fetch("/api/scanner/news?type=general");
      if (res.ok) {
        const data = await res.json();
        setNews(data.articles || []);
      }
    } catch {} finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScan();
    loadNews();
  }, [loadScan, loadNews]);

  const qualified = candidates.filter((c) => c.status === "qualified");
  const watchlist = candidates.filter((c) => c.status === "watchlist");
  const nearMisses = candidates.filter((c) => c.status === "near-miss" || c.status === "rejected");
  const market = isMarketHours();
  const hasScanData = !loading && !error && candidates.length > 0;

  return (
    <Layout>
      <SEO title="Bloom | Gap-and-Go Trading Signals" description="AI-powered Gap-and-Go scanner with Pansy's trade analysis, live signals, and market news" />

      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#F4F7FA]">Bloom</h1>
            <p className="text-xs text-[#F4F7FA]/40 mt-0.5">
              Gap-and-Go Scanner
              {lastScan && <> &middot; Updated {timeAgo(new Date(lastScan).toISOString())}</>}
            </p>
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

        {/* Market status bar */}
        <div
          className="rounded-xl p-3 mb-4 flex items-center justify-between"
          style={{ background: market.open ? "rgba(73,176,110,0.06)" : "rgba(39,183,200,0.06)", border: `1px solid ${market.open ? "rgba(73,176,110,0.15)" : "rgba(39,183,200,0.12)"}` }}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${market.open ? "bg-[#49B06E] animate-pulse" : "bg-[#F4F7FA]/30"}`} />
            <span className="text-xs font-medium text-[#F4F7FA]/70">{market.message}</span>
          </div>
          {hasScanData && (
            <div className="flex items-center gap-3 text-[10px] text-[#F4F7FA]/40">
              <span>{qualified.length} signals</span>
              <span>{watchlist.length} watching</span>
            </div>
          )}
        </div>

        {/* Filter panel */}
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
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#F4F7FA]/60">Min RVOL</span>
                  <div className="flex gap-1">
                    {[2, 5, 10, 15].map((v) => (
                      <button
                        key={v}
                        onClick={() => setFilters((f) => ({ ...f, minRvol: v }))}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                        style={{
                          background: filters.minRvol === v ? "rgba(39,183,200,0.2)" : "rgba(255,255,255,0.05)",
                          color: filters.minRvol === v ? "#27B7C8" : "#F4F7FA80",
                          border: `1px solid ${filters.minRvol === v ? "rgba(39,183,200,0.3)" : "transparent"}`,
                        }}
                      >
                        {v}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#F4F7FA]/60">Catalyst only</span>
                  <button
                    onClick={() => setFilters((f) => ({ ...f, catalystOnly: !f.catalystOnly }))}
                    className="w-10 h-5 rounded-full transition-colors relative"
                    style={{ background: filters.catalystOnly ? "#27B7C8" : "rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all"
                      style={{ left: filters.catalystOnly ? 22 : 2 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#F4F7FA]/60">Sort by</span>
                  <div className="flex gap-1">
                    {[
                      { v: "score", l: "Score" },
                      { v: "change", l: "% Gain" },
                      { v: "rvol", l: "RVOL" },
                      { v: "volume", l: "Vol" },
                    ].map(({ v, l }) => (
                      <button
                        key={v}
                        onClick={() => setFilters((f) => ({ ...f, sortBy: v }))}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                        style={{
                          background: filters.sortBy === v ? "rgba(39,183,200,0.2)" : "rgba(255,255,255,0.05)",
                          color: filters.sortBy === v ? "#27B7C8" : "#F4F7FA80",
                          border: `1px solid ${filters.sortBy === v ? "rgba(39,183,200,0.3)" : "transparent"}`,
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ SCANNER SECTION ═══ */}

        {/* Loading state */}
        {loading && (
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/5 p-4 animate-pulse"
                style={{ background: "#162540" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5" />
                  <div className="flex-1">
                    <div className="h-4 w-20 rounded bg-white/5 mb-1" />
                    <div className="h-3 w-14 rounded bg-white/5" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-8 rounded bg-white/5" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scanner offline — graceful, not scary */}
        {!loading && (error || candidates.length === 0) && (
          <div
            className="rounded-2xl p-5 mb-6 text-center"
            style={{ background: "linear-gradient(145deg, rgba(39,183,200,0.06), rgba(14,27,48,1))", border: "1px solid rgba(39,183,200,0.15)" }}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(39,183,200,0.1)" }}>
              {error ? "📡" : "🔍"}
            </div>
            <p className="text-sm font-semibold text-[#F4F7FA]/80 mb-1">
              {error ? "Scanner is reconnecting" : "No setups found right now"}
            </p>
            <p className="text-xs text-[#F4F7FA]/40 mb-3 max-w-xs mx-auto">
              {error
                ? "Market data feeds refresh during trading hours (9:30 AM – 4 PM ET). Check out the latest news below."
                : "Gap-and-Go setups appear when small-caps gap up with volume. Try adjusting filters or check back during market hours."
              }
            </p>
            <button
              onClick={loadScan}
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              style={{ background: "rgba(39,183,200,0.15)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.25)" }}
            >
              <RefreshCw className="w-3 h-3 inline mr-1.5" />
              Refresh Scanner
            </button>
          </div>
        )}

        {/* Pansy's Picks */}
        {(pansyLoading || pansyPicks.length > 0) && !loading && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🌸</span>
              <h2 className="text-sm font-bold text-[#F4F7FA]">Pansy&apos;s Top Picks</h2>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            {pansyNote && (
              <p className="text-[11px] text-[#F4F7FA]/40 mb-3 ml-7">{pansyNote}</p>
            )}
            {pansyLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl border p-4 animate-pulse"
                    style={{ background: "rgba(168,85,247,0.04)", borderColor: "rgba(168,85,247,0.15)" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10" />
                      <div className="h-4 w-16 rounded bg-white/5" />
                    </div>
                    <div className="h-3 w-full rounded bg-white/5 mb-2" />
                    <div className="h-3 w-3/4 rounded bg-white/5 mb-3" />
                    <div className="h-16 rounded-xl bg-white/5" />
                  </div>
                ))}
                <p className="text-[10px] text-purple-400/50 text-center">Pansy is analyzing today&apos;s setups...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pansyPicks.map((pick, i) => (
                  <PansyPickCard key={pick.symbol} pick={pick} rank={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Qualified Signals */}
        {hasScanData && qualified.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#49B06E]" />
              <h2 className="text-sm font-bold text-[#F4F7FA]">Qualified Signals</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#49B06E]/15 text-[#49B06E] font-semibold">
                {qualified.length}
              </span>
            </div>
            <div className="space-y-3">
              {qualified.map((c, i) => <SignalCard key={c.symbol} c={c} rank={i} />)}
            </div>
          </div>
        )}

        {/* Watchlist */}
        {hasScanData && watchlist.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-[#27B7C8]" />
              <h2 className="text-sm font-bold text-[#F4F7FA]">Watchlist</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#27B7C8]/15 text-[#27B7C8] font-semibold">
                {watchlist.length}
              </span>
            </div>
            <div className="space-y-3">
              {watchlist.map((c, i) => <SignalCard key={c.symbol} c={c} rank={i} />)}
            </div>
          </div>
        )}

        {/* ═══ NEWS SECTION — always shows ═══ */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-[#F59E0B]" />
            <h2 className="text-sm font-bold text-[#F4F7FA]">Market News</h2>
          </div>

          {newsLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl p-3 animate-pulse" style={{ background: "#162540" }}>
                  <div className="h-4 w-3/4 rounded bg-white/5 mb-2" />
                  <div className="h-3 w-1/2 rounded bg-white/5" />
                </div>
              ))}
            </div>
          )}

          {!newsLoading && news.length === 0 && (
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-sm text-[#F4F7FA]/40">No market news available right now.</p>
            </div>
          )}

          {!newsLoading && news.length > 0 && (
            <div className="space-y-2">
              {news.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl p-3 transition-all hover:bg-white/5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex gap-3">
                    {article.image && (
                      <img
                        src={article.image}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#F4F7FA] line-clamp-2 leading-snug mb-1">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-[#F4F7FA]/30">
                        <span>{article.source}</span>
                        <span>&middot;</span>
                        <span>{timeAgo(article.publishedAt)}</span>
                        {article.symbols.length > 0 && (
                          <>
                            <span>&middot;</span>
                            <span className="text-[#27B7C8]">${article.symbols[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Near Misses */}
        {hasScanData && nearMisses.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="text-sm font-bold text-[#F4F7FA]/60">Near Misses</h2>
            </div>
            <div className="space-y-2">
              {nearMisses.slice(0, 5).map((c) => (
                <div
                  key={c.symbol}
                  onClick={() => router.push(`/scanner/${c.symbol}`)}
                  className="flex items-center justify-between rounded-xl p-3 cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F4F7FA]/60">{c.symbol}</span>
                    <span className="text-[10px] text-[#49B06E]">+{c.change.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#F4F7FA]/30">{c.rvol.toFixed(1)}x</span>
                    <span className="text-[10px] text-[#F4F7FA]/30">Score: {c.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div
          className="rounded-xl p-3 mt-2"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[10px] text-[#F4F7FA]/30 leading-relaxed">
            <strong className="text-[#F4F7FA]/40">Educational decision support only.</strong>{" "}
            Signals are hypothetical paper-trade candidates, not investment advice. Market data may be delayed.
            Day trading involves significant risk of loss. Verify all data and make your own decisions.
          </p>
        </div>
      </div>
    </Layout>
  );
}
