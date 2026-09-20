/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { Newspaper, RefreshCw, ExternalLink, TrendingUp } from "lucide-react";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface Article {
  id: string;
  title: string;
  summary?: string;
  source: string;
  url: string;
  image?: string;
  publishedAt: string;
  category: string;
  symbols: string[];
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

const SECTORS = [
  { id: "all", label: "All" },
  { id: "technology", label: "Tech" },
  { id: "finance", label: "Finance" },
  { id: "energy", label: "Energy" },
  { id: "healthcare", label: "Health" },
  { id: "general", label: "Market" },
] as const;

type SectorId = typeof SECTORS[number]["id"];

function categorizeSector(a: Article): string {
  const text = `${a.title} ${a.summary ?? ""} ${a.category}`.toLowerCase();
  if (/tech|software|ai |chip|semiconductor|nvidia|apple|google|microsoft|meta |amazon|saas/i.test(text)) return "technology";
  if (/bank|fed |rate|treasury|yield|inflation|gdp|jobs|payroll|cpi|fomc|interest/i.test(text)) return "finance";
  if (/oil|gas|energy|solar|opec|crude|pipeline|utility/i.test(text)) return "energy";
  if (/health|pharma|biotech|fda|drug|vaccine|hospital/i.test(text)) return "healthcare";
  return "general";
}

function NewsCard({ article, featured }: { article: Article; featured?: boolean }) {
  if (featured) {
    return (
      <motion.a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="block rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
        style={{ background: "#121821", border: "1px solid rgba(39,183,200,0.15)" }}
      >
        {article.image && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={article.image}
              alt=""
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #121821, transparent 60%)" }} />
          </div>
        )}
        <div className="p-4 -mt-6 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(39,183,200,0.15)", color: "#27B7C8" }}>
              {article.source}
            </span>
            <span className="text-[10px] text-[#F3EDE3]/30">{timeAgo(article.publishedAt)}</span>
          </div>
          <h3 className="text-base font-bold text-[#F3EDE3] leading-snug mb-2 line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-xs text-[#F3EDE3]/40 line-clamp-2 leading-relaxed mb-2">
              {article.summary}
            </p>
          )}
          {article.symbols.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {article.symbols.slice(0, 4).map(s => (
                <span key={s} className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(73,176,110,0.1)", color: "#49B06E" }}>
                  ${s}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.a>
    );
  }

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="block rounded-xl overflow-hidden active:scale-[0.97] transition-transform"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {article.image && (
        <div className="h-28 overflow-hidden">
          <img
            src={article.image}
            alt=""
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}
      <div className="p-3">
        <h3 className="text-[13px] font-semibold text-[#F3EDE3] line-clamp-2 leading-snug mb-1.5">
          {article.title}
        </h3>
        <div className="flex items-center justify-between text-[10px] text-[#F3EDE3]/30">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{article.source}</span>
            <span>&middot;</span>
            <span>{timeAgo(article.publishedAt)}</span>
          </div>
          <ExternalLink className="w-3 h-3" />
        </div>
        {article.symbols.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {article.symbols.slice(0, 3).map(s => (
              <span key={s} className="text-[9px] font-bold text-[#27B7C8]">${s}</span>
            ))}
          </div>
        )}
      </div>
    </motion.a>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState<SectorId>("all");

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scanner/news?type=general");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNews(); }, [loadNews]);

  const filtered = sector === "all"
    ? articles
    : articles.filter(a => categorizeSector(a) === sector);

  const featured = filtered[0];
  const grid = filtered.slice(1);

  return (
    <Layout>
      <SEO title="Bloom Radar | News" description="Market news and headlines from licensed sources." />
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-[#F3EDE3]">News</h1>
            <p className="text-xs text-[#F3EDE3]/40 mt-0.5">Market headlines &amp; movers</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.85, rotate: 180 }}
            onClick={() => { haptic(); loadNews(); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(39,183,200,0.1)", border: "1px solid rgba(39,183,200,0.2)" }}
          >
            <RefreshCw className={`w-4 h-4 text-[#27B7C8] ${loading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>

        {/* Sector chips */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {SECTORS.map(s => {
            const active = sector === s.id;
            return (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => { haptic(); setSector(s.id); }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                style={{
                  background: active ? "rgba(39,183,200,0.2)" : "rgba(255,255,255,0.04)",
                  color: active ? "#27B7C8" : "rgba(243,237,227,0.5)",
                  border: active ? "1px solid rgba(39,183,200,0.4)" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {s.label}
              </motion.button>
            );
          })}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            <div className="rounded-2xl h-52 animate-pulse" style={{ background: "#121821" }} />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-xl h-48 animate-pulse" style={{ background: "#121821" }} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: "linear-gradient(145deg, rgba(245,158,11,0.06), rgba(7,8,12,1))", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <Newspaper className="w-8 h-8 mx-auto mb-3 text-[#F3EDE3]/20" />
            <p className="text-sm font-semibold text-[#F3EDE3]/80 mb-1">No news available</p>
            <p className="text-xs text-[#F3EDE3]/40">
              {sector === "all" ? "Check back when markets are active." : "Try a different sector or check back later."}
            </p>
          </div>
        )}

        {/* Featured + grid */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {/* Hero article */}
            {featured && <NewsCard article={featured} featured />}

            {/* Trending tickers strip */}
            {articles.some(a => a.symbols.length > 0) && (
              <div className="rounded-xl p-3 flex items-center gap-2 overflow-x-auto scrollbar-hide" style={{ background: "rgba(73,176,110,0.06)", border: "1px solid rgba(73,176,110,0.12)" }}>
                <TrendingUp className="w-3.5 h-3.5 text-[#49B06E] flex-shrink-0" />
                <span className="text-[10px] font-bold text-[#49B06E] uppercase tracking-wider flex-shrink-0">Mentioned</span>
                <div className="flex gap-1.5 overflow-x-auto">
                  {[...new Set(articles.flatMap(a => a.symbols))].slice(0, 12).map(s => (
                    <span key={s} className="text-[10px] font-bold text-[#F3EDE3]/60 px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: "rgba(255,255,255,0.05)" }}>
                      ${s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Card grid */}
            <div className="grid grid-cols-2 gap-3">
              {grid.map((a, i) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl p-3 mt-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[10px] text-[#F3EDE3]/30 leading-relaxed">
            News sourced from licensed APIs (Finnhub, FMP). Headlines and summaries are provided as-is. Not investment advice.
          </p>
        </div>
      </div>
    </Layout>
  );
}
