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
  if (!code || typeof code !== "string") return res.status(400).json({ error: "Code required" });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("verification_code, verification_sent_at")
    .eq("id", user.id)
    .single();

  if (!profile?.verification_code) {
    return res.status(400).json({ error: "No verification code found. Request a new one." });
  }

  const sentAt = profile.verification_sent_at ? new Date(profile.verification_sent_at) : null;
  if (sentAt && Date.now() - sentAt.getTime() > 10 * 60 * 1000) {
    return res.status(400).json({ error: "Code expired. Request a new one." });
  }

  if (profile.verification_code !== code.trim()) {
    return res.status(400).json({ error: "Incorrect code. Please try again." });
  }

  await supabaseAdmin
    .from("profiles")
    .update({
      email_verified: true,
      verification_code: null,
      verification_sent_at: null,
    })
    .eq("id", user.id);

  return res.status(200).json({ verified: true });
}
