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
  TrendingUp, Wallet, ArrowLeft, Brain, Clock, Rocket, Check,
} from "lucide-react";

type Step = "welcome" | "auth" | "check-email" | "q-experience" | "q-excites" | "q-capital" | "q-style" | "building" | "ready";
type AuthMode = "signup" | "login" | "forgot";

type TradingExperience = "never" | "dabbled" | "active" | "paper_only";
type TradingExcitement = "winning_setups" | "grow_account" | "learn_strategies" | "freedom";
type TradingCapital = "under_500" | "500_to_2k" | "2k_to_10k" | "over_10k";
type TradingStyle = "premarket" | "first_hour" | "all_day" | "evenings";

const quizSteps = ["q-experience", "q-excites", "q-capital", "q-style"] as const;

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
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
  const [animateIn, setAnimateIn] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const [tradingExperience, setTradingExperience] = useState<TradingExperience | null>(null);
  const [tradingExcitement, setTradingExcitement] = useState<TradingExcitement | null>(null);
  const [tradingCapital, setTradingCapital] = useState<TradingCapital | null>(null);
  const [tradingStyle, setTradingStyle] = useState<TradingStyle | null>(null);
  const [buildingProgress, setBuildingProgress] = useState(0);

  const submitLock = useRef(false);

  useEffect(() => {
    const ref = router.query.ref;
    if (typeof ref === "string" && ref.trim()) {
      setReferralCode(ref.trim().toUpperCase());
    }
  }, [router.query.ref]);

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
        setStep("q-experience");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAnimateIn(false);
    const t = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(t);
  }, [step]);

  useEffect(() => {
    if (step !== "building") { setBuildingProgress(0); return; }
    const timers = [600, 1200, 1800, 2400, 3000].map((ms, i) =>
      setTimeout(() => setBuildingProgress(i + 1), ms)
    );
    const nav = setTimeout(() => setStep("ready"), 3800);
    return () => { timers.forEach(clearTimeout); clearTimeout(nav); };
  }, [step]);

  const goToStep = (next: Step) => setStep(next);

  const quizIndex = quizSteps.indexOf(step as typeof quizSteps[number]);
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
        if (resetStep === "email") {
          try {
            const resp = await fetch("/api/auth/send-reset-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            const data = await resp.json();
            if (!resp.ok) { setError(data.error || "Failed to send code"); }
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
            if (!resp.ok) { setError(data.error || "Failed to reset password"); }
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
          // Ensure we have a session — sign in if autoconfirm didn't grant one
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
          submitLock.current = false;
          setIsSubmitting(false);
          goToStep("q-experience");
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
    } catch (err: unknown) {
      console.error("Auth error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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

      const experienceLevel = tradingExperience === "never" || tradingExperience === "paper_only" ? "beginner" : tradingExperience === "active" ? "advanced" : "intermediate";

      const { error: saveError } = await supabase.from("profiles").upsert({
        id: user.id,
        experience_level: experienceLevel,
        investment_goals: [tradingExcitement || "winning_setups"] as string[],
        risk_tolerance: tradingCapital === "under_500" ? "conservative" : tradingCapital === "over_10k" ? "aggressive" : "moderate",
        onboarding_complete: true,
      });
      if (saveError) {
        console.error("Failed to save onboarding profile:", saveError);
        setError("We couldn't save your answers. Please try again.");
        return;
      }
      goToStep("building");
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
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#07080C]" />}
    </div>
  );

  return (
    <>
      <OnboardingStyles />

      <div className="fixed inset-0 overflow-y-auto" style={{ background: "linear-gradient(135deg, #07080C 0%, #0a1525 40%, #0d1f35 70%, #07080C 100%)" }}>
        <FloatingOrbs />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Progress bar for quiz steps */}
          {isQuizStep && (
            <div className="sticky top-0 z-20 px-6 pt-4 pb-2">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => {
                      const prev = quizSteps[quizIndex - 1];
                      if (prev) goToStep(prev);
                    }}
                    className={`flex items-center gap-1 text-sm text-[#F3EDE3]/50 hover:text-[#F3EDE3]/80 transition-colors ${step === "q-experience" ? "invisible" : ""}`}
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
                  <span className="text-xs text-[#F3EDE3]/30 font-medium">{quizIndex + 1}/4</span>
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
                <div className={`space-y-7 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-5">
                    <div className="relative inline-block">
                      <img src="/bloom-logo.png" alt="Bloom" className="w-20 h-20 mx-auto rounded-3xl object-cover" style={{ boxShadow: "0 0 50px rgba(73,176,110,0.3)" }} />
                      <div className="absolute -inset-3 rounded-3xl opacity-50" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.2), rgba(39,183,200,0.15))", filter: "blur(12px)", zIndex: -1 }} />
                    </div>
                    <h1 className="font-serif text-4xl font-bold text-[#F3EDE3] leading-tight">Find winning trades<br />before everyone else.</h1>
                  </div>

                  <div className="space-y-3">
                    {[
                      { text: "AI scans the market every morning for Gap-and-Go setups", icon: "🔍", delay: "0.15s" },
                      { text: "Pansy scores each trade 0–100 and tells you exactly why", icon: "🌸", delay: "0.3s" },
                      { text: "Practice risk-free in the paper trader before going live", icon: "📊", delay: "0.45s" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={`${glassCard} ${glassCardBg} px-5 py-4`}
                        style={{ animation: animateIn ? `cardEntrance 0.5s ease-out ${item.delay} both` : "none" }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{item.icon}</span>
                          <p className="text-[#F3EDE3]/70 text-sm font-medium">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`${glassCard} ${glassCardBg} ${glowBorder} p-5`} style={{ animation: animateIn ? "fadeSlideUp 0.6s ease-out 0.6s both" : "none" }}>
                    <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.06) 0%, transparent 50%, rgba(39,183,200,0.04) 100%)" }} />
                    <div className="relative flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.2), rgba(39,183,200,0.2))", boxShadow: "0 0 20px rgba(73,176,110,0.15)" }}>
                        🌺
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className="font-serif text-base font-semibold text-[#49B06E]">Meet Pansy, your trading coach</h3>
                        <p className="text-sm leading-relaxed text-[#F3EDE3]/50">
                          I scan the market every day using the Gap-and-Go strategy — the same setups that move small-cap stocks 20%, 50%, even 100%+ in a single session. I&apos;ll show you exactly what I see and why.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-1" style={{ animation: animateIn ? "fadeSlideUp 0.5s ease-out 0.75s both" : "none" }}>
                    <p className="text-sm text-[#49B06E] font-semibold">7-day free trial &middot; Cancel anytime</p>
                    <p className="text-xs text-[#F3EDE3]/30">No credit card required to start</p>
                  </div>

                  <div className="space-y-3">
                    <button type="button" onClick={() => goToStep("auth")} className="glass-btn flex items-center justify-center gap-2 text-lg">
                      Start Scanning <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode("login"); goToStep("auth"); }}
                      className="w-full py-3 rounded-2xl text-[#F3EDE3]/50 hover:text-[#F3EDE3]/80 text-base font-medium transition-colors"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      I already have an account
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════ AUTH ═══════════ */}
              {step === "auth" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-2">
                    <img src="/bloom-logo.png" alt="Bloom" className="w-14 h-14 mx-auto rounded-2xl object-cover" style={{ boxShadow: "0 0 30px rgba(39,183,200,0.15)" }} />
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">
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
                        <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-[#F3EDE3]/60">
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
                                color: authMode === mode ? "#07080C" : "rgba(244,247,250,0.5)",
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
                          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl" style={{ background: "rgba(73,176,110,0.15)", animation: "pulse-glow 3s ease-in-out infinite" }}>✅</div>
                          <h3 className="font-serif text-xl font-bold text-[#F3EDE3]">Password Reset!</h3>
                          <p className="text-sm text-[#F3EDE3]/50">Your password has been updated. You can now log in.</p>
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
                            <div className={`${glassCard} p-3`} style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}>
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

                  {/* Trust signals */}
                  {authMode === "signup" && (
                    <div className="flex items-center justify-center gap-4 text-[#F3EDE3]/25 text-xs">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Encrypted</span>
                      <span>·</span>
                      <span>No spam, ever</span>
                      <span>·</span>
                      <span>Free to start</span>
                    </div>
                  )}

                  <button type="button" onClick={() => goToStep("welcome")} className="w-full text-center text-sm text-[#F3EDE3]/30 hover:text-[#F3EDE3]/60 transition-colors py-2">
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                </div>
              )}

              {/* ═══════════ Q1: TRADING EXPERIENCE ═══════════ */}
              {step === "q-experience" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#49B06E]" style={{ background: "rgba(73,176,110,0.1)", border: "1px solid rgba(73,176,110,0.15)" }}>
                      <Target className="w-3.5 h-3.5" /> Let&apos;s set you up
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">Have you traded<br />stocks before?</h2>
                    <p className="text-[#F3EDE3]/40 text-base">No wrong answer — Pansy adapts to you</p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { value: "never" as TradingExperience, label: "Brand new to this", desc: "Never placed a trade — teach me everything", icon: "🌱", color: "#49B06E" },
                      { value: "dabbled" as TradingExperience, label: "I've tried a little", desc: "Bought a few stocks, still learning", icon: "📱", color: "#27B7C8" },
                      { value: "paper_only" as TradingExperience, label: "Paper traded only", desc: "Practiced with fake money, ready for more", icon: "📝", color: "#8B5CF6" },
                      { value: "active" as TradingExperience, label: "I trade actively", desc: "I know the basics, need better setups", icon: "🔥", color: "#F59E0B" },
                    ]).map((option, i) => {
                      const isSelected = tradingExperience === option.value;
                      return (
                        <div
                          key={option.value}
                          onClick={() => setTradingExperience(option.value)}
                          className={`option-card ${glassCard} ${isSelected ? "selected" : ""}`}
                          style={{
                            background: isSelected ? `linear-gradient(135deg, ${option.color}15, ${option.color}08)` : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? `${option.color}50` : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? `0 0 25px ${option.color}18, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.08}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{option.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-base text-[#F3EDE3]">{option.label}</p>
                              <p className="text-xs text-[#F3EDE3]/40 mt-0.5">{option.desc}</p>
                            </div>
                            <SelectionDot selected={isSelected} color={option.color} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("q-excites")} disabled={!tradingExperience} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F3EDE3]/30 hover:text-[#F3EDE3]/60 transition-colors py-2">Skip for now</button>
                </div>
              )}

              {/* ═══════════ Q2: WHAT EXCITES YOU ═══════════ */}
              {step === "q-excites" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#27B7C8]" style={{ background: "rgba(39,183,200,0.1)", border: "1px solid rgba(39,183,200,0.15)" }}>
                      <Sparkles className="w-3.5 h-3.5" /> Your motivation
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">What gets you<br />most excited?</h2>
                    <p className="text-[#F3EDE3]/40 text-base">This helps Pansy tailor your experience</p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { value: "winning_setups" as TradingExcitement, label: "Finding winning setups", desc: "I want to spot the plays before they run", icon: <Target className="w-6 h-6" />, color: "#49B06E" },
                      { value: "grow_account" as TradingExcitement, label: "Growing a small account", desc: "Start with a little, build it into a lot", icon: <TrendingUp className="w-6 h-6" />, color: "#27B7C8" },
                      { value: "learn_strategies" as TradingExcitement, label: "Learning real strategies", desc: "Not theory — actual methods that work", icon: <Brain className="w-6 h-6" />, color: "#8B5CF6" },
                      { value: "freedom" as TradingExcitement, label: "Financial freedom", desc: "Trade from anywhere, on my own terms", icon: <Rocket className="w-6 h-6" />, color: "#F59E0B" },
                    ]).map((option, i) => {
                      const isSelected = tradingExcitement === option.value;
                      return (
                        <div
                          key={option.value}
                          onClick={() => setTradingExcitement(option.value)}
                          className={`option-card ${glassCard} ${isSelected ? "selected" : ""}`}
                          style={{
                            background: isSelected ? `linear-gradient(135deg, ${option.color}15, ${option.color}08)` : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? `${option.color}50` : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? `0 0 25px ${option.color}18, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
                            padding: "16px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.08}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300" style={{ background: isSelected ? `${option.color}20` : "rgba(255,255,255,0.04)", color: isSelected ? option.color : "rgba(244,247,250,0.4)" }}>
                              {option.icon}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-base text-[#F3EDE3]">{option.label}</p>
                              <p className="text-xs text-[#F3EDE3]/40 mt-0.5">{option.desc}</p>
                            </div>
                            <SelectionDot selected={isSelected} color={option.color} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("q-capital")} disabled={!tradingExcitement} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F3EDE3]/30 hover:text-[#F3EDE3]/60 transition-colors py-2">Skip for now</button>
                </div>
              )}

              {/* ═══════════ Q3: TRADING CAPITAL ═══════════ */}
              {step === "q-capital" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#8B5CF6]" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.15)" }}>
                      <Wallet className="w-3.5 h-3.5" /> Your starting point
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">How much are you<br />working with?</h2>
                    <p className="text-[#F3EDE3]/40 text-base">Gap-and-Go works at any account size</p>
                  </div>

                  <div className="space-y-3">
                    {([
                      { value: "under_500" as TradingCapital, label: "Under $500", desc: "Starting small — smart move to learn first", icon: "🌱", color: "#49B06E" },
                      { value: "500_to_2k" as TradingCapital, label: "$500 – $2,000", desc: "Enough to take real positions", icon: "💰", color: "#27B7C8" },
                      { value: "2k_to_10k" as TradingCapital, label: "$2,000 – $10,000", desc: "Solid starting capital for day trading", icon: "📈", color: "#8B5CF6" },
                      { value: "over_10k" as TradingCapital, label: "$10,000+", desc: "Ready to trade with size", icon: "🚀", color: "#F59E0B" },
                    ]).map((option, i) => {
                      const isSelected = tradingCapital === option.value;
                      return (
                        <div
                          key={option.value}
                          onClick={() => setTradingCapital(option.value)}
                          className={`option-card ${glassCard} ${isSelected ? "selected" : ""}`}
                          style={{
                            background: isSelected ? `linear-gradient(135deg, ${option.color}15, ${option.color}08)` : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? `${option.color}50` : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? `0 0 25px ${option.color}18, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
                            padding: "20px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.1}s both` : "none",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{option.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-lg text-[#F3EDE3]">{option.label}</p>
                              <p className="text-sm text-[#F3EDE3]/40 mt-0.5">{option.desc}</p>
                            </div>
                            <SelectionDot selected={isSelected} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("q-style")} disabled={!tradingCapital} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F3EDE3]/30 hover:text-[#F3EDE3]/60 transition-colors py-2">Skip for now</button>
                </div>
              )}

              {/* ═══════════ Q4: TRADING STYLE ═══════════ */}
              {step === "q-style" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#F59E0B]" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.15)" }}>
                      <Clock className="w-3.5 h-3.5" /> Almost there
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">When do you<br />want to trade?</h2>
                    <p className="text-[#F3EDE3]/40 text-base">Pansy will time your alerts around this</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "premarket" as TradingStyle, label: "Pre-market", desc: "4AM–9:30AM scans", icon: "🌅", color: "#F59E0B" },
                      { value: "first_hour" as TradingStyle, label: "Power hour", desc: "9:30–10:30AM action", icon: "⚡", color: "#49B06E" },
                      { value: "all_day" as TradingStyle, label: "All day", desc: "I watch the market", icon: "📊", color: "#27B7C8" },
                      { value: "evenings" as TradingStyle, label: "Evenings", desc: "Research after hours", icon: "🌙", color: "#8B5CF6" },
                    ]).map((option, i) => {
                      const isSelected = tradingStyle === option.value;
                      return (
                        <div
                          key={option.value}
                          onClick={() => setTradingStyle(option.value)}
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
                              <p className="font-semibold text-base text-[#F3EDE3]">{option.label}</p>
                              <p className="text-xs text-[#F3EDE3]/40 mt-0.5">{option.desc}</p>
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

                  <button type="button" onClick={handleCompleteOnboarding} disabled={isSubmitting || !tradingStyle} className="glass-btn flex items-center justify-center gap-2">
                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Calibrating your scanner...</> : <>Launch My Scanner <Sparkles className="w-5 h-5" /></>}
                  </button>
                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F3EDE3]/30 hover:text-[#F3EDE3]/60 transition-colors py-2">Skip for now</button>
                </div>
              )}

              {/* ═══════════ BUILDING YOUR SCANNER ═══════════ */}
              {step === "building" && (
                <div className={`space-y-8 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.2), rgba(39,183,200,0.2))", animation: "pulse-glow 3s ease-in-out infinite" }}>
                      🔍
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">Calibrating<br />your scanner...</h2>
                    <p className="text-[#F3EDE3]/40">Setting up Pansy for your trading style</p>
                  </div>

                  <div className={`${glassCard} ${glassCardBg} ${glowBorder} p-6`}>
                    <div className="space-y-5">
                      {[
                        "Connecting to live market data",
                        "Loading Gap-and-Go strategy engine",
                        "Tuning Pansy to your experience level",
                        "Setting up your scoring algorithm",
                        "Scanner ready — let's find some plays",
                      ].map((label, i) => (
                        <div key={i} className="flex items-center gap-3" style={{ opacity: buildingProgress > i ? 1 : 0.3, transition: "all 0.5s ease" }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{
                            background: buildingProgress > i ? "linear-gradient(135deg, #49B06E, #27B7C8)" : "rgba(255,255,255,0.06)",
                            transition: "all 0.5s ease",
                          }}>
                            {buildingProgress > i ? <Check className="w-3.5 h-3.5 text-[#07080C]" /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
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
                      transition: "width 0.7s ease-out",
                      boxShadow: "0 0 12px rgba(39,183,200,0.4)",
                    }} />
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-sm text-[#F3EDE3]/30 italic">
                      &quot;The best traders don&apos;t predict — they prepare.&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* ═══════════ READY SCREEN ═══════════ */}
              {step === "ready" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.25), rgba(39,183,200,0.2))", animation: "pulse-glow 3s ease-in-out infinite" }}>
                      🌸
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: "rgba(73,176,110,0.12)", border: "1px solid rgba(73,176,110,0.3)", color: "#49B06E" }}>
                      <Sparkles className="w-3.5 h-3.5" /> Scanner Ready
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F3EDE3]">You&apos;re all set.</h2>
                  </div>

                  <div className={`${glassCard} ${glassCardBg} ${glowBorder} p-5`}>
                    <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.06) 0%, transparent 50%, rgba(39,183,200,0.04) 100%)" }} />
                    <div className="relative flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl" style={{ background: "linear-gradient(135deg, rgba(73,176,110,0.2), rgba(39,183,200,0.2))" }}>
                        🌺
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-serif text-sm font-semibold text-[#49B06E]">Pansy says</p>
                        <p className="text-sm leading-relaxed text-[#F3EDE3]/60">
                          {tradingExperience === "never"
                            ? "Welcome to the game! I'll walk you through every setup step by step. Start with the paper trader — practice risk-free until you're confident, then go live when YOU'RE ready."
                            : tradingExperience === "active"
                            ? "Love that you already trade — my scanner is going to save you hours of manual screening. I score every candidate 0–100 so you can focus on the A+ setups and skip the noise."
                            : "Great — you've got some context, and that's going to make this click fast. I'll scan the market, score the setups, and show you exactly what to look for. Let's build on what you know."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`${glassCard} ${glassCardBg} p-4`}>
                    <p className="text-xs text-[#F3EDE3]/40 font-semibold uppercase tracking-wider mb-3">What&apos;s waiting for you</p>
                    <div className="space-y-3">
                      {[
                        { emoji: "🔍", label: "Live Scanner", desc: "Gap-and-Go candidates scored 0–100 in real time", color: "#49B06E" },
                        { emoji: "🌸", label: "Pansy's Picks", desc: "AI analysis with entry, stop, and target for each play", color: "#8B5CF6" },
                        { emoji: "📊", label: "Paper Trader", desc: "Practice every setup risk-free before going live", color: "#27B7C8" },
                        { emoji: "📰", label: "Market News", desc: "Catalyst-driven news feed to spot what's moving", color: "#F59E0B" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3" style={{ animation: animateIn ? `cardEntrance 0.4s ease-out ${i * 0.1}s both` : "none" }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${item.color}15` }}>
                            {item.emoji}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[#F3EDE3]">{item.label}</p>
                            <p className="text-[11px] text-[#F3EDE3]/40">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Founders pricing */}
                  <div className={`${glassCard} ${glassCardBg} p-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(212,168,83,0.15)", color: "#D4A853", border: "1px solid rgba(212,168,83,0.3)" }}>
                        Founders Pricing
                      </span>
                      <span className="text-[10px] text-[#F3EDE3]/30">Limited time</span>
                    </div>
                    <p className="text-xs text-[#F3EDE3]/40 mb-3">7-day free trial on every plan. Cancel anytime.</p>
                    <div className="space-y-2">
                      {[
                        { label: "Monthly", price: "$4.99/mo", regular: "$9.99/mo", tag: null },
                        { label: "Yearly", price: "$39.99/yr", regular: "$79.99/yr", tag: "Best Value" },
                        { label: "Lifetime", price: "$69.99", regular: "$149.99", tag: "One-time" },
                      ].map((plan, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl px-3 py-2.5"
                          style={{
                            background: plan.tag === "Best Value" ? "rgba(73,176,110,0.08)" : "rgba(255,255,255,0.02)",
                            border: plan.tag === "Best Value" ? "1px solid rgba(73,176,110,0.25)" : "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#F3EDE3]">{plan.label}</span>
                            {plan.tag && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: plan.tag === "Best Value" ? "rgba(73,176,110,0.2)" : "rgba(39,183,200,0.15)", color: plan.tag === "Best Value" ? "#49B06E" : "#27B7C8" }}>
                                {plan.tag}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#F3EDE3]">{plan.price}</span>
                            <span className="text-[10px] text-[#F3EDE3]/25 line-through ml-1.5">{plan.regular}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { window.location.href = "/home"; }}
                    className="glass-btn flex items-center justify-center gap-2 text-lg"
                  >
                    Start Free Trial <ChevronRight className="w-5 h-5" />
                  </button>
                  <p className="text-center text-[10px] text-[#F3EDE3]/25">
                    No credit card required to start
                  </p>
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
        color: #07080C;
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
