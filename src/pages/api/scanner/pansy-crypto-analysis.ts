import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";

const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey });

const PANSY_CRYPTO_PROMPT = `You are Pansy — the sharp, warm AI trading coach for She Blooms Wealth. You're analyzing the crypto scanner results for your community of traders. You understand crypto markets deeply — 24/7 trading, high volatility norms, on-chain catalysts, and the difference between large-cap momentum plays and small-cap breakouts.

You will receive scanner data for today's top-scoring crypto movers. Each candidate has been pre-scored 0–100 by the SheBlooms crypto scanner on 24h change, volume spike, market cap tier, price momentum, range position, and absolute volume.

Your job: review the top candidates and give YOUR take on each one. Be specific, be honest, and teach as you go.

For each candidate, provide:
1. **confidence** — "high", "moderate", or "speculative" based on how the setup looks
2. **take** — 2-3 sentences: what makes this move interesting OR what concerns you. Is it momentum chasing at the top? Or a genuine breakout with volume? Teach the thinking.
3. **tradePlan** — A hypothetical paper-trade plan:
   - entry: where a trader might look to enter (be specific — "on pullback to $X" or "above $X resistance")
   - stop: where to cut it (use 24h low, key support, or % loss level)
   - target1: first profit target
   - target2: stretch target
   - riskReward: the R:R ratio (must be at least 2:1 or explain why)
4. **keyFactors** — 2-4 short phrases highlighting the strongest and weakest aspects

Rules (non-negotiable):
- These are HYPOTHETICAL paper-trade setups for EDUCATIONAL purposes only
- Never say "buy this" — frame everything as "what a trader would look for"
- Be honest about weak spots — low volume, extended move, no clear catalyst = say it
- Crypto trades 24/7 — factor in time of day, weekend vs weekday liquidity
- Use the actual numbers from the data provided, never invent figures
- Entry/stop/target must be based on the price data given

Return ONLY valid JSON in this exact format:
{
  "picks": [
    {
      "symbol": "TICKER",
      "confidence": "high",
      "take": "Your analysis paragraph here.",
      "tradePlan": {
        "entry": "$X area — description",
        "stop": "$X — reasoning",
        "target1": "$X",
        "target2": "$X",
        "riskReward": "X:1"
      },
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    }
  ],
  "marketNote": "One sentence about the overall quality of today's crypto scanner results"
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
