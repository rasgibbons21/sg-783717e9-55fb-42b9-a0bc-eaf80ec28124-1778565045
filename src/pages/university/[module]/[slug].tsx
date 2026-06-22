import type { GetServerSideProps } from "next";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { requireProUserSSR } from "@/lib/requireProUserSSR";
import { UNIVERSITY_MODULES, getModuleBySlug } from "@/data/university/modules";
import { getM1LessonBySlug, UniversityLesson } from "@/data/university/m1-chart-reading";
import { getM2LessonBySlug } from "@/data/university/m2-chart-patterns";
import { getM4LessonBySlug } from "@/data/university/m4-trading-signals";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Bookmark, BookmarkCheck, CheckCircle, Clock } from "lucide-react";

interface Props {
  moduleSlug: string;
  lessonSlug: string;
  requiresClientAuth?: boolean;
}

function QuizSection({
  lesson,
  moduleSlug,
  token,
}: {
  lesson: UniversityLesson;
  moduleSlug: string;
  token: string;
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
    const allAnswered = selected.every((s) => s !== null);
    if (!allAnswered) return;

    const correct = selected.reduce<number>(
      (acc, ans, i) => acc + (ans === lesson.quiz[i].correct ? 1 : 0),
      0
    );

    setScore(correct);
    setSubmitted(true);
    setSaving(true);

    try {
      await fetch("/api/university/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          moduleSlug,
          lessonSlug: lesson.slug,
          answers: selected,
          score: correct,
          total: lesson.quiz.length,
        }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const passed = submitted && score / lesson.quiz.length >= 0.75;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-serif font-semibold text-[#F4F7FA] mb-6">Knowledge Check</h2>

      <div className="space-y-8">
        {lesson.quiz.map((q, qIdx) => (
          <div key={qIdx} className="p-5 rounded-2xl border border-white/10 bg-[#162540]">
            <p className="text-[#F4F7FA] font-medium mb-4 text-sm leading-relaxed">
              {qIdx + 1}. {q.q}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = selected[qIdx] === optIdx;
                const isCorrect = optIdx === q.correct;
                let borderColor = "border-white/10";
                let bg = "bg-transparent";
                let textColor = "text-[#F4F7FA]/70";

                if (submitted) {
                  if (isCorrect) {
                    borderColor = "border-[#49B06E]";
                    bg = "bg-[#49B06E]/10";
                    textColor = "text-[#49B06E]";
                  } else if (isSelected && !isCorrect) {
                    borderColor = "border-red-400";
                    bg = "bg-red-400/10";
                    textColor = "text-red-400";
                  }
                } else if (isSelected) {
                  borderColor = "border-[#27B7C8]";
                  bg = "bg-[#27B7C8]/10";
                  textColor = "text-[#27B7C8]";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${borderColor} ${bg} ${textColor} ${
                      !submitted ? "hover:border-[#27B7C8]/50 hover:bg-[#27B7C8]/5" : ""
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-3 p-3 rounded-lg bg-white/5 text-xs text-[#F4F7FA]/60 leading-relaxed">
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
          className="mt-6 w-full py-3 rounded-xl font-medium text-sm bg-[#27B7C8] text-[#0E1B30] hover:bg-[#27B7C8]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Submit Answers
        </button>
      )}

      {submitted && (
        <div className={`mt-6 p-5 rounded-2xl border text-center ${
          passed ? "border-[#49B06E]/40 bg-[#49B06E]/5" : "border-white/10 bg-white/5"
        }`}>
          <div className="text-3xl mb-2">{passed ? "🎉" : "📚"}</div>
          <p className="text-[#F4F7FA] font-semibold">
            {score} / {lesson.quiz.length} correct
          </p>
          <p className="text-[#F4F7FA]/50 text-sm mt-1">
            {passed ? "Nicely done! You passed the quiz." : "Review the lesson and try again — patterns take time to internalize."}
          </p>
          {saving && <p className="text-xs text-[#F4F7FA]/30 mt-2">Saving result…</p>}
          {saved && !saving && <p className="text-xs text-[#49B06E] mt-2">Result saved ✓</p>}
        </div>
      )}
    </div>
  );
}

export default function LessonPage({ moduleSlug, lessonSlug, requiresClientAuth }: Props) {
  const mod = getModuleBySlug(moduleSlug);
  const [isVerifying, setIsVerifying] = useState(!!requiresClientAuth);
  const [isAuthorized, setIsAuthorized] = useState(!requiresClientAuth);
  const [token, setToken] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [progressMarked, setProgressMarked] = useState(false);

  // Load lesson client-side (always from static data, no API call needed)
  const lesson =
    moduleSlug === "m1-chart-reading" ? getM1LessonBySlug(lessonSlug)
    : moduleSlug === "m2-chart-patterns" ? getM2LessonBySlug(lessonSlug)
    : moduleSlug === "m4-trading-signals" ? getM4LessonBySlug(lessonSlug)
    : undefined;

  const markProgress = useCallback(
    async (tok: string) => {
      if (progressMarked) return;
      setProgressMarked(true);
      await fetch("/api/university/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify({ moduleSlug, lessonSlug }),
      });
    },
    [moduleSlug, lessonSlug, progressMarked]
  );

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/pricing";
        return;
      }

      const tok = session.access_token;
      setToken(tok);

      if (requiresClientAuth) {
        const check = await fetch(`/api/university/progress?module=${moduleSlug}`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
        if (check.status === 401 || check.status === 403) {
          window.location.href = "/pricing";
          return;
        }
        setIsAuthorized(true);
        setIsVerifying(false);

        // Load bookmarks
        const data = await check.json();
        setIsBookmarked((data.bookmarks as string[]).includes(lessonSlug));
      } else {
        const res = await fetch(`/api/university/progress?module=${moduleSlug}`, {
          headers: { Authorization: `Bearer ${tok}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked((data.bookmarks as string[]).includes(lessonSlug));
        }
      }

      // Mark lesson as read (with slight delay so user actually sees the page)
      setTimeout(() => markProgress(tok), 3000);
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleSlug, lessonSlug, requiresClientAuth]);

  const toggleBookmark = async () => {
    if (!token) return;
    const action = isBookmarked ? "remove" : "add";
    const res = await fetch("/api/university/bookmark", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ moduleSlug, lessonSlug, action }),
    });
    if (res.ok) setIsBookmarked(!isBookmarked);
  };

  if (isVerifying) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#0E1B30]">
          <div className="w-12 h-12 border-4 border-[#27B7C8] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isAuthorized || !lesson || !mod) return null;

  return (
    <Layout>
      <SEO title={`${lesson.title} — ${mod.title} — Bloom University`} description={lesson.subtitle} />

      <div className="bg-[#0E1B30] min-h-screen pb-16">
        {/* Breadcrumb */}
        <div className="border-b border-white/10 bg-[#0F1E33]">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#F4F7FA]/40">
              <Link href="/university" className="hover:text-[#27B7C8] transition-colors">University</Link>
              <span>/</span>
              <Link href={`/university/${moduleSlug}`} className="hover:text-[#27B7C8] transition-colors">{mod.title}</Link>
              <span>/</span>
              <span className="text-[#F4F7FA]/70">{lesson.title}</span>
            </div>
            <button onClick={toggleBookmark} className="text-[#F4F7FA]/40 hover:text-[#27B7C8] transition-colors">
              {isBookmarked
                ? <BookmarkCheck className="w-5 h-5 text-[#27B7C8]" />
                : <Bookmark className="w-5 h-5" />
              }
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Lesson Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                lesson.difficulty === "Beginner" ? "bg-[#49B06E]/20 text-[#49B06E]" : "bg-[#27B7C8]/20 text-[#27B7C8]"
              }`}>
                {lesson.difficulty}
              </span>
              <span className="text-xs text-[#F4F7FA]/40 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lesson.readingMinutes} min read
              </span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#F4F7FA] mb-2">{lesson.title}</h1>
            <p className="text-[#F4F7FA]/60 leading-relaxed">{lesson.subtitle}</p>
          </div>

          {/* Diagram */}
          <div className="mb-10 rounded-2xl overflow-hidden border border-white/10 bg-[#162540] p-4">
            <div
              dangerouslySetInnerHTML={{ __html: lesson.diagram }}
              className="w-full"
            />
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {lesson.sections.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-xl font-serif font-semibold text-[#F4F7FA] mb-4">{section.heading}</h2>
                <div className="space-y-4">
                  {section.content.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx} className="text-[#F4F7FA]/75 leading-relaxed text-sm">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Girl to Girl Tip */}
          <div className="mt-10 p-6 rounded-2xl border border-[#27B7C8]/30 bg-[#27B7C8]/5">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🌸</span>
              <div>
                <p className="text-xs font-semibold text-[#27B7C8] mb-2">Pansy&apos;s Girl-to-Girl Tip</p>
                <p className="text-[#F4F7FA]/80 text-sm leading-relaxed italic">{lesson.girlToGirlTip}</p>
              </div>
            </div>
          </div>

          {/* Quiz */}
          {token && (
            <QuizSection lesson={lesson} moduleSlug={moduleSlug} token={token} />
          )}

          {/* Progress indicator */}
          {progressMarked && (
            <div className="mt-8 flex items-center gap-2 text-sm text-[#49B06E]">
              <CheckCircle className="w-4 h-4" />
              Lesson marked as complete
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex justify-between">
            <Link href={`/university/${moduleSlug}`}>
              <button className="flex items-center gap-2 text-sm text-[#F4F7FA]/50 hover:text-[#27B7C8] transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to {mod.title}
              </button>
            </Link>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-xs text-[#F4F7FA]/30 leading-relaxed">
              Educational content only. Nothing in this lesson constitutes financial advice or a recommendation to buy or sell any security. All patterns discussed can and do fail — nothing in technical analysis guarantees profitable outcomes. Trading involves significant risk of loss.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const moduleSlug = params?.module as string;
  const lessonSlug = params?.slug as string;

  const mod = UNIVERSITY_MODULES.find((m) => m.slug === moduleSlug);
  if (!mod) return { notFound: true };

  const result = await requireProUserSSR(req);

  if (result.status === "not-pro" || result.status === "unauthenticated") {
    return { redirect: { destination: "/pricing", permanent: false } };
  }

  if (result.status === "no-cookie") {
    return { props: { moduleSlug, lessonSlug, requiresClientAuth: true } };
  }

  return { props: { moduleSlug, lessonSlug } };
};
