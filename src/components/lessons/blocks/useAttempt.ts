import { useRef, useState } from "react";

/**
 * Shared answer state for interactive blocks: whether it's solved, whether the last try
 * missed, and a check function that reports back on the first correct answer only.
 */
export function useAttempt(onAnswered: (firstTry: boolean) => void) {
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const tries = useRef(0);
  const solved = result === "right";

  const check = (correct: boolean) => {
    if (solved) return;
    tries.current += 1;
    setResult(correct ? "right" : "wrong");
    if (correct) onAnswered(tries.current === 1);
  };

  return { result, solved, check, reset: () => !solved && setResult(null) };
}
