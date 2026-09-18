import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lightbulb, Search, Rocket, Target,
  BookOpen, ArrowRight, Sparkles,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { AcademyLayout } from "@/components/academy/AcademyLayout";
import { AdMobBanner } from "@/components/AdMobBanner";
import { useSubscription } from "@/contexts/SubscriptionContext";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const HUSTLE_TOOLS = [
  {
    icon: Search,
    title: "AI Niche Finder",
    desc: "Describe your skills and interests. Our AI analyzes market demand, competition, and profit potential to find your perfect niche.",
    href: "/academy/hustle/niche-finder",
    color: "#27B7C8",
    tag: "AI Tool",
    isPro: true,
  },
  {
    icon: BookOpen,
    title: "Side Hustle Guide",
    desc: "Step-by-step guides for 6 proven side hustles — from freelancing to content creation. 12 actionable steps each.",
    href: "/side-hustle",
    color: "#49B06E",
    tag: "Interactive Guide",
    isPro: false,
  },
  {
    icon: Rocket,
    title: "Launch Planner",
    desc: "Turn your idea into a plan. AI helps you create a timeline, set milestones, and estimate your first-month revenue.",
    href: "/academy/hustle/launch-planner",
    color: "#F59E0B",
    tag: "Coming Soon",
    isPro: true,
  },
  {
    icon: Target,
    title: "Income Tracker",
    desc: "Track your side hustle earnings across multiple streams. See what's working and double down.",
    href: "/academy/hustle/income-tracker",
    color: "#A78BFA",
    tag: "Coming Soon",
    isPro: true,
  },
];

const HUSTLE_IDEAS = [
  { title: "Freelance Writing", time: "5-15 hrs/wk", income: "$500-$3,000/mo" },
  { title: "Virtual Assistant", time: "10-20 hrs/wk", income: "$800-$2,500/mo" },
  { title: "Social Media Management", time: "5-15 hrs/wk", income: "$500-$2,000/mo" },
  { title: "Online Tutoring", time: "5-15 hrs/wk", income: "$400-$2,000/mo" },
  { title: "Reselling / Thrifting", time: "5-10 hrs/wk", income: "$300-$1,500/mo" },
  { title: "Content Creation", time: "10-20 hrs/wk", income: "$0-$5,000+/mo" },
];

export default function HustleHub() {
  const { isPro } = useSubscription();

  return (
    <AcademyLayout title="Side Hustle">
      <SEO
        title="Side Hustle — Bloom Academy"
        description="Discover your perfect side hustle with AI-powered niche analysis, step-by-step guides, and income tracking."
      />

      <div className="p-4 md:p-6 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#27B7C8]/10 to-transparent border border-[#27B7C8]/20 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#27B7C8]/15">
              <Lightbulb className="w-5 h-5 text-[#27B7C8]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-foreground">Grow Your Income</h2>
              <p className="text-xs text-muted-foreground">From idea to income in record time</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your 9-to-5 pays the bills. Your side hustle builds wealth.
            Use AI to find the right niche, follow proven step-by-step guides, and track your earnings as they grow.
          </p>
        </motion.div>

        {/* Tools */}
        <div>
          <h2 className="text-lg font-serif font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#27B7C8]" />
            Hustle Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HUSTLE_TOOLS.map((item, i) => {
              const isComingSoon = item.tag === "Coming Soon";
              const Wrapper = isComingSoon ? "div" : Link;
              const wrapperProps = isComingSoon ? {} : { href: item.href };

              return (
                <Wrapper key={item.title} {...(wrapperProps as any)}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileTap={isComingSoon ? {} : { scale: 0.97 }}
                    whileHover={isComingSoon ? {} : { y: -3 }}
                    onClick={() => !isComingSoon && haptic()}
                    className={`bg-card border border-border rounded-2xl p-5 h-full transition-colors ${
                      isComingSoon ? "opacity-60" : "cursor-pointer hover:border-border/60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${item.color}15` }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                        item.tag === "AI Tool" ? "text-[#27B7C8]" : "text-muted-foreground"
                      }`}>
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    {!isComingSoon && (
                      <div className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: item.color }}>
                        {item.isPro && !isPro ? "Pro Feature" : "Open"} <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </motion.div>
                </Wrapper>
              );
            })}
          </div>
        </div>

        <AdMobBanner format="rectangle" />

        {/* Hustle Ideas */}
        <div>
          <h2 className="text-lg font-serif font-bold text-foreground mb-4">Popular Side Hustles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HUSTLE_IDEAS.map((idea, i) => (
              <motion.div
                key={idea.title}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-foreground">{idea.title}</h4>
                  <p className="text-xs text-muted-foreground">{idea.time}</p>
                </div>
                <span className="text-xs font-semibold text-[#49B06E]">{idea.income}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AcademyLayout>
  );
}
