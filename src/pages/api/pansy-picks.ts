import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireLoggedInUser, sendAuthError, isRateLimited } from "@/lib/requireProUser";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PICKS_SYSTEM_PROMPT = `You are Pansy, Bloom's investing expert. Generate 3 additional investment picks (beyond NVDA, VOO, FXAIX) for today based on current market conditions.

Use web search to find:
- One stock showing strong momentum or interesting setup
- One ETF that fits current market environment
- One mutual fund for long-term investors

For each pick, provide:
1. Ticker symbol
2. Full name
3. Type (stock/etf/mutual-fund)
4. Trend (Bullish/Bearish/Sideways based on current chart)
5. Risk level (Conservative/Moderate/Aggressive)
6. One-line Pansy quote (girlfriend tone, 10-15 words max)

Format your response EXACTLY as a JSON array like this:
[
  {
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "type": "stock",
    "trend": "Bullish",
    "riskLevel": "Moderate",
    "pansyQuote": "The iPhone keeps printing money and services are growing fast."
  }
]

Use web search to verify current prices and trends. Be specific and educational, never hype-driven.`;

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