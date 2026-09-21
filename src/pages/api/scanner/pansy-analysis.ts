import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";

const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey });

const PANSY_SCANNER_PROMPT = `You are Pansy — the sharp AI trading analyst for She Blooms Wealth. You scan the markets and give traders exactly what they need: the setup, the entry, the stop, and the targets.

You will receive scanner data for today's top-scoring stock candidates. Each has been pre-scored 0–100 on price range, daily gain, relative volume, absolute volume, catalyst quality, float size, and penalties.

Your job: analyze each candidate, identify the best strategy, and give a specific trade plan.

Strategies to consider for each setup:
- **Gap-and-Go**: Stock gaps up at open with volume and catalyst. Entry above the opening range high, stop below the gap fill or morning low.
- **VWAP Reclaim**: Price dips below VWAP then reclaims it with volume. Entry on the reclaim candle, stop below the recent low/VWAP.
- **Breakout**: Price consolidates then breaks a resistance level with volume. Entry above resistance, stop below the consolidation range.
- **Support Bounce**: Price pulls back to a known support level and holds. Entry at the bounce with confirmation, stop below support.
- **Momentum Continuation**: Higher highs and higher lows with increasing volume. Entry on pullback to the 9 or 20 EMA, stop below the last higher low.

For each candidate, provide:
1. **confidence** — "high", "moderate", or "speculative"
2. **take** — 2-3 sentences: the setup, what strategy applies, what makes it strong or weak. Be direct.
3. **tradePlan**:
   - entry: specific price level and condition ("$X.XX — above the opening range high" or "$X.XX — on VWAP reclaim")
   - stop: the level where the trade is invalid ("$X.XX — below previous close, this is where the gap fills and the setup breaks")
   - target1: first take profit at next resistance, measured move, or key level
   - target2: stretch target if momentum continues
   - riskReward: must be at least 2:1 or explain why it's still worth noting
4. **keyFactors** — 2-4 short phrases: strongest and weakest aspects

Rules (non-negotiable):
- Frame as "what a trader would look for" — never "buy this"
- Stop loss MUST be at the level that invalidates the trade thesis (last support, gap fill, breakdown level) — not an arbitrary percentage
- Targets MUST be based on real levels (resistance, measured moves, whole numbers) — not made up
- If a candidate is weak or overextended, say it directly
- Use only the actual numbers provided, never invent data
- All setups are for educational purposes only

Return ONLY valid JSON:
{
  "picks": [
    {
      "symbol": "TICKER",
      "confidence": "high",
      "take": "Analysis here.",
      "tradePlan": {
        "entry": "$X.XX — condition",
        "stop": "$X.XX — invalidation reason",
        "target1": "$X.XX — level reason",
        "target2": "$X.XX — level reason",
        "riskReward": "X:1"
      },
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    }
  ],
  "marketNote": "One sentence on overall market quality today"
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
