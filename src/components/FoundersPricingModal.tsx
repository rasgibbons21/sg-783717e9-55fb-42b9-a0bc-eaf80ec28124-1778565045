import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { DESK_PLAN, PRO_PLAN } from "@/config/proPlan";
import { useSubscription } from "@/contexts/SubscriptionContext";

const haptic = (ms = 8) => { try { navigator?.vibrate?.(ms); } catch {} };

const DISMISS_KEY = "radar_upgrade_dismissed";

function wasDismissedToday(): boolean {
  try {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) return false;
    return new Date(stored).toDateString() === new Date().toDateString();
  } catch { return false; }
}

export function FoundersPricingModal() {
  const router = useRouter();
  const { isPaid, isLoading } = useSubscription();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading || isPaid || wasDismissedToday()) return;
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [isLoading, isPaid]);

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
            <div className="relative px-6 pt-6 pb-3">
              <div className="absolute inset-x-0 top-0 h-32 opacity-30"
                style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(39,183,200,0.4), transparent 70%)" }} />
              <button onClick={dismiss}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <X className="w-4 h-4 text-[#F3EDE3]/50" />
              </button>
              <div className="relative text-center">
                <h2 className="text-xl font-bold text-[#F3EDE3] mb-1">Upgrade Your Desk</h2>
                <p className="text-xs text-[#F3EDE3]/50">See what you're missing</p>
              </div>
            </div>

            <div className="px-6 mb-4 space-y-2">
              {[
                "Full session scans — every strategy, scored",
                "15 alerts — get notified when setups trigger",
                "Unlimited journal — log every trade",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#27B7C8] flex-shrink-0" />
                  <span className="text-[13px] text-[#F3EDE3]/80">{f}</span>
                </div>
              ))}
            </div>

            <div className="px-6 mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(39,183,200,0.06)", border: "2px solid #27B7C8" }}>
                <p className="text-[10px] text-[#F3EDE3]/40 uppercase tracking-wider">Desk</p>
                <p className="text-lg font-bold text-[#27B7C8]">${DESK_PLAN.yearlyPrice}<span className="text-xs font-normal text-[#F3EDE3]/30">/yr</span></p>
                <p className="text-[10px] text-[#49B06E]">{DESK_PLAN.yearlySavings}</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.3)" }}>
                <p className="text-[10px] text-[#F3EDE3]/40 uppercase tracking-wider">Pro</p>
                <p className="text-lg font-bold text-[#a855f7]">${PRO_PLAN.yearlyPrice}<span className="text-xs font-normal text-[#F3EDE3]/30">/yr</span></p>
                <p className="text-[10px] text-[#49B06E]">{PRO_PLAN.yearlySavings}</p>
              </div>
            </div>

            <div className="px-6 pb-4 space-y-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={goToSubscription}
                className="w-full py-3.5 rounded-xl text-sm font-bold"
                style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)", color: "#07080C" }}
              >
                View Plans
              </motion.button>
              <button onClick={dismiss}
                className="w-full py-2 text-xs text-[#F3EDE3]/30 hover:text-[#F3EDE3]/50 transition-colors">
                Maybe later
              </button>
            </div>

            <div className="px-6 pb-5">
              <p className="text-[9px] text-center text-[#F3EDE3]/20 leading-relaxed">
                Educational decision support only. Not financial advice. Cancel anytime.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
