import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Filter } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AcademyLayout } from "@/components/academy/AcademyLayout";
import { AcademyToolCard } from "@/components/academy/AcademyToolCard";
import { ACADEMY_TOOLS, TOOL_CATEGORIES } from "@/data/academy/tools";
import { useSubscription } from "@/contexts/SubscriptionContext";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

export default function ToolsIndex() {
  const { isPro } = useSubscription();
  const [category, setCategory] = useState("all");

  const filtered = category === "all"
    ? ACADEMY_TOOLS
    : ACADEMY_TOOLS.filter((t) => t.category === category);

  return (
    <AcademyLayout title="AI Tools">
      <SEO
        title="AI Tools — Bloom Academy"
        description="13 AI-powered investment tools for stock analysis, screening, portfolio management, and market research."
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#27B7C8]/15 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-[#27B7C8]" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-foreground">13 AI-Powered Tools</h2>
            <p className="text-xs text-muted-foreground">Professional-grade analysis at your fingertips</p>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {TOOL_CATEGORIES.map((cat) => (
            <motion.button
              key={cat.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => { haptic(); setCategory(cat.key); }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                category === cat.key
                  ? "bg-[#27B7C8]/15 border-[#27B7C8]/30 text-[#27B7C8]"
                  : "bg-background border-border text-muted-foreground hover:border-border/60"
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool, i) => (
            <AcademyToolCard key={tool.slug} tool={tool} isPro={isPro} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No tools in this category.</p>
          </div>
        )}
      </div>
    </AcademyLayout>
  );
}
