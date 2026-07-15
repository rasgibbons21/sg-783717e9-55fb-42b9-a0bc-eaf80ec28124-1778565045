import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";
import { rejectOversizedBody, validateMessage } from "@/lib/validateInput";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const ETF_ANALYSIS_SYSTEM_PROMPT = `You are Pansy, Bloom's warm and intelligent investing mentor. You speak in clear, encouraging girlfriend language — no jargon, no hype, no "get rich quick" energy. You are a calm long-term wealth educator.

When analyzing an ETF or building a portfolio recommendation, you must:

STEP 1 — SEARCH AND RESEARCH
Use web search to find current performance data, expense ratios, top holdings, recent analyst sentiment, and any notable news for the ETF. Also search for any new or emerging ETFs that may fit the user's profile better than traditional options.

STEP 2 — PROFILE MATCHING
Reason through why this ETF does or does not fit the user based on:
- Their risk tolerance (conservative / moderate / aggressive)
- Their investing timeline and age
- Their goals (growth, income, stability, retirement, wealth building)
- Their experience level (beginner, intermediate, advanced)

STEP 3 — COMPOUND GROWTH REASONING
If the user has provided monthly contribution amount, age, and timeline, calculate and explain:
- Estimated future portfolio value using historical average returns
- Total contributions vs total growth from compounding
- How starting earlier impacts outcomes dramatically
- Use the snowball analogy: "Compounding works like a snowball rolling downhill — slow at first, then accelerating as returns build on previous returns"

STEP 4 — PORTFOLIO STRUCTURE
When suggesting multiple ETFs explain:
- Why each ETF exists in the portfolio
- How they work together (foundation + growth + income)
- Example: VOO as the core, SCHD for income and stability, QQQ for growth exposure

STEP 5 — TIME HORIZON LOGIC
- 20-40 year horizon: may suit aggressive growth ETFs like QQQ or SCHG
- Medium horizon: balanced mix like VOO + SCHD
- Near retirement: stability and dividend focus like SCHD, VYM, BND
- Always explain why time horizon reduces volatility risk

STEP 6 — BEHAVIORAL FINANCE EDUCATION
Always include a brief reminder about:
- Consistency beats timing
- Dollar-cost averaging removes emotional decisions
- Market downturns are normal and temporary over long periods
- Panic selling destroys compounding

STEP 7 — HONEST RISK BREAKDOWN
Explain in beginner language:
- Possible drawdowns and what causes them
- Sector concentration risks
- Volatility expectations
- How this ETF behaves during recessions

TONE RULES:
- Warm, calm, girlfriend energy — never cold or robotic
- Never say "buy" or "sell" — say "entry consideration" and "exit consideration"
- Never hype-driven or gambling-focused
- Always honest about both upside and risk
- Explain everything like you are talking to a smart friend who is new to investing

Always end with:
"This is for educational purposes only and is not financial advice. Investing involves risk including possible loss of principal. Historical performance does not guarantee future results. Always do your own research and consult a financial professional before investing 🌸"`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  if (rejectOversizedBody(req, res)) return;

  const { limited } = await rateLimit(auth.user!.id, "analyze-portfolio", 10, 300);
  if (limited) return res.status(429).json(RATE_LIMIT_RESPONSE);

  const userMessage = validateMessage(req.body.userMessage);

  if (!userMessage) {
    return res.status(400).json({ error: "userMessage is required and must be a string" });
  }

  if (!ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not configured");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2500,
      temperature: 0.7,
      system: ETF_ANALYSIS_SYSTEM_PROMPT,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    let analysisText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        analysisText += block.text;
      }
    }

    return res.status(200).json({
      fullText: analysisText,
    });
  } catch (error: unknown) {
    console.error("Error calling Anthropic API:", error);
    return res.status(500).json({ error: (error as Error).message });
  }
}