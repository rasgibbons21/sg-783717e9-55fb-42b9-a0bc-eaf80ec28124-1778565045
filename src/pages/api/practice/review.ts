import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are Pansy — an educational trading coach reviewing a closed practice trade. Judge the PROCESS, not the outcome. A disciplined loss (stopped at the planned level, thesis respected) scores higher than an undisciplined win (no stop, no plan, held past target on hope).

Return ONLY valid JSON (no markdown, no code fences):
{
  "score_pl": <0-100>,
  "score_rr": <0-100>,
  "score_entry": <0-100>,
  "score_exit": <0-100>,
  "score_discipline": <0-100>,
  "overall_grade": "<A|B|C|D|F>",
  "what_went_well": "<1–2 sentences about specific process positives>",
  "what_to_improve": "<1–2 sentences — the single most important process gap>",
  "followed_plan": "<1–2 sentences assessing plan adherence — cite their exact words where possible>",
  "remember_next": "<one memorable, specific coaching takeaway for this trader>"
}

Scoring rubric:
- score_pl   — how the P&L compares to the stated risk/target ratio (win against a bad plan = low; loss within planned risk = decent)
- score_rr   — was a sensible R/R defined before entry? (no stop OR no target = 0–30)
- score_entry — was a thesis written? were entry conditions defined? (checklist-style thesis = high)
- score_exit  — did they exit at planned levels? (stopped at stated stop = high; random exit = low)
- score_discipline — overall process: stop set + target set + thesis written + plan followed
- Grade: A=discipline 90+, B=70–89, C=50–69, D=30–49, F<30
- Never reference profit/loss as success or failure on its own. Process is everything.
- Never give price targets, market views, or buy/sell/hold advice.
- Factual, educational, concise.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const { trade_id } = req.body;
  if (!trade_id || typeof trade_id !== "string") {
    return res.status(400).json({ error: "trade_id required" });
  }

  const { data: trade, error: dbErr } = await supabaseAdmin
    .from("practice_trades")
    .select("*")
    .eq("id", trade_id)
    .eq("user_id", auth.user!.id)
    .eq("status", "closed")
    .single();

  if (dbErr || !trade) {
    return res.status(404).json({ error: "Closed trade not found" });
  }

  // Duration
  const durationMinutes = trade.exit_at && trade.entry_at
    ? Math.round((new Date(trade.exit_at).getTime() - new Date(trade.entry_at).getTime()) / 60000)
    : null;

  // R/R at entry
  let rrLabel = "No stop or target set";
  if (trade.stop_price != null && trade.target_price != null) {
    const risk = trade.direction === "long"
      ? trade.entry_price - trade.stop_price
      : trade.stop_price - trade.entry_price;
    const reward = trade.direction === "long"
      ? trade.target_price - trade.entry_price
      : trade.entry_price - trade.target_price;
    if (risk > 0 && reward > 0) rrLabel = `1 : ${(reward / risk).toFixed(2)}`;
  }

  const context = [
    `Ticker: ${trade.ticker} | Direction: ${trade.direction?.toUpperCase()}`,
    `Entry: $${Number(trade.entry_price).toFixed(2)} | Exit: $${Number(trade.exit_price).toFixed(2)}`,
    trade.stop_price != null ? `Stop (invalidation): $${Number(trade.stop_price).toFixed(2)}` : "Stop: NOT SET",
    trade.target_price != null ? `Target: $${Number(trade.target_price).toFixed(2)}` : "Target: NOT SET",
    `R/R at entry: ${rrLabel}`,
    `Shares: ${trade.shares} | Risk amount: ${trade.risk_amount != null ? `$${Number(trade.risk_amount).toFixed(2)}` : "not calculated"}`,
    `P/L: ${Number(trade.pnl) >= 0 ? "+" : ""}$${Number(trade.pnl).toFixed(2)} (${Number(trade.pnl_pct) >= 0 ? "+" : ""}${Number(trade.pnl_pct).toFixed(2)}%)`,
    durationMinutes != null ? `Duration: ${durationMinutes < 60 ? `${durationMinutes}m` : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`}` : null,
    trade.exit_reason ? `Exit reason given: ${trade.exit_reason}` : "Exit reason: none provided",
    "",
    trade.thesis ? `Pre-trade plan (thesis):\n${trade.thesis}` : "Pre-trade plan: NONE WRITTEN",
  ].filter(Boolean).join("\n");

  let review: {
    score_pl: number; score_rr: number; score_entry: number;
    score_exit: number; score_discipline: number; overall_grade: string;
    what_went_well: string; what_to_improve: string;
    followed_plan: string; remember_next: string;
  };

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `Trade to review:\n${context}\n\nReturn the JSON review.`,
      }],
    });

    let raw = "";
    for (const block of response.content) {
      if (block.type === "text") raw += block.text;
    }
    raw = raw.replace(/```[a-z]*\n?/g, "").trim();
    review = JSON.parse(raw);
  } catch {
    return res.status(500).json({ error: "Review generation failed — try again" });
  }

  // Save to practice_journal
  const { data: journal, error: insertErr } = await supabaseAdmin
    .from("practice_journal")
    .insert({
      user_id: auth.user!.id,
      trade_id: trade.id,
      ticker: trade.ticker,
      direction: trade.direction,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      stop_price: trade.stop_price,
      target_price: trade.target_price,
      shares: trade.shares,
      pnl: trade.pnl,
      pnl_pct: trade.pnl_pct,
      risk_amount: trade.risk_amount,
      duration_minutes: durationMinutes,
      thesis: trade.thesis,
      exit_reason: trade.exit_reason,
      closed_at: trade.exit_at,
      score_pl: review.score_pl,
      score_rr: review.score_rr,
      score_entry: review.score_entry,
      score_exit: review.score_exit,
      score_discipline: review.score_discipline,
      overall_grade: review.overall_grade,
      what_went_well: review.what_went_well,
      what_to_improve: review.what_to_improve,
      followed_plan: review.followed_plan,
      remember_next: review.remember_next,
    })
    .select("id")
    .single();

  if (insertErr) {
    console.error("journal insert error", insertErr);
    // Return review even if journal save failed
    return res.status(200).json({ review, journal_id: null, warning: "Journal save failed" });
  }

  return res.status(200).json({ review, journal_id: journal.id });
}
