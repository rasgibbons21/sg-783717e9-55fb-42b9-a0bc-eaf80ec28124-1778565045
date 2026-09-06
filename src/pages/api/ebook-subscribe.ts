import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await supabaseAdmin
    .from("ebook_subscribers")
    .upsert(
      { email: email.toLowerCase().trim(), downloaded: true },
      { onConflict: "email" }
    );

  if (error) {
    console.error("Ebook subscribe error:", error);
    return res.status(500).json({ error: "Could not save. Please try again." });
  }

  return res.status(200).json({ ok: true });
}
