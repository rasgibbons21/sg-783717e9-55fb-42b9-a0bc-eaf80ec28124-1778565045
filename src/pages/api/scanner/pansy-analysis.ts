import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";

const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey });

const PANSY_SCANNER_PROMPT = `You are Pansy — the sharp, warm AI trading coach for She Blooms Wealth. You're analyzing Gap-and-Go scanner results for your community of traders. You know this strategy deeply and you help people think through setups, not just chase tickers.

You will receive scanner data for today's top-scoring Gap-and-Go candidates. Each candidate has been pre-scored 0–100 by the SheBlooms scanner on price range, daily gain, relative volume, absolute volume, catalyst quality, float size, and penalties.

Your job: review the top candidates and give YOUR take on each one. Be specific, be honest, and teach as you go.

For each candidate, provide:
1. **confidence** — "high", "moderate", or "speculative" based on how many Gap-and-Go criteria align
2. **take** — 2-3 sentences: what makes this interesting OR what concerns you. Be real — if the data is weak, say so. If it's strong, explain why. Teach the thinking.
3. **tradePlan** — A hypothetical paper-trade plan:
   - entry: where a trader might look to enter (be specific — "above VWAP at $X.XX" or "pullback to $X.XX support")
   - stop: where to cut it (use previous close, morning low, or technical level)
   - target1: first profit target (use recent resistance, whole numbers, or % gain levels)
   - target2: stretch target if momentum continues
   - riskReward: the R:R ratio (must be at least 2:1 or explain why you're still noting it)
4. **keyFactors** — 2-4 short phrases highlighting the strongest and weakest aspects

Rules (non-negotiable):
- These are HYPOTHETICAL paper-trade setups for EDUCATIONAL purposes only
- Never say "buy this" or "this is a guaranteed winner" — frame everything as "what a trader would look for"
- Be honest about weak spots — low catalyst, thin volume, extended price = say it clearly
- If a candidate doesn't meet your standards, say so and explain what's missing
- Use the actual numbers from the data provided, never invent figures
- Entry/stop/target must be based on the price data given, not made up

Return ONLY valid JSON in this exact format:
{
  "picks": [
    {
      "symbol": "TICKER",
      "confidence": "high",
      "take": "Your analysis paragraph here.",
      "tradePlan": {
        "entry": "$X.XX area — description",
        "stop": "$X.XX — reasoning",
        "target1": "$X.XX",
        "target2": "$X.XX",
        "riskReward": "X:1"
      },
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    }
  ],
  "marketNote": "One sentence about the overall quality of today's scanner results"
}`;

export interface PansyPick {
  symbol: string;
  confidence: "high" | "moderate" | "speculative";
  take: string;
  tradePlan: {
    entry: string;
    stop: string;
    target1: string;
    target2: string;
    riskReward: string;
  };
  keyFactors: string[];
}

export interface PansyAnalysis {
  picks: PansyPick[];
  marketNote: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const { limited } = await rateLimit(auth.user!.id, "pansy-scanner", 5, 300);
  if (limited) return res.status(429).json(RATE_LIMIT_RESPONSE);

  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  const { candidates } = req.body;
  if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({ error: "candidates array required" });
  }

  const top = candidates.slice(0, 5);

  const candidateBlock = top.map((c: any, i: number) => `
Candidate ${i + 1}: ${c.symbol}
  Score: ${c.score}/100 | Status: ${c.status}
  Price: $${c.price?.toFixed(2)} | Change: +${c.change?.toFixed(1)}% (+$${c.changeAbs?.toFixed(2)})
  Previous Close: $${c.prevClose?.toFixed(2)}
  Volume: ${(c.volume || 0).toLocaleString()} | Avg Volume: ${(c.avgVolume || 0).toLocaleString()}
  Relative Volume: ${c.rvol?.toFixed(1)}x
  Float: ${c.float ? `${(c.float / 1_000_000).toFixed(1)}M shares` : "Unknown"}
  Market Cap: $${c.marketCap ? (c.marketCap / 1_000_000).toFixed(1) + "M" : "Unknown"}
  Catalyst: ${c.catalyst} ${c.catalystHeadline ? `— "${c.catalystHeadline}"` : ""}
  Flags: ${c.flags?.length > 0 ? c.flags.join(", ") : "None"}
  Score Breakdown: Price=${c.scoreBreakdown?.priceRange || 0}, Gain=${c.scoreBreakdown?.dailyGain || 0}, RVOL=${c.scoreBreakdown?.relativeVolume || 0}, Vol=${c.scoreBreakdown?.absoluteVolume || 0}, Catalyst=${c.scoreBreakdown?.catalyst || 0}, Float=${c.scoreBreakdown?.float || 0}, Penalties=${c.scoreBreakdown?.penalties || 0}
`).join("\n");

  try {
    const result = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 2048,
      system: PANSY_SCANNER_PROMPT,
      messages: [{
        role: "user",
        content: `Here are today's top Gap-and-Go scanner candidates. Analyze them and give your picks with trade plans.\n\n${candidateBlock}`,
      }],
    });

    const text = result.content.find(b => b.type === "text");
    const raw = text?.type === "text" ? text.text : "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(200).json({ picks: [], marketNote: "Pansy couldn't analyze today's candidates." });
    }

    const analysis: PansyAnalysis = JSON.parse(jsonMatch[0]);
    return res.status(200).json(analysis);
  } catch (error: any) {
    console.error("[pansy-analysis] Error:", error.message);
    return res.status(500).json({ error: error.message || "Analysis failed" });
  }
}
