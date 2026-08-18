import { useEffect, useRef } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

const AD_SLOTS = {
  banner: "5457826876",
  rectangle: "7381282639",
} as const;

interface AdMobBannerProps {
  format?: "banner" | "rectangle";
}

export const AdMobBanner = ({ format = "banner" }: AdMobBannerProps) => {
  const { isPro } = useSubscription();
  const pushed = useRef(false);

  useEffect(() => {
    if (isPro || pushed.current) return;
    try {
      ((window as unknown as Record<string, unknown[]>).adsbygoogle =
        (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, [isPro]);

  if (isPro) return null;

  return (
    <div className="w-full flex justify-center my-3">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-app-pub-1507435968246952"
        data-ad-slot={AD_SLOTS[format]}
        data-ad-format={format === "rectangle" ? "fluid" : "auto"}
        data-full-width-responsive="true"
      />
    </div>
  );
};
