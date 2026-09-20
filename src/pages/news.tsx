/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { Newspaper, RefreshCw, ExternalLink } from "lucide-react";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

interface Article {
  id: string;
  title: string;
  summary?: string;
  source: string;
  url: string;
  image?: string;
  publishedAt: string;
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

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout>
      <SEO title="Bloom Radar | News" description="Market news and headlines from licensed sources." />
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
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

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="rounded-xl p-3 animate-pulse" style={{ background: "#121821" }}>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-white/5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-full rounded bg-white/5 mb-2" />
                    <div className="h-3 w-3/4 rounded bg-white/5 mb-2" />
                    <div className="h-2.5 w-1/2 rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && articles.length === 0 && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: "linear-gradient(145deg, rgba(245,158,11,0.06), rgba(7,8,12,1))", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <Newspaper className="w-8 h-8 mx-auto mb-3 text-[#F3EDE3]/20" />
            <p className="text-sm font-semibold text-[#F3EDE3]/80 mb-1">No news available right now</p>
            <p className="text-xs text-[#F3EDE3]/40">Check back when markets are active.</p>
          </div>
        )}

        {/* Articles */}
        {!loading && articles.length > 0 && (
          <div className="space-y-2">
            {articles.map((a, i) => (
              <motion.a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="block rounded-xl p-3 transition-all hover:bg-white/5 active:scale-[0.99]"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex gap-3">
                  {a.image && (
                    <img
                      src={a.image}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#F3EDE3] line-clamp-2 leading-snug mb-1">
                      {a.title}
                    </h3>
                    {a.summary && (
                      <p className="text-[11px] text-[#F3EDE3]/40 line-clamp-2 leading-relaxed mb-1.5">
                        {a.summary}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-[#F3EDE3]/30">
                      <span>{a.source}</span>
                      <span>&middot;</span>
                      <span>{timeAgo(a.publishedAt)}</span>
                      {a.symbols.length > 0 && (
                        <>
                          <span>&middot;</span>
                          {a.symbols.slice(0, 3).map(s => (
                            <span key={s} className="text-[#27B7C8] font-medium">${s}</span>
                          ))}
                        </>
                      )}
                      <ExternalLink className="w-3 h-3 ml-auto text-[#F3EDE3]/20" />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
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
