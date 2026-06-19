import Script from "next/script";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Public by design — NEXT_PUBLIC_ is inlined at build time and exposed to the
// browser. If unset, this component renders nothing and loads no scripts.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const router = useRouter();

  // Track client-side (SPA) navigations. The initial page_view fires from the
  // inline `config` below; routeChangeComplete covers every navigation after.
  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const handleRouteChange = (url: string) => {
      window.gtag?.("config", GA_MEASUREMENT_ID, { page_path: url });
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  // No measurement ID configured → load nothing.
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
