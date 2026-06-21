import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { SEO } from "@/components/SEO";
import { INSIGHTS, Insight } from "@/data/insights";

const C = {
  deep:    "#0E1B30",
  surface: "#16264A",
  teal:    "#27B7C8",
  green:   "#49B06E",
  ivory:   "#F4F7FA",
};

const gradientBg: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.teal}, ${C.green})`,
};

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Link href={`/market-insights/${insight.slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "rgba(22,38,74,0.55)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          cursor: "pointer",
          transition: "border-color 0.2s, transform 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = `${C.teal}50`;
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        <div style={{ fontSize: 28 }}>{insight.icon}</div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700, color: C.ivory, margin: 0, lineHeight: 1.2 }}>
          {insight.title}
        </h3>
        <p style={{ fontSize: 13, color: "rgba(244,247,250,0.55)", lineHeight: 1.6, margin: 0 }}>
          {insight.subtitle}
        </p>
        <span style={{ fontSize: 13, color: C.teal, fontWeight: 600, marginTop: 4 }}>Read →</span>
      </div>
    </Link>
  );
}

export default function MarketInsightsIndex() {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <SEO
        title="Market Insights — She Blooms Wealth"
        description="Learn how to read what markets are doing — sectors, earnings, macro forces, and investor psychology, in plain English."
      />

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.deep, color: C.ivory, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Nav */}
        <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(14,27,48,0.95)", backdropFilter: "blur(16px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
              <Image src="/bloom-logo.png" alt="Bloom" width={32} height={32} style={{ borderRadius: "50%" }} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 17, color: C.ivory }}>Bloom</span>
            </Link>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              {([
                { label: "Home",            href: "/"                },
                { label: "Learn",           href: "/learn"           },
                { label: "Daily Bloom",     href: "/daily-bloom"     },
                { label: "Market Insights", href: "/market-insights" },
                { label: "About",           href: "/about"           },
              ] as const).map(({ label, href }) => (
                <Link key={label} href={href}
                  style={{ fontSize: 13, fontWeight: href === "/market-insights" ? 600 : 500, color: href === "/market-insights" ? C.teal : "rgba(244,247,250,0.55)", textDecoration: "none", borderBottom: href === "/market-insights" ? `2px solid ${C.teal}` : "2px solid transparent", paddingBottom: 2 }}>
                  {label}
                </Link>
              ))}
            </div>
            <Link href="/onboarding">
              <button style={{ padding: "8px 16px", borderRadius: 8, ...gradientBg, color: C.deep, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                Start Free
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "5rem 1.5rem 2.5rem", textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.8rem, 6vw, 4.2rem)", fontWeight: 700, lineHeight: 1.1, color: C.ivory, marginBottom: "1.25rem" }}>
            Market Insights
          </h1>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "rgba(244,247,250,0.62)", maxWidth: 560, margin: "0 auto 2rem" }}>
            Learn how to read what markets are actually doing — in plain English, with real examples, focused on building your understanding rather than chasing trades.
          </p>
        </div>

        {/* Cards grid */}
        <main style={{ flex: 1, maxWidth: 960, margin: "0 auto", padding: "0 1.5rem 5rem", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {INSIGHTS.map(insight => (
              <InsightCard key={insight.slug} insight={insight} />
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(244,247,250,0.28)", marginTop: "3.5rem" }}>
            Educational only. Not financial advice. Bloom never recommends buying or selling any security.
          </p>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(244,247,250,0.25)" }}>
            © 2026 Cinder Vault Enterprises LLC · <Link href="/privacy" style={{ color: "rgba(244,247,250,0.35)", textDecoration: "none" }}>Privacy</Link> · <Link href="/terms" style={{ color: "rgba(244,247,250,0.35)", textDecoration: "none" }}>Terms</Link> · <Link href="/disclaimer" style={{ color: "rgba(244,247,250,0.35)", textDecoration: "none" }}>Disclaimer</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
