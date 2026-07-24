import { useState } from "react";
import { getEnabledBrokers, type BrokerConfig } from "@/config/brokers";
import BrokerCard from "./BrokerCard";
import { ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";

type WizardStep = "experience" | "interests" | "amount" | "style" | "results";

interface WizardAnswers {
  experience: string;
  interests: string[];
  amount: string;
  style: string;
}

const STEPS: WizardStep[] = ["experience", "interests", "amount", "style", "results"];

export default function FindMyBrokerWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("experience");
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({});

  const allBrokers = getEnabledBrokers();

  const stepIndex = STEPS.indexOf(currentStep);

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setCurrentStep(STEPS[stepIndex + 1]);
  };

  const goBack = () => {
    if (stepIndex > 0) setCurrentStep(STEPS[stepIndex - 1]);
  };

  const reset = () => {
    setCurrentStep("experience");
    setAnswers({});
  };

  const getMatchedBrokers = (): BrokerConfig[] => {
    let scored = allBrokers.map((broker) => {
      let score = 0;

      if (answers.experience === "Beginner" && broker.beginnerRating >= 4.7) score += 2;
      if (answers.experience === "Advanced" && broker.platforms.length >= 4) score += 2;

      if (answers.interests) {
        const overlap = answers.interests.filter((i) =>
          broker.markets.some((m) => m.toLowerCase().includes(i.toLowerCase()))
          || broker.bestFor.some((b) => b.toLowerCase().includes(i.toLowerCase()))
        );
        score += overlap.length;
      }

      if (answers.amount) {
        const deposit = parseInt(broker.minimumDeposit.replace(/[^0-9]/g, "")) || 0;
        if (answers.amount === "$1 - $100" && deposit <= 5) score += 2;
        if (answers.amount === "$100 - $1,000" && deposit <= 200) score += 1;
        if (answers.amount === "$1,000 - $10,000") score += 1;
        if (answers.amount === "$10,000+") score += 1;
      }

      return { broker, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.broker);
  };

  const selectOption = (field: keyof WizardAnswers, value: string) => {
    setAnswers({ ...answers, [field]: value });
    goNext();
  };

  const toggleInterest = (interest: string) => {
    const current = answers.interests || [];
    if (current.includes(interest)) {
      setAnswers({ ...answers, interests: current.filter((i) => i !== interest) });
    } else {
      setAnswers({ ...answers, interests: [...current, interest] });
    }
  };

  if (currentStep === "results") {
    const matched = getMatchedBrokers();
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Based on your answers, these brokers may suit your goals
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Compare features carefully before deciding. Each broker has strengths suited to different trading styles.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {matched.map((broker) => (
            <BrokerCard key={broker.id} broker={broker} />
          ))}
        </div>

        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex gap-1.5">
        {STEPS.slice(0, -1).map((step, i) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? "bg-primary" : "bg-muted/30"
            }`}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 md:p-8">
        {/* Experience */}
        {currentStep === "experience" && (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              What&apos;s your trading experience?
            </h2>
            <p className="text-sm text-muted-foreground">This helps us show brokers best suited to your level.</p>
            <div className="space-y-2.5">
              {["Beginner", "Intermediate", "Advanced", "Professional"].map((level) => (
                <button
                  key={level}
                  onClick={() => selectOption("experience", level)}
                  className="w-full rounded-xl border border-border/50 bg-muted/20 px-5 py-3.5 text-left text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {currentStep === "interests" && (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              What interests you?
            </h2>
            <p className="text-sm text-muted-foreground">Select all that apply.</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {["Forex", "Stocks", "CFDs", "Crypto", "Commodities", "Indices", "Options", "Passive Investing"].map(
                (interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-all ${
                      answers.interests?.includes(interest)
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border/50 bg-muted/20 text-foreground hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    {interest}
                  </button>
                )
              )}
            </div>
            <button
              onClick={goNext}
              disabled={!answers.interests?.length}
              className="mt-2 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Amount */}
        {currentStep === "amount" && (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              How much are you planning to start with?
            </h2>
            <p className="text-sm text-muted-foreground">This helps filter by minimum deposit requirements.</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {["$1 - $100", "$100 - $1,000", "$1,000 - $10,000", "$10,000+"].map(
                (range) => (
                  <button
                    key={range}
                    onClick={() => selectOption("amount", range)}
                    className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3.5 text-center text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    {range}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Style */}
        {currentStep === "style" && (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              What&apos;s your trading style?
            </h2>
            <p className="text-sm text-muted-foreground">Different brokers cater to different approaches.</p>
            <div className="space-y-2.5">
              {["Long-term Investor", "Swing Trader", "Day Trader", "Active Trader", "Not Sure Yet"].map(
                (style) => (
                  <button
                    key={style}
                    onClick={() => selectOption("style", style)}
                    className="w-full rounded-xl border border-border/50 bg-muted/20 px-5 py-3.5 text-left text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5"
                  >
                    {style}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Back button */}
      {stepIndex > 0 && (
        <button
          onClick={goBack}
          className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
      )}
    </div>
  );
}
