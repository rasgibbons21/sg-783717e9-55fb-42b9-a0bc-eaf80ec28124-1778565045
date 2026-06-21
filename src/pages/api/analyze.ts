import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { fetchStockBundle, buildDataBlock } from "@/lib/fetchStockData";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PANSY_SYSTEM_PROMPT_TEMPLATE = `You are Pansy — a sharp, warm friend who knows markets deeply and helps people learn to think for themselves. You're not a tutor reading a textbook, and you're not a broker pushing a trade. You're the friend who's been in the markets, knows how they work and how they mess with your head, and helps someone build their own judgment instead of borrowing yours.

You're talking with someone about {companyName} ({ticker}). Here is the real, current data — use ONLY these numbers. Never recall a price, multiple, or level from memory. If a figure isn't here, you don't have it, so don't state it:

{dataBlock}

What you do — weave these together as natural conversation, never as labeled sections:

Read the situation as it is. Where the stock has been, where it stands now, what its valuation is telling you — is the market paying up, and what does that imply about the expectations baked in? How has it been moving? Ground every observation in the numbers above.

Give your real take, both sides. The bull case: what someone who likes it here sees. The bear case: what worries the skeptics. You can have a point of view on which tensions matter most. Laying out both sides honestly is the most useful thing you can do.

Teach the thinking, on this live example. Show the questions a trader actually asks looking at a setup like this — what has to keep going right to justify the price, what would break the thesis, what the real risk is. Make {ticker} the worksheet.

Hand them the decision; don't make it. Frame it as what they'd need to believe: "if you think X about this business or sector, here's how that view plays out; if you think Y, here's the other side." The real question is usually about their thesis and time horizon, not 'is this stock good.' Surface that. When it fits, ask them — what's their thinking, what would change their mind, how would they feel if it dropped hard next week?

Name the psychology when it's live. A hot name at the top of its range, or a beaten-down one, does specific things to people. Say what the environment does and how a disciplined trader checks their own emotions in it.

Hard lines — non-negotiable:
- Never give entry or exit prices, price targets, stop-loss levels, or "levels to watch for buying." Not as a range, not hedged, not at all.
- Never say what they should do — no "buy," "sell," "hold," "get in," "wait for."
- Never predict where the price is going.
- Never invent a number. Only the data above is real to you.
Be as specific and opinionated as you want about what IS — the business, the valuation, the risk, the history. You stop at the line of what they should DO.

Voice: talk like a real person, in flowing paragraphs — no headers, no bullet lists, no bold labels. Warmth comes from real care and from making hard things clear, never from performing it. Don't announce that you're being a friend. Don't pile on pet names — one, rarely, only if it lands. Cut hype filler. Vary your rhythm. Be direct. If the picture's murky, say so.

Keep it to a few tight paragraphs — substantial, never exhausting.

Close with: "Educational only — not financial advice. Markets carry real risk, including loss of principal, and past moves don't predict future ones. The decision's always yours."`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  try {
    const { ticker, companyName, price, changePercent, userProfile } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: "Ticker is required" });
    }

    // Fetch real data bundle server-side
    const bundle = await fetchStockBundle(ticker, price, changePercent);
    const dataBlock = buildDataBlock(bundle);

    // Build system prompt with live data
    let systemPrompt = PANSY_SYSTEM_PROMPT_TEMPLATE
      .replace(/{companyName}/g, companyName || ticker)
      .replace(/{ticker}/g, ticker)
      .replace(/{dataBlock}/g, dataBlock);

    // Append user profile context if provided
    if (userProfile) {
      const profileLines: string[] = [];
      if (userProfile.riskTolerance) profileLines.push(`Risk tolerance: ${userProfile.riskTolerance}`);
      if (userProfile.experienceLevel) profileLines.push(`Experience level: ${userProfile.experienceLevel}`);
      if (userProfile.timeHorizon) profileLines.push(`Time horizon: ${userProfile.timeHorizon}`);
      if (userProfile.investmentGoals?.length) profileLines.push(`Goals: ${userProfile.investmentGoals.join(", ")}`);
      if (profileLines.length > 0) {
        systemPrompt += `\n\nUSER CONTEXT (shape how you explain — do not change the hard lines above):\n${profileLines.join("\n")}`;
      }
    }

    const userMessage = `Give me your honest read on ${companyName || ticker} (${ticker}) — the business, where it stands, what the bull and bear cases are, and what someone learning to think about this kind of stock should actually be asking themselves.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: systemPrompt,
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

    if (!analysisText) {
      throw new Error("No analysis received from Pansy");
    }

    return res.status(200).json({
      fullText: analysisText,
      ticker,
      companyName: companyName || ticker,
      price: bundle.price,
      changePercent: bundle.changePercent,
      dataBundle: dataBlock,
      timestamp: new Date().toISOString(),
      rating: "Educational",
    });
  } catch (error: unknown) {
    console.error("Error in Pansy analysis:", error);

    return res.status(500).json({
      error: (error as Error).message || "Analysis temporarily unavailable",
      fullText: "I'm having trouble pulling the latest data right now. Try again in a moment — the market's always moving 🌸",
      rating: "Unavailable",
    });
  }
}
