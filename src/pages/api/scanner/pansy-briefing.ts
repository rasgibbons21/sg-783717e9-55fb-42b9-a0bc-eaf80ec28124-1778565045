import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";

const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey });

const PANSY_BRIEFING_PROMPT = `You are Pansy — the sharp AI trading analyst for Radar. You watch the markets around the clock and proactively share what you see.

You're writing a market briefing based on real news and market data. Your job:

1. Summarize what's moving and why in 2-3 sentences
2. Highlight 3-5 tickers worth watching with a potential setup or reason (be specific — "approaching support at $X", "breaking out above resistance", "volume spike after news")
3. For each ticker, note what strategy might apply: breakout, support bounce, momentum continuation, gap-and-go, VWAP reclaim, etc.
4. Give a market mood read

Keep it tight — this is a trader's morning briefing, not an essay. Be direct and actionable.

Return ONLY valid JSON:
{
  "greeting": "One sentence to open (reference what's happening in the market)",
  "briefing": "2-3 sentence market overview — what's driving the action today",
  "watchlist": [
    {
      "symbol": "TICKER",
      "reason": "Why this is interesting + what setup to watch for (be specific with levels if the data shows them)",
      "type": "stock"
    }
  ],
  "mood": "bullish" | "bearish" | "cautious" | "mixed",
  "moodNote": "One sentence explaining the mood — what's the market telling you"
}`;

let briefingCache: { data: unknown; ts: number } | null = null;
const CACHE_MS = 10 * 60 * 1000; // 10 min cache

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const { limited } = await rateLimit(auth.user!.id, "pansy-briefing", 3, 600);
  if (limited) return res.status(429).json(RATE_LIMIT_RESPONSE);

  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  if (briefingCache && Date.now() - briefingCache.ts < CACHE_MS) {
    return res.status(200).json(briefingCache.data);
  }

  const fmpKey = process.env.FMP_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;

  const context: string[] = [];

  // Fetch news
  try {
    if (finnhubKey) {
      const r = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`);
      if (r.ok) {
        const data = await r.json();
        const headlines = data.slice(0, 10).map((a: any) => `- ${a.headline} (${a.source})`).join("\n");
        context.push(`Recent market news:\n${headlines}`);
      }
    }
  } catch {}

  // Fetch stock gainers
  try {
    if (fmpKey) {
      const r = await fetch(`https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=${fmpKey}`);
      if (r.ok) {
        const data = await r.json();
        const top = data.slice(0, 8).map((g: any) =>
          `- ${g.symbol}: $${g.price?.toFixed(2)} (+${g.changesPercentage?.toFixed(1)}%) vol ${(g.volume || 0).toLocaleString()}`
        ).join("\n");
        context.push(`Top stock gainers:\n${top}`);
      }
    }
  } catch {}

  if (context.length === 0) {
    return res.status(200).json({
      greeting: "Markets are quiet right now.",
      briefing: "I couldn't pull fresh data at the moment — check back shortly for a full update.",
      watchlist: [],
      mood: "mixed",
      moodNote: "Data temporarily unavailable",
    });
  }

  try {
    const result = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 1024,
      system: PANSY_BRIEFING_PROMPT,
      messages: [{
        role: "user",
        content: `Here's what I'm seeing in the markets right now. Give me your briefing.\n\n${context.join("\n\n")}`,
      }],
    });

    const text = result.content.find(b => b.type === "text");
    const raw = text?.type === "text" ? text.text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(200).json({
        greeting: "Let me check on that...",
        briefing: "I'm having trouble formatting my analysis. Try refreshing in a moment.",
        watchlist: [],
        mood: "mixed",
        moodNote: "Analysis in progress",
      });
    }

    const briefing = JSON.parse(jsonMatch[0]);
    briefingCache = { data: briefing, ts: Date.now() };
    return res.status(200).json(briefing);
  } catch (error: any) {
    console.error("[pansy-briefing] Error:", error.message);
    return res.status(200).json({
      greeting: "I'll be right back.",
      briefing: "My analysis engine is catching up — check back in a few minutes.",
      watchlist: [],
      mood: "mixed",
      moodNote: "Temporarily unavailable",
    });
  }
}
