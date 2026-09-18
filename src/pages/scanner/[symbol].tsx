import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import {
  ArrowLeft, TrendingUp, AlertTriangle, Shield, Target,
  Newspaper, CheckCircle, XCircle, Info,
  ChevronDown, ChevronUp,
} from "lucide-react";

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

function Metric({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-[#F4F7FA]/40 mb-0.5">{label}</div>
      <div className="text-sm font-bold" style={{ color: color || "#F4F7FA" }}>{value}</div>
      {sub && <div className="text-[9px] text-[#F4F7FA]/30">{sub}</div>}
    </div>
  );
}

function CriteriaCheck({ label, pass, detail }: { label: string; pass: boolean | null; detail: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {pass === null ? (
        <Info className="w-4 h-4 text-[#F4F7FA]/30 flex-shrink-0 mt-0.5" />
      ) : pass ? (
        <CheckCircle className="w-4 h-4 text-[#49B06E] flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
      )}
      <div>
        <div className="text-xs font-medium text-[#F4F7FA]/80">{label}</div>
        <div className="text-[10px] text-[#F4F7FA]/40">{detail}</div>
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
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    if (!symbol || typeof symbol !== "string") return;
    const sym = symbol.toUpperCase();

    (async () => {
      setLoading(true);
      try {
        const [quoteRes, newsRes] = await Promise.all([
          fetch(`/api/stock-data?tickers=${sym}`),
          fetch(`/api/stock-news?ticker=${sym}`),
        ]);

        if (quoteRes.ok) {
          const data = await quoteRes.json();
          if (Array.isArray(data) && data.length > 0) setQuote(data[0]);
        }

        if (newsRes.ok) {
          const data = await newsRes.json();
          if (Array.isArray(data)) setNews(data.slice(0, 5));
        }
      } catch (err) {
        console.error("Symbol detail error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [symbol]);

  const sym = (typeof symbol === "string" ? symbol : "").toUpperCase();
  const rvol = quote && quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 0;
  const changePct = quote?.changesPercentage ?? 0;
  const isGainer = changePct > 0;

  // Criteria checks based on strategy
  const pricePass = quote ? quote.price >= 2 && quote.price <= 20 : null;
  const pricePreferred = quote ? quote.price >= 2 && quote.price <= 10 : null;
  const changePass = changePct >= 10;
  const rvolPass = rvol >= 5;
  const volumePass = quote ? quote.volume >= 1_000_000 : null;
  const hasCatalyst = news.length > 0;

  // Hypothetical trade plan
  const entry = quote ? Math.round(quote.price * 100) / 100 : 0;
  const stopPct = 0.05; // 5% below entry
  const stop = Math.round(entry * (1 - stopPct) * 100) / 100;
  const risk = Math.round((entry - stop) * 100) / 100;
  const target1 = Math.round((entry + risk * 2) * 100) / 100; // 2:1 R:R
  const target2 = Math.round((entry + risk * 3) * 100) / 100; // 3:1 R:R
  const rr = risk > 0 ? Math.round(((target1 - entry) / risk) * 10) / 10 : 0;

  return (
    <Layout>
      <SEO title={`${sym} Signal | Bloom`} description={`Gap-and-Go analysis for ${sym}`} />

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
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: "#162540" }}>
                <div className="h-6 w-24 rounded bg-white/5 mb-3" />
                <div className="h-4 w-full rounded bg-white/5" />
              </div>
            ))}
          </div>
        )}

        {!loading && quote && (
          <>
            {/* Symbol header */}
            <div
              className="rounded-2xl p-5 mb-4"
              style={{ background: "linear-gradient(145deg, #0E1B30, #162540)", border: "1px solid rgba(39,183,200,0.15)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#F4F7FA]">{sym}</h1>
                  <span className="text-xs text-[#F4F7FA]/40">Market data · Delayed</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#F4F7FA]">${quote.price.toFixed(2)}</div>
                  <div
                    className="text-sm font-semibold flex items-center gap-1 justify-end"
                    style={{ color: isGainer ? "#49B06E" : "#EF4444" }}
                  >
                    {isGainer ? <TrendingUp className="w-3.5 h-3.5" /> : null}
                    {isGainer ? "+" : ""}{changePct.toFixed(2)}% (${quote.change.toFixed(2)})
                  </div>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-4 gap-3 pt-3 border-t border-white/5">
                <Metric label="RVOL" value={`${rvol.toFixed(1)}x`} color={rvolPass ? "#49B06E" : "#F59E0B"} />
                <Metric label="Volume" value={formatVol(quote.volume)} sub={`Avg: ${formatVol(quote.avgVolume)}`} />
                <Metric label="Day Range" value={`$${quote.dayLow.toFixed(2)}-${quote.dayHigh.toFixed(2)}`} />
                <Metric label="Mkt Cap" value={formatNum(quote.marketCap)} />
              </div>
            </div>

            {/* Strategy criteria checklist */}
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background: "linear-gradient(145deg, #0E1B30, #162540)", border: "1px solid rgba(39,183,200,0.1)" }}
            >
              <h2 className="text-sm font-bold text-[#F4F7FA] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#27B7C8]" />
                Gap-and-Go Criteria
              </h2>

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
                detail={`+${changePct.toFixed(1)}% from previous close${changePct > 50 ? " — extreme move, halt/reversal risk" : ""}`}
              />
              <CriteriaCheck
                label="Relative Volume (5x min)"
                pass={rvolPass}
                detail={`${rvol.toFixed(1)}x average volume${rvol >= 10 ? " — strong" : ""}`}
              />
              <CriteriaCheck
                label="Absolute Volume (1M+ preferred)"
                pass={volumePass}
                detail={`${formatVol(quote.volume)} shares traded`}
              />
              <CriteriaCheck
                label="Catalyst"
                pass={hasCatalyst ? true : null}
                detail={hasCatalyst ? `${news.length} recent headline(s)` : "No recent headlines found — verify independently"}
              />
            </div>

            {/* Hypothetical trade plan */}
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background: "linear-gradient(145deg, #0E1B30, #162540)", border: "1px solid rgba(39,183,200,0.1)" }}
            >
              <button
                onClick={() => { haptic(); setShowPlan(!showPlan); }}
                className="w-full flex items-center justify-between"
              >
                <h2 className="text-sm font-bold text-[#F4F7FA] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#D4AF37]" />
                  Hypothetical Trade Plan
                </h2>
                {showPlan ? <ChevronUp className="w-4 h-4 text-[#F4F7FA]/40" /> : <ChevronDown className="w-4 h-4 text-[#F4F7FA]/40" />}
              </button>

              {showPlan && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 space-y-3"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl p-3 text-center" style={{ background: "rgba(39,183,200,0.08)", border: "1px solid rgba(39,183,200,0.15)" }}>
                      <div className="text-[10px] text-[#27B7C8]/60 mb-0.5">Entry</div>
                      <div className="text-sm font-bold text-[#27B7C8]">${entry.toFixed(2)}</div>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div className="text-[10px] text-[#EF4444]/60 mb-0.5">Stop</div>
                      <div className="text-sm font-bold text-[#EF4444]">${stop.toFixed(2)}</div>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: "rgba(73,176,110,0.08)", border: "1px solid rgba(73,176,110,0.15)" }}>
                      <div className="text-[10px] text-[#49B06E]/60 mb-0.5">Target 1</div>
                      <div className="text-sm font-bold text-[#49B06E]">${target1.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-[9px] text-[#F4F7FA]/30">Risk/Share</div>
                      <div className="text-xs font-semibold text-[#EF4444]">${risk.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#F4F7FA]/30">Reward</div>
                      <div className="text-xs font-semibold text-[#49B06E]">${(target1 - entry).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#F4F7FA]/30">R:R</div>
                      <div className="text-xs font-semibold" style={{ color: rr >= 2 ? "#49B06E" : "#F59E0B" }}>{rr}:1</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#F4F7FA]/30">Target 2</div>
                      <div className="text-xs font-semibold text-[#49B06E]">${target2.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Paper trade button */}
                  <Link href={`/paper-trader-v2?symbol=${sym}&entry=${entry}&stop=${stop}&target=${target1}`}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 rounded-xl font-bold text-sm mt-2"
                      style={{ background: "linear-gradient(135deg, #C9A84C, #D4AF37)", color: "#0E1B30" }}
                    >
                      Paper Trade This Setup
                    </motion.button>
                  </Link>

                  <p className="text-[9px] text-[#F4F7FA]/25 text-center leading-relaxed">
                    Hypothetical paper trade only. Entry at current price with 5% stop.
                    Verify all levels before any real decision.
                  </p>
                </motion.div>
              )}
            </div>

            {/* News / catalyst */}
            {news.length > 0 && (
              <div
                className="rounded-2xl p-4 mb-4"
                style={{ background: "linear-gradient(145deg, #0E1B30, #162540)", border: "1px solid rgba(39,183,200,0.1)" }}
              >
                <h2 className="text-sm font-bold text-[#F4F7FA] mb-3 flex items-center gap-2">
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
                      <p className="text-xs text-[#F4F7FA] leading-snug line-clamp-2 mb-1">{n.title}</p>
                      <div className="flex items-center gap-2 text-[9px] text-[#F4F7FA]/30">
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
              <p className="text-[9px] text-[#F4F7FA]/25 leading-relaxed">
                <strong className="text-[#F4F7FA]/35">Educational decision support only.</strong>{" "}
                This is a hypothetical paper-trade analysis, not investment advice. Market data may be delayed or incorrect.
                Day trading involves significant risk of rapid losses. Verify all data and make your own decision.
              </p>
            </div>
          </>
        )}

        {!loading && !quote && (
          <div className="text-center py-16">
            <AlertTriangle className="w-8 h-8 text-[#F4F7FA]/20 mx-auto mb-3" />
            <p className="text-sm text-[#F4F7FA]/40">Could not load data for {sym}.</p>
            <p className="text-xs text-[#F4F7FA]/25 mt-1">The symbol may be invalid or data is temporarily unavailable.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
