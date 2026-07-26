import type { NextApiRequest, NextApiResponse } from "next";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { verifyAndUpdateProfile } from "@/lib/googlePlayVerification";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const { purchaseToken, productId, basePlanId } = req.body;

  if (!purchaseToken || typeof purchaseToken !== "string") {
    return res.status(400).json({ error: "purchaseToken is required" });
  }
  if (!productId || typeof productId !== "string") {
    return res.status(400).json({ error: "productId is required" });
  }

  try {
    const result = await verifyAndUpdateProfile(
      purchaseToken,
      productId,
      basePlanId || null,
      auth.user!.id
    );

    if (!result.valid) {
      return res.status(400).json({
        error: result.error || "Purchase verification failed",
        subscriptionStatus: result.subscriptionStatus,
      });
    }

    return res.status(200).json({
      verified: true,
      isPro: result.isPro,
      subscriptionStatus: result.subscriptionStatus,
      expiryTime: result.expiryTime,
      acknowledged: result.acknowledged,
    });
  } catch (error: any) {
    console.error("Google Play verification error:", error);
    return res.status(500).json({
      error: "Verification failed. Please try again.",
    });
  }
}
