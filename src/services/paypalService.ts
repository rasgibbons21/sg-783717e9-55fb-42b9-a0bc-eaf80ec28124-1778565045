import { supabase } from "@/integrations/supabase/client";

const PAYPAL_API_BASE = "https://api-m.paypal.com";
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;

// PayPal Subscription Plan IDs
const PAYPAL_MONTHLY_PLAN_ID = "P-8W707879XT1115010NIACMNQ";
const PAYPAL_YEARLY_PLAN_ID = "P-1TU067111E1942024NIACQBI";

interface PayPalSubscription {
  id: string;
  status: string;
  subscriber: {
    email_address: string;
  };
  start_time: string;
  plan_id: string;
}

export const paypalService = {
  getAccessToken: async (): Promise<string> => {
    try {
      const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
      const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Error getting PayPal access token:", error);
      throw error;
    }
  },

  createSubscriptionPlan: async (
    planName: string,
    planDescription: string,
    price: string,
    interval: "MONTH" | "YEAR"
  ): Promise<string> => {
    try {
      const accessToken = await paypalService.getAccessToken();
      
      const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: "BLOOM_PRO_SUBSCRIPTION",
          name: planName,
          description: planDescription,
          status: "ACTIVE",
          billing_cycles: [
            {
              frequency: {
                interval_unit: interval,
                interval_count: 1,
              },
              tenure_type: "REGULAR",
              sequence: 1,
              total_cycles: 0,
              pricing_scheme: {
                fixed_price: {
                  value: price,
                  currency_code: "USD",
                },
              },
            },
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3,
          },
        }),
      });

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Error creating PayPal subscription plan:", error);
      throw error;
    }
  },

  verifySubscription: async (subscriptionId: string): Promise<PayPalSubscription> => {
    try {
      const accessToken = await paypalService.getAccessToken();
      
      const response = await fetch(
        `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error verifying PayPal subscription:", error);
      throw error;
    }
  },

  activateUserSubscription: async (
    userId: string,
    subscriptionId: string,
    planType: "monthly" | "yearly"
  ): Promise<void> => {
    try {
      const subscription = await paypalService.verifySubscription(subscriptionId);

      if (subscription.status === "ACTIVE") {
        // Update user plan_type to pro
        await supabase
          .from("users")
          .update({ plan_type: "pro" })
          .eq("id", userId);

        // Insert subscription record
        await supabase.from("subscriptions").insert({
          user_id: userId,
          plan: planType,
          status: "active",
          start_date: new Date().toISOString(),
          payment_method: "paypal",
          paypal_subscription_id: subscriptionId,
        });
      }
    } catch (error) {
      console.error("Error activating user subscription:", error);
      throw error;
    }
  },

  cancelUserSubscription: async (subscriptionId: string): Promise<void> => {
    try {
      // Find user by subscription ID
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("paypal_subscription_id", subscriptionId)
        .eq("status", "active")
        .single();

      if (subscriptions) {
        // Update user plan_type to free
        await supabase
          .from("users")
          .update({ plan_type: "free" })
          .eq("id", subscriptions.user_id);

        // Update subscription status
        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            end_date: new Date().toISOString(),
          })
          .eq("paypal_subscription_id", subscriptionId);
      }
    } catch (error) {
      console.error("Error canceling user subscription:", error);
      throw error;
    }
  },
};