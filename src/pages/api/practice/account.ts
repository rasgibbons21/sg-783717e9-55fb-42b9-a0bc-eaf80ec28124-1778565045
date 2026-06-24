import type { NextApiRequest, NextApiResponse } from "next";
import { requireProUser } from "@/lib/requireProUser";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const auth = await requireProUser(req);
  if (auth.error) return res.status(auth.error).json({ error: "Unauthorized" });
  const userId = auth.user!.id;

  // Idempotent: get existing account or create with $10,000
  const { data: existing, error: fetchErr } = await supabaseAdmin
    .from("practice_account")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existing) {
    return res.status(200).json({ account: existing });
  }

  if (fetchErr && fetchErr.code !== "PGRST116") {
    return res.status(500).json({ error: fetchErr.message });
  }

  const { data: created, error: createErr } = await supabaseAdmin
    .from("practice_account")
    .insert({ user_id: userId, cash_balance: 10000, initial_balance: 10000 })
    .select()
    .single();
  if (createErr) return res.status(500).json({ error: createErr.message });

  return res.status(200).json({ account: created });
}
