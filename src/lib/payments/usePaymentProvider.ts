import { useState, useEffect } from "react";
import {
  paymentProvider as defaultProvider,
  type PaymentProvider,
} from "./config";

export function usePaymentProvider() {
  const [provider, setProvider] = useState<PaymentProvider>(defaultProvider);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if ("getDigitalGoodsService" in window) {
      setProvider("google_play");
    }
    setIsReady(true);
  }, []);

  return {
    provider,
    isReady,
    canShowExternalPayment: provider === "stripe",
    canShowInAppPayment: provider === "google_play",
  } as const;
}

export type { PaymentProvider };
