import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { SEO } from "@/components/SEO";

const C = {
  bg: "#080F1A",
  card: "#0F1929",
  accent: "#2EC4D6",
  gold: "#D4A853",
  goldLight: "#F0D78C",
  white: "#FFFFFF",
  muted: "#8B9DB7",
  border: "rgba(46,196,214,0.15)",
};

function EmailCapture() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ebook-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);

      const link = document.createElement("a");
      link.href = "/ebooks/From-Broke-to-Blooming.pdf";
      link.download = "From-Broke-to-Blooming.pdf";
      link.click();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ background: "rgba(212,168,83,0.08)", border: `1px solid ${C.gold}40`, borderRadius: 16, padding: "2.5rem 2rem", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, color: C.bg }}>&#10003;</div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, color: C.white, marginBottom: 8 }}>
          Your Download Has Started
        </h3>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
          Check your downloads folder. Your copy of &ldquo;From Broke to Blooming&rdquo; is on the way.
        </p>
        <p style={{ fontSize: 12, color: "rgba(139,157,183,0.6)" }}>
          You&apos;ll also receive Pansy&apos;s weekly stock analysis via email.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: `linear-gradient(135deg, ${C.card}, #142035)`, border: `1px solid ${C.gold}30`, borderRadius: 16, padding: "2.5rem 2rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight}, ${C.gold})` }} />
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 700, color: C.white, marginBottom: 6 }}>
        Download Your Free Copy
      </h3>
      <p style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>
        Enter your email. The PDF downloads instantly.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            width: "100%",
            padding: "14px 18px",
            borderRadius: 10,
            border: `1px solid rgba(255,255,255,0.1)`,
            background: "rgba(8,15,26,0.7)",
            color: C.white,
            fontSize: 15,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {error && <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 10,
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
            color: C.bg,
            fontSize: 16,
            fontWeight: 700,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            letterSpacing: "0.02em",
          }}
        >
          {loading ? "Sending..." : "Get the Free Ebook"}
        </button>
      </form>

      <p style={{ fontSize: 11, color: "rgba(139,157,183,0.5)", marginTop: 16, textAlign: "center" }}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}

export default function Ebook() {
  const chapters = [
    { num: "01", title: "My Story", desc: "From broke to free: The 12-year journey" },
    { num: "02", title: "Budget Like Your Life Depends On It", desc: "Why budgeting is your foundation, not trading" },
    { num: "03", title: "Build Multiple Income Streams", desc: "How to earn $2-5K/month extra while working" },
    { num: "04", title: "Invest With Real Capital", desc: "Now you have money to grow" },
    { num: "05", title: "5 Mistakes Women Make", desc: "And how to avoid them" },
    { num: "06", title: "Your First 7 Days", desc: "Actionable steps to get started today" },
  ];

  const benefits = [
    "The exact 3-phase system that built real wealth",
    "Side hustles that generate $2-5K/month",
    "When to start investing (most people get this wrong)",
    "5 costly mistakes and how to avoid every one",
    "A day-by-day action plan for your first week",
  ];

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <SEO
        title="Free Ebook: From Broke to Blooming — She Blooms Wealth"
        description="Download the free ebook that teaches the 3-phase path to financial freedom. By Pansy, creator of She Blooms Wealth."
        image="/bloom-share.png"
      />

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, color: C.white, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Nav */}
        <nav style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(8,15,26,0.9)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
              <Image src="/bloom-logo.png" alt="Bloom" width={28} height={28} style={{ borderRadius: "50%" }} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 16, color: C.white }}>She Blooms Wealth</span>
            </Link>
            <Link href="/onboarding">
              <button style={{ padding: "7px 16px", borderRadius: 8, background: "transparent", color: C.accent, fontSize: 13, fontWeight: 600, border: `1px solid ${C.accent}50`, cursor: "pointer" }}>
                Open App
              </button>
            </Link>
          </div>
        </nav>

        <main style={{ flex: 1, maxWidth: 640, margin: "0 auto", padding: "3.5rem 1.5rem 5rem", width: "100%" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: C.gold, marginBottom: 20 }}>Free Financial Education Ebook</p>

            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.6rem, 6vw, 3.8rem)", fontWeight: 700, lineHeight: 1.08, color: C.white, marginBottom: "1.2rem" }}>
              From Broke<br />to Blooming
            </h1>

            <div style={{ width: 48, height: 2, background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight})`, margin: "0 auto 20px" }} />

            <p style={{ fontSize: "1.05rem", color: C.muted, maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
              The 3-phase wealth-building system that took 12 years to learn — distilled into one free guide.
            </p>
          </div>

          {/* Book Cover Card */}
          <div style={{ background: `linear-gradient(145deg, #0D1B2A, #1B2D45)`, border: `1px solid ${C.gold}25`, borderRadius: 20, padding: "2.5rem 2rem", marginBottom: "2rem", position: "relative", overflow: "hidden" }}>
            {/* Subtle corner accent */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}08, transparent)` }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 4, height: 28, borderRadius: 2, background: `linear-gradient(to bottom, ${C.gold}, ${C.goldLight})` }} />
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700, color: C.white, margin: 0 }}>
                What&apos;s Inside
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {benefits.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${C.gold}15`, border: `1px solid ${C.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ color: C.gold, fontSize: 10, fontWeight: 700 }}>&#10003;</span>
                  </div>
                  <span style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "2.5rem 2rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 4, height: 28, borderRadius: 2, background: `linear-gradient(to bottom, ${C.accent}, #1B8A96)` }} />
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700, color: C.white, margin: 0 }}>
                6 Chapters
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {chapters.map((ch, i) => (
                <div key={ch.num} style={{ display: "flex", gap: 16, padding: "14px 0", borderTop: i > 0 ? `1px solid rgba(255,255,255,0.05)` : "none" }}>
                  <span style={{ color: C.accent, fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans', monospace", letterSpacing: "0.05em", flexShrink: 0, width: 28, paddingTop: 2 }}>{ch.num}</span>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: C.white, marginBottom: 3 }}>{ch.title}</p>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{ch.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof / Authority */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: "2rem" }}>
            {[
              { value: "12yrs", label: "Of real experience" },
              { value: "3", label: "Proven phases" },
              { value: "Free", label: "No strings attached" },
            ].map((s) => (
              <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 12px", textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: C.accent, marginBottom: 4, fontFamily: "'Cormorant Garamond', serif" }}>{s.value}</p>
                <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.4 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Email Capture */}
          <EmailCapture />

          {/* Quote */}
          <div style={{ textAlign: "center", marginTop: "3.5rem", padding: "0 0.5rem" }}>
            <div style={{ width: 32, height: 32, margin: "0 auto 16px" }}>
              <Image src="/bloom-logo.png" alt="Pansy" width={32} height={32} style={{ borderRadius: "50%", opacity: 0.7 }} />
            </div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontStyle: "italic", lineHeight: 1.75, maxWidth: 440, margin: "0 auto" }}>
              &ldquo;What took me 12 years, you&apos;ll do faster. Not because you&apos;re smarter — because I already walked the path and mapped it for you.&rdquo;
            </p>
            <p style={{ fontSize: 13, color: C.gold, marginTop: 12, fontWeight: 600 }}>— Pansy</p>
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: 10, textAlign: "center", color: "rgba(139,157,183,0.3)", marginTop: "3rem", lineHeight: 1.6 }}>
            Educational content only. Not financial advice. She Blooms Wealth is not liable for any investment decisions or losses.
          </p>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${C.border}`, padding: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(139,157,183,0.35)" }}>
            &copy; 2026 Cinder Vault Enterprises LLC &middot;{" "}
            <Link href="/privacy" style={{ color: "rgba(139,157,183,0.45)", textDecoration: "none" }}>Privacy</Link> &middot;{" "}
            <Link href="/terms" style={{ color: "rgba(139,157,183,0.45)", textDecoration: "none" }}>Terms</Link> &middot;{" "}
            <Link href="/disclaimer" style={{ color: "rgba(139,157,183,0.45)", textDecoration: "none" }}>Disclaimer</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
