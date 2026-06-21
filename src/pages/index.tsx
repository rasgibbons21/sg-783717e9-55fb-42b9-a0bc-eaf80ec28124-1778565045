import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0E1B30" }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#27B7C8] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="She Blooms Wealth — Investing Education for Women"
        description="Learn to invest with confidence. Pansy, your AI education guide, makes markets make sense — one lesson at a time."
      />

      <div className="min-h-screen font-sans" style={{ background: "#0E1B30", color: "#F4F7FA" }}>

        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 md:px-12" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-xl font-bold tracking-tight" style={{ color: "#F4F7FA" }}>
            She Blooms <span style={{ color: "#27B7C8" }}>Wealth</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <button
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "#F4F7FA", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                Sign in
              </button>
            </Link>
            <Link href="/auth/signup">
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "#27B7C8", color: "#0E1B30" }}
              >
                Get started free
              </button>
            </Link>
          </div>
        </nav>

        {/* 1 — Hero */}
        <section className="flex flex-col md:flex-row items-center gap-10 px-6 py-20 md:px-12 md:py-28 max-w-6xl mx-auto">
          <div className="flex-1 space-y-7">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
              style={{ background: "rgba(39,183,200,0.12)", color: "#27B7C8", border: "1px solid rgba(39,183,200,0.25)" }}
            >
              🌺 Investing education for women
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{ color: "#F4F7FA" }}>
              The market isn&apos;t a boys&apos;<br />
              <span style={{ color: "#27B7C8" }}>club anymore.</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-xl" style={{ color: "rgba(244,247,250,0.72)" }}>
              She Blooms Wealth gives you the knowledge to understand what you&apos;re investing in — and why.
              No jargon. No pressure. Just real education, built for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/auth/signup">
                <button
                  className="px-7 py-3.5 rounded-xl text-base font-semibold shadow-lg"
                  style={{ background: "#49B06E", color: "#F4F7FA" }}
                >
                  Start learning free →
                </button>
              </Link>
              <Link href="/auth/login">
                <button
                  className="px-7 py-3.5 rounded-xl text-base font-medium"
                  style={{ color: "rgba(244,247,250,0.72)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  Already a member? Sign in
                </button>
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm">
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
                style={{ background: "radial-gradient(circle at 50% 50%, #27B7C8, transparent 70%)" }}
              />
              <Image
                src="/pansy-hero.png"
                alt="Pansy, your AI investing education guide"
                width={440}
                height={480}
                className="relative rounded-3xl object-cover w-full"
                priority
              />
            </div>
          </div>
        </section>

        {/* 2 — Cost of not knowing */}
        <section style={{ background: "#16264A" }}>
          <div className="max-w-6xl mx-auto px-6 py-20 md:px-12">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#F4F7FA" }}>
                The cost of waiting to learn
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "rgba(244,247,250,0.72)" }}>
                Women outlive men by an average of five years — but retire with two-thirds of the wealth.
                It&apos;s not about discipline or desire. It&apos;s about access to knowledge that was never written for us.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-14">
              {[
                { stat: "2×", label: "Women who say they lack investing confidence compared to men", color: "#27B7C8" },
                { stat: "30 yrs", label: "The average time women spend out of the workforce for caregiving", color: "#49B06E" },
                { stat: "$1.1T", label: "The gender wealth gap in the United States", color: "#27B7C8" },
              ].map(({ stat, label, color }) => (
                <div
                  key={stat}
                  className="rounded-2xl p-7 space-y-3"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <p className="text-5xl font-bold" style={{ color }}>{stat}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(244,247,250,0.65)" }}>{label}</p>
                </div>
              ))}
            </div>

            <p className="text-center mt-10 text-base font-medium" style={{ color: "#49B06E" }}>
              Knowledge is the first step. She Blooms is where you take it.
            </p>
          </div>
        </section>

        {/* 3 — Meet Pansy */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:px-12">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-xs">
                <div
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-25"
                  style={{ background: "radial-gradient(circle at 50% 60%, #49B06E, transparent 70%)" }}
                />
                <Image
                  src="/pansy-coffee.png"
                  alt="Pansy sharing a morning market briefing"
                  width={360}
                  height={400}
                  className="relative rounded-3xl object-cover w-full"
                />
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
                style={{ background: "rgba(73,176,110,0.12)", color: "#49B06E", border: "1px solid rgba(73,176,110,0.25)" }}
              >
                🌺 Meet your guide
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: "#F4F7FA" }}>
                Meet Pansy — the friend who actually knows markets
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: "rgba(244,247,250,0.72)" }}>
                Pansy is your AI education companion inside She Blooms. She explains what&apos;s happening in the market
                the way a sharp, caring friend would — over coffee, without the condescension.
              </p>
              <ul className="space-y-3">
                {[
                  "Breaks down market moves in plain language",
                  "Explains concepts at your pace, not Wall Street's",
                  "Never tells you what to buy — teaches you how to think",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base" style={{ color: "rgba(244,247,250,0.80)" }}>
                    <span className="mt-0.5 text-lg" style={{ color: "#49B06E" }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs pt-2" style={{ color: "rgba(244,247,250,0.40)" }}>
                Educational only. Not financial advice. Pansy never tells you what to buy or sell.
              </p>
            </div>
          </div>
        </section>

        {/* 4 — Daily with Pansy */}
        <section style={{ background: "#16264A" }}>
          <div className="max-w-6xl mx-auto px-6 py-20 md:px-12">
            <div className="text-center space-y-4 mb-14">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#F4F7FA" }}>
                A daily habit that compounds
              </h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(244,247,250,0.65)" }}>
                Five minutes each morning with Pansy&apos;s briefing builds the market intuition
                that took others years to develop.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: "☀️",
                  title: "Morning Coffee Briefing",
                  body: "A warm, plain-English recap of what happened in the market's last session. No predictions. Just context you can actually use.",
                },
                {
                  icon: "📚",
                  title: "Guided Lessons",
                  body: "From 'what is a stock' to reading earnings reports — structured courses that meet you where you are and move at your pace.",
                },
                {
                  icon: "🔍",
                  title: "Stock Education Tool",
                  body: "Look up any ticker and Pansy explains the company, the sector, and the story behind the numbers — for learning, not trading.",
                },
              ].map(({ icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl p-7 space-y-4"
                  style={{ background: "rgba(14,27,48,0.7)", border: "1px solid rgba(39,183,200,0.12)" }}
                >
                  <span className="text-3xl">{icon}</span>
                  <h3 className="text-lg font-semibold" style={{ color: "#F4F7FA" }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(244,247,250,0.60)" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5 — Bloom makes learning beautiful */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:px-12">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#F4F7FA" }}>
              Built so learning feels good
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(244,247,250,0.65)" }}>
              Finance tools are usually cold, cluttered, and built for people who already know everything.
              She Blooms was designed differently — from the first pixel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Designed for clarity",
                body: "Clean layout, no noise. Every screen is organized around what you need to understand right now — not every possible data point.",
                accent: "#27B7C8",
              },
              {
                title: "Progress you can see",
                body: "Track your lessons, revisit concepts, and watch your understanding grow. Learning is cumulative — and so is confidence.",
                accent: "#49B06E",
              },
              {
                title: "Your profile, your pace",
                body: "Tell us where you're starting from and where you want to go. Pansy tailors the experience to your goals, not a generic curriculum.",
                accent: "#49B06E",
              },
              {
                title: "Safe to explore",
                body: "No pressure to act. No 'buy now' buttons. Just a space where you can ask questions, make mistakes in learning, and grow.",
                accent: "#27B7C8",
              },
            ].map(({ title, body, accent }) => (
              <div
                key={title}
                className="rounded-2xl p-7 space-y-3"
                style={{ background: "#16264A", border: `1px solid ${accent}22` }}
              >
                <div className="w-8 h-1 rounded-full" style={{ background: accent }} />
                <h3 className="text-lg font-semibold" style={{ color: "#F4F7FA" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(244,247,250,0.60)" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6 — Closing CTA */}
        <section style={{ background: "#1E2C6B" }}>
          <div className="max-w-3xl mx-auto px-6 py-24 md:px-12 text-center space-y-8">
            <p className="text-4xl">🌺</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: "#F4F7FA" }}>
              Your financial future is worth<br />
              <span style={{ color: "#27B7C8" }}>understanding.</span>
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: "rgba(244,247,250,0.70)" }}>
              Join She Blooms Wealth and start building the knowledge that changes everything.
              Free to start. No credit card required.
            </p>
            <Link href="/auth/signup">
              <button
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold shadow-xl"
                style={{ background: "#49B06E", color: "#F4F7FA" }}
              >
                Start learning free →
              </button>
            </Link>
            <p className="text-xs" style={{ color: "rgba(244,247,250,0.35)" }}>
              Educational platform. Not a brokerage. Not financial advice.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: "#0E1B30", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-6xl mx-auto px-6 py-10 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-semibold" style={{ color: "rgba(244,247,250,0.50)" }}>
              She Blooms Wealth
            </p>
            <p className="text-xs text-center" style={{ color: "rgba(244,247,250,0.30)" }}>
              For educational purposes only. Not financial advice. Investing involves risk including possible loss of principal.
            </p>
            <div className="flex gap-5 text-sm" style={{ color: "rgba(244,247,250,0.40)" }}>
              <Link href="/auth/login" className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/auth/signup" className="hover:text-white transition-colors">Sign up</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
