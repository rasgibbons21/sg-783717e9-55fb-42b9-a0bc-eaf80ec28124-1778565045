import type { NextApiRequest, NextApiResponse } from "next";
import { requireProUser } from "@/lib/requireProUser";
import { createClient } from "@supabase/supabase-js";
import { getServerQuote } from "@/lib/serverQuote";

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

  const { trade_id, exit_reason } = req.body;
  if (!trade_id)
    return res.status(400).json({ error: "trade_id required" });

  const { data: trade, error: tradeErr } = await supabaseAdmin
    .from("practice_trades")
    .select("*")
    .eq("id", trade_id)
    .eq("user_id", userId)
    .eq("status", "open")
    .single();

  if (tradeErr || !trade) return res.status(404).json({ error: "Open trade not found" });

  // Fresh server-side market fill for the exit — honest close, no client price.
  const quote = await getServerQuote(trade.ticker);
  if (!quote)
    return res.status(502).json({ error: "Couldn't get a live price to close right now — try again in a moment." });
  const exitP = quote.price;

  const rawPnl =
    trade.direction === "long"
      ? (exitP - Number(trade.entry_price)) * Number(trade.shares)
      : (Number(trade.entry_price) - exitP) * Number(trade.shares);

  const pnl = Math.round(rawPnl * 100) / 100;
  const pnl_pct =
    Math.round(((exitP - Number(trade.entry_price)) / Number(trade.entry_price)) *
      (trade.direction === "short" ? -1 : 1) *
      10000) / 100;

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

  // Release the reserved cost (entry × shares) + realized P&L back to buying power.
  // This is direction-correct: for a long it equals exit×shares (unchanged), and
  // for a short it credits the true result (the old exit×shares INVERTED shorts).
  const credit = Number(trade.entry_price) * Number(trade.shares) + pnl;

  const { data: account } = await supabaseAdmin
    .from("practice_account")
    .select("id, cash_balance")
    .eq("user_id", userId)
    .single();

  if (account) {
    await supabaseAdmin
      .from("practice_account")
      .update({
        cash_balance: Number(account.cash_balance) + credit,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);
  }

  return res.status(200).json({ trade: updated, pnl, exit_price: exitP });
}
