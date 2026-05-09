import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { InstallPrompt } from "@/components/InstallPrompt";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <>
      <InstallPrompt />
      <Component {...pageProps} />
      <Toaster />
    </>
  );
}
