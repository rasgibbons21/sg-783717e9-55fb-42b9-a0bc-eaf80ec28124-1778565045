import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

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
    .select("id, referral_code")
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

  // Record the referral on the new user's profile
  await supabaseAdmin
    .from("profiles")
    .update({ referred_by: normalizedCode })
    .eq("id", user.id);

  return res.status(200).json({ success: true });
}
