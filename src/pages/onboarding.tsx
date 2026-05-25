/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Loader2 } from "lucide-react";

type Step = "auth" | "experience" | "goals" | "risk";
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
  const [error, setError] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const submitLock = useRef(false);

  const handleAuth = async () => {
    if (submitLock.current) {
      console.log("🔒 Auth submission blocked: already processing");
      return;
    }
    
    submitLock.current = true;
    setError("");
    setIsSubmitting(true);

    try {
      // Basic validation
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

      // At this point, authMode is either "signup" or "login" (forgot was handled above)
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
          setStep("experience");
          submitLock.current = false;
          setIsSubmitting(false);
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
          // Do not release lock here, let it transition to /home
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

  const handleCompleteOnboarding = async () => {
    if (submitLock.current) {
      console.log("🔒 Onboarding completion blocked: already processing");
      return;
    }
    submitLock.current = true;
    
    console.log("=== ONBOARDING COMPLETION START ===");
    console.log("1. Current form values:", { experience, goals, risk });
    
    setIsSubmitting(true);
    setError("");

    try {
      const currentUser = await authService.getCurrentUser();
      console.log("2. Current auth user:", currentUser);
      
      if (!currentUser) {
        console.warn("No user found. Redirecting to home to re-verify session.");
        router.push("/home");
        return;
      }

      const experienceCapitalized = experience.charAt(0).toUpperCase() + experience.slice(1);
      const riskCapitalized = risk.charAt(0).toUpperCase() + risk.slice(1);

      const updates = {
        experience_level: experienceCapitalized,
        investment_goals: goals,
        risk_tolerance: riskCapitalized,
      };

      console.log("3. Prepared database updates:", updates);

      const saveToDatabase = async () => {
        console.log("4. Attempting to update existing user profile...");
        let result = await userService.updateUser(currentUser.id, updates);
        
        console.log("5. Update result:", result ? "Success" : "Failed");

        if (!result) {
          console.log("6. Update failed. Attempting to CREATE new user profile instead...");
          
          const profileData = {
            id: currentUser.id,
            email: currentUser.email || email,
            full_name: currentUser.user_metadata?.full_name || fullName,
            plan_type: "free" as const,
            ...updates
          };
          
          result = await userService.createUserProfile(profileData);
          console.log("7. Create profile result:", result ? "Success" : "Failed");
          
          if (!result) {
            console.warn("8. Profile creation also failed. Proceeding anyway.");
          }
        }
        return result;
      };

      // 5-second timeout safeguard
      console.log("9. Starting 5-second timeout race...");
      await Promise.race([
        saveToDatabase(),
        new Promise((resolve) => setTimeout(() => {
          console.warn("⏱️ TIMEOUT: Supabase save took longer than 5 seconds! Bypassing lock.");
          resolve(true);
        }, 5000))
      ]);

      console.log("=== ONBOARDING COMPLETED SUCCESSFULLY ===");
      console.log("10. Redirecting to /home");
      
      // Keep locked during redirect
      router.push("/home");
    } catch (error: any) {
      console.error("=== ONBOARDING ERROR ===");
      console.error("Error:", error);
      console.warn("Bypassing error and forcing redirect to /home");
      
      // Keep locked during redirect
      router.push("/home");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "auth" && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <img
                src="/bloom-logo.png"
                alt="Bloom Logo"
                className="w-24 h-24 mx-auto rounded-full object-cover"
              />
              
              <h1 className="font-serif text-5xl font-bold text-foreground">
                Bloom
              </h1>
              
              <p className="text-xl text-muted-foreground font-medium">
                Invest in yourself first 🌸
              </p>
            </div>

            {/* Pansy's Intro Card */}
            <Card className="border-accent bg-gradient-to-br from-accent/20 to-background p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-3xl shadow-lg">
                  🌺
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="mb-1 font-serif text-xl font-semibold text-primary">
                      Hi! I'm Pansy
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Bloom's Investing Expert
                    </p>
                  </div>
                  <p className="leading-relaxed text-foreground">
                    I know everything about investing and I'm going to break it
                    all down for you in a way that actually makes sense. No
                    confusing terms, no pressure. Just real talk about your money
                    💛
                  </p>
                </div>
              </div>
            </Card>

            {/* Terms & Privacy Checkbox */}
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-foreground">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-primary underline hover:text-primary/80">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-primary underline hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border rounded-2xl">
              <div className="space-y-4">
                {authMode !== "forgot" && (
                  <div className="flex gap-2 p-1 bg-muted rounded-xl">
                    <Button
                      type="button"
                      variant={authMode === "signup" ? "default" : "ghost"}
                      className="flex-1 rounded-lg"
                      onClick={() => {
                        setAuthMode("signup");
                        setResetEmailSent(false);
                        setError("");
                      }}
                    >
                      Sign Up
                    </Button>
                    <Button
                      type="button"
                      variant={authMode === "login" ? "default" : "ghost"}
                      className="flex-1 rounded-lg"
                      onClick={() => {
                        setAuthMode("login");
                        setResetEmailSent(false);
                        setError("");
                      }}
                    >
                      Log In
                    </Button>
                  </div>
                )}

                {authMode === "forgot" && !resetEmailSent && (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="mb-2"
                      onClick={() => {
                        setAuthMode("login");
                        setResetEmailSent(false);
                        setError("");
                      }}
                    >
                      ← Back to Log In
                    </Button>
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      Reset Your Password
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your email and we'll send you instructions to reset your password.
                    </p>
                  </div>
                )}

                {authMode === "forgot" && resetEmailSent ? (
                  <div className="space-y-4 py-4">
                    <div className="w-16 h-16 rounded-full bg-accent/20 mx-auto flex items-center justify-center">
                      <span className="text-3xl">📧</span>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="font-serif text-xl font-bold text-foreground">
                        Check Your Email
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We've sent password reset instructions to <strong>{email}</strong>. 
                        Check your inbox (and spam folder just in case) 💛
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setResetEmailSent(false);
                        setEmail("");
                      }}
                      className="w-full rounded-xl"
                    >
                      Back to Log In
                    </Button>
                  </div>
                ) : (
                  <>
                    {authMode === "signup" && (
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Jane Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={isSubmitting}
                          className="bg-popover border-border rounded-xl"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className="bg-popover border-border rounded-xl"
                      />
                    </div>

                    {authMode !== "forgot" && (
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isSubmitting}
                          className="bg-popover border-border rounded-xl"
                        />
                      </div>
                    )}

                    {authMode === "login" && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("forgot");
                            setError("");
                          }}
                          className="text-sm text-accent hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {error && (
                      <Card className="p-4 bg-destructive/10 border-destructive rounded-xl">
                        <p className="text-sm text-destructive font-medium">{error}</p>
                      </Card>
                    )}

                    <Button
                      type="button"
                      onClick={handleAuth}
                      disabled={
                        isSubmitting || 
                        !email || 
                        (authMode !== "forgot" && !password) || 
                        (authMode === "signup" && !fullName) ||
                        (authMode === "signup" && !termsAccepted)
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-xl"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                      ) : authMode === "signup" ? (
                        "Create Account"
                      ) : authMode === "login" ? (
                        "Log In"
                      ) : (
                        "Send Reset Instructions"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}

        {step === "experience" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-serif text-4xl font-bold text-foreground">
                How much do you know about investing?
              </h2>
              <p className="text-muted-foreground text-lg">
                No judgment — just helps me personalize your experience
              </p>
            </div>

            <div className="space-y-3">
              {[
                { value: "beginner" as ExperienceLevel, label: "Beginner", desc: "Just getting started", icon: "🌱" },
                { value: "intermediate" as ExperienceLevel, label: "Intermediate", desc: "Some experience", icon: "🌿" },
                { value: "advanced" as ExperienceLevel, label: "Advanced", desc: "Pretty comfortable", icon: "🌳" },
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`p-5 cursor-pointer transition-all rounded-2xl ${
                    experience === option.value
                      ? "border-primary border-2 bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                  onClick={() => setExperience(option.value)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        experience === option.value
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {experience === option.value && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              type="button"
              onClick={() => setStep("goals")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-xl"
            >
              Continue
            </Button>
          </div>
        )}

        {step === "goals" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-serif text-4xl font-bold text-foreground">
                What's your main goal?
              </h2>
              <p className="text-muted-foreground text-lg">
                You can always change this later
              </p>
            </div>

            <div className="space-y-3">
              {[
                { value: "grow_wealth" as InvestmentGoal, label: "Grow My Wealth", icon: "📈" },
                { value: "retirement" as InvestmentGoal, label: "Save for Retirement", icon: "🏝️" },
                { value: "passive_income" as InvestmentGoal, label: "Generate Passive Income", icon: "💰" },
                { value: "emergency_fund" as InvestmentGoal, label: "Build an Emergency Fund", icon: "🛡️" },
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`p-5 cursor-pointer transition-all rounded-2xl ${
                    goals.includes(option.value)
                      ? "border-primary border-2 bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                  onClick={() => {
                    setGoals(prev => 
                      prev.includes(option.value) 
                        ? prev.filter(g => g !== option.value)
                        : [...prev, option.value]
                    );
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <p className="font-semibold text-lg text-foreground flex-1">{option.label}</p>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        goals.includes(option.value)
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {goals.includes(option.value) && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              type="button"
              onClick={() => setStep("risk")}
              disabled={goals.length === 0}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-xl"
            >
              Continue
            </Button>
          </div>
        )}

        {step === "risk" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-serif text-4xl font-bold text-foreground">
                How do you feel about risk?
              </h2>
              <p className="text-muted-foreground text-lg">
                There's no right answer — just what feels right for you
              </p>
            </div>

            <div className="space-y-3">
              {[
                { value: "conservative" as RiskTolerance, label: "Conservative", desc: "Steady and safe, I want to protect what I have", icon: "🌱" },
                { value: "moderate" as RiskTolerance, label: "Moderate", desc: "I want growth but not too much drama", icon: "🌿" },
                { value: "aggressive" as RiskTolerance, label: "Aggressive", desc: "Let's grow this money, I can handle the ride", icon: "🌸" },
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`p-5 cursor-pointer transition-all rounded-2xl ${
                    risk === option.value
                      ? "border-primary border-2 bg-primary/5"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                  onClick={() => setRisk(option.value)}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-foreground mb-1">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        risk === option.value
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {risk === option.value && (
                        <div className="w-3 h-3 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {error && (
              <Card className="p-4 border-rose bg-rose/5 rounded-2xl">
                <p className="text-sm text-rose">{error}</p>
              </Card>
            )}

            <Button
              type="button"
              onClick={handleCompleteOnboarding}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 rounded-xl"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up your account...</>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}