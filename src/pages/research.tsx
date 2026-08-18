import { useState, useCallback, useRef, useEffect } from "react";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import {
  Search, TrendingUp, TrendingDown, Newspaper, Info,
  ChevronRight, AlertTriangle, Loader2, Lock, ArrowLeft,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { marketService } from "@/services/marketService";
import DynamicChart, { type OHLCBar } from "@/components/DynamicChart";
import { supabase } from "@/integrations/supabase/client";
import { fetchOHLC } from "@/lib/fetchOHLC";
import { canShowExternalPayment } from "@/lib/payments";

// ── Types ──────────────────────────────────────────────────────────────────
interface Quote {
  c: number;   // current price
  d: number;   // change
  dp: number;  // change %
  h: number;   // high
  l: number;   // low
  o: number;   // open
  v: number;   // volume
}

type Timeframe = "daily" | "1hour" | "15min" | "5min";
const TIMEFRAMES: { key: Timeframe; label: string }[] = [
  { key: "daily",  label: "Daily" },
  { key: "1hour",  label: "1H" },
  { key: "15min",  label: "15m" },
  { key: "5min",   label: "5m" },
];

interface NewsItem {
  headline: string;
  source: string;
  datetime: number;
  url: string;
}

interface PansyProfile {
  sector: string | null;
  shortDescription: string | null;
  marketCap: string | null;
  pe: string | null;
  fpe: string | null;
  high52: string | null;
  low52: string | null;
  perf1m: string | null;
  perfYTD: string | null;
  perf1y: string | null;
}

interface PansyPanel {
  bullCase: string[];
  bearCase: string[];
  watchList: string[];
  profile: PansyProfile;
}

// Popular tickers for quick access
const QUICK_PICKS = [
  { sym: "SPY", label: "S&P 500" },
  { sym: "QQQ", label: "NASDAQ" },
  { sym: "AAPL", label: "Apple" },
  { sym: "MSFT", label: "Microsoft" },
  { sym: "NVDA", label: "NVIDIA" },
  { sym: "TSLA", label: "Tesla" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
async function getToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

function pct(n: number | null | undefined) {
  if (n == null) return "—";
  return `${n >= 0 ? "+" : ""}${typeof n === "number" ? n.toFixed(2) : n}%`;
}

function formatVol(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

// ── Sub-components ─────────────────────────────────────────────────────────
function StatRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-accent/10 last:border-0">
      <span className="text-xs text-foreground/50">{label}</span>
      <span className="text-xs font-mono text-foreground">{value}</span>
    </div>
  );
}

function PansyCard({
  title, items, color, icon,
}: {
  title: string; items: string[]; color: string; icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs text-foreground/80 leading-relaxed">
            <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Pro Gate ───────────────────────────────────────────────────────────────
function ProGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
      <div className="rounded-full bg-accent/10 p-6 border border-accent/20">
        <Lock className="w-10 h-10 text-accent" />
      </div>
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Stock Research</h2>
        <p className="text-foreground/60 max-w-sm">
          {canShowExternalPayment
            ? "Search any stock, ETF, or index — live quotes, interactive charts, news, and Pansy's educational analysis. Upgrade to unlock."
            : "This feature isn't available in this version."}
        </p>
      </div>
      {canShowExternalPayment && (
        <Link
          href="/subscription"
          className="px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Upgrade to Pro
        </Link>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
interface SymbolResult { symbol: string; name: string; }

export default function ResearchPage() {
  const { isPro, isLoading: authLoading } = useSubscription();

  const [search, setSearch] = useState("");
  const [ticker, setTicker] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [ohlc, setOhlc] = useState<OHLCBar[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>("daily");
  const [ohlcLoading, setOhlcLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [panel, setPanel] = useState<PansyPanel | null>(null);
  const [loading, setLoading] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const [symResults, setSymResults] = useState<SymbolResult[]>([]);
  const [showSym, setShowSym] = useState(false);
  const [symLoading, setSymLoading] = useState(false);
  const symTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchSymbol = useCallback(async (q: string) => {
    if (q.length < 2) { setSymResults([]); return; }
    setSymLoading(true);
    try {
      const res = await fetch(`/api/proxy/symbol-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSymResults(data.results || []);
      setShowSym(true);
    } catch { setSymResults([]); }
    finally { setSymLoading(false); }
  }, []);

  const handleSearchChange = (val: string) => {
    const upper = val.toUpperCase();
    setSearch(upper);
    if (symTimer.current) clearTimeout(symTimer.current);
    if (val.length >= 2) {
      symTimer.current = setTimeout(() => searchSymbol(val), 300);
    } else {
      setSymResults([]);
      setShowSym(false);
    }
  };

  const pickSymbol = (r: SymbolResult) => {
    setSearch(r.symbol);
    setSymResults([]);
    setShowSym(false);
    loadStock(r.symbol);
  };

  const fetchOhlc = useCallback(async (sym: string, tf: Timeframe) => {
    if (!sym) return;
    setOhlcLoading(true);
    try {
      const bars = await fetchOHLC(sym, tf);
      setOhlc(bars);
    } catch {
      // non-fatal — placeholder shown
    } finally {
      setOhlcLoading(false);
    }
  }, []);

  // Re-fetch when timeframe changes (ticker is already loaded)
  useEffect(() => {
    if (ticker) fetchOhlc(ticker, timeframe);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const loadStock = useCallback(async (sym: string) => {
    const clean = sym.toUpperCase().trim();
    if (!clean) return;

    // Cancel any previous request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError("");
    setTicker(clean);
    setQuote(null);
    setOhlc([]);
    setNews([]);
    setPanel(null);

    try {
      // Quote + chart + news in parallel
      const today = new Date();
      const from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const toStr = today.toISOString().split("T")[0];
      const fromStr = from.toISOString().split("T")[0];

      const [q, newsRes] = await Promise.all([
        marketService.getRealTimeQuote(clean),
        fetch(`/api/proxy/finnhub-news?ticker=${clean}&from=${fromStr}&to=${toStr}`).then(r => r.json()),
      ]);

      if (!q) {
        setError(`No quote data found for "${clean}". Check the ticker symbol.`);
        setLoading(false);
        return;
      }

      setQuote(q);
      setNews(Array.isArray(newsRes) ? newsRes.slice(0, 6) : []);
      setLoading(false);
      fetchOhlc(clean, timeframe);

      // Load Pansy panel separately (slower — LLM call)
      setPanelLoading(true);
      const token = await getToken();
      const panelRes = await fetch("/api/research/pansy-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ticker: clean }),
      });
      const panelData = await panelRes.json();
      if (panelRes.ok) setPanel(panelData);
    } catch {
      setError("Failed to load stock data. Try again.");
    } finally {
      setLoading(false);
      setPanelLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = search.toUpperCase().trim();
    if (val) loadStock(val);
  };

  const isUp = (quote?.dp ?? 0) >= 0;
  const priceColor = isUp ? "text-primary" : "text-destructive";
  const showProGate = !authLoading && !isPro;

  return (
    <>
      <Head>
        <title>Bloom Research</title>
      </Head>
      <Layout>
        <div className="min-h-screen bg-background px-4 py-6 max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <Link href="/practice" className="text-foreground/40 hover:text-accent transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-serif text-2xl font-bold text-foreground">Stock Research</h1>
          </div>
          <p className="text-foreground/40 text-sm mb-6 pl-8">Educational only — not financial advice</p>

          {authLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          )}

          {showProGate && <ProGate />}

          {!authLoading && isPro && (
            <>
              {/* Search */}
              <form onSubmit={handleSubmit} className="relative mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                  <input
                    className="w-full bg-card border border-accent/20 rounded-xl pl-10 pr-16 py-3 text-foreground font-mono uppercase placeholder:text-foreground/20 placeholder:normal-case focus:outline-none focus:border-accent text-sm"
                    placeholder="Search company or ticker…"
                    value={search}
                    onChange={e => handleSearchChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSym(false), 200)}
                    onFocus={() => { if (symResults.length > 0) setShowSym(true); }}
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  {symLoading && (
                    <div className="absolute right-14 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  )}
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-accent text-background text-xs font-bold hover:bg-accent/90 transition-colors"
                  >
                    Go
                  </button>
                </div>
                {showSym && symResults.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-accent/20 rounded-xl overflow-hidden shadow-xl max-h-56 overflow-y-auto">
                    {symResults.map((r) => (
                      <button
                        key={r.symbol}
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => pickSymbol(r)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/10 transition-colors border-b border-accent/5 last:border-0"
                      >
                        <span className="font-mono font-bold text-sm text-accent w-16 shrink-0">{r.symbol}</span>
                        <span className="text-xs text-foreground/60 truncate">{r.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>

              {/* Quick picks */}
              <div className="flex gap-2 flex-wrap mb-6">
                {QUICK_PICKS.map(({ sym, label }) => (
                  <button
                    key={sym}
                    onClick={() => { setSearch(sym); loadStock(sym); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-card border border-accent/15 text-foreground/60 hover:border-accent/50 hover:text-foreground transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">
                  {error}
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-300">
                  <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
                  <span className="text-foreground/40 text-sm">Loading your data...</span>
                </div>
              )}

              {/* Stock detail */}
              {!loading && quote && (
                <div className="space-y-5 animate-in fade-in duration-500">

                  {/* Quote hero */}
                  <div className="rounded-xl bg-card border border-accent/20 p-5">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <span className="font-mono text-3xl font-bold text-foreground">
                          ${quote.c.toFixed(2)}
                        </span>
                        <div className={`flex items-center gap-1 mt-1 ${priceColor}`}>
                          {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="font-mono text-sm font-semibold">
                            {isUp ? "+" : ""}{quote.d.toFixed(2)} ({pct(quote.dp)})
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-lg font-bold text-accent bg-accent/10 px-3 py-1 rounded-lg">
                        {ticker}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-accent/10 text-center">
                      <div>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-wide">Open</p>
                        <p className="font-mono text-sm text-foreground">${quote.o.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-wide">Range</p>
                        <p className="font-mono text-sm text-foreground">${quote.l.toFixed(2)}–${quote.h.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-wide">Volume</p>
                        <p className="font-mono text-sm text-foreground">{formatVol(quote.v)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Candlestick chart */}
                  <div className="rounded-xl bg-card border border-accent/20 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-foreground/50">Price Chart (OHLC)</p>
                      <div className="flex gap-1">
                        {TIMEFRAMES.map(tf => (
                          <button
                            key={tf.key}
                            onClick={() => setTimeframe(tf.key)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-colors ${
                              timeframe === tf.key
                                ? "bg-accent text-background"
                                : "bg-background text-foreground/40 hover:text-foreground/70"
                            }`}
                          >
                            {tf.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {ohlcLoading ? (
                      <div className="flex items-center justify-center h-[280px]">
                        <Loader2 className="w-5 h-5 text-accent animate-spin" />
                      </div>
                    ) : ohlc.length > 1 ? (
                      <DynamicChart data={ohlc} height={280} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[280px] gap-3 px-6 text-center">
                        <span className="text-2xl">📊</span>
                        <p className="text-sm font-medium text-foreground/50">Interactive chart loading</p>
                        <p className="text-xs text-foreground/30 leading-relaxed max-w-xs">
                          Use the price, range, and Key Stats above to read the setup while the chart loads.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Fundamentals + About from Pansy panel */}
                  {panel?.profile && (
                    <div className="rounded-xl bg-card border border-accent/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-foreground">Key Stats</span>
                        {panel.profile.sector && (
                          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                            {panel.profile.sector}
                          </span>
                        )}
                      </div>
                      <StatRow label="Market Cap" value={panel.profile.marketCap} />
                      <StatRow label="P/E Ratio" value={panel.profile.pe} />
                      <StatRow label="Forward P/E" value={panel.profile.fpe} />
                      <StatRow label="52-Week High" value={panel.profile.high52} />
                      <StatRow label="52-Week Low" value={panel.profile.low52} />
                      <StatRow label="Perf. 1M" value={panel.profile.perf1m} />
                      <StatRow label="Perf. YTD" value={panel.profile.perfYTD} />
                      <StatRow label="Perf. 1Y" value={panel.profile.perf1y} />
                      {panel.profile.shortDescription && (
                        <p className="mt-3 pt-3 border-t border-accent/10 text-xs text-foreground/50 leading-relaxed">
                          {panel.profile.shortDescription}
                        </p>
                      )}
                    </div>
                  )}

                  {/* News */}
                  {news.length > 0 && (
                    <div className="rounded-xl bg-card border border-accent/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Newspaper className="w-4 h-4 text-accent" />
                        <span className="text-sm font-semibold text-foreground">Latest News</span>
                      </div>
                      <div className="space-y-3">
                        {news.map((item, i) => (
                          <a
                            key={i}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 group"
                          >
                            <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0 text-accent/40 group-hover:text-accent transition-colors" />
                            <div>
                              <p className="text-xs text-foreground/80 group-hover:text-foreground leading-snug transition-colors line-clamp-2">
                                {item.headline}
                              </p>
                              <p className="text-[10px] text-foreground/30 mt-0.5">
                                {item.source} · {new Date(item.datetime * 1000).toLocaleDateString()}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pansy's Analysis */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🌸</span>
                      <span className="font-serif text-base font-bold text-foreground">Pansy&apos;s Analysis</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 ml-1">
                        Educational only
                      </span>
                    </div>

                    {panelLoading && (
                      <div className="rounded-xl bg-card border border-accent/10 p-6 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-accent animate-spin flex-shrink-0" />
                        <span className="text-sm text-foreground/50">Pansy is reading the tape…</span>
                      </div>
                    )}

                    {!panelLoading && panel && (
                      <div className="space-y-3">
                        <PansyCard
                          title="Bull Case"
                          items={panel.bullCase}
                          color="bg-primary/5 border border-primary/20"
                          icon={<TrendingUp className="w-4 h-4 text-primary" />}
                        />
                        <PansyCard
                          title="Bear Case"
                          items={panel.bearCase}
                          color="bg-destructive/5 border border-destructive/20"
                          icon={<TrendingDown className="w-4 h-4 text-destructive" />}
                        />
                        <PansyCard
                          title="What Traders Watch"
                          items={panel.watchList}
                          color="bg-accent/5 border border-accent/20"
                          icon={<Search className="w-4 h-4 text-accent" />}
                        />
                        <div className="flex items-start gap-2 rounded-lg bg-accent/8 border border-accent/15 px-3 py-2 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-accent/70 flex-shrink-0 mt-0.5" />
                          <p className="text-[10px] text-foreground/40 leading-relaxed">
                            Educational only — not financial advice. Markets carry real risk, including loss of principal, and past moves don&apos;t predict future ones. The decision&apos;s always yours.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Practice CTA */}
                  <div className="rounded-xl bg-card border border-primary/20 p-4 flex items-center justify-between mt-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Ready to practice?</p>
                      <p className="text-xs text-foreground/40">Open a virtual {ticker} position</p>
                    </div>
                    <Link
                      href="/practice"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Practice Trader
                    </Link>
                  </div>

                </div>
              )}

              {/* Empty state */}
              {!loading && !quote && !error && (
                <div className="text-center py-16 text-foreground/20 text-sm">
                  Search a ticker above to get started
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const result = await requireProUserSSR(req as Parameters<typeof requireProUserSSR>[0]);
  if (result.status === "unauthenticated") {
    return { redirect: { destination: "/auth", permanent: false } };
  }
  return { props: {} };
};
