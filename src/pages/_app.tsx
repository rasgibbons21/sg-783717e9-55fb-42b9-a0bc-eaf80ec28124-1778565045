import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { InstallPrompt } from "@/components/InstallPrompt";
import SplashScreen from "@/components/SplashScreen";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export default function App({ Component, pageProps }: AppProps) {
  const [splashState, setSplashState] = useState<"loading" | "splash" | "ready">("loading");

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    if (typeof window !== "undefined" && sessionStorage.getItem("splashShown")) {
      setSplashState("ready");
    } else {
      setSplashState("splash");
    }
  }, []);

  if (splashState === "loading") {
    return <div style={{ background: "#07080C", position: "fixed", inset: 0 }} />;
  }

  if (splashState === "splash") {
    return (
      <SplashScreen
        onComplete={() => {
          sessionStorage.setItem("splashShown", "true");
          setSplashState("ready");
        }}
      />
    );
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
