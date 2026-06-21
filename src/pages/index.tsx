import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Menu, X, ArrowRight, Play } from "lucide-react";

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
  const [userName, setUserName]     = useState<string | null>(null);
  const [hour, setHour]             = useState(new Date().getHours());
  const [mktOpen, setMktOpen]       = useState(isMarketOpen());
  const [timer, setTimer]           = useState(calcCountdown());
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete, full_name")
          .eq("id", session.user.id)
          .single();
        if (profile?.onboarding_complete) { router.push("/home"); return; }
        if (profile?.full_name) setUserName((profile.full_name as string).split(" ")[0]);
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
        title="She Blooms Wealth — Investing Education for Women"
        description="Learn how money really works. Pansy, your AI education guide, helps women build investing confidence one lesson at a time."
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
              {["Home","Learn","Daily Bloom","Market Insights","About"].map(l => (
                <a key={l} href="#" style={{ fontSize:13, fontWeight:500, color:"rgba(244,247,250,0.58)", textDecoration:"none", transition:"color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.ivory)}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(244,247,250,0.58)")}
                >{l}</a>
              ))}
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
              {["Home","Learn","Daily Bloom","Market Insights","About"].map(l => (
                <a key={l} href="#" onClick={() => setMenuOpen(false)}
                  style={{ display:"block", padding:"11px 0", fontSize:15, fontWeight:500, color:"rgba(244,247,250,0.68)", textDecoration:"none", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  {l}
                </a>
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

              {/* Greeting */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1.5rem", animation:"fade-up 0.55s ease-out 0.1s both" }}>
                <span style={{ fontSize:17 }}>
                  {hour < 12 ? "☀️" : hour < 17 ? "🌤️" : "🌙"}
                </span>
                <span style={{ fontSize:13.5, fontWeight:500, color:"rgba(244,247,250,0.58)" }}>
                  {greet}{userName ? `, ${userName}` : ""}
                </span>
                <Image src="/bloom-logo.png" alt="" width={16} height={16} style={{ borderRadius:"50%", opacity:0.55, background:"white" }} />
              </div>

              {/* Headline */}
              <div style={{ marginBottom:"1.5rem", animation:"fade-up 0.55s ease-out 0.2s both" }}>
                <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(2.5rem, 5.2vw, 4rem)", fontWeight:700, lineHeight:1.1, letterSpacing:"-0.01em", color:C.ivory, margin:0 }}>
                  Understand today.
                  <br />
                  Invest tomorrow.
                  <br />
                  <span style={{ fontFamily:"'Dancing Script', cursive", fontWeight:700, fontSize:"clamp(2.7rem, 5.6vw, 4.3rem)", position:"relative", display:"inline-block", ...gradientText }}>
                    Bloom forever.
                    <svg style={{ position:"absolute", bottom:-8, left:2, overflow:"visible" }} width="230" height="12">
                      <path d="M 0 6 Q 57 1, 115 6 Q 173 11, 230 6"
                        stroke={C.teal} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.65"
                        style={{ strokeDasharray:320, animation:"underline-draw 1.4s cubic-bezier(0.4,0,0.2,1) 0.9s both" }} />
                    </svg>
                  </span>
                </h1>
              </div>

              {/* Sub-copy */}
              <p style={{ fontSize:"clamp(1rem, 1.9vw, 1.12rem)", lineHeight:1.68, color:"rgba(244,247,250,0.62)", maxWidth:470, marginBottom:"2.2rem", animation:"fade-up 0.55s ease-out 0.32s both" }}>
                Bloom teaches women how money really works, so you can grow wealth with confidence.
                One lesson. One step. One bloom at a time.
              </p>

              {/* Buttons */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginBottom:"2.8rem", animation:"fade-up 0.55s ease-out 0.44s both" }}>
                <Link href="/onboarding">
                  <button style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 26px", borderRadius:10, ...gradientBg, color:C.deep, fontSize:15, fontWeight:700, border:"none", cursor:"pointer", boxShadow:`0 8px 30px rgba(39,183,200,0.28)`, transition:"transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 14px 40px rgba(39,183,200,0.44)`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow=`0 8px 30px rgba(39,183,200,0.28)`; }}
                  >
                    Start Learning Free <ArrowRight size={16} />
                  </button>
                </Link>
                <button style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 26px", borderRadius:10, ...glass, border:`1px solid ${C.teal}38`, color:C.teal, fontSize:15, fontWeight:600, cursor:"pointer", transition:"background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = `rgba(39,183,200,0.10)`)}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(22,38,74,0.55)")}
                >
                  <Play size={14} fill={C.teal} /> Watch How It Works
                </button>
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

        {/* ── TRUST BAR ───────────────────────────────────────────────────── */}
        <div style={{ ...glass, borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"1rem 1.5rem", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:"1.5rem" }}>
            {[
              { icon:"🔒", title:"Secure & Private",       body:"Your data is safe." },
              { icon:"📚", title:"Educational Platform",   body:"Not financial advice." },
              { icon:"🌸", title:"Trusted by Women",       body:"Like you." },
              { icon:"⭐", title:"4.9 / 5 Rating",         body:"From 10,000+ learners." },
            ].map((t, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                {i > 0 && <div className="hidden sm:block" style={{ width:1, height:22, background:"rgba(255,255,255,0.08)", marginRight:8 }} />}
                <span style={{ fontSize:15 }}>{t.icon}</span>
                <span style={{ fontSize:12, fontWeight:600, color:C.ivory }}>{t.title}</span>
                <span style={{ fontSize:12, color:"rgba(244,247,250,0.42)" }}>— {t.body}</span>
              </div>
            ))}
          </div>
        </div>

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
              <Link href="/onboarding">
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

        {/* ── 2. COST OF NOT KNOWING ──────────────────────────────────────── */}
        <section style={{ background: C.surface }} className="mt-16">
          <div className="max-w-6xl mx-auto px-4 py-14 md:px-12 md:py-20">
            <div className="max-w-2xl mx-auto text-center space-y-4 mb-14">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: C.ivory }}>
                The cost of not knowing
              </h2>
              <p className="text-lg" style={{ color: "rgba(244,247,250,0.65)" }}>
                Not investing isn&apos;t the safe choice. Here&apos;s what the knowledge gap quietly costs.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon:"📉", title:"Inflation quietly erodes your money", body:"Every year you hold cash, it buys a little less. Inflation is a silent tax on savings that don't grow." },
                { icon:"🐢", title:"Savings grow slower than prices", body:"A 0.5% savings rate can't keep up with 3–4% inflation. The gap between what you save and what things cost keeps widening." },
                { icon:"📈", title:"Companies keep growing without you", body:"Every day the market grows, people who invested in it build wealth. The ticker moves whether you're in it or not." },
                { icon:"⏳", title:"Time is your greatest advantage — and it keeps moving", body:"Compound growth is most powerful when you start early. Every year you wait is a year of compounding you can't get back." },
                { icon:"💡", title:"The biggest risk isn't investing — it's never learning how", body:"Fear of the market feels safe. But decades of missed growth is its own kind of loss. Knowledge is what breaks that cycle." },
              ].map(({ icon, title, body }) => (
                <div key={title} className="rounded-2xl p-6 space-y-3"
                  style={{ background:"rgba(14,27,48,0.6)", border:"1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-2xl">{icon}</span>
                  <h3 className="font-semibold text-base" style={{ color: C.teal }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color:"rgba(244,247,250,0.62)" }}>{body}</p>
                </div>
              ))}
              <div className="rounded-2xl p-6 flex items-center justify-center text-center"
                style={{ background:`linear-gradient(135deg, ${C.teal}18, ${C.green}18)`, border:`1px solid ${C.teal}33` }}>
                <p className="text-base font-medium leading-relaxed" style={{ color: C.ivory }}>
                  Understanding markets is a skill — and every skill can be learned. That&apos;s exactly what Bloom is for.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. MEET PANSY ───────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 py-14 md:px-12 md:py-20">
          <div className="flex flex-col md:flex-row items-start gap-10 md:gap-14">
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20"
                  style={{ background:`radial-gradient(circle at 50% 60%, ${C.green}, transparent 70%)` }} />
                <Image src="/pansy-coffee.png" alt="Pansy, your AI investing education guide" width={360} height={420}
                  className="relative rounded-3xl object-cover w-full" />
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
                style={{ background:`${C.green}18`, color:C.green, border:`1px solid ${C.green}30` }}>
                🌺 Meet your guide
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color:C.ivory }}>
                Meet Pansy
              </h2>
              <p className="text-lg leading-relaxed" style={{ color:"rgba(244,247,250,0.72)" }}>
                I won&apos;t just hand you answers — I&apos;ll show you how to think for yourself.
              </p>
              <ul className="space-y-3">
                {[
                  "Understand stocks, ETFs, and how markets actually work",
                  "Read charts with confidence, not confusion",
                  "Understand what moves a stock and why",
                  "Manage risk the way experienced investors do",
                  "Build wealth the smart way, one habit at a time",
                  "Master your investing mindset and emotions",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color:"rgba(244,247,250,0.80)" }}>
                    <span className="mt-0.5 shrink-0" style={{ color:C.green }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-base font-medium pt-2" style={{ color:C.teal }}>
                You don&apos;t have to do this alone. I&apos;ve got you.
              </p>
              <p className="text-xs" style={{ color:"rgba(244,247,250,0.35)" }}>
                Educational only. Not financial advice. Pansy never tells you what to buy or sell.
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. DAILY WITH PANSY ─────────────────────────────────────────── */}
        <section style={{ background: C.surface }}>
          <div className="max-w-6xl mx-auto px-4 py-14 md:px-12 md:py-20">
            <div className="text-center space-y-4 mb-14">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color:C.ivory }}>Your day with Pansy</h2>
              <p className="text-lg max-w-xl mx-auto" style={{ color:"rgba(244,247,250,0.62)" }}>
                Five minutes a day builds the market intuition that takes most people years to develop.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon:"☀️", title:"Market Briefing", body:"A warm, plain-English recap of what happened in the last session. No noise — just context you can actually use." },
                { icon:"📚", title:"Today's Lesson",  body:"A structured concept — from ETF basics to reading earnings reports — delivered at your pace, not Wall Street's." },
                { icon:"💬", title:"Pansy's Take",    body:"My read on what's actually moving markets right now and what it means for someone learning to invest." },
                { icon:"🌱", title:"Wealth Habit",    body:"One small, repeatable action that compounds over time — the kind of habit that separates patient investors from reactive ones." },
                { icon:"🔍", title:"One to Watch",    body:"A stock or ETF to study and understand — not to trade, but to practice reading a real business and its story." },
              ].map(({ icon, title, body }) => (
                <div key={title} className="rounded-2xl p-6 space-y-3"
                  style={{ background:`${C.deep}cc`, border:`1px solid ${C.teal}18` }}>
                  <span className="text-2xl">{icon}</span>
                  <h3 className="font-semibold text-base" style={{ color:C.ivory }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color:"rgba(244,247,250,0.60)" }}>{body}</p>
                </div>
              ))}
              <Link href="/onboarding">
                <div className="rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 h-full cursor-pointer"
                  style={{ background:`linear-gradient(135deg, ${C.teal}22, ${C.green}22)`, border:`1px solid ${C.green}33` }}>
                  <span className="text-3xl">🌺</span>
                  <p className="font-semibold" style={{ color:C.ivory }}>Start today — it&apos;s free</p>
                  <p className="text-sm" style={{ color:"rgba(244,247,250,0.55)" }}>No credit card needed</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 5. BLOOM MAKES LEARNING BEAUTIFUL ───────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 py-14 md:px-12 md:py-20">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color:C.ivory }}>Bloom makes learning beautiful</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color:"rgba(244,247,250,0.62)" }}>
              Finance tools are cold, cluttered, and built for people who already know everything.
              Bloom was designed from scratch for people who are just getting started.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon:"🗣️", title:"Simple Language", body:"No jargon, no abbreviations, no assuming you know what a P/E ratio is. We explain everything like a smart friend would.", accent:C.teal },
              { icon:"📊", title:"Real Examples",   body:"Learn with real companies, real charts, real headlines. Abstract theory is replaced by hands-on practice with live market data.", accent:C.green },
              { icon:"🪜", title:"Step by Step",    body:"Every concept builds on the last. You're never dropped into the deep end — the curriculum is built to carry you forward.", accent:C.teal },
              { icon:"🛠️", title:"Practical Tools", body:"Stock research, portfolio tracking, a market briefing — not just lessons, but the actual tools that put knowledge into practice.", accent:C.green },
              { icon:"👩", title:"Built for Women", body:"Designed with the reality of women's financial lives in mind — career gaps, caregiving, different risk timelines and goals.", accent:C.teal },
              { icon:"💰", title:"Grow Your Wealth", body:"The end goal isn't just knowledge — it's a life where you make confident, informed decisions about money that compound over time.", accent:C.green },
            ].map(({ icon, title, body, accent }) => (
              <div key={title} className="rounded-2xl p-6 space-y-3"
                style={{ background:C.surface, border:`1px solid ${accent}22` }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="w-6 h-0.5 rounded-full" style={{ background:accent }} />
                </div>
                <h3 className="font-semibold text-base" style={{ color:C.ivory }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color:"rgba(244,247,250,0.60)" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. PHONE MOCKUP ─────────────────────────────────────────────── */}
        <section style={{ background: C.surface }}>
          <div className="max-w-6xl mx-auto px-4 py-14 md:px-12 md:py-20">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
              <div className="flex-1 flex justify-center">
                <div className="relative w-[260px] rounded-[2.5rem] p-[3px] shadow-2xl"
                  style={{ background:`linear-gradient(145deg, ${C.teal}66, ${C.green}44)` }}>
                  <div className="rounded-[2.3rem] overflow-hidden" style={{ background:C.deep }}>
                    <div className="h-10 flex items-center justify-between px-6 pt-2">
                      <span className="text-[10px]" style={{ color:"rgba(244,247,250,0.4)" }}>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background:"rgba(244,247,250,0.3)" }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background:"rgba(244,247,250,0.3)" }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background:C.green }} />
                      </div>
                    </div>
                    <div className="px-5 pb-8 pt-2 space-y-4">
                      <div>
                        <p className="text-xs font-semibold" style={{ color:"rgba(244,247,250,0.45)" }}>Welcome back</p>
                        <p className="text-base font-bold" style={{ color:C.ivory }}>Today in markets</p>
                      </div>
                      <div className="rounded-2xl p-3 space-y-2" style={{ background:C.surface, border:`1px solid ${C.teal}25` }}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">☕</span>
                          <p className="text-xs font-semibold" style={{ color:C.teal }}>Market Briefing</p>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color:"rgba(244,247,250,0.72)" }}>
                          The latest session was a mixed story — tech steadied, while energy pulled back on softer demand signals. Volatility stayed calm.
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Image src="/bloom-logo.png" alt="Pansy" width={24} height={24}
                          className="rounded-full mt-0.5 bg-white shrink-0" />
                        <div className="rounded-xl rounded-tl-sm px-3 py-2" style={{ background:`${C.brand}80` }}>
                          <p className="text-[11px] leading-relaxed" style={{ color:"rgba(244,247,250,0.80)" }}>
                            Mixed sessions like this are normal — they&apos;re where a patient investor simply waits and learns.
                          </p>
                        </div>
                      </div>
                      <div className="rounded-xl px-3 py-2 flex items-center justify-between"
                        style={{ background:`${C.green}18`, border:`1px solid ${C.green}30` }}>
                        <div>
                          <p className="text-[10px]" style={{ color:"rgba(244,247,250,0.45)" }}>Today&apos;s lesson</p>
                          <p className="text-xs font-semibold" style={{ color:C.ivory }}>How to read a P/E ratio</p>
                        </div>
                        <span className="text-base">📚</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color:C.ivory }}>
                  Everything you need,<br />
                  <span style={gradientText}>right in your pocket</span>
                </h2>
                <p className="text-lg leading-relaxed" style={{ color:"rgba(244,247,250,0.68)" }}>
                  Market briefings, guided lessons, Pansy&apos;s real-time explanations — all in one place, built to fit into five minutes of your morning.
                </p>
                <ul className="space-y-3">
                  {[
                    "Plain-English market context every session",
                    "Lessons that build on each other over time",
                    "Ask Pansy anything — she never judges the question",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm" style={{ color:"rgba(244,247,250,0.75)" }}>
                      <span style={{ color:C.green }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/onboarding" className="block sm:inline-block">
                  <button className="w-full sm:w-auto mt-2 px-7 py-3.5 rounded-xl text-base font-semibold shadow-lg"
                    style={{ ...gradientBg, color:C.deep }}>
                    Start Learning Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. CLOSING CTA BAND ─────────────────────────────────────────── */}
        <section style={{ background: C.brand }}>
          <div className="max-w-3xl mx-auto px-4 py-16 md:px-12 md:py-24 text-center space-y-8">
            <p className="text-4xl">🌺</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color:C.ivory }}>
              The best time to learn was years ago.<br />
              <span style={gradientText}>The second-best time is today.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold shadow-xl"
                  style={{ ...gradientBg, color:C.deep }}>
                  Start Learning Free
                </button>
              </Link>
              <Link href="/subscription" className="text-sm font-medium" style={{ color:"rgba(244,247,250,0.55)" }}>
                Explore Bloom Pro
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs" style={{ color:"rgba(244,247,250,0.45)" }}>
              <span>🔒 Secure &amp; Private</span>
              <span>·</span>
              <span>📚 Educational Platform — Not Financial Advice</span>
              <span>·</span>
              <span>🌸 Trusted by Women</span>
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
                  <Image src="/bloom-logo.png" alt="Bloom" width={24} height={24} className="rounded-full bg-white" />
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
                  {[{ label:"Sign in", href:"/onboarding" }, { label:"Get started free", href:"/onboarding" }, { label:"Bloom Pro", href:"/subscription" }].map(({ label, href }) => (
                    <Link key={label} href={href} className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>{label}</Link>
                  ))}
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
