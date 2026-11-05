import type { NextApiRequest, NextApiResponse } from "next";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { createClient } from "@supabase/supabase-js";
import { getServerQuote } from "@/lib/serverQuote";
import { getInstrument } from "@/config/instruments";
import { lotsToUnits, marginFor, pnlFor } from "@/lib/practice/maths";
import { MARKET_RESTING_MESSAGE, isMarketOpen } from "@/lib/practice/marketHours";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
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

  // ── POST: open a new trade (market order, mandatory stop) ──────────────────
  if (req.method === "POST") {
    const { ticker, direction, lots, stop_price, target_price, thesis } = req.body;

    // A stop is required on every trade, because it teaches the habit that matters most.
    if (!ticker || !direction || stop_price == null)
      return res.status(400).json({ error: "Please choose an instrument, a direction and a stop." });
    if (!["long", "short"].includes(direction))
      return res.status(400).json({ error: "Please choose buy or sell." });

    const instrument = getInstrument(ticker);
    if (!instrument) return res.status(400).json({ error: "That instrument isn't available in Practice." });

    const lotSize = Number(lots);
    const stop = Number(stop_price);
    if (!(lotSize > 0)) return res.status(400).json({ error: "Please choose a lot size above zero." });
    if (!(stop > 0)) return res.status(400).json({ error: "Please choose a stop above zero." });

    if (!isMarketOpen(instrument.symbol, new Date())) return res.status(409).json({ error: MARKET_RESTING_MESSAGE });

    const sh = lotsToUnits(instrument.symbol, lotSize);

    // Fresh server-side market fill — never trust a client-supplied entry price.
    const quote = await getServerQuote(ticker);
    if (!quote)
      return res.status(502).json({ error: "We can't get a price just now, and nothing has been charged. Please try again in a moment." });
    const fill = quote.price;

    // Stop must sit on the correct side of the fill, within sane bounds.
    if (direction === "long" && !(stop < fill))
      return res.status(400).json({ error: "When you buy, your stop needs to be below the current price.", fill_price: fill });
    if (direction === "short" && !(stop > fill))
      return res.status(400).json({ error: "When you sell, your stop needs to be above the current price.", fill_price: fill });
    if (Math.abs(fill - stop) / fill > 0.5)
      return res.status(400).json({ error: "That stop is very far from the price. Could there be a typo?", fill_price: fill });

    const cost = marginFor(instrument.symbol, fill, sh);

    // Get account
    const { data: account, error: accErr } = await supabaseAdmin
      .from("practice_account")
      .select("id, cash_balance")
      .eq("user_id", userId)
      .single();

    if (accErr || !account) return res.status(404).json({ error: "Account not found" });

    // Structured 400 so the ticket can re-quote inline instead of showing a generic error.
    if (Number(account.cash_balance) < cost)
      return res.status(400).json({
        error: "That trade needs more simulated money than you have available. Try a smaller size.",
        fill_price: fill,
        cost,
        buying_power: Number(account.cash_balance),
      });

    const riskAmount = Math.abs(pnlFor(instrument.symbol, direction, fill, stop, sh));

    const { data: trade, error: tradeErr } = await supabaseAdmin
      .from("practice_trades")
      .insert({
        user_id: userId,
        account_id: account.id,
        ticker: instrument.symbol,
        direction,
        shares: sh,
        entry_price: fill,
        stop_price: stop,
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

    return res.status(201).json({ trade, fill_price: fill, quote_ts: quote.ts });
  }

  return res.status(405).end();
}
