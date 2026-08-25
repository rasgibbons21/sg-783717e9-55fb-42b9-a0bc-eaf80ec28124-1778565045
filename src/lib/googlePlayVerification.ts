import { androidpublisher_v3, auth as googleAuth } from "@googleapis/androidpublisher";
import { createClient } from "@supabase/supabase-js";

const PACKAGE_NAME =
  process.env.GOOGLE_PLAY_PACKAGE_NAME || "app.shebloomswealth.mobile";

interface VerificationResult {
  valid: boolean;
  isPro: boolean;
  subscriptionStatus: string;
  expiryTime: string | null;
  acknowledged: boolean;
  error?: string;
}

interface SubscriptionState {
  isPro: boolean;
  subscriptionStatus: string;
  expiryTime: string | null;
}

function getPublisherClient() {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("GOOGLE_PLAY_SERVICE_ACCOUNT_KEY not configured");

  const credentials = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  const authClient = new googleAuth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });

  return new androidpublisher_v3.Androidpublisher({ auth: authClient });
}

function mapSubscriptionState(
  subscriptionState: string | null | undefined,
  expiryTime: string | null | undefined
): SubscriptionState {
  const now = Date.now();
  const expiry = expiryTime ? new Date(expiryTime).getTime() : 0;

  switch (subscriptionState) {
    case "SUBSCRIPTION_STATE_ACTIVE":
      return {
        isPro: true,
        subscriptionStatus: "active",
        expiryTime: expiryTime || null,
      };

    case "SUBSCRIPTION_STATE_IN_GRACE_PERIOD":
      return {
        isPro: true,
        subscriptionStatus: "grace_period",
        expiryTime: expiryTime || null,
      };

    case "SUBSCRIPTION_STATE_ON_HOLD":
      return {
        isPro: false,
        subscriptionStatus: "on_hold",
        expiryTime: expiryTime || null,
      };

    case "SUBSCRIPTION_STATE_PAUSED":
      return {
        isPro: false,
        subscriptionStatus: "paused",
        expiryTime: expiryTime || null,
      };

    case "SUBSCRIPTION_STATE_CANCELED":
      // Still has access until expiry
      return {
        isPro: expiry > now,
        subscriptionStatus: "canceled",
        expiryTime: expiryTime || null,
      };

    case "SUBSCRIPTION_STATE_EXPIRED":
      return {
        isPro: false,
        subscriptionStatus: "expired",
        expiryTime: expiryTime || null,
      };

    default:
      return {
        isPro: false,
        subscriptionStatus: "unknown",
        expiryTime: expiryTime || null,
      };
  }
}

export async function verifySubscription(
  purchaseToken: string,
  productId: string
): Promise<VerificationResult> {
  const publisher = getPublisherClient();

  const response =
    await publisher.purchases.subscriptionsv2.get({
      packageName: PACKAGE_NAME,
      token: purchaseToken,
    });

  const sub = response.data;

  if (!sub.subscriptionState) {
    return {
      valid: false,
      isPro: false,
      subscriptionStatus: "unknown",
      expiryTime: null,
      acknowledged: false,
      error: "No subscription state returned",
    };
  }

  const lineItem = sub.lineItems?.[0];
  const expiryTime = lineItem?.expiryTime || null;
  const state = mapSubscriptionState(sub.subscriptionState, expiryTime);
  const acknowledged = sub.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED";

  return {
    valid: true,
    isPro: state.isPro,
    subscriptionStatus: state.subscriptionStatus,
    expiryTime: state.expiryTime,
    acknowledged,
  };
}

export async function acknowledgeSubscription(
  purchaseToken: string,
  productId: string
): Promise<void> {
  const publisher = getPublisherClient();

  await publisher.purchases.subscriptions.acknowledge({
    packageName: PACKAGE_NAME,
    subscriptionId: productId,
    token: purchaseToken,
  });
}

export async function verifyAndUpdateProfile(
  purchaseToken: string,
  productId: string,
  basePlanId: string | null,
  userId: string
): Promise<VerificationResult> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Prevent token reuse across different users
  const { data: existingOwner } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("google_play_purchase_token", purchaseToken)
    .not("id", "eq", userId)
    .maybeSingle();

  if (existingOwner) {
    return {
      valid: false,
      isPro: false,
      subscriptionStatus: "token_conflict",
      expiryTime: null,
      acknowledged: false,
      error: "This purchase is already associated with a different account",
    };
  }

  const result = await verifySubscription(purchaseToken, productId);

  if (!result.valid) return result;

  // Acknowledge if not yet acknowledged
  if (!result.acknowledged) {
    try {
      await acknowledgeSubscription(purchaseToken, productId);
      result.acknowledged = true;
    } catch (ackErr: any) {
      console.error("Failed to acknowledge subscription:", ackErr.message);
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({
      is_pro: result.isPro,
      subscription_status: result.subscriptionStatus,
      current_period_end: result.expiryTime,
      entitlement_source: "google_play",
      google_play_purchase_token: purchaseToken,
      google_play_product_id: productId,
      google_play_base_plan_id: basePlanId,
      google_play_acknowledged: result.acknowledged,
      last_verification_time: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Failed to update profile:", updateError);
    return {
      ...result,
      error: "Failed to update profile",
    };
  }

  return result;
}
