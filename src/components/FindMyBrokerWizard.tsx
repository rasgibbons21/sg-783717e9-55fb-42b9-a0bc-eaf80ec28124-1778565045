import { useState } from "react";
import { getEnabledBrokers, REGION_OPTIONS, type BrokerConfig } from "@/config/brokers";
import BrokerCard from "./BrokerCard";
import { ChevronRight, ChevronLeft, RotateCcw, AlertTriangle } from "lucide-react";

type Step = "region" | "experience" | "interests" | "results";

interface Answers {
  region: string;
  experience: string;
  interests: string[];
}

const STEPS: Step[] = ["region", "experience", "interests", "results"];

interface Props {
  onViewDetail?: (broker: BrokerConfig) => void;
  onCompare?: (broker: BrokerConfig) => void;
  compareIds?: Set<string>;
  savedIds?: Set<string>;
  onToggleSave?: (id: string) => void;
}

export default function FindMyBrokerWizard({
  onViewDetail,
  onCompare,
  compareIds,
  savedIds,
  onToggleSave,
}: Props) {
  const [step, setStep] = useState<Step>("region");
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const allBrokers = getEnabledBrokers();
  const idx = STEPS.indexOf(step);

  const goNext = () => { if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]); };
  const goBack = () => { if (idx > 0) setStep(STEPS[idx - 1]); };
  const reset = () => { setStep("region"); setAnswers({}); };
  const pick = (field: keyof Answers, value: string) => { setAnswers({ ...answers, [field]: value }); goNext(); };

  const toggle = (interest: string) => {
    const cur = answers.interests || [];
    setAnswers({
      ...answers,
      interests: cur.includes(interest) ? cur.filter((i) => i !== interest) : [...cur, interest],
    });
  };

  const getMatched = (): BrokerConfig[] => {
    const scored = allBrokers.map((broker) => {
      let score = 0;

      // Region match
      if (answers.region) {
        if (broker.regions.includes("Global") || broker.regions.includes(answers.region)) {
          score += 3;
        } else {
          score -= 5;
        }
      }

      // Experience
      if (answers.experience === "Beginner" && broker.beginnerFriendly) score += 3;
      if (answers.experience === "Beginner" && broker.educationLevel === "strong") score += 1;
      if (answers.experience === "Advanced" && !broker.beginnerFriendly) score += 2;
      if (answers.experience === "Advanced" && broker.platforms && broker.platforms.length >= 4) score += 1;

      // Interest matching
      if (answers.interests) {
        score += answers.interests.filter((i) =>
          broker.markets.some((m) => m.toLowerCase().includes(i.toLowerCase()))
          || broker.bestFor.some((b) => b.toLowerCase().includes(i.toLowerCase()))
        ).length * 2;
      }

      // Demo preference for beginners
      if (answers.experience === "Beginner" && broker.paperTrading) score += 1;

      return { broker, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.filter((s) => s.score > 0).map((s) => s.broker);
  };

  if (step === "results") {
    const matched = getMatched();
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Based on your answers, these platforms may match the features you selected
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This is not financial advice. Compare features, terms, and regional availability on each provider&apos;s website before opening an account.
          </p>
        </div>

        <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive/80 leading-relaxed">
              Regional availability varies. Verify that the provider operates in your country before signing up.
            </p>
          </div>
        </div>

        {matched.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {matched.map((broker) => (
              <BrokerCard
                key={broker.id}
                broker={broker}
                isSaved={savedIds?.has(broker.id)}
                onToggleSave={onToggleSave}
                onCompare={onCompare}
                isInCompare={compareIds?.has(broker.id)}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No exact matches found. Try broadening your selections.</p>
          </div>
        )}

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

  const GridBtn = ({ label, onClick, selected }: { label: string; onClick: () => void; selected?: boolean }) => (
    <button
      onClick={onClick}
      className={`rounded-xl border px-4 py-3.5 text-center text-sm font-semibold transition-all ${
        selected
          ? "border-primary bg-primary/15 text-primary"
          : "border-border/50 bg-muted/20 text-foreground hover:border-primary/50 hover:bg-primary/5"
      }`}
    >
      {label}
    </button>
  );

  const OptionBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-border/50 bg-muted/20 px-5 py-3.5 text-left text-sm font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5"
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex gap-1.5">
        {STEPS.slice(0, -1).map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${i <= idx ? "bg-primary" : "bg-muted/30"}`} />
        ))}
      </div>

      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 md:p-8">
        {step === "region" && (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Where are you located?</h2>
            <p className="text-sm text-muted-foreground">Availability varies by region.</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {REGION_OPTIONS.map((r) => (
                <GridBtn key={r.value} label={r.label} onClick={() => pick("region", r.value)} />
              ))}
            </div>
          </div>
        )}

        {step === "experience" && (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">What&apos;s your experience level?</h2>
            <p className="text-sm text-muted-foreground">This helps us show platforms suited to your level.</p>
            <div className="space-y-2.5">
              {["Beginner", "Intermediate", "Advanced"].map((l) => (
                <OptionBtn key={l} label={l} onClick={() => pick("experience", l)} />
              ))}
            </div>
          </div>
        )}

        {step === "interests" && (
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">What interests you?</h2>
            <p className="text-sm text-muted-foreground">Select all that apply.</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {["Stocks", "ETFs", "Forex", "CFDs", "Options", "Futures", "Crypto", "Charting"].map((i) => (
                <GridBtn
                  key={i}
                  label={i}
                  selected={answers.interests?.includes(i)}
                  onClick={() => toggle(i)}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              disabled={!answers.interests?.length}
              className="mt-2 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              See Results <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {idx > 0 && (
        <button
          onClick={goBack}
          className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      )}
    </div>
  );
}
