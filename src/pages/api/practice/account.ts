import type { NextApiRequest, NextApiResponse } from "next";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).end();

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user!.id;

  // Start again: close anything still open at no result and restore the starting balance.
  // Past results stay, so restarting can't change a leaderboard total.
  if (req.method === "POST") {
    const { data: account } = await supabaseAdmin
      .from("practice_account")
      .select("id, initial_balance")
      .eq("user_id", userId)
      .single();
    if (!account) return res.status(404).json({ error: "We couldn't find your practice account." });

    const now = new Date().toISOString();
    const { error: tradesErr } = await supabaseAdmin
      .from("practice_trades")
      .update({ status: "closed", pnl: 0, pnl_pct: 0, exit_reason: "Started again", exit_at: now })
      .eq("user_id", userId)
      .eq("status", "open");
    if (tradesErr) return res.status(500).json({ error: "We couldn't start again just now. Please try again." });

    const { data: updated, error: resetErr } = await supabaseAdmin
      .from("practice_account")
      .update({ cash_balance: account.initial_balance, updated_at: now })
      .eq("id", account.id)
      .select()
      .single();
    if (resetErr) return res.status(500).json({ error: "We couldn't start again just now. Please try again." });
    return res.status(200).json({ account: updated });
  }

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
