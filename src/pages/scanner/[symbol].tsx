import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import DynamicChart from "@/components/DynamicChart";
import type { OHLCBar } from "@/components/CandlestickChart";
import { fetchOHLC } from "@/lib/fetchOHLC";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, TrendingUp, AlertTriangle, Shield, Target,
  Newspaper, CheckCircle, XCircle, Info,
  ChevronDown, ChevronUp, BarChart3,
} from "lucide-react";
import type { SignalResult } from "@/lib/strategies";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface Quote {
  symbol: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  volume: number;
  avgVolume: number;
  previousClose: number;
  open: number;
  marketCap: number;
}

interface NewsItem {
  title: string;
  text?: string;
  publishedDate?: string;
  site?: string;
  url?: string;
  image?: string;
  symbol?: string;
}

const TIMEFRAMES = [
  { key: "5min", label: "5m" },
  { key: "15min", label: "15m" },
  { key: "1hour", label: "1H" },
  { key: "daily", label: "1D" },
] as const;

function formatNum(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function formatVol(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
  return String(v);
}

function CriteriaCheck({ label, pass, detail }: { label: string; pass: boolean | null; detail: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {pass === null ? (
        <Info className="w-4 h-4 text-[#F3EDE3]/30 flex-shrink-0 mt-0.5" />
      ) : pass ? (
        <CheckCircle className="w-4 h-4 text-[#49B06E] flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
      )}
      <div>
        <div className="text-xs font-medium text-[#F3EDE3]/80">{label}</div>
        <div className="text-[10px] text-[#F3EDE3]/40">{detail}</div>
      </div>
    </div>
  );
}

export default function SymbolDetail() {
  const router = useRouter();
  const { symbol } = router.query;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCriteria, setShowCriteria] = useState(false);
  const [ohlcData, setOhlcData] = useState<OHLCBar[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<string>("5min");
  const [signal, setSignal] = useState<SignalResult | null>(null);

  const sym = (typeof symbol === "string" ? symbol : "").toUpperCase();

  useEffect(() => {
    if (!sym) return;
    (async () => {
      setLoading(true);
      try {
        const [quoteRes, newsRes, scanRes] = await Promise.all([
          fetch(`/api/stock-data?tickers=${sym}`),
          fetch(`/api/stock-news?ticker=${sym}`),
          fetch("/api/scanner/scan"),
        ]);

        if (quoteRes.ok) {
          const data = await quoteRes.json();
          if (Array.isArray(data) && data.length > 0) setQuote(data[0]);
        }
        if (newsRes.ok) {
          const data = await newsRes.json();
          if (Array.isArray(data)) setNews(data.slice(0, 5));
        }
        if (scanRes.ok) {
          const data = await scanRes.json();
          const match = (data.candidates || []).find(
            (c: { symbol: string; signals?: SignalResult[] }) => c.symbol === sym
          );
          if (match?.signals?.length > 0) {
            setSignal(match.signals[0]);
          }
        }
      } catch (err) {
        console.error("Symbol detail error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [sym]);

  const loadChart = useCallback(async () => {
    if (!sym) return;
    setChartLoading(true);
    try {
      const bars = await fetchOHLC(sym, timeframe);
      setOhlcData(bars);
    } catch {} finally {
      setChartLoading(false);
    }
  }, [sym, timeframe]);

  useEffect(() => { loadChart(); }, [loadChart]);

  const rvol = quote && quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const changePct = quote?.changesPercentage ?? 0;
  const isGainer = changePct > 0;

  const pricePass = quote ? quote.price >= 2 && quote.price <= 20 : null;
  const pricePreferred = quote ? quote.price >= 2 && quote.price <= 10 : null;
  const changePass = changePct >= 10;
  const rvolPass = rvol >= 5;
  const volumePass = quote ? quote.volume >= 1_000_000 : null;
  const hasCatalyst = news.length > 0;

  // Use signal entry/stop/target if available, otherwise compute from price
  const entry = signal?.entryZone ? parseFloat(signal.entryZone.replace("$", "")) : (quote ? Math.round(quote.price * 100) / 100 : 0);
  const stopPct = 0.05;
  const stop = signal?.invalidationLevel ? parseFloat(signal.invalidationLevel.replace("$", "")) : Math.round(entry * (1 - stopPct) * 100) / 100;
  const risk = Math.round((entry - stop) * 100) / 100;
  const target1 = signal?.target1 ? parseFloat(signal.target1.replace("$", "")) : Math.round((entry + risk * 2) * 100) / 100;
  const target2 = signal?.target2 ? parseFloat(signal.target2.replace("$", "")) : Math.round((entry + risk * 3) * 100) / 100;
  const rr = risk > 0 ? Math.round(((target1 - entry) / risk) * 10) / 10 : 0;

  const priceLines = entry > 0 ? { entry, stop, target: target1, target2 } : undefined;

  return (
    <Layout>
      <SEO title={`${sym} Signal | Bloom`} description={`Trading analysis for ${sym}`} />

      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[#27B7C8] text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Signals
        </button>

        {loading && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5 animate-pulse" style={{ background: "#121821" }}>
              <div className="h-8 w-24 rounded bg-white/5 mb-3" />
              <div className="h-6 w-32 rounded bg-white/5" />
            </div>
            <div className="rounded-2xl h-[320px] animate-pulse" style={{ background: "#121821" }} />
          </div>
        )}

        {!loading && quote && (
          <>
            {/* Symbol header */}
            <div
              className="rounded-2xl p-5 mb-3"
              style={{ background: "linear-gradient(145deg, #07080C, #121821)", border: "1px solid rgba(39,183,200,0.15)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-[#F3EDE3]">{sym}</h1>
                    {signal && (
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: signal.state === "ACTIVE" ? "rgba(73,176,110,0.15)" : signal.state === "NEAR_TRIGGER" ? "rgba(245,158,11,0.15)" : "rgba(39,183,200,0.15)",
                          color: signal.state === "ACTIVE" ? "#49B06E" : signal.state === "NEAR_TRIGGER" ? "#F59E0B" : "#27B7C8",
                        }}
                      >
                        {signal.state.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  {signal && (
                    <span className="text-[10px] text-[#27B7C8]/70 font-medium">{signal.strategyName}</span>
                  )}
                  {!signal && <span className="text-xs text-[#F3EDE3]/40">Market data · Delayed</span>}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F3EDE3]">${quote.price.toFixed(2)}</div>
                  <div
                    className="text-sm font-semibold flex items-center gap-1 justify-end"
                    style={{ color: isGainer ? "#49B06E" : "#EF4444" }}
                  >
                    {isGainer ? <TrendingUp className="w-3.5 h-3.5" /> : null}
                    {isGainer ? "+" : ""}{changePct.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Metrics strip */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
                <div className="text-center">
                  <div className="text-[9px] text-[#F3EDE3]/30 mb-0.5">RVOL</div>
                  <div className="text-xs font-bold" style={{ color: rvolPass ? "#49B06E" : "#F59E0B" }}>{rvol.toFixed(1)}x</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-[#F3EDE3]/30 mb-0.5">Volume</div>
                  <div className="text-xs font-bold text-[#F3EDE3]">{formatVol(quote.volume)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-[#F3EDE3]/30 mb-0.5">Range</div>
                  <div className="text-xs font-bold text-[#F3EDE3]">${quote.dayLow.toFixed(2)}-{quote.dayHigh.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-[#F3EDE3]/30 mb-0.5">Mkt Cap</div>
                  <div className="text-xs font-bold text-[#F3EDE3]">{formatNum(quote.marketCap)}</div>
                </div>
              </div>
            </div>

            {/* CHART — THE MAIN EVENT */}
            <div
              className="rounded-2xl overflow-hidden mb-3"
              style={{ background: "#07080C", border: "1px solid rgba(39,183,200,0.12)" }}
            >
              {/* Timeframe selector */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#F3EDE3]/30">
                  <BarChart3 className="w-3.5 h-3.5 text-[#27B7C8]" />
                  <span className="font-semibold uppercase tracking-wider">Chart</span>
                </div>
                <div className="flex gap-1">
                  {TIMEFRAMES.map(tf => {
                    const active = timeframe === tf.key;
                    return (
                      <motion.button
                        key={tf.key}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { haptic(); setTimeframe(tf.key); }}
                        className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all"
                        style={{
                          background: active ? "rgba(39,183,200,0.2)" : "transparent",
                          color: active ? "#27B7C8" : "rgba(243,237,227,0.3)",
                          border: active ? "1px solid rgba(39,183,200,0.3)" : "1px solid transparent",
                        }}
                      >
                        {tf.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Chart body */}
              {chartLoading && ohlcData.length === 0 ? (
                <div className="h-[320px] flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#27B7C8] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : ohlcData.length > 0 ? (
                <DynamicChart data={ohlcData} priceLines={priceLines} height={320} />
              ) : (
                <div className="h-[200px] flex items-center justify-center text-xs text-[#F3EDE3]/30">
                  Chart data unavailable
                </div>
              )}
            </div>

            {/* Entry / Stop / Target summary */}
            <div
              className="rounded-2xl p-4 mb-3"
              style={{ background: "linear-gradient(145deg, #07080C, #121821)", border: "1px solid rgba(39,183,200,0.1)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-sm font-bold text-[#F3EDE3]">
                  {signal ? "Signal Levels" : "Hypothetical Trade Plan"}
                </h2>
                {signal?.rr && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(39,183,200,0.1)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.2)" }}>
                    R:R {signal.rr}
                  </span>
                )}
                {!signal && rr > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(39,183,200,0.1)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.2)" }}>
                    R:R {rr}:1
                  </span>
                )}
              </div>

              {/* Entry / Stop / Target grid */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-xl p-3 text-center" style={{ background: "rgba(73,176,110,0.06)", border: "1px solid rgba(73,176,110,0.12)" }}>
                  <div className="text-[9px] text-[#49B06E]/60 font-bold uppercase tracking-wider mb-0.5">Entry</div>
                  <div className="text-sm font-bold text-[#49B06E]">${entry.toFixed(2)}</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
                  <div className="text-[9px] text-[#EF4444]/60 font-bold uppercase tracking-wider mb-0.5">Stop</div>
                  <div className="text-sm font-bold text-[#EF4444]">${stop.toFixed(2)}</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: "rgba(39,183,200,0.06)", border: "1px solid rgba(39,183,200,0.12)" }}>
                  <div className="text-[9px] text-[#27B7C8]/60 font-bold uppercase tracking-wider mb-0.5">Target 1</div>
                  <div className="text-sm font-bold text-[#27B7C8]">${target1.toFixed(2)}</div>
                </div>
              </div>

              {/* Extra metrics row */}
              <div className="grid grid-cols-4 gap-2 text-center mb-3">
                <div>
                  <div className="text-[9px] text-[#F3EDE3]/25">Risk/Share</div>
                  <div className="text-[11px] font-semibold text-[#EF4444]">${risk.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#F3EDE3]/25">Reward</div>
                  <div className="text-[11px] font-semibold text-[#49B06E]">${(target1 - entry).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#F3EDE3]/25">R:R</div>
                  <div className="text-[11px] font-semibold" style={{ color: rr >= 2 ? "#49B06E" : "#F59E0B" }}>{rr}:1</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#F3EDE3]/25">Target 2</div>
                  <div className="text-[11px] font-semibold text-[#A855F7]">${target2.toFixed(2)}</div>
                </div>
              </div>

              {/* Paper trade button */}
              <Link href={`/paper-trader-v2?symbol=${sym}&entry=${entry}&stop=${stop}&target=${target1}`}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => haptic()}
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #D4AF37)", color: "#07080C" }}
                >
                  Paper Trade This Setup
                </motion.button>
              </Link>

              <p className="text-[9px] text-[#F3EDE3]/20 text-center mt-2 leading-relaxed">
                {signal ? "Signal levels from strategy engine. Not a trade recommendation." : "Hypothetical levels. Entry at current price with 5% stop."}
              </p>
            </div>

            {/* Strategy criteria checklist — collapsible */}
            <div
              className="rounded-2xl overflow-hidden mb-3"
              style={{ background: "linear-gradient(145deg, #07080C, #121821)", border: "1px solid rgba(39,183,200,0.1)" }}
            >
              <button
                onClick={() => { haptic(); setShowCriteria(!showCriteria); }}
                className="w-full flex items-center justify-between p-4"
              >
                <h2 className="text-sm font-bold text-[#F3EDE3] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#27B7C8]" />
                  {signal ? `${signal.strategyName} Criteria` : "Gap-and-Go Criteria"}
                </h2>
                {showCriteria ? <ChevronUp className="w-4 h-4 text-[#F3EDE3]/40" /> : <ChevronDown className="w-4 h-4 text-[#F3EDE3]/40" />}
              </button>

              <AnimatePresence>
                {showCriteria && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-0.5">
                      {signal ? (
                        <>
                          {signal.conditionsPassed.map((c, i) => (
                            <CriteriaCheck key={`p-${i}`} label={c} pass={true} detail="Condition met" />
                          ))}
                          {signal.conditionsFailed.map((c, i) => (
                            <CriteriaCheck key={`f-${i}`} label={c} pass={false} detail="Condition not met" />
                          ))}
                          {signal.conditionsMissing.map((c, i) => (
                            <CriteriaCheck key={`m-${i}`} label={c} pass={null} detail="Needs intraday data" />
                          ))}
                        </>
                      ) : (
                        <>
                          <CriteriaCheck
                            label="Price Range"
                            pass={pricePass}
                            detail={pricePass
                              ? (pricePreferred ? `$${quote.price.toFixed(2)} — in preferred $2-$10 range` : `$${quote.price.toFixed(2)} — in allowed $2-$20 range`)
                              : `$${quote.price.toFixed(2)} — outside $2-$20 range`
                            }
                          />
                          <CriteriaCheck
                            label="Daily Momentum (+10% min)"
                            pass={changePass}
                            detail={`+${changePct.toFixed(1)}% from previous close`}
                          />
                          <CriteriaCheck
                            label="Relative Volume (5x min)"
                            pass={rvolPass}
                            detail={`${rvol.toFixed(1)}x average volume`}
                          />
                          <CriteriaCheck
                            label="Absolute Volume (1M+ preferred)"
                            pass={volumePass}
                            detail={`${formatVol(quote.volume)} shares traded`}
                          />
                          <CriteriaCheck
                            label="Catalyst"
                            pass={hasCatalyst ? true : null}
                            detail={hasCatalyst ? `${news.length} recent headline(s)` : "No recent headlines found"}
                          />
                        </>
                      )}

                      {signal?.reason && (
                        <div className="rounded-lg p-2.5 mt-2 flex items-start gap-2" style={{ background: "rgba(39,183,200,0.05)", border: "1px solid rgba(39,183,200,0.1)" }}>
                          <Info className="w-3.5 h-3.5 text-[#27B7C8] flex-shrink-0 mt-0.5" />
                          <p className="text-[11px] text-[#F3EDE3]/50 leading-relaxed">{signal.reason}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* News / catalyst */}
            {news.length > 0 && (
              <div
                className="rounded-2xl p-4 mb-3"
                style={{ background: "linear-gradient(145deg, #07080C, #121821)", border: "1px solid rgba(39,183,200,0.1)" }}
              >
                <h2 className="text-sm font-bold text-[#F3EDE3] mb-3 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-[#27B7C8]" />
                  Catalyst / News
                </h2>
                <div className="space-y-2">
                  {news.map((n, i) => (
                    <a
                      key={i}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl p-3 transition-all hover:bg-white/5"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <p className="text-xs text-[#F3EDE3] leading-snug line-clamp-2 mb-1">{n.title}</p>
                      <div className="flex items-center gap-2 text-[9px] text-[#F3EDE3]/30">
                        <span>{n.site}</span>
                        {n.publishedDate && (
                          <>
                            <span>&middot;</span>
                            <span>{new Date(n.publishedDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[9px] text-[#F3EDE3]/25 leading-relaxed">
                <strong className="text-[#F3EDE3]/35">HYPOTHETICAL / EDUCATIONAL ONLY.</strong>{" "}
                Chart lines show computed levels, not trade recommendations. Market data may be delayed.
                Day trading involves significant risk of rapid losses. Verify all data independently.
              </p>
            </div>
          </>
        )}

        {!loading && !quote && (
          <div className="text-center py-16">
            <AlertTriangle className="w-8 h-8 text-[#F3EDE3]/20 mx-auto mb-3" />
            <p className="text-sm text-[#F3EDE3]/40">Could not load data for {sym}.</p>
            <p className="text-xs text-[#F3EDE3]/25 mt-1">The symbol may be invalid or data is temporarily unavailable.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
