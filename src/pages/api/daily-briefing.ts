import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function getTodayET(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === "year")!.value;
  const m = parts.find(p => p.type === "month")!.value;
  const d = parts.find(p => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

interface FinnhubQuote {
  c: number;   // current price
  d: number;   // change
  dp: number;  // change %
  pc: number;  // previous close
}

async function fetchQuote(symbol: string): Promise<FinnhubQuote | null> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as FinnhubQuote;
    if (!data || typeof data.c !== "number" || data.c === 0) return null;
    return data;
  } catch {
    return null;
  }
}

interface FinnhubNewsItem {
  headline: string;
  source: string;
  summary: string;
}

async function fetchNews(): Promise<FinnhubNewsItem[]> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${key}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.slice(0, 5).map((item: FinnhubNewsItem) => ({
      headline: item.headline,
      source: item.source,
      summary: item.summary,
    }));
  } catch {
    return [];
  }
}

const SYSTEM_PROMPT = `You are Pansy, the warm and knowledgeable voice of She Blooms Wealth — an investing education platform, not a brokerage or financial adviser.

Your morning briefing is a RECAP and CONTEXT piece only. Rules:
- Describe what the market DID in the last completed session — observational and past tense, never predictive.
- Reference the session as "the latest session" or "the last market close" — never name a specific weekday or say "yesterday."
- Only state figures that appear in the data provided to you. If a figure is missing or zero, omit it entirely — never estimate, invent, or fill in a number.
- VIXY is used only to describe the overall market mood (calm, anxious, elevated). Never cite its percentage move. Never call it "the VIX" — it is a futures ETF, not the index itself.
- SPY, QQQ, and DIA percentage moves CAN be described as the S&P 500, NASDAQ, and Dow Jones moves respectively.
- NEVER say "buy," "sell," "invest in," "I recommend," "this is a pick," or name any individual stock as an opportunity.
- NEVER promise, imply, or suggest expected returns or portfolio allocation.
- You may reference news themes (e.g. "earnings season," "Fed commentary") as context — not as trading signals.
- Keep it conversational, warm, and under 150 words. End with one grounding thought that encourages patience and learning, in Pansy's voice.`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const today = getTodayET();

  // 1. Cache check
  const { data: cached } = await supabaseAdmin
    .from("daily_briefings")
    .select("content, briefing_date")
    .eq("briefing_date", today)
    .maybeSingle();

  if (cached) {
    return res.status(200).json({ content: cached.content, briefing_date: cached.briefing_date, cached: true });
  }

  // 2. Fetch market data — SPY is the floor check
  const [spy, qqq, dia, vixy] = await Promise.all([
    fetchQuote("SPY"),
    fetchQuote("QQQ"),
    fetchQuote("DIA"),
    fetchQuote("VIXY"),
  ]);

  // Guard: SPY must be valid or we write nothing
  if (!spy) {
    console.error("[daily-briefing] SPY quote unavailable — skipping cache write");
    return res.status(503).json({ error: "Market data unavailable" });
  }

  const news = await fetchNews();

  // 3. Build prompt context
  const marketLines: string[] = [];
  marketLines.push(`S&P 500 (SPY): ${spy.dp >= 0 ? "+" : ""}${spy.dp.toFixed(2)}% (closed at ${spy.c.toFixed(2)})`);
  if (qqq) marketLines.push(`NASDAQ (QQQ): ${qqq.dp >= 0 ? "+" : ""}${qqq.dp.toFixed(2)}% (closed at ${qqq.c.toFixed(2)})`);
  if (dia) marketLines.push(`Dow Jones (DIA): ${dia.dp >= 0 ? "+" : ""}${dia.dp.toFixed(2)}% (closed at ${dia.c.toFixed(2)})`);
  if (vixy) {
    const mood = vixy.c < 20 ? "calm" : vixy.c < 30 ? "moderately elevated" : "elevated";
    marketLines.push(`Volatility mood (VIXY): ${mood}`);
  }

  const newsLines = news.length > 0
    ? news.map((n, i) => `${i + 1}. ${n.headline} (${n.source})`).join("\n")
    : "No headlines available.";

  const userMessage = `Last session market data:\n${marketLines.join("\n")}\n\nRecent market headlines:\n${newsLines}\n\nWrite the Morning Coffee briefing using only the data above.`;

  // 4. Call Anthropic
  let content: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    const block = response.content.find(b => b.type === "text");
    if (!block || block.type !== "text" || !block.text.trim()) {
      throw new Error("Empty response from Anthropic");
    }
    content = block.text.trim();
  } catch (err) {
    console.error("[daily-briefing] Anthropic call failed:", err);
    return res.status(503).json({ error: "Briefing generation failed" });
  }

  // 5. Both SPY and Anthropic succeeded — safe to cache
  await supabaseAdmin
    .from("daily_briefings")
    .insert({ briefing_date: today, content })
    .select()
    .maybeSingle();
  // ON CONFLICT handled by unique constraint — concurrent requests that lose
  // the race will still get a valid row on the re-read below

  // 6. Re-read to return the canonical row (handles race)
  const { data: written } = await supabaseAdmin
    .from("daily_briefings")
    .select("content, briefing_date")
    .eq("briefing_date", today)
    .maybeSingle();

  const finalContent = written?.content ?? content;
  return res.status(200).json({ content: finalContent, briefing_date: today, cached: false });
}
