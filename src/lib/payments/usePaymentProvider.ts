import {
  paymentProvider,
  canShowExternalPayment,
  canShowInAppPayment,
  type PaymentProvider,
} from "./config";

export function usePaymentProvider() {
  return {
    provider: paymentProvider,
    canShowExternalPayment,
    canShowInAppPayment,
  } as const;
}

export type { PaymentProvider };
