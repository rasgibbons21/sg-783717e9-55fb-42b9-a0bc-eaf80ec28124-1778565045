import { useEffect } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

const PSYCHOLOGY_MESSAGES = [
  "The market will always be there sis.\nNo rush. No FOMO 🌸 — Pansy",
  "Missing a trade is okay.\nChasing one from emotion is not 💅 — Pansy",
  "Discipline over intelligence.\nEvery single time 🏆 — Pansy",
  "No revenge trades.\nThe market owes you nothing ⚠️ — Pansy",
  "Your best trade today might be\nthe one you did not take 🌸 — Pansy",
  "5 wins 5 losses can still mean profit\nwith the right risk to reward ratio 📊 — Pansy",
];

export function PansyPsychologyToast() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Don't show on landing or onboarding pages
    if (router.pathname === "/" || router.pathname === "/onboarding") {
      return;
    }

    const toastShown = sessionStorage.getItem("pansy_psychology_toast_shown");
    
    if (toastShown === "true") {
      return;
    }

    // Random delay between 10-30 seconds
    const delay = Math.floor(Math.random() * 20000) + 10000;
    
    const timeoutId = setTimeout(() => {
      // Pick a random message
      const randomMessage = PSYCHOLOGY_MESSAGES[
        Math.floor(Math.random() * PSYCHOLOGY_MESSAGES.length)
      ];

      // Show the toast
      toast({
        description: (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xl shadow-md">
              🌺
            </div>
            <div className="flex-1">
              <p className="whitespace-pre-line text-sm leading-relaxed text-white">
                {randomMessage}
              </p>
            </div>
          </div>
        ),
        duration: 6000,
        className: "border-primary bg-zinc-900 text-white shadow-lg",
      });

      // Mark as shown for this session
      sessionStorage.setItem("pansy_psychology_toast_shown", "true");
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [router.pathname, toast]);

  return null;
}