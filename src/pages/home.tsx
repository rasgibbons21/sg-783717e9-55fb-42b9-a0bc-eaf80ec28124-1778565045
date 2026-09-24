/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, ArrowUpRight, ArrowDownRight,
  RefreshCw, Bell, Newspaper, ChevronRight, Radar, Flower2, ChevronDown, Gift, Flame,
  Swords, CheckCircle2, LayoutGrid, X, Loader2, TrendingUp, TrendingDown,
} from "lucide-react";
import Link from "next/link";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface IndexQuote {
  symbol: string;
  price: number;
  changesPercentage: number;
  change: number;
}

interface TopSetup {
  symbol: string;
  price: number;
  change: number;
  score: number;
  strategyName: string;
  state: string;
  entryZone: string | null;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  symbols: string[];
}

interface ScannerAlert {
  id: string;
  symbol: string;
  strategy: string;
  signal_state: string;
  score: number;
  price: number | null;
  change_pct: number | null;
  entry_zone: string | null;
  reason: string | null;
  created_at: string;
}

function getSession(): { label: string; detail: string; color: string } {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = et.getDay();
  const h = et.getHours();
  const m = et.getMinutes();
  const t = h * 60 + m;

  if (day === 0 || day === 6) return { label: "Closed", detail: "Weekend — markets reopen Monday", color: "#F3EDE3" };
  if (t < 240) return { label: "Closed", detail: "Pre-market opens at 4:00 AM ET", color: "#F3EDE3" };
  if (t < 570) return { label: "Pre-Market", detail: "Regular session at 9:30 AM ET", color: "#F59E0B" };
  if (t < 960) return { label: "Market Open", detail: "Regular session is live", color: "#49B06E" };
  if (t < 1200) return { label: "After Hours", detail: "Extended trading until 8:00 PM ET", color: "#27B7C8" };
  return { label: "Closed", detail: "Markets reopen tomorrow", color: "#F3EDE3" };
}

function getGreeting(name: string | null): string {
  const h = new Date().getHours();
  const first = name?.split(" ")[0] || "";
  const who = first ? `, ${first}` : "";
  if (h < 12) return `Good morning${who}`;
  if (h < 17) return `Good afternoon${who}`;
  return `Good evening${who}`;
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

export default function HomePage() {
  const router = useRouter();
  const { userName } = useSubscription();
  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [indicesLoading, setIndicesLoading] = useState(true);
  const [setupCount, setSetupCount] = useState(0);
  const [byStrategy, setByStrategy] = useState<Record<string, number>>({});
  const [topSetups, setTopSetups] = useState<TopSetup[]>([]);
  const [setupsLoading, setSetupsLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [alerts, setAlerts] = useState<ScannerAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [sectors, setSectors] = useState<IndexQuote[]>([]);
  const [sectorsLoading, setSectorsLoading] = useState(true);
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [sectorStocks, setSectorStocks] = useState<Array<{ symbol: string; name: string; price: number; change: number; marketCap: number; volume: number }>>([]);
  const [sectorStocksLoading, setSectorStocksLoading] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [streakLogged, setStreakLogged] = useState(false);
  const [challenge, setChallenge] = useState<{ id: string; title: string; description: string; rewardXp: number; type: string } | null>(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [challengeLoading, setChallengeLoading] = useState(false);

  const session = getSession();

  const loadIndices = useCallback(async () => {
    setIndicesLoading(true);
    try {
      const res = await fetch("/api/scanner/quotes?symbols=SPY,QQQ,IWM,%5EVIX");
      if (res.ok) {
        const data = await res.json();
        setIndices(data.quotes || []);
      }
    } catch {} finally {
      setIndicesLoading(false);
    }
  }, []);

  const loadSetups = useCallback(async () => {
    setSetupsLoading(true);
    try {
      const res = await fetch("/api/scanner/scan");
      if (res.ok) {
        const data = await res.json();
        const candidates = data.candidates || [];
        const strats: Record<string, number> = {};
        const tops: TopSetup[] = [];

        for (const c of candidates) {
          if (c.signals && c.signals.length > 0) {
            for (const sig of c.signals) {
              strats[sig.strategyName] = (strats[sig.strategyName] || 0) + 1;
            }
            const best = c.signals[0];
            tops.push({
              symbol: c.symbol,
              price: c.price,
              change: c.change,
              score: best.score,
              strategyName: best.strategyName,
              state: best.state,
              entryZone: best.entryZone,
            });
          }
        }

        tops.sort((a, b) => b.score - a.score);
        setSetupCount(tops.length);
        setByStrategy(strats);
        setTopSetups(tops.slice(0, 5));
      }
    } catch {} finally {
      setSetupsLoading(false);
    }
  }, []);

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const res = await fetch("/api/scanner/news?type=general");
      if (res.ok) {
        const data = await res.json();
        setNews((data.articles || []).slice(0, 4));
      }
    } catch {} finally {
      setNewsLoading(false);
    }
  }, []);

  const loadAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const res = await fetch("/api/scanner/alerts?limit=5");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch {} finally {
      setAlertsLoading(false);
    }
  }, []);

  const loadSectors = useCallback(async () => {
    setSectorsLoading(true);
    try {
      const syms = "XLK,XLF,XLE,XLV,XLC,XLI,XLY,XLP,XLB,XLRE,XLU";
      const res = await fetch(`/api/scanner/quotes?symbols=${syms}`);
      if (res.ok) {
        const data = await res.json();
        setSectors(data.quotes || []);
      }
    } catch {} finally {
      setSectorsLoading(false);
    }
  }, []);

  const openSector = useCallback(async (etf: string) => {
    haptic();
    if (activeSector === etf) { setActiveSector(null); return; }
    setActiveSector(etf);
    setSectorStocks([]);
    setSectorStocksLoading(true);
    try {
      const res = await fetch(`/api/scanner/sector?etf=${etf}`);
      if (res.ok) {
        const data = await res.json();
        setSectorStocks(data.stocks || []);
      }
    } catch {} finally {
      setSectorStocksLoading(false);
    }
  }, [activeSector]);

  const loadBriefing = useCallback(async () => {
    try {
      const res = await fetch("/api/daily-briefing");
      if (res.ok) {
        const data = await res.json();
        if (data.content) setBriefing(data.content);
      }
    } catch {}
  }, []);

  const loadChallenge = useCallback(async () => {
    try {
      const res = await fetch("/api/daily-challenge");
      if (res.ok) {
        const data = await res.json();
        if (data.challenge) {
          setChallenge(data.challenge);
          setChallengeCompleted(data.completed);
        }
      }
    } catch {}
  }, []);

  const logStreak = useCallback(async () => {
    if (streakLogged) return;
    try {
      const res = await fetch("/api/streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityType: "login" }),
      });
      if (res.ok) {
        const data = await res.json();
        setStreak(data.currentStreak ?? 0);
        setStreakLogged(true);
      }
    } catch {}
  }, [streakLogged]);

  useEffect(() => {
    loadIndices();
    loadSetups();
    loadNews();
    loadAlerts();
    loadSectors();
    loadBriefing();
    loadChallenge();
    logStreak();
  }, [loadIndices, loadSetups, loadNews, loadAlerts, loadSectors, loadBriefing, loadChallenge, logStreak]);

  const stateLabel = (s: string) => {
    const map: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: "ACTIVE", color: "#49B06E" },
      NEAR_TRIGGER: { label: "NEAR TRIGGER", color: "#F59E0B" },
      WATCH: { label: "WATCH", color: "#27B7C8" },
    };
    return map[s] || { label: s, color: "#F3EDE3" };
  };

  return (
    <Layout>
      <SEO title="Radar | Home" description="Your radar dashboard — setups, market status, and alerts at a glance." />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">

        {/* Greeting */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#F3EDE3]">{getGreeting(userName)}</h1>
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-xs font-bold text-[#F59E0B]">{streak}</span>
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: session.color,
                boxShadow: session.label === "Market Open" ? "0 0 6px rgba(73,176,110,0.5)" : "none",
              }}
            />
            <span className="text-xs font-medium" style={{ color: session.color }}>{session.label}</span>
            <span className="text-xs text-[#F3EDE3]/40">{session.detail}</span>
          </div>
        </div>

        {/* Index quotes: SPY QQQ IWM VIX */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {indicesLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl p-2.5 animate-pulse" style={{ background: "#121821" }}>
                <div className="h-3 w-10 rounded bg-white/5 mb-1.5" />
                <div className="h-4 w-14 rounded bg-white/5" />
              </div>
            ))
          ) : indices.length > 0 ? (
            indices.map(q => {
              const isUp = q.changesPercentage >= 0;
              const isVix = q.symbol.includes("VIX");
              return (
                <div
                  key={q.symbol}
                  className="rounded-xl p-2.5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="text-[10px] font-semibold text-[#F3EDE3]/50 mb-0.5">
                    {isVix ? "VIX" : q.symbol}
                  </div>
                  <div className="text-sm font-bold text-[#F3EDE3]">${q.price.toFixed(2)}</div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {isUp
                      ? <ArrowUpRight className="w-3 h-3 text-[#49B06E]" />
                      : <ArrowDownRight className="w-3 h-3 text-[#EF4444]" />
                    }
                    <span className="text-[10px] font-semibold" style={{ color: isUp ? "#49B06E" : "#EF4444" }}>
                      {isUp ? "+" : ""}{q.changesPercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-4 rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs text-[#F3EDE3]/40">Index data unavailable — check back when markets are active</p>
            </div>
          )}
        </div>

        {/* PANSY'S MORNING NOTE */}
        {briefing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl mb-5 overflow-hidden"
            style={{ background: "linear-gradient(145deg, rgba(139,92,246,0.06), rgba(7,8,12,1))", border: "1px solid rgba(139,92,246,0.15)" }}
          >
            <button
              type="button"
              onClick={() => { haptic(); setBriefingOpen(!briefingOpen); }}
              className="w-full flex items-center gap-3 p-4"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(139,92,246,0.12)" }}
              >
                <Flower2 className="w-4.5 h-4.5 text-[#A855F7]" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-bold text-[#A855F7] mb-0.5">Pansy&apos;s Morning Note</p>
                {!briefingOpen && (
                  <p className="text-[11px] text-[#F3EDE3]/40 line-clamp-1">{briefing.split("\n")[0]}</p>
                )}
              </div>
              <ChevronDown
                className="w-4 h-4 text-[#F3EDE3]/30 shrink-0 transition-transform duration-300"
                style={{ transform: briefingOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {briefingOpen && (
              <div className="px-4 pb-4">
                <div className="text-xs text-[#F3EDE3]/60 leading-relaxed whitespace-pre-line">
                  {briefing}
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(139,92,246,0.1)" }}>
                  <p className="text-[10px] text-[#F3EDE3]/25 italic">
                    Educational context only — not financial advice.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* DAILY CHALLENGE */}
        {challenge && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 mb-5"
            style={{
              background: challengeCompleted
                ? "linear-gradient(145deg, rgba(73,176,110,0.06), rgba(7,8,12,1))"
                : "linear-gradient(145deg, rgba(245,158,11,0.06), rgba(7,8,12,1))",
              border: `1px solid ${challengeCompleted ? "rgba(73,176,110,0.15)" : "rgba(245,158,11,0.15)"}`,
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: challengeCompleted ? "rgba(73,176,110,0.12)" : "rgba(245,158,11,0.12)" }}
              >
                {challengeCompleted
                  ? <CheckCircle2 className="w-4.5 h-4.5 text-[#49B06E]" />
                  : <Swords className="w-4.5 h-4.5 text-[#F59E0B]" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold" style={{ color: challengeCompleted ? "#49B06E" : "#F59E0B" }}>
                    Daily Challenge
                  </p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(39,183,200,0.1)", color: "#27B7C8" }}>
                    +{challenge.rewardXp} XP
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#F3EDE3] mt-0.5">{challenge.title}</p>
              </div>
            </div>
            <p className="text-[11px] text-[#F3EDE3]/45 leading-relaxed mb-3">{challenge.description}</p>
            {challengeCompleted ? (
              <div className="flex items-center gap-2 py-2">
                <CheckCircle2 className="w-4 h-4 text-[#49B06E]" />
                <span className="text-xs font-semibold text-[#49B06E]">Completed — +{challenge.rewardXp} XP earned!</span>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={challengeLoading}
                onClick={async () => {
                  haptic(15);
                  setChallengeLoading(true);
                  try {
                    const res = await fetch("/api/daily-challenge", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ challengeId: challenge.id }),
                    });
                    if (res.ok) setChallengeCompleted(true);
                  } catch {} finally {
                    setChallengeLoading(false);
                  }
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}
              >
                {challengeLoading ? "Completing..." : "Mark Complete"}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* YOUR RADAR summary */}
        <div
          className="rounded-2xl p-4 mb-5"
          style={{ background: "linear-gradient(145deg, rgba(39,183,200,0.06), rgba(7,8,12,1))", border: "1px solid rgba(39,183,200,0.15)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radar className="w-4 h-4 text-[#27B7C8]" />
              <h2 className="text-sm font-bold text-[#F3EDE3]">Your Radar</h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.85, rotate: 180 }}
              onClick={() => { haptic(); loadSetups(); }}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(39,183,200,0.1)" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#27B7C8] ${setupsLoading ? "animate-spin" : ""}`} />
            </motion.button>
          </div>

          {setupsLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-white/5 animate-pulse" />
              <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
            </div>
          ) : setupCount > 0 ? (
            <>
              <p className="text-lg font-bold text-[#27B7C8] mb-2">
                {setupCount} setup{setupCount !== 1 ? "s" : ""} match your strategies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(byStrategy).map(([name, count]) => (
                  <span
                    key={name}
                    className="text-[10px] px-2 py-1 rounded-lg font-medium"
                    style={{ background: "rgba(39,183,200,0.1)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.2)" }}
                  >
                    {name}: {count}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27B7C8] opacity-40" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#27B7C8]" />
              </div>
              <div>
                <p className="text-sm text-[#F3EDE3]/60 mb-0.5">Market is quiet — scanner is running</p>
                <p className="text-xs text-[#F3EDE3]/30">Setups appear when stocks gap up and meet your rules.</p>
              </div>
            </div>
          )}

          <Link
            href="/scanner"
            className="flex items-center justify-center gap-2 mt-3 text-xs font-semibold py-2 rounded-xl"
            style={{ background: "rgba(39,183,200,0.12)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.2)" }}
          >
            Open Scanner <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* TOP SETUPS */}
        {topSetups.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#49B06E]" />
              <h2 className="text-sm font-bold text-[#F3EDE3]">Top Setups</h2>
            </div>
            <div className="space-y-2">
              {topSetups.map((s, i) => {
                const sl = stateLabel(s.state);
                return (
                  <motion.div
                    key={s.symbol}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => { haptic(); router.push(`/scanner/${s.symbol}`); }}
                    className="rounded-xl p-3 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ background: "rgba(39,183,200,0.1)", color: "#27B7C8" }}
                      >
                        {s.score}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#F3EDE3]">{s.symbol}</span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: `${sl.color}20`, color: sl.color }}
                          >
                            {sl.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#F3EDE3]/40">{s.strategyName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold" style={{ color: s.change >= 0 ? "#49B06E" : "#EF4444" }}>
                        {s.change >= 0 ? "+" : ""}{s.change.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-[#F3EDE3]/30">${s.price.toFixed(2)}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* NEWS strip */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="text-sm font-bold text-[#F3EDE3]">Market News</h2>
            </div>
            <Link href="/news" className="text-[10px] font-semibold text-[#27B7C8]">See all →</Link>
          </div>
          {newsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl p-3 animate-pulse" style={{ background: "#121821" }}>
                  <div className="h-3.5 w-3/4 rounded bg-white/5 mb-1.5" />
                  <div className="h-2.5 w-1/2 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="space-y-1.5">
              {news.map(a => (
                <Link
                  key={a.id}
                  href="/news"
                  className="block rounded-xl p-3 transition-all"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <p className="text-xs font-medium text-[#F3EDE3] line-clamp-1 leading-snug">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-[#F3EDE3]/30">
                    <span>{a.source}</span>
                    <span>&middot;</span>
                    <span>{timeAgo(a.publishedAt)}</span>
                    {a.symbols.length > 0 && (
                      <>
                        <span>&middot;</span>
                        <span className="text-[#27B7C8]">${a.symbols[0]}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs text-[#F3EDE3]/40">No news available right now.</p>
            </div>
          )}
        </div>

        {/* ALERTS strip */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-[#27B7C8]" />
            <h2 className="text-sm font-bold text-[#F3EDE3]">Alerts</h2>
          </div>
          {alertsLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="rounded-xl p-3 animate-pulse" style={{ background: "#121821" }}>
                  <div className="h-3.5 w-3/4 rounded bg-white/5 mb-1.5" />
                  <div className="h-2.5 w-1/2 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-1.5">
              {alerts.map(a => {
                const stColor = a.signal_state === "ACTIVE" ? "#49B06E" : "#F59E0B";
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { haptic(); router.push(`/scanner/${a.symbol}`); }}
                    className="rounded-xl p-3 cursor-pointer active:scale-[0.98] transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${stColor}15` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#F3EDE3]">{a.symbol}</span>
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${stColor}15`, color: stColor }}
                        >
                          {a.signal_state.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: (a.change_pct ?? 0) >= 0 ? "#49B06E" : "#EF4444" }}>
                        {(a.change_pct ?? 0) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {(a.change_pct ?? 0) >= 0 ? "+" : ""}{(a.change_pct ?? 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#F3EDE3]/35">
                      <span className="capitalize">{a.strategy.replace(/-/g, " ")}</span>
                      {a.entry_zone && <span>Entry {a.entry_zone}</span>}
                      <span className="ml-auto">{timeAgo(a.created_at)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <Bell className="w-5 h-5 mx-auto mb-2 text-[#F3EDE3]/20" />
              <p className="text-xs text-[#F3EDE3]/40 mb-1">No alerts yet</p>
              <p className="text-[10px] text-[#F3EDE3]/25">
                {session.label === "Closed" || session.label === "After Hours"
                  ? "Alerts activate during market hours when setups match your rules."
                  : "Scanner alerts fire when setups match your rules."
                }
              </p>
            </div>
          )}
        </div>

        {/* SECTOR HEATMAP */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-[#27B7C8]" />
            <h2 className="text-sm font-bold text-[#F3EDE3]">Sector Heatmap</h2>
            <span className="text-[9px] text-[#F3EDE3]/30 ml-auto">Tap to explore</span>
          </div>
          {sectorsLoading ? (
            <div className="rounded-xl overflow-hidden" style={{ background: "#0D1117" }}>
              <div className="grid grid-cols-3 gap-[2px] p-[2px]">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse" style={{ background: "#121821", borderRadius: 4 }} />
                ))}
              </div>
            </div>
          ) : sectors.length > 0 ? (
            <>
              {(() => {
                const SECTOR_META: Record<string, { name: string; icon: string }> = {
                  XLK: { name: "Tech", icon: "💻" },
                  XLF: { name: "Finance", icon: "🏦" },
                  XLE: { name: "Energy", icon: "⚡" },
                  XLV: { name: "Health", icon: "🏥" },
                  XLC: { name: "Comms", icon: "📡" },
                  XLI: { name: "Industry", icon: "🏭" },
                  XLY: { name: "Discret.", icon: "🛍️" },
                  XLP: { name: "Staples", icon: "🛒" },
                  XLB: { name: "Materials", icon: "⛏️" },
                  XLRE: { name: "Real Est.", icon: "🏠" },
                  XLU: { name: "Utilities", icon: "💡" },
                };
                const sorted = [...sectors].sort((a, b) => b.changesPercentage - a.changesPercentage);
                const maxAbs = Math.max(...sorted.map(s => Math.abs(s.changesPercentage)), 0.5);

                const renderTile = (s: IndexQuote, i: number, isHero: boolean) => {
                  const pct = s.changesPercentage;
                  const isUp = pct >= 0;
                  const intensity = Math.min(Math.abs(pct) / maxAbs, 1);
                  const isActive = activeSector === s.symbol;
                  const bg = isActive
                    ? isUp ? "rgba(73,176,110,0.50)" : "rgba(239,68,68,0.50)"
                    : isUp
                      ? `rgba(73,176,110,${isHero ? 0.12 + intensity * 0.30 : 0.08 + intensity * 0.22})`
                      : `rgba(239,68,68,${isHero ? 0.12 + intensity * 0.30 : 0.08 + intensity * 0.22})`;
                  const textColor = isUp ? "#49B06E" : "#EF4444";
                  const meta = SECTOR_META[s.symbol] || { name: s.symbol, icon: "📊" };

                  return (
                    <motion.div
                      key={s.symbol}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openSector(s.symbol)}
                      className={`relative flex flex-col items-center justify-center cursor-pointer transition-all ${isHero ? "py-4 px-2" : "py-2.5 px-1"}`}
                      style={{
                        background: bg,
                        borderRadius: 4,
                        minHeight: isHero ? 80 : 56,
                        outline: isActive ? `2px solid ${textColor}` : "none",
                        outlineOffset: -2,
                      }}
                    >
                      {isHero && <span className="text-base mb-1">{meta.icon}</span>}
                      <p className={`font-bold text-[#F3EDE3]/${isActive ? "90" : isHero ? "80" : "60"} mb-0.5 ${isHero ? "text-[10px]" : "text-[9px]"}`}>
                        {meta.name}
                      </p>
                      <p className={`font-black tracking-tight ${isHero ? "text-sm" : "text-[11px]"}`} style={{ color: textColor }}>
                        {isUp ? "+" : ""}{pct.toFixed(2)}%
                      </p>
                      {isHero && i === 0 && (
                        <div className="absolute top-1.5 right-1.5 text-[7px] font-bold px-1 py-0.5 rounded"
                          style={{ background: isUp ? "rgba(73,176,110,0.25)" : "rgba(239,68,68,0.25)", color: textColor }}>
                          {isUp ? "LEADING" : "TOP"}
                        </div>
                      )}
                    </motion.div>
                  );
                };

                return (
                  <div className="rounded-xl overflow-hidden" style={{ background: "#0D1117" }}>
                    <div className="flex flex-col gap-[2px] p-[2px]">
                      <div className="grid grid-cols-3 gap-[2px]">
                        {sorted.slice(0, 3).map((s, i) => renderTile(s, i, true))}
                      </div>
                      <div className="grid grid-cols-4 gap-[2px]">
                        {sorted.slice(3).map((s, i) => renderTile(s, i + 3, false))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Sector detail drawer */}
              <AnimatePresence>
                {activeSector && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {(() => {
                              const meta: Record<string, string> = { XLK: "💻", XLF: "🏦", XLE: "⚡", XLV: "🏥", XLC: "📡", XLI: "🏭", XLY: "🛍️", XLP: "🛒", XLB: "⛏️", XLRE: "🏠", XLU: "💡" };
                              return meta[activeSector] || "📊";
                            })()}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#F3EDE3]">
                              {(() => {
                                const names: Record<string, string> = { XLK: "Technology", XLF: "Financial Services", XLE: "Energy", XLV: "Healthcare", XLC: "Communication Services", XLI: "Industrials", XLY: "Consumer Discretionary", XLP: "Consumer Staples", XLB: "Basic Materials", XLRE: "Real Estate", XLU: "Utilities" };
                                return names[activeSector] || activeSector;
                              })()}
                            </p>
                            {(() => {
                              const s = sectors.find(s => s.symbol === activeSector);
                              if (!s) return null;
                              const isUp = s.changesPercentage >= 0;
                              return (
                                <p className="text-[10px] font-bold" style={{ color: isUp ? "#49B06E" : "#EF4444" }}>
                                  ${s.price.toFixed(2)} · {isUp ? "+" : ""}{s.changesPercentage.toFixed(2)}%
                                </p>
                              );
                            })()}
                          </div>
                        </div>
                        <button onClick={() => { haptic(); setActiveSector(null); }} className="p-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <X className="w-3.5 h-3.5 text-[#F3EDE3]/40" />
                        </button>
                      </div>

                      {sectorStocksLoading ? (
                        <div className="flex items-center justify-center py-6 gap-2">
                          <Loader2 className="w-4 h-4 text-[#27B7C8] animate-spin" />
                          <span className="text-[10px] text-[#F3EDE3]/40">Loading stocks...</span>
                        </div>
                      ) : sectorStocks.length > 0 ? (
                        <div className="space-y-1.5">
                          <p className="text-[8px] text-[#F3EDE3]/30 uppercase tracking-wider mb-1">Top stocks by market cap</p>
                          {sectorStocks.map(stock => {
                            const isUp = stock.change >= 0;
                            return (
                              <div
                                key={stock.symbol}
                                onClick={() => { haptic(); router.push(`/scanner/${stock.symbol}`); }}
                                className="flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer active:scale-[0.98] transition-all"
                                style={{ background: isUp ? "rgba(73,176,110,0.06)" : "rgba(239,68,68,0.06)" }}
                              >
                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: isUp ? "rgba(73,176,110,0.15)" : "rgba(239,68,68,0.15)" }}>
                                  {isUp ? <TrendingUp className="w-3 h-3 text-[#49B06E]" /> : <TrendingDown className="w-3 h-3 text-[#EF4444]" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold text-[#F3EDE3]">{stock.symbol}</p>
                                  <p className="text-[9px] text-[#F3EDE3]/40 truncate">{stock.name}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-[11px] font-bold text-[#F3EDE3]">${stock.price.toFixed(2)}</p>
                                  <p className="text-[9px] font-bold" style={{ color: isUp ? "#49B06E" : "#EF4444" }}>
                                    {isUp ? "+" : ""}{stock.change.toFixed(2)}%
                                  </p>
                                </div>
                                <ChevronRight className="w-3 h-3 text-[#F3EDE3]/20 flex-shrink-0" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[10px] text-[#F3EDE3]/30 text-center py-4">No stock data available</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs text-[#F3EDE3]/40">Sector data unavailable</p>
            </div>
          )}
        </div>

        {/* INVITE FRIENDS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => {
            haptic();
            const url = "https://shebloomswealth.app";
            const text = "Check out Radar — AI stock screener & trade alerts. Free to start.";
            if (navigator.share) {
              navigator.share({ title: "Radar", text, url }).catch(() => {});
            } else {
              navigator.clipboard.writeText(url).catch(() => {});
            }
          }}
          className="rounded-xl p-3.5 mb-5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
          style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.06), rgba(39,183,200,0.04))", border: "1px solid rgba(73,176,110,0.12)" }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(73,176,110,0.12)" }}>
            <Gift className="w-4 h-4 text-[#49B06E]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#F3EDE3]">Invite friends, get 7 free days</p>
            <p className="text-[10px] text-[#F3EDE3]/35">You both earn a week of Pro</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#49B06E]/50 shrink-0" />
        </motion.div>

        {/* Disclaimer */}
        <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[10px] text-[#F3EDE3]/30 leading-relaxed">
            <strong className="text-[#F3EDE3]/40">Educational decision support only.</strong>{" "}
            Alerts are price/level/screen-match notifications, not trade recommendations.
            Market data may be delayed. Day trading involves significant risk of loss.
          </p>
        </div>
      </div>
    </Layout>
  );
}
