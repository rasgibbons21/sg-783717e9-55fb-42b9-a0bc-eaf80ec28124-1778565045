import { useEffect, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** A number that counts up to its value with a gentle ease-out, or shows it at once when motion is reduced. */
export function CountUp({ value, format, durationMs = 600 }: { value: number; format: (n: number) => string; durationMs?: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(0);

  useEffect(() => {
    if (prefersReducedMotion() || durationMs <= 0) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = from.current;
    const began = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - began) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(start + (value - start) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <span aria-label={format(value)}>{format(shown)}</span>;
}
