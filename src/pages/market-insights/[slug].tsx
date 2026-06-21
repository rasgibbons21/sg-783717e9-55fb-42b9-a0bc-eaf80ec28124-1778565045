import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { SEO } from "@/components/SEO";
import { INSIGHTS, getInsightBySlug, getAdjacentInsights, Insight } from "@/data/insights";

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

interface Props {
  insight: Insight;
  prev: Insight | null;
  next: Insight | null;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: INSIGHTS.map(i => ({ params: { slug: i.slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const insight = getInsightBySlug(slug);
  if (!insight) return { notFound: true };
  const { prev, next } = getAdjacentInsights(slug);
  return { props: { insight, prev: prev ?? null, next: next ?? null } };
};

export default function InsightPage({ insight, prev, next }: Props) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <SEO title={`${insight.title} — She Blooms Wealth`} description={insight.subtitle} />

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

        {/* Breadcrumb */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1.5rem 0", width: "100%" }}>
          <Link href="/market-insights" style={{ fontSize: 13, color: "rgba(244,247,250,0.4)", textDecoration: "none" }}>
            ← Market Insights
          </Link>
        </div>

        {/* Article */}
        <main style={{ flex: 1, maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem 5rem", width: "100%" }}>

          <div style={{ fontSize: 36, marginBottom: "1rem" }}>{insight.icon}</div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: 700, lineHeight: 1.15, color: C.ivory, marginBottom: "0.75rem" }}>
            {insight.title}
          </h1>

          <p style={{ fontSize: "1.1rem", lineHeight: 1.65, color: "rgba(244,247,250,0.6)", marginBottom: "2.5rem", fontStyle: "italic" }}>
            {insight.subtitle}
          </p>

          {/* Body */}
          <div style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(244,247,250,0.78)" }}>
            {insight.body.split("\n\n").map((para, i) => (
              <p key={i} style={{ marginBottom: "1.4rem" }}>{para}</p>
            ))}
          </div>

          {/* Takeaway */}
          <div style={{ background: "rgba(39,183,200,0.08)", border: `1px solid ${C.teal}30`, borderRadius: 14, padding: "1.5rem 1.75rem", margin: "2.5rem 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.teal, marginBottom: "0.6rem" }}>
              The One Thing
            </div>
            <p style={{ fontSize: "1rem", lineHeight: 1.65, color: C.ivory, margin: 0 }}>
              {insight.takeaway}
            </p>
          </div>

          {/* Prev / Next */}
          <div style={{ display: "flex", gap: 16, marginTop: "2rem", flexWrap: "wrap" }}>
            {prev && (
              <Link href={`/market-insights/${prev.slug}`} style={{ flex: 1, minWidth: 200, textDecoration: "none" }}>
                <div style={{ background: "rgba(22,38,74,0.55)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "1rem 1.25rem" }}>
                  <div style={{ fontSize: 11, color: "rgba(244,247,250,0.35)", marginBottom: 4 }}>← Previous</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ivory }}>{prev.title}</div>
                </div>
              </Link>
            )}
            {next && (
              <Link href={`/market-insights/${next.slug}`} style={{ flex: 1, minWidth: 200, textDecoration: "none", marginLeft: "auto" }}>
                <div style={{ background: "rgba(22,38,74,0.55)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "1rem 1.25rem", textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "rgba(244,247,250,0.35)", marginBottom: 4 }}>Next →</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ivory }}>{next.title}</div>
                </div>
              </Link>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/market-insights">
              <button style={{ padding: "12px 24px", borderRadius: 10, background: "rgba(22,38,74,0.7)", border: "1px solid rgba(255,255,255,0.12)", color: C.ivory, fontSize: 14, fontWeight: 600, cursor: "pointer", marginRight: 12 }}>
                ← All Topics
              </button>
            </Link>
            <Link href="/learn">
              <button style={{ padding: "12px 24px", borderRadius: 10, ...gradientBg, color: C.deep, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>
                Explore Lessons →
              </button>
            </Link>
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(244,247,250,0.28)", marginTop: "1.5rem" }}>
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
