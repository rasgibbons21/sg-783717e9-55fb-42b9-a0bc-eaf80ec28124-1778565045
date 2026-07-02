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

  // ── POST: open a new trade (market order, mandatory stop) ──────────────────
  if (req.method === "POST") {
    const { ticker, direction, shares, stop_price, target_price, thesis } = req.body;

    // Stop is now mandatory — same tier as ticker/direction/shares.
    if (!ticker || !direction || !shares || stop_price == null)
      return res.status(400).json({ error: "ticker, direction, shares, stop_price required" });
    if (!["long", "short"].includes(direction))
      return res.status(400).json({ error: "direction must be long or short" });

    const sh = Number(shares);
    const stop = Number(stop_price);
    if (!(sh > 0)) return res.status(400).json({ error: "shares must be a positive number" });
    if (!(stop > 0)) return res.status(400).json({ error: "stop must be a positive number" });

    // Fresh server-side market fill — never trust a client-supplied entry price.
    const quote = await getServerQuote(ticker);
    if (!quote)
      return res.status(502).json({ error: "Couldn't get a live price for that ticker right now — try again in a moment." });
    const fill = quote.price;

    // Stop must sit on the correct side of the fill, within sane bounds.
    if (direction === "long" && !(stop < fill))
      return res.status(400).json({ error: "A long's stop must sit below your entry price.", fill_price: fill });
    if (direction === "short" && !(stop > fill))
      return res.status(400).json({ error: "A short's stop must sit above your entry price.", fill_price: fill });
    if (Math.abs(fill - stop) / fill > 0.5)
      return res.status(400).json({ error: "That stop is more than 50% away — double-check it for a typo.", fill_price: fill });

    const cost = sh * fill;

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
        error: "Insufficient buying power",
        fill_price: fill,
        cost,
        buying_power: Number(account.cash_balance),
      });

    const riskAmount = Math.abs((fill - stop) * sh);

    const { data: trade, error: tradeErr } = await supabaseAdmin
      .from("practice_trades")
      .insert({
        user_id: userId,
        account_id: account.id,
        ticker: ticker.toUpperCase().trim(),
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
