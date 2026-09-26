import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layers, TrendingUp, ArrowRight,
  CheckCircle, Star, Zap, Shield,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { AdMobBanner } from "@/components/AdMobBanner";
import { AcademyToolCard } from "@/components/academy/AcademyToolCard";
import { ACADEMY_TOOLS } from "@/data/academy/tools";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Toaster } from "@/components/ui/toaster";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const PILLARS = [
  {
    icon: TrendingUp,
    title: "Learn to Trade",
    description: "Master investing from scratch. 150+ lessons, paper trading simulator, and AI-powered stock analysis.",
    href: "/academy/trade",
    color: "#A78BFA",
  },
  {
    icon: Layers,
    title: "Pattern Library",
    description: "24 chart and momentum patterns with interactive visuals, stages, entry concepts, and common mistakes.",
    href: "/academy/patterns",
    color: "#27B7C8",
  },
];

const PRICING_FEATURES = [
  "All 13 AI-powered tools",
  "Unlimited stock analysis",
  "Portfolio X-Ray & risk assessment",
  "Smart alerts & earnings tracker",
  "AI research reports",
  "24 pattern library guides",
  "Strategy condition breakdowns",
  "Paper trading simulator",
  "No ads",
];

export default function AcademyLanding() {
  const { isPaid, isLoggedIn } = useSubscription();

  return (
    <>
      <SEO
        title="Radar Academy — Financial Education & AI Tools"
        description="Master budgeting, side hustles, and investing with 13 AI-powered tools. Your complete financial education platform."
        url="https://academy.shebloomswealth.app"
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4 max-w-7xl mx-auto">
            <Link href="/academy" className="flex items-center gap-2">
              <img src="/icon-192.png" alt="Radar" className="h-7 w-auto rounded-md" />
              <span className="font-serif text-lg font-bold text-foreground">
                Radar <span className="text-[#27B7C8]">Academy</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/home" className="text-sm text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                Main App
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/academy/dashboard"
                  className="bg-[#27B7C8] hover:bg-[#27B7C8]/90 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/onboarding"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
                >
                  Get Started Free
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#27B7C8]/5 via-transparent to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#27B7C8]/10 border border-[#27B7C8]/20 rounded-full px-4 py-1.5 mb-6">
                <Zap className="w-3.5 h-3.5 text-[#27B7C8]" />
                <span className="text-xs font-semibold text-[#27B7C8]">13 AI-Powered Tools Inside</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4 leading-tight">
                Your Complete Financial<br />
                <span className="text-[#27B7C8]">Education Platform</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                Learn to trade with confidence &mdash; structured lessons, 24 pattern guides, and AI-powered tools built for women who want financial freedom.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href={isLoggedIn ? "/academy/dashboard" : "/onboarding"}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => haptic()}
                    className="bg-[#27B7C8] hover:bg-[#27B7C8]/90 text-white px-8 py-3 rounded-full text-base font-semibold transition-colors flex items-center gap-2"
                  >
                    {isLoggedIn ? "Go to Dashboard" : "Get Started"}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link href="#tools">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => haptic()}
                    className="border border-border hover:border-[#27B7C8]/30 text-foreground px-8 py-3 rounded-full text-base font-medium transition-colors"
                  >
                    Explore Tools
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <AdMobBanner format="banner" />

        {/* Three Pillars */}
        <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
              Learn at Your Own Pace
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From your first trade to advanced pattern recognition — structured lessons and visual guides to build confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PILLARS.map((pillar, i) => (
              <Link key={pillar.title} href={pillar.href}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ y: -4 }}
                  onClick={() => haptic()}
                  className="bg-card border border-border rounded-2xl p-6 h-full cursor-pointer hover:border-border/60 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${pillar.color}15` }}
                  >
                    <pillar.icon className="w-6 h-6" style={{ color: pillar.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold" style={{ color: pillar.color }}>
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Tools Grid */}
        <section id="tools" className="bg-card/30 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
                <Star className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Pro Tools</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
                13 AI-Powered Investment Tools
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Professional-grade analysis powered by artificial intelligence. From stock screening to portfolio risk management.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACADEMY_TOOLS.map((tool, i) => (
                <AcademyToolCard key={tool.slug} tool={tool} isPaid={isPaid} index={i} />
              ))}
            </div>
          </div>
        </section>

        <AdMobBanner format="rectangle" />

        {/* Pricing */}
        <section className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground">Start free. Upgrade anytime.</p>
          </div>
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border-2 border-[#27B7C8]/30 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-[#27B7C8] text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                Best Value
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground mb-1">Radar Desk</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">$7.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">or $69/year (save 28%)</p>
              </div>
              <ul className="space-y-3 mb-8">
                {PRICING_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={isLoggedIn ? "/subscription" : "/onboarding"}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => haptic()}
                  className="w-full bg-gradient-to-r from-primary to-[#27B7C8] text-white py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  {isLoggedIn ? (isPaid ? "You're Subscribed" : "Upgrade Now") : "Get Started"}
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="border-t border-border bg-card/30">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div>
                <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="text-sm font-bold text-foreground mb-1">Educational Only</h4>
                <p className="text-xs text-muted-foreground">Not financial advice. All investing involves risk.</p>
              </div>
              <div>
                <Star className="w-8 h-8 text-[#27B7C8] mx-auto mb-3" />
                <h4 className="text-sm font-bold text-foreground mb-1">Built for Women</h4>
                <p className="text-xs text-muted-foreground">Plain language, no jargon, judgment-free learning.</p>
              </div>
              <div>
                <Zap className="w-8 h-8 text-[#A78BFA] mx-auto mb-3" />
                <h4 className="text-sm font-bold text-foreground mb-1">AI-Powered</h4>
                <p className="text-xs text-muted-foreground">Institutional-grade analysis accessible to everyone.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-background py-8">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <h3 className="mb-3 font-serif text-lg font-semibold text-[#27B7C8]">Radar Academy</h3>
                <p className="text-sm text-muted-foreground">
                  Your complete trading education platform. Learn patterns, master setups, trade confidently.
                </p>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold text-foreground">Sections</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/academy/trade" className="text-muted-foreground hover:text-primary">Learn to Trade</Link></li>
                  <li><Link href="/academy/patterns" className="text-muted-foreground hover:text-primary">Pattern Library</Link></li>
                  <li><Link href="/academy/tools" className="text-muted-foreground hover:text-primary">AI Tools</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold text-foreground">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                  <li><Link href="/disclaimer" className="text-muted-foreground hover:text-primary">Disclaimer</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-6 border-t border-border pt-6">
              <p className="text-xs text-muted-foreground">
                &copy; 2026 Cinder Vault Enterprises LLC. All rights reserved. Radar Academy is for educational purposes only.
              </p>
            </div>
          </div>
        </footer>

        <Toaster />
      </div>
    </>
  );
}
