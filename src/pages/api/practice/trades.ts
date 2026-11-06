import type { NextApiRequest, NextApiResponse } from "next";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { createClient } from "@supabase/supabase-js";
import { getServerQuote } from "@/lib/serverQuote";
import { getInstrument } from "@/config/instruments";
import { marginFor, pnlFor } from "@/lib/practice/maths";
import { SETUP_TYPES, TIMEFRAMES } from "@/config/setups";
import { isMarketOpen, marketRestingMessage } from "@/lib/practice/marketHours";
import { releaseCash, reserveCash } from "@/lib/practice/cash";

const MOST_RISK_PER_TRADE = 0.2;

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
    const { ticker, direction, shares, stop_price, target_price, thesis, setup_type, timeframe } = req.body;

    // A stop is required on every trade, because it teaches the habit that matters most.
    if (!ticker || !direction || stop_price == null)
      return res.status(400).json({ error: "Please choose a stock, a direction and a stop." });
    if (!["long", "short"].includes(direction))
      return res.status(400).json({ error: "Please choose buy or sell." });

    const instrument = getInstrument(ticker);
    if (!instrument) return res.status(400).json({ error: "That stock isn't available in Practice." });
    if (!instrument.listed) return res.status(400).json({ error: "That market isn't available in Practice anymore." });

    // Every trade records the setup and timeframe from the lessons, so the process can be scored.
    if (!SETUP_TYPES.includes(setup_type)) return res.status(400).json({ error: "Please choose the setup you're using." });
    if (!TIMEFRAMES.includes(timeframe)) return res.status(400).json({ error: "Please choose the timeframe you planned on." });

    const sh = Number(shares);
    const stop = Number(stop_price);
    if (!Number.isInteger(sh) || sh < 1) return res.status(400).json({ error: "Please choose a whole number of shares, at least 1." });
    if (!(stop > 0)) return res.status(400).json({ error: "Please choose a stop above zero." });

    if (!isMarketOpen(instrument.symbol, new Date())) return res.status(409).json({ error: marketRestingMessage(instrument.symbol) });

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

    const riskAmount = Math.abs(pnlFor(instrument.symbol, direction, fill, stop, sh));
    if (riskAmount > Number(account.cash_balance) * MOST_RISK_PER_TRADE)
      return res.status(400).json({
        error: "That could lose more than a fifth of your simulated balance on one trade. Try a smaller size or a closer stop.",
        fill_price: fill,
      });

    if (!(await reserveCash(supabaseAdmin, account.id, cost)))
      return res.status(400).json({
        error: "That trade needs more simulated money than you have available. Try a smaller size.",
        fill_price: fill,
        cost,
        buying_power: Number(account.cash_balance),
      });

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
        risk_pct: Math.round((riskAmount / Number(account.cash_balance)) * 10000) / 100,
        setup_type,
        timeframe,
        thesis: thesis || null,
        status: "open",
      })
      .select()
      .single();

    if (tradeErr) {
      await releaseCash(supabaseAdmin, account.id, cost);
      return res.status(500).json({ error: "That didn't go through, and nothing has been charged. Please try again." });
    }

    return res.status(201).json({ trade, fill_price: fill, quote_ts: quote.ts });
  }

  return res.status(405).end();
}
