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
  TrendingUp, Lock,
} from "lucide-react";
import { PlayReviewsRail } from "@/components/PlayReviewsRail";

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

interface PansyBriefing {
  greeting: string;
  briefing: string;
  watchlist: { symbol: string; reason: string }[];
  mood: "bullish" | "bearish" | "cautious" | "mixed";
  moodNote: string;
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
          ? "linear-gradient(145deg, rgba(73,176,110,0.06), rgba(7,8,12,1))"
          : "linear-gradient(145deg, #121821, #171E28)",
        borderColor: isQualified ? "rgba(73,176,110,0.25)" : "rgba(39,183,200,0.15)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <ScoreBadge score={c.score} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#F3EDE3]">{c.symbol}</span>
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
            <span className="text-xs text-[#F3EDE3]/40">${c.price.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[#49B06E] font-bold text-base">
            <ArrowUpRight className="w-4 h-4" />
            +{c.change.toFixed(1)}%
          </div>
          <span className="text-[10px] text-[#F3EDE3]/30">+${c.changeAbs.toFixed(2)}</span>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <div className="text-[10px] text-[#F3EDE3]/40 mb-0.5">RVOL</div>
          <div className="text-xs font-semibold" style={{ color: c.rvol >= 10 ? "#49B06E" : c.rvol >= 5 ? "#27B7C8" : "#F59E0B" }}>
            {c.rvol.toFixed(1)}x
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-[#F3EDE3]/40 mb-0.5">Volume</div>
          <div className="text-xs font-semibold text-[#F3EDE3]">{formatVolume(c.volume)}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-[#F3EDE3]/40 mb-0.5">Float</div>
          <div className="text-xs font-semibold" style={{ color: floatM !== null && floatM <= 20 ? "#49B06E" : "#F3EDE3" }}>
            {formatFloat(c.float)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-[#F3EDE3]/40 mb-0.5">Catalyst</div>
          <CatalystBadge quality={c.catalyst} />
        </div>
      </div>

      {/* Catalyst headline */}
      {c.catalystHeadline && (
        <p className="text-[11px] text-[#F3EDE3]/50 leading-relaxed mb-2 line-clamp-2">
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
        background: "linear-gradient(145deg, rgba(168,85,247,0.08), rgba(7,8,12,1))",
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
              <span className="text-lg font-bold text-[#F3EDE3]">{pick.symbol}</span>
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

      <p className="text-[13px] text-[#F3EDE3]/70 leading-relaxed mb-3">
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
            <span className="text-[#F3EDE3]/40">Entry: </span>
            <span className="text-[#49B06E] font-medium">{pick.tradePlan.entry}</span>
          </div>
          <div>
            <span className="text-[#F3EDE3]/40">Stop: </span>
            <span className="text-[#EF4444] font-medium">{pick.tradePlan.stop}</span>
          </div>
          <div>
            <span className="text-[#F3EDE3]/40">Target 1: </span>
            <span className="text-[#27B7C8] font-medium">{pick.tradePlan.target1}</span>
          </div>
          <div>
            <span className="text-[#F3EDE3]/40">Target 2: </span>
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
  if (day === 0 || day === 6) return { open: false, message: "Weekend — markets reopen Monday" };
  if (time < 4 * 60) return { open: false, message: "Pre-market opens at 4:00 AM ET" };
  if (time < 9 * 60 + 30) return { open: false, message: "Pre-market is open — regular session at 9:30 AM ET" };
  if (time < 16 * 60) return { open: true, message: "Markets are open" };
  return { open: false, message: "After hours — Pansy is watching the news" };
}

export default function SignalsPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<ScannerCandidate[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [lastScan, setLastScan] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pansyPicks, setPansyPicks] = useState<PansyPick[]>([]);
  const [pansyNote, setPansyNote] = useState("");
  const [pansyLoading, setPansyLoading] = useState(false);
  const [pansyBriefing, setPansyBriefing] = useState<PansyBriefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [filters, setFilters] = useState({
    catalystOnly: false,
    minRvol: 5,
    sortBy: "score" as string,
  });

  const loadPansyBriefing = useCallback(async () => {
    if (pansyBriefing) return;
    setBriefingLoading(true);
    try {
      const res = await fetch("/api/scanner/pansy-briefing");
      if (res.ok) {
        const data = await res.json();
        setPansyBriefing(data);
      }
    } catch {} finally {
      setBriefingLoading(false);
    }
  }, [pansyBriefing]);

  const loadPansyAnalysis = useCallback(async (scanCandidates: ScannerCandidate[]) => {
    const worthy = scanCandidates.filter(c => c.status === "qualified" || c.status === "watchlist");
    if (worthy.length === 0) {
      loadPansyBriefing();
      return;
    }
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
  }, [loadPansyBriefing]);

  const loadScan = useCallback(async () => {
    setLoading(true);
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
      const data = res.ok ? await res.json() : { candidates: [] };
      const results = data.candidates || [];
      setCandidates(results);
      setLastScan(data.timestamp || Date.now());
      loadPansyAnalysis(results);
    } catch {
      loadPansyBriefing();
    } finally {
      setLoading(false);
    }
  }, [filters, loadPansyAnalysis, loadPansyBriefing]);

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
  const hasScanData = !loading && candidates.length > 0;

  return (
    <Layout>
      <SEO title="Radar | Stock Screener & Alerts" description="Stock screener, price alerts, and Pansy AI market chat. Watchlist, market movers, and paper trading." />

      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
        {/* Subheader */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs" style={{ color: "var(--r-meta)" }}>
            Stock Screener
            {lastScan && <> &middot; Updated {timeAgo(new Date(lastScan).toISOString())}</>}
          </p>
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
        {(
          <div
            className="rounded-xl p-3 mb-4 flex items-center justify-between"
            style={{ background: market.open ? "rgba(73,176,110,0.06)" : "rgba(39,183,200,0.06)", border: `1px solid ${market.open ? "rgba(73,176,110,0.15)" : "rgba(39,183,200,0.12)"}` }}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${market.open ? "bg-[#49B06E] animate-pulse" : "bg-[#F3EDE3]/30"}`} />
              <span className="text-xs font-medium text-[#F3EDE3]/70">{market.message}</span>
            </div>
            {hasScanData && (
              <div className="flex items-center gap-3 text-[10px] text-[#F3EDE3]/40">
                <span>{qualified.length} signals</span>
                <span>{watchlist.length} watching</span>
              </div>
            )}
          </div>
        )}

        {/* ═══ PANSY SCREENER CHIP ═══ */}
        <div className="mb-4">
          <div
            className="rounded-xl p-3"
            style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.12)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🌸</span>
              <span className="text-xs font-semibold text-[#F3EDE3]/70">Pansy Screen Queries</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "FCF yield > 5%; FCF positive; D/E < 0.3",
                "Golden cross, volume above 20-day avg",
                "Low-vol stocks, beta < 0.8",
                "Dividend growth, 5-year streak",
              ].map((q) => (
                <a
                  key={q}
                  href={`/ask-pansy`}
                  className="text-[10px] px-2 py-1 rounded-lg transition-colors hover:bg-[#A855F7]/10"
                  style={{ background: "rgba(168,85,247,0.08)", color: "#C084FC", border: "1px solid rgba(168,85,247,0.15)" }}
                >
                  {q}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ SHORTCUT TILES ═══ */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Screener", icon: "🔍", href: "#", active: true },
            { label: "Radar+", icon: "📡", href: "/subscription" },
            { label: "Alerts", icon: "🔔", href: "/subscription" },
            { label: "Trade", icon: "📈", href: "/paper-trader-v2" },
          ].map((tile) => (
            <a
              key={tile.label}
              href={tile.href}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-center transition-all"
              style={{
                background: tile.active ? "rgba(39,183,200,0.1)" : "rgba(255,255,255,0.03)",
                border: tile.active ? "1px solid rgba(39,183,200,0.2)" : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span className="text-lg">{tile.icon}</span>
              <span className="text-[10px] font-semibold" style={{ color: tile.active ? "#27B7C8" : "rgba(244,247,250,0.5)" }}>
                {tile.label}
              </span>
            </a>
          ))}
        </div>

        {/* ═══ FIRST-RUN PANSY CARD ═══ */}
        <div
          className="rounded-2xl border p-4 mb-4"
          style={{ background: "linear-gradient(145deg, rgba(168,85,247,0.06), rgba(7,8,12,1))", borderColor: "rgba(168,85,247,0.2)" }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: "rgba(168,85,247,0.12)" }}>
              🌺
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F3EDE3] mb-1">Meet Pansy — your AI analyst</p>
              <p className="text-xs text-[#F3EDE3]/50 leading-relaxed italic">
                &ldquo;I screen, I explain the alert, I do not place the trade.&rdquo;
              </p>
              <a
                href="/ask-pansy"
                className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: "rgba(168,85,247,0.12)", color: "#C084FC", border: "1px solid rgba(168,85,247,0.2)" }}
              >
                <Sparkles className="w-3 h-3" />
                Ask Pansy anything
              </a>
            </div>
          </div>
        </div>

        {/* ═══ PREMIUM TOOL CARDS ═══ */}
        <div className="mb-4 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2" style={{ width: "max-content" }}>
            {[
              { icon: "🔍", title: "Stock Screener", desc: "Scored 0–100 by strategy", color: "#27B7C8", href: "#" },
              { icon: "🔔", title: "Price Alerts", desc: "Levels & screen matches", color: "#49B06E", href: "/subscription" },
              { icon: "📊", title: "Options Tape", desc: "Unusual activity feed", color: "#A855F7", href: "/subscription" },
              { icon: "📈", title: "Paper Trade", desc: "$10K virtual capital", color: "#F59E0B", href: "/paper-trader-v2" },
            ].map((tool) => (
              <a
                key={tool.title}
                href={tool.href}
                className="flex-shrink-0 w-[140px] rounded-xl p-3 transition-all hover:scale-[1.02]"
                style={{ background: `${tool.color}08`, border: `1px solid ${tool.color}20` }}
              >
                <span className="text-lg block mb-1.5">{tool.icon}</span>
                <p className="text-xs font-bold text-[#F3EDE3] mb-0.5">{tool.title}</p>
                <p className="text-[10px] text-[#F3EDE3]/40">{tool.desc}</p>
              </a>
            ))}
          </div>
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
                  <span className="text-xs text-[#F3EDE3]/60">Min RVOL</span>
                  <div className="flex gap-1">
                    {[2, 5, 10, 15].map((v) => (
                      <button
                        key={v}
                        onClick={() => setFilters((f) => ({ ...f, minRvol: v }))}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                        style={{
                          background: filters.minRvol === v ? "rgba(39,183,200,0.2)" : "rgba(255,255,255,0.05)",
                          color: filters.minRvol === v ? "#27B7C8" : "#F3EDE380",
                          border: `1px solid ${filters.minRvol === v ? "rgba(39,183,200,0.3)" : "transparent"}`,
                        }}
                      >
                        {v}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#F3EDE3]/60">Catalyst only</span>
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
                  <span className="text-xs text-[#F3EDE3]/60">Sort by</span>
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
                          color: filters.sortBy === v ? "#27B7C8" : "#F3EDE380",
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
                style={{ background: "#121821" }}
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

        {/* No stock setups right now */}
        {!loading && candidates.length === 0 && (
          <div
            className="rounded-2xl p-5 mb-6 text-center"
            style={{ background: "linear-gradient(145deg, rgba(39,183,200,0.06), rgba(7,8,12,1))", border: "1px solid rgba(39,183,200,0.15)" }}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "rgba(39,183,200,0.1)" }}>
              🔍
            </div>
            <p className="text-sm font-semibold text-[#F3EDE3]/80 mb-1">
              {!market.open ? "Markets are closed" : "No setups found right now"}
            </p>
            <p className="text-xs text-[#F3EDE3]/40 mb-3 max-w-xs mx-auto">
              {!market.open
                ? "Gap-and-Go setups appear when small-caps gap up at market open. Pansy is watching the news for you below."
                : "No small-caps are gapping up with volume right now. Check Pansy's briefing below or adjust your filters."
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
              <h2 className="text-sm font-bold text-[#F3EDE3]">Pansy&apos;s Top Picks</h2>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            {pansyNote && (
              <p className="text-[11px] text-[#F3EDE3]/40 mb-3 ml-7">{pansyNote}</p>
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
              <h2 className="text-sm font-bold text-[#F3EDE3]">Qualified Signals</h2>
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
              <h2 className="text-sm font-bold text-[#F3EDE3]">Watchlist</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#27B7C8]/15 text-[#27B7C8] font-semibold">
                {watchlist.length}
              </span>
            </div>
            <div className="space-y-3">
              {watchlist.map((c, i) => <SignalCard key={c.symbol} c={c} rank={i} />)}
            </div>
          </div>
        )}


        {/* ═══ PANSY BRIEFING — shows when scanner has no picks ═══ */}
        {(briefingLoading || pansyBriefing) && pansyPicks.length === 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">🌸</span>
              <h2 className="text-sm font-bold text-[#F3EDE3]">Pansy&apos;s Market Briefing</h2>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>

            {briefingLoading ? (
              <div className="space-y-3">
                <div
                  className="rounded-2xl border p-4 animate-pulse"
                  style={{ background: "rgba(168,85,247,0.04)", borderColor: "rgba(168,85,247,0.15)" }}
                >
                  <div className="h-4 w-3/4 rounded bg-white/5 mb-3" />
                  <div className="h-3 w-full rounded bg-white/5 mb-2" />
                  <div className="h-3 w-5/6 rounded bg-white/5 mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 rounded-xl bg-white/5" />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-purple-400/50 text-center">Pansy is checking the markets...</p>
              </div>
            ) : pansyBriefing ? (
              <div
                className="rounded-2xl border p-4"
                style={{ background: "rgba(168,85,247,0.04)", borderColor: "rgba(168,85,247,0.15)" }}
              >
                <p className="text-xs text-[#F3EDE3]/60 mb-2 italic">{pansyBriefing.greeting}</p>
                <p className="text-sm text-[#F3EDE3]/80 mb-3 leading-relaxed">{pansyBriefing.briefing}</p>

                {/* Mood indicator */}
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 mb-3 w-fit"
                  style={{
                    background: pansyBriefing.mood === "bullish" ? "rgba(73,176,110,0.1)" :
                      pansyBriefing.mood === "bearish" ? "rgba(239,68,68,0.1)" :
                      "rgba(245,158,11,0.1)",
                    border: `1px solid ${
                      pansyBriefing.mood === "bullish" ? "rgba(73,176,110,0.2)" :
                      pansyBriefing.mood === "bearish" ? "rgba(239,68,68,0.2)" :
                      "rgba(245,158,11,0.2)"
                    }`,
                  }}
                >
                  <span className="text-xs">
                    {pansyBriefing.mood === "bullish" ? "🟢" : pansyBriefing.mood === "bearish" ? "🔴" : "🟡"}
                  </span>
                  <span className="text-[11px] font-semibold capitalize" style={{
                    color: pansyBriefing.mood === "bullish" ? "#49B06E" :
                      pansyBriefing.mood === "bearish" ? "#EF4444" : "#F59E0B",
                  }}>
                    {pansyBriefing.mood}
                  </span>
                  <span className="text-[10px] text-[#F3EDE3]/40">— {pansyBriefing.moodNote}</span>
                </div>

                {/* Watchlist */}
                {pansyBriefing.watchlist.length > 0 && (
                  <div>
                    <p className="text-[10px] text-purple-400/60 font-semibold uppercase tracking-wider mb-2">Watching</p>
                    <div className="space-y-1.5">
                      {pansyBriefing.watchlist.map((item) => (
                        <div
                          key={item.symbol}
                          className="flex items-start gap-2 rounded-lg p-2"
                          style={{ background: "rgba(255,255,255,0.03)" }}
                        >
                          <span className="text-xs font-bold text-[#27B7C8] min-w-[60px]">{item.symbol}</span>
                          <span className="text-[11px] text-[#F3EDE3]/50 leading-snug">{item.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* ═══ NEWS SECTION — always shows ═══ */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Newspaper className="w-4 h-4 text-[#F59E0B]" />
            <h2 className="text-sm font-bold text-[#F3EDE3]">Market News</h2>
          </div>

          {newsLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl p-3 animate-pulse" style={{ background: "#121821" }}>
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
              <p className="text-sm text-[#F3EDE3]/40">No market news available right now.</p>
            </div>
          )}

          {!newsLoading && news.length > 0 && (
            <div className="space-y-2">
              {news.slice(0, 5).map((article) => (
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
                      <h3 className="text-sm font-medium text-[#F3EDE3] line-clamp-2 leading-snug mb-1">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-[#F3EDE3]/30">
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

        {/* ═══ PANSY'S CONCLUSION — after news ═══ */}
        {pansyBriefing && (
          <div
            className="rounded-2xl border p-4 mb-6"
            style={{ background: "rgba(168,85,247,0.04)", borderColor: "rgba(168,85,247,0.15)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🌸</span>
              <h2 className="text-sm font-bold text-[#F3EDE3]">Pansy&apos;s Take</h2>
            </div>
            <p className="text-sm text-[#F3EDE3]/80 leading-relaxed mb-2">{pansyBriefing.briefing}</p>
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 w-fit"
              style={{
                background: pansyBriefing.mood === "bullish" ? "rgba(73,176,110,0.1)" :
                  pansyBriefing.mood === "bearish" ? "rgba(239,68,68,0.1)" :
                  "rgba(245,158,11,0.1)",
                border: `1px solid ${
                  pansyBriefing.mood === "bullish" ? "rgba(73,176,110,0.2)" :
                  pansyBriefing.mood === "bearish" ? "rgba(239,68,68,0.2)" :
                  "rgba(245,158,11,0.2)"
                }`,
              }}
            >
              <span className="text-xs">
                {pansyBriefing.mood === "bullish" ? "🟢" : pansyBriefing.mood === "bearish" ? "🔴" : "🟡"}
              </span>
              <span className="text-[11px] font-semibold capitalize" style={{
                color: pansyBriefing.mood === "bullish" ? "#49B06E" :
                  pansyBriefing.mood === "bearish" ? "#EF4444" : "#F59E0B",
              }}>
                {pansyBriefing.mood}
              </span>
              <span className="text-[10px] text-[#F3EDE3]/40">— {pansyBriefing.moodNote}</span>
            </div>
          </div>
        )}

        {/* Near Misses */}
        {hasScanData && nearMisses.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="text-sm font-bold text-[#F3EDE3]/60">Near Misses</h2>
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
                    <span className="text-xs font-bold text-[#F3EDE3]/60">{c.symbol}</span>
                    <span className="text-[10px] text-[#49B06E]">+{c.change.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#F3EDE3]/30">{c.rvol.toFixed(1)}x</span>
                    <span className="text-[10px] text-[#F3EDE3]/30">Score: {c.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ LOCKED SIGNAL TABLE ═══ */}
        <div className="mb-6 relative">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[#27B7C8]" />
            <h2 className="text-sm font-bold text-[#F3EDE3]">Live Alert Tape</h2>
            <Lock className="w-3 h-3 text-[#F3EDE3]/30" />
          </div>
          <div className="rounded-xl overflow-hidden relative" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                  <th className="text-left px-3 py-2 font-semibold text-[#F3EDE3]/50">Time</th>
                  <th className="text-left px-3 py-2 font-semibold text-[#F3EDE3]/50">Symbol</th>
                  <th className="text-left px-3 py-2 font-semibold text-[#F3EDE3]/50">Bias</th>
                  <th className="text-right px-3 py-2 font-semibold text-[#F3EDE3]/50">Chg%</th>
                </tr>
              </thead>
              <tbody className="blur-[4px] select-none pointer-events-none">
                {[
                  { time: "9:34", sym: "ABCD", bias: "Bullish", chg: "+8.2%" },
                  { time: "9:37", sym: "EFGH", bias: "Bearish", chg: "-3.1%" },
                  { time: "9:41", sym: "IJKL", bias: "Bullish", chg: "+12.5%" },
                  { time: "9:45", sym: "MNOP", bias: "Bullish", chg: "+5.7%" },
                ].map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                    <td className="px-3 py-2 text-[#F3EDE3]/40">{row.time}</td>
                    <td className="px-3 py-2 font-semibold text-[#F3EDE3]">{row.sym}</td>
                    <td className="px-3 py-2 text-[#49B06E]">{row.bias}</td>
                    <td className="px-3 py-2 text-right text-[#49B06E]">{row.chg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(7,8,12,0.75)" }}>
              <Lock className="w-5 h-5 text-[#27B7C8] mb-2" />
              <p className="text-xs font-semibold text-[#F3EDE3]/80 mb-1">Unlock live alert tape</p>
              <p className="text-[10px] text-[#F3EDE3]/40 mb-2">Real-time screen matches and price alerts</p>
              <a
                href="/subscription"
                className="text-[10px] font-bold px-4 py-1.5 rounded-lg transition-colors"
                style={{ background: "rgba(39,183,200,0.15)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.25)" }}
              >
                Start Free Trial
              </a>
            </div>
          </div>
        </div>

        {/* Reviews rail */}
        <PlayReviewsRail />

        {/* Disclaimer */}
        <div
          className="rounded-xl p-3 mt-2"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[10px] text-[#F3EDE3]/30 leading-relaxed">
            <strong className="text-[#F3EDE3]/40">Educational decision support only.</strong>{" "}
            Alerts are price/level/screen-match notifications, not trade recommendations.
            Market data may be delayed. Day trading involves significant risk of loss. Verify all data and make your own decisions.
          </p>
        </div>
      </div>
    </Layout>
  );
}
