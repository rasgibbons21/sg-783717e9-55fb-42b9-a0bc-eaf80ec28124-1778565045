import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { ArrowRight, Share2, Smartphone, Plus } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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
        title="She Blooms Wealth — Free Financial Education for Women"
        description="Learn investing, budgeting, side hustles, and trading strategies with Pansy, your friendly guide. 150+ plain-language lessons, paper trading simulator, budget tracker, and more. Built for women. No jargon."
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
              description: "Free financial education app for women. 150+ lessons on investing, budgeting, and side hustles. Paper trading simulator with $10K virtual money.",
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

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.deep, color: C.ivory, minHeight: "100vh" }}>

        {/* ── NAVIGATION ──────────────────────────────────────────────────── */}
        <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(14,27,48,0.92)", backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
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
            <Link href="/onboarding">
              <button style={{ padding:"9px 18px", borderRadius:8, ...gradientBg, color:C.deep, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", whiteSpace:"nowrap", transition:"box-shadow 0.2s, transform 0.2s", boxShadow:`0 4px 20px rgba(39,183,200,0.22)` }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 28px rgba(39,183,200,0.40)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = `0 4px 20px rgba(39,183,200,0.22)`; }}
              >
                Start Learning Free
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
                <span style={{ fontSize:12, fontWeight:700, color:C.green, letterSpacing:"0.04em" }}>100% Free to Start — No Credit Card</span>
              </div>

              <div style={{ marginBottom:"1.25rem", animation:"fade-up 0.55s ease-out 0.2s both" }}>
                <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(2.3rem, 5vw, 3.6rem)", fontWeight:700, lineHeight:1.12, letterSpacing:"-0.01em", color:C.ivory, margin:0 }}>
                  Learn to build wealth
                  <br />
                  <span style={{ ...gradientText }}>from scratch.</span>
                </h1>
              </div>

              <p style={{ fontSize:"clamp(1rem, 1.9vw, 1.12rem)", lineHeight:1.72, color:"rgba(244,247,250,0.72)", maxWidth:480, marginBottom:"1.8rem", animation:"fade-up 0.55s ease-out 0.28s both" }}>
                Bloom is a <strong style={{ color:C.ivory }}>free financial education app</strong> that teaches you investing,
                budgeting, side hustles, and how money actually works. 150+ lessons from beginner to advanced.
                Built for women. No jargon.
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

        {/* ── SHARE WITH QR CODE ──────────────────────────────────────────── */}
        <section style={{ background:"rgba(22,38,74,0.45)", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth:720, margin:"0 auto", padding:"3rem 1.5rem", textAlign:"center" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:20, marginBottom:"1rem", background:`${C.teal}12`, border:`1px solid ${C.teal}25` }}>
              <Share2 size={13} style={{ color:C.teal }} />
              <span style={{ fontSize:12, fontWeight:700, color:C.teal, letterSpacing:"0.04em" }}>Share Bloom</span>
            </div>

            <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(1.5rem, 3vw, 2rem)", fontWeight:700, color:C.ivory, marginBottom:"0.75rem" }}>
              Know someone who needs this?
            </h2>
            <p style={{ fontSize:14, color:"rgba(244,247,250,0.55)", marginBottom:"2rem", maxWidth:420, margin:"0 auto 2rem" }}>
              Scan the QR code or share the link to help a friend start their financial education journey.
            </p>

            <div style={{ display:"inline-block", padding:20, borderRadius:20, background:"white", boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
              <QRCodeSVG
                value="https://shebloomswealth.app"
                size={180}
                level="M"
                fgColor={C.deep}
                bgColor="white"
                imageSettings={{
                  src: "/bloom-logo.png",
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

        {/* ── FREE EBOOK PROMO ─────────────────────────────────────────── */}
        <section style={{ maxWidth:720, margin:"0 auto", padding:"3rem 1.5rem 0" }}>
          <Link href="/ebook" style={{ textDecoration:"none", display:"block" }}>
            <div style={{
              ...glass,
              borderRadius:20,
              padding:"2rem 1.75rem",
              position:"relative",
              overflow:"hidden",
              cursor:"pointer",
              transition:"transform 0.2s, box-shadow 0.2s",
              border:"1px solid rgba(212,168,83,0.2)",
              boxShadow:"0 4px 24px rgba(0,0,0,0.24)",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(212,168,83,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.24)"; }}
            >
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg, #D4A853, #F0D78C, #D4A853)" }} />
              <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:"radial-gradient(circle, rgba(212,168,83,0.12), transparent)", pointerEvents:"none" }} />

              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <span style={{ fontSize:18 }}>📖</span>
                <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#D4A853" }}>Free Ebook</span>
              </div>

              <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:"clamp(1.3rem, 3vw, 1.7rem)", fontWeight:700, color:C.ivory, marginBottom:6, lineHeight:1.2 }}>
                From Broke to Blooming
              </h3>
              <p style={{ fontSize:13.5, color:"rgba(244,247,250,0.6)", lineHeight:1.6, marginBottom:16, maxWidth:460 }}>
                The 3-phase wealth-building system that took 12 years to learn — budgeting, side hustles, then investing. Free PDF, no strings.
              </p>

              <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:10, background:"linear-gradient(135deg, #D4A853, #F0D78C)", color:C.deep, fontSize:13, fontWeight:700 }}>
                Download Free <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </section>

        {/* ── ADD TO HOME SCREEN TUTORIAL ─────────────────────────────────── */}
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
              Get the full app experience in 3 quick taps — no app store needed.
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:20 }}>
            {[
              {
                step: "1",
                icon: "globe",
                title: "Open in your browser",
                desc: "Visit shebloomswealth.app in Chrome (Android) or Safari (iPhone).",
              },
              {
                step: "2",
                icon: "menu",
                title: "Tap the menu",
                desc: "Tap the three dots (Chrome) or the share icon (Safari) at the top or bottom of your screen.",
              },
              {
                step: "3",
                icon: "plus",
                title: "Add to Home Screen",
                desc: "Select \"Add to Home Screen\" and tap Add. Bloom now opens like a real app!",
              },
            ].map((item) => (
              <div key={item.step} style={{ ...glass, borderRadius:16, padding:"1.5rem", textAlign:"center", boxShadow:"0 4px 24px rgba(0,0,0,0.24)", position:"relative" }}>
                <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", width:28, height:28, borderRadius:"50%", ...gradientBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:C.deep }}>
                  {item.step}
                </div>

                <div style={{ width:48, height:48, borderRadius:12, background:"rgba(39,183,200,0.1)", border:`1px solid ${C.teal}20`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0.75rem auto 1rem" }}>
                  {item.icon === "globe" && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  )}
                  {item.icon === "menu" && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={C.teal}>
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  )}
                  {item.icon === "plus" && <Plus size={22} style={{ color:C.teal }} />}
                </div>

                <p style={{ fontSize:14, fontWeight:700, color:C.ivory, marginBottom:6 }}>{item.title}</p>
                <p style={{ fontSize:12.5, lineHeight:1.6, color:"rgba(244,247,250,0.55)", margin:0 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign:"center", marginTop:"2rem" }}>
            <Link href="/onboarding">
              <button style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 28px", borderRadius:10, ...gradientBg, color:C.deep, fontSize:15, fontWeight:700, border:"none", cursor:"pointer", boxShadow:`0 8px 30px rgba(39,183,200,0.28)`, transition:"transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 14px 40px rgba(39,183,200,0.44)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)";    e.currentTarget.style.boxShadow=`0 8px 30px rgba(39,183,200,0.28)`; }}
              >
                Start Learning Free <ArrowRight size={16} />
              </button>
            </Link>
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
                  <Link href="/onboarding" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Get started free</Link>
                  <Link href="/onboarding" className="text-xs transition-colors hover:text-white" style={{ color:"rgba(244,247,250,0.40)" }}>Sign in</Link>
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
                Bloom is for educational purposes only and does not constitute financial advice. All investing involves risk of loss, including possible loss of principal. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
