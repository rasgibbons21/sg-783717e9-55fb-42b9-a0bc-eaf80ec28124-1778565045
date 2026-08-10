import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BLOOM-";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Unauthorized" });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single();

  if (profile?.referral_code) {
    return res.status(200).json({ code: profile.referral_code });
  }

  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("referral_code", code)
      .single();

    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  await supabaseAdmin
    .from("profiles")
    .update({ referral_code: code })
    .eq("id", user.id);

  return res.status(200).json({ code });
}
