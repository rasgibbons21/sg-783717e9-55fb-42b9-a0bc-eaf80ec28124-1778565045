import Link from "next/link";
import { SEO } from "@/components/SEO";
import { ArrowRight, Check, Clock, TrendingUp, AlertTriangle, BarChart3, Target, Zap } from "lucide-react";

const C = {
  deep: "#07080C",
  surface: "#16264A",
  teal: "#27B7C8",
  green: "#49B06E",
  amber: "#F59E0B",
  ivory: "#F3EDE3",
};

const gradientBg: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.teal}, ${C.green})`,
};

const glass: React.CSSProperties = {
  background: "rgba(22,38,74,0.55)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const STEPS = [
  { num: "1", icon: Clock, title: "Pre-Market Scan (4:00 AM ET)", desc: "Radar scans hundreds of tickers for overnight gaps. Stocks gapping 4%+ with elevated volume and a catalyst get flagged." },
  { num: "2", icon: BarChart3, title: "Score & Rank", desc: "Each gap is scored across conditions: gap %, pre-market volume, relative volume (RVOL), float, and catalyst presence." },
  { num: "3", icon: Target, title: "Entry / Stop / Target", desc: "Radar calculates an entry zone, stop-loss (invalidation level), and two profit targets with a risk-reward ratio." },
  { num: "4", icon: AlertTriangle, title: "Checklist Verification", desc: "An expandable checklist shows which conditions passed, failed, or are missing — so you know exactly why a setup scored the way it did." },
  { num: "5", icon: TrendingUp, title: "Monitor & Execute", desc: "Watch the state badge (WATCH → NEAR_TRIGGER → ACTIVE → INVALIDATED) update as the market moves. Act when your plan confirms." },
];

const WHY = [
  "Pre-market scanning from 4:00 AM ET",
  "12 strategies beyond just gap-and-go",
  "Entry zone, stop, and target levels",
  "Risk-reward ratio calculated automatically",
  "Expandable condition checklist per setup",
  "Push notifications for triggered signals",
  "Paper trading to practice gap plays risk-free",
  "Earnings calendar integration",
];

export default function GapAndGoScannerPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.deep, color: C.ivory, minHeight: "100vh" }}>
      <SEO
        title="Gap and Go Scanner — Radar | Pre-Market Gap Scanner"
        description="Free pre-market gap scanner for day traders. Scan gaps from 4:00 AM ET with RVOL, float, catalyst detection, and automatic entry/stop/target levels. Checklist-verified setups."
        image="/api/og?title=Gap+%26+Go+Scanner&subtitle=Pre-market+gaps.+RVOL.+Catalyst.+Entry%2Fstop%2Ftarget+levels."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Radar Gap and Go Scanner",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web, Android",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Pre-market gap scanner for day traders with automatic entry, stop, and target levels.",
          url: "https://shebloomswealth.app/gap-and-go-scanner",
        }}
      />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(14,27,48,0.92)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.ivory }}>Radar</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(244,247,250,0.35)" }}>Gap Scanner</span>
          </Link>
          <Link href="/onboarding">
            <button style={{ padding: "9px 18px", borderRadius: 8, ...gradientBg, color: C.deep, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
              Get Started Free
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(3rem,6vw,5rem) 1.5rem 2rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, marginBottom: "1.25rem", background: `${C.green}18`, border: `1px solid ${C.green}35` }}>
          <Zap size={13} style={{ color: C.green }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>Pre-Market Scanner — Live from 4:00 AM ET</span>
        </div>

        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, lineHeight: 1.12, marginBottom: "1rem" }}>
          Gap and Go Scanner for{" "}
          <span style={{ background: `linear-gradient(90deg, ${C.teal}, ${C.green})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Day Traders
          </span>
        </h1>

        <p style={{ fontSize: "clamp(1rem,1.8vw,1.12rem)", lineHeight: 1.72, color: "rgba(244,247,250,0.65)", maxWidth: 620, margin: "0 auto 2rem" }}>
          Radar finds pre-market gaps with volume, scores them across key conditions, and gives you entry, stop,
          and target levels — before the opening bell. No spreadsheets, no guesswork.
        </p>

        <Link href="/onboarding">
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, ...gradientBg, color: C.deep, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 8px 30px rgba(39,183,200,0.28)` }}>
            Scan Gaps Free <ArrowRight size={16} />
          </button>
        </Link>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>
        <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 700, textAlign: "center", marginBottom: "2.5rem" }}>
          How the Gap & Go Scanner Works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {STEPS.map(({ num, icon: Icon, title, desc }) => (
            <div key={num} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, ...gradientBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, fontWeight: 800, color: C.deep }}>
                {num}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Icon size={16} style={{ color: C.teal }} />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(244,247,250,0.55)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Radar */}
      <section style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>
        <div style={{ ...glass, borderRadius: 20, padding: "2rem" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: "1.5rem" }}>
            Why Traders Choose Radar
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {WHY.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Check size={14} style={{ color: C.green, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: "rgba(244,247,250,0.72)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1.5rem 4rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, marginBottom: "0.75rem" }}>
          Start scanning pre-market gaps
        </h2>
        <p style={{ fontSize: 14, color: "rgba(244,247,250,0.55)", marginBottom: "1.5rem" }}>
          Free to start. No credit card. Upgrade when you need more alerts.
        </p>
        <Link href="/onboarding">
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, ...gradientBg, color: C.deep, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 8px 30px rgba(39,183,200,0.28)` }}>
            Get Started Free <ArrowRight size={16} />
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem 1.5rem", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(244,247,250,0.25)" }}>
          © 2026 Cinder Vault Enterprises LLC. Radar is for educational purposes only and does not constitute financial advice. Alerts are price/level notifications, not trade recommendations.
        </p>
      </footer>
    </div>
  );
}
