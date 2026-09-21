import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Layers, Zap } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ALL_PATTERNS, getPatternsByCategory, type PatternCategory, type PatternData, type CandleData } from "@/data/academy/patterns";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const TABS: { key: PatternCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "chart", label: "Chart" },
  { key: "momentum", label: "Momentum" },
  { key: "candlestick", label: "Candlestick" },
];

function MiniChart({ candles, color }: { candles: CandleData[]; color: string }) {
  return (
    <svg viewBox="0 0 300 260" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {candles.map((c, i) => {
        const isGreen = c.close < c.open;
        const bodyTop = Math.min(c.open, c.close);
        const bodyBot = Math.max(c.open, c.close);
        const bodyH = Math.max(bodyBot - bodyTop, 2);
        return (
          <g key={i}>
            <line
              x1={c.x} y1={c.high} x2={c.x} y2={c.low}
              stroke={isGreen ? color : "#EF4444"}
              strokeWidth={1.5}
              opacity={0.5}
            />
            <rect
              x={c.x - 8} y={bodyTop} width={16} height={bodyH}
              rx={2}
              fill={isGreen ? color : "#EF4444"}
              opacity={0.85}
            />
          </g>
        );
      })}
    </svg>
  );
}

function PatternCard({ pattern, index }: { pattern: PatternData; index: number }) {
  return (
    <Link href={`/academy/patterns/${pattern.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => haptic()}
        className="rounded-2xl overflow-hidden cursor-pointer group"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="h-32 relative overflow-hidden" style={{ background: `${pattern.color}08` }}>
          <div className="absolute inset-0 p-2">
            <MiniChart candles={pattern.candles} color={pattern.color} />
          </div>
          <div
            className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: `${pattern.color}20`, color: pattern.color }}
          >
            {pattern.category === "chart" ? "Chart" : pattern.category === "candlestick" ? "Candle" : "Momentum"}
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#F3EDE3] group-hover:text-white transition-colors">
              {pattern.name}
            </h3>
            <ChevronRight className="w-3.5 h-3.5 text-[#F3EDE3]/20 group-hover:text-[#F3EDE3]/40 transition-colors" />
          </div>
          <p className="text-[11px] text-[#F3EDE3]/40 leading-relaxed line-clamp-2">
            {pattern.tagline}
          </p>
          {pattern.bloomStrategies.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {pattern.bloomStrategies.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#27B7C8]/10 text-[#27B7C8]/70 font-semibold"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

export default function PatternLibrary() {
  const [tab, setTab] = useState<PatternCategory | "all">("all");

  const patterns = tab === "all" ? ALL_PATTERNS : getPatternsByCategory(tab);

  return (
    <Layout>
      <SEO
        title="Pattern Library — She Blooms Academy"
        description="Learn chart, momentum, and candlestick trading patterns with interactive SVG illustrations, stages, entry concepts, and common mistakes."
      />
      <div className="max-w-lg mx-auto px-4 pt-3 pb-32">
        {/* Back */}
        <Link href="/learn">
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => haptic()}
            className="inline-flex items-center gap-1.5 text-[#F3EDE3]/40 hover:text-[#F3EDE3]/60 text-xs mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Academy
          </motion.div>
        </Link>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-[#27B7C8]" />
            <h1 className="text-xl font-bold text-[#F3EDE3]">Pattern Library</h1>
          </div>
          <p className="text-xs text-[#F3EDE3]/40">
            {ALL_PATTERNS.length} patterns &middot; Chart, momentum &amp; candlestick setups
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <motion.button
                key={t.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => { haptic(); setTab(t.key); }}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: active ? "#27B7C8" : "rgba(255,255,255,0.04)",
                  color: active ? "#fff" : "rgba(243,237,227,0.5)",
                  border: `1px solid ${active ? "#27B7C8" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                {t.label}
              </motion.button>
            );
          })}
        </div>

        {/* Pattern Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-2 gap-3"
          >
            {patterns.map((p, i) => (
              <PatternCard key={p.slug} pattern={p} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Disclaimer */}
        <p className="text-[9px] text-[#F3EDE3]/20 text-center mt-8 leading-relaxed max-w-xs mx-auto">
          Patterns are educational references, not trade recommendations.
          Past pattern behavior does not guarantee future results.
        </p>
      </div>
    </Layout>
  );
}
