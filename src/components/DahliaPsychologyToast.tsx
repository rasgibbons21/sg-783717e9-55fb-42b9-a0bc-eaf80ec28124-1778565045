import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

const psychologyMessages = [
  "The market will always be there sis.\nNo rush. No FOMO 🌸 — Dahlia",
  "Missing a trade is okay.\nChasing one from emotion is not 💅 — Dahlia",
  "Discipline over intelligence.\nEvery single time 🏆 — Dahlia",
  "No revenge trades.\nThe market owes you nothing ⚠️ — Dahlia",
  "Your best trade today might be\nthe one you did not take 🌸 — Dahlia",
  "5 wins 5 losses can still mean profit\nwith the right risk to reward ratio 📊 — Dahlia",
];

export function DahliaPsychologyToast() {
  const { toast } = useToast();
  const router = useRouter();
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    // Check if toast has already been shown this session
    const toastShown = sessionStorage.getItem("dahlia_psychology_toast_shown");
    if (toastShown) {
      setHasShownToast(true);
      return;
    }

    // Don't show on onboarding or landing page
    if (router.pathname === "/" || router.pathname === "/onboarding") {
      return;
    }

    // Random delay between 10-30 seconds after page load
    const randomDelay = Math.floor(Math.random() * 20000) + 10000;

    const timeoutId = setTimeout(() => {
      if (!hasShownToast) {
        // Pick a random message
        const randomMessage =
          psychologyMessages[
            Math.floor(Math.random() * psychologyMessages.length)
          ];

        // Show the toast
        toast({
          description: (
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xl">
                🌺
              </div>
              <div className="flex-1">
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {randomMessage}
                </p>
              </div>
            </div>
          ),
          duration: 6000,
          className: "border-primary bg-card",
        });

        // Mark as shown for this session
        sessionStorage.setItem("dahlia_psychology_toast_shown", "true");
        setHasShownToast(true);
      }
    }, randomDelay);

    return () => clearTimeout(timeoutId);
  }, [router.pathname, toast, hasShownToast]);

  return null;
}