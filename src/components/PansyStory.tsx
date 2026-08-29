import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { fadeUp } from "@/lib/motion";

const haptic = (ms = 8) => {
  try { navigator?.vibrate?.(ms); } catch {}
};

const STEPS = [
  {
    emoji: "😔",
    title: "Single mom. Two kids. Barely making it.",
    text: "Working a job that didn't pay enough. Underemployed, underpaid, exhausted. A second job wouldn't even cover daycare.",
  },
  {
    emoji: "💡",
    title: "One night, she Googled \"how to make money from home.\"",
    text: "While the kids slept, she started learning. Side hustles. Digital products. Things she could build from her phone after bedtime.",
  },
  {
    emoji: "📒",
    title: "First, she learned where her money was going.",
    text: "She tracked every dollar. Cut what didn't matter. Found $300/month she didn't know she had. Budgeting wasn't boring — it was freedom.",
  },
  {
    emoji: "📈",
    title: "The side hustle money started coming in.",
    text: "A trickle, then a stream. She didn't spend it. She learned about investing — stocks, ETFs, dividends — and put that money to work.",
  },
  {
    emoji: "🔥",
    title: "She fired her boss.",
    text: "One morning the math worked. Investments plus side hustle covered her bills. She gave her notice and never looked back.",
  },
  {
    emoji: "🌸",
    title: "Now she's actually living.",
    text: "Picking her kids up from school. Tuesday pancakes. Trips that used to be \"someday\" trips. Not rich — free.",
  },
];

export function PansyStory() {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="bg-card border border-border rounded-2xl overflow-hidden"
    >
      <motion.button
        className="w-full p-5 flex items-center gap-4 text-left"
        onClick={() => { setExpanded(e => !e); haptic(); }}
        whileTap={{ scale: 0.98 }}
      >
        <Image
          src="/pansy-coffee.png"
          alt="Pansy"
          width={52}
          height={52}
          className="rounded-full object-cover flex-shrink-0"
          style={{ width: 52, height: 52 }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-base font-bold text-foreground">Pansy&apos;s Story</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            She didn&apos;t come from money. She built it — one decision at a time.
          </p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-0">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                      style={{
                        background: i === STEPS.length - 1
                          ? "linear-gradient(135deg, #27B7C8, #49B06E)"
                          : "hsl(var(--muted))",
                        border: i === STEPS.length - 1
                          ? "none"
                          : "1px solid hsl(var(--border))",
                      }}
                    >
                      {step.emoji}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className="w-px flex-1 min-h-[16px]"
                        style={{ background: "linear-gradient(to bottom, hsl(var(--border)), transparent)" }}
                      />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-bold text-foreground mb-1">{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}

              <div className="bg-muted/50 border border-border rounded-xl p-4 mt-2">
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  &ldquo;That&apos;s the dream, right? Not a mansion. Just <strong className="text-foreground">time</strong>.
                  I built Bloom so you don&apos;t have to figure it out alone like I did.&rdquo;
                </p>
                <p className="text-xs font-semibold text-[#27B7C8] mt-2">— Pansy</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
