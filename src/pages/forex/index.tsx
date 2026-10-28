import { useState, useEffect } from "react";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { FOREX_MODULES } from "@/data/forex/modules";
import { getForexLessonsByModule } from "@/data/forex";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock, ChevronRight, TrendingUp, Shield, BarChart3 } from "lucide-react";

const MODULE_ICONS: Record<string, typeof TrendingUp> = {
  foundations: TrendingUp,
  "broker-platform": Shield,
  analysis: BarChart3,
  "risk-mindset": Shield,
};

export default function ForexLanding() {
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadProgress = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const allModuleIds = FOREX_MODULES.map((m) => m.id);
      const slugs = new Set<string>();

      for (const modId of allModuleIds) {
        try {
          const res = await fetch(`/api/university/progress?module=forex-${modId}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            const data = await res.json();
            (data.progress as { lesson_slug: string }[]).forEach((p) => slugs.add(p.lesson_slug));
          }
        } catch {}
      }
      setCompletedSlugs(slugs);
    };
    loadProgress();
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Forex Trading Lessons",
    description: "Free forex trading education — from currency pairs and pips to risk management and trading psychology. Learn at your own pace with quizzes and broker guides.",
    provider: {
      "@type": "Organization",
      name: "Bloom",
      url: "https://shebloomswealth.app",
    },
    hasCourseInstance: FOREX_MODULES.map((mod) => ({
      "@type": "CourseInstance",
      name: mod.title,
      description: mod.subtitle,
    })),
  };

  return (
    <Layout>
      <SEO
        title="Forex Trading Lessons — Bloom"
        description="Free forex trading education — from currency pairs and pips to risk management and trading psychology. 20 lessons with quizzes, written in plain English."
        jsonLd={jsonLd}
      />

      <div className="min-h-screen pb-24" style={{ background: "var(--r-bg)" }}>
        {/* Hero */}
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0E1B30 0%, #16264A 50%, #0E1B30 100%)" }}
        >
          <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">💱</span>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--r-teal)" }}>
                Forex Course
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3" style={{ color: "var(--r-ivory)" }}>
              Forex Trading Lessons
            </h1>
            <p className="text-base leading-relaxed max-w-xl" style={{ color: "var(--r-ivory)", opacity: 0.7 }}>
              Everything you need to understand the foreign exchange market — from your first currency pair
              to building a risk management plan. 20 lessons, 4 modules, zero jargon bombs.
            </p>

            <div className="flex items-center gap-4 mt-6 text-xs" style={{ color: "var(--r-ivory)", opacity: 0.5 }}>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> 20 lessons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~2 hours total
              </span>
              <span className="px-2 py-0.5 rounded-full border border-white/20 text-[10px]">
                Free
              </span>
            </div>
          </div>
        </div>

        {/* Pansy intro */}
        <div className="max-w-3xl mx-auto px-4 mt-8">
          <div className="p-5 rounded-2xl border" style={{ borderColor: "rgba(39,183,200,0.3)", background: "rgba(39,183,200,0.05)" }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🌸</span>
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--r-teal)" }}>From Pansy</p>
                <p className="text-sm leading-relaxed italic" style={{ color: "var(--r-ivory)", opacity: 0.8 }}>
                  Forex can feel intimidating — a 24-hour market with its own language and lightning-fast moves.
                  But I've broken it down into bite-sized lessons that build on each other. No prior
                  experience needed. Take your time, pass the quizzes, and you'll walk away understanding
                  how the world's largest financial market actually works.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
          {FOREX_MODULES.map((mod) => {
            const lessons = getForexLessonsByModule(mod.id);
            const completed = lessons.filter((l) => completedSlugs.has(l.slug)).length;
            const pct = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

            return (
              <div
                key={mod.id}
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: "rgba(255,255,255,0.1)", background: "#121821" }}
              >
                {/* Module header */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{mod.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--r-teal)" }}>
                          Module {mod.number}
                        </span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{
                            background: mod.difficulty === "Beginner" ? "rgba(73,176,110,0.15)" : "rgba(39,183,200,0.15)",
                            color: mod.difficulty === "Beginner" ? "#49B06E" : "#27B7C8",
                          }}
                        >
                          {mod.difficulty}
                        </span>
                      </div>
                      <h2 className="text-lg font-serif font-semibold" style={{ color: "var(--r-ivory)" }}>
                        {mod.title}
                      </h2>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed ml-11" style={{ color: "var(--r-ivory)", opacity: 0.5 }}>
                    {mod.subtitle}
                  </p>

                  {completed > 0 && (
                    <div className="mt-3 ml-11">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px]" style={{ color: "var(--r-ivory)", opacity: 0.4 }}>
                          {completed}/{lessons.length} completed
                        </span>
                        <span className="text-[10px] font-mono" style={{ color: "var(--r-teal)" }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: "var(--r-teal)" }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson list */}
                <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {lessons.map((lesson, idx) => {
                    const done = completedSlugs.has(lesson.slug);
                    return (
                      <Link
                        key={lesson.slug}
                        href={`/forex/${lesson.slug}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors group"
                        style={{ borderBottom: idx < lessons.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined }}
                      >
                        <span
                          className="w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-semibold flex-shrink-0"
                          style={{
                            background: done ? "rgba(73,176,110,0.2)" : "rgba(255,255,255,0.08)",
                            color: done ? "#49B06E" : "rgba(243,237,227,0.4)",
                          }}
                        >
                          {done ? "✓" : idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "var(--r-ivory)" }}>
                            {lesson.title}
                          </p>
                          <p className="text-xs truncate" style={{ color: "var(--r-ivory)", opacity: 0.4 }}>
                            {lesson.readingMinutes} min · {lesson.quiz.length} questions
                          </p>
                        </div>
                        <ChevronRight
                          className="w-4 h-4 flex-shrink-0 opacity-30 group-hover:opacity-70 transition-opacity"
                          style={{ color: "var(--r-teal)" }}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Broker disclosure */}
        <div className="max-w-3xl mx-auto px-4 mt-8">
          <div className="p-4 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "var(--r-ivory)", opacity: 0.25 }}>
              This course is for educational purposes only and does not constitute financial advice.
              Trading CFDs and forex carries a high risk of losing money. Not financial advice.
              We may earn a commission if you sign up with a broker through our links.
              Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
