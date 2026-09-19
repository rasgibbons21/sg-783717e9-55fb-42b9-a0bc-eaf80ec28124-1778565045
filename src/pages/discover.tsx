import { useEffect, useState, useRef, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { Search, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const QUICK_TICKERS = [
  { symbol: "AAPL", label: "AAPL" },
  { symbol: "NVDA", label: "NVDA" },
  { symbol: "TSLA", label: "TSLA" },
  { symbol: "MSFT", label: "MSFT" },
  { symbol: "SPY", label: "SPY" },
  { symbol: "QQQ", label: "QQQ" },
  { symbol: "AMD", label: "AMD" },
  { symbol: "META", label: "META" },
];

interface TrendingItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

function TradingViewChart({ symbol, theme }: { symbol: string; theme: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (widgetRef.current === symbol) return;
    widgetRef.current = symbol;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "15",
      timezone: "America/New_York",
      theme: theme,
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container__widget";
    wrapper.style.height = "100%";
    wrapper.style.width = "100%";

    containerRef.current.appendChild(wrapper);
    containerRef.current.appendChild(script);
  }, [symbol, theme]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height: "100%", width: "100%" }}
    />
  );
}

export default function Discover() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const loadTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const res = await fetch("/api/scanner/scan?minChange=3&minRvol=2");
      if (res.ok) {
        const data = await res.json();
        const items = (data.candidates || []).slice(0, 6).map((c: Record<string, unknown>) => ({
          symbol: c.symbol as string,
          name: c.symbol as string,
          price: c.price as number,
          change: c.changeAbs as number,
          changePercent: c.change as number,
        }));
        setTrending(items);
      }
    } catch {} finally {
      setTrendingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedSymbol(searchQuery.trim().toUpperCase());
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <Layout>
      <SEO
        title="Bloom | Discover — Live Stock Charts"
        description="Real-time TradingView charts for stocks. Research any ticker with interactive charting."
      />

      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#F3EDE3]">Discover</h1>
            <p className="text-xs text-[#F3EDE3]/40 mt-0.5">Live charts &amp; market research</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => { haptic(); setSearchOpen(!searchOpen); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(39,183,200,0.1)", border: "1px solid rgba(39,183,200,0.2)" }}
          >
            <Search className="w-4 h-4 text-[#27B7C8]" />
          </motion.button>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            onSubmit={handleSearch}
            className="mb-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticker (AAPL, TSLA, SPY...)"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm text-[#F3EDE3] placeholder:text-[#F3EDE3]/30"
                style={{ background: "rgba(22,37,64,0.8)", border: "1px solid rgba(39,183,200,0.15)" }}
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: "rgba(39,183,200,0.2)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.3)" }}
              >
                Go
              </motion.button>
            </div>
          </motion.form>
        )}

        {/* Quick ticker chips */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_TICKERS.map((t) => (
            <motion.button
              key={t.symbol}
              whileTap={{ scale: 0.9 }}
              onClick={() => { haptic(); setSelectedSymbol(t.symbol); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: selectedSymbol === t.symbol
                  ? "rgba(39,183,200,0.2)"
                  : "rgba(255,255,255,0.05)",
                color: selectedSymbol === t.symbol ? "#27B7C8" : "#F3EDE3",
                border: `1px solid ${selectedSymbol === t.symbol ? "rgba(39,183,200,0.35)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* Current symbol label */}
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-[#27B7C8]" />
          <span className="text-sm font-bold text-[#F3EDE3]">{selectedSymbol}</span>
          <span className="text-[10px] text-[#F3EDE3]/30">TradingView</span>
        </div>

        {/* TradingView chart */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{
            height: 420,
            background: "#07080C",
            border: "1px solid rgba(39,183,200,0.12)",
          }}
        >
          <TradingViewChart symbol={selectedSymbol} theme="dark" />
        </div>

        {/* Trending stocks from scanner */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#49B06E]" />
            <h2 className="text-sm font-bold text-[#F3EDE3]">Trending Today</h2>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl p-3 animate-pulse" style={{ background: "#121821" }}>
                  <div className="h-4 w-14 rounded bg-white/5 mb-2" />
                  <div className="h-3 w-20 rounded bg-white/5" />
                </div>
              ))}
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {trending.map((item) => (
                <motion.button
                  key={item.symbol}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { haptic(); setSelectedSymbol(item.symbol); }}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{
                    background: selectedSymbol === item.symbol
                      ? "rgba(39,183,200,0.08)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedSymbol === item.symbol ? "rgba(39,183,200,0.2)" : "rgba(255,255,255,0.05)"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-[#F3EDE3]">{item.symbol}</span>
                    <div className="flex items-center gap-0.5">
                      {item.changePercent >= 0
                        ? <ArrowUpRight className="w-3 h-3 text-[#49B06E]" />
                        : <ArrowDownRight className="w-3 h-3 text-[#EF4444]" />
                      }
                      <span
                        className="text-xs font-semibold"
                        style={{ color: item.changePercent >= 0 ? "#49B06E" : "#EF4444" }}
                      >
                        {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-[#F3EDE3]/40">
                    ${item.price.toFixed(2)}
                  </span>
                </motion.button>
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-[#F3EDE3]/20" />
              <p className="text-xs text-[#F3EDE3]/40">No movers right now — check back when markets get active</p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="text-[10px] text-[#F3EDE3]/30 leading-relaxed">
            <strong className="text-[#F3EDE3]/40">Charts powered by TradingView.</strong>{" "}
            Data may be delayed. Not investment advice. Do your own research before trading.
          </p>
        </div>
      </div>
    </Layout>
  );
}
