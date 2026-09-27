import Link from "next/link";
import { SEO } from "@/components/SEO";
import { ArrowRight, Check, Search, Bell, LineChart, Zap, TrendingUp, Shield } from "lucide-react";

const C = {
  deep: "#07080C",
  surface: "#16264A",
  teal: "#27B7C8",
  green: "#49B06E",
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

const FEATURES = [
  { icon: Search, title: "Multi-Strategy Scanner", desc: "12 built-in strategies scan hundreds of tickers daily — gap-and-go, momentum, breakout, VWAP, and more." },
  { icon: Bell, title: "Price Alerts", desc: "Set price-level alerts with push notifications. Free tier includes 3 alerts, upgrades unlock up to 75." },
  { icon: LineChart, title: "Paper Trading", desc: "$10K virtual simulator to practice without risk. Track P&L, win rate, and journal every trade." },
  { icon: Zap, title: "Pre-Market Gap Scanner", desc: "Scan pre-market movers 4:00–9:30 AM ET. See gap %, RVOL, float, catalyst, and entry/stop/target levels." },
  { icon: TrendingUp, title: "Market Movers & Heatmap", desc: "Real-time gainers, losers, and sector heat map. Spot the day's momentum before the bell." },
  { icon: Shield, title: "Position Size Calculator", desc: "Calculate exact share count from account size, risk %, and stop distance. Never over-size a trade." },
];

const COMPARE = [
  { feature: "Stock screening", radar: "Free", others: "$20–50/mo" },
  { feature: "Price alerts", radar: "3 free / 75 Pro", others: "Paid only" },
  { feature: "Paper trading", radar: "Free", others: "Requires brokerage" },
  { feature: "AI market chat", radar: "Built in", others: "Not available" },
  { feature: "Pre-market scanner", radar: "Built in", others: "Add-on fee" },
  { feature: "Position calculator", radar: "Free", others: "Separate tool" },
];

export default function FreeStockScreenerPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.deep, color: C.ivory, minHeight: "100vh" }}>
      <SEO
        title="Free Stock Screener — Radar | Real-Time Scanner & Alerts"
        description="Free stock screener with 12 built-in strategies, price alerts, paper trading, and AI market chat. No credit card required. Scan pre-market gaps, momentum plays, and breakouts."
        image="/api/og?title=Free+Stock+Screener&subtitle=12+strategies.+Price+alerts.+Paper+trading.+No+credit+card."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Radar Stock Screener",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web, Android",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Free stock screener with 12 built-in strategies, price alerts, paper trading, and AI market analysis.",
          url: "https://shebloomswealth.app/free-stock-screener",
        }}
      />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(14,27,48,0.92)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.ivory }}>Radar</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(244,247,250,0.35)" }}>Stock Screener</span>
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
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, marginBottom: "1.25rem", background: "rgba(73,176,110,0.12)", border: "1px solid rgba(73,176,110,0.25)" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>100% Free — No Credit Card</span>
        </div>

        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, lineHeight: 1.12, marginBottom: "1rem" }}>
          Free Stock Screener with{" "}
          <span style={{ background: `linear-gradient(90deg, ${C.teal}, ${C.green})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            12 Built-In Strategies
          </span>
        </h1>

        <p style={{ fontSize: "clamp(1rem,1.8vw,1.12rem)", lineHeight: 1.72, color: "rgba(244,247,250,0.65)", maxWidth: 600, margin: "0 auto 2rem" }}>
          Radar scans the market daily across momentum, breakout, gap-and-go, VWAP, and 8 more strategies.
          Price alerts, paper trading, and Pansy AI market chat included. No paywall to start.
        </p>

        <Link href="/onboarding">
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, ...gradientBg, color: C.deep, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 8px 30px rgba(39,183,200,0.28)` }}>
            Start Screening Free <ArrowRight size={16} />
          </button>
        </Link>
      </section>

      {/* Features grid */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>
        <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 700, textAlign: "center", marginBottom: "2rem" }}>
          Everything You Need to Screen Stocks
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} style={{ ...glass, borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.teal}15`, border: `1px solid ${C.teal}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Icon size={20} style={{ color: C.teal }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(244,247,250,0.55)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>
        <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 700, textAlign: "center", marginBottom: "2rem" }}>
          Radar vs. Paid Screeners
        </h2>
        <div style={{ ...glass, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 16px", background: "rgba(39,183,200,0.08)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(244,247,250,0.45)", textTransform: "uppercase" }}>Feature</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.teal, textTransform: "uppercase" }}>Radar</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(244,247,250,0.45)", textTransform: "uppercase" }}>Others</span>
          </div>
          {COMPARE.map(({ feature, radar, others }, i) => (
            <div key={feature} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 16px", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <span style={{ fontSize: 13, color: "rgba(244,247,250,0.7)" }}>{feature}</span>
              <span style={{ fontSize: 13, color: C.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <Check size={13} /> {radar}
              </span>
              <span style={{ fontSize: 13, color: "rgba(244,247,250,0.4)" }}>{others}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1.5rem 4rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, marginBottom: "0.75rem" }}>
          Ready to scan the market?
        </h2>
        <p style={{ fontSize: 14, color: "rgba(244,247,250,0.55)", marginBottom: "1.5rem" }}>
          Join Radar free. No credit card, no paywall, no spam.
        </p>
        <Link href="/onboarding">
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, ...gradientBg, color: C.deep, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 8px 30px rgba(39,183,200,0.28)` }}>
            Start Free <ArrowRight size={16} />
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem 1.5rem", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(244,247,250,0.25)" }}>
          © 2026 Cinder Vault Enterprises LLC. Radar is for educational purposes only and does not constitute financial advice.
        </p>
      </footer>
    </div>
  );
}
