import { useState } from "react";
import Head from "next/head";
import {
  ArrowRight,
  BarChart3,
  Brain,
  TrendingUp,
  Shield,
  BookOpen,
  Zap,
  Target,
  PieChart,
  Bell,
  LineChart,
  Search,
  Newspaper,
  Menu,
  X,
  Check,
  ChevronRight,
  Star,
  Sparkles,
  GraduationCap,
  Rocket,
  Award,
} from "lucide-react";

/* ─── Palette ────────────────────────────────────────────────────────────── */
const C = {
  teal: "#34DAC2",
  tealDark: "#2AB8A3",
  charcoal: "#25262F",
  charcoalLight: "#2E2F3A",
  charcoalDark: "#1a1b22",
  white: "#FFFFFF",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
  },
};

/* ─── Tool Data ──────────────────────────────────────────────────────────── */
const TOOLS = [
  {
    icon: Brain,
    name: "AI Stock Analyzer",
    desc: "Deep fundamental + technical analysis powered by AI. Get instant insights on any ticker.",
    tag: "Most Popular",
  },
  {
    icon: Search,
    name: "Smart Screener",
    desc: "Filter thousands of stocks by 50+ criteria. Find hidden gems before the crowd.",
  },
  {
    icon: PieChart,
    name: "Portfolio X-Ray",
    desc: "See your real diversification, risk exposure, and sector overlap in seconds.",
  },
  {
    icon: Shield,
    name: "Risk Assessment",
    desc: "Understand your downside before you invest. Stress-test against historical crashes.",
  },
  {
    icon: TrendingUp,
    name: "Technical Charts",
    desc: "Professional charting with 80+ indicators, pattern recognition, and AI annotations.",
  },
  {
    icon: BarChart3,
    name: "Market Sentiment",
    desc: "Real-time fear & greed, social buzz, and institutional flow in one dashboard.",
  },
  {
    icon: BookOpen,
    name: "Earnings Tracker",
    desc: "Never miss an earnings date. AI-predicted beats/misses with historical accuracy.",
  },
  {
    icon: Bell,
    name: "Smart Alerts",
    desc: "Price, volume, and news alerts that actually matter. Zero noise, all signal.",
  },
  {
    icon: LineChart,
    name: "Sector Rotation",
    desc: "Track capital flows across sectors. Know where the smart money is moving.",
  },
  {
    icon: Zap,
    name: "Options Flow",
    desc: "See unusual options activity and large block trades as they happen.",
  },
  {
    icon: Rocket,
    name: "IPO Tracker",
    desc: "Track upcoming IPOs, lockup expirations, and post-IPO performance analytics.",
  },
  {
    icon: Target,
    name: "Watchlist Builder",
    desc: "Organize, tag, and monitor your ideas. AI alerts when your targets are ready.",
  },
  {
    icon: Newspaper,
    name: "AI Research Reports",
    desc: "Institutional-grade research reports generated in seconds. Save hours of analysis.",
    tag: "New",
  },
];

/* ─── Journey Steps ──────────────────────────────────────────────────────── */
const JOURNEY = [
  {
    step: 1,
    icon: Sparkles,
    title: "Create Your Free Account",
    desc: "Sign up in 30 seconds. No credit card required. Start exploring immediately.",
  },
  {
    step: 2,
    icon: Target,
    title: "Set Your Goals",
    desc: "Tell us what you want to achieve — income, growth, or learning. We personalize your experience.",
  },
  {
    step: 3,
    icon: Brain,
    title: "Explore AI Tools",
    desc: "Dive into 13 powerful tools. Analyze stocks, screen opportunities, and track markets with AI at your side.",
  },
  {
    step: 4,
    icon: GraduationCap,
    title: "Learn As You Go",
    desc: "Every tool teaches you something new. Bloom Academy modules build your knowledge alongside your portfolio.",
  },
  {
    step: 5,
    icon: Award,
    title: "Grow With Confidence",
    desc: "Make informed decisions backed by data, not guesswork. Watch your skills and portfolio bloom together.",
  },
];

/* ─── Pricing ────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Everything you need to start learning",
    features: [
      "3 AI analyses per day",
      "Basic stock screener",
      "Watchlist (up to 10 stocks)",
      "Bloom Academy basics",
      "Daily market brief",
      "Community access",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    desc: "For active learners and investors",
    features: [
      "Unlimited AI analyses",
      "Advanced screener (50+ filters)",
      "Portfolio X-Ray",
      "Smart Alerts (unlimited)",
      "Full Bloom Academy",
      "Options flow data",
      "Sector rotation dashboard",
      "Priority support",
    ],
    cta: "Start 7-Day Free Trial",
    popular: true,
  },
  {
    name: "Premium",
    price: "$49",
    period: "/mo",
    desc: "Institutional-grade tools for serious investors",
    features: [
      "Everything in Pro",
      "AI Research Reports",
      "Real-time options flow",
      "IPO analytics",
      "API access",
      "Custom screener alerts",
      "1-on-1 onboarding call",
      "White-glove support",
    ],
    cta: "Start 7-Day Free Trial",
    popular: false,
  },
];

/* ─── Testimonials ───────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: "I went from being terrified of the stock market to confidently analyzing my own picks. Bloom Labs changed everything for me.",
    name: "Sarah K.",
    role: "Retail Investor",
    rating: 5,
  },
  {
    quote: "The AI Stock Analyzer alone is worth the subscription. It catches things I would have missed every single time.",
    name: "Michelle T.",
    role: "Day Trader",
    rating: 5,
  },
  {
    quote: "Finally, a platform that teaches you while you use it. I learn something new every day without even trying.",
    name: "Priya R.",
    role: "Long-term Investor",
    rating: 5,
  },
];

/* ─── FAQ ─────────────────────────────────────────────────────────────────── */
const FAQS = [
  {
    q: "Is Bloom Labs free to use?",
    a: "Yes! Our Starter plan is completely free with no credit card required. You get 3 AI analyses per day, basic screening, and access to Bloom Academy fundamentals.",
  },
  {
    q: "Does Bloom Labs give financial advice?",
    a: "No. Bloom Labs is an educational and analytical platform. We provide data, tools, and learning resources to help you make your own informed decisions. We are not financial advisors.",
  },
  {
    q: "What makes Bloom Labs different from other stock tools?",
    a: "We combine AI-powered analysis with built-in education. Every tool teaches you something. Plus, our AI doesn't just give you numbers — it explains what they mean and why they matter.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. No contracts, no commitments. Cancel your Pro or Premium plan at any time and keep access through the end of your billing period.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. We use bank-level encryption, never sell your data, and are SOC 2 compliant. Your portfolio and personal information are protected at every level.",
  },
];

/* ─── Components ─────────────────────────────────────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Tools", href: "#tools" },
    { label: "How It Works", href: "#journey" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      style={{ background: "rgba(37,38,47,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-teal flex items-center justify-center">
              <Sparkles size={18} color={C.charcoal} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Bloom<span className="text-teal"> Labs</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.label} href={l.href}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="#pricing"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </a>
            <a href="#pricing"
              className="bg-gradient-teal text-charcoal text-sm font-semibold px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-teal/20 transition-all hover:-translate-y-0.5">
              Get Started Free
            </a>
          </div>

          <button className="md:hidden text-gray-400" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 border-t border-white/5 mt-2 pt-4">
            {links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
            <a href="#pricing" onClick={() => setOpen(false)}
              className="block mt-3 text-center bg-gradient-teal text-charcoal text-sm font-semibold px-5 py-2.5 rounded-lg">
              Get Started Free
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${C.teal}12 0%, transparent 60%),
                       radial-gradient(ellipse 60% 40% at 80% 20%, ${C.teal}08 0%, transparent 50%),
                       linear-gradient(180deg, ${C.charcoal} 0%, ${C.charcoalDark} 100%)`
        }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-8 border border-teal/20"
            style={{ background: `${C.teal}10`, color: C.teal }}>
            <Sparkles size={13} />
            AI-Powered Investing Tools
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="text-white">Invest smarter with</span>
            <br />
            <span className="text-gradient">AI that explains why</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            13 AI-powered tools that analyze stocks, screen opportunities, and teach you as you go.
            Built for investors who want to understand, not just follow.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a href="#pricing"
              className="w-full sm:w-auto bg-gradient-teal text-charcoal text-base font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-teal/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
              Start Free — No Credit Card
              <ArrowRight size={18} />
            </a>
            <a href="#tools"
              className="w-full sm:w-auto text-base font-semibold px-8 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              Explore 13 Tools
              <ChevronRight size={18} />
            </a>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-charcoal"
                    style={{ background: `hsl(${160 + i * 20}, 50%, ${35 + i * 5}%)` }} />
                ))}
              </div>
              <span className="ml-2 font-medium text-gray-400">12,400+ investors</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} fill={C.teal} color={C.teal} />
              ))}
              <span className="ml-1.5 font-medium text-gray-400">4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Hero visual — floating tool cards */}
        <div className="relative mt-16 max-w-5xl mx-auto hidden lg:block">
          <div className="grid grid-cols-3 gap-4">
            {TOOLS.slice(0, 3).map((tool, i) => (
              <div key={tool.name}
                className="glass rounded-2xl p-5 hover:border-teal/20 transition-all"
                style={{ animation: `float ${5 + i * 0.8}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${C.teal}15` }}>
                    <tool.icon size={18} color={C.teal} />
                  </div>
                  <span className="text-sm font-semibold text-white">{tool.name}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section id="tools" className="relative py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 border border-teal/20"
            style={{ background: `${C.teal}10`, color: C.teal }}>
            13 AI-Powered Tools
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
            Everything you need to
            <br />
            <span className="text-gradient">invest with clarity</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Professional-grade analysis tools that don&apos;t just give you numbers — they explain what the numbers mean.
          </p>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {TOOLS.map((tool) => (
            <div key={tool.name}
              className="group glass rounded-2xl p-6 hover:border-teal/20 transition-all duration-300 hover:-translate-y-1 cursor-default">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: `${C.teal}12` }}>
                  <tool.icon size={20} color={C.teal} />
                </div>
                {tool.tag && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: tool.tag === "New" ? `${C.teal}15` : "rgba(255,255,255,0.06)",
                      color: tool.tag === "New" ? C.teal : C.gray[400],
                    }}>
                    {tool.tag}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{tool.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section id="journey" className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${C.teal}06 0%, transparent 70%)`
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 border border-teal/20"
            style={{ background: `${C.teal}10`, color: C.teal }}>
            Your Journey
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
            From zero to confident
            <br />
            <span className="text-gradient">in 5 simple steps</span>
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            We don&apos;t just hand you tools — we guide you through the entire process of becoming a smarter investor.
          </p>
        </div>

        {/* Journey steps */}
        <div className="max-w-4xl mx-auto">
          {JOURNEY.map((item, i) => (
            <div key={item.step} className="relative flex gap-6 md:gap-10 pb-12 last:pb-0">
              {/* Connector line */}
              {i < JOURNEY.length - 1 && (
                <div className="absolute left-[23px] md:left-[27px] top-14 w-px bottom-0"
                  style={{ background: `linear-gradient(180deg, ${C.teal}40, ${C.teal}08)` }} />
              )}

              {/* Step number */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: `${C.teal}12`, border: `1px solid ${C.teal}25` }}>
                  <item.icon size={22} color={C.teal} />
                </div>
              </div>

              {/* Content */}
              <div className="glass rounded-2xl p-6 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: C.teal }}>
                    Step {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5">
            Loved by <span className="text-gradient">thousands of investors</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-7">
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} fill={C.teal} color={C.teal} />
                ))}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="relative py-20 md:py-32">
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 80% 50% at 50% 50%, ${C.teal}06 0%, transparent 70%)`
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 border border-teal/20"
            style={{ background: `${C.teal}10`, color: C.teal }}>
            Simple Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
            Start free, upgrade
            <br />
            <span className="text-gradient">when you&apos;re ready</span>
          </h2>
          <p className="text-lg text-gray-400">
            No hidden fees. No surprise charges. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div key={plan.name}
              className={`relative rounded-2xl p-7 transition-all ${
                plan.popular
                  ? "border-2 border-teal/40 bg-charcoal-light/50"
                  : "glass"
              }`}
              style={plan.popular ? {
                background: `linear-gradient(180deg, ${C.teal}08, transparent)`,
                boxShadow: `0 0 60px ${C.teal}10`,
              } : undefined}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-teal text-charcoal text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <Check size={16} className="shrink-0 mt-0.5" color={C.teal} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                  plan.popular
                    ? "bg-gradient-teal text-charcoal hover:shadow-lg hover:shadow-teal/20 hover:-translate-y-0.5"
                    : "border border-white/10 text-white hover:bg-white/5"
                }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          All plans include SSL encryption, SOC 2 compliance, and 99.9% uptime SLA.
        </p>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                <ChevronRight
                  size={18}
                  className={`shrink-0 text-gray-500 transition-transform ${
                    openIdx === i ? "rotate-90" : ""
                  }`}
                />
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative glass rounded-3xl p-10 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse 60% 80% at 50% 120%, ${C.teal}15 0%, transparent 70%)`
          }} />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
              Ready to invest with
              <br />
              <span className="text-gradient">confidence?</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8">
              Join 12,400+ investors who use Bloom Labs to make smarter decisions every day. Start free, upgrade when you&apos;re ready.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#pricing"
                className="w-full sm:w-auto bg-gradient-teal text-charcoal text-base font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:shadow-teal/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight size={18} />
              </a>
            </div>
            <p className="text-xs text-gray-600 mt-6">No credit card required. Free plan available forever.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-teal flex items-center justify-center">
                <Sparkles size={14} color={C.charcoal} strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold text-white">Bloom Labs</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              AI-powered investing tools that teach you as you grow.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Product</h4>
            <ul className="space-y-2">
              {["AI Analyzer", "Screener", "Portfolio X-Ray", "Pricing"].map((l) => (
                <li key={l}>
                  <a href="#tools" className="text-xs text-gray-500 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Legal</h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Disclaimer", "Security"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-2">
          <p className="text-xs text-gray-700">
            &copy; {new Date().getFullYear()} Cinder Vault Enterprises LLC. All rights reserved. Bloom Labs is a product of Cinder Vault Enterprises LLC.
          </p>
          <p className="text-xs text-gray-800">
            Bloom Labs is for educational and informational purposes only and does not constitute financial advice.
            All investing involves risk of loss, including possible loss of principal. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <Head>
        <title>Bloom Labs — AI-Powered Investing Tools</title>
        <meta name="description" content="13 AI-powered tools that analyze stocks, screen opportunities, and teach you as you go. Built for investors who want to understand, not just follow." />
        <meta property="og:title" content="Bloom Labs — AI-Powered Investing Tools" />
        <meta property="og:description" content="Invest smarter with AI that explains why. 13 tools for stock analysis, screening, and portfolio management." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bloom Labs — AI-Powered Investing Tools" />
        <meta name="twitter:description" content="Invest smarter with AI that explains why. 13 tools for stock analysis, screening, and portfolio management." />
      </Head>

      <div className="min-h-screen bg-charcoal">
        <Navbar />
        <HeroSection />
        <ToolsSection />
        <JourneySection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
