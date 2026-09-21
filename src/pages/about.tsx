import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { SEO } from "@/components/SEO";

const C = {
  deep:    "#07080C",
  surface: "#16264A",
  teal:    "#27B7C8",
  green:   "#49B06E",
  ivory:   "#F3EDE3",
};

const gradientBg: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.teal}, ${C.green})`,
};

const gradientText: React.CSSProperties = {
  background: `linear-gradient(90deg, ${C.teal}, ${C.green})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

export default function About() {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <SEO
        title="About She Blooms Wealth — Stock Screener & Alerts"
        description="She Blooms Wealth is a stock screener and alerts platform with Pansy AI analyst, TradingView charts, paper trading, and 150+ trading lessons. By Cinder Vault Enterprises LLC."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "What is She Blooms Wealth?", acceptedAnswer: { "@type": "Answer", text: "She Blooms Wealth is a stock screener and alerts platform. It scans stocks using high-probability strategies, sends price alerts, and includes Pansy — an AI trading analyst who provides entries, stops, and targets." } },
            { "@type": "Question", name: "Is She Blooms Wealth free?", acceptedAnswer: { "@type": "Answer", text: "Yes! She Blooms Wealth offers a free tier with a basic stock screener, paper trading simulator, market movers, and 36 core lessons. Radar Core ($4.99/month, $39.99/year, or $69.99 lifetime) unlocks price alerts, unlimited Pansy AI, and advanced screener features." } },
            { "@type": "Question", name: "What is paper trading in She Blooms Wealth?", acceptedAnswer: { "@type": "Answer", text: "Paper trading lets you practice buying and selling real stocks with $10,000 in virtual money. You get real-time prices, interactive charts, a trade journal, and P&L tracking — all with zero financial risk." } },
            { "@type": "Question", name: "Who is Pansy?", acceptedAnswer: { "@type": "Answer", text: "Pansy is She Blooms Wealth's AI trading analyst. She scans the markets, identifies setups, and gives traders specific entries, stop losses, and take profit targets. She explains charts in plain language and never places trades on your behalf." } },
            { "@type": "Question", name: "What trading strategies does She Blooms Wealth cover?", acceptedAnswer: { "@type": "Answer", text: "She Blooms Wealth's screener scores stocks using 32 strategies across day trading, swing trading, and long-term investing. Topics include Gap-and-Go, VWAP reclaim, momentum breakouts, support/resistance, and moving average plays." } },
          ],
        }}
      />

      <div style={{ fontFamily:"'Inter', sans-serif", background:C.deep, color:C.ivory, minHeight:"100vh", display:"flex", flexDirection:"column" }}>

        {/* Nav */}
        <nav style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(14,27,48,0.95)", backdropFilter:"blur(16px)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
              <Image src="/bloom-logo.png" alt="She Blooms Wealth" width={32} height={32} style={{ borderRadius:"50%" }} />
              <span style={{ fontFamily:"'Cormorant Garamond', serif", fontWeight:700, fontSize:17, color:C.ivory }}>Radar</span>
            </Link>
            <div style={{ display:"flex", gap:20, alignItems:"center" }}>
              {([
                { label:"Home",            href:"/"                },
                { label:"Learn",           href:"/learn"           },
                { label:"Daily Briefing",  href:"/daily-bloom"     },
                { label:"Market Insights", href:"/market-insights" },
                { label:"About",           href:"/about"           },
              ] as const).map(({ label, href }) => (
                <Link key={label} href={href}
                  style={{ fontSize:13, fontWeight: href === "/about" ? 600 : 500, color: href === "/about" ? C.teal : "rgba(244,247,250,0.55)", textDecoration:"none", borderBottom: href === "/about" ? `2px solid ${C.teal}` : "2px solid transparent", paddingBottom:2 }}>
                  {label}
                </Link>
              ))}
            </div>
            <Link href="/onboarding">
              <button style={{ padding:"8px 16px", borderRadius:8, ...gradientBg, color:C.deep, fontSize:13, fontWeight:700, border:"none", cursor:"pointer" }}>
                Start Free
              </button>
            </Link>
          </div>
        </nav>

        {/* Content */}
        <main style={{ flex:1, maxWidth:760, margin:"0 auto", padding:"6rem 1.5rem 5rem" }}>

          {/* Hero text */}
          <div style={{ textAlign:"center", marginBottom:"4rem" }}>
            <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(2.6rem, 5.5vw, 4rem)", fontWeight:700, lineHeight:1.1, color:C.ivory, marginBottom:"1.5rem" }}>
              Screen stocks. Set alerts.{" "}
              <span style={gradientText}>Trade smarter.</span>
            </h1>
            <p style={{ fontSize:"1.1rem", lineHeight:1.72, color:"rgba(244,247,250,0.65)", maxWidth:580, margin:"0 auto" }}>
              She Blooms Wealth is a stock screener and alerts platform. We help traders find setups, set alerts, and make smarter decisions — with Pansy, your AI trading analyst, by your side.
            </p>
          </div>

          {/* Mission */}
          <div style={{ background:`rgba(22,38,74,0.5)`, border:`1px solid rgba(255,255,255,0.07)`, borderRadius:18, padding:"2rem 2.25rem", marginBottom:"2rem" }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"1.75rem", fontWeight:700, color:C.ivory, marginBottom:"1rem" }}>
              Our mission
            </h2>
            <p style={{ fontSize:"1rem", lineHeight:1.72, color:"rgba(244,247,250,0.68)" }}>
              The gender wealth gap is real. Women outlive men by an average of five years, yet consistently hold less invested wealth. That gap isn&apos;t about ability — it&apos;s about access to clear, non-condescending, jargon-free financial education that actually fits women&apos;s lives.
            </p>
            <p style={{ fontSize:"1rem", lineHeight:1.72, color:"rgba(244,247,250,0.68)", marginTop:"1rem" }}>
              She Blooms Wealth exists to close that gap — not by picking stocks for you, but by giving you the understanding to build your own judgment. The goal is always your independence, not your dependency on us.
            </p>
          </div>

          {/* Meet Pansy */}
          <div style={{ background:`rgba(22,38,74,0.5)`, border:`1px solid ${C.teal}20`, borderRadius:18, padding:"2rem 2.25rem", marginBottom:"2rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1rem" }}>
              <Image src="/bloom-logo.png" alt="Pansy" width={40} height={40} style={{ borderRadius:"50%", background:"white" }} />
              <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"1.75rem", fontWeight:700, color:C.ivory, margin:0 }}>
                Meet Pansy
              </h2>
            </div>
            <p style={{ fontSize:"1rem", lineHeight:1.72, color:"rgba(244,247,250,0.68)" }}>
              Pansy is your friendly financial education guide. She walks you through market concepts, breaks down what&apos;s happening in plain English, and answers your questions without judgment. She&apos;s not a financial advisor — she&apos;s a teacher, and a good one.
            </p>
            <p style={{ fontSize:"0.85rem", color:"rgba(244,247,250,0.38)", marginTop:"0.75rem", fontStyle:"italic" }}>
              Pansy does not provide financial advice. All content is educational. She never recommends buying or selling any security.
            </p>
          </div>

          {/* What's inside */}
          <div style={{ background:`rgba(22,38,74,0.5)`, border:`1px solid rgba(255,255,255,0.07)`, borderRadius:18, padding:"2rem 2.25rem", marginBottom:"2rem" }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"1.75rem", fontWeight:700, color:C.ivory, marginBottom:"1.25rem" }}>
              What&apos;s inside Radar
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:14 }}>
              {[
                { emoji:"📖", label:"36 Core Lessons", desc:"Beginner to intermediate — stocks, ETFs, dividends, budgeting, retirement" },
                { emoji:"💰", label:"16 Side Hustle Lessons", desc:"Start earning with $0 — real estate, freelancing, digital products" },
                { emoji:"💡", label:"32 Pro Strategies", desc:"Day trading, swing trading, long-term, indicators — with entry/exit rules" },
                { emoji:"🎓", label:"9-Module University", desc:"89 deep-dive lessons on advanced topics, real estate, options, psychology" },
                { emoji:"📊", label:"Paper Trading Simulator", desc:"Practice with $10K fake money, real prices, zero risk" },
                { emoji:"🏦", label:"Budget Tracker", desc:"Track where your money goes. Pansy walks you through every step" },
                { emoji:"🏆", label:"Achievements & Streaks", desc:"Daily challenges, XP levels, badges, leaderboards" },
                { emoji:"📜", label:"Certificate", desc:"Complete the program and earn a real certificate of completion" },
              ].map(item => (
                <div key={item.label} style={{ padding:"1rem", borderRadius:12, border:"1px solid rgba(255,255,255,0.06)", background:"rgba(14,27,48,0.4)" }}>
                  <span style={{ fontSize:20, display:"block", marginBottom:8 }}>{item.emoji}</span>
                  <p style={{ fontSize:14, fontWeight:700, color:C.ivory, marginBottom:4 }}>{item.label}</p>
                  <p style={{ fontSize:12, lineHeight:1.55, color:"rgba(244,247,250,0.50)", margin:0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Company */}
          <div style={{ background:`rgba(22,38,74,0.5)`, border:`1px solid rgba(255,255,255,0.07)`, borderRadius:18, padding:"2rem 2.25rem", marginBottom:"3rem" }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"1.75rem", fontWeight:700, color:C.ivory, marginBottom:"1rem" }}>
              The company
            </h2>
            <p style={{ fontSize:"1rem", lineHeight:1.72, color:"rgba(244,247,250,0.68)" }}>
              She Blooms Wealth is a product of Cinder Vault Enterprises LLC. We are a financial education company, not a broker, investment adviser, or financial planner. We hold no licences to provide investment advice and we do not do so.
            </p>
            <p style={{ fontSize:"1rem", lineHeight:1.72, color:"rgba(244,247,250,0.68)", marginTop:"1rem" }}>
              Questions? Reach us at <a href="mailto:cindervaultenterprisesllc@gmail.com" style={{ color:C.teal, textDecoration:"none" }}>cindervaultenterprisesllc@gmail.com</a> or visit our <Link href="/contact" style={{ color:C.teal, textDecoration:"none" }}>contact page</Link>.
            </p>
          </div>

          <div style={{ textAlign:"center" }}>
            <Link href="/onboarding">
              <button style={{ padding:"14px 28px", borderRadius:10, ...gradientBg, color:C.deep, fontSize:15, fontWeight:700, border:"none", cursor:"pointer" }}>
                Get Started Free
              </button>
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"1.5rem", textAlign:"center" }}>
          <p style={{ fontSize:11, color:"rgba(244,247,250,0.25)" }}>
            © 2026 Cinder Vault Enterprises LLC · <Link href="/privacy" style={{ color:"rgba(244,247,250,0.35)", textDecoration:"none" }}>Privacy</Link> · <Link href="/terms" style={{ color:"rgba(244,247,250,0.35)", textDecoration:"none" }}>Terms</Link> · <Link href="/disclaimer" style={{ color:"rgba(244,247,250,0.35)", textDecoration:"none" }}>Disclaimer</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
