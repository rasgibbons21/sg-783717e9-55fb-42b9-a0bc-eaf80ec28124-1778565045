import { useState, useEffect, useCallback } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { authService } from "@/services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, TrendingUp, Shield, Clock, ChevronRight } from "lucide-react";

const haptic = (ms = 8) => {
  try { navigator?.vibrate?.(ms); } catch {}
};

export function LateBloomersSignup() {
  const { isLoggedIn, userId } = useSubscription();
  const [show, setShow] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    let cancelled = false;

    const check = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (!session || cancelled) return;

        const res = await fetch("/api/late-bloomers", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();

        if (data.subscribed) {
          setIsSubscribed(true);
        } else {
          const timer = setTimeout(() => {
            if (!cancelled) setShow(true);
          }, 90_000);
          return () => clearTimeout(timer);
        }
      } catch {}
    };

    check();
    return () => { cancelled = true; };
  }, [isLoggedIn, userId]);

  const handleSignup = useCallback(async () => {
    setLoading(true);
    haptic(12);

    try {
      const session = await authService.getCurrentSession();
      if (!session) return;

      const res = await fetch("/api/late-bloomers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        setIsSubscribed(true);
        setJustSubscribed(true);
        haptic(20);
        setTimeout(() => setShow(false), 2200);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  if (isSubscribed && !justSubscribed) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(14,27,48,0.6)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="bg-card border border-border rounded-2xl max-w-sm w-full overflow-hidden shadow-xl"
          >
            {justSubscribed ? (
              <div className="p-8 text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                  className="text-5xl"
                >
                  🌸
                </motion.div>
                <h3 className="text-xl font-serif font-bold text-foreground">You&apos;re in!</h3>
                <p className="text-sm text-muted-foreground">
                  Check your inbox every Friday for Pansy&apos;s stock breakdown.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div
                  className="p-5 pb-4 relative"
                  style={{
                    background: "linear-gradient(135deg, rgba(39,183,200,0.12), rgba(73,176,110,0.08))",
                  }}
                >
                  <button
                    onClick={() => { haptic(); setShow(false); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="text-center space-y-2">
                    <span className="text-4xl">📬</span>
                    <h3 className="text-xl font-serif font-bold text-foreground">
                      Join the Late Bloomers
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Every Friday, Pansy shares the 3 stocks she&apos;s researching — real
                      breakdowns, not hype.
                    </p>
                  </div>
                </div>

                {/* What you get */}
                <div className="p-5 space-y-4">
                  <div className="space-y-2.5">
                    {[
                      { icon: <TrendingUp className="w-4 h-4" />, text: "3 stocks Pansy is studying each week" },
                      { icon: <Shield className="w-4 h-4" />, text: "Real research — entry zones & risks" },
                      { icon: <Clock className="w-4 h-4" />, text: "Free every Friday, forever" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "rgba(39,183,200,0.1)", color: "#27B7C8" }}
                        >
                          {item.icon}
                        </div>
                        <span className="text-sm text-foreground">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="space-y-2.5 pt-1">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ boxShadow: "0 6px 24px rgba(39,183,200,0.3)" }}
                      onClick={handleSignup}
                      disabled={loading}
                      className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{
                        background: "linear-gradient(135deg, #27B7C8, #49B06E)",
                        color: "#0E1B30",
                      }}
                    >
                      <Mail className="w-4 h-4" />
                      {loading ? "Joining..." : "Join Late Bloomers (Free)"}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { haptic(); setShow(false); }}
                      className="w-full py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      Not right now
                    </motion.button>
                  </div>

                  {/* Trust signal */}
                  <p className="text-[10px] text-center text-muted-foreground/60">
                    Unsubscribe anytime. No spam. Pansy&apos;s word.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function LateBloomersCard() {
  const { isLoggedIn, userId } = useSubscription();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    let cancelled = false;

    (async () => {
      try {
        const session = await authService.getCurrentSession();
        if (!session || cancelled) return;
        const res = await fetch("/api/late-bloomers", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        setSubscribed(data.subscribed);
      } catch {}
    })();

    return () => { cancelled = true; };
  }, [isLoggedIn, userId]);

  const handleJoin = async () => {
    setLoading(true);
    haptic(12);
    try {
      const session = await authService.getCurrentSession();
      if (!session) return;
      const res = await fetch("/api/late-bloomers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        setDone(true);
        setSubscribed(true);
        haptic(20);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  if (subscribed === null || (subscribed && !done)) return null;

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-[#49B06E]/30 p-4 flex items-center gap-3"
        style={{ background: "rgba(73,176,110,0.06)" }}
      >
        <span className="text-2xl">🌸</span>
        <p className="text-sm text-foreground font-medium">
          You&apos;re in! Check your inbox every Friday.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 28 }}
      className="rounded-2xl border border-border p-4 cursor-pointer hover:border-[#27B7C8]/40 transition-colors"
      style={{ background: "linear-gradient(135deg, rgba(39,183,200,0.06), rgba(73,176,110,0.04))" }}
      onClick={handleJoin}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
          style={{ background: "rgba(39,183,200,0.1)" }}>
          📬
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground mb-0.5">
            Get Pansy&apos;s weekly stock picks
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every Friday — 3 stocks she&apos;s researching, with real breakdowns.
          </p>
        </div>
        <motion.div
          whileTap={{ scale: 0.9, x: 2 }}
          className="shrink-0 self-center flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(39,183,200,0.15)", color: "#27B7C8" }}
        >
          {loading ? "Joining..." : <>Join <ChevronRight className="w-3.5 h-3.5" /></>}
        </motion.div>
      </div>
    </motion.div>
  );
}
