import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, ArrowRight } from "lucide-react";
import { usePansyContext } from "@/hooks/usePansyContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

const HIDDEN_PATHS = ["/", "/onboarding", "/login", "/signup"];

export function PansyAssistant() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useSubscription();
  const { message, quickActions } = usePansyContext();
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownAuto, setHasShownAuto] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hidden =
    isLoading ||
    !isLoggedIn ||
    HIDDEN_PATHS.includes(router.pathname);

  useEffect(() => {
    if (hidden || hasShownAuto) return;

    const shown = sessionStorage.getItem("pansy_assistant_auto");
    if (shown) {
      setHasShownAuto(true);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      setHasShownAuto(true);
      sessionStorage.setItem("pansy_assistant_auto", "true");
    }, 3000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [hidden, hasShownAuto]);

  useEffect(() => {
    if (isOpen) setDismissed(false);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
    setDismissed(false);
  }, [router.pathname]);

  if (hidden) return null;

  const handleDismiss = () => {
    setIsOpen(false);
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-[100px] right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-72 rounded-2xl border border-[#27B7C8]/20 bg-[#0E1B30]/95 backdrop-blur-xl shadow-2xl shadow-[#27B7C8]/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🌺</span>
                <span className="text-sm font-semibold text-white">Pansy</span>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Message */}
            <div className="px-4 pb-3">
              <p className="text-[13px] leading-relaxed text-white/80">
                {message}
              </p>
            </div>

            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <div className="border-t border-white/5 px-3 py-2 flex gap-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#27B7C8]/10 hover:bg-[#27B7C8]/20 px-3 py-2 text-xs font-medium text-[#27B7C8] transition-colors"
                  >
                    {action.label}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            )}

            {/* Ask Pansy link */}
            <div className="border-t border-white/5 px-4 py-2">
              <Link
                href="/ask-pansy"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-xs text-[#49B06E] hover:text-[#49B06E]/80 transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                Ask me anything
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Avatar Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-[#27B7C8]/20 focus:outline-none"
        style={{
          background: "linear-gradient(135deg, #27B7C8, #49B06E)",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={
          !isOpen && !dismissed
            ? {
                boxShadow: [
                  "0 0 0 0 rgba(39,183,200,0.3)",
                  "0 0 0 8px rgba(39,183,200,0)",
                ],
              }
            : {}
        }
        transition={
          !isOpen && !dismissed
            ? { duration: 2, repeat: Infinity, ease: "easeOut" }
            : { duration: 0.2 }
        }
      >
        <span className="text-2xl select-none">🌺</span>

        {/* Notification dot */}
        {!isOpen && !dismissed && (
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#F59E0B] border-2 border-[#0E1B30]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          />
        )}
      </motion.button>
    </div>
  );
}
