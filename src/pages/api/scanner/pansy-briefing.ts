import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";

const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey });

const PANSY_BRIEFING_PROMPT = `You are Pansy — the sharp, warm AI trading analyst for She Blooms Wealth (Bloom). You proactively watch the markets and share what you see with your community.

You're writing a short market briefing based on real news headlines and market data. Your job is to:

1. Summarize what's happening in the markets right now in 2-3 sentences
2. Highlight 3-5 tickers worth watching and why (based on the news, gainers, or crypto movers you see)
3. Give a market mood read — bullish, bearish, cautious, or mixed

Be conversational, sharp, and helpful. Not a wall of text — think morning market rundown for busy traders.

Return ONLY valid JSON:
{
  "greeting": "One warm sentence to open (reference time of day or market conditions)",
  "briefing": "2-3 sentence market overview",
  "watchlist": [
    {
      "symbol": "TICKER",
      "reason": "One sentence on why this is interesting right now",
      "type": "stock" | "crypto"
    }
  ],
  "mood": "bullish" | "bearish" | "cautious" | "mixed",
  "moodNote": "One sentence explaining the mood"
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
      const r = await fetch(`https://financialmodelingprep.com/api/v3/stock_market/gainers?apiKey=${fmpKey}`);
      if (r.ok) {
        const data = await r.json();
        const top = data.slice(0, 8).map((g: any) =>
          `- ${g.symbol}: $${g.price?.toFixed(2)} (+${g.changesPercentage?.toFixed(1)}%) vol ${(g.volume || 0).toLocaleString()}`
        ).join("\n");
        context.push(`Top stock gainers:\n${top}`);
      }
    }
  } catch {}

  // Fetch crypto movers
  try {
    if (fmpKey) {
      const r = await fetch(`https://financialmodelingprep.com/api/v3/quotes/crypto?apikey=${fmpKey}`);
      if (r.ok) {
        const data: any[] = await r.json();
        const movers = data
          .filter((q: any) => q.changesPercentage > 1 && q.marketCap > 1_000_000 && q.symbol?.endsWith("USD"))
          .sort((a: any, b: any) => b.changesPercentage - a.changesPercentage)
          .slice(0, 6);
        const cryptoList = movers.map((c: any) =>
          `- ${c.symbol}: $${c.price?.toFixed(2)} (${c.changesPercentage >= 0 ? "+" : ""}${c.changesPercentage?.toFixed(1)}%)`
        ).join("\n");
        if (cryptoList) context.push(`Crypto movers:\n${cryptoList}`);
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
