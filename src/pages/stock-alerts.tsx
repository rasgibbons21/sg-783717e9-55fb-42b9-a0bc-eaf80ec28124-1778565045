import Link from "next/link";
import { SEO } from "@/components/SEO";
import { ArrowRight, Bell, Check, Smartphone, Zap, Target, TrendingUp, Shield } from "lucide-react";

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

const ALERT_TYPES = [
  { icon: Target, title: "Price Level Alerts", desc: "Set a price target on any ticker. Get notified instantly when it hits — above or below.", color: C.teal },
  { icon: Zap, title: "Scanner Signal Alerts", desc: "Get pushed when a strategy triggers (gap-and-go, momentum, breakout, etc). No need to stare at screens.", color: C.green },
  { icon: TrendingUp, title: "Big Move Notifications", desc: "Watchlist-aware alerts for unusual volume or large price moves on tickers you follow.", color: C.amber },
  { icon: Bell, title: "Earnings Reminders", desc: "Know before the bell when a stock in your watchlist is reporting earnings today.", color: "#A855F7" },
];

const TIERS = [
  { name: "Free", alerts: "3 price alerts", extra: "Scanner signals, big moves, earnings", price: "$0" },
  { name: "Desk", alerts: "15 price alerts", extra: "Everything in Free + journal & backtests", price: "$7.99/mo" },
  { name: "Pro", alerts: "75 price alerts", extra: "Everything in Desk + faster refresh", price: "$24.99/mo" },
];

export default function StockAlertsPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.deep, color: C.ivory, minHeight: "100vh" }}>
      <SEO
        title="Stock Price Alerts — Radar | Push Notifications for Traders"
        description="Set stock price alerts with instant push notifications. Free tier includes 3 alerts. Get notified when strategies trigger, watchlist stocks move, or earnings report. No credit card."
        image="/api/og?title=Stock+Price+Alerts&subtitle=Push+notifications.+Scanner+signals.+Earnings+reminders."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Radar Stock Alerts",
          applicationCategory: "FinanceApplication",
          operatingSystem: "Web, Android",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: "Stock price alerts with push notifications, scanner signal alerts, and earnings reminders.",
          url: "https://shebloomswealth.app/stock-alerts",
        }}
      />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(14,27,48,0.92)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.ivory }}>Radar</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(244,247,250,0.35)" }}>Alerts</span>
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
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, marginBottom: "1.25rem", background: `${C.teal}18`, border: `1px solid ${C.teal}35` }}>
          <Bell size={13} style={{ color: C.teal }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>Push Notifications — Real-Time</span>
        </div>

        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, lineHeight: 1.12, marginBottom: "1rem" }}>
          Stock Alerts That{" "}
          <span style={{ background: `linear-gradient(90deg, ${C.teal}, ${C.green})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Actually Reach You
          </span>
        </h1>

        <p style={{ fontSize: "clamp(1rem,1.8vw,1.12rem)", lineHeight: 1.72, color: "rgba(244,247,250,0.65)", maxWidth: 600, margin: "0 auto 2rem" }}>
          Set price alerts, get scanner signal notifications, and receive big-move alerts on your watchlist stocks.
          Push notifications to your phone, even when the app is closed.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <Link href="/onboarding">
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, ...gradientBg, color: C.deep, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: `0 8px 30px rgba(39,183,200,0.28)` }}>
              Set Your First Alert <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* Alert types */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>
        <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 700, textAlign: "center", marginBottom: "2rem" }}>
          4 Types of Alerts, One App
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {ALERT_TYPES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} style={{ ...glass, borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Icon size={20} style={{ color }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(244,247,250,0.55)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>
        <div style={{ ...glass, borderRadius: 20, padding: "2rem" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: "1.5rem" }}>
            How Alerts Work
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { step: "1", text: "Add a stock to your watchlist or open its detail page" },
              { step: "2", text: "Tap \"Add Alert\" and set your price level" },
              { step: "3", text: "Enable push notifications when prompted" },
              { step: "4", text: "Get notified instantly — even with the app closed" },
            ].map(({ step, text }) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, ...gradientBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: C.deep, flexShrink: 0 }}>
                  {step}
                </div>
                <span style={{ fontSize: 14, color: "rgba(244,247,250,0.72)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing tiers */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>
        <h2 style={{ fontSize: "clamp(1.3rem,3vw,1.8rem)", fontWeight: 700, textAlign: "center", marginBottom: "2rem" }}>
          Alert Limits by Plan
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {TIERS.map(({ name, alerts, extra, price }) => (
            <div key={name} style={{ ...glass, borderRadius: 16, padding: "1.5rem", textAlign: "center", border: name === "Desk" ? `1px solid ${C.teal}40` : undefined }}>
              {name === "Desk" && (
                <div style={{ display: "inline-flex", padding: "3px 12px", borderRadius: 20, ...gradientBg, fontSize: 10, fontWeight: 800, color: C.deep, marginBottom: 8 }}>BEST VALUE</div>
              )}
              <p style={{ fontSize: 13, fontWeight: 700, color: name === "Free" ? "rgba(244,247,250,0.6)" : name === "Desk" ? C.teal : C.green, textTransform: "uppercase", marginBottom: 8 }}>
                {name}
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{price}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.teal, marginBottom: 8 }}>{alerts}</p>
              <p style={{ fontSize: 12, color: "rgba(244,247,250,0.4)", lineHeight: 1.5 }}>{extra}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1.5rem 4rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, marginBottom: "0.75rem" }}>
          Never miss a move again
        </h2>
        <p style={{ fontSize: 14, color: "rgba(244,247,250,0.55)", marginBottom: "1.5rem" }}>
          3 free alerts. No credit card. Upgrade anytime.
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
