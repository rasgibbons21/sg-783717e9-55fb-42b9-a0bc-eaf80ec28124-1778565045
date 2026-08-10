import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const REWARD_DAYS = 7;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Unauthorized" });

  const { code } = req.body;
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Referral code required" });

  const normalizedCode = code.trim().toUpperCase();

  const { data: referrer } = await supabaseAdmin
    .from("profiles")
    .select("id, referral_code, trial_ends_at")
    .eq("referral_code", normalizedCode)
    .single();

  if (!referrer) return res.status(404).json({ error: "Invalid referral code" });
  if (referrer.id === user.id) return res.status(400).json({ error: "You can't use your own referral code" });

  const { data: existing } = await supabaseAdmin
    .from("referrals")
    .select("id")
    .eq("referred_id", user.id)
    .single();

  if (existing) return res.status(400).json({ error: "You've already used a referral code" });

  await supabaseAdmin.from("referrals").insert({
    referrer_id: referrer.id,
    referred_id: user.id,
    referral_code: normalizedCode,
    reward_applied: true,
  });

  // Extend the new user's trial by REWARD_DAYS
  const { data: newUserProfile } = await supabaseAdmin
    .from("profiles")
    .select("trial_ends_at")
    .eq("id", user.id)
    .single();

  const baseDate = newUserProfile?.trial_ends_at ? new Date(newUserProfile.trial_ends_at) : new Date();
  const newTrialEnd = new Date(baseDate);
  newTrialEnd.setDate(newTrialEnd.getDate() + REWARD_DAYS);

  await supabaseAdmin
    .from("profiles")
    .update({
      referred_by: normalizedCode,
      trial_ends_at: newTrialEnd.toISOString(),
      is_pro: true,
      subscription_status: "trialing",
    })
    .eq("id", user.id);

  // Extend the referrer's trial by REWARD_DAYS
  const referrerBase = referrer.trial_ends_at ? new Date(referrer.trial_ends_at) : new Date();
  const referrerNewEnd = new Date(referrerBase);
  referrerNewEnd.setDate(referrerNewEnd.getDate() + REWARD_DAYS);

  await supabaseAdmin
    .from("profiles")
    .update({
      trial_ends_at: referrerNewEnd.toISOString(),
      is_pro: true,
      subscription_status: "trialing",
      referral_reward_days: (referrer as any).referral_reward_days
        ? (referrer as any).referral_reward_days + REWARD_DAYS
        : REWARD_DAYS,
    })
    .eq("id", referrer.id);

  return res.status(200).json({ success: true, rewardDays: REWARD_DAYS });
}
