import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ChevronRight, AlertTriangle, BarChart3 } from "lucide-react";
import DynamicChart from "./DynamicChart";
import type { ChartExercise } from "@/data/strategy-lab/types";

interface Props {
  exercise: ChartExercise;
  onComplete?: (correct: boolean) => void;
}

export function StrategyChartLesson({ exercise, onComplete }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = selected !== null && exercise.options?.[selected]?.correct === true;

  const handleSubmit = useCallback(() => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    setShowExplanation(true);
    onComplete?.(exercise.options?.[selected]?.correct === true);
  }, [selected, submitted, exercise.options, onComplete]);

  const correctIndex = exercise.options?.findIndex((o) => o.correct) ?? -1;

  return (
    <div className="bg-[#16264A] rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0E1B30] border-b border-white/5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#27B7C8]" />
          <h3 className="text-sm font-semibold text-white">{exercise.title}</h3>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#27B7C8]/10 text-[#27B7C8]">
            {exercise.type === "spot_setup" ? "Spot the Setup" :
             exercise.type === "build_trade" ? "Build the Trade" :
             exercise.type === "good_vs_bad" ? "Good vs Bad" : "Scorecard"}
          </span>
        </div>
      </div>

      {/* Instruction */}
      <div className="px-4 py-3 border-b border-white/5">
        <p className="text-xs text-[#F4F7FA]/70 leading-relaxed">{exercise.instruction}</p>
      </div>

      {/* Chart */}
      <div className="px-2 py-2">
        <DynamicChart data={exercise.chartData} height={220} />
      </div>

      {/* Educational disclaimer */}
      <div className="px-4 py-1.5 flex items-center gap-1.5 border-t border-white/5">
        <AlertTriangle className="w-3 h-3 text-amber-400/50 shrink-0" />
        <p className="text-[9px] text-white/25">
          Hypothetical educational example — simulated data for learning purposes only. Not financial advice.
        </p>
      </div>

      {/* Question */}
      {exercise.question && (
        <div className="px-4 py-3 border-t border-white/5">
          <p className="text-sm font-medium text-white mb-3">{exercise.question}</p>

          <div className="space-y-2">
            {exercise.options?.map((option, i) => {
              let borderColor = "border-white/10";
              let bgColor = "bg-transparent";
              let icon = null;

              if (submitted) {
                if (i === correctIndex) {
                  borderColor = "border-[#49B06E]/50";
                  bgColor = "bg-[#49B06E]/5";
                  icon = <CheckCircle className="w-4 h-4 text-[#49B06E] shrink-0" />;
                } else if (i === selected && !isCorrect) {
                  borderColor = "border-red-400/50";
                  bgColor = "bg-red-400/5";
                  icon = <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
                }
              } else if (i === selected) {
                borderColor = "border-[#27B7C8]/50";
                bgColor = "bg-[#27B7C8]/5";
              }

              return (
                <button
                  key={i}
                  onClick={() => !submitted && setSelected(i)}
                  disabled={submitted}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border ${borderColor} ${bgColor} transition-all text-xs text-[#F4F7FA]/80 hover:border-[#27B7C8]/30 disabled:cursor-default flex items-center gap-2`}
                >
                  {icon}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className="mt-3 w-full py-2.5 rounded-lg bg-[#27B7C8] text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#27B7C8]/90 transition-colors flex items-center justify-center gap-1.5"
            >
              Check Answer
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && selected !== null && exercise.options?.[selected] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`mx-4 mb-4 p-3 rounded-lg border ${isCorrect ? "border-[#49B06E]/20 bg-[#49B06E]/5" : "border-red-400/20 bg-red-400/5"}`}>
              <p className={`text-xs font-medium mb-1 ${isCorrect ? "text-[#49B06E]" : "text-red-400"}`}>
                {isCorrect ? "Correct!" : "Not quite."}
              </p>
              <p className="text-xs text-[#F4F7FA]/60 leading-relaxed">
                {exercise.options[selected].explanation}
              </p>
            </div>

            {/* Pansy explanation */}
            {exercise.pansyExplanation && (
              <div className="mx-4 mb-4 p-3 rounded-lg border border-[#27B7C8]/10 bg-[#27B7C8]/5">
                <div className="flex items-start gap-2">
                  <span className="text-sm">🌸</span>
                  <p className="text-xs text-[#F4F7FA]/70 leading-relaxed italic">
                    {exercise.pansyExplanation}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
