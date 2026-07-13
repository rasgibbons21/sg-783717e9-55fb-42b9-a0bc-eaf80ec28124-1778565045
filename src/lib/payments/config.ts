export type PaymentProvider = "stripe" | "none" | "google_play";

const raw = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER ?? "stripe";

export const paymentProvider: PaymentProvider =
  raw === "none" || raw === "google_play" ? raw : "stripe";

export const canShowExternalPayment = paymentProvider === "stripe";
export const canShowInAppPayment = paymentProvider === "google_play";
