import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { fetchStockBundle, buildDataBlock } from "@/lib/fetchStockData";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";
import { rejectOversizedBody } from "@/lib/validateInput";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are Pansy — a sharp, educational market analyst. Given real data about a stock, return ONLY valid JSON (no markdown, no prose, no code fences) with this exact shape:
{
  "bullCase": ["<concise factor>", "<concise factor>", "<concise factor>"],
  "bearCase": ["<concise factor>", "<concise factor>", "<concise factor>"],
  "watchList": ["<metric or event to monitor>", "<metric or event to monitor>", "<metric or event to monitor>"]
}
Rules:
- 3–4 items per section, each 10–25 words, grounded in the data provided
- Bull case: tailwinds, growth drivers, valuation support, or sector momentum
- Bear case: risks, headwinds, valuation concerns, or macro threats
- Watch list: specific metrics, events, or signals disciplined traders track for this name
- Never give price targets, entry/exit levels, buy/sell/hold recommendations, or predictions
- Never invent figures — only what appears in the data block
- Stick to factual, educational framing`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  if (rejectOversizedBody(req, res)) return;

  const { limited } = await rateLimit(auth.user!.id, "pansy-panel", 15, 300);
  if (limited) return res.status(429).json(RATE_LIMIT_RESPONSE);

  const { ticker } = req.body;
  if (!ticker || typeof ticker !== "string" || !/^[A-Z0-9.^]{1,10}$/i.test(ticker)) {
    return res.status(400).json({ error: "Valid ticker required" });
  }

  const sym = ticker.toUpperCase().trim();

  try {
    const bundle = await fetchStockBundle(sym);
    const dataBlock = buildDataBlock(bundle);

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `Ticker: ${sym}\n\nData:\n${dataBlock}\n\nReturn the JSON analysis.`,
      }],
    });

    let raw = "";
    for (const block of response.content) {
      if (block.type === "text") raw += block.text;
    }

    // Strip any accidental markdown fences
    raw = raw.replace(/```[a-z]*\n?/g, "").trim();

    let parsed: { bullCase: string[]; bearCase: string[]; watchList: string[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(500).json({ error: "Analysis parse error — try again" });
    }

    return res.status(200).json({
      bullCase: parsed.bullCase ?? [],
      bearCase: parsed.bearCase ?? [],
      watchList: parsed.watchList ?? [],
      profile: {
        sector: bundle.sector,
        shortDescription: bundle.shortDescription,
        marketCap: bundle.marketCap,
        pe: bundle.pe,
        fpe: bundle.fpe,
        high52: bundle.high52,
        low52: bundle.low52,
        perf1m: bundle.perf1m,
        perfYTD: bundle.perfYTD,
        perf1y: bundle.perf1y,
      },
      dataBlock,
      ticker: sym,
    });
  } catch (err: unknown) {
    console.error("pansy-panel error", err);
    return res.status(500).json({ error: "Analysis unavailable — try again" });
  }
}
