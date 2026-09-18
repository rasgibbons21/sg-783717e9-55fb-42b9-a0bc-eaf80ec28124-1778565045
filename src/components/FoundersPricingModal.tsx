import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Shield, Clock, Check } from "lucide-react";
import { FOUNDERS_PLAN } from "@/config/proPlan";
import { useSubscription } from "@/contexts/SubscriptionContext";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

function getCountdown(): { days: number; hours: number; minutes: number; seconds: number } {
  const diff = getEndOfMonth().getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

const DISMISS_KEY = "bloom_founders_dismissed";

function wasDismissedToday(): boolean {
  try {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) return false;
    const date = new Date(stored);
    const now = new Date();
    return date.toDateString() === now.toDateString();
  } catch { return false; }
}

export function FoundersPricingModal() {
  const router = useRouter();
  const { isPro, isLoading, isLoggedIn } = useSubscription();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    if (isLoading) return;
    if (isPro) return;
    if (wasDismissedToday()) return;

    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [isLoading, isPro]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, [visible]);

  const dismiss = () => {
    haptic();
    setVisible(false);
    try { localStorage.setItem(DISMISS_KEY, new Date().toISOString()); } catch {}
  };

  const goToSubscription = () => {
    haptic(12);
    setVisible(false);
    router.push("/subscription");
  };

  const { monthlyPrice, yearlyPrice, lifetimePrice, regularMonthlyPrice, regularYearlyPrice, regularLifetimePrice } = FOUNDERS_PLAN;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-3xl overflow-hidden"
            style={{ background: "linear-gradient(180deg, #0E1B30, #162540)" }}
          >
            {/* Glow header */}
            <div className="relative px-6 pt-6 pb-4">
              <div
                className="absolute inset-x-0 top-0 h-32 opacity-30"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(39,183,200,0.4), transparent 70%)" }}
              />
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <X className="w-4 h-4 text-[#F4F7FA]/50" />
              </button>

              <div className="relative text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.2), rgba(73,176,110,0.2))", border: "1px solid rgba(39,183,200,0.3)" }}
                >
                  <span className="text-3xl">🌸</span>
                </motion.div>
                <h2 className="text-xl font-bold text-[#F4F7FA] mb-1">Founders Price</h2>
                <p className="text-xs text-[#F4F7FA]/50">Lock in the lowest price Bloom will ever be</p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="px-6 mb-4">
              <div
                className="rounded-xl p-3 flex items-center justify-center gap-1"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
              >
                <Clock className="w-3.5 h-3.5 text-[#F59E0B] mr-1.5" />
                <span className="text-xs font-semibold text-[#F59E0B]">Ends in</span>
                {[
                  { value: countdown.days, label: "d" },
                  { value: countdown.hours, label: "h" },
                  { value: countdown.minutes, label: "m" },
                  { value: countdown.seconds, label: "s" },
                ].map(({ value, label }, i) => (
                  <span key={i} className="flex items-baseline gap-0.5">
                    <span className="text-sm font-bold text-[#F4F7FA] tabular-nums w-5 text-center">{String(value).padStart(2, "0")}</span>
                    <span className="text-[10px] text-[#F4F7FA]/30">{label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing cards */}
            <div className="px-6 space-y-2 mb-4">
              {/* Monthly */}
              <div
                className="flex items-center justify-between rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div>
                  <span className="text-sm font-semibold text-[#F4F7FA]">Monthly</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#27B7C8]">${monthlyPrice}</span>
                    <span className="text-xs text-[#F4F7FA]/30">/mo</span>
                    <span className="text-xs text-[#F4F7FA]/30 line-through">${regularMonthlyPrice}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(73,176,110,0.15)", color: "#49B06E" }}>
                  SAVE 50%
                </span>
              </div>

              {/* Yearly — highlighted */}
              <div
                className="flex items-center justify-between rounded-xl p-3 relative"
                style={{ background: "rgba(39,183,200,0.06)", border: "1px solid rgba(39,183,200,0.2)" }}
              >
                <div
                  className="absolute -top-2 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: "#27B7C8", color: "#0E1B30" }}
                >
                  Most Popular
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#F4F7FA]">Yearly</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#27B7C8]">${yearlyPrice}</span>
                    <span className="text-xs text-[#F4F7FA]/30">/yr</span>
                    <span className="text-xs text-[#F4F7FA]/30 line-through">${regularYearlyPrice}</span>
                  </div>
                  <span className="text-[10px] text-[#F4F7FA]/40">${(yearlyPrice / 12).toFixed(2)}/mo</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(73,176,110,0.15)", color: "#49B06E" }}>
                  SAVE 50%
                </span>
              </div>

              {/* Lifetime */}
              <div
                className="flex items-center justify-between rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div>
                  <span className="text-sm font-semibold text-[#F4F7FA]">Lifetime</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#27B7C8]">${lifetimePrice}</span>
                    <span className="text-xs text-[#F4F7FA]/30">one-time</span>
                    <span className="text-xs text-[#F4F7FA]/30 line-through">${regularLifetimePrice}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(73,176,110,0.15)", color: "#49B06E" }}>
                  SAVE 53%
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="px-6 mb-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {[
                  "AI trading signals",
                  "Crypto scanner",
                  "TradingView charts",
                  "Pansy AI analyst",
                  "Paper trader",
                  "150+ lessons",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-[#49B06E]" />
                    <span className="text-[11px] text-[#F4F7FA]/60">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-6 space-y-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={goToSubscription}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-colors"
                style={{
                  background: "linear-gradient(135deg, #27B7C8, #49B06E)",
                  color: "#0E1B30",
                }}
              >
                <Zap className="w-4 h-4 inline mr-1.5" />
                Claim Founders Price
              </motion.button>
              <button
                onClick={dismiss}
                className="w-full py-2 text-xs text-[#F4F7FA]/30 hover:text-[#F4F7FA]/50 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
