import { useState, useEffect } from "react";
import Link from "next/link";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { fadeUp } from "@/lib/motion";

function formatTime(ms: number) {
  if (ms <= 0) return { h: "00", m: "00", s: "00" };
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return { h, m, s };
}

export function TrialCountdown() {
  const { isTrial, trialEndsAt } = useSubscription();
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    if (!trialEndsAt) return;

    const tick = () => setRemaining(Math.max(0, trialEndsAt.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [trialEndsAt]);

  if (!isTrial || !trialEndsAt) return null;

  const { h, m, s } = formatTime(remaining);
  const expired = remaining <= 0;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-gradient-to-r from-[#27B7C8]/10 to-[#49B06E]/10 border border-[#27B7C8]/20 rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-[#27B7C8]" />
        <span className="text-xs font-bold text-[#27B7C8] uppercase tracking-wide">
          {expired ? "Trial Expired" : "Pro Trial"}
        </span>
      </div>

      {expired ? (
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Your free trial has ended. Subscribe to keep full access.
          </p>
          <Link href="/subscription">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)", color: "#0E1B30" }}
            >
              <Sparkles className="w-4 h-4" /> Upgrade to Bloom Pro
            </motion.button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 mb-3">
            {[
              { val: h, label: "hrs" },
              { val: m, label: "min" },
              { val: s, label: "sec" },
            ].map(({ val, label }, i) => (
              <div key={label} className="flex items-center gap-2">
                {i > 0 && <span className="text-lg font-bold text-muted-foreground">:</span>}
                <div className="text-center">
                  <div
                    className="text-2xl font-bold tabular-nums px-3 py-1.5 rounded-lg"
                    style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                  >
                    {val}
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase mt-1 block">{label}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground mb-3">
            Explore everything Bloom Pro has to offer before time runs out
          </p>

          <Link href="/subscription">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #27B7C8, #49B06E)", color: "#0E1B30" }}
            >
              <Sparkles className="w-4 h-4" /> Subscribe Now — Keep Full Access
            </motion.button>
          </Link>
        </>
      )}
    </motion.div>
  );
}
