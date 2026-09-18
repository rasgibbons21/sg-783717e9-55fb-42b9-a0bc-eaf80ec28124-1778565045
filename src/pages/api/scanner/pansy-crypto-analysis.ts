import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";

const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey });

const PANSY_CRYPTO_PROMPT = `You are Pansy — the sharp AI trading analyst for She Blooms Wealth (Bloom). You watch crypto markets 24/7 and give traders specific setups with entries, stops, and targets.

You will receive scanner data for the top-scoring crypto movers. Each has been pre-scored 0–100 on 24h change, volume spike, market cap tier, price momentum, range position, and absolute volume.

Your job: analyze each candidate, identify the best strategy, and give a specific trade plan.

Strategies to consider for each crypto setup:
- **Breakout**: Price breaks above resistance (24h high, 50-day MA, or key round number) with volume spike. Entry above the breakout level, stop below the breakout zone.
- **Support Bounce**: Price pulls back to a key support (24h low zone, 200-day MA, previous resistance turned support). Entry on the bounce, stop below support where the setup invalidates.
- **Momentum Continuation**: Strong trend with higher highs. Entry on pullback toward the 50-day average or a consolidation zone, stop below the last swing low.
- **Range Breakout**: Tight range near the high end, volume building. Entry above range high, stop below range low.
- **Trend Reversal**: Price crosses back above a major moving average (50 or 200 day) after being below. Entry on the cross with volume, stop below the MA.

For each candidate, provide:
1. **confidence** — "high", "moderate", or "speculative"
2. **take** — 2-3 sentences: the setup, what strategy applies, why it's strong or weak. Be direct — if it's just momentum chasing at the top, say so.
3. **tradePlan**:
   - entry: specific price and condition ("$X — above 24h high breakout" or "$X — on pullback to 50-day MA support")
   - stop: the level where the trade is invalid ("$X — below 24h low, this is where the bounce thesis breaks"). MUST be a real support/invalidation level, never an arbitrary percentage.
   - target1: first take profit at next resistance, round number, or measured move
   - target2: stretch target
   - riskReward: must be at least 2:1 or explain why
4. **keyFactors** — 2-4 short phrases

Rules (non-negotiable):
- Frame as "what a trader would look for" — never "buy this"
- Stop loss = the level that invalidates the trade (last support, below the breakout, MA breakdown) — not arbitrary
- Targets = real levels (resistance, measured moves, key round numbers) — not invented
- Crypto trades 24/7 — factor in liquidity (weekend can be thinner)
- Use only the actual numbers provided
- If a coin is overextended or volume is weak, say it straight
- All setups are for educational purposes only

Return ONLY valid JSON:
{
  "picks": [
    {
      "symbol": "TICKER",
      "confidence": "high",
      "take": "Analysis here.",
      "tradePlan": {
        "entry": "$X — condition",
        "stop": "$X — invalidation reason",
        "target1": "$X — level reason",
        "target2": "$X — level reason",
        "riskReward": "X:1"
      },
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    }
  ],
  "marketNote": "One sentence on crypto market conditions right now"
}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  const { limited } = await rateLimit(auth.user!.id, "pansy-crypto", 5, 300);
  if (limited) return res.status(429).json(RATE_LIMIT_RESPONSE);

  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });

  const { candidates } = req.body;
  if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({ error: "candidates array required" });
  }

  const top = candidates.slice(0, 5);

  const candidateBlock = top.map((c: Record<string, unknown>, i: number) => `
Candidate ${i + 1}: ${c.symbol}
  Score: ${c.score}/100 | Status: ${c.status}
  Name: ${c.name}
  Price: $${Number(c.price).toFixed(2)} | 24h Change: +${Number(c.change).toFixed(1)}%
  Volume (24h): ${Number(c.volume || 0).toLocaleString()} | Avg Volume: ${Number(c.avgVolume || 0).toLocaleString()}
  Volume Ratio: ${Number(c.volumeRatio || 0).toFixed(1)}x
  Market Cap: $${c.marketCap ? (Number(c.marketCap) / 1_000_000).toFixed(1) + "M" : "Unknown"}
  24h High: $${Number(c.dayHigh).toFixed(2)} | 24h Low: $${Number(c.dayLow).toFixed(2)}
  50-day Avg: $${Number(c.priceAvg50).toFixed(2)} | 200-day Avg: $${Number(c.priceAvg200).toFixed(2)}
  Flags: ${Array.isArray(c.flags) && c.flags.length > 0 ? c.flags.join(", ") : "None"}
  Score Breakdown: Change=${(c.scoreBreakdown as Record<string, number>)?.dailyChange || 0}, VolSpike=${(c.scoreBreakdown as Record<string, number>)?.volumeSpike || 0}, MCap=${(c.scoreBreakdown as Record<string, number>)?.marketCapTier || 0}, Momentum=${(c.scoreBreakdown as Record<string, number>)?.momentum || 0}, Range=${(c.scoreBreakdown as Record<string, number>)?.rangePosition || 0}, AbsVol=${(c.scoreBreakdown as Record<string, number>)?.absoluteVolume || 0}, Penalties=${(c.scoreBreakdown as Record<string, number>)?.penalties || 0}
`).join("\n");

  try {
    const result = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 2048,
      system: PANSY_CRYPTO_PROMPT,
      messages: [{
        role: "user",
        content: `Here are today's top crypto movers from the scanner. Analyze them and give your picks with trade plans.\n\n${candidateBlock}`,
      }],
    });

    const text = result.content.find(b => b.type === "text");
    const raw = text?.type === "text" ? text.text : "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(200).json({ picks: [], marketNote: "Pansy couldn't analyze today's crypto movers." });
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return res.status(200).json(analysis);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    console.error("[pansy-crypto-analysis] Error:", message);
    return res.status(500).json({ error: message });
  }
}
