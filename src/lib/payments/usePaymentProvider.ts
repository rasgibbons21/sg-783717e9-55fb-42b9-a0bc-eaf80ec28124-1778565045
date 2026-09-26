import {
  paymentProvider,
  type PaymentProvider,
} from "./config";

export function usePaymentProvider() {
  return {
    provider: paymentProvider,
    isReady: true,
    canShowExternalPayment: paymentProvider === "stripe",
    canShowInAppPayment: paymentProvider === "google_play",
  } as const;
}

export type { PaymentProvider };
