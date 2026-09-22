import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet, Calculator, PiggyBank, TrendingDown,
  BarChart3, ArrowRight, ExternalLink,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { AcademyLayout } from "@/components/academy/AcademyLayout";
import { AdMobBanner } from "@/components/AdMobBanner";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const BUDGET_RESOURCES = [
  {
    icon: Wallet,
    title: "Budget Tracker",
    desc: "Track spending across 12 categories with AI-powered insights from Pansy.",
    href: "/budget-tracker",
    color: "#49B06E",
    tag: "Interactive Tool",
  },
  {
    icon: PiggyBank,
    title: "Savings Goal Calculator",
    desc: "Set a savings target, enter your timeline, and see exactly how much to save each month.",
    href: "/academy/budget/savings-calculator",
    color: "#27B7C8",
    tag: "Calculator",
  },
  {
    icon: TrendingDown,
    title: "Debt Payoff Planner",
    desc: "Snowball or avalanche? Compare strategies and see your debt-free date.",
    href: "/academy/budget/debt-planner",
    color: "#F59E0B",
    tag: "Calculator",
  },
  {
    icon: BarChart3,
    title: "Net Worth Tracker",
    desc: "Calculate your net worth and track it over time. Assets minus liabilities, made simple.",
    href: "/academy/budget/net-worth",
    color: "#A78BFA",
    tag: "Calculator",
  },
];

const BUDGET_TIPS = [
  { title: "The 50/30/20 Rule", desc: "50% needs, 30% wants, 20% savings. A simple framework that works." },
  { title: "Pay Yourself First", desc: "Automate savings before spending. Even $25/week adds up to $1,300/year." },
  { title: "Track Everything", desc: "You can't manage what you don't measure. Use the budget tracker daily." },
  { title: "Emergency Fund First", desc: "Build 3-6 months of expenses before investing. It's your financial safety net." },
];

export default function BudgetHub() {
  return (
    <AcademyLayout title="Budget">
      <SEO
        title="Budget — Radar Academy"
        description="Track spending, plan savings, and manage debt with smart budgeting tools and AI-powered insights."
      />

      <div className="p-4 md:p-6 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#49B06E]/10 to-transparent border border-[#49B06E]/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#49B06E]/15">
              <Wallet className="w-5 h-5 text-[#49B06E]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-foreground">Master Your Money</h2>
              <p className="text-xs text-muted-foreground">The foundation of financial freedom starts here</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Budgeting isn&apos;t about restriction &mdash; it&apos;s about knowing where your money goes so you can send it where you want.
            Use our tools to track spending, crush debt, and build savings on autopilot.
          </p>
        </motion.div>

        {/* Tools & Calculators */}
        <div>
          <h2 className="text-lg font-serif font-bold text-foreground mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#49B06E]" />
            Tools & Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BUDGET_RESOURCES.map((item, i) => (
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
                    {item.href.startsWith("/academy") ? "Open" : "Launch"} <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        <AdMobBanner format="rectangle" />

        {/* Quick Tips */}
        <div>
          <h2 className="text-lg font-serif font-bold text-foreground mb-4">Budgeting Basics</h2>
          <div className="space-y-3">
            {BUDGET_TIPS.map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="bg-card border border-border rounded-xl p-4 flex gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-[#49B06E]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#49B06E]">{i + 1}</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-0.5">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground">{tip.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AcademyLayout>
  );
}
