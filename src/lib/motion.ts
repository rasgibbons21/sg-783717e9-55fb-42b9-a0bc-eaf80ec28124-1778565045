import type { Variants, Transition } from "framer-motion";

// ── Haptic patterns ─────────────────────────────────────────────────────────
export const haptic = {
  tap:     () => { try { navigator?.vibrate?.(6); } catch {} },
  light:   () => { try { navigator?.vibrate?.(3); } catch {} },
  medium:  () => { try { navigator?.vibrate?.(10); } catch {} },
  success: () => { try { navigator?.vibrate?.([8, 60, 12]); } catch {} },
  error:   () => { try { navigator?.vibrate?.([30, 50, 30]); } catch {} },
  bloom:   () => { try { navigator?.vibrate?.([4, 40, 6, 40, 10]); } catch {} },
};

// ── Spring presets ──────────────────────────────────────────────────────────
export const spring = {
  snappy:  { type: "spring", stiffness: 500, damping: 30 } as Transition,
  bouncy:  { type: "spring", stiffness: 400, damping: 18 } as Transition,
  gentle:  { type: "spring", stiffness: 300, damping: 30 } as Transition,
  stiff:   { type: "spring", stiffness: 600, damping: 35 } as Transition,
};

// ── Page transition (for Layout wrapper) ────────────────────────────────────
export const pageVariants: Variants = {
  initial:  { opacity: 0, y: 8 },
  enter:    { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -4 },
};

export const pageTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

// ── Scroll-reveal (whileInView) ─────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

// ── Stagger container + children ────────────────────────────────────────────
export const staggerContainer = (staggerDelay = 0.06): Variants => ({
  hidden:  {},
  visible: { transition: { staggerChildren: staggerDelay } },
});

export const staggerChild: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 28 } },
};

// ── Button micro-interactions ───────────────────────────────────────────────
export const btnTap   = { scale: 0.95 };
export const btnHover = { scale: 1.02, y: -1 };
export const btnGlow  = (color: string) => ({
  scale: 1.03,
  boxShadow: `0 4px 20px ${color}30`,
});

// ── Card interactions ───────────────────────────────────────────────────────
export const cardTap   = { scale: 0.98, y: 1 };
export const cardHover = { y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" };
