import "@/styles/globals.css";
import Script from 'next/script'
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { InstallPrompt } from "@/components/InstallPrompt";
import SplashScreen from "@/components/SplashScreen";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

export default function App({ Component, pageProps }: AppProps) {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider>
      {/* Google Analytics 4 */}
<Script
    id="google-analytics-4"
    src="https://www.googletagmanager.com/gtag/js?id=G-9ZG1992263"
    strategy="afterInteractive"
/>
              <Script
                  id="google-analytics-4-inline"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                      __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-9ZG1992263');`
                  }}
              />
{/* End Google Analytics 4 */}
      <SubscriptionProvider>
        <Component {...pageProps} />
      </SubscriptionProvider>
      <Toaster />
      <InstallPrompt />
    </ThemeProvider>
  );
}
