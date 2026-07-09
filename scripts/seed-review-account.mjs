/**
 * Server-side seed script for the Google Play review account.
 *
 * Usage:
 *   REVIEW_ACCOUNT_PASSWORD=<pw> \
 *   NEXT_PUBLIC_SUPABASE_URL=<url> \
 *   SUPABASE_SERVICE_ROLE_KEY=<key> \
 *   node scripts/seed-review-account.mjs
 *
 * Idempotent: re-running updates rather than erroring.
 */

import { createClient } from "@supabase/supabase-js";

const REVIEW_EMAIL = "review@shebloomswealth.app";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.REVIEW_ACCOUNT_PASSWORD;

if (!url || !key || !password) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, REVIEW_ACCOUNT_PASSWORD"
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1. Create auth user (or find existing)
  let userId;

  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email: REVIEW_EMAIL,
      password,
      email_confirm: true,
    });

  if (createErr) {
    if (
      createErr.message.includes("already been registered") ||
      createErr.status === 422
    ) {
      console.log("User already exists — fetching by email…");
      const { data: list, error: listErr } =
        await supabase.auth.admin.listUsers();
      if (listErr) throw listErr;
      const existing = list.users.find((u) => u.email === REVIEW_EMAIL);
      if (!existing) throw new Error("User exists but could not be found");
      userId = existing.id;

      // Update password in case it changed
      await supabase.auth.admin.updateUserById(userId, { password });
    } else {
      throw createErr;
    }
  } else {
    userId = created.user.id;
    console.log("Created auth user:", userId);
  }

  // 2. Upsert profiles row
  const { error: profileErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: REVIEW_EMAIL,
      full_name: "App Reviewer",
      is_pro: true,
      subscription_status: "active",
      is_review_account: true,
    },
    { onConflict: "id" }
  );

  if (profileErr) throw profileErr;

  console.log("Profile upserted for review account:", userId);
  console.log("Done. The review account is ready.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
