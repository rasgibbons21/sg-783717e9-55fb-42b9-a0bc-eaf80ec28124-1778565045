import type { NextApiRequest, NextApiResponse } from "next";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { createClient } from "@supabase/supabase-js";
import { getServerQuote } from "@/lib/serverQuote";
import { checkTradeAchievements } from "@/lib/achievementChecker";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
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

  // Auto-journal the closed trade (basic entry — user can enrich via review later)
  const durationMs = new Date(updated.exit_at).getTime() - new Date(trade.created_at).getTime();
  const durationMinutes = Math.max(1, Math.round(durationMs / 60000));

  const journalPayload = {
    user_id: userId,
    trade_id: trade.id,
    ticker: trade.ticker,
    direction: trade.direction,
    entry_price: trade.entry_price,
    exit_price: exitP,
    stop_price: trade.stop_price,
    target_price: trade.target_price,
    shares: trade.shares,
    pnl,
    pnl_pct,
    risk_amount: trade.risk_amount,
    duration_minutes: durationMinutes,
    thesis: trade.thesis,
    exit_reason: exit_reason || null,
    closed_at: updated.exit_at,
  };

  const { error: jErr } = await supabaseAdmin
    .from("practice_journal")
    .insert(journalPayload);

  if (jErr) {
    console.error("Auto-journal insert error:", jErr.message, jErr.details);
    if (jErr.code === "23505") {
      await supabaseAdmin
        .from("practice_journal")
        .update(journalPayload)
        .eq("trade_id", trade.id);
    }
  }

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

  // Check trade achievements in the background
  const { data: allClosed } = await supabaseAdmin
    .from("practice_trades")
    .select("pnl, thesis")
    .eq("user_id", userId)
    .eq("status", "closed");

  if (allClosed) {
    let winStreak = 0;
    const sortedTrades = allClosed;
    for (let i = sortedTrades.length - 1; i >= 0; i--) {
      if (Number(sortedTrades[i].pnl) > 0) winStreak++;
      else break;
    }

    await checkTradeAchievements(userId, {
      totalClosed: allClosed.length,
      winStreak,
      hasProfitableTrade: pnl > 0,
      hasThesis: !!trade.thesis,
      thesisTradeCount: allClosed.filter(t => !!t.thesis).length,
      hasGoodRR: pnl_pct >= 2,
    });
  }

  return res.status(200).json({ trade: updated, pnl, exit_price: exitP });
}
