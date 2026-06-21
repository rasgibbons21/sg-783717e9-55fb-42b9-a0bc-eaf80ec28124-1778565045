import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

/* ─── palette ──────────────────────────────────────────────────────────────── */
const C = {
  deep:    "#0E1B30",
  surface: "#16264A",
  brand:   "#1E2C6B",
  teal:    "#27B7C8",
  green:   "#49B06E",
  ivory:   "#F4F7FA",
};

const gradientText: React.CSSProperties = {
  background: `linear-gradient(90deg, ${C.teal}, ${C.green})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const gradientBg: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.teal}, ${C.green})`,
};

/* ─── component ─────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthAndRedirect = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", session.user.id)
        .single();
      if (profile?.onboarding_complete) { router.push("/home"); return; }
    }
    setIsCheckingAuth(false);
  };

  if (isCheckingAuth) {
    return (
      <div style={{ background: C.deep }} className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: C.teal, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="She Blooms Wealth — Investing Education for Women"
        description="Learn how money really works. Pansy, your AI education guide, helps women build investing confidence one lesson at a time."
      />

      <div style={{ background: C.deep, color: C.ivory }} className="min-h-screen font-sans">

        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <nav
          className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
          style={{ background: `${C.deep}f0`, backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2.5">
            <Image src="/bloom-logo.png" alt="Bloom" width={36} height={36} className="rounded-full" />
            <span className="text-lg font-bold tracking-tight" style={{ color: C.ivory }}>
              She Blooms <span style={{ color: C.teal }}>Wealth</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/onboarding">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: C.ivory, border: `1px solid rgba(255,255,255,0.14)` }}
              >
                Sign in
              </button>
            </Link>
            <Link href="/onboarding">
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={gradientBg}
              >
                <span style={{ color: C.deep }}>Get started free</span>
              </button>
            </Link>
          </div>
        </nav>

        {/* ── 1. HERO ──────────────────────────────────────────────────────── */}
        <section className="flex flex-col md:flex-row items-center gap-10 px-6 py-20 md:px-12 md:py-28 max-w-6xl mx-auto">
          {/* Left copy */}
          <div className="flex-1 space-y-7">
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight tracking-tight">
              Understand today.<br />Invest tomorrow.<br />
              <span style={gradientText}>Bloom forever.</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-lg" style={{ color: "rgba(244,247,250,0.72)" }}>
              Bloom teaches women how money really works, so you can grow your wealth with confidence.
              One lesson, one step, one bloom at a time.
            </p>

            {/* Pansy intro bubble */}
            <div className="flex items-start gap-3">
              <Image src="/bloom-logo.png" alt="Pansy" width={40} height={40} className="rounded-full mt-0.5 shrink-0 bg-white" />
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
                style={{ background: `${C.surface}cc`, border: `1px solid rgba(255,255,255,0.08)`, color: "rgba(244,247,250,0.85)" }}
              >
                Hi, I&apos;m Pansy — I&apos;m here to help you understand money, markets, and investing in a way that finally makes sense. We&apos;re growing together.
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start gap-3 pt-1">
              <Link href="/onboarding">
                <button
                  className="px-7 py-3.5 rounded-xl text-base font-semibold shadow-lg"
                  style={{ ...gradientBg, color: "#0E1B30" }}
                >
                  Start Learning Free
                </button>
              </Link>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium" style={{ color: "rgba(244,247,250,0.50)" }}>
              <span>No experience needed</span>
              <span>·</span>
              <span>No confusing jargon</span>
              <span>·</span>
              <span>Learn at your pace</span>
            </div>
          </div>

          {/* Right image */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm">
              <div
                className="absolute inset-0 rounded-3xl blur-3xl opacity-25"
                style={{ background: `radial-gradient(circle at 50% 50%, ${C.teal}, transparent 70%)` }}
              />
              <Image
                src="/pansy-hero.png"
                alt="Pansy — your investing education guide"
                width={460}
                height={500}
                className="relative rounded-3xl object-cover w-full"
                priority
              />
            </div>
          </div>
        </section>

        {/* ── 2. COST OF NOT KNOWING ───────────────────────────────────────── */}
        <section style={{ background: C.surface }}>
          <div className="max-w-6xl mx-auto px-6 py-20 md:px-12">
            <div className="max-w-2xl mx-auto text-center space-y-4 mb-14">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: C.ivory }}>
                The cost of not knowing
              </h2>
              <p className="text-lg" style={{ color: "rgba(244,247,250,0.65)" }}>
                Not investing isn&apos;t the safe choice. Here&apos;s what the knowledge gap quietly costs.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: "📉",
                  title: "Inflation quietly erodes your money",
                  body: "Every year you hold cash, it buys a little less. Inflation is a silent tax on savings that don't grow.",
                },
                {
                  icon: "🐢",
                  title: "Savings grow slower than prices",
                  body: "A 0.5% savings rate can't keep up with 3–4% inflation. The gap between what you save and what things cost keeps widening.",
                },
                {
                  icon: "📈",
                  title: "Companies keep growing without you",
                  body: "Every day the market grows, people who invested in it build wealth. The ticker moves whether you're in it or not.",
                },
                {
                  icon: "⏳",
                  title: "Time is your greatest advantage — and it keeps moving",
                  body: "Compound growth is most powerful when you start early. Every year you wait is a year of compounding you can't get back.",
                },
                {
                  icon: "💡",
                  title: "The biggest risk isn't investing — it's never learning how",
                  body: "Fear of the market feels safe. But decades of missed growth is its own kind of loss. Knowledge is what breaks that cycle.",
                },
              ].map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl p-6 space-y-3"
                  style={{ background: "rgba(14,27,48,0.6)", border: `1px solid rgba(255,255,255,0.06)` }}
                >
                  <span className="text-2xl">{icon}</span>
                  <h3 className="font-semibold text-base" style={{ color: C.teal }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(244,247,250,0.62)" }}>{body}</p>
                </div>
              ))}

              {/* 6th cell — encouraging close */}
              <div
                className="rounded-2xl p-6 flex items-center justify-center text-center"
                style={{ background: `linear-gradient(135deg, ${C.teal}18, ${C.green}18)`, border: `1px solid ${C.teal}33` }}
              >
                <p className="text-base font-medium leading-relaxed" style={{ color: C.ivory }}>
                  Understanding markets is a skill — and every skill can be learned. That&apos;s exactly what Bloom is for.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. MEET PANSY ────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:px-12">
          <div className="flex flex-col md:flex-row items-start gap-14">
            {/* Image */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-xs">
                <div
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-20"
                  style={{ background: `radial-gradient(circle at 50% 60%, ${C.green}, transparent 70%)` }}
                />
                <Image
                  src="/pansy-coffee.png"
                  alt="Pansy, your AI investing education guide"
                  width={360}
                  height={420}
                  className="relative rounded-3xl object-cover w-full"
                />
              </div>
            </div>

            {/* Copy */}
            <div className="flex-1 space-y-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
                style={{ background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}30` }}
              >
                🌺 Meet your guide
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.ivory }}>
                Meet Pansy
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "rgba(244,247,250,0.72)" }}>
                I won&apos;t just hand you answers — I&apos;ll show you how to think for yourself.
              </p>

              <ul className="space-y-3">
                {[
                  "Understand stocks, ETFs, and how markets actually work",
                  "Read charts with confidence, not confusion",
                  "Understand what moves a stock and why",
                  "Manage risk the way experienced investors do",
                  "Build wealth the smart way, one habit at a time",
                  "Master your investing mindset and emotions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "rgba(244,247,250,0.80)" }}>
                    <span className="mt-0.5 shrink-0" style={{ color: C.green }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-base font-medium pt-2" style={{ color: C.teal }}>
                You don&apos;t have to do this alone. I&apos;ve got you.
              </p>

              <p className="text-xs" style={{ color: "rgba(244,247,250,0.35)" }}>
                Educational only. Not financial advice. Pansy never tells you what to buy or sell.
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. DAILY WITH PANSY ──────────────────────────────────────────── */}
        <section style={{ background: C.surface }}>
          <div className="max-w-6xl mx-auto px-6 py-20 md:px-12">
            <div className="text-center space-y-4 mb-14">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: C.ivory }}>
                Your day with Pansy
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(244,247,250,0.62)" }}>
                Five minutes a day builds the market intuition that takes most people years to develop.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: "☀️",
                  title: "Market Briefing",
                  body: "A warm, plain-English recap of what happened in the last session. No noise — just context you can actually use.",
                },
                {
                  icon: "📚",
                  title: "Today's Lesson",
                  body: "A structured concept — from ETF basics to reading earnings reports — delivered at your pace, not Wall Street's.",
                },
                {
                  icon: "💬",
                  title: "Pansy's Take",
                  body: "My read on what's actually moving markets right now and what it means for someone learning to invest.",
                },
                {
                  icon: "🌱",
                  title: "Wealth Habit",
                  body: "One small, repeatable action that compounds over time — the kind of habit that separates patient investors from reactive ones.",
                },
                {
                  icon: "🔍",
                  title: "One to Watch",
                  body: "A stock or ETF to study and understand — not to trade, but to practice reading a real business and its story.",
                },
              ].map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl p-6 space-y-3"
                  style={{ background: `${C.deep}cc`, border: `1px solid ${C.teal}18` }}
                >
                  <span className="text-2xl">{icon}</span>
                  <h3 className="font-semibold text-base" style={{ color: C.ivory }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(244,247,250,0.60)" }}>{body}</p>
                </div>
              ))}

              <Link href="/onboarding">
                <div
                  className="rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 h-full cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${C.teal}22, ${C.green}22)`, border: `1px solid ${C.green}33` }}
                >
                  <span className="text-3xl">🌺</span>
                  <p className="font-semibold" style={{ color: C.ivory }}>Start today — it&apos;s free</p>
                  <p className="text-sm" style={{ color: "rgba(244,247,250,0.55)" }}>No credit card needed</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 5. BLOOM MAKES LEARNING BEAUTIFUL ────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:px-12">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: C.ivory }}>
              Bloom makes learning beautiful
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(244,247,250,0.62)" }}>
              Finance tools are cold, cluttered, and built for people who already know everything.
              Bloom was designed from scratch for people who are just getting started.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: "🗣️",
                title: "Simple Language",
                body: "No jargon, no abbreviations, no assuming you know what a P/E ratio is. We explain everything like a smart friend would.",
                accent: C.teal,
              },
              {
                icon: "📊",
                title: "Real Examples",
                body: "Learn with real companies, real charts, real headlines. Abstract theory is replaced by hands-on practice with live market data.",
                accent: C.green,
              },
              {
                icon: "🪜",
                title: "Step by Step",
                body: "Every concept builds on the last. You're never dropped into the deep end — the curriculum is built to carry you forward.",
                accent: C.teal,
              },
              {
                icon: "🛠️",
                title: "Practical Tools",
                body: "Stock research, portfolio tracking, a market briefing — not just lessons, but the actual tools that put knowledge into practice.",
                accent: C.green,
              },
              {
                icon: "👩",
                title: "Built for Women",
                body: "Designed with the reality of women's financial lives in mind — career gaps, caregiving, different risk timelines and goals.",
                accent: C.teal,
              },
              {
                icon: "💰",
                title: "Grow Your Wealth",
                body: "The end goal isn't just knowledge — it's a life where you make confident, informed decisions about money that compound over time.",
                accent: C.green,
              },
            ].map(({ icon, title, body, accent }) => (
              <div
                key={title}
                className="rounded-2xl p-6 space-y-3"
                style={{ background: C.surface, border: `1px solid ${accent}22` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="w-6 h-0.5 rounded-full" style={{ background: accent }} />
                </div>
                <h3 className="font-semibold text-base" style={{ color: C.ivory }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(244,247,250,0.60)" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. PHONE MOCKUP ──────────────────────────────────────────────── */}
        <section style={{ background: C.surface }}>
          <div className="max-w-6xl mx-auto px-6 py-20 md:px-12">
            <div className="flex flex-col md:flex-row items-center gap-14">
              {/* Phone frame */}
              <div className="flex-1 flex justify-center">
                <div
                  className="relative w-[260px] rounded-[2.5rem] p-[3px] shadow-2xl"
                  style={{ background: `linear-gradient(145deg, ${C.teal}66, ${C.green}44)` }}
                >
                  <div
                    className="rounded-[2.3rem] overflow-hidden"
                    style={{ background: C.deep }}
                  >
                    {/* Status bar */}
                    <div className="h-10 flex items-center justify-between px-6 pt-2">
                      <span className="text-[10px]" style={{ color: "rgba(244,247,250,0.4)" }}>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: `rgba(244,247,250,0.3)` }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: `rgba(244,247,250,0.3)` }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }} />
                      </div>
                    </div>

                    {/* App content */}
                    <div className="px-5 pb-8 pt-2 space-y-4">
                      {/* Greeting */}
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "rgba(244,247,250,0.45)" }}>Welcome back</p>
                        <p className="text-base font-bold" style={{ color: C.ivory }}>Today in markets</p>
                      </div>

                      {/* Briefing card */}
                      <div
                        className="rounded-2xl p-3 space-y-2"
                        style={{ background: C.surface, border: `1px solid ${C.teal}25` }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">☕</span>
                          <p className="text-xs font-semibold" style={{ color: C.teal }}>Market Briefing</p>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(244,247,250,0.72)" }}>
                          The latest session was a mixed story — tech steadied, while energy pulled back on softer demand signals. Volatility stayed calm.
                        </p>
                      </div>

                      {/* Pansy thought */}
                      <div className="flex items-start gap-2">
                        <Image src="/bloom-logo.png" alt="Pansy" width={24} height={24} className="rounded-full mt-0.5 bg-white shrink-0" />
                        <div
                          className="rounded-xl rounded-tl-sm px-3 py-2"
                          style={{ background: `${C.brand}80` }}
                        >
                          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(244,247,250,0.80)" }}>
                            Mixed sessions like this are normal — they&apos;re where a patient investor simply waits and learns.
                          </p>
                        </div>
                      </div>

                      {/* Lesson pill */}
                      <div
                        className="rounded-xl px-3 py-2 flex items-center justify-between"
                        style={{ background: `${C.green}18`, border: `1px solid ${C.green}30` }}
                      >
                        <div>
                          <p className="text-[10px]" style={{ color: "rgba(244,247,250,0.45)" }}>Today&apos;s lesson</p>
                          <p className="text-xs font-semibold" style={{ color: C.ivory }}>How to read a P/E ratio</p>
                        </div>
                        <span className="text-base">📚</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right copy */}
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.ivory }}>
                  Everything you need,<br />
                  <span style={gradientText}>right in your pocket</span>
                </h2>
                <p className="text-lg leading-relaxed" style={{ color: "rgba(244,247,250,0.68)" }}>
                  Market briefings, guided lessons, Pansy&apos;s real-time explanations — all in one place, built to fit into five minutes of your morning.
                </p>
                <ul className="space-y-3">
                  {[
                    "Plain-English market context every session",
                    "Lessons that build on each other over time",
                    "Ask Pansy anything — she never judges the question",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "rgba(244,247,250,0.75)" }}>
                      <span style={{ color: C.green }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding">
                  <button
                    className="mt-2 px-7 py-3.5 rounded-xl text-base font-semibold shadow-lg"
                    style={{ ...gradientBg, color: C.deep }}
                  >
                    Start Learning Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. CLOSING CTA BAND ──────────────────────────────────────────── */}
        <section style={{ background: C.brand }}>
          <div className="max-w-3xl mx-auto px-6 py-24 md:px-12 text-center space-y-8">
            <p className="text-4xl">🌺</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: C.ivory }}>
              The best time to learn was years ago.<br />
              <span style={gradientText}>The second-best time is today.</span>
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/onboarding">
                <button
                  className="px-8 py-4 rounded-xl text-base font-semibold shadow-xl"
                  style={{ ...gradientBg, color: C.deep }}
                >
                  Start Learning Free
                </button>
              </Link>
              <Link href="/subscription" className="text-sm font-medium" style={{ color: "rgba(244,247,250,0.55)" }}>
                Explore Bloom Pro
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs" style={{ color: "rgba(244,247,250,0.45)" }}>
              <span>🔒 Secure &amp; Private</span>
              <span>·</span>
              <span>📚 Educational Platform — Not Financial Advice</span>
              <span>·</span>
              <span>🌸 Trusted by Women</span>
            </div>

            {/* Pansy sign-off */}
            <p className="text-sm italic pt-4" style={{ color: "rgba(244,247,250,0.40)" }}>
              &ldquo;Knowledge is the seed. Confidence is the bloom. Wealth is the harvest.&rdquo; — Pansy
            </p>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer style={{ background: C.deep, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/bloom-logo.png" alt="Bloom" width={24} height={24} className="rounded-full bg-white" />
              <p className="text-sm font-semibold" style={{ color: "rgba(244,247,250,0.45)" }}>She Blooms Wealth</p>
            </div>
            <p className="text-xs text-center" style={{ color: "rgba(244,247,250,0.28)" }}>
              For educational purposes only. Not financial advice. Investing involves risk including possible loss of principal.
            </p>
            <div className="flex gap-5 text-sm" style={{ color: "rgba(244,247,250,0.38)" }}>
              <Link href="/onboarding" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/onboarding" className="hover:text-white transition-colors">Sign up</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
