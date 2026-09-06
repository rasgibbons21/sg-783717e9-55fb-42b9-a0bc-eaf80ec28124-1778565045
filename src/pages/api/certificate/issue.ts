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

  const { course_id, level } = req.body;
  if (!course_id || !level) return res.status(400).json({ error: "Missing course_id or level" });

  const { data: existing } = await supabaseAdmin
    .from("certificates_issued")
    .select("certificate_id")
    .eq("user_id", user.id)
    .eq("course_id", course_id)
    .single();

  if (existing) {
    return res.status(200).json({ certificate_id: existing.certificate_id, existing: true });
  }

  const certificateId = `BLOOM-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const { error: insertError } = await supabaseAdmin
    .from("certificates_issued")
    .insert({
      user_id: user.id,
      course_id,
      level,
      certificate_id: certificateId,
    });

  if (insertError) {
    console.error("Certificate issue error:", insertError);
    return res.status(500).json({ error: "Failed to issue certificate" });
  }

  return res.status(201).json({ certificate_id: certificateId, existing: false });
}
