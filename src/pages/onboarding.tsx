/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Eye, EyeOff, ChevronRight, Sparkles, Shield,
  ArrowLeft, Check, Bell, Clock, Zap, Brain, Target,
  TrendingUp, AlertTriangle, Crown, Star,
} from "lucide-react";
import { STRATEGIES, type StrategyId } from "@/lib/strategies";
import { CORE_PLAN } from "@/config/proPlan";

// ─── Types ───────────────────────────────────────────────────────────────────

type Step =
  | "splash" | "problem" | "age" | "experience" | "session"
  | "struggle" | "goal" | "help" | "strategy" | "reveal"
  | "pricing" | "auth" | "building";

type AuthMode = "signup" | "login" | "forgot";

interface RadarProfile {
  ageBand: string;
  experience: string;
  session: string[];
  problem: string[];
  struggles: string[];
  desired: string;
  help: string[];
  strategiesOn: string[];
  completedOnboardingAt: string;
}

// ─── Strategy routing tables ─────────────────────────────────────────────────

const ONBOARDING_STRATEGIES: {
  id: StrategyId;
  name: string;
  shortDesc: string;
  icon: string;
  color: string;
  available: boolean;
}[] = [
  { id: "gap-and-go", name: "Gap & Go", shortDesc: "Pre-market gaps on volume + catalyst", icon: "🚀", color: "#49B06E", available: true },
  { id: "opening-range-breakout", name: "Opening Range Breakout", shortDesc: "First 15-min range break with volume", icon: "📐", color: "#27B7C8", available: false },
  { id: "first-pullback", name: "First Pullback", shortDesc: "First retrace after strong impulse", icon: "🔄", color: "#A855F7", available: false },
  { id: "vwap-reclaim", name: "VWAP Reclaim", shortDesc: "Reversal above the volume-weighted average", icon: "⬆️", color: "#F59E0B", available: false },
  { id: "hod-breakout", name: "High of Day Break", shortDesc: "New highs on building volume", icon: "🔝", color: "#EC4899", available: true },
  { id: "bull-flag", name: "Bull Flag", shortDesc: "Tight coil after impulse, break on volume", icon: "🏁", color: "#8B5CF6", available: false },
  { id: "red-to-green", name: "Red to Green", shortDesc: "Opens red, reclaims prior close", icon: "🔀", color: "#10B981", available: true },
];

function sessionToStrategies(sessions: string[]): StrategyId[] {
  const map: Record<string, StrategyId[]> = {
    premarket: ["gap-and-go"],
    open: ["gap-and-go", "opening-range-breakout"],
    midday: ["first-pullback", "vwap-reclaim"],
    close: ["hod-breakout", "bull-flag"],
    evening: ["red-to-green"],
  };
  const ids = new Set<StrategyId>();
  for (const s of sessions) {
    for (const id of map[s] || []) ids.add(id);
  }
  if (ids.size === 0) ids.add("gap-and-go");
  return [...ids];
}

function experienceDefaults(exp: string): { maxStrategies: number; pushOn: boolean } {
  if (exp === "never" || exp === "invest-only") return { maxStrategies: 1, pushOn: false };
  if (exp === "under-1y") return { maxStrategies: 2, pushOn: true };
  return { maxStrategies: 7, pushOn: true };
}

// ─── Quiz steps for progress bar ─────────────────────────────────────────────

const QUIZ_STEPS: Step[] = [
  "problem", "age", "experience", "session", "struggle", "goal", "help", "strategy",
];

// ─── Shared helpers ──────────────────────────────────────────────────────────

const PROFILE_KEY = "radar_profile";
const ONBOARDING_PROGRESS_KEY = "radar_onboarding_progress";

function saveProgress(step: Step, profile: Partial<RadarProfile>) {
  try {
    localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify({ step, profile }));
  } catch {}
}

function loadProgress(): { step: Step; profile: Partial<RadarProfile> } | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_PROGRESS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearProgress() {
  try { localStorage.removeItem(ONBOARDING_PROGRESS_KEY); } catch {}
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("splash");
  const [animateIn, setAnimateIn] = useState(false);

  // Profile state
  const [problem, setProblem] = useState<string[]>([]);
  const [ageBand, setAgeBand] = useState("");
  const [experience, setExperience] = useState("");
  const [sessions, setSessions] = useState<string[]>([]);
  const [struggles, setStruggles] = useState<string[]>([]);
  const [desired, setDesired] = useState("");
  const [help, setHelp] = useState<string[]>([]);
  const [strategiesOn, setStrategiesOn] = useState<StrategyId[]>([]);

  // Auth state
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"email" | "code">("email");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  // Pricing
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "lifetime">("yearly");

  // Building progress
  const [buildingProgress, setBuildingProgress] = useState(0);

  const submitLock = useRef(false);

  // Referral code from URL
  useEffect(() => {
    const ref = router.query.ref;
    if (typeof ref === "string" && ref.trim()) setReferralCode(ref.trim().toUpperCase());
  }, [router.query.ref]);

  // Check for existing session or resume progress
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", session.user.id)
          .single();
        if (profile?.onboarding_complete) {
          router.push("/home");
          return;
        }
      }
      const saved = loadProgress();
      if (saved) {
        if (saved.profile.problem) setProblem(saved.profile.problem);
        if (saved.profile.ageBand) setAgeBand(saved.profile.ageBand);
        if (saved.profile.experience) setExperience(saved.profile.experience);
        if (saved.profile.session) setSessions(saved.profile.session);
        if (saved.profile.struggles) setStruggles(saved.profile.struggles);
        if (saved.profile.desired) setDesired(saved.profile.desired);
        if (saved.profile.help) setHelp(saved.profile.help);
        if (saved.profile.strategiesOn) setStrategiesOn(saved.profile.strategiesOn as StrategyId[]);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate on step change
  useEffect(() => {
    setAnimateIn(false);
    const t = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(t);
  }, [step]);

  // Building progress timer
  useEffect(() => {
    if (step !== "building") { setBuildingProgress(0); return; }
    const timers = [500, 1000, 1500, 2000, 2500].map((ms, i) =>
      setTimeout(() => setBuildingProgress(i + 1), ms)
    );
    const nav = setTimeout(() => goToStep("reveal"), 3200);
    return () => { timers.forEach(clearTimeout); clearTimeout(nav); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const currentProfile = useCallback((): Partial<RadarProfile> => ({
    problem, ageBand, experience, session: sessions, struggles, desired, help, strategiesOn,
  }), [problem, ageBand, experience, sessions, struggles, desired, help, strategiesOn]);

  const goToStep = (next: Step) => {
    setError("");
    setStep(next);
    if (QUIZ_STEPS.includes(next)) {
      saveProgress(next, currentProfile());
    }
  };

  const quizIndex = QUIZ_STEPS.indexOf(step);
  const isQuizStep = quizIndex >= 0;

  // Pre-select strategies when entering strategy step
  const enterStrategyStep = () => {
    const suggested = sessionToStrategies(sessions);
    const { maxStrategies } = experienceDefaults(experience);
    setStrategiesOn(suggested.slice(0, maxStrategies));
    goToStep("strategy");
  };

  const toggleStrategy = (id: StrategyId) => {
    setStrategiesOn(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Complete onboarding — save to localStorage + Supabase if logged in
  const completeOnboarding = async () => {
    const profile: RadarProfile = {
      ageBand, experience, session: sessions, problem, struggles,
      desired, help, strategiesOn,
      completedOnboardingAt: new Date().toISOString(),
    };

    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
    clearProgress();

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const expLevel = experience === "never" || experience === "invest-only"
        ? "beginner"
        : experience === "under-1y" ? "intermediate" : "advanced";

      await supabase.from("profiles").upsert({
        id: user.id,
        experience_level: expLevel,
        investment_goals: [desired] as string[],
        risk_tolerance: "moderate",
        onboarding_complete: true,
      } as any);
    }
  };

  // Auth handler (preserved from existing)
  const handleAuth = async () => {
    if (submitLock.current) return;
    submitLock.current = true;
    setError("");
    setIsSubmitting(true);

    try {
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        submitLock.current = false;
        setIsSubmitting(false);
        return;
      }

      if (authMode === "forgot") {
        if (resetStep === "email") {
          try {
            const resp = await fetch("/api/auth/send-reset-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            const data = await resp.json();
            if (!resp.ok) setError(data.error || "Failed to send code");
            else { setResetStep("code"); setError(""); }
          } catch { setError("Something went wrong. Please try again."); }
        } else {
          if (newPassword.length < 6) { setError("Password must be at least 6 characters"); submitLock.current = false; setIsSubmitting(false); return; }
          try {
            const resp = await fetch("/api/auth/verify-reset-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, code: resetCode, newPassword }),
            });
            const data = await resp.json();
            if (!resp.ok) setError(data.error || "Failed to reset password");
            else { setResetEmailSent(true); setError(""); }
          } catch { setError("Something went wrong. Please try again."); }
        }
        submitLock.current = false;
        setIsSubmitting(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        submitLock.current = false;
        setIsSubmitting(false);
        return;
      }

      if (authMode === "signup") {
        if (!fullName.trim()) { setError("Please enter your full name"); submitLock.current = false; setIsSubmitting(false); return; }
        if (!termsAccepted) { setError("Please accept the Terms of Service and Privacy Policy to continue"); submitLock.current = false; setIsSubmitting(false); return; }

        const { user, error: signupError } = await authService.signUp(email, password, fullName);
        if (signupError) { setError(signupError.message); submitLock.current = false; setIsSubmitting(false); return; }
        if (user) {
          await userService.updateUser(user.id, { full_name: fullName });
          let { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            await authService.signIn(email, password);
            ({ data: { session } } = await supabase.auth.getSession());
          }
          if (referralCode.trim() && session) {
            fetch("/api/referral/apply", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
              body: JSON.stringify({ code: referralCode.trim() }),
            }).catch(() => {});
          }
          await completeOnboarding();
          submitLock.current = false;
          setIsSubmitting(false);
          window.location.href = "/home";
          return;
        }
      } else {
        const { user, error: loginError } = await authService.signIn(email, password);
        if (loginError) { setError(loginError.message); submitLock.current = false; setIsSubmitting(false); return; }
        if (user) {
          await completeOnboarding();
          window.location.href = "/home";
        }
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
    submitLock.current = false;
    setIsSubmitting(false);
  };

  // Glass card classes
  const glass = "relative backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden";
  const glassBg = "bg-white/[0.04]";
  const glow = "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_0_20px_rgba(39,183,200,0.08)]";

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <OnboardingStyles />
      <div className="fixed inset-0 overflow-y-auto" style={{ background: "linear-gradient(160deg, #070B12 0%, #0a1525 45%, #0d1f35 75%, #070B12 100%)" }}>
        <FloatingOrbs />
        <div className="relative z-10 flex flex-col min-h-screen">

          {/* ─── Progress bar ─── */}
          {isQuizStep && (
            <div className="sticky top-0 z-20 px-6 pt-4 pb-2">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => {
                      if (quizIndex === 0) goToStep("splash");
                      else goToStep(QUIZ_STEPS[quizIndex - 1]);
                    }}
                    className="flex items-center gap-1 text-sm text-[#F3EDE3]/50 hover:text-[#F3EDE3]/80 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <span className="text-xs text-[#F3EDE3]/30 font-medium">{quizIndex + 1}/{QUIZ_STEPS.length}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${((quizIndex + 1) / QUIZ_STEPS.length) * 100}%`,
                      background: "linear-gradient(90deg, #49B06E, #27B7C8)",
                      boxShadow: "0 0 12px rgba(39,183,200,0.4)",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex items-center justify-center p-6 pb-16">
            <div className="w-full max-w-md">

              {/* ═══════════ SPLASH ═══════════ */}
              {step === "splash" && (
                <div className={`space-y-8 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-5">
                    <div className="relative inline-block">
                      <img src="/icon-192.png" alt="Radar" className="w-20 h-20 mx-auto rounded-3xl object-cover" style={{ boxShadow: "0 0 50px rgba(39,183,200,0.25)" }} />
                    </div>
                    <h1 className="font-serif text-4xl font-bold text-[#F3EDE3] leading-tight">
                      Most traders lose<br />because they scan blind.
                    </h1>
                    <p className="text-[#F3EDE3]/50 text-lg leading-relaxed">
                      Radar watches the entire market and tells you<br />
                      <span className="text-[#27B7C8] font-semibold">exactly where to look.</span>
                    </p>
                  </div>

                  <button type="button" onClick={() => goToStep("problem")} className="glass-btn flex items-center justify-center gap-2 text-lg">
                    Set up my scanner <ChevronRight className="w-5 h-5" />
                  </button>

                  <p className="text-center text-xs text-[#F3EDE3]/25">
                    60 seconds &middot; No account needed yet
                  </p>
                </div>
              )}

              {/* ═══════════ PROBLEM ═══════════ */}
              {step === "problem" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      What&apos;s holding you<br />back right now?
                    </h2>
                    <p className="text-[#F3EDE3]/40 text-base">Pick all that fit &mdash; no wrong answers.</p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { value: "no-edge", label: "I don't have an edge", desc: "Every trade feels like a coin flip", icon: "🎲" },
                      { value: "too-late", label: "I find moves too late", desc: "By the time I see it, it's already run", icon: "⏰" },
                      { value: "overloaded", label: "Too much information", desc: "Charts, news, Discord — I'm drowning", icon: "🌊" },
                      { value: "no-plan", label: "No repeatable plan", desc: "I trade on feelings, not a process", icon: "📋" },
                      { value: "fear", label: "Fear of losing money", desc: "I freeze up or revenge-trade after a loss", icon: "😰" },
                    ]).map((opt, i) => {
                      const selected = problem.includes(opt.value);
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setProblem(prev => selected ? prev.filter(v => v !== opt.value) : [...prev, opt.value])}
                          className={`option-card ${glass} ${selected ? "selected" : ""}`}
                          style={{
                            background: selected ? "rgba(39,183,200,0.08)" : "rgba(255,255,255,0.03)",
                            borderColor: selected ? "rgba(39,183,200,0.35)" : "rgba(255,255,255,0.06)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.07}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{opt.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-[15px] text-[#F3EDE3]">{opt.label}</p>
                              <p className="text-xs text-[#F3EDE3]/40 mt-0.5">{opt.desc}</p>
                            </div>
                            <MultiDot selected={selected} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("age")} disabled={problem.length === 0} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ═══════════ AGE ═══════════ */}
              {step === "age" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      How old are you?
                    </h2>
                    <p className="text-[#F3EDE3]/40 text-base">This helps us keep things appropriate.</p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { value: "under-18", label: "Under 18" },
                      { value: "18-24", label: "18 – 24" },
                      { value: "25-34", label: "25 – 34" },
                      { value: "35-44", label: "35 – 44" },
                      { value: "45+", label: "45+" },
                    ]).map((opt, i) => {
                      const selected = ageBand === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setAgeBand(opt.value)}
                          className={`option-card ${glass} ${selected ? "selected" : ""}`}
                          style={{
                            background: selected ? "rgba(39,183,200,0.08)" : "rgba(255,255,255,0.03)",
                            borderColor: selected ? "rgba(39,183,200,0.35)" : "rgba(255,255,255,0.06)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.4s ease-out ${i * 0.06}s both` : "none",
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-[15px] text-[#F3EDE3]">{opt.label}</p>
                            <SingleDot selected={selected} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {ageBand === "under-18" && (
                    <div className={`${glass} p-4`} style={{ background: "rgba(184,106,106,0.1)", borderColor: "rgba(184,106,106,0.3)" }}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-[#B86A6A] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-[#B86A6A]">You must be 18+ to trade</p>
                          <p className="text-xs text-[#F3EDE3]/40 mt-1">You can still explore Radar&apos;s educational content and paper trading to learn before you turn 18.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => goToStep("experience")}
                    disabled={!ageBand}
                    className="glass-btn flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ═══════════ EXPERIENCE ═══════════ */}
              {step === "experience" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      Trading experience?
                    </h2>
                    <p className="text-[#F3EDE3]/40 text-base">Radar adapts to your level.</p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { value: "never", label: "Never traded", desc: "Completely new to the stock market", icon: "🌱", color: "#49B06E" },
                      { value: "invest-only", label: "I invest, but don't trade", desc: "I buy and hold — day trading is new", icon: "📊", color: "#27B7C8" },
                      { value: "under-1y", label: "Under 1 year", desc: "Still learning the ropes", icon: "📱", color: "#8B5CF6" },
                      { value: "1-3y", label: "1 – 3 years", desc: "Know the basics, inconsistent results", icon: "🔥", color: "#F59E0B" },
                      { value: "3y-plus", label: "3+ years", desc: "Experienced, looking for better tools", icon: "🎯", color: "#EC4899" },
                    ]).map((opt, i) => {
                      const selected = experience === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setExperience(opt.value)}
                          className={`option-card ${glass} ${selected ? "selected" : ""}`}
                          style={{
                            background: selected ? `${opt.color}12` : "rgba(255,255,255,0.03)",
                            borderColor: selected ? `${opt.color}50` : "rgba(255,255,255,0.06)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.07}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{opt.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-[15px] text-[#F3EDE3]">{opt.label}</p>
                              <p className="text-xs text-[#F3EDE3]/40 mt-0.5">{opt.desc}</p>
                            </div>
                            <SingleDot selected={selected} color={opt.color} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("session")} disabled={!experience} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ═══════════ SESSION ═══════════ */}
              {step === "session" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      When can you<br />watch the market?
                    </h2>
                    <p className="text-[#F3EDE3]/40 text-base">Pick all that work. We&apos;ll time your alerts.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "premarket", label: "Pre-market", desc: "4 AM – 9:30 AM ET", icon: "🌅", color: "#F59E0B" },
                      { value: "open", label: "The Open", desc: "9:30 – 11 AM ET", icon: "⚡", color: "#49B06E" },
                      { value: "midday", label: "Midday", desc: "11 AM – 2 PM ET", icon: "☀️", color: "#27B7C8" },
                      { value: "close", label: "Power hour", desc: "2 – 4 PM ET", icon: "🔥", color: "#EC4899" },
                      { value: "evening", label: "After hours", desc: "Evening research", icon: "🌙", color: "#8B5CF6" },
                    ]).map((opt, i) => {
                      const selected = sessions.includes(opt.value);
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setSessions(prev => selected ? prev.filter(v => v !== opt.value) : [...prev, opt.value])}
                          className={`option-card ${glass} ${selected ? "selected" : ""} ${i === 4 ? "col-span-2" : ""}`}
                          style={{
                            background: selected ? `${opt.color}12` : "rgba(255,255,255,0.03)",
                            borderColor: selected ? `${opt.color}50` : "rgba(255,255,255,0.06)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.4s ease-out ${i * 0.06}s both` : "none",
                          }}
                        >
                          <div className="flex flex-col items-center text-center gap-2">
                            <span className="text-2xl">{opt.icon}</span>
                            <div>
                              <p className="font-semibold text-sm text-[#F3EDE3]">{opt.label}</p>
                              <p className="text-[11px] text-[#F3EDE3]/35 mt-0.5">{opt.desc}</p>
                            </div>
                            <MultiDot selected={selected} color={opt.color} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("struggle")} disabled={sessions.length === 0} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ═══════════ STRUGGLE ═══════════ */}
              {step === "struggle" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      What trips you up<br />the most?
                    </h2>
                    <p className="text-[#F3EDE3]/40 text-base">Pick up to three.</p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { value: "entries", label: "Finding good entries", icon: <Target className="w-5 h-5" /> },
                      { value: "exits", label: "Knowing when to sell", icon: <TrendingUp className="w-5 h-5" /> },
                      { value: "risk", label: "Managing risk / position size", icon: <Shield className="w-5 h-5" /> },
                      { value: "discipline", label: "Sticking to my plan", icon: <Brain className="w-5 h-5" /> },
                      { value: "screening", label: "Finding stocks to watch", icon: <Zap className="w-5 h-5" /> },
                      { value: "timing", label: "Timing the market session", icon: <Clock className="w-5 h-5" /> },
                    ]).map((opt, i) => {
                      const selected = struggles.includes(opt.value);
                      const atMax = struggles.length >= 3 && !selected;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => {
                            if (atMax) return;
                            setStruggles(prev => selected ? prev.filter(v => v !== opt.value) : [...prev, opt.value]);
                          }}
                          className={`option-card ${glass} ${selected ? "selected" : ""}`}
                          style={{
                            background: selected ? "rgba(39,183,200,0.08)" : "rgba(255,255,255,0.03)",
                            borderColor: selected ? "rgba(39,183,200,0.35)" : "rgba(255,255,255,0.06)",
                            padding: "14px 16px",
                            opacity: atMax ? 0.4 : 1,
                            animation: animateIn ? `cardEntrance 0.4s ease-out ${i * 0.06}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: selected ? "rgba(39,183,200,0.15)" : "rgba(255,255,255,0.04)", color: selected ? "#27B7C8" : "rgba(244,247,250,0.3)" }}>
                              {opt.icon}
                            </div>
                            <p className="font-semibold text-sm text-[#F3EDE3] flex-1">{opt.label}</p>
                            <MultiDot selected={selected} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("goal")} disabled={struggles.length === 0} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ═══════════ GOAL ═══════════ */}
              {step === "goal" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      What matters most<br />to you right now?
                    </h2>
                    <p className="text-[#F3EDE3]/40 text-base">Pick one.</p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { value: "consistent", label: "Consistent, smaller wins", desc: "I'd rather win often than win big", icon: "🎯", color: "#49B06E" },
                      { value: "big-movers", label: "Catching big movers", desc: "I want the 50%+ runners", icon: "🚀", color: "#27B7C8" },
                      { value: "learn-first", label: "Learn before risking real money", desc: "Paper trade until I'm confident", icon: "📚", color: "#8B5CF6" },
                      { value: "side-income", label: "Build a side income", desc: "Supplement my day job", icon: "💰", color: "#F59E0B" },
                    ]).map((opt, i) => {
                      const selected = desired === opt.value;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setDesired(opt.value)}
                          className={`option-card ${glass} ${selected ? "selected" : ""}`}
                          style={{
                            background: selected ? `${opt.color}12` : "rgba(255,255,255,0.03)",
                            borderColor: selected ? `${opt.color}50` : "rgba(255,255,255,0.06)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.07}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{opt.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-[15px] text-[#F3EDE3]">{opt.label}</p>
                              <p className="text-xs text-[#F3EDE3]/40 mt-0.5">{opt.desc}</p>
                            </div>
                            <SingleDot selected={selected} color={opt.color} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-center text-[10px] text-[#F3EDE3]/25 leading-relaxed">
                    Trading involves risk. Past results do not guarantee future performance.
                  </p>

                  <button type="button" onClick={() => goToStep("help")} disabled={!desired} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ═══════════ HELP ═══════════ */}
              {step === "help" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      How should Radar<br />help you most?
                    </h2>
                    <p className="text-[#F3EDE3]/40 text-base">Pick all that apply.</p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { value: "scan", label: "Scan the market for me", desc: "Show me the best setups each morning", icon: "🔍" },
                      { value: "alerts", label: "Send me alerts", desc: "Notify me when a signal triggers", icon: "🔔" },
                      { value: "teach", label: "Teach me strategies", desc: "Help me understand why a setup works", icon: "📚" },
                      { value: "practice", label: "Let me paper trade", desc: "Practice risk-free before going live", icon: "📊" },
                    ]).map((opt, i) => {
                      const selected = help.includes(opt.value);
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setHelp(prev => selected ? prev.filter(v => v !== opt.value) : [...prev, opt.value])}
                          className={`option-card ${glass} ${selected ? "selected" : ""}`}
                          style={{
                            background: selected ? "rgba(73,176,110,0.08)" : "rgba(255,255,255,0.03)",
                            borderColor: selected ? "rgba(73,176,110,0.35)" : "rgba(255,255,255,0.06)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.07}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{opt.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-[15px] text-[#F3EDE3]">{opt.label}</p>
                              <p className="text-xs text-[#F3EDE3]/40 mt-0.5">{opt.desc}</p>
                            </div>
                            <MultiDot selected={selected} color="#49B06E" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={enterStrategyStep} disabled={help.length === 0} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ═══════════ STRATEGY PICK ═══════════ */}
              {step === "strategy" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      Your strategies
                    </h2>
                    <p className="text-[#F3EDE3]/40 text-base">
                      We picked these based on your schedule.{" "}
                      <span className="text-[#27B7C8]">Toggle any on or off.</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    {ONBOARDING_STRATEGIES.map((strat, i) => {
                      const isOn = strategiesOn.includes(strat.id);
                      return (
                        <div
                          key={strat.id}
                          onClick={() => toggleStrategy(strat.id)}
                          className={`option-card ${glass} ${isOn ? "selected" : ""}`}
                          style={{
                            background: isOn ? `${strat.color}10` : "rgba(255,255,255,0.03)",
                            borderColor: isOn ? `${strat.color}40` : "rgba(255,255,255,0.06)",
                            padding: "14px 16px",
                            animation: animateIn ? `cardEntrance 0.4s ease-out ${i * 0.05}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{strat.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-[#F3EDE3]">{strat.name}</p>
                                {!strat.available && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[#F3EDE3]/30">COMING</span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#F3EDE3]/35 mt-0.5 truncate">{strat.shortDesc}</p>
                            </div>
                            <ToggleDot on={isOn} color={strat.color} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-center text-[10px] text-[#F3EDE3]/25">
                    Free plan includes 1 strategy. Core unlocks all.
                  </p>

                  <button
                    type="button"
                    onClick={() => goToStep("building")}
                    disabled={strategiesOn.length === 0}
                    className="glass-btn flex items-center justify-center gap-2"
                  >
                    Build my scanner <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ═══════════ BUILDING ═══════════ */}
              {step === "building" && (
                <div className={`space-y-8 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.2), rgba(39,183,200,0.2))", animation: "pulse-glow 3s ease-in-out infinite" }}>
                      🔍
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">Configuring<br />your desk...</h2>
                  </div>

                  <div className={`${glass} ${glassBg} ${glow} p-6`}>
                    <div className="space-y-4">
                      {[
                        "Connecting to market data",
                        `Loading ${strategiesOn.length} ${strategiesOn.length === 1 ? "strategy" : "strategies"}`,
                        "Tuning scanner to your schedule",
                        "Setting alert preferences",
                        "Scanner ready",
                      ].map((label, i) => (
                        <div key={i} className="flex items-center gap-3" style={{ opacity: buildingProgress > i ? 1 : 0.3, transition: "all 0.4s ease" }}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{
                            background: buildingProgress > i ? "linear-gradient(135deg, #49B06E, #27B7C8)" : "rgba(255,255,255,0.06)",
                            transition: "all 0.4s ease",
                          }}>
                            {buildingProgress > i ? <Check className="w-3.5 h-3.5 text-[#070B12]" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                          </div>
                          <span className="text-sm font-medium" style={{ color: buildingProgress > i ? "#F3EDE3" : "rgba(244,247,250,0.3)" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{
                      width: `${(buildingProgress / 5) * 100}%`,
                      background: "linear-gradient(90deg, #49B06E, #27B7C8)",
                      transition: "width 0.6s ease-out",
                      boxShadow: "0 0 12px rgba(39,183,200,0.4)",
                    }} />
                  </div>
                </div>
              )}

              {/* ═══════════ REVEAL ═══════════ */}
              {step === "reveal" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.25), rgba(39,183,200,0.2))", animation: "pulse-glow 3s ease-in-out infinite" }}>
                      🌸
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(73,176,110,0.12)", border: "1px solid rgba(73,176,110,0.3)", color: "#49B06E" }}>
                      <Sparkles className="w-3.5 h-3.5" /> Scanner Ready
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      Your desk is set.
                    </h2>
                  </div>

                  {/* Pansy message */}
                  <div className={`${glass} ${glassBg} ${glow} p-5`}>
                    <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.06) 0%, transparent 50%, rgba(39,183,200,0.04) 100%)" }} />
                    <div className="relative flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.2), rgba(39,183,200,0.2))" }}>
                        🌺
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-serif text-sm font-semibold text-[#49B06E]">Pansy says</p>
                        <p className="text-sm leading-relaxed text-[#F3EDE3]/60">
                          {experience === "never" || experience === "invest-only"
                            ? "I set you up with Gap & Go — it's the clearest pattern for new traders. Start with paper trading, and I'll walk you through every setup."
                            : experience === "under-1y"
                            ? "I loaded a couple strategies based on your schedule. The scanner will score each candidate 0–100 so you can focus on the A+ setups."
                            : "Your desk is configured with the strategies that fit your schedule. I'll score every candidate and surface only the ones worth your time."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Strategies summary */}
                  <div className={`${glass} ${glassBg} p-4`}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#F3EDE3]/30 mb-3">Active strategies</p>
                    <div className="space-y-2">
                      {strategiesOn.map(id => {
                        const s = STRATEGIES[id];
                        if (!s) return null;
                        return (
                          <div key={id} className="flex items-center gap-3">
                            <span className="text-lg">{s.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[#F3EDE3]">{s.name}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notification opt-in */}
                  <NotificationOptIn />

                  {/* CTA — go to pricing */}
                  <button
                    type="button"
                    onClick={() => goToStep("pricing")}
                    className="glass-btn flex items-center justify-center gap-2 text-lg"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ═══════════ PRICING ═══════════ */}
              {step === "pricing" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(212,168,83,0.12)", border: "1px solid rgba(212,168,83,0.25)", color: "#D4A853" }}>
                      <Crown className="w-3.5 h-3.5" /> Unlock your full desk
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      Start your free trial
                    </h2>
                    <p className="text-[#F3EDE3]/40 text-base">7 days free. Cancel anytime. No card now.</p>
                  </div>

                  {/* What you get */}
                  <div className={`${glass} ${glassBg} p-4`}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#F3EDE3]/30 mb-3">Core includes</p>
                    <div className="space-y-2.5">
                      {[
                        "All 7 strategies — scan across every pattern",
                        "Pansy AI analyst — entry, stop, and target for each setup",
                        "Price alerts — get notified when signals trigger",
                        "Paper trading — practice risk-free with $10K virtual cash",
                        "Market briefings — daily movers and catalysts",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5" style={{ animation: animateIn ? `cardEntrance 0.4s ease-out ${i * 0.06}s both` : "none" }}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #49B06E, #27B7C8)" }}>
                            <Check className="w-3 h-3 text-[#070B12]" />
                          </div>
                          <p className="text-sm text-[#F3EDE3]/70">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan cards */}
                  <div className="space-y-3">
                    {([
                      {
                        id: "yearly" as const,
                        label: "Yearly",
                        price: `$${CORE_PLAN.yearlyPrice}`,
                        period: "/yr",
                        perMonth: `$${CORE_PLAN.yearlyMonthly}/mo`,
                        tag: "Best Value",
                        tagColor: "#49B06E",
                        savings: `Save $${((CORE_PLAN.monthlyPrice * 12) - CORE_PLAN.yearlyPrice).toFixed(0)}/yr`,
                      },
                      {
                        id: "monthly" as const,
                        label: "Monthly",
                        price: `$${CORE_PLAN.monthlyPrice}`,
                        period: "/mo",
                        perMonth: null,
                        tag: null,
                        tagColor: null,
                        savings: null,
                      },
                      {
                        id: "lifetime" as const,
                        label: "Lifetime",
                        price: `$${CORE_PLAN.lifetimePrice}`,
                        period: "",
                        perMonth: "One-time payment",
                        tag: "One & Done",
                        tagColor: "#27B7C8",
                        savings: null,
                      },
                    ]).map((plan, i) => {
                      const isSelected = selectedPlan === plan.id;
                      const isBest = plan.id === "yearly";
                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`option-card ${glass} ${isSelected ? "selected" : ""}`}
                          style={{
                            background: isSelected
                              ? isBest ? "rgba(73,176,110,0.1)" : "rgba(39,183,200,0.08)"
                              : "rgba(255,255,255,0.03)",
                            borderColor: isSelected
                              ? isBest ? "rgba(73,176,110,0.4)" : "rgba(39,183,200,0.35)"
                              : "rgba(255,255,255,0.06)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.08}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <SingleDot selected={isSelected} color={isBest ? "#49B06E" : "#27B7C8"} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-[15px] text-[#F3EDE3]">{plan.label}</p>
                                {plan.tag && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${plan.tagColor}20`, color: plan.tagColor || "#27B7C8", border: `1px solid ${plan.tagColor}30` }}>
                                    {plan.tag}
                                  </span>
                                )}
                              </div>
                              {plan.perMonth && (
                                <p className="text-xs text-[#F3EDE3]/35 mt-0.5">{plan.perMonth}{plan.savings ? ` · ${plan.savings}` : ""}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-[#F3EDE3]">{plan.price}</span>
                              <span className="text-xs text-[#F3EDE3]/30">{plan.period}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => goToStep("auth")}
                    className="glass-btn flex items-center justify-center gap-2 text-lg"
                  >
                    Start 7-day free trial <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Skip */}
                  <button
                    type="button"
                    onClick={async () => {
                      await completeOnboarding();
                      window.location.href = "/home";
                    }}
                    className="w-full text-center text-sm text-[#F3EDE3]/30 hover:text-[#F3EDE3]/60 transition-colors py-2"
                  >
                    Continue with free plan
                  </button>

                  <p className="text-center text-[10px] text-[#F3EDE3]/20 leading-relaxed">
                    You won&apos;t be charged during the trial. Cancel anytime in Settings.
                  </p>
                </div>
              )}

              {/* ═══════════ AUTH ═══════════ */}
              {step === "auth" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-2">

                    <img src="/icon-192.png" alt="Radar" className="w-14 h-14 mx-auto rounded-2xl object-cover" style={{ boxShadow: "0 0 30px rgba(39,183,200,0.15)" }} />
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
                      {authMode === "signup" ? "Create your account" : authMode === "login" ? "Welcome back" : "Reset password"}
                    </h2>
                  </div>

                  {authMode === "signup" && (
                    <div className={`${glass} ${glassBg} p-4`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                          className="mt-0.5 border-white/20 data-[state=checked]:bg-[#27B7C8] data-[state=checked]:border-[#27B7C8]"
                        />
                        <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-[#F3EDE3]/60">
                          I agree to the{" "}
                          <Link href="/terms" target="_blank" className="text-[#27B7C8] underline hover:text-[#27B7C8]/80">Terms of Service</Link>{" "}
                          and{" "}
                          <Link href="/privacy" target="_blank" className="text-[#27B7C8] underline hover:text-[#27B7C8]/80">Privacy Policy</Link>
                        </Label>
                      </div>
                    </div>
                  )}

                  <div className={`${glass} ${glassBg} ${glow} p-6`}>
                    <div className="space-y-4">
                      {authMode !== "forgot" && (
                        <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                          {(["signup", "login"] as AuthMode[]).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => { setAuthMode(mode); setResetEmailSent(false); setError(""); }}
                              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                              style={{
                                background: authMode === mode ? "linear-gradient(135deg, #49B06E, #27B7C8)" : "transparent",
                                color: authMode === mode ? "#070B12" : "rgba(244,247,250,0.5)",
                                boxShadow: authMode === mode ? "0 4px 15px rgba(39,183,200,0.25)" : "none",
                              }}
                            >
                              {mode === "signup" ? "Sign Up" : "Log In"}
                            </button>
                          ))}
                        </div>
                      )}

                      {authMode === "forgot" && !resetEmailSent && (
                        <div className="space-y-2">
                          <button type="button" onClick={() => { setAuthMode("login"); setResetEmailSent(false); setResetStep("email"); setResetCode(""); setNewPassword(""); setError(""); }} className="flex items-center gap-1 text-sm text-[#F3EDE3]/50 hover:text-[#F3EDE3]/80 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Log In
                          </button>
                          <p className="text-sm text-[#F3EDE3]/40">
                            {resetStep === "email" ? "Enter your email and we'll send a reset code." : "Enter the 6-digit code and your new password."}
                          </p>
                        </div>
                      )}

                      {authMode === "forgot" && resetEmailSent ? (
                        <div className="space-y-4 py-4 text-center">
                          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl" style={{ background: "rgba(73,176,110,0.15)" }}>
                            <Check className="w-8 h-8 text-[#49B06E]" />
                          </div>
                          <h3 className="font-serif text-xl font-bold text-[#F3EDE3]">Password Reset!</h3>
                          <p className="text-sm text-[#F3EDE3]/50">Your password has been updated.</p>
                          <button type="button" onClick={() => { setAuthMode("login"); setResetEmailSent(false); setResetStep("email"); setResetCode(""); setNewPassword(""); setEmail(""); setError(""); }} className="glass-btn">Log In</button>
                        </div>
                      ) : (
                        <>
                          {authMode === "signup" && (
                            <div className="space-y-1.5">
                              <Label htmlFor="fullName" className="text-xs font-medium text-[#F3EDE3]/40 uppercase tracking-wider">Full Name</Label>
                              <Input id="fullName" type="text" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isSubmitting} className="glass-input h-12" />
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-medium text-[#F3EDE3]/40 uppercase tracking-wider">Email</Label>
                            <Input id="email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} className="glass-input h-12" />
                          </div>
                          {authMode !== "forgot" && (
                            <div className="space-y-1.5">
                              <Label htmlFor="password" className="text-xs font-medium text-[#F3EDE3]/40 uppercase tracking-wider">Password</Label>
                              <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="glass-input h-12 pr-12" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F3EDE3]/30 hover:text-[#F3EDE3]/60 transition-colors">
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                              {authMode === "login" && (
                                <div className="text-right">
                                  <button type="button" onClick={() => { setAuthMode("forgot"); setResetStep("email"); setError(""); }} className="text-sm text-[#27B7C8]/70 hover:text-[#27B7C8] font-medium transition-colors">Forgot password?</button>
                                </div>
                              )}
                            </div>
                          )}
                          {authMode === "forgot" && resetStep === "code" && (
                            <>
                              <div className="space-y-1.5">
                                <Label htmlFor="resetCode" className="text-xs font-medium text-[#F3EDE3]/40 uppercase tracking-wider">6-Digit Code</Label>
                                <Input id="resetCode" type="text" inputMode="numeric" placeholder="000000" maxLength={6} value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))} className="glass-input h-12 text-center text-2xl tracking-[0.5em] font-bold" />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="newPassword" className="text-xs font-medium text-[#F3EDE3]/40 uppercase tracking-wider">New Password</Label>
                                <div className="relative">
                                  <Input id="newPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="glass-input h-12 pr-12" />
                                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F3EDE3]/30 hover:text-[#F3EDE3]/60 transition-colors">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                          {authMode === "signup" && (
                            <div className="space-y-1.5">
                              <Label htmlFor="referral" className="text-xs font-medium text-[#F3EDE3]/40 uppercase tracking-wider">Referral Code <span className="normal-case text-[#F3EDE3]/25">(optional)</span></Label>
                              <Input id="referral" type="text" placeholder="BLOOM-XXXXXX" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} disabled={isSubmitting} className="glass-input h-12 tracking-wider" />
                            </div>
                          )}
                          {error && (
                            <div className={`${glass} p-3`} style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}>
                              <p className="text-sm text-red-400 font-medium">{error}</p>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleAuth}
                            disabled={isSubmitting || !email || (authMode !== "forgot" && !password) || (authMode === "signup" && !fullName) || (authMode === "signup" && !termsAccepted) || (authMode === "forgot" && resetStep === "code" && (!resetCode || resetCode.length < 6 || !newPassword))}
                            className="glass-btn flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : authMode === "signup" ? <>Create Account <ChevronRight className="w-5 h-5" /></> : authMode === "login" ? <>Log In <ChevronRight className="w-5 h-5" /></> : resetStep === "email" ? "Send Reset Code" : "Reset Password"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {authMode === "signup" && (
                    <div className="flex items-center justify-center gap-4 text-[#F3EDE3]/25 text-xs">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Encrypted</span>
                      <span>&middot;</span>
                      <span>No spam, ever</span>
                      <span>&middot;</span>
                      <span>Free to start</span>
                    </div>
                  )}

                  <button type="button" onClick={() => goToStep("pricing")} className="w-full text-center text-sm text-[#F3EDE3]/30 hover:text-[#F3EDE3]/60 transition-colors py-2">
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SingleDot({ selected, color = "#27B7C8" }: { selected: boolean; color?: string }) {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
      style={{
        background: selected ? `linear-gradient(135deg, ${color}, ${color}cc)` : "rgba(255,255,255,0.06)",
        border: selected ? "none" : "2px solid rgba(255,255,255,0.12)",
        boxShadow: selected ? `0 0 12px ${color}40` : "none",
      }}
    >
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#070B12]" />}
    </div>
  );
}

function MultiDot({ selected, color = "#27B7C8" }: { selected: boolean; color?: string }) {
  return (
    <div
      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0"
      style={{
        background: selected ? `linear-gradient(135deg, ${color}, ${color}cc)` : "rgba(255,255,255,0.06)",
        border: selected ? "none" : "2px solid rgba(255,255,255,0.12)",
        boxShadow: selected ? `0 0 12px ${color}40` : "none",
      }}
    >
      {selected && <Check className="w-3.5 h-3.5 text-[#070B12]" />}
    </div>
  );
}

function ToggleDot({ on, color = "#27B7C8" }: { on: boolean; color?: string }) {
  return (
    <div
      className="w-10 h-6 rounded-full transition-all duration-300 shrink-0 relative"
      style={{
        background: on ? `linear-gradient(135deg, ${color}, ${color}cc)` : "rgba(255,255,255,0.1)",
        boxShadow: on ? `0 0 10px ${color}30` : "none",
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
        style={{
          left: on ? "18px" : "2px",
          background: on ? "#070B12" : "rgba(255,255,255,0.3)",
        }}
      />
    </div>
  );
}

function NotificationOptIn() {
  const [status, setStatus] = useState<"idle" | "enabling" | "done" | "skipped">("idle");

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("skipped");
      return;
    }
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      setStatus("skipped");
    }
  }, []);

  const enable = async () => {
    setStatus("enabling");
    try {
      const registration = await navigator.serviceWorker.register("/sw-push.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setStatus("skipped"); return; }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setStatus("done"); return; }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const { authService: auth } = await import("@/services/authService");
      const session = await auth.getCurrentSession();
      if (session) {
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });
      }
      setStatus("done");
    } catch {
      setStatus("skipped");
    }
  };

  if (status === "skipped") return null;
  if (status === "done") {
    return (
      <div className="relative backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden bg-white/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(73,176,110,0.15)" }}>
            <Check className="w-5 h-5 text-[#49B06E]" />
          </div>
          <p className="text-sm font-medium text-[#49B06E]">Alerts enabled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden bg-white/[0.04] p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(39,183,200,0.15)" }}>
          <Bell className="w-5 h-5 text-[#27B7C8]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#F3EDE3] mb-0.5">Turn on scanner alerts</p>
          <p className="text-xs text-[#F3EDE3]/40 mb-3">Get notified when Pansy finds a setup</p>
          <button
            type="button"
            onClick={enable}
            disabled={status === "enabling"}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#070B12] transition-all"
            style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)" }}
          >
            {status === "enabling" ? "Enabling..." : "Enable Notifications"}
          </button>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function FloatingOrbs() {
  return (
    <>
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]" style={{ background: "radial-gradient(circle, #27B7C8 0%, transparent 70%)", top: "-10%", right: "-10%", animation: "float1 15s ease-in-out infinite" }} />
      <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]" style={{ background: "radial-gradient(circle, #49B06E 0%, transparent 70%)", bottom: "10%", left: "-5%", animation: "float2 18s ease-in-out infinite" }} />
      <div className="absolute w-[350px] h-[350px] rounded-full opacity-15 blur-[100px]" style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", top: "40%", left: "60%", animation: "float3 20s ease-in-out infinite" }} />
    </>
  );
}

function OnboardingStyles() {
  return (
    <style jsx global>{`
      @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-40px) scale(1.1); } }
      @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px,30px) scale(1.15); } }
      @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,40px) scale(1.05); } }
      @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      @keyframes fadeSlideUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
      @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(39,183,200,0.15); } 50% { box-shadow: 0 0 40px rgba(39,183,200,0.3); } }
      @keyframes cardEntrance { from { opacity:0; transform: translateY(30px) scale(0.95); } to { opacity:1; transform: translateY(0) scale(1); } }
      @keyframes selectPop { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }

      .glass-input {
        background: rgba(255,255,255,0.04) !important;
        border-color: rgba(255,255,255,0.08) !important;
        color: #F3EDE3 !important;
        border-radius: 16px !important;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }
      .glass-input:focus {
        border-color: rgba(39,183,200,0.4) !important;
        box-shadow: 0 0 0 3px rgba(39,183,200,0.1), 0 0 20px rgba(39,183,200,0.1) !important;
        background: rgba(255,255,255,0.06) !important;
      }
      .glass-input::placeholder { color: rgba(244,247,250,0.3) !important; }

      .glass-btn {
        position: relative;
        overflow: hidden;
        background: linear-gradient(135deg, #49B06E, #27B7C8);
        border: none;
        border-radius: 16px;
        color: #070B12;
        font-weight: 700;
        padding: 14px 24px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
      }
      .glass-btn::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
        background-size: 200% 100%;
        animation: shimmer 3s ease-in-out infinite;
      }
      .glass-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(39,183,200,0.3); }
      .glass-btn:active { transform: translateY(0); }
      .glass-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

      .step-animate { animation: fadeSlideUp 0.6s ease-out both; }

      .option-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
      }
      .option-card:hover { transform: translateY(-2px); }
      .option-card.selected { animation: selectPop 0.35s ease-out; }
    `}</style>
  );
}
