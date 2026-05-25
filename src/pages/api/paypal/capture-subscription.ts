import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "" // Need service role to bypass RLS and update users
);

const PAYPAL_API = process.env.NODE_ENV === "production" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) throw new Error("Failed to get token");
  return data.access_token;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { subscription_id } = req.query;

    if (!subscription_id) {
      return res.redirect("/subscription?error=missing_subscription_id");
    }

    // Get user session via a cookie or we might need to assume the user is logged in
    // Since this is an API route hit from PayPal redirect, we need to get the user ID
    // We'll rely on the user's active session in Supabase via their browser cookie
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        global: {
          headers: {
            cookie: req.headers.cookie || "",
          },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      // User is not logged in when returning, redirect to login
      return res.redirect("/home?error=please_login_to_activate_subscription");
    }

    const accessToken = await getAccessToken();

    // Verify subscription status with PayPal
    const subscriptionRes = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscription_id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    const subscription = await subscriptionRes.json();
    if (!subscriptionRes.ok) throw new Error("Failed to verify subscription");

    if (subscription.status !== "ACTIVE" && subscription.status !== "APPROVED") {
      return res.redirect(`/subscription?error=subscription_${subscription.status.toLowerCase()}`);
    }

    // 1. Update users table
    const { error: userError } = await supabase
      .from("users")
      .update({ plan_type: "pro" })
      .eq("id", user.id);

    if (userError) throw userError;

    // 2. Insert into subscriptions table
    const { error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan: "pro", // The check constraint allows 'free' or 'pro'
        status: "active",
        paypal_subscription_id: subscription_id as string,
        start_date: new Date().toISOString(),
        payment_method: "paypal",
      });

    if (subError) {
      console.error("Error inserting subscription:", subError);
      // We still unlocked Pro, so we don't block the user, but we log the error
    }

    return res.redirect("/home?success=pro_unlocked");
  } catch (error: unknown) {
    console.error("Error capturing subscription:", error);
    return res.redirect("/subscription?error=capture_failed");
  }
}