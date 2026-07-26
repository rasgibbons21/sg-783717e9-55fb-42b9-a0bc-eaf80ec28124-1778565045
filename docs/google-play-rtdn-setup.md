# Google Play Real-time Developer Notifications (RTDN) Setup

This document describes how to add RTDN to automatically handle subscription lifecycle events (renewals, cancellations, refunds, grace periods) without polling.

## Prerequisites

- Google Cloud project linked to Play Console
- Service account with `androidpublisher` access (already created for purchase verification)
- The `googlePlayVerification.ts` module (already implemented)

## Steps

### 1. Create a Pub/Sub Topic

```bash
gcloud pubsub topics create play-billing-notifications \
  --project=YOUR_GCP_PROJECT_ID
```

### 2. Configure Play Console

1. Open [Play Console](https://play.google.com/console)
2. Navigate to **Monetization setup** → **Real-time developer notifications**
3. Set the topic name: `projects/YOUR_GCP_PROJECT_ID/topics/play-billing-notifications`
4. Click **Send test notification** to verify

### 3. Create a Pub/Sub Push Subscription

```bash
gcloud pubsub subscriptions create play-billing-push \
  --topic=play-billing-notifications \
  --push-endpoint=https://shebloomswealth.app/api/google-play/rtdn-webhook \
  --ack-deadline=30 \
  --project=YOUR_GCP_PROJECT_ID
```

### 4. Create the Webhook API Route

Create `src/pages/api/google-play/rtdn-webhook.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { verifySubscription } from "@/lib/googlePlayVerification";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  // Pub/Sub sends base64-encoded data in message.data
  const message = req.body?.message;
  if (!message?.data) return res.status(400).json({ error: "No message data" });

  const decoded = JSON.parse(Buffer.from(message.data, "base64").toString("utf8"));

  // decoded contains: { version, packageName, eventTimeMillis, subscriptionNotification? }
  const notification = decoded.subscriptionNotification;
  if (!notification) return res.status(200).json({ received: true }); // Ignore non-subscription events

  const { purchaseToken, subscriptionId, notificationType } = notification;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Find the user who owns this purchase token
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("google_play_purchase_token", purchaseToken)
    .single();

  if (!profile) {
    console.warn("RTDN: No user found for purchase token");
    return res.status(200).json({ received: true });
  }

  // Re-verify the subscription status using the shared verification logic
  const result = await verifySubscription(purchaseToken, subscriptionId);

  if (result.valid) {
    await supabaseAdmin
      .from("profiles")
      .update({
        is_pro: result.isPro,
        subscription_status: result.subscriptionStatus,
        current_period_end: result.expiryTime,
        last_verification_time: new Date().toISOString(),
      })
      .eq("id", profile.id);
  }

  return res.status(200).json({ received: true });
}
```

### 5. Environment Variables

No additional env vars needed — the webhook reuses `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.

### 6. Service Account Permissions

The service account already has `androidpublisher` access. For Pub/Sub push, Google Cloud handles delivery — no additional permissions needed on the service account.

### 7. Notification Types

| Type | Meaning | Action |
|------|---------|--------|
| 1 | SUBSCRIPTION_RECOVERED | Re-verify, set isPro=true |
| 2 | SUBSCRIPTION_RENEWED | Re-verify, update expiry |
| 3 | SUBSCRIPTION_CANCELED | Re-verify, keep access until expiry |
| 4 | SUBSCRIPTION_PURCHASED | Should already be handled by client |
| 5 | SUBSCRIPTION_ON_HOLD | Re-verify, set isPro=false |
| 6 | SUBSCRIPTION_IN_GRACE_PERIOD | Re-verify, keep access |
| 7 | SUBSCRIPTION_RESTARTED | Re-verify, set isPro=true |
| 12 | SUBSCRIPTION_REVOKED | Re-verify, set isPro=false |
| 13 | SUBSCRIPTION_EXPIRED | Re-verify, set isPro=false |
| 20 | SUBSCRIPTION_PAUSED | Re-verify, set isPro=false |

The `verifySubscription()` function in `googlePlayVerification.ts` handles all these states — it queries the current subscription state from the Play Developer API regardless of the notification type, ensuring the profile always reflects the true state.
