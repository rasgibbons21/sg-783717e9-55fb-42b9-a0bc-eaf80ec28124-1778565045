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
  if (!trade_id || !exit_price) return res.status(400).json({ error: "trade_id and exit_price required" });

  const { data: trade, error: tradeErr } = await supabaseAdmin
    .from("practice_trades")
    .select("*")
    .eq("id", trade_id)
    .eq("user_id", userId)
    .eq("status", "open")
    .single();

  if (tradeErr || !trade) return res.status(404).json({ error: "Open trade not found" });

  const exitP = Number(exit_price);
  const fullShares = Number(trade.shares);
  if (fullShares < 0.0002) return res.status(400).json({ error: "Position too small to halve" });

  const halfShares = fullShares / 2;
  const remainingShares = fullShares - halfShares; // avoids float drift

  const rawPnl = trade.direction === "long"
    ? (exitP - Number(trade.entry_price)) * halfShares
    : (Number(trade.entry_price) - exitP) * halfShares;
  const pnl = Math.round(rawPnl * 100) / 100;
  const pnl_pct = Math.round(
    ((exitP - Number(trade.entry_price)) / Number(trade.entry_price)) *
      (trade.direction === "short" ? -1 : 1) * 10000
  ) / 100;

  const halfRisk = trade.stop_price
    ? Math.abs((Number(trade.entry_price) - Number(trade.stop_price)) * halfShares)
    : null;

  const now = new Date().toISOString();

  // Record the closed half as a new trade row
  const { error: insertErr } = await supabaseAdmin
    .from("practice_trades")
    .insert({
      user_id: userId,
      account_id: trade.account_id,
      ticker: trade.ticker,
      direction: trade.direction,
      shares: halfShares,
      entry_price: trade.entry_price,
      exit_price: exitP,
      stop_price: trade.stop_price,
      target_price: trade.target_price,
      pnl,
      pnl_pct,
      risk_amount: halfRisk,
      thesis: trade.thesis,
      exit_reason: exit_reason || "partial close",
      status: "closed",
      entry_at: trade.entry_at,
      exit_at: now,
    });

  if (insertErr) return res.status(500).json({ error: insertErr.message });

  // Shrink the original trade to the remaining half
  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("practice_trades")
    .update({
      shares: remainingShares,
      risk_amount: trade.stop_price
        ? Math.abs((Number(trade.entry_price) - Number(trade.stop_price)) * remainingShares)
        : null,
    })
    .eq("id", trade_id)
    .select()
    .single();

  if (updateErr) return res.status(500).json({ error: updateErr.message });

  // Return half-position exit value to account cash
  const { data: account } = await supabaseAdmin
    .from("practice_account")
    .select("id, cash_balance")
    .eq("user_id", userId)
    .single();

  if (account) {
    await supabaseAdmin
      .from("practice_account")
      .update({
        cash_balance: Number(account.cash_balance) + exitP * halfShares,
        updated_at: now,
      })
      .eq("id", account.id);
  }

  return res.status(200).json({ trade: updated, closedShares: halfShares, pnl });
}
