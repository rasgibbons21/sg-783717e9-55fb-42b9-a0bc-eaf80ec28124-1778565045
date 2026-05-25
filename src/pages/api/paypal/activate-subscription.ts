import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_DB_PASSWORD || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, subscriptionId, planType } = req.body;

  if (!userId || !subscriptionId || !planType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Create subscription record
    const { error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan: planType,
        status: "active",
        payment_method: "paypal",
        paypal_subscription_id: subscriptionId,
        start_date: new Date().toISOString(),
      });

    if (subError) {
      console.error("Error creating subscription:", subError);
      return res.status(500).json({ error: "Failed to create subscription record" });
    }

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    console.error("Error activating subscription:", error);
    return res.status(500).json({ error: (error as Error).message || "Failed to activate subscription" });
  }
}