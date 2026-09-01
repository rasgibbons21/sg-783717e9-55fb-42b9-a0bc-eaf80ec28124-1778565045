import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Disable body parser for webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body
async function buffer(req: NextApiRequest) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log("Received Stripe event:", event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;

        if (!userId) {
          console.error("No user ID found in checkout session");
          return res.status(400).json({ error: "No user ID found" });
        }

        const isLifetime = session.metadata?.plan === "lifetime";

        if (isLifetime) {
          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: true,
              stripe_customer_id: session.customer as string,
              subscription_status: "lifetime",
              current_period_end: null,
            })
            .eq("id", userId);

          if (updateError) {
            console.error("Error updating user profile:", updateError);
            return res.status(500).json({ error: updateError.message });
          }

          console.log(`User ${userId} upgraded to Lifetime Pro`);
        } else {
          const subscriptionId = session.subscription as string;

          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({
              is_pro: true,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionId,
              subscription_status: "active",
              current_period_end: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            })
            .eq("id", userId);

          if (updateError) {
            console.error("Error updating user profile:", updateError);
            return res.status(500).json({ error: updateError.message });
          }

          console.log(`User ${userId} upgraded to Pro`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer_id
        const { data: profile, error: fetchError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (fetchError || !profile) {
          console.error("User not found for customer:", customerId);
          return res.status(404).json({ error: "User not found" });
        }

        // Update subscription status and period end
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: subscription.status,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            is_pro: subscription.status === "active" || subscription.status === "trialing",
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          return res.status(500).json({ error: updateError.message });
        }

        console.log(
          `Subscription updated for user ${profile.id}: ${subscription.status}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer_id
        const { data: profile, error: fetchError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (fetchError || !profile) {
          console.error("User not found for customer:", customerId);
          return res.status(404).json({ error: "User not found" });
        }

        // Downgrade user to free
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            is_pro: false,
            subscription_status: "canceled",
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Error canceling subscription:", updateError);
          return res.status(500).json({ error: updateError.message });
        }

        console.log(`Subscription canceled for user ${profile.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}