/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { motion } from "framer-motion";
import {
  Zap, ArrowUpRight, ArrowDownRight,
  RefreshCw, Bell, Newspaper, ChevronRight, Radar,
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

  useEffect(() => {
    loadIndices();
    loadSetups();
    loadNews();
  }, [loadIndices, loadSetups, loadNews]);

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
      <SEO title="Bloom Radar | Home" description="Your radar dashboard — setups, market status, and alerts at a glance." />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">

        {/* Greeting */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-[#F3EDE3]">{getGreeting(userName)}</h1>
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
            <div>
              <p className="text-sm text-[#F3EDE3]/60 mb-1">No setups currently meet your rules.</p>
              <p className="text-xs text-[#F3EDE3]/30">Next scan runs when the tape updates.</p>
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
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <Bell className="w-5 h-5 mx-auto mb-2 text-[#F3EDE3]/20" />
            <p className="text-xs text-[#F3EDE3]/40 mb-1">No alerts yet</p>
            <p className="text-[10px] text-[#F3EDE3]/25">Scanner alerts fire when setups match your rules.</p>
          </div>
        </div>

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
