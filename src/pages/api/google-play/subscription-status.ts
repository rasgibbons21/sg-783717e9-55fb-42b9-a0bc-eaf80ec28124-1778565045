import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { verifySubscription } from "@/lib/googlePlayVerification";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select(
      "google_play_purchase_token, google_play_product_id, entitlement_source, subscription_status, is_pro"
    )
    .eq("id", auth.user!.id)
    .single();

  if (
    !profile?.google_play_purchase_token ||
    profile.entitlement_source !== "google_play"
  ) {
    return res.status(200).json({
      hasGooglePlaySubscription: false,
      isPro: profile?.is_pro ?? false,
      subscriptionStatus: profile?.subscription_status ?? null,
    });
  }

  try {
    const result = await verifySubscription(
      profile.google_play_purchase_token,
      profile.google_play_product_id!
    );

    if (
      result.valid &&
      (result.isPro !== profile.is_pro ||
        result.subscriptionStatus !== profile.subscription_status)
    ) {
      await supabaseAdmin
        .from("profiles")
        .update({
          is_pro: result.isPro,
          subscription_status: result.subscriptionStatus,
          current_period_end: result.expiryTime,
          last_verification_time: new Date().toISOString(),
        })
        .eq("id", auth.user!.id);
    }

    return res.status(200).json({
      hasGooglePlaySubscription: true,
      isPro: result.valid ? result.isPro : profile.is_pro,
      subscriptionStatus: result.valid
        ? result.subscriptionStatus
        : profile.subscription_status,
      expiryTime: result.expiryTime,
    });
  } catch (error: any) {
    console.error("Google Play status check error:", error);
    return res.status(200).json({
      hasGooglePlaySubscription: true,
      isPro: profile.is_pro,
      subscriptionStatus: profile.subscription_status,
      error: "Could not verify current status with Google Play",
    });
  }
}
