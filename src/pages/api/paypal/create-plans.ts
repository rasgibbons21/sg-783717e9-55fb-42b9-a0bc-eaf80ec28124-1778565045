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
    const accessToken = await getAccessToken();

    // 1. Create Product
    const productRes = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Bloom Pro",
        description: "Unlimited AI analysis, stock picks, and portfolio tracking.",
        type: "SERVICE",
        category: "SOFTWARE",
      }),
    });
    
    const product = await productRes.json();
    if (!productRes.ok) throw new Error("Failed to create product");

    // 2. Create Monthly Plan ($7.99/mo)
    const monthlyPlanRes = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: product.id,
        name: "Bloom Pro Monthly",
        description: "Monthly subscription to Bloom Pro",
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: { interval_unit: "MONTH", interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: { value: "7.99", currency_code: "USD" },
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
    const monthlyPlan = await monthlyPlanRes.json();

    // 3. Create Annual Plan ($57.99/yr)
    const annualPlanRes = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: product.id,
        name: "Bloom Pro Annual",
        description: "Annual subscription to Bloom Pro",
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: { interval_unit: "YEAR", interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: { value: "57.99", currency_code: "USD" },
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
    const annualPlan = await annualPlanRes.json();

    return res.status(200).json({
      product_id: product.id,
      monthly_plan_id: monthlyPlan.id,
      annual_plan_id: annualPlan.id,
      message: "Please save these plan IDs to your environment variables as PAYPAL_MONTHLY_PLAN_ID and PAYPAL_ANNUAL_PLAN_ID"
    });
  } catch (error: any) {
    console.error("Error creating plans:", error);
    return res.status(500).json({ error: error.message });
  }
}