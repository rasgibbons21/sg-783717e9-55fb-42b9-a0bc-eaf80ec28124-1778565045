import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { UNIVERSITY_MODULES } from "@/data/university/modules";
import { Loader2, Download, Share2, ArrowLeft } from "lucide-react";
import Head from "next/head";

interface CertData {
  userName: string;
  completedAt: string | null;
  certId: string;
  eligible: boolean;
  allComplete?: boolean;
  completedCount: number;
}

export default function CertificatePage() {
  const router = useRouter();
  const { type, module: moduleSlug } = router.query;
  const [cert, setCert] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!router.isReady) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/onboarding"); return; }

      const params = new URLSearchParams();
      params.set("type", (type as string) || "basics");
      if (moduleSlug) params.set("module", moduleSlug as string);

      const res = await fetch(`/api/certificate/check?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) setCert(await res.json());
      setLoading(false);
    })();
  }, [router.isReady, type, moduleSlug, router]);

  const handleDownload = async () => {
    if (!certRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `bloom-certificate-${cert?.certId || "cert"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Download failed — please try taking a screenshot instead.");
    }
  };

  const handleShare = async () => {
    if (!certRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: null });
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/png"));
      if (blob && navigator.share) {
        const file = new File([blob], "bloom-certificate.png", { type: "image/png" });
        await navigator.share({
          title: "My Bloom Certificate",
          text: "I earned my certificate on Bloom - She Blooms Wealth! 🌸",
          files: [file],
        });
      } else if (blob) {
        const url = URL.createObjectURL(blob);
        window.open(url);
      }
    } catch { /* user cancelled share */ }
  };

  const formatDate = (d: string | null) => {
    if (!d) return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const isUniversity = type === "university" || type === "university-all";
  const mod = moduleSlug ? UNIVERSITY_MODULES.find(m => m.slug === moduleSlug) : null;

  const certTitle = type === "university-all"
    ? "Bloom University Advanced Program"
    : type === "university" && mod
      ? mod.certificateName
      : "Bloom Investing Foundations";

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#0E1B30" }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#27B7C8]" />
      </div>
    );
  }

  if (!cert?.eligible) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-6" style={{ background: "#0E1B30" }}>
        <div className="text-center space-y-4">
          <p className="text-[#F4F7FA]/60 text-lg">Complete lessons to earn your certificate!</p>
          <button onClick={() => router.back()} className="text-[#27B7C8] hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>Certificate | Bloom</title></Head>
      <div className="fixed inset-0 overflow-y-auto" style={{ background: "#0E1B30" }}>
        <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#F4F7FA]/50 hover:text-[#F4F7FA]/80 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Certificate */}
          <div ref={certRef}>
            {isUniversity ? (
              <UniversityCert name={cert.userName} date={formatDate(cert.completedAt)} certId={cert.certId} title={certTitle} moduleName={mod?.title} />
            ) : (
              <BasicsCert name={cert.userName} date={formatDate(cert.completedAt)} certId={cert.certId} />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)" }}
            >
              <Download className="w-5 h-5" /> Download
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[#27B7C8] border border-[#27B7C8]/30 hover:bg-[#27B7C8]/10 transition-all"
            >
              <Share2 className="w-5 h-5" /> Share
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function BasicsCert({ name, date, certId }: { name: string; date: string; certId: string }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #FAF5EE 0%, #F5EDE0 100%)",
      borderRadius: 16,
      padding: 4,
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    }}>
      <div style={{
        border: "3px solid #C9A84C",
        borderRadius: 14,
        padding: "48px 40px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #FAF5EE 0%, #FFF8EE 50%, #FAF5EE 100%)",
      }}>
        {/* Corner ornaments */}
        <div style={{ position: "absolute", top: 12, left: 12, fontSize: 28, color: "#C9A84C", opacity: 0.6 }}>❧</div>
        <div style={{ position: "absolute", top: 12, right: 12, fontSize: 28, color: "#C9A84C", opacity: 0.6, transform: "scaleX(-1)" }}>❧</div>
        <div style={{ position: "absolute", bottom: 12, left: 12, fontSize: 28, color: "#C9A84C", opacity: 0.6, transform: "scaleY(-1)" }}>❧</div>
        <div style={{ position: "absolute", bottom: 12, right: 12, fontSize: 28, color: "#C9A84C", opacity: 0.6, transform: "scale(-1)" }}>❧</div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌸</div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "#1B5E6B", margin: 0, letterSpacing: 2 }}>
            BLOOM
          </h1>
          <p style={{ fontSize: 12, color: "#27B7C8", letterSpacing: 4, margin: "4px 0 0", textTransform: "uppercase" }}>
            She Blooms Wealth
          </p>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 auto 24px", maxWidth: 400 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
          <div style={{ fontSize: 14, color: "#C9A84C" }}>✦</div>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
        </div>

        {/* Title */}
        <h2 style={{ textAlign: "center", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, color: "#2D3748", letterSpacing: 3, textTransform: "uppercase", margin: "0 0 28px" }}>
          Certificate of Completion
        </h2>

        <p style={{ textAlign: "center", fontSize: 13, color: "#718096", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 2 }}>
          This certificate recognizes that
        </p>

        {/* Name */}
        <h3 style={{
          textAlign: "center",
          fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
          fontSize: 42,
          fontWeight: 400,
          fontStyle: "italic",
          color: "#1a202c",
          margin: "0 0 8px",
          lineHeight: 1.2,
        }}>
          {name}
        </h3>

        {/* Underline */}
        <div style={{ width: 200, height: 2, background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", margin: "0 auto 20px" }} />

        <p style={{ textAlign: "center", fontSize: 13, color: "#718096", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 2 }}>
          Has successfully completed
        </p>

        {/* Course name */}
        <h4 style={{
          textAlign: "center",
          fontFamily: "Georgia, serif",
          fontSize: 26,
          fontWeight: 700,
          color: "#1B5E6B",
          margin: "0 0 16px",
        }}>
          Bloom Investing Foundations
        </h4>

        <p style={{ textAlign: "center", fontSize: 13, color: "#4A5568", lineHeight: 1.8, maxWidth: 460, margin: "0 auto 32px" }}>
          Demonstrating completion of educational modules covering investing fundamentals, stocks & ETFs, market concepts, chart reading, risk awareness, trading psychology and practical market education.
        </p>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Palatino Linotype', Georgia, serif", fontSize: 20, fontStyle: "italic", color: "#1B5E6B", margin: "0 0 4px" }}>Pansy</p>
            <div style={{ width: 80, height: 1, background: "#C9A84C", margin: "0 auto 4px" }} />
            <p style={{ fontSize: 11, color: "#718096", margin: 0, fontWeight: 600 }}>PANSY</p>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>Bloom Learning Guide</p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>🌸</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Palatino Linotype', Georgia, serif", fontSize: 18, fontStyle: "italic", color: "#2D3748", margin: "0 0 4px" }}>{date}</p>
            <div style={{ width: 80, height: 1, background: "#C9A84C", margin: "0 auto 4px" }} />
            <p style={{ fontSize: 11, color: "#718096", margin: 0, fontWeight: 600 }}>DATE COMPLETED</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 32,
          padding: "12px 20px",
          background: "linear-gradient(135deg, #0E1B30, #162844)",
          borderRadius: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: 9, color: "#27B7C8", margin: 0, textTransform: "uppercase", letterSpacing: 2 }}>Certificate ID</p>
            <p style={{ fontSize: 13, color: "#F4F7FA", margin: 0, fontFamily: "monospace", fontWeight: 600 }}>{certId}</p>
          </div>
          <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, maxWidth: 200, textAlign: "right", lineHeight: 1.4 }}>
            For educational achievement only — not a professional or financial-services certification.
          </p>
        </div>
      </div>
    </div>
  );
}

function UniversityCert({ name, date, certId, title, moduleName }: { name: string; date: string; certId: string; title: string; moduleName?: string }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #FAF5EE 0%, #F5EDE0 100%)",
      borderRadius: 16,
      padding: 4,
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    }}>
      <div style={{
        border: "3px solid #C9A84C",
        borderRadius: 14,
        padding: "48px 40px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #FAF5EE 0%, #FFF8EE 50%, #FAF5EE 100%)",
      }}>
        {/* Navy ribbon left */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 24,
          width: 40,
          height: "100%",
          background: "linear-gradient(180deg, #0E1B30, #162844)",
          borderRadius: "0 0 4px 4px",
          opacity: 0.9,
        }}>
          <div style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "2px solid #C9A84C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#C9A84C",
          }}>
            🌸
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24, marginLeft: 40 }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "#1B5E6B", margin: 0, letterSpacing: 2 }}>
            BLOOM
          </h1>
          <p style={{ fontSize: 12, color: "#27B7C8", letterSpacing: 4, margin: "4px 0 0", textTransform: "uppercase" }}>
            She Blooms Wealth
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 auto 20px", maxWidth: 400, marginLeft: 60 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
          <div style={{ fontSize: 14, color: "#C9A84C" }}>✦</div>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
        </div>

        <h2 style={{ textAlign: "center", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 400, color: "#2D3748", letterSpacing: 3, textTransform: "uppercase", margin: "0 0 20px", marginLeft: 40 }}>
          Certificate of Completion
        </h2>

        <p style={{ textAlign: "center", fontSize: 13, color: "#718096", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 2, marginLeft: 40 }}>
          Proudly presented to
        </p>

        <h3 style={{
          textAlign: "center",
          fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
          fontSize: 42,
          fontWeight: 400,
          fontStyle: "italic",
          color: "#1a202c",
          margin: "0 0 8px",
          lineHeight: 1.2,
          marginLeft: 40,
        }}>
          {name}
        </h3>

        <div style={{ width: 200, height: 2, background: "linear-gradient(90deg, transparent, #C9A84C, transparent)", margin: "0 auto 16px", marginLeft: "calc(50% - 80px)" }} />

        <p style={{ textAlign: "center", fontSize: 13, color: "#718096", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 2, marginLeft: 40 }}>
          For successfully completing the
        </p>

        <h4 style={{
          textAlign: "center",
          fontFamily: "Georgia, serif",
          fontSize: 24,
          fontWeight: 700,
          color: "#1B5E6B",
          margin: "0 0 4px",
          textTransform: "uppercase",
          letterSpacing: 2,
          marginLeft: 40,
        }}>
          {title}
        </h4>

        {moduleName && (
          <p style={{ textAlign: "center", fontSize: 14, color: "#C9A84C", margin: "0 0 16px", letterSpacing: 3, textTransform: "uppercase", marginLeft: 40 }}>
            {moduleName}
          </p>
        )}

        <p style={{ textAlign: "center", fontSize: 13, color: "#4A5568", lineHeight: 1.8, maxWidth: 460, margin: "0 auto 32px", marginLeft: "auto" }}>
          You have demonstrated dedication, discipline, and a commitment to continuous growth by completing {moduleName ? `the ${moduleName} module` : "the advanced level"} of Bloom University. You are now better equipped with knowledge, confidence, and a strategic mindset to build your financial future.
        </p>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24, marginLeft: 40 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Palatino Linotype', Georgia, serif", fontSize: 20, fontStyle: "italic", color: "#1B5E6B", margin: "0 0 4px" }}>Pansy</p>
            <div style={{ width: 80, height: 1, background: "#C9A84C", margin: "0 auto 4px" }} />
            <p style={{ fontSize: 11, color: "#718096", margin: 0, fontWeight: 600 }}>PANSY</p>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>Bloom Learning Guide & Founder</p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 4 }}>🏅</div>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "'Palatino Linotype', Georgia, serif", fontSize: 18, fontStyle: "italic", color: "#2D3748", margin: "0 0 4px" }}>{date}</p>
            <div style={{ width: 80, height: 1, background: "#C9A84C", margin: "0 auto 4px" }} />
            <p style={{ fontSize: 11, color: "#718096", margin: 0, fontWeight: 600 }}>DATE COMPLETED</p>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: "4px 0 0" }}>Certificate ID</p>
            <p style={{ fontSize: 11, color: "#2D3748", margin: 0, fontFamily: "monospace" }}>{certId}</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 32,
          padding: "12px 20px",
          background: "linear-gradient(135deg, #0E1B30, #162844)",
          borderRadius: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: 11, color: "#C9A84C", margin: 0, fontWeight: 700, letterSpacing: 1 }}>
              EDUCATION. EMPOWERMENT. FREEDOM.
            </p>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0", fontStyle: "italic" }}>
              Your Money. Your Terms. Your Future.
            </p>
          </div>
          <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, maxWidth: 200, textAlign: "right", lineHeight: 1.4 }}>
            For educational purposes only. Not a professional or financial-services certification.
          </p>
        </div>
      </div>
    </div>
  );
}
