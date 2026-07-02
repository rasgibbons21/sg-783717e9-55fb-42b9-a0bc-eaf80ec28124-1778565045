import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireLoggedInUser, sendAuthError, isRateLimited } from "@/lib/requireProUser";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PICKS_SYSTEM_PROMPT = `You are Pansy, the educational guide for She Blooms Wealth — an investing education platform, not a brokerage or adviser. Your job here is NOT to recommend what to buy. It is to surface 3 tickers that are simply NOTABLE in the market right now and give a balanced, two-sided read so a beginner can practice thinking about them.

Use web search to find 3 tickers actively in the news or moving today — one stock, one ETF, one mutual fund. "Notable" means widely discussed or unusually active, NOT "a good buy."

Rules (non-negotiable):
- Never recommend buying, selling, or holding. No "pick," "opportunity," "strong setup," "get in," or price targets.
- Never predict where a price is going.
- For each ticker give BOTH sides: what draws attention (the bull view others hold) AND a real risk or reason for caution (the bear view). Balanced — never cheerleading.
- Educational and observational only: describe what IS, not what anyone should do.
- Only state figures returned by web search; never invent numbers.

For each of the 3 tickers, return:
1. ticker — symbol
2. name — full name
3. type — exactly "stock", "etf", or "mutual-fund"
4. trend — recent price DIRECTION only: "Bullish", "Bearish", or "Sideways". This describes how it has been moving lately; it is NOT a forecast.
5. riskLevel — "Conservative", "Moderate", or "Aggressive", reflecting the instrument's typical volatility for a beginner.
6. pansyQuote — ONE balanced, two-sided sentence naming both what attracts interest AND a risk to understand. Warm, plain, never a recommendation.

Format your response EXACTLY as a JSON array like this:
[
  {
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "type": "stock",
    "trend": "Sideways",
    "riskLevel": "Moderate",
    "pansyQuote": "Widely held for its steady cash flow and brand — though its size means slower growth, and it can still fall hard in a tech selloff."
  }
]

Use web search to verify current prices and recent direction. Educational only — never hype, never advice.`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  // 5 picks-refreshes per user per hour (it's expensive with web search)
  if (isRateLimited(auth.user.id, "pansy-picks", 5, 60 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many requests — try again later" });
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1500,
      temperature: 0.7,
      system: PICKS_SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      messages: [
        {
          role: "user",
          content: "Generate 3 additional investment picks for today based on current market conditions and trends.",
        },
      ],
    });

    // Extract text content
    let responseText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        responseText += block.text;
      }
    }

    // Try to parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const picks = JSON.parse(jsonMatch[0]);
      
      // Fetch live prices for the picks
      const picksWithPrices = await Promise.all(
        picks.map(async (pick: Record<string, string>) => {
          try {
            const finnhubKey = process.env.FINNHUB_API_KEY;
            if (!finnhubKey) {
              return {
                ticker: pick.ticker,
                name: pick.name,
                price: 0,
                change: 0,
                changePercent: 0,
                type: pick.type,
                trend: pick.trend,
                riskLevel: pick.riskLevel,
                pansyQuote: pick.pansyQuote,
              };
            }
            const quoteRes = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${pick.ticker}&token=${finnhubKey}`
            );
            const quote = await quoteRes.json();
            
            return {
              ticker: pick.ticker,
              name: pick.name,
              price: quote.c || 0,
              change: quote.d || 0,
              changePercent: quote.dp || 0,
              type: pick.type,
              trend: pick.trend,
              riskLevel: pick.riskLevel,
              pansyQuote: pick.pansyQuote,
            };
          } catch {
            return {
              ticker: pick.ticker,
              name: pick.name,
              price: 0,
              change: 0,
              changePercent: 0,
              type: pick.type,
              trend: pick.trend,
              riskLevel: pick.riskLevel,
              pansyQuote: pick.pansyQuote,
            };
          }
        })
      );

      return res.status(200).json(picksWithPrices);
    }

    // Fallback if parsing fails
    return res.status(200).json([]);
  } catch (error: unknown) {
    console.error("Error generating Pansy's picks:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
}