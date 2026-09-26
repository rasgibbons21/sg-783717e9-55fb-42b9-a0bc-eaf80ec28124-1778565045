import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export const config = { api: { bodyParser: false } };

async function buffer(req: NextApiRequest) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function tierFromMeta(metadata: Stripe.Metadata | null | undefined): string {
  const t = metadata?.tier;
  if (t === "pro" || t === "pro_active") return "pro";
  return "desk";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).json({ error: "Missing stripe-signature header" });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(500).json({ error: "Webhook secret not configured" });

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
        if (!userId) return res.status(400).json({ error: "No user ID found" });

        const tier = tierFromMeta(session.metadata);
        const subscriptionId = session.subscription as string;

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            is_pro: true,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            subscription_status: tier,
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("id", userId);

        if (updateError) {
          console.error("Error updating profile:", updateError);
          return res.status(500).json({ error: updateError.message });
        }
        console.log(`User ${userId} subscribed to ${tier}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!profile) return res.status(404).json({ error: "User not found" });

        const tier = tierFromMeta(subscription.metadata);
        const isActive = subscription.status === "active";

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: isActive ? tier : subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            is_pro: isActive,
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          return res.status(500).json({ error: updateError.message });
        }
        console.log(`Subscription updated for ${profile.id}: ${isActive ? tier : subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!profile) return res.status(404).json({ error: "User not found" });

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            is_pro: false,
            subscription_status: "canceled",
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("id", profile.id);

        if (updateError) {
          console.error("Error canceling subscription:", updateError);
          return res.status(500).json({ error: updateError.message });
        }
        console.log(`Subscription canceled for ${profile.id}`);
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
