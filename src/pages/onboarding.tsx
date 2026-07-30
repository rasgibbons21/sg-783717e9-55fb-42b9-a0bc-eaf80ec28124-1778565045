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
import { Loader2, Eye, EyeOff, ChevronRight, Sparkles, Shield, Target, Flame, TrendingUp, Landmark, Wallet, ArrowLeft } from "lucide-react";

type Step = "auth" | "check-email" | "experience" | "goals" | "risk";
type AuthMode = "signup" | "login" | "forgot";
type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type InvestmentGoal = "grow_wealth" | "retirement" | "passive_income" | "emergency_fund";
type RiskTolerance = "conservative" | "moderate" | "aggressive";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [risk, setRisk] = useState<RiskTolerance>("moderate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

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
        setStep("experience");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAnimateIn(false);
    const t = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(t);
  }, [step]);

  const goToStep = (next: Step) => {
    setStep(next);
  };

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
        if (resetError) {
          setError(resetError.message);
          submitLock.current = false;
          setIsSubmitting(false);
          return;
        }
        setResetEmailSent(true);
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
        if (user) {
          router.push("/home");
        }
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
    if (!user) {
      setError("Session expired — please sign in again.");
      return;
    }
    const { error } = await supabase.from("profiles").upsert({ id: user.id, onboarding_complete: true });
    if (error) {
      console.error("Failed to save skip:", error);
      setError("Something went wrong. Please try again.");
      return;
    }
    window.location.href = "/home";
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Session expired — please sign in again.");
        return;
      }
      const { error: saveError } = await supabase.from("profiles").upsert({
        id: user.id,
        experience_level: experience,
        investment_goals: goals,
        risk_tolerance: risk,
        onboarding_complete: true,
      });
      if (saveError) {
        console.error("Failed to save onboarding profile:", saveError);
        setError("We couldn't save your answers. Please try again.");
        return;
      }
      window.location.href = "/subscription-offer";
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onboardingSteps = ["experience", "goals", "risk"] as const;
  const currentStepIndex = onboardingSteps.indexOf(step as any);
  const isOnboardingStep = currentStepIndex >= 0;

  const glassCard = "relative backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden";
  const glassCardBg = "bg-white/[0.04]";
  const glowBorder = "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_0_20px_rgba(39,183,200,0.08)]";

  if (signupSuccess) {
    return (
      <>
        <style jsx global>{`
          @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-40px) scale(1.1); } }
          @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px,30px) scale(1.15); } }
          @keyframes fadeSlideUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
          @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(39,183,200,0.15); } 50% { box-shadow: 0 0 40px rgba(39,183,200,0.3); } }
        `}</style>
        <div className="fixed inset-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #0E1B30 0%, #0a1525 40%, #0d1f35 70%, #0E1B30 100%)" }}>
          <div className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]" style={{ background: "radial-gradient(circle, #27B7C8 0%, transparent 70%)", top: "-10%", right: "-10%", animation: "float1 15s ease-in-out infinite" }} />
          <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]" style={{ background: "radial-gradient(circle, #49B06E 0%, transparent 70%)", bottom: "10%", left: "-5%", animation: "float2 18s ease-in-out infinite" }} />
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
      <style jsx global>{`
        @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-40px) scale(1.1); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px,30px) scale(1.15); } }
        @keyframes float3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,40px) scale(1.05); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeSlideUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform: scale(0.92); } to { opacity:1; transform: scale(1); } }
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

      <div className="fixed inset-0 overflow-hidden" style={{ background: "linear-gradient(135deg, #0E1B30 0%, #0a1525 40%, #0d1f35 70%, #0E1B30 100%)" }}>
        {/* Animated floating orbs */}
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]" style={{ background: "radial-gradient(circle, #27B7C8 0%, transparent 70%)", top: "-10%", right: "-10%", animation: "float1 15s ease-in-out infinite" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]" style={{ background: "radial-gradient(circle, #49B06E 0%, transparent 70%)", bottom: "10%", left: "-5%", animation: "float2 18s ease-in-out infinite" }} />
        <div className="absolute w-[350px] h-[350px] rounded-full opacity-15 blur-[100px]" style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", top: "40%", left: "60%", animation: "float3 20s ease-in-out infinite" }} />

        <div className="relative z-10 flex flex-col min-h-screen overflow-y-auto">
          {/* Progress bar for onboarding steps */}
          {isOnboardingStep && (
            <div className="sticky top-0 z-20 px-6 pt-4 pb-2">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => {
                      if (step === "goals") goToStep("experience");
                      else if (step === "risk") goToStep("goals");
                    }}
                    className={`flex items-center gap-1 text-sm text-[#F4F7FA]/50 hover:text-[#F4F7FA]/80 transition-colors ${step === "experience" ? "invisible" : ""}`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <div className="flex items-center gap-2">
                    {onboardingSteps.map((s, i) => (
                      <div key={s} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            background: i <= currentStepIndex
                              ? "linear-gradient(135deg, #49B06E, #27B7C8)"
                              : "rgba(255,255,255,0.15)",
                            boxShadow: i <= currentStepIndex ? "0 0 8px rgba(39,183,200,0.4)" : "none",
                            transform: i === currentStepIndex ? "scale(1.3)" : "scale(1)",
                          }}
                        />
                        {i < onboardingSteps.length - 1 && (
                          <div
                            className="w-8 h-0.5 rounded-full transition-all duration-500"
                            style={{ background: i < currentStepIndex ? "linear-gradient(90deg, #49B06E, #27B7C8)" : "rgba(255,255,255,0.08)" }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-[#F4F7FA]/30 font-medium">{currentStepIndex + 1}/3</span>
                </div>
                {/* Glass progress bar */}
                <div className="h-1 rounded-full overflow-hidden backdrop-blur-xl border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${((currentStepIndex + 1) / onboardingSteps.length) * 100}%`,
                      background: "linear-gradient(90deg, #49B06E, #27B7C8)",
                      boxShadow: "0 0 12px rgba(39,183,200,0.4)",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              {/* ═══════════ AUTH STEP ═══════════ */}
              {step === "auth" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  {/* Logo & tagline */}
                  <div className="text-center space-y-4">
                    <div className="relative inline-block">
                      <img
                        src="/bloom-logo.png"
                        alt="Bloom Logo"
                        className="w-20 h-20 mx-auto rounded-2xl object-cover"
                        style={{ boxShadow: "0 0 40px rgba(39,183,200,0.2)" }}
                      />
                      <div className="absolute -inset-2 rounded-2xl opacity-50" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.15), rgba(73,176,110,0.15))", filter: "blur(10px)", zIndex: -1 }} />
                    </div>
                    <h1 className="font-serif text-5xl font-bold text-[#F4F7FA]">Bloom</h1>
                    <p className="text-lg text-[#F4F7FA]/50 font-medium">Invest in yourself first 🌸</p>
                  </div>

                  {/* Pansy glass card */}
                  <div className={`${glassCard} ${glassCardBg} ${glowBorder} p-6`}>
                    <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.06) 0%, transparent 50%, rgba(73,176,110,0.04) 100%)" }} />
                    <div className="relative flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.2), rgba(73,176,110,0.2))", boxShadow: "0 0 20px rgba(39,183,200,0.15)" }}>
                        🌺
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-serif text-lg font-semibold text-[#27B7C8]">Hi! I&apos;m Pansy</h3>
                          <p className="text-xs text-[#F4F7FA]/40">Bloom&apos;s Investing Expert</p>
                        </div>
                        <p className="text-sm leading-relaxed text-[#F4F7FA]/70">
                          I&apos;ll break investing down in a way that actually makes sense. No confusing terms, no pressure — just clear, honest help with your money 💛
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Terms glass card */}
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

                  {/* Auth form glass card */}
                  <div className={`${glassCard} ${glassCardBg} ${glowBorder} p-6`}>
                    <div className="space-y-4">
                      {authMode !== "forgot" && (
                        <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <button
                            type="button"
                            onClick={() => { setAuthMode("signup"); setResetEmailSent(false); setError(""); }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            style={{
                              background: authMode === "signup" ? "linear-gradient(135deg, #49B06E, #27B7C8)" : "transparent",
                              color: authMode === "signup" ? "#0E1B30" : "rgba(244,247,250,0.5)",
                              boxShadow: authMode === "signup" ? "0 4px 15px rgba(39,183,200,0.25)" : "none",
                            }}
                          >
                            Sign Up
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAuthMode("login"); setResetEmailSent(false); setError(""); }}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            style={{
                              background: authMode === "login" ? "linear-gradient(135deg, #49B06E, #27B7C8)" : "transparent",
                              color: authMode === "login" ? "#0E1B30" : "rgba(244,247,250,0.5)",
                              boxShadow: authMode === "login" ? "0 4px 15px rgba(39,183,200,0.25)" : "none",
                            }}
                          >
                            Log In
                          </button>
                        </div>
                      )}

                      {authMode === "forgot" && !resetEmailSent && (
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => { setAuthMode("login"); setResetEmailSent(false); setError(""); }}
                            className="flex items-center gap-1 text-sm text-[#F4F7FA]/50 hover:text-[#F4F7FA]/80 transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" /> Back to Log In
                          </button>
                          <h3 className="font-serif text-xl font-bold text-[#F4F7FA]">Reset Your Password</h3>
                          <p className="text-sm text-[#F4F7FA]/40">Enter your email and we&apos;ll send you reset instructions.</p>
                        </div>
                      )}

                      {authMode === "forgot" && resetEmailSent ? (
                        <div className="space-y-4 py-4 text-center">
                          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl" style={{ background: "rgba(39,183,200,0.15)", animation: "pulse-glow 3s ease-in-out infinite" }}>
                            📧
                          </div>
                          <h3 className="font-serif text-xl font-bold text-[#F4F7FA]">Check Your Email</h3>
                          <p className="text-sm text-[#F4F7FA]/50">
                            Reset instructions sent to <strong className="text-[#27B7C8]">{email}</strong>. Check your inbox 💛
                          </p>
                          <button type="button" onClick={() => { setAuthMode("login"); setResetEmailSent(false); setEmail(""); }} className="glass-btn">
                            Back to Log In
                          </button>
                        </div>
                      ) : (
                        <>
                          {authMode === "signup" && (
                            <div className="space-y-1.5">
                              <Label htmlFor="fullName" className="text-xs font-medium text-[#F4F7FA]/40 uppercase tracking-wider">Full Name</Label>
                              <Input
                                id="fullName"
                                type="text"
                                placeholder="Jane Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={isSubmitting}
                                className="glass-input h-12"
                              />
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-medium text-[#F4F7FA]/40 uppercase tracking-wider">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="jane@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={isSubmitting}
                              className="glass-input h-12"
                            />
                          </div>

                          {authMode !== "forgot" && (
                            <div className="space-y-1.5">
                              <Label htmlFor="password" className="text-xs font-medium text-[#F4F7FA]/40 uppercase tracking-wider">Password</Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  className="glass-input h-12 pr-12"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F4F7FA]/30 hover:text-[#F4F7FA]/60 transition-colors"
                                >
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                              {authMode === "login" && (
                                <div className="text-right">
                                  <button
                                    type="button"
                                    onClick={() => { setAuthMode("forgot"); setError(""); }}
                                    className="text-sm text-[#27B7C8]/70 hover:text-[#27B7C8] font-medium transition-colors"
                                  >
                                    Forgot password?
                                  </button>
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
                            disabled={
                              isSubmitting ||
                              !email ||
                              (authMode !== "forgot" && !password) ||
                              (authMode === "signup" && !fullName) ||
                              (authMode === "signup" && !termsAccepted)
                            }
                            className="glass-btn flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                            ) : authMode === "signup" ? (
                              <>Create Account <ChevronRight className="w-5 h-5" /></>
                            ) : authMode === "login" ? (
                              <>Log In <ChevronRight className="w-5 h-5" /></>
                            ) : (
                              "Send Reset Instructions"
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════ CHECK EMAIL STEP ═══════════ */}
              {step === "check-email" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl" style={{ background: "rgba(39,183,200,0.15)", animation: "pulse-glow 3s ease-in-out infinite" }}>
                      🌸
                    </div>
                    <h2 className="font-serif text-4xl font-bold text-[#F4F7FA]">Check your email!</h2>
                    <p className="text-[#F4F7FA]/50 text-lg">
                      We sent a confirmation link to <strong className="text-[#27B7C8]">{email}</strong>.
                      <br />Click the link to activate your account.
                    </p>
                  </div>
                  <div className={`${glassCard} ${glassCardBg} ${glowBorder} p-6 space-y-4 text-center`}>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSubmitting(true);
                        try {
                          await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: "https://shebloomswealth.app/auth/callback" } });
                          alert("Email resent! Check your inbox.");
                        } catch (e) { console.error("Resend error:", e); }
                        finally { setIsSubmitting(false); }
                      }}
                      disabled={isSubmitting}
                      className="glass-btn"
                    >
                      {isSubmitting ? "Sending..." : "Resend email"}
                    </button>
                    <p className="text-sm text-[#F4F7FA]/30 italic">Don&apos;t forget to check your spam folder 🌸</p>
                  </div>
                </div>
              )}

              {/* ═══════════ EXPERIENCE STEP ═══════════ */}
              {step === "experience" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#27B7C8]" style={{ background: "rgba(39,183,200,0.1)", border: "1px solid rgba(39,183,200,0.15)" }}>
                      <Sparkles className="w-3.5 h-3.5" /> Let&apos;s personalize
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F4F7FA]">
                      How much do you know<br />about investing?
                    </h2>
                    <p className="text-[#F4F7FA]/40 text-base">No judgment — helps me personalize your experience</p>
                  </div>

                  {/* Bento grid — beginner is featured (full-width) */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "beginner" as ExperienceLevel, label: "Beginner", desc: "Just getting started — I'll guide you every step", icon: "🌱", span: true },
                      { value: "intermediate" as ExperienceLevel, label: "Intermediate", desc: "Some experience", icon: "🌿", span: false },
                      { value: "advanced" as ExperienceLevel, label: "Advanced", desc: "Pretty comfortable", icon: "🌳", span: false },
                    ].map((option, i) => {
                      const isSelected = experience === option.value;
                      return (
                        <div
                          key={option.value}
                          onClick={() => setExperience(option.value)}
                          className={`option-card ${glassCard} ${isSelected ? "selected" : ""} ${option.span ? "col-span-2" : ""}`}
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg, rgba(39,183,200,0.12), rgba(73,176,110,0.08))"
                              : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? "rgba(39,183,200,0.35)" : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? "0 0 25px rgba(39,183,200,0.12), inset 0 1px 0 rgba(255,255,255,0.06)" : "inset 0 1px 0 rgba(255,255,255,0.03)",
                            padding: option.span ? "24px" : "20px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.1}s both` : "none",
                          }}
                        >
                          <div className={`flex items-center gap-4 ${option.span ? "" : "flex-col text-center"}`}>
                            <span className={option.span ? "text-4xl" : "text-3xl"}>{option.icon}</span>
                            <div className={option.span ? "flex-1" : ""}>
                              <p className={`font-semibold text-[#F4F7FA] ${option.span ? "text-lg" : "text-base"}`}>{option.label}</p>
                              <p className={`text-[#F4F7FA]/40 ${option.span ? "text-sm" : "text-xs"} mt-0.5`}>{option.desc}</p>
                            </div>
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
                              style={{
                                background: isSelected ? "linear-gradient(135deg, #49B06E, #27B7C8)" : "rgba(255,255,255,0.06)",
                                border: isSelected ? "none" : "2px solid rgba(255,255,255,0.12)",
                                boxShadow: isSelected ? "0 0 12px rgba(39,183,200,0.4)" : "none",
                              }}
                            >
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#0E1B30]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" onClick={() => goToStep("goals")} className="glass-btn flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>

                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F4F7FA]/30 hover:text-[#F4F7FA]/60 transition-colors py-2">
                    Skip for now →
                  </button>
                </div>
              )}

              {/* ═══════════ GOALS STEP ═══════════ */}
              {step === "goals" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#49B06E]" style={{ background: "rgba(73,176,110,0.1)", border: "1px solid rgba(73,176,110,0.15)" }}>
                      <Target className="w-3.5 h-3.5" /> Choose your goals
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F4F7FA]">
                      What&apos;s your main goal?
                    </h2>
                    <p className="text-[#F4F7FA]/40 text-base">Select all that apply — you can change this later</p>
                  </div>

                  {/* 2x2 Bento grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "grow_wealth" as InvestmentGoal, label: "Grow Wealth", icon: <TrendingUp className="w-7 h-7" />, color: "#49B06E" },
                      { value: "retirement" as InvestmentGoal, label: "Retirement", icon: <Landmark className="w-7 h-7" />, color: "#27B7C8" },
                      { value: "passive_income" as InvestmentGoal, label: "Passive Income", icon: <Wallet className="w-7 h-7" />, color: "#8B5CF6" },
                      { value: "emergency_fund" as InvestmentGoal, label: "Emergency Fund", icon: <Shield className="w-7 h-7" />, color: "#F59E0B" },
                    ].map((option, i) => {
                      const isSelected = goals.includes(option.value);
                      return (
                        <div
                          key={option.value}
                          onClick={() => {
                            setGoals(prev =>
                              prev.includes(option.value)
                                ? prev.filter(g => g !== option.value)
                                : [...prev, option.value]
                            );
                          }}
                          className={`option-card ${glassCard} ${isSelected ? "selected" : ""}`}
                          style={{
                            background: isSelected
                              ? `linear-gradient(135deg, ${option.color}15, ${option.color}08)`
                              : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? `${option.color}50` : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? `0 0 25px ${option.color}18, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
                            padding: "20px",
                            animation: animateIn ? `cardEntrance 0.5s ease-out ${i * 0.08}s both` : "none",
                          }}
                        >
                          <div className="flex flex-col items-center text-center gap-3">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
                              style={{
                                background: isSelected ? `${option.color}20` : "rgba(255,255,255,0.04)",
                                color: isSelected ? option.color : "rgba(244,247,250,0.4)",
                                boxShadow: isSelected ? `0 0 15px ${option.color}20` : "none",
                              }}
                            >
                              {option.icon}
                            </div>
                            <p className="font-semibold text-sm text-[#F4F7FA]">{option.label}</p>
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300"
                              style={{
                                background: isSelected ? `linear-gradient(135deg, ${option.color}, ${option.color}cc)` : "rgba(255,255,255,0.06)",
                                border: isSelected ? "none" : "2px solid rgba(255,255,255,0.12)",
                                boxShadow: isSelected ? `0 0 8px ${option.color}40` : "none",
                              }}
                            >
                              {isSelected && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="#0E1B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => goToStep("risk")}
                    disabled={goals.length === 0}
                    className="glass-btn flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>

                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F4F7FA]/30 hover:text-[#F4F7FA]/60 transition-colors py-2">
                    Skip for now →
                  </button>
                </div>
              )}

              {/* ═══════════ RISK STEP ═══════════ */}
              {step === "risk" && (
                <div className={`space-y-6 ${animateIn ? "step-animate" : "opacity-0"}`}>
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-[#F59E0B]" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.15)" }}>
                      <Flame className="w-3.5 h-3.5" /> Almost done
                    </div>
                    <h2 className="font-serif text-3xl font-bold text-[#F4F7FA]">
                      How do you feel<br />about risk?
                    </h2>
                    <p className="text-[#F4F7FA]/40 text-base">No right answer — just what feels right for you</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { value: "conservative" as RiskTolerance, label: "Conservative", desc: "Steady and safe — protect what I have", icon: "🛡️", color: "#49B06E" },
                      { value: "moderate" as RiskTolerance, label: "Moderate", desc: "Growth without too much drama", icon: "⚖️", color: "#27B7C8" },
                      { value: "aggressive" as RiskTolerance, label: "Aggressive", desc: "Let's grow this — I can handle the ride", icon: "🚀", color: "#F59E0B" },
                    ].map((option, i) => {
                      const isSelected = risk === option.value;
                      return (
                        <div
                          key={option.value}
                          onClick={() => setRisk(option.value)}
                          className={`option-card ${glassCard} ${isSelected ? "selected" : ""}`}
                          style={{
                            background: isSelected
                              ? `linear-gradient(135deg, ${option.color}12, ${option.color}06)`
                              : "rgba(255,255,255,0.03)",
                            borderColor: isSelected ? `${option.color}40` : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? `0 0 25px ${option.color}15, inset 0 1px 0 rgba(255,255,255,0.06)` : "inset 0 1px 0 rgba(255,255,255,0.03)",
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
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shrink-0"
                              style={{
                                background: isSelected ? `linear-gradient(135deg, ${option.color}, ${option.color}cc)` : "rgba(255,255,255,0.06)",
                                border: isSelected ? "none" : "2px solid rgba(255,255,255,0.12)",
                                boxShadow: isSelected ? `0 0 12px ${option.color}40` : "none",
                              }}
                            >
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#0E1B30]" />}
                            </div>
                          </div>
                          {/* Risk meter bar */}
                          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: option.value === "conservative" ? "33%" : option.value === "moderate" ? "66%" : "100%",
                                background: `linear-gradient(90deg, ${option.color}80, ${option.color})`,
                                opacity: isSelected ? 1 : 0.3,
                              }}
                            />
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

                  <button
                    type="button"
                    onClick={handleCompleteOnboarding}
                    disabled={isSubmitting}
                    className="glass-btn flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Setting up your account...</>
                    ) : (
                      <>Complete Setup <Sparkles className="w-5 h-5" /></>
                    )}
                  </button>

                  <button type="button" onClick={handleSkip} className="w-full text-center text-sm text-[#F4F7FA]/30 hover:text-[#F4F7FA]/60 transition-colors py-2">
                    Skip for now →
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
