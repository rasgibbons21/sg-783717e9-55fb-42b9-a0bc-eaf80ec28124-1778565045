import type { NextApiRequest, NextApiResponse } from "next";
import { paypalService } from "@/services/paypalService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const event = req.body;

    // Handle subscription cancelled event
    if (event.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
      const subscriptionId = event.resource.id;
      await paypalService.cancelUserSubscription(subscriptionId);
      console.log(`Subscription cancelled: ${subscriptionId}`);
    }

    // Handle subscription payment failed event
    if (event.event_type === "BILLING.SUBSCRIPTION.PAYMENT.FAILED") {
      const subscriptionId = event.resource.id;
      await paypalService.cancelUserSubscription(subscriptionId);
      console.log(`Subscription payment failed: ${subscriptionId}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}