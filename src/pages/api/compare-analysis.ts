import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";
import { rejectOversizedBody, validateAssets } from "@/lib/validateInput";
import { checkDirectives } from "@/lib/outputFilter";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const COMPARISON_SYSTEM_PROMPT = `You are Pansy, Bloom's warm and intelligent investing mentor. You're helping users compare multiple investments side-by-side to make better decisions.

When comparing investments:

1. OVERVIEW - Summarize the key differences between these investments in 2-3 sentences (girlfriend tone)
2. STRENGTHS - For each ticker, identify its strongest advantage (one sentence each)
3. RISKS - For each ticker, identify its biggest risk or concern (one sentence each)
4. BEST FOR - For each ticker, state what type of investor it's best suited for (one sentence each)
5. VERDICT - Your final comparative recommendation in 2-3 sentences

Use web search to verify current prices, trends, and fundamental data for each investment.

TONE RULES:
- Warm girlfriend energy
- Honest about trade-offs
- Educational, not pushy
- Focus on helping them understand the differences
- Never say "buy" - use educational language like "might be worth considering for..."

Format your response as JSON:
{
  "summary": "overview text",
  "strengths": {
    "TICKER1": "strength text",
    "TICKER2": "strength text"
  },
  "risks": {
    "TICKER1": "risk text",
    "TICKER2": "risk text"
  },
  "bestFor": {
    "TICKER1": "best for text",
    "TICKER2": "best for text"
  },
  "verdict": "verdict text"
}`;

interface ComparisonAsset {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  if (rejectOversizedBody(req, res)) return;

  const { limited } = await rateLimit(auth.user!.id, "compare-analysis", 10, 300);
  if (limited) return res.status(429).json(RATE_LIMIT_RESPONSE);

  try {
    const { assets } = req.body as { assets: ComparisonAsset[] };

    const assetsCheck = validateAssets(assets);
    if (!assetsCheck.valid) {
      return res.status(400).json({ error: assetsCheck.error });
    }

    const assetsDescription = assets
      .map((a) => `${a.ticker} at $${a.price} (${a.changePercent >= 0 ? "+" : ""}${a.changePercent.toFixed(2)}%)`)
      .join(", ");

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2000,
      temperature: 0.7,
      system: COMPARISON_SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      messages: [
        {
          role: "user",
          content: `Compare these investments for a user: ${assetsDescription}. Use web search to get current data and provide a comparative analysis.`,
        },
      ],
    });

    let responseText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        responseText += block.text;
      }
    }

    checkDirectives(responseText, "compare-analysis");
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return res.status(200).json(analysis);
    }

    // Fallback response if parsing fails
    return res.status(200).json({
      summary: responseText,
      strengths: {},
      risks: {},
      bestFor: {},
      verdict: "Comparison analysis in progress.",
    });
  } catch (error: unknown) {
    console.error("Error generating comparison analysis:", error);
    return res.status(500).json({
      summary: "Girl, something went wrong on my end. Give me a sec to sort this out 🌸",
      strengths: {},
      risks: {},
      bestFor: {},
      verdict: "",
      error: (error as Error).message,
    });
  }
}