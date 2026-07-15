import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";
import { rejectOversizedBody } from "@/lib/validateInput";
import { checkDirectives } from "@/lib/outputFilter";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are Pansy — an educational trading coach. Your ONLY job is to help the user reflect on whether the trade is still matching the plan THEY wrote before entering. You never evaluate current market conditions, never say a setup "looks good" or "still valid," and never give price targets, buy/sell/hold signals, or entry/exit advice.

Return ONLY valid JSON (no markdown, no prose, no code fences) in this exact shape:
{
  "coaching": ["<reflective question>", "<reflective question>", "<reflective question>"]
}

Rules for every question:
- Reference the user's EXACT words from their plan where possible (thesis, trend, pattern, signal, key levels)
- Ask the user to compare what they wrote to what they are observing now — you never tell them what you observe
- Frame as open questions like "You wrote… — is that still true?" / "Your plan mentioned… — how does that compare now?"
- Never use phrases like "looks good," "still valid," "I see," "the chart shows," or any live market evaluation
- Never invent data — only reference facts from the trade context provided
- 3–4 questions, each 15–30 words
- Educational framing only — this is a simulator, not a brokerage`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  if (rejectOversizedBody(req, res)) return;

  const { limited } = await rateLimit(auth.user!.id, "pansy-coach", 15, 300);
  if (limited) return res.status(429).json(RATE_LIMIT_RESPONSE);

  const { trade_id, current_price } = req.body;

  if (!trade_id || typeof trade_id !== "string") {
    return res.status(400).json({ error: "trade_id required" });
  }
  if (current_price != null && typeof current_price !== "number") {
    return res.status(400).json({ error: "current_price must be a number" });
  }

  // Verify trade belongs to this user and is open
  const { data: trade, error: dbErr } = await supabaseAdmin
    .from("practice_trades")
    .select("id, ticker, direction, shares, entry_price, stop_price, target_price, thesis, risk_amount, entry_at, status")
    .eq("id", trade_id)
    .eq("user_id", auth.user!.id)
    .eq("status", "open")
    .single();

  if (dbErr || !trade) {
    return res.status(404).json({ error: "Trade not found" });
  }

  if (!trade.thesis || !trade.thesis.trim()) {
    return res.status(200).json({
      coaching: [
        "You haven't written a plan for this trade yet — head to Add Note to capture your thesis before coaching can begin.",
      ],
      noThesis: true,
    });
  }

  // Build trade context (facts only, no live evaluation)
  const direction = trade.direction === "long" ? "LONG" : "SHORT";
  const held = (() => {
    const diff = Date.now() - new Date(trade.entry_at).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m < 1 ? "<1" : m}m`;
  })();

  const priceLines: string[] = [];
  if (current_price != null) {
    const diff = trade.direction === "long"
      ? current_price - trade.entry_price
      : trade.entry_price - current_price;
    const diffPct = (diff / trade.entry_price) * 100;
    priceLines.push(`Current price: $${current_price.toFixed(2)} (${diff >= 0 ? "+" : ""}${diffPct.toFixed(2)}% from entry)`);

    if (trade.stop_price != null) {
      const toStop = trade.direction === "long"
        ? current_price - trade.stop_price
        : trade.stop_price - current_price;
      priceLines.push(`Distance to stop: $${Math.abs(toStop).toFixed(2)}`);
    }
    if (trade.target_price != null) {
      const toTarget = trade.direction === "long"
        ? trade.target_price - current_price
        : current_price - trade.target_price;
      priceLines.push(`Distance to target: $${Math.abs(toTarget).toFixed(2)}`);
    }
  }

  const context = [
    `Ticker: ${trade.ticker} | Direction: ${direction} | Held: ${held}`,
    `Entry: $${trade.entry_price.toFixed(2)} | Shares: ${trade.shares}`,
    trade.stop_price != null ? `Stop (invalidation): $${trade.stop_price.toFixed(2)}` : null,
    trade.target_price != null ? `Target: $${trade.target_price.toFixed(2)}` : null,
    trade.risk_amount != null ? `Risk: $${trade.risk_amount.toFixed(2)}` : null,
    ...priceLines,
    "",
    "User's written plan:",
    trade.thesis,
  ].filter(Boolean).join("\n");

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `Trade context:\n${context}\n\nReturn 3–4 reflective coaching questions grounded in the user's written plan.`,
      }],
    });

    let raw = "";
    for (const block of response.content) {
      if (block.type === "text") raw += block.text;
    }
    raw = raw.replace(/```[a-z]*\n?/g, "").trim();
    checkDirectives(raw, "pansy-coach");

    let parsed: { coaching: string[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Coaching parse error — try again" });
    }

    return res.status(200).json({
      coaching: parsed.coaching ?? [],
    });
  } catch (err: unknown) {
    console.error("pansy-coach error", err);
    return res.status(500).json({ error: "Coaching unavailable — try again" });
  }
}
