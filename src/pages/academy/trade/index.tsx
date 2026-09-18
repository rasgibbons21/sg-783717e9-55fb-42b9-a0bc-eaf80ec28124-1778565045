import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp, GraduationCap, LineChart, BookOpen,
  ArrowRight, Brain, Target, BarChart3,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { AcademyLayout } from "@/components/academy/AcademyLayout";
import { AdMobBanner } from "@/components/AdMobBanner";
import { AcademyToolCard } from "@/components/academy/AcademyToolCard";
import { ACADEMY_TOOLS } from "@/data/academy/tools";
import { useSubscription } from "@/contexts/SubscriptionContext";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const LEARNING_PATHS = [
  {
    icon: BookOpen,
    title: "Financial Lessons",
    desc: "150+ bite-sized lessons from budgeting basics to advanced investing. Quizzes included.",
    href: "/learn",
    color: "#A78BFA",
    tag: "16 Categories",
  },
  {
    icon: GraduationCap,
    title: "Bloom University",
    desc: "Structured courses that take you from complete beginner to confident investor.",
    href: "/university",
    color: "#27B7C8",
    tag: "Courses",
  },
  {
    icon: LineChart,
    title: "Paper Trading",
    desc: "Practice buying and selling stocks with virtual money. Zero risk, real learning.",
    href: "/paper-trader-v2",
    color: "#49B06E",
    tag: "Simulator",
  },
  {
    icon: Brain,
    title: "Ask Pansy",
    desc: "Your AI financial coach. Ask any investing question and get clear, jargon-free answers.",
    href: "/ask-pansy",
    color: "#F59E0B",
    tag: "AI Chat",
  },
];

const CONCEPTS = [
  { title: "Stocks vs. Bonds", desc: "Ownership vs. lending — understand the two pillars of investing." },
  { title: "Dollar-Cost Averaging", desc: "Invest the same amount regularly. Time in the market beats timing the market." },
  { title: "Diversification", desc: "Don't put all your eggs in one basket. Spread risk across sectors and asset classes." },
  { title: "Compound Interest", desc: "The eighth wonder of the world. Start early, even small amounts grow exponentially." },
  { title: "Risk Tolerance", desc: "Know your comfort level before you invest. It guides your entire strategy." },
  { title: "Index Funds", desc: "Own a slice of the entire market. Low fees, broad diversification, proven returns." },
];

export default function TradeHub() {
  const { isPro } = useSubscription();
  const tradeTools = ACADEMY_TOOLS.filter(
    (t) => ["stock-analyzer", "technical-charts", "smart-screener", "portfolio-xray"].includes(t.slug)
  );

  return (
    <AcademyLayout title="Learn to Trade">
      <SEO
        title="Learn to Trade — Bloom Academy"
        description="Master investing from scratch with 150+ lessons, paper trading simulator, and AI-powered stock analysis tools."
      />

      <div className="p-4 md:p-6 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#A78BFA]/10 to-transparent border border-[#A78BFA]/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#A78BFA]/15">
              <TrendingUp className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-foreground">Learn to Trade</h2>
              <p className="text-xs text-muted-foreground">From complete beginner to confident investor</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Investing isn&apos;t just for Wall Street. Start with the basics, practice risk-free with paper trading,
            and use AI tools to analyze stocks when you&apos;re ready for the real thing.
          </p>
        </motion.div>

        {/* Learning Paths */}
        <div>
          <h2 className="text-lg font-serif font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-[#A78BFA]" />
            Start Learning
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LEARNING_PATHS.map((item, i) => (
              <Link key={item.title} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ y: -3 }}
                  onClick={() => haptic()}
                  className="bg-card border border-border rounded-2xl p-5 h-full cursor-pointer hover:border-border/60 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${item.color}15` }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: item.color }}>
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        <AdMobBanner format="rectangle" />

        {/* Related AI Tools */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#27B7C8]" />
              Trading AI Tools
            </h2>
            <Link
              href="/academy/tools"
              className="text-xs font-semibold text-[#27B7C8] hover:text-[#27B7C8]/80 transition-colors flex items-center gap-1"
            >
              All tools <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tradeTools.map((tool, i) => (
              <AcademyToolCard key={tool.slug} tool={tool} isPro={isPro} index={i} />
            ))}
          </div>
        </div>

        {/* Key Concepts */}
        <div>
          <h2 className="text-lg font-serif font-bold text-foreground mb-4">Key Concepts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONCEPTS.map((concept, i) => (
              <motion.div
                key={concept.title}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <h4 className="text-sm font-bold text-foreground mb-1">{concept.title}</h4>
                <p className="text-xs text-muted-foreground">{concept.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AcademyLayout>
  );
}
