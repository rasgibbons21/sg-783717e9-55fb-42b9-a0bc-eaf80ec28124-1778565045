import type { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { UNIVERSITY_MODULES, getModuleBySlug } from "@/data/university/modules";
import { M1_LESSONS } from "@/data/university/m1-chart-reading";
import { M2_LESSONS } from "@/data/university/m2-chart-patterns";
import { M3_LESSONS } from "@/data/university/m3-indicators";
import { M4_LESSONS } from "@/data/university/m4-trading-signals";
import { M5_LESSONS } from "@/data/university/m5-strategies";
import { M6_LESSONS } from "@/data/university/m6-entering";
import { M7_LESSONS } from "@/data/university/m7-managing";
import { M10_LESSONS } from "@/data/university/m10-candlestick-patterns";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ArrowLeft, CheckCircle, Clock, BookOpen, Bookmark } from "lucide-react";

interface LessonProgress {
  lesson_slug: string;
  completed_at: string;
}

interface Props {
  moduleSlug: string;
  requiresClientAuth?: boolean;
}

export default function ModulePage({ moduleSlug, requiresClientAuth }: Props) {
  const mod = getModuleBySlug(moduleSlug);
  const [isVerifying, setIsVerifying] = useState(!!requiresClientAuth);
  const [isAuthorized, setIsAuthorized] = useState(!requiresClientAuth);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<Set<string>>(new Set());

  const lessons =
    moduleSlug === "m1-chart-reading" ? M1_LESSONS
    : moduleSlug === "m2-chart-patterns" ? M2_LESSONS
    : moduleSlug === "m3-indicators" ? M3_LESSONS
    : moduleSlug === "m4-trading-signals" ? M4_LESSONS
    : moduleSlug === "m5-strategies" ? M5_LESSONS
    : moduleSlug === "m6-entering" ? M6_LESSONS
    : moduleSlug === "m7-managing" ? M7_LESSONS
    : moduleSlug === "m10-candlestick-patterns" ? M10_LESSONS
    : [];

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/pricing";
        return;
      }

      if (requiresClientAuth) {
        const check = await fetch(`/api/university/progress?module=${moduleSlug}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (check.status === 401 || check.status === 403) {
          window.location.href = "/pricing";
          return;
        }
        setIsAuthorized(true);
        setIsVerifying(false);
      }

      const res = await fetch(`/api/university/progress?module=${moduleSlug}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCompletedSlugs(new Set((data.progress as LessonProgress[]).map((p) => p.lesson_slug)));
        setBookmarkedSlugs(new Set(data.bookmarks as string[]));
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleSlug, requiresClientAuth]);

  if (isVerifying) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#0E1B30]">
          <div className="w-12 h-12 border-4 border-[#27B7C8] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isAuthorized || !mod) return null;

  const completedCount = completedSlugs.size;
  const pct = Math.round((completedCount / lessons.length) * 100);

  return (
    <Layout>
      <SEO title={`${mod.title} — Bloom University`} description={mod.subtitle} />

      <div className="bg-[#0E1B30] min-h-screen">
        {/* Header */}
        <div className="border-b border-white/10 bg-[#0F1E33]">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <Link href="/university" className="inline-flex items-center gap-1 text-sm text-[#27B7C8] hover:text-[#27B7C8]/80 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Bloom University
            </Link>
            <div className="flex items-start gap-4">
              <span className="text-4xl">{mod.icon}</span>
              <div className="flex-1">
                <div className="text-xs text-[#27B7C8] font-medium mb-1">Module {mod.number} · {mod.difficulty}</div>
                <h1 className="text-2xl font-serif font-bold text-[#F4F7FA] mb-2">{mod.title}</h1>
                <p className="text-[#F4F7FA]/60 text-sm leading-relaxed">{mod.subtitle}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-[#F4F7FA]/50 mb-1.5">
                <span>{completedCount} of {lessons.length} lessons complete</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#27B7C8] to-[#49B06E] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-3">
            {lessons.map((lesson, idx) => {
              const done = completedSlugs.has(lesson.slug);
              const bookmarked = bookmarkedSlugs.has(lesson.slug);

              return (
                <Link key={lesson.slug} href={`/university/${moduleSlug}/${lesson.slug}`}>
                  <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                    done
                      ? "border-[#49B06E]/30 bg-[#49B06E]/5 hover:border-[#49B06E]/50"
                      : "border-white/10 bg-[#162540] hover:border-[#27B7C8]/40"
                  }`}>
                    {/* Number / check */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      done ? "bg-[#49B06E] text-white" : "bg-white/10 text-[#F4F7FA]/60"
                    }`}>
                      {done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[#F4F7FA] font-medium text-sm">{lesson.title}</h3>
                        {bookmarked && <Bookmark className="w-3 h-3 text-[#27B7C8] flex-shrink-0" />}
                      </div>
                      <p className="text-[#F4F7FA]/40 text-xs mt-0.5 truncate">{lesson.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        lesson.difficulty === "Beginner"
                          ? "bg-[#49B06E]/20 text-[#49B06E]"
                          : "bg-[#27B7C8]/20 text-[#27B7C8]"
                      }`}>
                        {lesson.difficulty}
                      </span>
                      <span className="text-xs text-[#F4F7FA]/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.readingMinutes}m
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {completedCount === lessons.length && lessons.length > 0 && (
            <div className="mt-8 p-6 rounded-2xl border border-[#49B06E]/30 bg-[#49B06E]/5 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-[#F4F7FA] font-semibold mb-1">Module Complete!</h3>
              <p className="text-[#F4F7FA]/60 text-sm">
                {mod.badgeName} badge earned. You&apos;ve worked through all {lessons.length} lessons in {mod.title}.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const moduleSlug = params?.module as string;
  const mod = UNIVERSITY_MODULES.find((m) => m.slug === moduleSlug);
  if (!mod) return { notFound: true };

  const result = await requireProUserSSR(req);

  if (result.status === "not-pro" || result.status === "unauthenticated") {
    return { redirect: { destination: "/pricing", permanent: false } };
  }

  if (result.status === "no-cookie") {
    return { props: { moduleSlug, requiresClientAuth: true } };
  }

  return { props: { moduleSlug } };
};
