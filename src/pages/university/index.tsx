import type { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { UNIVERSITY_MODULES } from "@/data/university/modules";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { GraduationCap, BookOpen, Lock, CheckCircle, Clock } from "lucide-react";

interface LessonProgress {
  lesson_slug: string;
  completed_at: string;
}

interface ProgressData {
  progress: LessonProgress[];
  bookmarks: string[];
}

interface Props {
  requiresClientAuth?: boolean;
}

export default function UniversityIndex({ requiresClientAuth }: Props) {
  const [isVerifying, setIsVerifying] = useState(!!requiresClientAuth);
  const [isAuthorized, setIsAuthorized] = useState(!requiresClientAuth);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress[]>>({});

  useEffect(() => {
    if (!requiresClientAuth) {
      loadProgress();
      return;
    }

    // Client-side auth check
    const verify = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/pricing";
        return;
      }

      const res = await fetch("/api/university/progress?module=m1-chart-reading", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = "/pricing";
        return;
      }

      setIsAuthorized(true);
      setIsVerifying(false);
      loadProgress();
    };

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresClientAuth]);

  const loadProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/api/university/progress?module=m1-chart-reading", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.ok) {
      const data: ProgressData = await res.json();
      setProgressMap({ "m1-chart-reading": data.progress });
    }
  };

  if (isVerifying) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#0E1B30]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#27B7C8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#F4F7FA]/60 text-sm">Verifying your access…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) return null;

  const m1Progress = progressMap["m1-chart-reading"] ?? [];
  const m1CompletedCount = m1Progress.length;
  const m1TotalLessons = 10;

  return (
    <Layout>
      <SEO
        title="Bloom University — Pro Trading Education"
        description="Bloom University: structured, compliance-safe trading education for serious investors. Pro members only."
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0E1B30] via-[#0E1B30] to-[#162540] border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[#27B7C8]/10 text-[#27B7C8] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            Pro Members Only
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#F4F7FA] mb-4">
            🌸 Bloom University
          </h1>
          <p className="text-[#F4F7FA]/70 text-lg max-w-2xl mx-auto">
            Structured trading education built the right way — no hype, no directives, just the real patterns and frameworks that experienced traders use to make sense of price action.
          </p>

          {/* M1 Progress Bar */}
          {m1CompletedCount > 0 && (
            <div className="mt-8 max-w-sm mx-auto">
              <div className="flex justify-between text-xs text-[#F4F7FA]/50 mb-1">
                <span>Module 1 Progress</span>
                <span>{m1CompletedCount}/{m1TotalLessons} lessons</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#27B7C8] to-[#49B06E] rounded-full transition-all"
                  style={{ width: `${(m1CompletedCount / m1TotalLessons) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="bg-[#0E1B30] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-xl font-semibold text-[#F4F7FA] mb-8">All Modules</h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {UNIVERSITY_MODULES.map((mod) => {
              const UNLOCKED = new Set(["m1-chart-reading", "m2-chart-patterns", "m4-trading-signals"]);
              const isUnlocked = UNLOCKED.has(mod.slug);
              const progress = progressMap[mod.slug] ?? [];
              const completed = progress.length;
              const pct = isUnlocked ? Math.round((completed / mod.lessonCount) * 100) : 0;

              return (
                <div
                  key={mod.slug}
                  className={`relative rounded-2xl border p-5 transition-all ${
                    isUnlocked
                      ? "border-[#27B7C8]/30 bg-[#162540] hover:border-[#27B7C8]/60 cursor-pointer"
                      : "border-white/10 bg-[#0F1E33] opacity-60"
                  }`}
                >
                  {/* Lock badge */}
                  {!isUnlocked && (
                    <div className="absolute top-3 right-3">
                      <Lock className="w-4 h-4 text-[#F4F7FA]/30" />
                    </div>
                  )}

                  <div className="text-3xl mb-3">{mod.icon}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[#27B7C8]">Module {mod.number}</span>
                    <span className="text-xs text-[#F4F7FA]/40">·</span>
                    <span className="text-xs text-[#F4F7FA]/40">{mod.difficulty}</span>
                  </div>
                  <h3 className="text-[#F4F7FA] font-semibold text-base mb-1">{mod.title}</h3>
                  <p className="text-[#F4F7FA]/50 text-xs leading-relaxed mb-4 line-clamp-3">{mod.subtitle}</p>

                  <div className="flex items-center justify-between text-xs text-[#F4F7FA]/40 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {mod.lessonCount} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mod.estimatedHours}h
                    </span>
                  </div>

                  {isUnlocked && (
                    <>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-[#27B7C8] to-[#49B06E] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <Link href={`/university/${mod.slug}`}>
                        <button className="w-full py-2 text-sm font-medium rounded-xl bg-[#27B7C8] text-[#0E1B30] hover:bg-[#27B7C8]/90 transition-colors">
                          {completed === 0 ? "Start Module" : completed === mod.lessonCount ? "Review Module" : "Continue"}
                        </button>
                      </Link>
                    </>
                  )}

                  {!isUnlocked && (
                    <div className="text-xs text-[#F4F7FA]/30 text-center py-1">Coming soon</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="mt-16 p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-xs text-[#F4F7FA]/40 leading-relaxed">
              <strong className="text-[#F4F7FA]/60">Educational purposes only.</strong>{" "}
              Bloom University is designed to teach chart reading, technical analysis concepts, and market frameworks. Nothing in these lessons constitutes financial advice or a recommendation to buy or sell any security. All patterns discussed can and do fail regularly. Trading involves significant risk of loss, and past patterns are not predictive of future results. Always conduct your own research.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const result = await requireProUserSSR(req);

  if (result.status === "not-pro" || result.status === "unauthenticated") {
    return { redirect: { destination: "/pricing", permanent: false } };
  }

  if (result.status === "no-cookie") {
    return { props: { requiresClientAuth: true } };
  }

  return { props: {} };
};
