import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { SEO } from "@/components/SEO";

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

export default function MarketInsights() {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <SEO title="Market Insights — She Blooms Wealth" description="Educational market context and analysis from Pansy — learn how to read what markets are doing." />

      <div style={{ fontFamily:"'DM Sans', sans-serif", background:C.deep, color:C.ivory, minHeight:"100vh", display:"flex", flexDirection:"column" }}>

        {/* Nav */}
        <nav style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(14,27,48,0.95)", backdropFilter:"blur(16px)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <Link href="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
              <Image src="/bloom-logo.png" alt="Bloom" width={32} height={32} style={{ borderRadius:"50%" }} />
              <span style={{ fontFamily:"'Cormorant Garamond', serif", fontWeight:700, fontSize:17, color:C.ivory }}>Bloom</span>
            </Link>
            <div style={{ display:"flex", gap:20, alignItems:"center" }}>
              {([
                { label:"Home",            href:"/"                },
                { label:"Learn",           href:"/learn"           },
                { label:"Daily Bloom",     href:"/daily-bloom"     },
                { label:"Market Insights", href:"/market-insights" },
                { label:"About",           href:"/about"           },
              ] as const).map(({ label, href }) => (
                <Link key={label} href={href}
                  style={{ fontSize:13, fontWeight: href === "/market-insights" ? 600 : 500, color: href === "/market-insights" ? C.teal : "rgba(244,247,250,0.55)", textDecoration:"none", borderBottom: href === "/market-insights" ? `2px solid ${C.teal}` : "2px solid transparent", paddingBottom:2 }}>
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
        <main style={{ flex:1, maxWidth:720, margin:"0 auto", padding:"6rem 1.5rem 4rem", textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", borderRadius:20, background:`${C.teal}15`, border:`1px solid ${C.teal}30`, marginBottom:"2rem" }}>
            <span style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:C.teal }}>Coming Soon</span>
          </div>

          <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(2.4rem, 5vw, 3.6rem)", fontWeight:700, lineHeight:1.1, color:C.ivory, marginBottom:"1.5rem" }}>
            Market Insights
          </h1>

          <p style={{ fontSize:"1.1rem", lineHeight:1.7, color:"rgba(244,247,250,0.65)", marginBottom:"1rem" }}>
            Learn how to read what markets are actually doing — in plain English, with real examples, focused on building your understanding rather than chasing trades.
          </p>
          <p style={{ fontSize:"0.9rem", color:"rgba(244,247,250,0.38)", marginBottom:"3rem" }}>
            This section is in development. Sign up to get notified when it&apos;s live.
          </p>

          <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:16, marginBottom:"4rem" }}>
            {[
              { icon:"📈", title:"Sector Spotlights",    body:"What each sector does and why it moves the way it does." },
              { icon:"🔍", title:"Earnings Season",      body:"How to understand earnings reports without drowning in numbers." },
              { icon:"🌍", title:"Macro Context",        body:"Interest rates, inflation, and what they mean for your portfolio." },
              { icon:"🧠", title:"Investor Psychology",  body:"Why markets behave the way they do — and how to keep a clear head." },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ background:`rgba(22,38,74,0.5)`, border:`1px solid rgba(255,255,255,0.07)`, borderRadius:14, padding:"1.25rem", width:"calc(50% - 8px)", minWidth:200, textAlign:"left" }}>
                <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
                <div style={{ fontSize:13, fontWeight:600, color:C.ivory, marginBottom:4 }}>{title}</div>
                <div style={{ fontSize:12, color:"rgba(244,247,250,0.50)", lineHeight:1.5 }}>{body}</div>
              </div>
            ))}
          </div>

          <Link href="/onboarding">
            <button style={{ padding:"14px 28px", borderRadius:10, ...gradientBg, color:C.deep, fontSize:15, fontWeight:700, border:"none", cursor:"pointer" }}>
              Get Early Access — It&apos;s Free
            </button>
          </Link>

          <p style={{ fontSize:11, color:"rgba(244,247,250,0.28)", marginTop:"1rem" }}>
            Educational only. Not financial advice. Bloom never recommends buying or selling any security.
          </p>
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
