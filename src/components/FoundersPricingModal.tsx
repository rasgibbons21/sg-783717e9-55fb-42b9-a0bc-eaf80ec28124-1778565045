import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Check } from "lucide-react";
import { FOUNDERS_PLAN } from "@/config/proPlan";
import { useSubscription } from "@/contexts/SubscriptionContext";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

function getCountdown() {
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
    return new Date(stored).toDateString() === new Date().toDateString();
  } catch { return false; }
}

type BillingCycle = "yearly" | "monthly" | "lifetime";

export function FoundersPricingModal() {
  const router = useRouter();
  const { isPro, isLoading } = useSubscription();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown());
  const [selected, setSelected] = useState<BillingCycle>("yearly");

  useEffect(() => {
    if (isLoading || isPro || wasDismissedToday()) return;
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
  const yearlySavings = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  const plans: { key: BillingCycle; label: string; price: string; period: string; badge?: string; note?: string; regular: number }[] = [
    {
      key: "yearly",
      label: "Annual",
      price: `$${(yearlyPrice / 12).toFixed(2)}`,
      period: "/mo",
      badge: "Best Value",
      note: `Billed $${yearlyPrice}/yr`,
      regular: regularYearlyPrice,
    },
    {
      key: "monthly",
      label: "Monthly",
      price: `$${monthlyPrice}`,
      period: "/mo",
      regular: regularMonthlyPrice,
    },
    {
      key: "lifetime",
      label: "Lifetime",
      price: `$${lifetimePrice}`,
      period: " once",
      regular: regularLifetimePrice,
    },
  ];

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
            style={{ background: "linear-gradient(180deg, #0C1016, #121821)" }}
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-3">
              <div
                className="absolute inset-x-0 top-0 h-32 opacity-30"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(39,183,200,0.4), transparent 70%)" }}
              />
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <X className="w-4 h-4 text-[#F3EDE3]/50" />
              </button>

              <div className="relative text-center">
                <h2 className="text-xl font-bold text-[#F3EDE3] mb-1">Unlock Radar Core</h2>
                <p className="text-xs text-[#F3EDE3]/50">Founders pricing — lock it in before it&apos;s gone</p>
              </div>
            </div>

            {/* 3 check rows */}
            <div className="px-6 mb-4 space-y-2">
              {[
                "Stock screener — strategies scored 0–100",
                "Pansy AI analyst — entries, stops & targets",
                "Price alerts & 24/7 market briefings",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#27B7C8] flex-shrink-0" />
                  <span className="text-[13px] text-[#F3EDE3]/80">{f}</span>
                </div>
              ))}
            </div>

            {/* Radio cards */}
            <div className="px-6 space-y-2 mb-3">
              {plans.map((plan) => {
                const isSelected = selected === plan.key;
                return (
                  <motion.button
                    key={plan.key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { haptic(); setSelected(plan.key); }}
                    className="w-full flex items-center justify-between rounded-xl p-3.5 relative transition-all"
                    style={{
                      background: isSelected ? "rgba(39,183,200,0.08)" : "rgba(255,255,255,0.03)",
                      border: isSelected ? "2px solid #27B7C8" : "2px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {plan.badge && (
                      <div
                        className="absolute -top-2 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: "#27B7C8", color: "#07080C" }}
                      >
                        {plan.badge}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: isSelected ? "#27B7C8" : "rgba(255,255,255,0.15)" }}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#27B7C8" }} />
                        )}
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-semibold text-[#F3EDE3]">{plan.label}</span>
                        {plan.note && <div className="text-[10px] text-[#F3EDE3]/35">{plan.note}</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-lg font-bold text-[#27B7C8]">{plan.price}</span>
                        <span className="text-[11px] text-[#F3EDE3]/30">{plan.period}</span>
                      </div>
                      <span className="text-[10px] text-[#F3EDE3]/25 line-through">${plan.regular}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Savings pill */}
            <div className="px-6 mb-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: "rgba(73,176,110,0.1)", color: "#49B06E", border: "1px solid rgba(73,176,110,0.2)" }}>
                ${(yearlyPrice / 12).toFixed(2)}/mo on annual saves ${((monthlyPrice * 12) - yearlyPrice).toFixed(0)} a year
              </span>
            </div>

            {/* Countdown */}
            <div className="px-6 mb-4">
              <div
                className="rounded-xl p-2.5 flex items-center justify-center gap-1"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
              >
                <Clock className="w-3 h-3 text-[#F59E0B] mr-1" />
                <span className="text-[11px] font-semibold text-[#F59E0B]">Ends in</span>
                {[
                  { value: countdown.days, label: "d" },
                  { value: countdown.hours, label: "h" },
                  { value: countdown.minutes, label: "m" },
                  { value: countdown.seconds, label: "s" },
                ].map(({ value, label }, i) => (
                  <span key={i} className="flex items-baseline gap-0.5">
                    <span className="text-sm font-bold text-[#F3EDE3] tabular-nums w-5 text-center">{String(value).padStart(2, "0")}</span>
                    <span className="text-[10px] text-[#F3EDE3]/30">{label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-4 space-y-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={goToSubscription}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition-colors"
                style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)", color: "#07080C" }}
              >
                Subscribe to Radar Core
              </motion.button>
              <button
                onClick={dismiss}
                className="w-full py-2 text-xs text-[#F3EDE3]/30 hover:text-[#F3EDE3]/50 transition-colors"
              >
                Maybe later
              </button>
            </div>

            {/* Fine print */}
            <div className="px-6 pb-5">
              <p className="text-[9px] text-center text-[#F3EDE3]/20 leading-relaxed">
                Educational decision support only. Not financial advice. Works on web + Android. Cancel before renewal to avoid charges.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
