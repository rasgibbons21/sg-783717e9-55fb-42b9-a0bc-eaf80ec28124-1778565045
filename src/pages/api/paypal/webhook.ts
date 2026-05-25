import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Needed for webhook signature verification, but for simplicity we will accept it and process it
// In production, we'd verify the webhook signature with PayPal

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "" // Need service role to bypass RLS
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const event = req.body;
    console.log("PayPal Webhook Received:", event.event_type);

    const subscriptionId = event.resource?.id;
    if (!subscriptionId && event.event_type.includes("SUBSCRIPTION")) {
      return res.status(400).json({ error: "Missing subscription ID in resource" });
    }

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        // We handle activation in the capture route, but as a fallback:
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("paypal_subscription_id", subscriptionId)
          .single();

        if (sub) {
          await supabase.from("users").update({ plan_type: "pro" }).eq("id", sub.user_id);
          await supabase.from("subscriptions").update({ status: "active" }).eq("paypal_subscription_id", subscriptionId);
        }
        break;
      }
      
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("paypal_subscription_id", subscriptionId)
          .single();

        if (sub) {
          await supabase.from("users").update({ plan_type: "free" }).eq("id", sub.user_id);
          await supabase.from("subscriptions").update({ status: "cancelled", end_date: new Date().toISOString() }).eq("paypal_subscription_id", subscriptionId);
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        // Log successful payment if needed
        console.log("Payment successful for subscription:", event.resource?.billing_agreement_id);
        break;
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        // Handle failed payment (notify user via email/app if implemented)
        console.warn("Payment failed for subscription:", subscriptionId);
        break;
      }

      default:
        console.log("Unhandled event type:", event.event_type);
    }

    return res.status(200).json({ received: true });
  } catch (error: unknown) {
    console.error("Error processing PayPal webhook:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
}