import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { UNIVERSITY_MODULES } from "@/data/university/modules";
import { Loader2, Download, Share2, ArrowLeft, Lock } from "lucide-react";
import Head from "next/head";

interface CertData {
  userName: string;
  completedAt: string | null;
  certId: string;
  eligible: boolean;
  allComplete?: boolean;
  completedCount: number;
  totalRequired?: number;
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
        scale: 3,
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
      const canvas = await html2canvas(certRef.current, { scale: 3, backgroundColor: null });
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

  const notEligible = cert && !cert.eligible;
  const remaining = (cert?.totalRequired || 0) - (cert?.completedCount || 0);
  const pct = cert?.totalRequired ? Math.min(100, Math.round((cert.completedCount / cert.totalRequired) * 100)) : 0;

  return (
    <>
      <Head><title>Certificate of Completion | Bloom</title></Head>
      <div className="fixed inset-0 overflow-y-auto" style={{ background: "#0E1B30" }}>
        <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[#F4F7FA]/50 hover:text-[#F4F7FA]/80 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Certificate with locked overlay when not eligible */}
          <div className="relative">
            <div
              ref={notEligible ? undefined : certRef}
              style={notEligible ? { filter: "blur(4px) grayscale(0.3)", pointerEvents: "none", userSelect: "none" } : undefined}
            >
              {isUniversity ? (
                <UniversityCert name={cert!.userName} date={formatDate(cert!.completedAt)} certId={cert!.certId} title={certTitle} moduleName={mod?.title} />
              ) : (
                <BasicsCert name={cert!.userName} date={formatDate(cert!.completedAt)} certId={cert!.certId} />
              )}
            </div>

            {/* Locked overlay */}
            {notEligible && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center bg-[#0E1B30]/90 backdrop-blur-sm rounded-2xl border border-[#C9A84C]/20 px-8 py-8 max-w-sm mx-4 shadow-2xl">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C9A84C]/10 border-2 border-[#C9A84C]/30 flex items-center justify-center">
                    <Lock className="w-7 h-7 text-[#C9A84C]" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#F4F7FA] mb-2">
                    Almost Yours
                  </h3>
                  <p className="text-sm text-[#F4F7FA]/50 mb-4 leading-relaxed">
                    Complete all lessons to unlock your certificate and download it.
                  </p>
                  {cert!.totalRequired && (
                    <div className="space-y-2 mb-5">
                      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C9A84C] to-[#D4AF37] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#C9A84C]/70 font-medium">
                        {cert!.completedCount} of {cert!.totalRequired} lessons · {remaining} to go
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => router.back()}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#0E1B30] transition-all hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #D4AF37)" }}
                  >
                    Keep Learning
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons — only when eligible */}
          {!notEligible && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #C9A84C, #D4AF37)" }}
              >
                <Download className="w-5 h-5" /> Download Certificate
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[#C9A84C] border border-[#C9A84C]/30 hover:bg-[#C9A84C]/10 transition-all"
              >
                <Share2 className="w-5 h-5" /> Share
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Basics Certificate ─── */
function BasicsCert({ name, date, certId }: { name: string; date: string; certId: string }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #C9A84C, #D4AF37, #C9A84C)",
      borderRadius: 12,
      padding: 3,
      boxShadow: "0 25px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.3)",
    }}>
      <div style={{
        background: "#FFFDF7",
        borderRadius: 10,
        padding: 3,
      }}>
        <div style={{
          border: "2px solid #C9A84C",
          borderRadius: 8,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #FFFDF7 0%, #FFF9EE 30%, #FFFDF7 60%, #FFF9EE 100%)",
        }}>
          {/* Watermark pattern */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.03,
            backgroundImage: "repeating-linear-gradient(45deg, transparent 0, transparent 35px, #C9A84C 35px, #C9A84C 36px)",
          }} />

          {/* Inner border line */}
          <div style={{
            position: "absolute", top: 12, left: 12, right: 12, bottom: 12,
            border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4,
            pointerEvents: "none",
          }} />

          <div style={{ padding: "56px 48px", position: "relative" }}>
            {/* Corner filigree */}
            {[{ top: 16, left: 16, transform: "none" }, { top: 16, right: 16, transform: "scaleX(-1)" }, { bottom: 16, left: 16, transform: "scaleY(-1)" }, { bottom: 16, right: 16, transform: "scale(-1)" }].map((pos, i) => (
              <div key={i} style={{ position: "absolute", ...pos, color: "#C9A84C", opacity: 0.5, fontSize: 24, lineHeight: 1 } as React.CSSProperties}>✦</div>
            ))}

            {/* Seal */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                border: "2px solid #C9A84C",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "radial-gradient(circle, #FFF9EE, #FFFDF7)",
                boxShadow: "0 0 0 4px rgba(201,168,76,0.1), 0 0 0 8px rgba(201,168,76,0.05)",
              }}>
                <span style={{ fontSize: 32 }}>🌸</span>
              </div>
            </div>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <h1 style={{
                fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 32, fontWeight: 700,
                color: "#0E1B30", margin: 0, letterSpacing: 6, textTransform: "uppercase",
              }}>
                BLOOM
              </h1>
              <p style={{
                fontSize: 11, color: "#C9A84C", letterSpacing: 5, margin: "6px 0 0",
                textTransform: "uppercase", fontWeight: 600,
              }}>
                She Blooms Wealth
              </p>
            </div>

            {/* Ornamental divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "0 auto 28px", maxWidth: 380 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C9A84C" }} />
                <div style={{ fontSize: 12, color: "#C9A84C" }}>✦</div>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C9A84C" }} />
              </div>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
            </div>

            {/* Title */}
            <h2 style={{
              textAlign: "center", fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 400,
              color: "#4A5568", letterSpacing: 5, textTransform: "uppercase", margin: "0 0 32px",
            }}>
              Certificate of Completion
            </h2>

            <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 3 }}>
              This is to certify that
            </p>

            {/* Name */}
            <h3 style={{
              textAlign: "center",
              fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
              fontSize: 44, fontWeight: 400, fontStyle: "italic",
              color: "#0E1B30", margin: "0 0 4px", lineHeight: 1.2,
            }}>
              {name}
            </h3>

            {/* Name underline */}
            <div style={{
              width: 240, height: 1, margin: "0 auto 24px",
              background: "linear-gradient(90deg, transparent 0%, #C9A84C 20%, #C9A84C 80%, transparent 100%)",
            }} />

            <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 3 }}>
              Has successfully completed the
            </p>

            {/* Course name */}
            <h4 style={{
              textAlign: "center", fontFamily: "'Georgia', serif",
              fontSize: 26, fontWeight: 700, color: "#0E1B30", margin: "0 0 20px",
            }}>
              Bloom Investing Foundations
            </h4>

            <p style={{
              textAlign: "center", fontSize: 12, color: "#64748B", lineHeight: 1.9,
              maxWidth: 440, margin: "0 auto 40px",
            }}>
              Having demonstrated commitment to financial literacy by completing all educational modules covering investing fundamentals, stocks & ETFs, market concepts, chart reading, risk awareness, trading psychology, and practical market education.
            </p>

            {/* Signature row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: 440, margin: "0 auto" }}>
              <div style={{ textAlign: "center", width: 140 }}>
                <p style={{
                  fontFamily: "'Palatino Linotype', Georgia, serif",
                  fontSize: 22, fontStyle: "italic", color: "#0E1B30", margin: "0 0 6px",
                }}>Pansy</p>
                <div style={{ width: "100%", height: 1, background: "#C9A84C", marginBottom: 6 }} />
                <p style={{ fontSize: 10, color: "#64748B", margin: 0, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Bloom Guide</p>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  border: "2px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "radial-gradient(circle, rgba(201,168,76,0.05), transparent)",
                }}>
                  <span style={{ fontSize: 20, color: "#C9A84C" }}>✦</span>
                </div>
              </div>

              <div style={{ textAlign: "center", width: 140 }}>
                <p style={{
                  fontFamily: "'Palatino Linotype', Georgia, serif",
                  fontSize: 18, fontStyle: "italic", color: "#2D3748", margin: "0 0 6px",
                }}>{date}</p>
                <div style={{ width: "100%", height: 1, background: "#C9A84C", marginBottom: 6 }} />
                <p style={{ fontSize: 10, color: "#64748B", margin: 0, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Date Issued</p>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{
              marginTop: 40, padding: "14px 24px",
              background: "linear-gradient(135deg, #0E1B30, #162844)",
              borderRadius: 6,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <p style={{ fontSize: 8, color: "#C9A84C", margin: 0, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>Certificate ID</p>
                <p style={{ fontSize: 12, color: "#F4F7FA", margin: "2px 0 0", fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: 1 }}>{certId}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 9, color: "#C9A84C", margin: 0, fontWeight: 700, letterSpacing: 2 }}>
                  EDUCATION · EMPOWERMENT · FREEDOM
                </p>
              </div>
              <p style={{ fontSize: 8, color: "#94A3B8", margin: 0, maxWidth: 140, textAlign: "right", lineHeight: 1.5 }}>
                For educational achievement only.
                Not a professional or financial certification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── University Certificate ─── */
function UniversityCert({ name, date, certId, title, moduleName }: { name: string; date: string; certId: string; title: string; moduleName?: string }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #C9A84C, #D4AF37, #C9A84C)",
      borderRadius: 12,
      padding: 3,
      boxShadow: "0 25px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.3)",
    }}>
      <div style={{
        background: "#FFFDF7",
        borderRadius: 10,
        padding: 3,
      }}>
        <div style={{
          border: "2px solid #C9A84C",
          borderRadius: 8,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #FFFDF7 0%, #FFF9EE 30%, #FFFDF7 60%, #FFF9EE 100%)",
        }}>
          {/* Watermark pattern */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.03,
            backgroundImage: "repeating-linear-gradient(45deg, transparent 0, transparent 35px, #C9A84C 35px, #C9A84C 36px)",
          }} />

          {/* Inner border */}
          <div style={{
            position: "absolute", top: 12, left: 12, right: 12, bottom: 12,
            border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4,
            pointerEvents: "none",
          }} />

          {/* Navy ribbon accent on left */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: 6, height: "100%",
            background: "linear-gradient(180deg, #0E1B30, #27B7C8, #0E1B30)",
          }} />

          <div style={{ padding: "56px 48px 56px 56px", position: "relative" }}>
            {/* Corner filigree */}
            {[{ top: 16, left: 20, transform: "none" }, { top: 16, right: 16, transform: "scaleX(-1)" }, { bottom: 16, left: 20, transform: "scaleY(-1)" }, { bottom: 16, right: 16, transform: "scale(-1)" }].map((pos, i) => (
              <div key={i} style={{ position: "absolute", ...pos, color: "#C9A84C", opacity: 0.5, fontSize: 24, lineHeight: 1 } as React.CSSProperties}>✦</div>
            ))}

            {/* Seal with laurel-style border */}
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                border: "3px solid #C9A84C",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "radial-gradient(circle, #FFF9EE, #FFFDF7)",
                boxShadow: "0 0 0 5px rgba(201,168,76,0.1), 0 0 0 10px rgba(201,168,76,0.05), 0 0 0 15px rgba(201,168,76,0.02)",
              }}>
                <span style={{ fontSize: 36 }}>🏅</span>
              </div>
            </div>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 style={{
                fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 32, fontWeight: 700,
                color: "#0E1B30", margin: 0, letterSpacing: 6, textTransform: "uppercase",
              }}>
                BLOOM
              </h1>
              <p style={{
                fontSize: 11, color: "#27B7C8", letterSpacing: 5, margin: "6px 0 0",
                textTransform: "uppercase", fontWeight: 600,
              }}>
                She Blooms Wealth · University
              </p>
            </div>

            {/* Ornamental divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "0 auto 24px", maxWidth: 380 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #C9A84C)" }} />
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C9A84C" }} />
                <div style={{ fontSize: 12, color: "#C9A84C" }}>✦</div>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C9A84C" }} />
              </div>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #C9A84C, transparent)" }} />
            </div>

            {/* Title */}
            <h2 style={{
              textAlign: "center", fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 400,
              color: "#4A5568", letterSpacing: 5, textTransform: "uppercase", margin: "0 0 28px",
            }}>
              Certificate of Completion
            </h2>

            <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 3 }}>
              Proudly presented to
            </p>

            {/* Name */}
            <h3 style={{
              textAlign: "center",
              fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
              fontSize: 44, fontWeight: 400, fontStyle: "italic",
              color: "#0E1B30", margin: "0 0 4px", lineHeight: 1.2,
            }}>
              {name}
            </h3>

            <div style={{
              width: 240, height: 1, margin: "0 auto 24px",
              background: "linear-gradient(90deg, transparent 0%, #C9A84C 20%, #C9A84C 80%, transparent 100%)",
            }} />

            <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 3 }}>
              For successfully completing the
            </p>

            {/* Program name */}
            <h4 style={{
              textAlign: "center", fontFamily: "'Georgia', serif",
              fontSize: 24, fontWeight: 700, color: "#0E1B30", margin: "0 0 4px",
              textTransform: "uppercase", letterSpacing: 3,
            }}>
              {title}
            </h4>

            {moduleName && (
              <p style={{
                textAlign: "center", fontSize: 13, color: "#C9A84C",
                margin: "0 0 16px", letterSpacing: 3, textTransform: "uppercase", fontWeight: 600,
              }}>
                {moduleName}
              </p>
            )}

            <p style={{
              textAlign: "center", fontSize: 12, color: "#64748B", lineHeight: 1.9,
              maxWidth: 440, margin: "0 auto 40px",
            }}>
              Having demonstrated dedication, discipline, and a commitment to continuous growth by completing
              {moduleName ? ` the ${moduleName} module` : " all modules"} of Bloom University.
              This achievement reflects a thorough understanding of advanced trading education
              concepts, chart analysis, and strategic market frameworks.
            </p>

            {/* Signature row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: 440, margin: "0 auto" }}>
              <div style={{ textAlign: "center", width: 140 }}>
                <p style={{
                  fontFamily: "'Palatino Linotype', Georgia, serif",
                  fontSize: 22, fontStyle: "italic", color: "#0E1B30", margin: "0 0 6px",
                }}>Pansy</p>
                <div style={{ width: "100%", height: 1, background: "#C9A84C", marginBottom: 6 }} />
                <p style={{ fontSize: 10, color: "#64748B", margin: 0, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Bloom Guide & Founder</p>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  border: "2px solid #C9A84C", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "radial-gradient(circle, rgba(201,168,76,0.05), transparent)",
                }}>
                  <span style={{ fontSize: 20, color: "#C9A84C" }}>✦</span>
                </div>
              </div>

              <div style={{ textAlign: "center", width: 140 }}>
                <p style={{
                  fontFamily: "'Palatino Linotype', Georgia, serif",
                  fontSize: 18, fontStyle: "italic", color: "#2D3748", margin: "0 0 6px",
                }}>{date}</p>
                <div style={{ width: "100%", height: 1, background: "#C9A84C", marginBottom: 6 }} />
                <p style={{ fontSize: 10, color: "#64748B", margin: 0, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Date Issued</p>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{
              marginTop: 40, padding: "14px 24px",
              background: "linear-gradient(135deg, #0E1B30, #162844)",
              borderRadius: 6,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <p style={{ fontSize: 8, color: "#C9A84C", margin: 0, textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 }}>Certificate ID</p>
                <p style={{ fontSize: 12, color: "#F4F7FA", margin: "2px 0 0", fontFamily: "'Courier New', monospace", fontWeight: 700, letterSpacing: 1 }}>{certId}</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 9, color: "#C9A84C", margin: 0, fontWeight: 700, letterSpacing: 2 }}>
                  EDUCATION · EMPOWERMENT · FREEDOM
                </p>
                <p style={{ fontSize: 8, color: "#94A3B8", margin: "2px 0 0", fontStyle: "italic" }}>
                  Your Money. Your Terms. Your Future.
                </p>
              </div>
              <p style={{ fontSize: 8, color: "#94A3B8", margin: 0, maxWidth: 140, textAlign: "right", lineHeight: 1.5 }}>
                For educational achievement only.
                Not a professional or financial certification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
