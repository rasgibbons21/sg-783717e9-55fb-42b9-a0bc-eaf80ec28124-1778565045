/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Eye, EyeOff, ChevronRight, Sparkles, Shield, Target,
  TrendingUp, Landmark, Wallet, ArrowLeft, BookOpen, BarChart3,
  Brain, PiggyBank, Clock, GraduationCap, Rocket, Check,
} from "lucide-react";

type Step = "welcome" | "auth" | "check-email" | "q-topics" | "q-experience" | "q-goal" | "q-time" | "ready";
type AuthMode = "signup" | "login" | "forgot";

type LearningTopic = "stocks_etfs" | "budgeting" | "retirement" | "crypto" | "real_estate" | "trading";
type StockExperience = "never" | "once_or_twice" | "regularly";
type MainGoal = "grow_wealth" | "retirement" | "passive_income" | "emergency_fund" | "financial_confidence" | "college_fund";
type DailyTime = "5min" | "10min" | "20min" | "no_limit";

const quizSteps = ["q-topics", "q-experience", "q-goal", "q-time"] as const;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [stockExp, setStockExp] = useState<StockExperience | null>(null);
  const [mainGoal, setMainGoal] = useState<MainGoal | null>(null);
  const [dailyTime, setDailyTime] = useState<DailyTime | null>(null);

  const submitLock = useRef(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("id", session.user.id)
        .single();
      if (profile?.onboarding_complete) {
        router.push("/home");
      } else {
        setStep("q-topics");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAnimateIn(false);
    const t = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(t);
  }, [step]);

  const goToStep = (next: Step) => setStep(next);

  const quizIndex = quizSteps.indexOf(step as any);
  const isQuizStep = quizIndex >= 0;

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
        const { error: resetError } = await authService.resetPassword(email);
        if (resetError) { setError(resetError.message); }
        else { setResetEmailSent(true); }
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
        if (!fullName.trim()) {
          setError("Please enter your full name");
          submitLock.current = false;
          setIsSubmitting(false);
          return;
        }
        if (!termsAccepted) {
          setError("Please accept the Terms of Service and Privacy Policy to continue");
          submitLock.current = false;
          setIsSubmitting(false);
          return;
        }
        const { user, error: signupError } = await authService.signUp(email, password, fullName);
        if (signupError) {
          setError(signupError.message);
          submitLock.current = false;
          setIsSubmitting(false);
          return;
        }
        if (user) {
          await userService.updateUser(user.id, { full_name: fullName });
          setSignupSuccess(true);
          submitLock.current = false;
          setIsSubmitting(false);
          return;
        }
      } else {
        const { user, error: loginError } = await authService.signIn(email, password);
        if (loginError) {
          setError(loginError.message);
          submitLock.current = false;
          setIsSubmitting(false);
          return;
        }
        if (user) router.push("/home");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err?.message || "An unexpected error occurred");
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Session expired — please sign in again."); return; }
    const { error } = await supabase.from("profiles").upsert({ id: user.id, onboarding_complete: true });
    if (error) { setError("Something went wrong. Please try again."); return; }
    window.location.href = "/home";
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Session expired — please sign in again."); return; }

      const experienceLevel = stockExp === "never" ? "beginner" : stockExp === "once_or_twice" ? "intermediate" : "advanced";

      const { error: saveError } = await supabase.from("profiles").upsert({
        id: user.id,
        experience_level: experienceLevel,
        investment_goals: topics as string[],
        risk_tolerance: mainGoal || "grow_wealth",
        onboarding_complete: true,
      });
      if (saveError) {
        console.error("Failed to save onboarding profile:", saveError);
        setError("We couldn't save your answers. Please try again.");
        return;
      }
      goToStep("ready");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const glassCard = "relative backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden";
  const glassCardBg = "bg-white/[0.04]";
  const glowBorder = "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_0_20px_rgba(39,183,200,0.08)]";

  const SelectionDot = ({ selected, color = "#27B7C8" }: { selected: boolean; color?: string }) => (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
      style={{
        background: selected ? `linear-gradient(135deg, ${color}, ${color}cc)` : "rgba(255,255,255,0.06)",
        border: selected ? "none" : "2px solid rgba(255,255,255,0.12)",
        boxShadow: selected ? `0 0 12px ${color}40` : "none",
      }}
    >
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#0E1B30]" />}
    </div>
  );

  const CheckDot = ({ selected, color = "#27B7C8" }: { selected: boolean; color?: string }) => (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
      style={{
        background: selected ? `linear-gradient(135deg, ${color}, ${color}cc)` : "rgba(255,255,255,0.06)",
        border: selected ? "none" : "2px solid rgba(255,255,255,0.12)",
        boxShadow: selected ? `0 0 8px ${color}40` : "none",
      }}
    >
      {selected && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="#0E1B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );

  if (signupSuccess) {
    return (
      <>
        <OnboardingStyles />
        <div className="fixed inset-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #0E1B30 0%, #0a1525 40%, #0d1f35 70%, #0E1B30 100%)" }}>
          <FloatingOrbs />
          <div className="flex items-center justify-center min-h-screen p-6">
            <div className="text-center space-y-6" style={{ animation: "fadeSlideUp 0.8s ease-out" }}>
              <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.2), rgba(73,176,110,0.2))", animation: "pulse-glow 3s ease-in-out infinite" }}>
                🌸
              </div>
              <h2 className="font-serif text-4xl font-bold text-[#F4F7FA]">Check your email!</h2>
              <p className="text-[#F4F7FA]/60 text-lg max-w-sm mx-auto">
                We sent a confirmation link to <strong className="text-[#27B7C8]">{email}</strong>. Click to activate your account.
              </p>
              <p className="text-[#F4F7FA]/40 text-sm">Don&apos;t forget to check your spam folder 🌸</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <OnboardingStyles />

      <div className="fixed inset-0 overflow-y-auto" style={{ background: "linear-gradient(135deg, #0E1B30 0%, #0a1525 40%, #0d1f35 70%, #0E1B30 100%)" }}>
        <FloatingOrbs />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Progress bar for quiz steps */}
          {isQuizStep && (
            <div className="sticky top-0 z-20 px-6 pt-4 pb-2">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => {
                      if (step === "q-topics") return;
                      const prev = quizSteps[quizIndex - 1];
                      if (prev) goToStep(prev);
                    }}
                    className={`flex items-center gap-1 text-sm text-[#F4F7FA]/50 hover:text-[#F4F7FA]/80 transition-colors ${step === "q-topics" ? "invisible" : ""}`}
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <div className="flex items-center gap-2">
                    {quizSteps.map((s, i) => (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            background: i <= quizIndex ? "linear-gradient(135deg, #49B06E, #27B7C8)" : "rgba(255,255,255,0.15)",
                            boxShadow: i <= quizIndex ? "0 0 8px rgba(39,183,200,0.4)" : "none",
                            transform: i === quizIndex ? "scale(1.3)" : "scale(1)",
                          }}
                        />
                        {i < quizSteps.length - 1 && (
                          <div className="w-6 h-0.5 rounded-full transition-all duration-500" style={{ background: i < quizIndex ? "linear-gradient(90deg, #49B06E, #27B7C8)" : "rgba(255,255,255,0.08)" }} />
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-[#F4F7FA]/30 font-medium">{quizIndex + 1}/4</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden backdrop-blur-xl border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${((quizIndex + 1) / quizSteps.length) * 100}%`,
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

              {/* ═══════════ WELCOME ═══════════ */}
              {step === "welcome" && (
                <div className={`space-y-8 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-6">
                    <div className="relative inline-block">
                      <img src="/bloom-logo.png" alt="Bloom" className="w-24 h-24 mx-auto rounded-3xl object-cover" style={{ boxShadow: "0 0 50px rgba(39,183,200,0.25)" }} />
                      <div className="absolute -inset-3 rounded-3xl opacity-50" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.15), rgba(73,176,110,0.15))", filter: "blur(12px)", zIndex: -1 }} />
                    </div>
                    <div className="space-y-3">
                      <h1 className="font-serif text-5xl font-bold text-[#F4F7FA]">Bloom</h1>
                      <p className="text-xl text-[#F4F7FA]/60 font-medium leading-relaxed max-w-xs mx-auto">
                        Build confidence with money and markets — one simple lesson at a time.
                      </p>
                    </div>
                  </div>

                  {/* Pansy glass card */}
                  <div className={`${glassCard} ${glassCardBg} ${glowBorder} p-6`}>
                    <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.06) 0%, transparent 50%, rgba(73,176,110,0.04) 100%)" }} />
                    <div className="relative flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.2), rgba(73,176,110,0.2))", boxShadow: "0 0 20px rgba(39,183,200,0.15)" }}>
                        🌺
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-serif text-lg font-semibold text-[#27B7C8]">Meet Pansy</h3>
                        <p className="text-sm leading-relaxed text-[#F4F7FA]/60">
                          Your guide to investing — no jargon, no pressure. Just clear, honest help with your money 💛
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button type="button" onClick={() => goToStep("auth")} className="glass-btn flex items-center justify-center gap-2 text-lg">
                      Start My Journey <Rocket className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode("login"); goToStep("auth"); }}
                      className="w-full py-3 rounded-2xl text-[#F4F7FA]/50 hover:text-[#F4F7FA]/80 text-base font-medium transition-colors"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════ AUTH ═══════════ */}
              {step === "auth" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-2">
                    <img src="/bloom-logo.png" alt="Bloom" className="w-14 h-14 mx-auto rounded-2xl object-cover" style={{ boxShadow: "0 0 30px rgba(39,183,200,0.15)" }} />
                    <h2 className="font-serif text-3xl font-bold text-[#F4F7FA]">
                      {authMode === "signup" ? "Create your account" : authMode === "login" ? "Welcome back" : "Reset password"}
                    </h2>
                  </div>

                  {/* Terms (signup only) */}
                  {authMode === "signup" && (
                    <div className={`${glassCard} ${glassCardBg} p-4`}>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                          className="mt-0.5 border-white/20 data-[state=checked]:bg-[#27B7C8] data-[state=checked]:border-[#27B7C8]"
                        />
                        <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-[#F4F7FA]/60">
                          I agree to the{" "}
                          <Link href="/terms" target="_blank" className="text-[#27B7C8] underline hover:text-[#27B7C8]/80">Terms of Service</Link>{" "}
                          and{" "}
                          <Link href="/privacy" target="_blank" className="text-[#27B7C8] underline hover:text-[#27B7C8]/80">Privacy Policy</Link>
                        </Label>
                      </div>
                    </div>
                  )}

                  {/* Auth form */}
                  <div className={`${glassCard} ${glassCardBg} ${glowBorder} p-6`}>
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
                                color: authMode === mode ? "#0E1B30" : "rgba(244,247,250,0.5)",
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
                          <button type="button" onClick={() => { setAuthMode("login"); setResetEmailSent(false); setError(""); }} className="flex items-center gap-1 text-sm text-[#F4F7FA]/50 hover:text-[#F4F7FA]/80 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Log In
                          </button>
                          <p className="text-sm text-[#F4F7FA]/40">Enter your email and we&apos;ll send reset instructions.</p>
                        </div>
                      )}

                      {authMode === "forgot" && resetEmailSent ? (
                        <div className="space-y-4 py-4 text-center">
                          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl" style={{ background: "rgba(39,183,200,0.15)", animation: "pulse-glow 3s ease-in-out infinite" }}>📧</div>
                          <h3 className="font-serif text-xl font-bold text-[#F4F7FA]">Check Your Email</h3>
                          <p className="text-sm text-[#F4F7FA]/50">Reset instructions sent to <strong className="text-[#27B7C8]">{email}</strong> 💛</p>
                          <button type="button" onClick={() => { setAuthMode("login"); setResetEmailSent(false); setEmail(""); }} className="glass-btn">Back to Log In</button>
                        </div>
                      ) : (
                        <>
                          {authMode === "signup" && (
                            <div className="space-y-1.5">
                              <Label htmlFor="fullName" className="text-xs font-medium text-[#F4F7FA]/40 uppercase tracking-wider">Full Name</Label>
                              <Input id="fullName" type="text" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isSubmitting} className="glass-input h-12" />
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-medium text-[#F4F7FA]/40 uppercase tracking-wider">Email</Label>
                            <Input id="email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} className="glass-input h-12" />
                          </div>
                          {authMode !== "forgot" && (
                            <div className="space-y-1.5">
                              <Label htmlFor="password" className="text-xs font-medium text-[#F4F7FA]/40 uppercase tracking-wider">Password</Label>
                              <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="glass-input h-12 pr-12" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F4F7FA]/30 hover:text-[#F4F7FA]/60 transition-colors">
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                              {authMode === "login" && (
                                <div className="text-right">
                                  <button type="button" onClick={() => { setAuthMode("forgot"); setError(""); }} className="text-sm text-[#27B7C8]/70 hover:text-[#27B7C8] font-medium transition-colors">Forgot password?</button>
                                </div>
                              )}
                            </div>
                          )}
                          {error && (
                            <div className={`${glassCard} p-3`} style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}>
                              <p className="text-sm text-red-400 font-medium">{error}</p>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleAuth}
                            disabled={isSubmitting || !email || (authMode !== "forgot" && !password) || (authMode === "signup" && !fullName) || (authMode === "signup" && !termsAccepted)}
                            className="glass-btn flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : authMode === "signup" ? <>Create Account <ChevronRight className="w-5 h-5" /></> : authMode === "login" ? <>Log In <ChevronRight className="w-5 h-5" /></> : "Send Reset Instructions"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <button type="button" onClick={() => goToStep("welcome")} className="w-full text-center text-sm text-[#F4F7FA]/30 hover:text-[#F4F7FA]/60 transition-colors py-2">
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                </div>
              )}

              {/* ═══════════ Q1: WHAT DO YOU WANT TO LEARN? ═══════════ */}
              {step === "q-topics" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#27B7C8]" style={{ background: "rgba(39,183,200,0.1)", border: "1px solid rgba(39,183,200,0.15)" }}>
                      <Sparkles className="w-3.5 h-3.5" /> Let&apos;s personalize
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F4F7FA]">What do you want<br />to learn?</h2>
                    <p className="text-[#F4F7FA]/40 text-base">Pick all that interest you</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "stocks_etfs" as LearningTopic, label: "Stocks & ETFs", icon: <TrendingUp className="w-6 h-6" />, color: "#49B06E" },
                      { value: "budgeting" as LearningTopic, label: "Budgeting", icon: <Wallet className="w-6 h-6" />, color: "#27B7C8" },
                      { value: "retirement" as LearningTopic, label: "Retirement", icon: <Landmark className="w-6 h-6" />, color: "#8B5CF6" },
                      { value: "crypto" as LearningTopic, label: "Crypto", icon: <BarChart3 className="w-6 h-6" />, color: "#F59E0B" },
                      { value: "real_estate" as LearningTopic, label: "Real Estate", icon: <PiggyBank className="w-6 h-6" />, color: "#EC4899" },
                      { value: "trading" as LearningTopic, label: "Trading", icon: <Brain className="w-6 h-6" />, color: "#EF4444" },
                    ]).map((option, i) => {
                      const isSelected = topics.includes(option.value);
                      return (
                        <div
                          key={option.value}
                          onClick={() => setTopics(prev => prev.includes(option.value) ? prev.filter(t => t !== option.value) : [...prev, option.value])}
                          className={`option-card ${glassCard} ${isSelected ? "selected" : ""}`}
                          style={{
                            background: isSelected ? `linear-gradient(135deg, ${option.color}15, ${option.color}08)` : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? `${option.color}50` : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? `0 0 25px ${option.color}18, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.06}s both` : "none",
                          }}
                        >
                          <div className="flex flex-col items-center text-center gap-2.5">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300" style={{ background: isSelected ? `${option.color}20` : "rgba(255,255,255,0.04)", color: isSelected ? option.color : "rgba(244,247,250,0.4)" }}>
                              {option.icon}
                            </div>
                            <p className="font-semibold text-sm text-[#F4F7FA]">{option.label}</p>
                            <CheckDot selected={isSelected} color={option.color} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("q-experience")} disabled={topics.length === 0} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F4F7FA]/30 hover:text-[#F4F7FA]/60 transition-colors py-2">Skip for now →</button>
                </div>
              )}

              {/* ═══════════ Q2: HAVE YOU EVER BOUGHT A STOCK? ═══════════ */}
              {step === "q-experience" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#49B06E]" style={{ background: "rgba(73,176,110,0.1)", border: "1px solid rgba(73,176,110,0.15)" }}>
                      <BarChart3 className="w-3.5 h-3.5" /> Your experience
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F4F7FA]">Have you ever bought<br />a stock or ETF?</h2>
                    <p className="text-[#F4F7FA]/40 text-base">No wrong answer here</p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { value: "never" as StockExperience, label: "Never", desc: "I'm brand new to this", icon: "🌱" },
                      { value: "once_or_twice" as StockExperience, label: "Once or twice", desc: "I've dipped my toes in", icon: "🌿" },
                      { value: "regularly" as StockExperience, label: "Regularly", desc: "I invest or trade often", icon: "🌳" },
                    ]).map((option, i) => {
                      const isSelected = stockExp === option.value;
                      return (
                        <div
                          key={option.value}
                          onClick={() => setStockExp(option.value)}
                          className={`option-card ${glassCard} ${isSelected ? "selected" : ""}`}
                          style={{
                            background: isSelected ? "linear-gradient(135deg, rgba(39,183,200,0.12), rgba(73,176,110,0.08))" : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? "rgba(39,183,200,0.35)" : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? "0 0 25px rgba(39,183,200,0.12), inset 0 1px 0 rgba(255,255,255,0.06)" : "inset 0 1px 0 rgba(255,255,255,0.03)",
                            padding: "20px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.1}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{option.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-lg text-[#F4F7FA]">{option.label}</p>
                              <p className="text-sm text-[#F4F7FA]/40 mt-0.5">{option.desc}</p>
                            </div>
                            <SelectionDot selected={isSelected} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("q-goal")} disabled={!stockExp} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F4F7FA]/30 hover:text-[#F4F7FA]/60 transition-colors py-2">Skip for now →</button>
                </div>
              )}

              {/* ═══════════ Q3: WHAT IS YOUR MAIN GOAL? ═══════════ */}
              {step === "q-goal" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#8B5CF6]" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.15)" }}>
                      <Target className="w-3.5 h-3.5" /> Your goal
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F4F7FA]">What is your<br />main goal?</h2>
                    <p className="text-[#F4F7FA]/40 text-base">Pick the one that matters most right now</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "grow_wealth" as MainGoal, label: "Grow Wealth", icon: <TrendingUp className="w-6 h-6" />, color: "#49B06E" },
                      { value: "retirement" as MainGoal, label: "Retirement", icon: <Landmark className="w-6 h-6" />, color: "#27B7C8" },
                      { value: "passive_income" as MainGoal, label: "Passive Income", icon: <Wallet className="w-6 h-6" />, color: "#8B5CF6" },
                      { value: "emergency_fund" as MainGoal, label: "Emergency Fund", icon: <Shield className="w-6 h-6" />, color: "#F59E0B" },
                      { value: "financial_confidence" as MainGoal, label: "Financial Confidence", icon: <Brain className="w-6 h-6" />, color: "#EC4899", span: true },
                      { value: "college_fund" as MainGoal, label: "College Fund", icon: <GraduationCap className="w-6 h-6" />, color: "#06B6D4", span: true },
                    ] as const).map((option, i) => {
                      const isSelected = mainGoal === option.value;
                      const span = "span" in option && option.span;
                      return (
                        <div
                          key={option.value}
                          onClick={() => setMainGoal(option.value)}
                          className={`option-card ${glassCard} ${isSelected ? "selected" : ""} ${span ? "col-span-1" : ""}`}
                          style={{
                            background: isSelected ? `linear-gradient(135deg, ${option.color}15, ${option.color}08)` : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? `${option.color}50` : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? `0 0 25px ${option.color}18, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.06}s both` : "none",
                          }}
                        >
                          <div className="flex flex-col items-center text-center gap-2.5">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300" style={{ background: isSelected ? `${option.color}20` : "rgba(255,255,255,0.04)", color: isSelected ? option.color : "rgba(244,247,250,0.4)" }}>
                              {option.icon}
                            </div>
                            <p className="font-semibold text-xs text-[#F4F7FA] leading-tight">{option.label}</p>
                            <SelectionDot selected={isSelected} color={option.color} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("q-time")} disabled={!mainGoal} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F4F7FA]/30 hover:text-[#F4F7FA]/60 transition-colors py-2">Skip for now →</button>
                </div>
              )}

              {/* ═══════════ Q4: HOW MUCH TIME? ═══════════ */}
              {step === "q-time" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#F59E0B]" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.15)" }}>
                      <Clock className="w-3.5 h-3.5" /> Almost done
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F4F7FA]">How much time can you<br />learn each day?</h2>
                    <p className="text-[#F4F7FA]/40 text-base">Even 5 minutes makes a difference</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "5min" as DailyTime, label: "5 minutes", desc: "Quick bites", icon: "☕", color: "#49B06E" },
                      { value: "10min" as DailyTime, label: "10 minutes", desc: "A good pace", icon: "📖", color: "#27B7C8" },
                      { value: "20min" as DailyTime, label: "20 minutes", desc: "Deep dives", icon: "🧠", color: "#8B5CF6" },
                      { value: "no_limit" as DailyTime, label: "No limit", desc: "I'll keep going", icon: "🚀", color: "#F59E0B" },
                    ]).map((option, i) => {
                      const isSelected = dailyTime === option.value;
                      return (
                        <div
                          key={option.value}
                          onClick={() => setDailyTime(option.value)}
                          className={`option-card ${glassCard} ${isSelected ? "selected" : ""}`}
                          style={{
                            background: isSelected ? `linear-gradient(135deg, ${option.color}15, ${option.color}08)` : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? `${option.color}50` : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? `0 0 25px ${option.color}18, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
                            padding: "20px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.08}s both` : "none",
                          }}
                        >
                          <div className="flex flex-col items-center text-center gap-2.5">
                            <span className="text-3xl">{option.icon}</span>
                            <div>
                              <p className="font-semibold text-base text-[#F4F7FA]">{option.label}</p>
                              <p className="text-xs text-[#F4F7FA]/40 mt-0.5">{option.desc}</p>
                            </div>
                            <SelectionDot selected={isSelected} color={option.color} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {error && (
                    <div className={`${glassCard} p-3`} style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}>
                      <p className="text-sm text-red-400 font-medium">{error}</p>
                    </div>
                  )}

                  <button type="button" onClick={handleCompleteOnboarding} disabled={isSubmitting || !dailyTime} className="glass-btn flex items-center justify-center gap-2">
                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Building your journey...</> : <>See My Journey <Sparkles className="w-5 h-5" /></>}
                  </button>
                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F4F7FA]/30 hover:text-[#F4F7FA]/60 transition-colors py-2">Skip for now →</button>
                </div>
              )}

              {/* ═══════════ READY SCREEN ═══════════ */}
              {step === "ready" && (
                <div className={`space-y-8 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.2), rgba(73,176,110,0.2))", animation: "pulse-glow 3s ease-in-out infinite" }}>
                      🌸
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F4F7FA]">Your Bloom Journey<br />is ready!</h2>
                    <p className="text-[#F4F7FA]/50 text-base max-w-xs mx-auto">We&apos;ve personalized your path. Let&apos;s start with your first lesson.</p>
                  </div>

                  {/* First lesson card */}
                  <div className={`${glassCard} ${glassCardBg} ${glowBorder} p-6`}>
                    <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.06) 0%, transparent 50%, rgba(73,176,110,0.04) 100%)" }} />
                    <div className="relative space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.2), rgba(73,176,110,0.2))" }}>
                          <BookOpen className="w-6 h-6 text-[#27B7C8]" />
                        </div>
                        <div>
                          <p className="text-xs text-[#27B7C8] font-semibold uppercase tracking-wider">Recommended first lesson</p>
                          <h3 className="font-serif text-lg font-bold text-[#F4F7FA]">
                            {stockExp === "never" ? "What Is Investing?" : stockExp === "once_or_twice" ? "Building Your Portfolio" : "Advanced Strategies"}
                          </h3>
                        </div>
                      </div>
                      <p className="text-sm text-[#F4F7FA]/50">
                        {stockExp === "never"
                          ? "Start here — we'll explain investing in plain language, no jargon. Takes about 5 minutes."
                          : stockExp === "once_or_twice"
                          ? "Let's build on what you know — learn how to put together a balanced portfolio."
                          : "Dive deeper into strategies that experienced investors use to grow wealth."}
                      </p>
                      {/* Progress preview */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full w-0" style={{ background: "linear-gradient(90deg, #49B06E, #27B7C8)" }} />
                        </div>
                        <span className="text-xs text-[#F4F7FA]/30">0%</span>
                      </div>
                    </div>
                  </div>

                  {/* Journey path preview */}
                  <div className={`${glassCard} ${glassCardBg} p-5`}>
                    <p className="text-xs text-[#F4F7FA]/40 font-semibold uppercase tracking-wider mb-3">Your learning path</p>
                    <div className="flex items-center justify-between">
                      {["Seed", "Sprout", "Grow", "Bloom"].map((stage, i) => (
                        <div key={stage} className="flex items-center gap-1">
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                              style={{
                                background: i === 0 ? "linear-gradient(135deg, rgba(39,183,200,0.2), rgba(73,176,110,0.2))" : "rgba(255,255,255,0.04)",
                                border: i === 0 ? "2px solid rgba(39,183,200,0.3)" : "1px solid rgba(255,255,255,0.08)",
                              }}
                            >
                              {["🌱", "🌿", "🌳", "🌸"][i]}
                            </div>
                            <span className={`text-xs ${i === 0 ? "text-[#27B7C8] font-semibold" : "text-[#F4F7FA]/30"}`}>{stage}</span>
                          </div>
                          {i < 3 && <div className="w-4 h-px mx-0.5 mt-[-16px]" style={{ background: "rgba(255,255,255,0.08)" }} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { window.location.href = "/home"; }}
                    className="glass-btn flex items-center justify-center gap-2 text-lg"
                  >
                    Start Learning <ChevronRight className="w-5 h-5" />
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
        color: #F4F7FA !important;
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
        color: #0E1B30;
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
