import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { InstallPrompt } from "@/components/InstallPrompt";
import SplashScreen from "@/components/SplashScreen";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export default function App({ Component, pageProps }: AppProps) {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider>
      <GoogleAnalytics />
      <SubscriptionProvider>
        <Component {...pageProps} />
      </SubscriptionProvider>
      <Toaster />
      <InstallPrompt />
    </ThemeProvider>
  );
}
