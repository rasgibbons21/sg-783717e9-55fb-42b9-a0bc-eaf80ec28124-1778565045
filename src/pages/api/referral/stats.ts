import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Unauthorized" });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("referral_code, referral_reward_days")
    .eq("id", user.id)
    .single();

  const { data: referrals } = await supabaseAdmin
    .from("referrals")
    .select("id, created_at")
    .eq("referrer_id", user.id);

  return res.status(200).json({
    code: profile?.referral_code || null,
    totalReferrals: referrals?.length || 0,
    rewardDays: profile?.referral_reward_days || 0,
  });
}
