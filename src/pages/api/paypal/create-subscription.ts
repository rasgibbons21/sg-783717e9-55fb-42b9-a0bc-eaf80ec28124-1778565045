import type { NextApiRequest, NextApiResponse } from "next";

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
  if (!response.ok) throw new Error(data.error_description || "Failed to get token");
  return data.access_token;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { planType } = req.body; // "monthly" or "annual"
    
    // Default to the generated plan IDs if environment variables aren't set yet
    // In production, these should be loaded from env
    const monthlyPlanId = process.env.PAYPAL_MONTHLY_PLAN_ID || "P-YOUR_MONTHLY_PLAN_ID";
    const annualPlanId = process.env.PAYPAL_ANNUAL_PLAN_ID || "P-YOUR_ANNUAL_PLAN_ID";
    
    const planId = planType === "annual" ? annualPlanId : monthlyPlanId;

    const accessToken = await getAccessToken();

    // Create Subscription
    const subscriptionRes = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plan_id: planId,
        custom_id: planType, // Pass plan type so we know what they bought when capturing
        application_context: {
          brand_name: "Bloom",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/paypal/capture-subscription?plan=${planType}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/subscription?canceled=true`,
        },
      }),
    });
    
    const subscription = await subscriptionRes.json();
    if (!subscriptionRes.ok) throw new Error(subscription.message || "Failed to create subscription");

    const approvalUrl = subscription.links.find((link: { rel: string; href: string }) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      throw new Error("No approval URL returned from PayPal");
    }

    return res.status(200).json({ approvalUrl });
  } catch (error: unknown) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
}