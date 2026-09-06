import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { SEO } from "@/components/SEO";
const C = {
  deep: "#0E1B30",
  surface: "#16264A",
  teal: "#27B7C8",
  green: "#49B06E",
  ivory: "#F4F7FA",
};

const gradientBg: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.teal}, ${C.green})`,
};

const gradientText: React.CSSProperties = {
  background: `linear-gradient(90deg, ${C.teal}, ${C.green})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
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
      <div style={{ background: "rgba(73,176,110,0.1)", border: `1px solid ${C.green}40`, borderRadius: 16, padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>&#10003;</div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: C.ivory, marginBottom: 8 }}>
          Download Started!
        </h3>
        <p style={{ fontSize: 14, color: "rgba(244,247,250,0.7)", marginBottom: 16 }}>
          Check your downloads folder. Your ebook is on the way.
        </p>
        <p style={{ fontSize: 12, color: "rgba(244,247,250,0.5)" }}>
          You&apos;ll also receive Pansy&apos;s weekly stock analysis via email.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.teal}40`, borderRadius: 16, padding: "2rem" }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: C.ivory, marginBottom: 8 }}>
        Get Your Free Copy
      </h3>
      <p style={{ fontSize: 14, color: "rgba(244,247,250,0.6)", marginBottom: 20 }}>
        Enter your email and the PDF downloads instantly.
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
            padding: "12px 16px",
            borderRadius: 10,
            border: `1px solid rgba(255,255,255,0.1)`,
            background: "rgba(14,27,48,0.6)",
            color: C.ivory,
            fontSize: 15,
            outline: "none",
          }}
        />
        {error && <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 10,
            ...gradientBg,
            color: C.deep,
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Sending..." : "Download Free Ebook"}
        </button>
      </form>

      <p style={{ fontSize: 11, color: "rgba(244,247,250,0.35)", marginTop: 16, textAlign: "center" }}>
        No spam. Unsubscribe anytime. Pansy&apos;s word.
      </p>
    </div>
  );
}

export default function Ebook() {
  const chapters = [
    { num: "1", title: "My Story", desc: "From broke to free: The 12-year journey" },
    { num: "2", title: "Phase 1: Budget Like Your Life Depends On It", desc: "Why budgeting is your foundation, not trading" },
    { num: "3", title: "Phase 2: Build Multiple Income Streams", desc: "How to earn $2-5K/month extra while working" },
    { num: "4", title: "Phase 3: Invest With Real Capital", desc: "Now you have money to grow" },
    { num: "5", title: "5 Mistakes Women Make", desc: "And how to avoid them" },
    { num: "6", title: "Your First 7 Days", desc: "Actionable steps to get started today" },
  ];

  const benefits = [
    "How I went from broke to financially free — in real terms",
    "The 3-phase wealth-building system (NOT trading first)",
    "Real side hustles that actually work",
    "5 mistakes women make (and how to avoid them)",
    "Your first 7-day action plan",
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

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.deep, color: C.ivory, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Nav */}
        <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(14,27,48,0.95)", backdropFilter: "blur(16px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
              <Image src="/bloom-logo.png" alt="Bloom" width={32} height={32} style={{ borderRadius: "50%" }} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 17, color: C.ivory }}>Bloom</span>
            </Link>
            <Link href="/onboarding">
              <button style={{ padding: "8px 16px", borderRadius: 8, ...gradientBg, color: C.deep, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                Start Free
              </button>
            </Link>
          </div>
        </nav>

        <main style={{ flex: 1, maxWidth: 700, margin: "0 auto", padding: "4rem 1.5rem 5rem", width: "100%" }}>
          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>&#x1F338;</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 5vw, 3.2rem)", fontWeight: 700, lineHeight: 1.15, color: C.ivory, marginBottom: "1rem" }}>
              From Broke to{" "}
              <span style={gradientText}>Blooming</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "rgba(244,247,250,0.6)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
              The real path to financial freedom — by Pansy. Free, no fluff, no get-rich-quick. Just the system that actually worked.
            </p>
          </div>

          {/* What You'll Learn */}
          <div style={{ background: C.surface, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "2rem", marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: C.ivory, marginBottom: "1.25rem" }}>
              What you&apos;ll learn
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {benefits.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: C.green, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>&#10003;</span>
                  <span style={{ fontSize: 15, color: "rgba(244,247,250,0.75)", lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div style={{ background: C.surface, border: `1px solid ${C.teal}30`, borderRadius: 18, padding: "2rem", marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 700, color: C.ivory, marginBottom: "1.25rem" }}>
              Inside the ebook
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {chapters.map((ch) => (
                <div key={ch.num} style={{ display: "flex", gap: 14 }}>
                  <span style={{ color: C.teal, fontWeight: 700, fontSize: 18, flexShrink: 0, width: 24, textAlign: "center" }}>{ch.num}</span>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: C.ivory, marginBottom: 2 }}>{ch.title}</p>
                    <p style={{ fontSize: 13, color: "rgba(244,247,250,0.5)", margin: 0 }}>{ch.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Capture */}
          <EmailCapture />

          {/* Quote */}
          <div style={{ textAlign: "center", marginTop: "3rem", padding: "0 1rem" }}>
            <p style={{ fontSize: 15, color: "rgba(244,247,250,0.5)", fontStyle: "italic", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
              &ldquo;What took me 12 years, you&apos;ll do faster. Not because you&apos;re smarter. Because I already walked the path and mapped it for you.&rdquo;
            </p>
            <p style={{ fontSize: 13, color: "rgba(244,247,250,0.35)", marginTop: 12 }}>— Pansy</p>
          </div>

          {/* Disclaimer */}
          <p style={{ fontSize: 10, textAlign: "center", color: "rgba(244,247,250,0.25)", marginTop: "3rem", lineHeight: 1.6 }}>
            Educational content only. Not financial advice. She Blooms Wealth is not liable for any investment decisions or losses.
          </p>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "rgba(244,247,250,0.25)" }}>
            &copy; 2026 Cinder Vault Enterprises LLC &middot;{" "}
            <Link href="/privacy" style={{ color: "rgba(244,247,250,0.35)", textDecoration: "none" }}>Privacy</Link> &middot;{" "}
            <Link href="/terms" style={{ color: "rgba(244,247,250,0.35)", textDecoration: "none" }}>Terms</Link> &middot;{" "}
            <Link href="/disclaimer" style={{ color: "rgba(244,247,250,0.35)", textDecoration: "none" }}>Disclaimer</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
