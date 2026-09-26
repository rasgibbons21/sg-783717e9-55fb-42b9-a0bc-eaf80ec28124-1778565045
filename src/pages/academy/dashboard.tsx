import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet, Lightbulb, TrendingUp, ArrowRight,
  BookOpen, Target, Sparkles,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { AcademyLayout } from "@/components/academy/AcademyLayout";
import { AcademyToolCard } from "@/components/academy/AcademyToolCard";
import { ACADEMY_TOOLS } from "@/data/academy/tools";
import { useSubscription } from "@/contexts/SubscriptionContext";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const SECTIONS = [
  {
    icon: Wallet,
    title: "Budget",
    desc: "Track expenses, set savings goals, and take control of your money.",
    href: "/academy/budget",
    color: "#49B06E",
    stat: "Budget Tracker",
  },
  {
    icon: Lightbulb,
    title: "Side Hustle",
    desc: "Find your niche, plan your launch, and grow your income streams.",
    href: "/academy/hustle",
    color: "#27B7C8",
    stat: "Niche Finder",
  },
  {
    icon: TrendingUp,
    title: "Learn to Trade",
    desc: "150+ lessons, paper trading, and AI-powered analysis tools.",
    href: "/academy/trade",
    color: "#A78BFA",
    stat: "150+ Lessons",
  },
];

export default function AcademyDashboard() {
  const router = useRouter();
  const { isLoggedIn, isLoading, isPaid, userName } = useSubscription();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/onboarding?redirect=/academy/dashboard");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn) return null;

  const featuredTools = ACADEMY_TOOLS.slice(0, 6);
  const firstName = userName?.split(" ")[0] || "there";

  return (
    <AcademyLayout>
      <SEO
        title="Dashboard — Radar Academy"
        description="Your Radar Academy dashboard. Access budgeting tools, side hustle guides, and AI-powered investment analysis."
      />

      <div className="p-4 md:p-6 space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#27B7C8]/10 to-primary/10 border border-[#27B7C8]/20 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-1">
                Hey {firstName}!
              </h1>
              <p className="text-sm text-muted-foreground">
                Ready to level up your finances today?
              </p>
            </div>
            <Sparkles className="w-8 h-8 text-[#27B7C8] opacity-50" />
          </div>
          {!isPaid && (
            <Link href="/subscription">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => haptic()}
                className="mt-4 bg-gradient-to-r from-primary to-[#27B7C8] text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Upgrade to Pro for full access
              </motion.button>
            </Link>
          )}
        </motion.div>

        {/* Section Cards */}
        <div>
          <h2 className="text-lg font-serif font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#27B7C8]" />
            Your Learning Paths
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SECTIONS.map((section, i) => (
              <Link key={section.title} href={section.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 24 }}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ y: -3 }}
                  onClick={() => haptic()}
                  className="bg-card border border-border rounded-2xl p-5 h-full cursor-pointer hover:border-border/60 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${section.color}15` }}
                  >
                    <section.icon className="w-5 h-5" style={{ color: section.color }} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1">{section.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{section.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: section.color }}>
                      {section.stat}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Tools */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-[#27B7C8]" />
              Featured AI Tools
            </h2>
            <Link
              href="/academy/tools"
              className="text-xs font-semibold text-[#27B7C8] hover:text-[#27B7C8]/80 transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTools.map((tool, i) => (
              <AcademyToolCard key={tool.slug} tool={tool} isPaid={isPaid} index={i} />
            ))}
          </div>
        </div>
      </div>
    </AcademyLayout>
  );
}
