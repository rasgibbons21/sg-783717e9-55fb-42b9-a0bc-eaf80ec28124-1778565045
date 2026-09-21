import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronDown, ChevronRight, Eye, AlertTriangle,
  Target, XCircle, Lightbulb, Zap,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { getPatternBySlug, type PatternData, type CandleData, type AnnotationData } from "@/data/academy/patterns";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

function PatternChart({ candles, annotations, color }: {
  candles: CandleData[];
  annotations: AnnotationData[];
  color: string;
}) {
  return (
    <svg viewBox="0 0 310 270" className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.08} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="310" height="270" fill="url(#chartGlow)" rx="12" />

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
              opacity={0.6}
            />
            <rect
              x={c.x - 9} y={bodyTop} width={18} height={bodyH}
              rx={2}
              fill={isGreen ? color : "#EF4444"}
              opacity={0.9}
            />
          </g>
        );
      })}

      {annotations.map((a, i) => (
        <text
          key={i}
          x={a.x}
          y={a.y}
          textAnchor={a.anchor || "start"}
          fill="rgba(243,237,227,0.5)"
          fontSize="10"
          fontWeight="600"
          fontFamily="system-ui, sans-serif"
        >
          {a.label}
        </text>
      ))}
    </svg>
  );
}

function Section({ title, icon: Icon, color, children, defaultOpen = false }: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => { haptic(); setOpen(!open); }}
        className="w-full flex items-center gap-3 p-3.5 text-left"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-sm font-semibold text-[#F3EDE3] flex-1">{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-[#F3EDE3]/30" />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageCard({ stage, index, total, color }: {
  stage: { label: string; description: string };
  index: number;
  total: number;
  color: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
          style={{ background: `${color}20`, color }}
        >
          {index + 1}
        </div>
        {index < total - 1 && (
          <div className="w-px flex-1 mt-1" style={{ background: `${color}20` }} />
        )}
      </div>
      <div className="pb-4">
        <p className="text-xs font-bold text-[#F3EDE3] mb-0.5">{stage.label}</p>
        <p className="text-[11px] text-[#F3EDE3]/50 leading-relaxed">{stage.description}</p>
      </div>
    </div>
  );
}

function BulletList({ items, icon, color }: {
  items: string[];
  icon?: "check" | "x" | "warn";
  color: string;
}) {
  const symbols = { check: "✓", x: "✗", warn: "!" };
  const sym = icon ? symbols[icon] : "•";
  const symColor = icon === "x" ? "#EF4444" : icon === "warn" ? "#F59E0B" : color;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <span
            className="text-[10px] font-bold mt-0.5 flex-shrink-0 w-4 text-center"
            style={{ color: symColor }}
          >
            {sym}
          </span>
          <span className="text-[11px] text-[#F3EDE3]/60 leading-relaxed">{item}</span>
        </div>
      ))}
    </div>
  );
}

function PatternDetail({ pattern }: { pattern: PatternData }) {
  return (
    <Layout>
      <SEO
        title={`${pattern.name} — Pattern Library`}
        description={pattern.tagline}
      />
      <div className="max-w-lg mx-auto px-4 pt-3 pb-32">
        {/* Back */}
        <Link href="/academy/patterns">
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => haptic()}
            className="inline-flex items-center gap-1.5 text-[#F3EDE3]/40 hover:text-[#F3EDE3]/60 text-xs mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Pattern Library
          </motion.div>
        </Link>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: pattern.color }}
            />
            <span
              className="text-[9px] font-bold uppercase tracking-wider"
              style={{ color: pattern.color }}
            >
              {pattern.category === "chart" ? "Chart Pattern" : pattern.category === "candlestick" ? "Candlestick Pattern" : "Momentum Pattern"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#F3EDE3]">{pattern.name}</h1>
          <p className="text-xs text-[#F3EDE3]/40 mt-1">{pattern.tagline}</p>
        </div>

        {/* Chart */}
        <div
          className="rounded-2xl overflow-hidden mb-5"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <PatternChart candles={pattern.candles} annotations={pattern.annotations} color={pattern.color} />
        </div>

        {/* Description */}
        <p className="text-xs text-[#F3EDE3]/60 leading-relaxed mb-5">{pattern.description}</p>

        {/* Sections */}
        <div className="space-y-2.5">
          {/* Stages */}
          <Section title="How It Develops" icon={Zap} color={pattern.color} defaultOpen>
            <div>
              {pattern.stages.map((stage, i) => (
                <StageCard
                  key={stage.label}
                  stage={stage}
                  index={i}
                  total={pattern.stages.length}
                  color={pattern.color}
                />
              ))}
            </div>
          </Section>

          {/* What to Look For */}
          <Section title="What to Look For" icon={Eye} color="#27B7C8">
            <BulletList items={pattern.whatToLookFor} icon="check" color="#27B7C8" />
          </Section>

          {/* How Traders Approach */}
          <Section title="How Traders Approach It" icon={Target} color="#49B06E">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-[#F3EDE3]/30 uppercase tracking-wider font-bold mb-1">Entry Concept</p>
                <p className="text-[11px] text-[#F3EDE3]/60 leading-relaxed">{pattern.howTradersApproach.entry}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#F3EDE3]/30 uppercase tracking-wider font-bold mb-1">Invalidation</p>
                <p className="text-[11px] text-[#F3EDE3]/60 leading-relaxed">{pattern.howTradersApproach.invalidation}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#F3EDE3]/30 uppercase tracking-wider font-bold mb-1">Target</p>
                <p className="text-[11px] text-[#F3EDE3]/60 leading-relaxed">{pattern.howTradersApproach.target}</p>
              </div>
            </div>
          </Section>

          {/* What Invalidates */}
          <Section title="What Invalidates It" icon={XCircle} color="#EF4444">
            <BulletList items={pattern.whatInvalidates} icon="x" color="#EF4444" />
          </Section>

          {/* Common Mistakes */}
          <Section title="Common Mistakes" icon={AlertTriangle} color="#F59E0B">
            <BulletList items={pattern.commonMistakes} icon="warn" color="#F59E0B" />
          </Section>

          {/* Strategies */}
          {pattern.bloomStrategies.length > 0 && (
            <Section title="Used by Our Strategies" icon={Lightbulb} color="#A855F7">
              <div className="space-y-1.5">
                {pattern.bloomStrategies.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(168,85,247,0.08)" }}
                  >
                    <ChevronRight className="w-3 h-3 text-[#A855F7]/50" />
                    <span className="text-[11px] text-[#F3EDE3]/70 font-medium">{s}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-[9px] text-[#F3EDE3]/20 text-center mt-8 leading-relaxed max-w-xs mx-auto">
          This is an educational reference. Past pattern behavior does not guarantee future results.
          Not a trade recommendation.
        </p>
      </div>
    </Layout>
  );
}

export default function PatternDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const pattern = typeof slug === "string" ? getPatternBySlug(slug) : undefined;

  if (!router.isReady) {
    return <Layout><div className="max-w-lg mx-auto px-4 pt-20" /></Layout>;
  }

  if (!pattern) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto px-4 pt-20 text-center">
          <p className="text-[#F3EDE3]/40 text-sm">Pattern not found.</p>
          <Link href="/academy/patterns" className="text-[#27B7C8] text-xs mt-2 inline-block">
            Back to Pattern Library
          </Link>
        </div>
      </Layout>
    );
  }

  return <PatternDetail pattern={pattern} />;
}
