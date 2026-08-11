import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Email, code, and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const user = (users?.users ?? []).find(
    (u: any) => u.email?.toLowerCase() === normalizedEmail
  );

  if (!user) {
    return res.status(400).json({ error: "Invalid code" });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("verification_code, verification_sent_at")
    .eq("id", user.id)
    .single();

  if (!profile?.verification_code || profile.verification_code !== code) {
    return res.status(400).json({ error: "Invalid code" });
  }

  const sentAt = new Date(profile.verification_sent_at).getTime();
  if (Date.now() - sentAt > 10 * 60 * 1000) {
    return res.status(400).json({ error: "Code has expired. Please request a new one." });
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (updateError) {
    return res.status(500).json({ error: "Failed to update password" });
  }

  await supabaseAdmin
    .from("profiles")
    .update({ verification_code: null, verification_sent_at: null })
    .eq("id", user.id);

  return res.status(200).json({ success: true });
}
