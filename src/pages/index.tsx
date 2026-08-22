import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Menu, X, ArrowRight } from "lucide-react";
import { canShowExternalPayment } from "@/lib/payments";

/* ─── Palette ─────────────────────────────────────────────────────────────── */
const C = {
  deep:    "#0E1B30",
  surface: "#16264A",
  brand:   "#1E2C6B",
  teal:    "#27B7C8",
  green:   "#49B06E",
  ivory:   "#F4F7FA",
  red:     "#E05A6A",
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

const glass: React.CSSProperties = {
  background: "rgba(22,38,74,0.55)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

/* ─── Data ────────────────────────────────────────────────────────────────── */
const TICKER = [
  { s: "S&P 500", c: "+0.62%", up: true  },
  { s: "NASDAQ",  c: "+1.12%", up: true  },
  { s: "DOW",     c: "+0.38%", up: true  },
  { s: "AAPL",    c: "+0.84%", up: true  },
  { s: "MSFT",    c: "−0.12%", up: false },
  { s: "NVDA",    c: "+3.42%", up: true  },
  { s: "TSLA",    c: "−1.81%", up: false },
  { s: "BTC",     c: "+2.11%", up: true  },
  { s: "GOLD",    c: "−0.15%", up: false },
  { s: "OIL",     c: "+0.47%", up: true  },
];

const INDEX_CARDS = [
  { label: "NASDAQ",  value: "18,432", change: "+1.12%", up: true,  pts: [10,13,11,16,13,18,15,21,18,24] },
  { label: "S&P 500", value: "5,487",  change: "+0.62%", up: true,  pts: [10,12,11,14,13,15,14,16,15,17] },
  { label: "DOW",     value: "39,150", change: "+0.38%", up: true,  pts: [8, 9, 7, 10, 9, 11,10,12,11,13] },
];

/* ─── CSS Keyframes ───────────────────────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes ticker-scroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes float-a {
    0%,100% { transform: translateY(0px) rotate(-0.8deg); }
    50%     { transform: translateY(-14px) rotate(0.4deg); }
  }
  @keyframes float-b {
    0%,100% { transform: translateY(-6px) rotate(0.8deg); }
    50%     { transform: translateY(8px) rotate(-0.4deg); }
  }
  @keyframes float-c {
    0%,100% { transform: translateY(4px) rotate(0.4deg); }
    50%     { transform: translateY(-10px) rotate(-0.8deg); }
  }
  @keyframes breathe {
    0%,100% { transform: scale(1); }
    50%     { transform: scale(1.07); }
  }
  @keyframes glow-pulse {
    0%,70%,100% { filter: drop-shadow(0 0 6px rgba(39,183,200,0.25)); }
    35%         { filter: drop-shadow(0 0 22px rgba(39,183,200,0.85)); }
  }
  @keyframes drift-slow {
    0%,100% { transform: translateX(0)     translateY(0); }
    33%     { transform: translateX(-28px)  translateY(12px); }
    66%     { transform: translateX(-12px)  translateY(-8px); }
  }
  @keyframes number-drift {
    0%,100% { opacity: 0.035; transform: translateY(0); }
    50%     { opacity: 0.07;  transform: translateY(-6px); }
  }
  @keyframes orb-pulse {
    0%,100% { opacity: 0.07; transform: scale(1); }
    50%     { opacity: 0.14; transform: scale(1.12); }
  }
  @keyframes candle-flicker {
    0%,85%,100% { opacity: 1; }
    90%         { opacity: 0.35; }
  }
  @keyframes underline-draw {
    0%   { stroke-dashoffset: 320; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes fade-up {
    0%   { opacity: 0; transform: translateY(18px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function greetingFor(h: number) {
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function isMarketOpen() {
  try {
    const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
    const d = et.getDay(), m = et.getHours() * 60 + et.getMinutes();
    return d >= 1 && d <= 5 && m >= 570 && m < 960;
  } catch { return false; }
}

function calcCountdown() {
  try {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const open = new Date(et);
    open.setHours(9, 30, 0, 0);
    if (open <= et) open.setDate(open.getDate() + 1);
    while (open.getDay() === 0 || open.getDay() === 6) open.setDate(open.getDate() + 1);
    const diff = open.getTime() - et.getTime();
    const H = Math.floor(diff / 3_600_000);
    const M = Math.floor((diff % 3_600_000) / 60_000);
    const S = Math.floor((diff % 60_000) / 1_000);
    return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}:${String(S).padStart(2, "0")}`;
  } catch { return "09:30:00"; }
}

/* ─── Mini sparkline chart ─────────────────────────────────────────────────── */
function MiniChart({ pts, up }: { pts: number[]; up: boolean }) {
  const W = 72, H = 28;
  const min = Math.min(...pts), rng = Math.max(...pts) - min || 1;
  const p = pts.map((v, i) => `${(i / (pts.length - 1)) * W},${H - ((v - min) / rng) * H}`).join(" ");
  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <polyline points={p} fill="none" stroke={up ? C.green : C.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Layered hero background ─────────────────────────────────────────────── */
function HeroBg() {
  const chartPath = "M0,200 C80,175 120,225 200,160 C280,95 320,175 420,120 C520,65 570,145 700,90 C830,35 880,110 1000,70 C1120,30 1180,95 1320,55 C1380,40 1420,60 1440,50";
  const areaPath  = `${chartPath} L1440,400 L0,400 Z`;

  const floatingNums = [
    { top:"14%", left:"7%",  text:"+0.62%" }, { top:"30%", left:"20%", text:"18,432" },
    { top:"19%", left:"66%", text:"5,487"  }, { top:"47%", left:"13%", text:"BUY"    },
    { top:"56%", left:"74%", text:"+3.42%" }, { top:"71%", left:"34%", text:"NVDA"   },
    { top:"36%", left:"83%", text:"▲0.84"  }, { top:"81%", left:"58%", text:"VOL"    },
    { top:"23%", left:"47%", text:"39,150" }, { top:"66%", left:"88%", text:"+1.12%" },
  ];

  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {/* L1 gradient base */}
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(155deg, ${C.deep} 0%, #091523 45%, ${C.surface}60 100%)` }} />

      {/* L2 animated stock chart */}
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none"
        style={{ position:"absolute", top:"5%", left:0, width:"100%", height:"55%", opacity:0.07, animation:"drift-slow 22s ease-in-out infinite" }}>
        <defs>
          <linearGradient id="hbg-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.teal} stopOpacity="0.45" />
            <stop offset="100%" stopColor={C.teal} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#hbg-fill)" />
        <path d={chartPath} fill="none" stroke={C.teal} strokeWidth="1.5" />
      </svg>

      {/* L3 grid lines */}
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.03 }}>
        {[1,2,3,4,5,6,7,8,9,10,11].map(i => (
          <line key={`v${i}`} x1={i*130} y1="0" x2={i*130} y2="900" stroke={C.ivory} strokeWidth="0.5" />
        ))}
        {[1,2,3,4,5,6,7,8].map(i => (
          <line key={`h${i}`} x1="0" y1={i*110} x2="1440" y2={i*110} stroke={C.ivory} strokeWidth="0.5" />
        ))}
      </svg>

      {/* L4 floating market numbers */}
      <div style={{ position:"absolute", inset:0, fontSize:11, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.05em", color:C.ivory }}>
        {floatingNums.map(({ top, left, text }, i) => (
          <span key={i} style={{ position:"absolute", top, left, animation:`number-drift ${4 + i * 0.6}s ease-in-out infinite`, animationDelay:`${i * 0.45}s` }}>
            {text}
          </span>
        ))}
      </div>

      {/* L6 glow orbs */}
      <div style={{ position:"absolute", top:"18%", left:"28%", width:460, height:460, borderRadius:"50%", background:C.teal, filter:"blur(130px)", opacity:0.06, animation:"orb-pulse 9s ease-in-out infinite" }} />
      <div style={{ position:"absolute", top:"52%", right:"12%", width:380, height:380, borderRadius:"50%", background:C.green, filter:"blur(110px)", opacity:0.05, animation:"orb-pulse 11s ease-in-out infinite", animationDelay:"4s" }} />
      <div style={{ position:"absolute", bottom:"8%", left:"8%",  width:260, height:260, borderRadius:"50%", background:C.brand, filter:"blur(90px)",  opacity:0.10, animation:"orb-pulse 13s ease-in-out infinite", animationDelay:"7s" }} />
    </div>
  );
}

/* ─── Animated candlestick backdrop (behind Pansy) ─────────────────────────── */
function CandleBg() {
  const candles = [
    { x:18,  o:155, c:198, h:212, l:142, up:true  },
    { x:52,  o:198, c:172, h:207, l:162, up:false },
    { x:86,  o:172, c:222, h:234, l:166, up:true  },
    { x:120, o:222, c:192, h:228, l:185, up:false },
    { x:154, o:192, c:238, h:248, l:186, up:true  },
    { x:188, o:238, c:212, h:244, l:204, up:false },
    { x:222, o:212, c:256, h:265, l:206, up:true  },
    { x:256, o:256, c:234, h:261, l:226, up:false },
  ];
  const sc = (v: number) => 280 - (v / 280) * 265;
  return (
    <svg viewBox="0 0 300 280" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.14 }}>
      {candles.map((cd, i) => {
        const bTop = sc(Math.max(cd.o, cd.c));
        const bH   = Math.max(Math.abs(sc(cd.o) - sc(cd.c)), 3);
        const wTop = sc(cd.h);
        const wH   = sc(cd.l) - sc(cd.h);
        const col  = cd.up ? C.green : C.red;
        return (
          <g key={i} style={{ animation:`candle-flicker ${2.5 + i * 0.45}s ease-in-out infinite`, animationDelay:`${i * 0.38}s` }}>
            <rect x={cd.x}     y={bTop} width={17} height={bH} fill={col} rx="2" />
            <rect x={cd.x + 7} y={wTop} width={3}  height={wH} fill={col} rx="1" />
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userName, setUserName]             = useState<string | null>(null);
  const [hour, setHour]             = useState(new Date().getHours());
  const [mktOpen, setMktOpen]       = useState(isMarketOpen());
  const [timer, setTimer]           = useState(calcCountdown());
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Any logged-in user belongs in the dashboard, not the marketing page.
        // home.tsx handles onboarding state from there.
        router.push("/home");
        return;
      }
      setIsCheckingAuth(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setHour(new Date().getHours());
      setMktOpen(isMarketOpen());
      setTimer(calcCountdown());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (isCheckingAuth) {
    return (
      <div style={{ background: C.deep, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${C.teal}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <style>{KEYFRAMES}</style>
      </div>
    );
  }

  const greet = greetingFor(hour);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Dancing+Script:wght@600;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{KEYFRAMES}</style>

      <SEO
        title="She Blooms Wealth — Free Financial Education for Women"
        description="Learn investing, budgeting, side hustles, and trading strategies with Pansy, your friendly AI guide. 150+ plain-language lessons, paper trading simulator, budget tracker, broker comparison, 6 side hustle journeys, 32 trading strategies, and a certificate of completion. Built for women. No jargon."
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://shebloomswealth.app/#organization",
              name: "She Blooms Wealth",
              url: "https://shebloomswealth.app",
              logo: "https://shebloomswealth.app/bloom-logo.png",
              description: "Financial education platform built for women — teaching investing, budgeting, and side hustles in plain language.",
              foundingDate: "2026",
              founder: { "@type": "Organization", name: "Cinder Vault Enterprises LLC" },
            },
            {
              "@type": "SoftwareApplication",
              "@id": "https://shebloomswealth.app/#app",
              name: "Bloom",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Android, Web",
              offers: [
                { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free tier with lessons, paper trading, and budget tracker" },
                { "@type": "Offer", price: "7.99", priceCurrency: "USD", billingIncrement: "P1M", description: "Bloom Pro monthly" },
                { "@type": "Offer", price: "49.99", priceCurrency: "USD", billingIncrement: "P1Y", description: "Bloom Pro yearly" },
              ],
              description: "Free financial education app for women. 150+ lessons on investing, budgeting, and side hustles. Paper trading simulator with $10K virtual money. AI guide Pansy explains everything in plain language.",
              url: "https://shebloomswealth.app",
              publisher: { "@id": "https://shebloomswealth.app/#organization" },
            },
            {
              "@type": "WebSite",
              "@id": "https://shebloomswealth.app/#website",
              url: "https://shebloomswealth.app",
              name: "She Blooms Wealth",
              publisher: { "@id": "https://shebloomswealth.app/#organization" },
            },
          ],
        }}
      />

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.deep, color: C.ivory, minHeight: "100vh", paddingTop: 36 }}>

        {/* ── TICKER BAR ──────────────────────────────────────────────────── */}
        <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:36, overflow:"hidden", background:"rgba(14,27,48,0.94)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", height:"100%", animation:"ticker-scroll 38s linear infinite", whiteSpace:"nowrap", willChange:"transform" }}>
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:5, paddingRight:44, fontSize:11, fontWeight:500, letterSpacing:"0.05em" }}>
                <span style={{ color:"rgba(244,247,250,0.40)" }}>{t.s}</span>
                <span style={{ color: t.up ? C.green : C.red }}>{t.up ? "▲" : "▼"} {t.c}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── NAVIGATION ──────────────────────────────────────────────────── */}
        <nav style={{ position:"sticky", top:36, zIndex:50, background:"rgba(14,27,48,0.90)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>

            {/* Logo + wordmark */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ animation:"breathe 8s ease-in-out infinite" }}>
                <Image src="/bloom-logo.png" alt="Bloom" width={36} height={36}
                  style={{ borderRadius:"50%", animation:"glow-pulse 7s ease-in-out infinite", display:"block" }} />
              </div>
              <div style={{ lineHeight:1.15 }}>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontWeight:700, fontSize:18, letterSpacing:"0.01em", color:C.ivory }}>Bloom</div>
                <div style={{ fontSize:9, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(244,247,250,0.35)" }}>She Blooms Wealth</div>
              </div>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex" style={{ alignItems:"center", gap:26 }}>
              {([
                { label:"Home",            href:"/"                 },
                { label:"Daily Bloom",     href:"/daily-bloom"      },
                { label:"Market Insights", href:"/market-insights"  },
                { label:"About",           href:"/about"            },
              ] as const).map(({ label, href }) => {
                const active = href === "/";
                return (
                  <Link key={label} href={href} style={{ fontSize:13, fontWeight: active ? 600 : 500, color: active ? C.teal : "rgba(244,247,250,0.58)", textDecoration:"none", transition:"color 0.2s", borderBottom: active ? `2px solid ${C.teal}` : "2px solid transparent", paddingBottom:2 }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.ivory)}
                    onMouseLeave={e => (e.currentTarget.style.color = active ? C.teal : "rgba(244,247,250,0.58)")}
                  >{label}</Link>
                );
              })}
            </div>

            {/* Right side */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {/* Market status pill */}
              <div className="hidden sm:flex" style={{ alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background: mktOpen ? C.green : "#6b7a8d" }} />
                <span style={{ fontSize:11, fontWeight:600, color: mktOpen ? C.green : "rgba(244,247,250,0.38)" }}>
                  {mktOpen ? "Markets Open" : "Markets Closed"}
                </span>
              </div>

              <Link href="/onboarding">
                <button style={{ padding:"9px 18px", borderRadius:8, ...gradientBg, color:C.deep, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", whiteSpace:"nowrap", transition:"box-shadow 0.2s, transform 0.2s", boxShadow:`0 4px 20px rgba(39,183,200,0.22)` }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 28px rgba(39,183,200,0.40)`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = `0 4px 20px rgba(39,183,200,0.22)`; }}
                >
                  Start Learning Free
                </button>
              </Link>

              <button className="md:hidden" onClick={() => setMenuOpen(o => !o)}
                style={{ padding:6, background:"none", border:"none", color:C.ivory, cursor:"pointer" }}>
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div style={{ background:"rgba(14,27,48,0.97)", backdropFilter:"blur(20px)", padding:"0.75rem 1.5rem 1rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
              {([
                { label:"Home",            href:"/"                },
                { label:"Daily Bloom",     href:"/daily-bloom"     },
                { label:"Market Insights", href:"/market-insights" },
                { label:"About",           href:"/about"           },
              ] as const).map(({ label, href }) => (
                <Link key={label} href={href} onClick={() => setMenuOpen(false)}
                  style={{ display:"block", padding:"11px 0", fontSize:15, fontWeight:500, color:"rgba(244,247,250,0.68)", textDecoration:"none", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  {label}
                </Link>
              ))}
              <Link href="/onboarding">
                <button style={{ width:"100%", marginTop:12, padding:13, borderRadius:9, ...gradientBg, color:C.deep, fontSize:14, fontWeight:700, border:"none", cursor:"pointer" }}>
                  Start Learning Free
                </button>
              </Link>
            </div>
          )}
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section style={{ position:"relative", overflow:"hidden", minHeight:"calc(100vh - 100px)" }}>
          <HeroBg />

          <div className="flex flex-col md:flex-row md:items-center"
            style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"clamp(3rem,6vw,5.5rem) 1.5rem clamp(4rem,7vw,6rem)", gap:"clamp(2.5rem,5vw,4rem)" }}>

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div style={{ flex:"0 0 54%" }}>

              {/* Free badge */}
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, marginBottom:"1.25rem", animation:"fade-up 0.55s ease-out 0.1s both", background:"rgba(73, 176, 110, 0.12)", border:"1px solid rgba(73, 176, 110, 0.25)" }}>
                <span style={{ fontSize:13 }}>🌱</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.green, letterSpacing:"0.04em" }}>100% Free to Start — No Credit Card</span>
              </div>

              {/* Headline */}
              <div style={{ marginBottom:"1.25rem", animation:"fade-up 0.55s ease-out 0.2s both" }}>
                <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(2.3rem, 5vw, 3.6rem)", fontWeight:700, lineHeight:1.12, letterSpacing:"-0.01em", color:C.ivory, margin:0 }}>
                  Learn to build wealth
                  <br />
                  <span style={{ ...gradientText }}>from scratch.</span>
                </h1>
              </div>

              {/* Sub-copy — clear value prop */}
              <p style={{ fontSize:"clamp(1rem, 1.9vw, 1.12rem)", lineHeight:1.72, color:"rgba(244,247,250,0.72)", maxWidth:480, marginBottom:"1rem", animation:"fade-up 0.55s ease-out 0.28s both" }}>
                Bloom is a <strong style={{ color:C.ivory }}>free financial education app</strong> that teaches you <em>everything</em> — not just investing.
                Budgeting, side hustles, real estate, retirement, trading psychology, and how money actually works.
              </p>

              <p style={{ fontSize:"clamp(0.88rem, 1.6vw, 0.95rem)", lineHeight:1.65, color:"rgba(244,247,250,0.55)", maxWidth:460, marginBottom:"1.8rem", animation:"fade-up 0.55s ease-out 0.34s both" }}>
                Your friendly guide Pansy walks you through 150+ lessons and strategies — from beginner to advanced — gives you a paper trading simulator to practice risk-free,
                and awards you a certificate when you complete the program. Built for women. No jargon. No judgment.
              </p>

              {/* Buttons */}
              <div style={{ display:"flex", marginBottom:"2.8rem", animation:"fade-up 0.55s ease-out 0.44s both" }}>
                <Link href="/onboarding">
                  <button style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 26px", borderRadius:10, ...gradientBg, color:C.deep, fontSize:15, fontWeight:700, border:"none", cursor:"pointer", boxShadow:`0 8px 30px rgba(39,183,200,0.28)`, transition:"transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 14px 40px rgba(39,183,200,0.44)`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow=`0 8px 30px rgba(39,183,200,0.28)`; }}
                  >
                    Start Learning Free <ArrowRight size={16} />
                  </button>
                </Link>
              </div>

              {/* Floating index cards */}
              <div style={{ display:"flex", gap:12, flexWrap:"wrap", animation:"fade-up 0.55s ease-out 0.56s both" }}>
                {INDEX_CARDS.map((card, i) => (
                  <div key={card.label} style={{ ...glass, borderRadius:14, padding:"13px 16px", minWidth:126, boxShadow:"0 4px 24px rgba(0,0,0,0.30)", animation:`${["float-a","float-b","float-c"][i]} ${[6,7.2,5.6][i]}s ease-in-out infinite` }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"rgba(244,247,250,0.40)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>{card.label}</div>
                    <div style={{ fontSize:16, fontWeight:700, color:C.ivory, marginBottom:2 }}>{card.value}</div>
                    <div style={{ fontSize:12, fontWeight:700, color: card.up ? C.green : C.red, marginBottom:7 }}>
                      {card.up ? "▲" : "▼"} {card.change}
                    </div>
                    <MiniChart pts={card.pts} up={card.up} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT COLUMN — Pansy ────────────────────────────────────── */}
            <div style={{ flex:1, position:"relative", display:"flex", justifyContent:"center", minHeight:420 }}>

              {/* Glow halo */}
              <div style={{ position:"absolute", inset:"5%", borderRadius:"50%", background:`radial-gradient(circle, ${C.teal}22 0%, transparent 68%)`, filter:"blur(50px)", animation:"orb-pulse 7s ease-in-out infinite", pointerEvents:"none" }} />

              {/* Candlestick backdrop */}
              <div style={{ position:"absolute", inset:0, borderRadius:"1.75rem", overflow:"hidden", pointerEvents:"none" }}>
                <CandleBg />
              </div>

              {/* Pansy image */}
              <div style={{ position:"relative", width:"100%", maxWidth:430, zIndex:2 }}>
                <Image
                  src="/pansy-hero.png"
                  alt="Pansy — your investing education guide"
                  width={500} height={580} priority
                  className="rounded-3xl object-cover w-full"
                  style={{ position:"relative", zIndex:2, height:"auto" }}
                />

                {/* Speech bubble */}
                <div style={{ position:"absolute", bottom:"7%", left:"-6%", right:"3%", zIndex:10, ...glass, borderRadius:16, padding:"15px 17px", border:`1px solid ${C.teal}28`, boxShadow:`0 8px 32px rgba(39,183,200,0.12), inset 0 1px 0 rgba(255,255,255,0.05)` }}>
                  <div style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                    <Image src="/bloom-logo.png" alt="Pansy" width={26} height={26}
                      style={{ borderRadius:"50%", flexShrink:0, marginTop:2, background:"white", display:"block" }} />
                    <p style={{ margin:0, fontSize:12.5, lineHeight:1.62, color:"rgba(244,247,250,0.88)" }}>
                      Hi, I&apos;m Pansy 🌿<br />
                      I&apos;m here to help you understand money, markets, and investing in a way that finally makes sense.{" "}
                      <span style={{ color:C.teal, fontWeight:600 }}>We&apos;re growing together.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT YOU GET ─────────────────────────────────────────────────── */}
        <section style={{ background:"rgba(22,38,74,0.45)", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"3rem 1.5rem" }}>
            <p style={{ textAlign:"center", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:C.teal, marginBottom:10 }}>Everything You Need — All Free</p>
            <h2 style={{ textAlign:"center", fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(1.6rem, 3.5vw, 2.2rem)", fontWeight:700, color:C.ivory, marginBottom:"2rem" }}>
              Financial literacy is more than just stocks
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16 }}>
              {[
                { icon:"📖", title:"150+ Lessons & Strategies", desc:"Beginner to advanced. Stocks, ETFs, options, dividends, real estate, budgeting, retirement, trading psychology — plus a full university with 9 deep-dive modules." },
                { icon:"📊", title:"Paper Trading Simulator", desc:"Practice buying and selling stocks with $10,000 fake money. Real market prices, zero risk. Test 32 strategies before you risk a cent." },
                { icon:"🌺", title:"Your Friendly Guide — Pansy", desc:"Your personal financial coach who explains everything in plain language. Ask anything, get honest answers. No jargon, no judgment." },
                { icon:"🏦", title:"Budget Tracker", desc:"See where your money actually goes. Track expenses by category, get Pansy's tips, and build the habits that lead to wealth." },
                { icon:"💰", title:"12-Step Side Hustle Journeys", desc:"Pick a hustle — dropshipping, TikTok Shop, UGC, digital products, freelancing, or content creation — and follow 12 guided steps to launch your business from $0." },
                { icon:"🎓", title:"Earn Your Certificate", desc:"Complete the program and earn a real certificate of completion. Track your progress with daily streaks, achievement badges, XP levels, and leaderboards." },
              ].map((item) => (
                <div key={item.title} style={{ ...glass, borderRadius:14, padding:"1.25rem", boxShadow:"0 4px 24px rgba(0,0,0,0.24)" }}>
                  <span style={{ fontSize:24, display:"block", marginBottom:10 }}>{item.icon}</span>
                  <p style={{ fontSize:14, fontWeight:700, color:C.ivory, marginBottom:6 }}>{item.title}</p>
                  <p style={{ fontSize:12, lineHeight:1.6, color:"rgba(244,247,250,0.55)", margin:0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DASHBOARD CARDS ─────────────────────────────────────────────── */}
        <section style={{ maxWidth:1200, margin:"0 auto", padding:"3.5rem 1.5rem 1rem" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))", gap:16 }}>

            {/* Card 1 — Today's Brief */}
            <div style={{ ...glass, borderRadius:16, padding:"1.25rem 1.3rem", boxShadow:"0 4px 28px rgba(0,0,0,0.28)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"rgba(244,247,250,0.40)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Today&apos;s Brief</span>
                <span style={{ fontSize:16 }}>☀️</span>
              </div>
              <div>
                {[
                  { label:"Market",       value:"Bullish",    color:C.green, suffix:"▲" },
                  { label:"Fear & Greed", value:"62",         color:C.green, bar:true },
                  { label:"Top Sector",   value:"Technology", color:C.teal },
                ].map(({ label, value, color, suffix, bar }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:10, marginBottom:10, borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize:13, color:"rgba(244,247,250,0.55)" }}>{label}</span>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      {bar && (
                        <div style={{ width:46, height:5, borderRadius:3, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                          <div style={{ width:"62%", height:"100%", background:color, borderRadius:3 }} />
                        </div>
                      )}
                      <span style={{ fontSize:13, fontWeight:700, color }}>{suffix ? `${value} ${suffix}` : value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — In Focus Today (Most Active) */}
            <div style={{ ...glass, borderRadius:16, padding:"1.25rem 1.3rem", boxShadow:"0 4px 28px rgba(0,0,0,0.28)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"rgba(244,247,250,0.40)", letterSpacing:"0.1em", textTransform:"uppercase" }}>In Focus Today</span>
                <span style={{ fontSize:9, padding:"2px 7px", borderRadius:4, background:`${C.teal}18`, color:C.teal, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Most Active</span>
              </div>
              {[
                { t:"NVDA", c:"+3.42%", up:true,  v:"89.2M" },
                { t:"TSLA", c:"−1.81%", up:false, v:"71.3M" },
                { t:"AAPL", c:"+0.84%", up:true,  v:"65.1M" },
                { t:"MSFT", c:"−0.12%", up:false, v:"42.8M" },
              ].map((s, i, arr) => (
                <div key={s.t} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C.ivory }}>{s.t}</span>
                  <span style={{ fontSize:10, color:"rgba(244,247,250,0.32)" }}>Vol {s.v}</span>
                  <span style={{ fontSize:13, fontWeight:700, color: s.up ? C.green : C.red }}>{s.c}</span>
                </div>
              ))}
            </div>

            {/* Card 3 — Today's Lesson */}
            <div style={{ ...glass, borderRadius:16, padding:"1.25rem 1.3rem", boxShadow:"0 4px 28px rgba(0,0,0,0.28)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"rgba(244,247,250,0.40)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Today&apos;s Lesson</span>
                <span style={{ fontSize:16 }}>📚</span>
              </div>
              <p style={{ fontSize:15, fontWeight:700, color:C.ivory, margin:"0 0 8px" }}>What is a Dividend?</p>
              <p style={{ fontSize:12, color:"rgba(244,247,250,0.48)", margin:"0 0 16px", lineHeight:1.55 }}>
                How companies share profits with investors and why dividends matter for long-term wealth.
              </p>
              <div style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, color:"rgba(244,247,250,0.32)" }}>Progress</span>
                  <span style={{ fontSize:11, fontWeight:700, color:C.teal }}>40%</span>
                </div>
                <div style={{ height:4, borderRadius:2, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                  <div style={{ width:"40%", height:"100%", background:`linear-gradient(90deg, ${C.teal}, ${C.green})`, borderRadius:2 }} />
                </div>
              </div>
              <Link href="/home">
                <button style={{ width:"100%", padding:"9px", borderRadius:8, background:`${C.teal}18`, border:`1px solid ${C.teal}28`, color:C.teal, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5, transition:"background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${C.teal}28`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `${C.teal}18`)}
                >
                  Continue Lesson <ArrowRight size={13} />
                </button>
              </Link>
            </div>

            {/* Card 4 — Market Countdown */}
            <div style={{ ...glass, borderRadius:16, padding:"1.25rem 1.3rem", boxShadow:"0 4px 28px rgba(0,0,0,0.28)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(244,247,250,0.38)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>
                {mktOpen ? "Market Closes In" : "Market Opens In"}
              </div>
              <div style={{ fontSize:34, fontFamily:"'Cormorant Garamond', serif", fontWeight:700, color: mktOpen ? C.green : C.teal, letterSpacing:"0.08em", marginBottom:14, lineHeight:1 }}>
                {timer}
              </div>
              <div style={{ fontSize:30, marginBottom:10 }}>☕</div>
              <p style={{ fontSize:12, color:"rgba(244,247,250,0.38)", margin:"0 0 16px", maxWidth:140, lineHeight:1.5 }}>
                {mktOpen ? "Markets are live right now" : "Time to study before the bell"}
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background: mktOpen ? C.green : "#5a6a7a" }} />
                <span style={{ fontSize:11, fontWeight:600, color: mktOpen ? C.green : "rgba(244,247,250,0.32)" }}>
                  {mktOpen ? "NYSE & NASDAQ open" : "Pre-market hours"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. PANSY'S STORY ─────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 py-14 md:px-12 md:py-20">

          {/* Story header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mb-5"
              style={{ background:`${C.green}18`, color:C.green, border:`1px solid ${C.green}30` }}>
              🌺 Before she was your guide
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4" style={{ fontFamily:"'Cormorant Garamond', serif", color:C.ivory }}>
              Pansy&apos;s story is probably <span style={gradientText}>your story too</span>
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color:"rgba(244,247,250,0.55)" }}>
              She didn&apos;t come from money. She built it — one decision at a time.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">

            {/* Pansy image */}
            <div className="flex-shrink-0 flex justify-center md:w-2/5">
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20"
                  style={{ background:`radial-gradient(circle at 50% 60%, ${C.green}, transparent 70%)` }} />
                <Image src="/pansy-coffee.png" alt="Pansy, your friendly financial education guide" width={360} height={420}
                  className="relative rounded-3xl object-cover w-full" />
              </div>
            </div>

            {/* Story timeline */}
            <div className="flex-1 space-y-0">
              {[
                {
                  emoji: "😔",
                  title: "Single mom. Two kids. Barely making it.",
                  text: "Pansy was working a job that didn't pay enough. Underemployed, underpaid, exhausted. She thought about getting a second job — but daycare would eat every dollar she earned. The math never worked.",
                },
                {
                  emoji: "💡",
                  title: "One night, she Googled \"how to make money from home.\"",
                  text: "While the kids were sleeping, she started learning. Side hustles. Dropshipping. Digital products. Things she could build from her phone after bedtime. No boss. No babysitter. No permission needed.",
                },
                {
                  emoji: "📒",
                  title: "First, she learned where her money was going.",
                  text: "Before she could grow money, she had to stop losing it. She tracked every dollar. Cut what didn't matter. Found $300 a month she didn't know she had. Budgeting wasn't boring — it was freedom.",
                },
                {
                  emoji: "📈",
                  title: "The side hustle money started coming in.",
                  text: "It wasn't a flood — it was a trickle. Then a stream. She didn't spend it. She learned about investing. Stocks, ETFs, dividends. She put that extra income to work while she slept.",
                },
                {
                  emoji: "🔥",
                  title: "She fired her boss.",
                  text: "It didn't happen overnight. But one morning she did the math and realized her investments and her side hustle income covered her bills. She walked in, gave her notice, and never looked back.",
                },
                {
                  emoji: "🌸",
                  title: "Now she's actually living.",
                  text: "Picking her kids up from school. Making Tuesday pancakes. Taking trips that used to be \"someday\" trips. Creating memories instead of missing them. Not rich — free.",
                },
              ].map((step, i, arr) => (
                <div key={i} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ background: i === arr.length - 1 ? `linear-gradient(135deg, ${C.teal}, ${C.green})` : "rgba(255,255,255,0.06)", border: i === arr.length - 1 ? "none" : "1px solid rgba(255,255,255,0.08)" }}>
                      {step.emoji}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-px flex-1 min-h-[24px]" style={{ background:`linear-gradient(to bottom, rgba(39,183,200,0.3), rgba(39,183,200,0.05))` }} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-8">
                    <p className="text-sm font-bold mb-1.5" style={{ color:C.ivory }}>{step.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color:"rgba(244,247,250,0.58)" }}>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emotional bridge + what you get */}
          <div className="mt-10 md:mt-14 text-center space-y-6">
            <div style={{ ...glass, borderRadius:16, padding:"1.5rem 1.75rem", maxWidth:640, margin:"0 auto", boxShadow:`0 4px 28px rgba(0,0,0,0.28)` }}>
              <p className="text-base leading-relaxed italic" style={{ color:"rgba(244,247,250,0.82)" }}>
                &ldquo;That&apos;s the dream, right? Not a mansion or a yacht. Just <strong style={{ color:C.ivory }}>time</strong>.
                Time with your kids. Time for yourself. Time to live while you&apos;re alive.
                I built Bloom so you don&apos;t have to figure it out alone like I did.&rdquo;
              </p>
              <p className="text-sm font-semibold mt-3" style={{ color:C.teal }}>— Pansy</p>
            </div>

            <p className="text-sm font-semibold pt-4" style={{ color:"rgba(244,247,250,0.50)" }}>
              EVERYTHING PANSY LEARNED IS NOW INSIDE BLOOM — FOR FREE
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
              {[
                { num: "150+", label: "Lessons & Strategies" },
                { num: "6", label: "Side Hustle Journeys" },
                { num: "$10K", label: "Paper Trading Sim" },
                { num: "1", label: "Certificate of Completion" },
              ].map(stat => (
                <div key={stat.label} style={{ ...glass, borderRadius:12, padding:"1rem 0.75rem" }}>
                  <p className="text-xl font-bold" style={gradientText}>{stat.num}</p>
                  <p className="text-xs mt-1" style={{ color:"rgba(244,247,250,0.50)" }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs pt-2" style={{ color:"rgba(244,247,250,0.30)" }}>
              Educational only. Not financial advice. Pansy never tells you what to buy or sell.
            </p>
          </div>
        </section>

        {/* ── 3. CLOSING CTA BAND ─────────────────────────────────────────── */}
        <section style={{ background: C.brand }}>
          <div className="max-w-3xl mx-auto px-4 py-16 md:px-12 md:py-24 text-center space-y-8">
            <p className="text-4xl">🌺</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color:C.ivory }}>
              150+ lessons. 32 strategies. A certificate at the end.<br />
              <span style={gradientText}>Your financial independence starts today.</span>
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color:"rgba(244,247,250,0.60)" }}>
              Join thousands of women learning to invest, build side hustles, and take control of their money — beginner to advanced, completely free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold shadow-xl"
                  style={{ ...gradientBg, color:C.deep }}>
                  Start Learning Free
                </button>
              </Link>
              {canShowExternalPayment && (
                <Link href="/subscription" className="text-sm font-medium" style={{ color:"rgba(244,247,250,0.55)" }}>
                  Explore Bloom Pro
                </Link>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs" style={{ color:"rgba(244,247,250,0.45)" }}>
              <span>🔒 Secure &amp; Private</span>
              <span>·</span>
              <span>📚 Educational Platform — Not Financial Advice</span>
              <span>·</span>
              <span>🌸 Built for Women</span>
            </div>
            <p className="text-sm italic pt-4" style={{ color:"rgba(244,247,250,0.40)" }}>
              &ldquo;Knowledge is the seed. Confidence is the bloom. Wealth is the harvest.&rdquo; — Pansy
            </p>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer style={{ background:C.deep, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-6xl mx-auto px-4 py-10 md:px-12">
            <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12 mb-8">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Image src="/bloom-logo.png" alt="Bloom" width={24} height={24} className="rounded-full bg-[#F4F7FA]" />
                  <p className="text-sm font-semibold" style={{ color:"rgba(244,247,250,0.60)" }}>She Blooms Wealth</p>
                </div>
                <p className="text-xs" style={{ color:"rgba(244,247,250,0.35)" }}>Invest in yourself first 🌸</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color:"rgba(244,247,250,0.35)" }}>Legal</p>
                <div className="flex flex-col gap-1.5">
                  {[{ label:"Privacy Policy", href:"/privacy" }, { label:"Terms of Service", href:"/terms" }, { label:"Disclaimer", href:"/disclaimer" }].map(({ label, href }) => (
                    <Link key={href} href={href} className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>{label}</Link>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color:"rgba(244,247,250,0.35)" }}>Account</p>
                <div className="flex flex-col gap-1.5">
                  {[{ label:"Get started free", href:"/onboarding" }, { label:"Sign in", href:"/onboarding" }, ...(canShowExternalPayment ? [{ label:"Bloom Pro", href:"/subscription" }] : [])].map(({ label, href }) => (
                    <Link key={label} href={href} className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>{label}</Link>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color:"rgba(244,247,250,0.35)" }}>Contact</p>
                <div className="flex flex-col gap-1.5">
                  <Link href="/contact" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Contact Us</Link>
                  <a href="mailto:cindervaultenterprisesllc@gmail.com" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>cindervaultenterprisesllc@gmail.com</a>
                </div>
              </div>
            </div>
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }} className="pt-6 space-y-2">
              <p className="text-xs" style={{ color:"rgba(244,247,250,0.28)" }}>
                © 2026 Cinder Vault Enterprises LLC. All rights reserved. Bloom is a product of Cinder Vault Enterprises LLC.
              </p>
              <p className="text-xs" style={{ color:"rgba(244,247,250,0.22)" }}>
                Bloom is for educational purposes only and does not constitute financial advice. All investing involves risk of loss, including possible loss of principal. Past performance does not guarantee future results. The decision is always yours.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
