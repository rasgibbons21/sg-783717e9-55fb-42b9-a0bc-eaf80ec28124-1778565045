import { useRouter } from "next/router";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PansyContext {
  message: string;
  quickActions: { label: string; href: string }[];
  greeting: string;
}

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const PAGE_MESSAGES: Record<string, string[]> = {
  "/home": [
    "Your next small step is waiting. No rush — just progress.",
    "Every expert started exactly where you are right now.",
    "Consistency beats intensity. You're doing great just by showing up.",
    "The market will always be there. Let's focus on learning today.",
  ],
  "/learn": [
    "Take your time with each lesson. Understanding beats speed.",
    "Every lesson you finish plants a seed for your future.",
    "Don't just memorize — understand the why behind each concept.",
    "You're building real knowledge here. That's your edge.",
  ],
  "/practice": [
    "Practice mode is risk-free. Experiment without fear.",
    "Every trade you practice teaches you something — win or lose.",
    "Focus on your process, not the result. Good habits build wealth.",
    "Paper trading builds the muscle memory for real markets.",
  ],
  "/discover": [
    "Research before you invest. Knowledge is your best tool.",
    "Look at fundamentals first, price second.",
    "Take notes on what catches your eye — build your watchlist.",
  ],
  "/brokers": [
    "Take your time comparing. The right platform matters.",
    "Look for demo accounts — practice before committing.",
    "Check fees, availability, and what assets they support.",
  ],
  "/ask-pansy": [
    "Ask me anything — no question is too basic.",
    "I'm here to help you understand, not to judge.",
    "The only bad question is the one you didn't ask.",
  ],
  "/profile": [
    "Review your goals regularly — they grow as you do.",
    "Your journey is unique. Compare yourself only to yesterday.",
  ],
  "/journal": [
    "Writing down your trades builds self-awareness.",
    "The best traders reflect. Journaling is a superpower.",
  ],
};

const STREAK_MESSAGES: Record<string, string> = {
  "0": "Start a lesson today and plant your first seed.",
  "1": "Day one of your streak! Come back tomorrow to keep it going.",
  "3": "3-day streak! You're building a real habit.",
  "7": "A whole week! You're more disciplined than most traders.",
  "14": "Two weeks strong. This is how wealth is built.",
  "30": "30 days! You're in the top 1% of learners.",
};

function getStreakMessage(streak: number): string | null {
  if (streak >= 30) return STREAK_MESSAGES["30"];
  if (streak >= 14) return STREAK_MESSAGES["14"];
  if (streak >= 7) return STREAK_MESSAGES["7"];
  if (streak >= 3) return STREAK_MESSAGES["3"];
  if (streak === 1) return STREAK_MESSAGES["1"];
  if (streak === 0) return STREAK_MESSAGES["0"];
  return null;
}

const QUICK_ACTIONS: Record<string, { label: string; href: string }[]> = {
  "/home": [
    { label: "Continue Learning", href: "/learn" },
    { label: "Practice Trading", href: "/practice" },
  ],
  "/learn": [
    { label: "Practice What You Learned", href: "/practice" },
    { label: "Ask Pansy", href: "/ask-pansy" },
  ],
  "/practice": [
    { label: "Learn More", href: "/learn" },
    { label: "Journal Entry", href: "/journal" },
  ],
  "/discover": [
    { label: "Practice a Trade", href: "/practice" },
    { label: "Ask Pansy About It", href: "/ask-pansy" },
  ],
  "/brokers": [
    { label: "Back to Learning", href: "/learn" },
    { label: "Ask Pansy", href: "/ask-pansy" },
  ],
  "/profile": [
    { label: "Continue Learning", href: "/learn" },
    { label: "View Progress", href: "/home" },
  ],
};

export function usePansyContext(): PansyContext & { streak: number; completedCount: number } {
  const router = useRouter();
  const { userName } = useSubscription();
  const [streak, setStreak] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("lesson_progress")
        .select("completed, completed_at")
        .eq("user_id", session.user.id)
        .eq("completed", true);

      if (!data) return;
      setCompletedCount(data.length);

      const dates = data
        .filter(d => d.completed_at)
        .map(d => {
          const dt = new Date(d.completed_at!);
          return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
        });
      const uniqueDates = [...new Set(dates)].sort().reverse();
      let s = 0;
      const today = new Date();
      for (let i = 0; i < uniqueDates.length; i++) {
        const check = new Date(today);
        check.setDate(check.getDate() - i);
        const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
        if (uniqueDates.includes(key)) s++;
        else break;
      }
      setStreak(s);
    };
    load();
  }, [router.pathname]);

  const path = router.pathname;
  const basePath = Object.keys(PAGE_MESSAGES).find(p =>
    path === p || path.startsWith(p + "/")
  ) ?? "/home";

  const messages = PAGE_MESSAGES[basePath] ?? PAGE_MESSAGES["/home"];
  const streakMsg = getStreakMessage(streak);

  const allMessages = streakMsg ? [streakMsg, ...messages] : messages;
  const idx = Math.floor(Date.now() / 60000) % allMessages.length;
  const message = allMessages[idx];

  const greeting = userName
    ? `${getTimeGreeting()}, ${userName}`
    : getTimeGreeting();

  const quickActions = QUICK_ACTIONS[basePath] ?? QUICK_ACTIONS["/home"];

  return { message, quickActions, greeting, streak, completedCount };
}
