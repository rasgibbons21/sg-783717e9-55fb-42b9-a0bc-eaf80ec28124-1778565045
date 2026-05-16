import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const handleAuth = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      if (authMode === "forgot") {
        const { error: resetError } = await authService.resetPassword(email);
        
        if (resetError) {
          setError(resetError.message);
          setIsSubmitting(false);
          return;
        }

        setResetEmailSent(true);
        setIsSubmitting(false);
        return;
      }

      if (authMode === "signup") {
        if (!fullName.trim()) {
          setError("Please enter your full name");
          setIsSubmitting(false);
          return;
        }

        const { user, error: signupError } = await authService.signUp(email, password, fullName);
        
        if (signupError) {
          setError(signupError.message);
          setIsSubmitting(false);
          return;
        }

        if (user) {
          await userService.updateUser(user.id, { full_name: fullName });
          setStep("experience");
        }
      } else {
        const { user, error: loginError } = await authService.signIn(email, password);
        
        if (loginError) {
          setError(loginError.message);
          setIsSubmitting(false);
          return;
        }

        if (user) {
          router.push("/home");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    console.log("=== ONBOARDING COMPLETION START ===");
    console.log("Current values:", { experience, goals, risk });
    
    setIsSubmitting(true);
    setError("");

    try {
      const currentUser = await authService.getCurrentUser();
      console.log("Current auth user:", currentUser);
      
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const experienceCapitalized = experience.charAt(0).toUpperCase() + experience.slice(1);
      const riskCapitalized = risk.charAt(0).toUpperCase() + risk.slice(1);

      const updates = {
        experience_level: experienceCapitalized,
        investment_goals: goals,
        risk_tolerance: riskCapitalized,
      };

      console.log("Attempting to update user with:", updates);

      let result = await userService.updateUser(currentUser.id, updates);
      
      console.log("Update result:", result);

      if (!result) {
        console.log("Update failed - attempting to create user profile");
        
        const profileData = {
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || "",
          plan_type: "free" as const,
          ...updates
        };
        
        console.log("Creating profile with:", profileData);
        
        result = await userService.createUserProfile(profileData);
        console.log("Create profile result:", result);
        
        if (!result) {
          throw new Error("Failed to create user profile. Please check your database connection.");
        }
      }

      console.log("=== ONBOARDING COMPLETED SUCCESSFULLY ===");
      console.log("Redirecting to /home");
      
      router.push("/home");
    } catch (error: any) {
      console.error("=== ONBOARDING ERROR ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Full error:", error);
      
      setError(
        error.message || 
        "Failed to save your preferences. Please try refreshing the page and trying again."
      );
      setIsSubmitting(false);
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

            <Card className="p-6 bg-gradient-to-br from-accent/20 to-accent/5 border-accent rounded-2xl">
              <div className="flex gap-4">
                <img
                  src="/bloom-logo.png"
                  alt="Dahlia"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 text-left">
                  <p className="font-serif text-lg font-semibold text-foreground mb-2">
                    Hi I'm Dahlia
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    I know everything about investing and I'm going to break it all down for you in a way that actually makes sense. No confusing terms, no pressure. Just real talk about your money 💛
                  </p>
                </div>
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
                      <p className="text-sm text-rose">{error}</p>
                    )}

                    <Button
                      onClick={handleAuth}
                      disabled={
                        isSubmitting || 
                        !email || 
                        (authMode !== "forgot" && !password) || 
                        (authMode === "signup" && !fullName)
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