import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { userService } from "@/services/userService";

type Step = "welcome" | "experience" | "goals" | "risk";
type ExperienceLevel = "beginner" | "intermediate" | "advanced";
type InvestmentGoal = "grow_wealth" | "retirement" | "passive_income" | "emergency_fund";
type RiskTolerance = "conservative" | "moderate" | "aggressive";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [goals, setGoals] = useState<InvestmentGoal[]>([]);
  const [risk, setRisk] = useState<RiskTolerance>("moderate");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });
    if (error) console.error("Error signing in with Google:", error);
  };

  const handleContinue = async () => {
    if (step === "welcome") {
      setStep("experience");
    } else if (step === "experience") {
      setStep("goals");
    } else if (step === "goals") {
      if (goals.length === 0) return;
      setStep("risk");
    } else if (step === "risk") {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await userService.updateUser(user.id, {
          experience_level: experience,
          investment_goals: goals,
          risk_tolerance: risk,
        });
        router.push("/home");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "welcome" && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center">
              <span className="text-4xl">🌸</span>
            </div>
            
            <h1 className="font-serif text-4xl font-bold text-foreground">
              Bloom
            </h1>
            
            <p className="text-lg text-muted-foreground font-medium">
              Invest in yourself first 🌸
            </p>

            <Card className="p-6 border-accent border-2">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-amber-400 flex items-center justify-center text-3xl flex-shrink-0 animate-pulse">
                  🌺
                </div>
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

            <div className="space-y-3">
              <Button
                onClick={handleContinue}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-12"
              >
                Let's get started
              </Button>
              
              <Button
                onClick={handleSignInWithGoogle}
                variant="outline"
                className="w-full border-border text-foreground font-medium text-base h-12"
              >
                I already have an account
              </Button>
            </div>
          </div>
        )}

        {step === "experience" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                How much do you know about investing?
              </h2>
              <p className="text-muted-foreground">
                No judgment — just helps me personalize your experience
              </p>
            </div>

            <div className="space-y-3">
              {[
                { value: "beginner" as ExperienceLevel, label: "Beginner", desc: "Just getting started" },
                { value: "intermediate" as ExperienceLevel, label: "Intermediate", desc: "Some experience" },
                { value: "advanced" as ExperienceLevel, label: "Advanced", desc: "Pretty comfortable" },
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`p-4 cursor-pointer transition-all ${
                    experience === option.value
                      ? "border-accent border-2 bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => setExperience(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        experience === option.value
                          ? "border-accent bg-accent"
                          : "border-border"
                      }`}
                    >
                      {experience === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleContinue}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
            >
              Continue
            </Button>
          </div>
        )}

        {step === "goals" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                What's your main goal?
              </h2>
              <p className="text-muted-foreground">
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
                  className={`p-4 cursor-pointer transition-all ${
                    goals.includes(option.value)
                      ? "border-accent border-2 bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => {
                    setGoals(prev => 
                      prev.includes(option.value) 
                        ? prev.filter(g => g !== option.value)
                        : [...prev, option.value]
                    );
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <p className="font-semibold text-foreground">{option.label}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        goals.includes(option.value)
                          ? "border-accent bg-accent"
                          : "border-border"
                      }`}
                    >
                      {goals.includes(option.value) && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleContinue}
              disabled={goals.length === 0}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
            >
              Continue
            </Button>
          </div>
        )}

        {step === "risk" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                How do you feel about risk?
              </h2>
              <p className="text-muted-foreground">
                There's no right answer — just what feels right for you
              </p>
            </div>

            <div className="space-y-3">
              {[
                { value: "conservative" as RiskTolerance, label: "Conservative", desc: "Steady and safe" },
                { value: "moderate" as RiskTolerance, label: "Moderate", desc: "Balanced approach" },
                { value: "aggressive" as RiskTolerance, label: "Aggressive", desc: "Higher potential growth" },
              ].map((option) => (
                <Card
                  key={option.value}
                  className={`p-4 cursor-pointer transition-all ${
                    risk === option.value
                      ? "border-accent border-2 bg-accent/5"
                      : "border-border hover:border-accent/50"
                  }`}
                  onClick={() => setRisk(option.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        risk === option.value
                          ? "border-accent bg-accent"
                          : "border-border"
                      }`}
                    >
                      {risk === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
            >
              {isSubmitting ? "Setting up your account..." : "Complete Setup"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}