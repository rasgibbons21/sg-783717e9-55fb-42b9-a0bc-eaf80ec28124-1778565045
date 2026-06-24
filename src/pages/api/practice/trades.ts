import type { NextApiRequest, NextApiResponse } from "next";
import { requireProUser } from "@/lib/requireProUser";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireProUser(req);
  if (auth.error) return res.status(auth.error).json({ error: "Unauthorized" });
  const userId = auth.user!.id;

  // ── GET: list all trades for user ──────────────────────────────────────────
  if (req.method === "GET") {
    const { data: trades, error } = await supabaseAdmin
      .from("practice_trades")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ trades });
  }

  // ── POST: open a new trade ─────────────────────────────────────────────────
  if (req.method === "POST") {
    const { ticker, direction, shares, entry_price, stop_price, target_price, thesis } = req.body;

    if (!ticker || !direction || !shares || !entry_price)
      return res.status(400).json({ error: "ticker, direction, shares, entry_price required" });
    if (!["long", "short"].includes(direction))
      return res.status(400).json({ error: "direction must be long or short" });

    const cost = Number(shares) * Number(entry_price);

    // Get account
    const { data: account, error: accErr } = await supabaseAdmin
      .from("practice_account")
      .select("id, cash_balance")
      .eq("user_id", userId)
      .single();

    if (accErr || !account) return res.status(404).json({ error: "Account not found" });
    if (Number(account.cash_balance) < cost)
      return res.status(400).json({ error: "Insufficient buying power" });

    // Deduct cash and open trade atomically
    const riskAmount = stop_price
      ? Math.abs((Number(entry_price) - Number(stop_price)) * Number(shares))
      : null;

    const { data: trade, error: tradeErr } = await supabaseAdmin
      .from("practice_trades")
      .insert({
        user_id: userId,
        account_id: account.id,
        ticker: ticker.toUpperCase().trim(),
        direction,
        shares: Number(shares),
        entry_price: Number(entry_price),
        stop_price: stop_price ? Number(stop_price) : null,
        target_price: target_price ? Number(target_price) : null,
        risk_amount: riskAmount,
        thesis: thesis || null,
        status: "open",
      })
      .select()
      .single();

    if (tradeErr) return res.status(500).json({ error: tradeErr.message });

    await supabaseAdmin
      .from("practice_account")
      .update({ cash_balance: Number(account.cash_balance) - cost, updated_at: new Date().toISOString() })
      .eq("id", account.id);

    return res.status(201).json({ trade });
  }

  return res.status(405).end();
}
