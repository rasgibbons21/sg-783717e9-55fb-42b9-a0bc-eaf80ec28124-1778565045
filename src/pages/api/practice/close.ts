import type { NextApiRequest, NextApiResponse } from "next";
import { requireProUser } from "@/lib/requireProUser";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = await requireProUser(req);
  if (auth.error) return res.status(auth.error).json({ error: "Unauthorized" });
  const userId = auth.user!.id;

  const { trade_id, exit_price, exit_reason } = req.body;
  if (!trade_id || !exit_price)
    return res.status(400).json({ error: "trade_id and exit_price required" });

  const { data: trade, error: tradeErr } = await supabaseAdmin
    .from("practice_trades")
    .select("*")
    .eq("id", trade_id)
    .eq("user_id", userId)
    .eq("status", "open")
    .single();

  if (tradeErr || !trade) return res.status(404).json({ error: "Open trade not found" });

  const exitP = Number(exit_price);
  const rawPnl =
    trade.direction === "long"
      ? (exitP - Number(trade.entry_price)) * Number(trade.shares)
      : (Number(trade.entry_price) - exitP) * Number(trade.shares);

  const pnl = Math.round(rawPnl * 100) / 100;
  const pnl_pct =
    Math.round(((exitP - Number(trade.entry_price)) / Number(trade.entry_price)) *
      (trade.direction === "short" ? -1 : 1) *
      10000) / 100;

  const positionValue = exitP * Number(trade.shares);

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("practice_trades")
    .update({
      exit_price: exitP,
      exit_reason: exit_reason || null,
      pnl,
      pnl_pct,
      status: "closed",
      exit_at: new Date().toISOString(),
    })
    .eq("id", trade_id)
    .select()
    .single();

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Return proceeds (exit value) to buying power
  const { data: account } = await supabaseAdmin
    .from("practice_account")
    .select("id, cash_balance")
    .eq("user_id", userId)
    .single();

  if (account) {
    await supabaseAdmin
      .from("practice_account")
      .update({
        cash_balance: Number(account.cash_balance) + positionValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);
  }

  return res.status(200).json({ trade: updated, pnl });
}
