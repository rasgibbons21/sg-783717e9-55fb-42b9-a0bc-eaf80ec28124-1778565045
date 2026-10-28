import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { ArrowRight, Share2, Smartphone, Plus, BookOpen, DollarSign, BarChart3, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getActivePromos, getFeaturedPromo } from "@/config/brokerPromos";
import { trackBrokerClick } from "@/lib/analytics";

/* ─── Palette ─────────────────────────────────────────────────────────────── */
const C = {
  deep:    "#07080C",
  surface: "#16264A",
  brand:   "#1E2C6B",
  teal:    "#27B7C8",
  green:   "#49B06E",
  ivory:   "#F3EDE3",
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

/* ─── CSS Keyframes ───────────────────────────────────────────────────────── */
const KEYFRAMES = `
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
  @keyframes orb-pulse {
    0%,100% { opacity: 0.07; transform: scale(1); }
    50%     { opacity: 0.14; transform: scale(1.12); }
  }
  @keyframes candle-flicker {
    0%,85%,100% { opacity: 1; }
    90%         { opacity: 0.35; }
  }
  @keyframes fade-up {
    0%   { opacity: 0; transform: translateY(18px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

/* ─── Layered hero background ─────────────────────────────────────────────── */
function HeroBg() {
  const chartPath = "M0,200 C80,175 120,225 200,160 C280,95 320,175 420,120 C520,65 570,145 700,90 C830,35 880,110 1000,70 C1120,30 1180,95 1320,55 C1380,40 1420,60 1440,50";
  const areaPath  = `${chartPath} L1440,400 L0,400 Z`;

  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      <div style={{ position:"absolute", inset:0, background:`linear-gradient(155deg, ${C.deep} 0%, #091523 45%, ${C.surface}60 100%)` }} />
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
      <div style={{ position:"absolute", top:"18%", left:"28%", width:460, height:460, borderRadius:"50%", background:C.teal, filter:"blur(130px)", opacity:0.06, animation:"orb-pulse 9s ease-in-out infinite" }} />
      <div style={{ position:"absolute", top:"52%", right:"12%", width:380, height:380, borderRadius:"50%", background:C.green, filter:"blur(110px)", opacity:0.05, animation:"orb-pulse 11s ease-in-out infinite", animationDelay:"4s" }} />
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
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/home");
        return;
      }
      setIsCheckingAuth(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/.test(ua)) setPlatform("ios");
    else if (/Android/.test(ua)) setPlatform("android");

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (deferredPrompt as any).prompt();
    setDeferredPrompt(null);
  };

  if (isCheckingAuth) {
    return (
      <div style={{ background: C.deep, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${C.teal}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <style>{KEYFRAMES}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />
      </Head>
      <style>{KEYFRAMES}</style>

      <SEO
        title="Bloom — Learn Money & Investing From Zero. Free."
        description="Free investing education, paper trading, stock screener, and AI market chat. Learn at your own pace — no jargon, no paywall."
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://shebloomswealth.app/#organization",
              name: "Bloom by Cinder Vault Enterprises LLC",
              url: "https://shebloomswealth.app",
              logo: "https://shebloomswealth.app/icon-512.png",
              description: "Free investing education, paper trading, and market tools.",
              foundingDate: "2026",
              founder: { "@type": "Organization", name: "Cinder Vault Enterprises LLC" },
            },
            {
              "@type": "SoftwareApplication",
              "@id": "https://shebloomswealth.app/#app",
              name: "Bloom",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Android, Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "100% free education, paper trading, and market tools" },
              description: "Free investing education, paper trading, stock screener, and AI market chat. Learn at your own pace.",
              url: "https://shebloomswealth.app",
              publisher: { "@id": "https://shebloomswealth.app/#organization" },
            },
            {
              "@type": "WebSite",
              "@id": "https://shebloomswealth.app/#website",
              url: "https://shebloomswealth.app",
              name: "Bloom",
              publisher: { "@id": "https://shebloomswealth.app/#organization" },
            },
          ],
        }}
      />

      <div style={{ fontFamily: "'Inter', sans-serif", background: C.deep, color: C.ivory, minHeight: "100vh" }}>

        {/* ── NAVIGATION ──────────────────────────────────────────────────── */}
        <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(14,27,48,0.92)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ animation:"breathe 8s ease-in-out infinite" }}>
                <Image src="/icon-192.png" alt="Bloom" width={36} height={36}
                  style={{ borderRadius:10, animation:"glow-pulse 7s ease-in-out infinite", display:"block" }} />
              </div>
              <div style={{ lineHeight:1.15 }}>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontWeight:700, fontSize:18, letterSpacing:"0.01em", color:C.ivory }}>Bloom</div>
                <div style={{ fontSize:9, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(244,247,250,0.35)" }}>Learn &amp; Invest</div>
              </div>
            </div>
            <Link href="/onboarding">
              <button style={{ padding:"9px 18px", borderRadius:8, ...gradientBg, color:C.deep, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", whiteSpace:"nowrap", transition:"box-shadow 0.2s, transform 0.2s", boxShadow:`0 4px 20px rgba(39,183,200,0.22)` }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 28px rgba(39,183,200,0.40)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = `0 4px 20px rgba(39,183,200,0.22)`; }}
              >
                Get Started Free
              </button>
            </Link>
          </div>
        </nav>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section style={{ position:"relative", overflow:"hidden" }}>
          <HeroBg />

          <div className="flex flex-col md:flex-row md:items-center"
            style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto", padding:"clamp(3rem,6vw,5rem) 1.5rem clamp(3rem,5vw,4rem)", gap:"clamp(2rem,4vw,3.5rem)" }}>

            {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
            <div style={{ flex:"0 0 54%" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, marginBottom:"1.25rem", animation:"fade-up 0.55s ease-out 0.1s both", background:"rgba(73, 176, 110, 0.12)", border:"1px solid rgba(73, 176, 110, 0.25)" }}>
                <span style={{ fontSize:13 }}>🌱</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.green, letterSpacing:"0.04em" }}>100% Free — No Credit Card</span>
              </div>

              <div style={{ marginBottom:"1.25rem", animation:"fade-up 0.55s ease-out 0.2s both" }}>
                <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(2.3rem, 5vw, 3.6rem)", fontWeight:700, lineHeight:1.12, letterSpacing:"-0.01em", color:C.ivory, margin:0 }}>
                  Learn money and investing
                  <br />
                  <span style={{ ...gradientText }}>from zero. Free.</span>
                </h1>
              </div>

              <p style={{ fontSize:"clamp(1rem, 1.9vw, 1.12rem)", lineHeight:1.72, color:"rgba(244,247,250,0.72)", maxWidth:480, marginBottom:"1.8rem", animation:"fade-up 0.55s ease-out 0.28s both" }}>
                Bloom is a <strong style={{ color:C.ivory }}>free investing education platform</strong> with
                lessons, paper trading, a stock screener, and Pansy — your AI market guide.
                No jargon, no paywall.
              </p>

              <div style={{ display:"flex", gap:12, animation:"fade-up 0.55s ease-out 0.44s both" }}>
                <Link href="/onboarding">
                  <button style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 26px", borderRadius:10, ...gradientBg, color:C.deep, fontSize:15, fontWeight:700, border:"none", cursor:"pointer", boxShadow:`0 8px 30px rgba(39,183,200,0.28)`, transition:"transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 14px 40px rgba(39,183,200,0.44)`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow=`0 8px 30px rgba(39,183,200,0.28)`; }}
                  >
                    Start Learning Free <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </div>

            {/* ── RIGHT COLUMN — Pansy ────────────────────────────────────── */}
            <div style={{ flex:1, position:"relative", display:"flex", justifyContent:"center", minHeight:380 }}>
              <div style={{ position:"absolute", inset:"5%", borderRadius:"50%", background:`radial-gradient(circle, ${C.teal}22 0%, transparent 68%)`, filter:"blur(50px)", animation:"orb-pulse 7s ease-in-out infinite", pointerEvents:"none" }} />
              <div style={{ position:"absolute", inset:0, borderRadius:"1.75rem", overflow:"hidden", pointerEvents:"none" }}>
                <CandleBg />
              </div>
              <div style={{ position:"relative", width:"100%", maxWidth:400, zIndex:2 }}>
                <Image
                  src="/pansy-hero.png"
                  alt="Pansy — your investing education guide"
                  width={500} height={580} priority
                  className="rounded-3xl object-cover w-full"
                  style={{ position:"relative", zIndex:2, height:"auto" }}
                />
                <div style={{ position:"absolute", bottom:"7%", left:"-6%", right:"3%", zIndex:10, ...glass, borderRadius:16, padding:"15px 17px", border:`1px solid ${C.teal}28`, boxShadow:`0 8px 32px rgba(39,183,200,0.12), inset 0 1px 0 rgba(255,255,255,0.05)` }}>
                  <div style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                    <Image src="/icon-192.png" alt="Pansy" width={26} height={26}
                      style={{ borderRadius:6, flexShrink:0, marginTop:2, display:"block" }} />
                    <p style={{ margin:0, fontSize:12.5, lineHeight:1.62, color:"rgba(244,247,250,0.88)" }}>
                      Hi, I&apos;m Pansy 🌿<br />
                      I explain markets in plain English — no jargon, no pressure.{" "}
                      <span style={{ color:C.teal, fontWeight:600 }}>Ready to learn?</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT'S INSIDE BLOOM ─────────────────────────────────────────── */}
        <section style={{ maxWidth:1000, margin:"0 auto", padding:"3.5rem 1.5rem 2rem" }}>
          <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(1.5rem, 3vw, 2.2rem)", fontWeight:700, color:C.ivory, marginBottom:8 }}>
              What&apos;s inside Bloom
            </h2>
            <p style={{ fontSize:14, color:"rgba(244,247,250,0.55)", maxWidth:440, margin:"0 auto" }}>
              Everything you need to go from zero to confident — all free.
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:20 }}>
            {[
              {
                icon: BookOpen,
                title: "Lessons & Academy",
                desc: "36+ bite-sized lessons, trading patterns, strategy guides, and candlestick patterns. Learn at your own pace.",
                color: C.teal,
              },
              {
                icon: BarChart3,
                title: "Paper Trading & Scanner",
                desc: "Practice with a simulated portfolio. Scan for gap-ups, breakouts, and setups — all with real market data.",
                color: C.green,
              },
              {
                icon: DollarSign,
                title: "Budget Tracker & Tools",
                desc: "Track your budget, set price alerts, use the position size calculator, and get Pansy's AI market chat.",
                color: "#D4AF37",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{ ...glass, borderRadius:20, padding:"2rem 1.5rem", transition:"transform 0.2s, box-shadow 0.2s", cursor:"default" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 12px 40px rgba(0,0,0,0.3)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
              >
                <div style={{ width:48, height:48, borderRadius:12, background:`${color}15`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, color:C.ivory, marginBottom:8 }}>{title}</h3>
                <p style={{ fontSize:13, lineHeight:1.65, color:"rgba(244,247,250,0.6)", margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── EBOOK PROMO ─────────────────────────────────────────────────── */}
        <section style={{ maxWidth:720, margin:"0 auto", padding:"2rem 1.5rem 0" }}>
          <div style={{ ...glass, borderRadius:20, padding:"2rem 1.75rem", display:"flex", flexDirection:"column", alignItems:"center", gap:16, textAlign:"center" }}>
            <span style={{ fontSize:36 }}>📖</span>
            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(1.3rem, 3vw, 1.7rem)", fontWeight:700, color:C.ivory, margin:0 }}>
              Free eBook: Start Investing From Zero
            </h2>
            <p style={{ fontSize:13, color:"rgba(244,247,250,0.55)", lineHeight:1.65, maxWidth:420, margin:0 }}>
              A plain-English guide to opening your first brokerage account, reading a chart, and placing your first trade.
            </p>
            <Link href="/ebook">
              <button style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 22px", borderRadius:10, ...gradientBg, color:C.deep, fontSize:13, fontWeight:700, border:"none", cursor:"pointer" }}>
                Read Free <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </section>

        {/* ── SHARE WITH QR CODE ──────────────────────────────────────────── */}
        <section style={{ background:"rgba(22,38,74,0.45)", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)", marginTop:"3rem" }}>
          <div style={{ maxWidth:720, margin:"0 auto", padding:"3rem 1.5rem", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, marginBottom:"1rem", background:`${C.teal}12`, border:`1px solid ${C.teal}25` }}>
              <Share2 size={13} style={{ color:C.teal }} />
              <span style={{ fontSize:12, fontWeight:700, color:C.teal, letterSpacing:"0.04em" }}>Share Bloom</span>
            </div>

            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(1.5rem, 3vw, 2rem)", fontWeight:700, color:C.ivory, marginBottom:"0.75rem" }}>
              Know someone who wants to learn?
            </h2>
            <p style={{ fontSize:14, color:"rgba(244,247,250,0.55)", marginBottom:"2rem", maxWidth:420, margin:"0 auto 2rem" }}>
              Scan the QR code or share the link so they can start learning too.
            </p>

            <div style={{ display:"inline-block", padding:20, borderRadius:20, background:"white", boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
              <QRCodeSVG
                value="https://shebloomswealth.app"
                size={180}
                level="M"
                fgColor={C.deep}
                bgColor="white"
                imageSettings={{
                  src: "/icon-192.png",
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>

            <p style={{ fontSize:12, color:"rgba(244,247,250,0.35)", marginTop:"1.25rem" }}>
              shebloomswealth.app
            </p>
          </div>
        </section>

        {/* ── SMART INSTALL ──────────────────────────────────────────────── */}
        <section style={{ maxWidth:800, margin:"0 auto", padding:"3.5rem 1.5rem" }}>
          <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, marginBottom:"1rem", background:`${C.green}12`, border:`1px solid ${C.green}25` }}>
              <Smartphone size={13} style={{ color:C.green }} />
              <span style={{ fontSize:12, fontWeight:700, color:C.green, letterSpacing:"0.04em" }}>Install the App</span>
            </div>

            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(1.5rem, 3vw, 2rem)", fontWeight:700, color:C.ivory, marginBottom:"0.5rem" }}>
              Add Bloom to your home screen
            </h2>
            <p style={{ fontSize:14, color:"rgba(244,247,250,0.55)", maxWidth:440, margin:"0 auto" }}>
              Get the full app experience — no app store needed.
            </p>
          </div>

          {deferredPrompt ? (
            <div style={{ textAlign:"center" }}>
              <button
                onClick={handleInstall}
                style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"16px 32px", borderRadius:12, ...gradientBg, color:C.deep, fontSize:16, fontWeight:700, border:"none", cursor:"pointer", boxShadow:`0 8px 30px rgba(39,183,200,0.28)` }}
              >
                <Plus size={18} /> Install Bloom
              </button>
            </div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
              {(platform === "ios" ? [
                { step:"1", title:"Open in Safari", desc:"Visit shebloomswealth.app in Safari on your iPhone or iPad." },
                { step:"2", title:"Tap the share icon", desc:"Tap the share button (square with arrow) at the bottom of the screen." },
                { step:"3", title:"Add to Home Screen", desc:"Scroll down and tap \"Add to Home Screen\", then tap Add." },
              ] : platform === "android" ? [
                { step:"1", title:"Open in Chrome", desc:"Visit shebloomswealth.app in Chrome on your Android device." },
                { step:"2", title:"Tap the menu", desc:"Tap the three dots at the top-right corner of Chrome." },
                { step:"3", title:"Add to Home Screen", desc:"Select \"Add to Home screen\" and tap Add. Bloom opens like a real app!" },
              ] : [
                { step:"1", title:"Open in your browser", desc:"Visit shebloomswealth.app in Chrome (Android) or Safari (iPhone)." },
                { step:"2", title:"Tap the menu", desc:"Tap the three dots (Chrome) or the share icon (Safari)." },
                { step:"3", title:"Add to Home Screen", desc:"Select \"Add to Home Screen\" and tap Add. Bloom opens like a real app!" },
              ]).map((item) => (
                <div key={item.step} style={{ ...glass, borderRadius:16, padding:"1.5rem", textAlign:"center", boxShadow:"0 4px 24px rgba(0,0,0,0.24)", position:"relative" }}>
                  <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", width:28, height:28, borderRadius:"50%", ...gradientBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:C.deep }}>
                    {item.step}
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color:C.ivory, marginBottom:6, marginTop:8 }}>{item.title}</p>
                  <p style={{ fontSize:12.5, lineHeight:1.6, color:"rgba(244,247,250,0.55)", margin:0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign:"center", marginTop:"2rem" }}>
            <Link href="/onboarding">
              <button style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:10, ...gradientBg, color:C.deep, fontSize:15, fontWeight:700, border:"none", cursor:"pointer", boxShadow:`0 8px 30px rgba(39,183,200,0.28)`, transition:"transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 14px 40px rgba(39,183,200,0.44)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow=`0 8px 30px rgba(39,183,200,0.28)`; }}
              >
                Get Started Free <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </section>

        {/* ── TRUSTED BROKERS ───────────────────────────────────────────── */}
        <section style={{ background: C.deep, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-5xl mx-auto px-4 py-14 md:px-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: C.ivory }}>Trusted Brokers</h2>
            <p className="text-center text-sm mb-8" style={{ color: "rgba(243,237,227,0.5)" }}>Open a free account and start practicing what you learn</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getActivePromos().slice(0, 6).map((broker) => {
                const isFeatured = broker.id === getFeaturedPromo().id;
                const logoDevKey = process.env.NEXT_PUBLIC_LOGO_DEV_KEY?.trim();
                const logoUrl = logoDevKey && broker.logoDomain
                  ? `https://img.logo.dev/${broker.logoDomain}?token=${logoDevKey}&size=64&format=png`
                  : `/logos/${broker.id}-logo.svg`;
                return (
                  <a
                    key={broker.id}
                    href={broker.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => {
                      trackBrokerClick(broker.name);
                      try {
                        supabase.auth.getSession().then(({ data: { session } }) => {
                          supabase.from("broker_clicks").insert({ broker_name: broker.name, user_id: session?.user?.id ?? null });
                        });
                      } catch {}
                    }}
                    className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02]"
                    style={{
                      background: isFeatured ? "linear-gradient(135deg, rgba(39,183,200,0.12), rgba(73,176,110,0.08))" : "rgba(255,255,255,0.03)",
                      border: isFeatured ? "1px solid rgba(39,183,200,0.25)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt={broker.name} className="h-10 w-10 rounded-lg object-contain flex-shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold" style={{ color: C.ivory }}>{broker.name}</span>
                        {isFeatured && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(39,183,200,0.15)", color: C.teal }}>FEATURED</span>}
                      </div>
                      <p className="text-[11px] leading-snug" style={{ color: "rgba(243,237,227,0.45)" }}>{broker.tagline}</p>
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0" style={{ color: "rgba(243,237,227,0.3)" }} />
                  </a>
                );
              })}
            </div>
            <p className="text-center text-[10px] mt-6" style={{ color: "rgba(243,237,227,0.2)" }}>
              Trading CFDs and forex carries a high risk of losing money. Not financial advice. We may earn a commission if you sign up.
            </p>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer style={{ background:C.deep, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-6xl mx-auto px-4 py-10 md:px-12">
            <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-12 mb-8">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Image src="/icon-192.png" alt="Bloom" width={24} height={24} className="rounded-lg" />
                  <p className="text-sm font-semibold" style={{ color:"rgba(244,247,250,0.60)" }}>Bloom</p>
                </div>
                <p className="text-xs" style={{ color:"rgba(244,247,250,0.35)" }}>Learn money &amp; investing from zero</p>
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
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color:"rgba(244,247,250,0.35)" }}>Learn</p>
                <div className="flex flex-col gap-1.5">
                  <Link href="/learn" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Academy</Link>
                  <Link href="/ebook" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Free eBook</Link>
                  <Link href="/practice" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Paper Trading</Link>
                  <Link href="/scanner" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Stock Scanner</Link>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color:"rgba(244,247,250,0.35)" }}>Account</p>
                <div className="flex flex-col gap-1.5">
                  <Link href="/onboarding" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Get started free</Link>
                  <Link href="/onboarding" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Sign in</Link>
                  <Link href="/refer" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Invite Friends</Link>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color:"rgba(244,247,250,0.35)" }}>Contact</p>
                <div className="flex flex-col gap-1.5">
                  <Link href="/contact" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Contact Us</Link>
                  <a href="mailto:cindervaultenterprisesllc@gmail.com" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>cindervaultenterprisesllc@gmail.com</a>
                  <a href="https://instagram.com/shebloomswealth" target="_blank" rel="noopener noreferrer"
                    className="text-xs transition-colors hover:text-white inline-flex items-center gap-1.5" style={{ color:"rgba(244,247,250,0.40)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    @shebloomswealth
                  </a>
                </div>
              </div>
            </div>
            <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }} className="pt-6 space-y-2">
              <p className="text-xs" style={{ color:"rgba(244,247,250,0.28)" }}>
                © 2026 Cinder Vault Enterprises LLC. All rights reserved. Bloom is a product of Cinder Vault Enterprises LLC.
              </p>
              <p className="text-xs" style={{ color:"rgba(244,247,250,0.22)" }}>
                Bloom is for educational purposes only and does not constitute financial advice. All investing involves risk of loss, including possible loss of principal. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
