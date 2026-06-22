import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { createClient } from "@supabase/supabase-js";
import { SEO } from "@/components/SEO";
import { LESSONS } from "@/data/lessons";

// NOTE: Wealth Habit and Pansy's Take tiles do not yet have a DB data source.
// The daily_briefings table stores only a single `content` field (the Market
// Briefing). Those two tiles show curated static content until the schema is
// extended. Market Briefing is real data — seeded server-side via supabaseAdmin
// (service role). If no row exists for today it means no member has triggered
// /api/daily-briefing yet (first authenticated request of the day generates it).

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

function getTodayET(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === "year")!.value;
  const m = parts.find(p => p.type === "month")!.value;
  const d = parts.find(p => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

interface Props {
  briefing: string | null;
  briefingDate: string | null;
  featuredLesson: { title: string; subtitle: string; slug: string } | null;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  // Featured lesson: "What Are Dividends?" (slug index 3)
  const lesson = LESSONS[3] ?? LESSONS[0];
  const featuredLesson = lesson
    ? { title: lesson.title, subtitle: lesson.subtitle, slug: lesson.slug }
    : null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { props: { briefing: null, briefingDate: null, featuredLesson } };
  }

  const supabaseAdmin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const today = getTodayET();
  const { data } = await supabaseAdmin
    .from("daily_briefings")
    .select("content, briefing_date")
    .eq("briefing_date", today)
    .maybeSingle();

  return {
    props: {
      briefing: data?.content ?? null,
      briefingDate: data?.briefing_date ?? null,
      featuredLesson,
    },
  };
};

export default function DailyBloom({ briefing, briefingDate, featuredLesson }: Props) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <SEO title="Daily Bloom — She Blooms Wealth" description="Your daily market briefing, lesson, and wealth habit from Pansy." />

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
                { label: "Daily Bloom",     href: "/daily-bloom"     },
                { label: "Market Insights", href: "/market-insights" },
                { label: "About",           href: "/about"           },
              ] as const).map(({ label, href }) => (
                <Link key={label} href={href}
                  style={{ fontSize: 13, fontWeight: href === "/daily-bloom" ? 600 : 500, color: href === "/daily-bloom" ? C.teal : "rgba(244,247,250,0.55)", textDecoration: "none", borderBottom: href === "/daily-bloom" ? `2px solid ${C.teal}` : "2px solid transparent", paddingBottom: 2 }}>
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
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.6rem, 5.5vw, 4rem)", fontWeight: 700, lineHeight: 1.1, color: C.ivory, marginBottom: "1rem" }}>
            Daily Bloom
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "rgba(244,247,250,0.6)", maxWidth: 520, margin: "0 auto 0.75rem" }}>
            Your daily investing ritual — a market briefing, a lesson, a wealth habit, and Pansy&apos;s take.
          </p>
          {briefingDate && (
            <p style={{ fontSize: 12, color: "rgba(244,247,250,0.32)" }}>
              {new Date(briefingDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          )}
        </div>

        {/* Tiles */}
        <main style={{ flex: 1, maxWidth: 900, margin: "0 auto", padding: "0 1.5rem 5rem", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>

            {/* Market Briefing — live from daily_briefings table */}
            <div style={{
              background: "rgba(22,38,74,0.55)",
              border: `1px solid ${briefing ? C.teal + "28" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 16,
              padding: "1.75rem",
              gridColumn: "1 / -1",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                <span style={{ fontSize: 22 }}>☀️</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.teal }}>Market Briefing</span>
                {briefing && <span style={{ fontSize: 11, color: "rgba(244,247,250,0.28)", marginLeft: "auto" }}>via Pansy</span>}
              </div>
              {briefing ? (
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <Image src="/bloom-logo.png" alt="Pansy" width={36} height={36} style={{ borderRadius: "50%", background: "white", flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: "0.97rem", lineHeight: 1.78, color: "rgba(244,247,250,0.82)", margin: 0 }}>
                    {briefing}
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(244,247,250,0.45)", margin: 0 }}>
                  Today&apos;s briefing is generated when the first member visits their dashboard after market close. Sign up to trigger it — it will appear here once seeded.
                </p>
              )}
            </div>

            {/* Today's Lesson — from lessons data */}
            {featuredLesson && (
              <div style={{ background: "rgba(22,38,74,0.55)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                  <span style={{ fontSize: 22 }}>📚</span>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.teal }}>Today&apos;s Lesson</span>
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 700, color: C.ivory, margin: "0 0 8px" }}>
                  {featuredLesson.title}
                </h3>
                <p style={{ fontSize: 13, color: "rgba(244,247,250,0.55)", lineHeight: 1.6, margin: "0 0 16px" }}>
                  {featuredLesson.subtitle}
                </p>
                <Link href="/home">
                  <button style={{ padding: "9px 18px", borderRadius: 8, ...gradientBg, color: C.deep, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                    Read Lesson →
                  </button>
                </Link>
              </div>
            )}

            {/* Wealth Habit — static (no DB source yet) */}
            <div style={{ background: "rgba(22,38,74,0.55)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                <span style={{ fontSize: 22 }}>🌱</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.teal }}>Wealth Habit</span>
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 700, color: C.ivory, margin: "0 0 8px" }}>
                Check one number today.
              </h3>
              <p style={{ fontSize: 13, color: "rgba(244,247,250,0.55)", lineHeight: 1.6, margin: 0 }}>
                Open your brokerage or retirement account and note one figure — your balance, your YTD return, or your total contributions. Awareness is the foundation of every wealth habit.
              </p>
            </div>

            {/* Pansy's Take — static (no DB source yet) */}
            <div style={{ background: "rgba(22,38,74,0.55)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem" }}>
                <Image src="/bloom-logo.png" alt="Pansy" width={24} height={24} style={{ borderRadius: "50%", background: "white" }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.teal }}>Pansy&apos;s Take</span>
              </div>
              <p style={{ fontSize: "0.97rem", lineHeight: 1.75, color: "rgba(244,247,250,0.72)", margin: 0, fontStyle: "italic" }}>
                &ldquo;The market rewards patience above almost everything else — not because waiting is passive, but because it requires active trust in a process most people abandon too early. You&apos;re here. That already puts you ahead.&rdquo;
              </p>
            </div>

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
