import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Heart } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

const STORAGE_KEY = "pansy_last_visit";
const SESSION_KEY = "pansy_encouragement_shown";

interface EncouragementMessage {
  text: string;
  icon: string;
}

function getTimeAwayMessage(hoursSince: number, userName: string | null): EncouragementMessage | null {
  const name = userName ? ` ${userName}` : "";

  if (hoursSince < 1) return null;

  if (hoursSince < 24) {
    return {
      text: `Welcome back${name}! Back so soon — that's the kind of consistency that builds real knowledge.`,
      icon: "🌸",
    };
  }

  if (hoursSince < 48) {
    return {
      text: `Hey${name}! A day away and you're already back. Your dedication is showing.`,
      icon: "💪",
    };
  }

  if (hoursSince < 168) {
    const days = Math.floor(hoursSince / 24);
    return {
      text: `${name ? name.trim() + "!" : "Hey!"} It's been ${days} days — I kept your spot warm. Ready to pick up where you left off?`,
      icon: "🌺",
    };
  }

  if (hoursSince < 720) {
    return {
      text: `Welcome back${name}! It's been a while, but that's okay — the best time to restart is right now. Your progress is still here.`,
      icon: "🌱",
    };
  }

  return {
    text: `${name ? name.trim() + "!" : "Hey!"} So glad you're back. No matter how long it's been, you haven't lost anything — every lesson you learned is still yours. Let's keep going.`,
    icon: "💛",
  };
}

export function PansyEncouragement() {
  const router = useRouter();
  const { isLoggedIn, isLoading, userName } = useSubscription();
  const [message, setMessage] = useState<EncouragementMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading || !isLoggedIn) return;
    if (router.pathname === "/" || router.pathname === "/onboarding") return;

    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (alreadyShown) return;

    const lastVisit = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (lastVisit) {
      const hoursSince = (now - parseInt(lastVisit, 10)) / (1000 * 60 * 60);
      const msg = getTimeAwayMessage(hoursSince, userName);
      if (msg) {
        setMessage(msg);
        setTimeout(() => setIsVisible(true), 1500);
      }
    } else {
      setMessage({
        text: `Hi${userName ? ` ${userName}` : ""}! I'm Pansy — your investing education guide. I'll be here throughout your journey, one lesson at a time.`,
        icon: "🌺",
      });
      setTimeout(() => setIsVisible(true), 2000);
    }

    localStorage.setItem(STORAGE_KEY, now.toString());
    sessionStorage.setItem(SESSION_KEY, "true");
  }, [isLoading, isLoggedIn, userName, router.pathname]);

  const dismiss = () => {
    setIsVisible(false);
    setTimeout(() => setMessage(null), 400);
  };

  useEffect(() => {
    if (!isVisible) return;
    const timeout = setTimeout(dismiss, 8000);
    return () => clearTimeout(timeout);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {message && isVisible && (
        <motion.div
          className="fixed top-20 left-4 right-4 sm:left-auto sm:right-4 z-[55] sm:w-80"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
        >
          <div className="rounded-2xl border border-[#49B06E]/20 bg-[#0E1B30]/95 backdrop-blur-xl p-4 shadow-2xl shadow-[#49B06E]/10">
            <div className="flex items-start gap-3">
              <motion.div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#27B7C8] to-[#49B06E] text-lg shadow-md"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.15 }}
              >
                {message.icon}
              </motion.div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-white">Pansy</p>
                    <Heart className="w-3 h-3 text-pink-400" />
                  </div>
                  <button
                    onClick={dismiss}
                    className="p-0.5 rounded text-white/30 hover:text-white/60 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <motion.p
                  className="text-[13px] leading-relaxed text-white/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {message.text}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
