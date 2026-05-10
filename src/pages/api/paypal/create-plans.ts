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
    const monthlyPlanId = await paypalService.createSubscriptionPlan(
      "Bloom Pro - Monthly",
      "Monthly subscription to Bloom Pro with unlimited picks and analysis",
      "7.99",
      "MONTH"
    );

    const yearlyPlanId = await paypalService.createSubscriptionPlan(
      "Bloom Pro - Yearly",
      "Yearly subscription to Bloom Pro with unlimited picks and analysis - Save 40%",
      "57.99",
      "YEAR"
    );

    res.status(200).json({
      success: true,
      monthly: monthlyPlanId,
      yearly: yearlyPlanId,
    });
  } catch (error) {
    console.error("Error creating PayPal plans:", error);
    res.status(500).json({ error: "Failed to create subscription plans" });
  }
}