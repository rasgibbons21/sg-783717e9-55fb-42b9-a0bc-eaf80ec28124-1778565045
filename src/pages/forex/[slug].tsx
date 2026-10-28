import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import {
  getAllForexLessons,
  getForexLessonBySlug,
  getForexModuleById,
  FOREX_MODULES,
} from "@/data/forex";
import type { ForexLesson } from "@/data/forex";
import { supabase } from "@/integrations/supabase/client";
import BrokerPromoCard from "@/components/BrokerPromoCard";
import { ReviewPrompt, shouldShowReviewPrompt } from "@/components/ReviewPrompt";
import { useShareAchievement } from "@/components/ShareAchievement";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

function ForexQuizSection({
  lesson,
  token,
  onPass,
}: {
  lesson: ForexLesson;
  token: string | null;
  onPass: () => void;
}) {
  const [selected, setSelected] = useState<(number | null)[]>(
    new Array(lesson.quiz.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    const next = [...selected];
    next[qIdx] = optIdx;
    setSelected(next);
  };

  const handleSubmit = async () => {
    if (selected.some((s) => s === null)) return;
    const correct = selected.reduce<number>(
      (acc, ans, i) => acc + (ans === lesson.quiz[i].correct ? 1 : 0),
      0
    );
    const didPass = correct / lesson.quiz.length >= 0.75;
    setScore(correct);
    setSubmitted(true);

    if (token) {
      setSaving(true);
      try {
        await fetch("/api/university/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            moduleSlug: `forex-${lesson.module}`,
            lessonSlug: lesson.slug,
            answers: selected,
            score: correct,
            total: lesson.quiz.length,
          }),
        });
        setSaved(true);
        if (didPass) onPass();
      } finally {
        setSaving(false);
      }
    } else if (didPass) {
      onPass();
    }
  };

  const passed = submitted && score / lesson.quiz.length >= 0.75;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-serif font-semibold text-[#F3EDE3] mb-6">Knowledge Check</h2>
      <div className="space-y-8">
        {lesson.quiz.map((q, qIdx) => (
          <div key={qIdx} className="p-5 rounded-2xl border border-white/10 bg-[#121821]">
            <p className="text-[#F3EDE3] font-medium mb-4 text-sm leading-relaxed">
              {qIdx + 1}. {q.q}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = selected[qIdx] === optIdx;
                const isCorrect = optIdx === q.correct;
                let border = "border-white/10";
                let bg = "bg-transparent";
                let text = "text-[#F3EDE3]/70";

                if (submitted) {
                  if (isCorrect) {
                    border = "border-[#49B06E]";
                    bg = "bg-[#49B06E]/10";
                    text = "text-[#49B06E]";
                  } else if (isSelected && !isCorrect) {
                    border = "border-red-400";
                    bg = "bg-red-400/10";
                    text = "text-red-400";
                  }
                } else if (isSelected) {
                  border = "border-[#27B7C8]";
                  bg = "bg-[#27B7C8]/10";
                  text = "text-[#27B7C8]";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${border} ${bg} ${text} ${
                      !submitted ? "hover:border-[#27B7C8]/50 hover:bg-[#27B7C8]/5" : ""
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-3 p-3 rounded-lg bg-white/5 text-xs text-[#F3EDE3]/60 leading-relaxed">
                {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected.some((s) => s === null)}
          className="mt-6 w-full py-3 rounded-xl font-medium text-sm bg-[#27B7C8] text-[#07080C] hover:bg-[#27B7C8]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Submit Answers
        </button>
      )}

      {submitted && (
        <div
          className={`mt-6 p-5 rounded-2xl border text-center ${
            passed ? "border-[#49B06E]/40 bg-[#49B06E]/5" : "border-white/10 bg-white/5"
          }`}
        >
          <div className="text-3xl mb-2">{passed ? "🎉" : "📚"}</div>
          <p className="text-[#F3EDE3] font-semibold">
            {score} / {lesson.quiz.length} correct
          </p>
          <p className="text-[#F3EDE3]/50 text-sm mt-1">
            {passed
              ? "Nicely done! You passed the quiz."
              : "Review the lesson and try again — it takes repetition to internalize."}
          </p>
          {saving && <p className="text-xs text-[#F3EDE3]/30 mt-2">Saving result…</p>}
          {saved && !saving && <p className="text-xs text-[#49B06E] mt-2">Result saved ✓</p>}
        </div>
      )}
    </div>
  );
}

export default function ForexLessonPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [token, setToken] = useState<string | null>(null);
  const [progressMarked, setProgressMarked] = useState(false);
  const [progressReward, setProgressReward] = useState<{ xp: number; mission: string | null } | null>(null);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const { share, ShareModal } = useShareAchievement();

  const lesson = typeof slug === "string" ? getForexLessonBySlug(slug) : undefined;
  const mod = lesson ? getForexModuleById(lesson.module) : undefined;

  const allLessons = getAllForexLessons();
  const currentIdx = lesson ? allLessons.findIndex((l) => l.slug === lesson.slug) : -1;
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const moduleSlug = lesson ? `forex-${lesson.module}` : "";

  const markProgress = useCallback(
    async (tok: string) => {
      if (progressMarked || !lesson) return;
      setProgressMarked(true);
      try {
        const res = await fetch("/api/university/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
          body: JSON.stringify({ moduleSlug, lessonSlug: lesson.slug }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.xp_awarded > 0 || data.mission_unlocked) {
            setProgressReward({ xp: data.xp_awarded ?? 0, mission: data.mission_unlocked ?? null });
          }
          setTimeout(() => {
            share({
              type: "achievement",
              title: lesson.title,
              subtitle: mod ? `${mod.title} — Bloom Forex` : "Bloom Forex",
              emoji: "💱",
              stats: data.xp_awarded > 0 ? [{ label: "XP Earned", value: `+${data.xp_awarded}` }] : undefined,
            });
          }, 1500);
          const completed = data.total_completed ?? 0;
          if (shouldShowReviewPrompt(completed)) {
            setTimeout(() => setShowReviewPrompt(true), 3000);
          }
        }
      } catch {}
    },
    [moduleSlug, lesson, progressMarked, mod, share]
  );

  useEffect(() => {
    if (!lesson) return;
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const tok = session.access_token;
      setToken(tok);

      try {
        const res = await fetch(`/api/university/progress?module=${moduleSlug}`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
        if (res.ok) {
          const data = await res.json();
          const alreadyDone = (data.progress as { lesson_slug: string }[]).some(
            (p) => p.lesson_slug === lesson.slug
          );
          if (alreadyDone) setProgressMarked(true);
        }
      } catch {}
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!lesson || !mod) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--r-bg)" }}>
          <p className="text-sm" style={{ color: "var(--r-ivory)", opacity: 0.5 }}>
            {router.isReady ? "Lesson not found." : "Loading…"}
          </p>
        </div>
      </Layout>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: lesson.title,
    description: lesson.subtitle,
    author: { "@type": "Organization", name: "Bloom" },
    publisher: {
      "@type": "Organization",
      name: "Bloom",
      url: "https://shebloomswealth.app",
    },
    mainEntityOfPage: `https://shebloomswealth.app/forex/${lesson.slug}`,
    keywords: lesson.seoKeywords.join(", "),
  };

  return (
    <Layout>
      <SEO
        title={`${lesson.title} — Forex Lessons — Bloom`}
        description={lesson.subtitle}
        type="article"
        jsonLd={jsonLd}
      />

      <div className="min-h-screen pb-24" style={{ background: "var(--r-bg)" }}>
        {/* Breadcrumb */}
        <div className="border-b border-white/10" style={{ background: "#0F1E33" }}>
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-2 text-xs" style={{ color: "rgba(243,237,227,0.4)" }}>
            <Link href="/forex" className="hover:text-[#27B7C8] transition-colors">Forex</Link>
            <span>/</span>
            <span style={{ color: "rgba(243,237,227,0.7)" }}>{lesson.title}</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{mod.icon}</span>
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--r-teal)" }}
              >
                Module {mod.number}: {mod.title}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  lesson.difficulty === "Beginner"
                    ? "bg-[#49B06E]/20 text-[#49B06E]"
                    : "bg-[#27B7C8]/20 text-[#27B7C8]"
                }`}
              >
                {lesson.difficulty}
              </span>
              <span className="text-xs flex items-center gap-1" style={{ color: "rgba(243,237,227,0.4)" }}>
                <Clock className="w-3 h-3" />
                {lesson.readingMinutes} min read
              </span>
            </div>
            <h1 className="text-3xl font-serif font-bold mb-2" style={{ color: "var(--r-ivory)" }}>
              {lesson.title}
            </h1>
            <p className="leading-relaxed" style={{ color: "var(--r-ivory)", opacity: 0.6 }}>
              {lesson.subtitle}
            </p>
          </div>

          {/* Pansy Intro */}
          <div className="p-5 rounded-2xl border mb-10" style={{ borderColor: "rgba(39,183,200,0.3)", background: "rgba(39,183,200,0.05)" }}>
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🌸</span>
              <div>
                <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--r-teal)" }}>Pansy</p>
                <p className="text-sm leading-relaxed italic" style={{ color: "var(--r-ivory)", opacity: 0.8 }}>
                  {lesson.pansyIntro}
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {lesson.sections.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-xl font-serif font-semibold mb-4" style={{ color: "var(--r-ivory)" }}>
                  {section.heading}
                </h2>
                <div className="space-y-4">
                  {section.content.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx} className="text-sm leading-relaxed" style={{ color: "var(--r-ivory)", opacity: 0.75 }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Key Takeaways */}
          <div className="mt-10 p-5 rounded-2xl border border-white/10 bg-[#121821]">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--r-teal)" }}>
              Key Takeaways
            </h3>
            <ul className="space-y-2">
              {lesson.keyTakeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: "var(--r-ivory)", opacity: 0.7 }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#49B06E" }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Quiz */}
          <ForexQuizSection
            lesson={lesson}
            token={token}
            onPass={() => {
              if (token) markProgress(token);
              else setProgressMarked(true);
            }}
          />

          {/* Progress indicator */}
          {progressMarked && (
            <div className="mt-8 space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#49B06E]">
                <CheckCircle className="w-4 h-4" />
                Lesson complete
                {progressReward && progressReward.xp > 0 && (
                  <span className="text-xs font-mono text-[#27B7C8] ml-1">+{progressReward.xp} XP</span>
                )}
              </div>
              {progressReward?.mission && (
                <div className="flex items-center gap-2 rounded-lg bg-[#27B7C8]/10 border border-[#27B7C8]/25 px-3 py-2">
                  <Sparkles className="w-4 h-4 text-[#27B7C8] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#27B7C8]">Mission Unlocked!</p>
                    <p className="text-xs text-[#F3EDE3]/60">
                      Head to{" "}
                      <Link href="/progression" className="underline text-[#27B7C8]">My Progression</Link>
                      {" "}to see your new mission.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Broker promo — after completion */}
          {progressMarked && (
            <BrokerPromoCard
              onContinue={nextLesson ? () => router.push(`/forex/${nextLesson.slug}`) : undefined}
            />
          )}

          {/* Prev / Next navigation */}
          <div className="mt-10 flex justify-between items-center">
            {prevLesson ? (
              <Link href={`/forex/${prevLesson.slug}`}>
                <button className="flex items-center gap-2 text-sm hover:text-[#27B7C8] transition-colors" style={{ color: "rgba(243,237,227,0.5)" }}>
                  <ArrowLeft className="w-4 h-4" />
                  {prevLesson.title}
                </button>
              </Link>
            ) : (
              <Link href="/forex">
                <button className="flex items-center gap-2 text-sm hover:text-[#27B7C8] transition-colors" style={{ color: "rgba(243,237,227,0.5)" }}>
                  <ArrowLeft className="w-4 h-4" />
                  All Forex Lessons
                </button>
              </Link>
            )}
            {nextLesson && (
              <Link href={`/forex/${nextLesson.slug}`}>
                <button className="flex items-center gap-2 text-sm font-medium text-[#27B7C8] hover:text-[#27B7C8]/80 transition-colors">
                  {nextLesson.title}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-xs leading-relaxed" style={{ color: "rgba(243,237,227,0.25)" }}>
              Trading CFDs and forex carries a high risk of losing money. Not financial advice.
              We may earn a commission if you sign up with a broker through our links.
              Educational content only — nothing in this lesson constitutes a recommendation to buy or sell any financial instrument.
              Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>

      {showReviewPrompt && (
        <ReviewPrompt
          trigger={lesson.title}
          onClose={() => setShowReviewPrompt(false)}
        />
      )}
      {ShareModal}
    </Layout>
  );
}
