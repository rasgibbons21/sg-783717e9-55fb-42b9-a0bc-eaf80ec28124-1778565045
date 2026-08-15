import { useEffect, useRef } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface AdMobBannerProps {
  adUnitId: string;
  format?: "banner" | "rectangle";
}

export const AdMobBanner = ({ adUnitId, format = "banner" }: AdMobBannerProps) => {
  const { isPro } = useSubscription();
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (isPro || pushed.current) return;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, [isPro]);

  if (isPro) return null;

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-app-pub-1507435968246952"
      data-ad-slot={adUnitId}
      data-ad-format={format === "rectangle" ? "fluid" : "auto"}
      data-full-width-responsive="true"
    />
  );
};
