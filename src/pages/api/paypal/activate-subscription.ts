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
    const { userId, subscriptionId, planType } = req.body;

    if (!userId || !subscriptionId || !planType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await paypalService.activateUserSubscription(userId, subscriptionId, planType);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error activating subscription:", error);
    res.status(500).json({ error: "Failed to activate subscription" });
  }
}