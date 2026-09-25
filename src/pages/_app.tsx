import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { InstallPrompt } from "@/components/InstallPrompt";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

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
