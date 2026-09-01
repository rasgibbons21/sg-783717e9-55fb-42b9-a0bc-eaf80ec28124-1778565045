import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const PLAY_BILLING_METHOD = "https://play.google.com/billing";
const PRODUCT_ID = "bloom_premium";
const LIFETIME_PRODUCT_ID = "bloom_lifetime";
const MANAGE_SUBSCRIPTIONS_URL =
  "https://play.google.com/store/account/subscriptions?package=app.shebloomswealth.mobile";

type BillingState =
  | "idle"
  | "loading"
  | "ready"
  | "purchasing"
  | "pending"
  | "verifying"
  | "success"
  | "error"
  | "unavailable";

interface PlanOffer {
  label: string;
  basePlanId: string;
  price: string;
  priceCurrency: string;
  period: string;
  offerToken?: string;
}

interface UseBillingReturn {
  state: BillingState;
  error: string | null;
  monthlyOffer: PlanOffer | null;
  yearlyOffer: PlanOffer | null;
  lifetimeOffer: PlanOffer | null;
  purchase: (offer: PlanOffer) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  manageSubscriptionUrl: string;
  hasFreeTrial: boolean;
}

async function obfuscateAccountId(userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + ":bloom");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useGooglePlayBilling(): UseBillingReturn {
  const [state, setState] = useState<BillingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [monthlyOffer, setMonthlyOffer] = useState<PlanOffer | null>(null);
  const [yearlyOffer, setYearlyOffer] = useState<PlanOffer | null>(null);
  const [lifetimeOffer, setLifetimeOffer] = useState<PlanOffer | null>(null);
  const [hasFreeTrial, setHasFreeTrial] = useState(false);
  const serviceRef = useRef<DigitalGoodsService | null>(null);
  const purchasingRef = useRef(false);

  const initBilling = useCallback(async () => {
    const hasDigitalGoods = "getDigitalGoodsService" in window;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    const isTwa = document.referrer.includes("android-app://");
    const hasPaymentRequest = "PaymentRequest" in window;

    if (!hasPaymentRequest) {
      setState("unavailable");
      setError(
        `Billing unavailable — PR: ${hasPaymentRequest}, standalone: ${isStandalone}, twa-ref: ${isTwa}`
      );
      return;
    }

    setState("loading");
    setError(null);

    // Try Digital Goods API first (works on Android 11/12, may fail on 13+)
    if (hasDigitalGoods) {
      try {
        const service = await window.getDigitalGoodsService(PLAY_BILLING_METHOD);
        serviceRef.current = service;

        const details = await service.getDetails([PRODUCT_ID, LIFETIME_PRODUCT_ID]);

        if (details && details.length > 0) {
          for (const detail of details) {
            if (detail.itemId === LIFETIME_PRODUCT_ID) {
              setLifetimeOffer({
                label: "Lifetime",
                basePlanId: "lifetime",
                price: `${detail.price.currency} ${detail.price.value}`,
                priceCurrency: detail.price.currency,
                period: "lifetime",
              });
              continue;
            }

            if (!detail.subscriptionPeriod) continue;
            const period = detail.subscriptionPeriod;
            const isYearly = period.includes("Y") || period.includes("year");
            const isMonthly = period.includes("M") || period.includes("month");
            if (!isYearly && !isMonthly) continue;

            const offer: PlanOffer = {
              label: isYearly ? "Yearly" : "Monthly",
              basePlanId: isYearly ? "yearly" : "monthly",
              price: `${detail.price.currency} ${detail.price.value}`,
              priceCurrency: detail.price.currency,
              period: isYearly ? "year" : "month",
              offerToken: detail.offerToken,
            };

            if (isMonthly) setMonthlyOffer(offer);
            if (isYearly) setYearlyOffer(offer);
            if (detail.freeTrialPeriod) setHasFreeTrial(true);
          }

          setState("ready");
          return;
        }
      } catch {
        // Digital Goods API failed (Android 13+ known issue) — fall through to PaymentRequest
      }
    }

    // Fallback: check if PaymentRequest can handle Play billing
    try {
      const testRequest = new PaymentRequest(
        [{ supportedMethods: PLAY_BILLING_METHOD, data: { sku: PRODUCT_ID } }],
        { total: { label: "Test", amount: { currency: "USD", value: "0" } } }
      );

      const canPay = await testRequest.canMakePayment();

      if (canPay) {
        setMonthlyOffer({
          label: "Monthly",
          basePlanId: "monthly",
          price: "$4.99",
          priceCurrency: "USD",
          period: "month",
        });
        setYearlyOffer({
          label: "Yearly",
          basePlanId: "yearly",
          price: "$29.99",
          priceCurrency: "USD",
          period: "year",
        });
        setLifetimeOffer({
          label: "Lifetime",
          basePlanId: "lifetime",
          price: "$69.99",
          priceCurrency: "USD",
          period: "lifetime",
        });
        setState("ready");
      } else {
        setState("unavailable");
        setError(
          `Play Billing not available — canPay: false, DG: ${hasDigitalGoods}, standalone: ${isStandalone}, twa: ${isTwa}`
        );
      }
    } catch (err: any) {
      setState("error");
      setError(
        `Billing check failed: ${err.message || err} | DG: ${hasDigitalGoods}, standalone: ${isStandalone}, twa: ${isTwa}`
      );
    }
  }, []);

  useEffect(() => {
    initBilling();
  }, [initBilling]);

  const purchase = useCallback(
    async (offer: PlanOffer) => {
      if (purchasingRef.current) return;
      purchasingRef.current = true;

      setState("purchasing");
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Please sign in to subscribe.");
          setState("error");
          return;
        }

        const obfuscatedId = await obfuscateAccountId(user.id);

        const isLifetime = offer.basePlanId === "lifetime";
        const sku = isLifetime ? LIFETIME_PRODUCT_ID : PRODUCT_ID;
        const methodData: any = { sku };
        if (offer.offerToken) {
          methodData.offerToken = offer.offerToken;
        }

        const paymentRequest = new PaymentRequest(
          [
            {
              supportedMethods: PLAY_BILLING_METHOD,
              data: methodData,
            },
          ],
          {
            total: {
              label: `Bloom Premium (${offer.label})`,
              amount: { currency: offer.priceCurrency, value: "0" },
            },
          }
        );

        const response = await paymentRequest.show();
        const { purchaseToken } = response.details;

        if (!purchaseToken) {
          setState("error");
          setError("No purchase token received.");
          await response.complete("fail");
          return;
        }

        setState("verifying");

        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;

        const verifyRes = await fetch("/api/google-play/verify-purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            purchaseToken,
            productId: sku,
            basePlanId: offer.basePlanId,
            isLifetime,
          }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok || !verifyData.verified) {
          setState("error");
          setError(
            verifyData.error || "Purchase verification failed. Please contact support."
          );
          await response.complete("fail");
          return;
        }

        if (verifyData.subscriptionStatus === "pending") {
          setState("pending");
          await response.complete("success");
          return;
        }

        await response.complete("success");
        setState("success");
      } catch (err: any) {
        if (err.name === "AbortError") {
          setState("ready");
          return;
        }
        console.error("Purchase error:", err);
        setState("error");
        setError("Purchase could not be completed. Please try again.");
      } finally {
        purchasingRef.current = false;
      }
    },
    []
  );

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    // Try Digital Goods API first
    if (serviceRef.current) {
      setState("verifying");
      setError(null);

      try {
        const purchases = await serviceRef.current.listPurchases();

        if (!purchases || purchases.length === 0) {
          setState("ready");
          setError("No active subscriptions found on this Google account.");
          return false;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setState("error");
          setError("Please sign in to restore purchases.");
          return false;
        }

        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;

        let restored = false;

        for (const p of purchases) {
          const res = await fetch("/api/google-play/verify-purchase", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              purchaseToken: p.purchaseToken,
              productId: p.itemId,
              basePlanId: null,
            }),
          });

          const data = await res.json();
          if (res.ok && data.verified && data.isPro) {
            restored = true;
          }
        }

        if (restored) {
          setState("success");
          return true;
        }

        setState("ready");
        setError("No valid active subscriptions found.");
        return false;
      } catch (err: any) {
        console.error("Restore error:", err);
        setState("error");
        setError("Could not restore purchases. Please try again.");
        return false;
      }
    }

    // Fallback: server-side restore check
    setState("verifying");
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setState("error");
        setError("Please sign in to restore purchases.");
        return false;
      }

      setState("ready");
      setError("To restore a purchase, please contact support with your Google Play receipt.");
      return false;
    } catch {
      setState("error");
      setError("Could not restore purchases. Please try again.");
      return false;
    }
  }, []);

  return {
    state,
    error,
    monthlyOffer,
    yearlyOffer,
    lifetimeOffer,
    purchase,
    restorePurchases,
    manageSubscriptionUrl: MANAGE_SUBSCRIPTIONS_URL,
    hasFreeTrial,
  };
}
