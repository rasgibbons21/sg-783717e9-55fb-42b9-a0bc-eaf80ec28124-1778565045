import Anthropic from "@anthropic-ai/sdk";
import { fetchStockBundle, buildDataBlock } from "@/lib/fetchStockData";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface WeeklyStockPick {
  symbol: string;
  price: number;
  why: string;
  entry_zone: string;
  risk: string;
  technical_brief: string;
  fundamental_brief: string;
  timeframe: string;
}

const PICK_SYSTEM = `You are Pansy, the financial mentor at She Blooms Wealth. You built wealth as a single mom through disciplined, research-driven investing. You educate — you never pump.

Your task: use web search to find 3 stocks that are GENUINELY NOTABLE this week — big earnings, sector shifts, unusual volume, macro catalysts, or a strong technical setup. Pick a mix: one large-cap, one mid/small-cap, one ETF or sector play.

Return ONLY a JSON array of 3 ticker symbols, no explanation:
["AAPL", "PLTR", "XLF"]

Rules:
- Pick stocks that are in the news or moving for real reasons
- No meme stocks unless they have a genuine catalyst
- No crypto or penny stocks
- Diversify across sectors`;

const ANALYSIS_SYSTEM = `You are Pansy, the financial mentor at She Blooms Wealth. You built wealth as a single mom through disciplined investing. You share your research openly — what you see, what you'd watch, and what could go wrong. You're warm, honest, and never hype.

Analyze this stock using the market data provided. Write for women who are learning to invest — clear, no jargon, but don't dumb it down.

Return your analysis as JSON (no markdown, pure JSON):
{
  "why": "2-3 sentences on why this stock is worth watching right now. Lead with the catalyst or fundamental story, then confirm with technicals if relevant.",
  "entry_zone": "A specific price or range you'd watch. Be precise, e.g. '$142-145' or 'below $90'.",
  "risk": "1-2 sentences on what could go wrong. Be real — name the specific risk, not vague warnings.",
  "technical_brief": "One sentence on the technical picture — trend, key levels, momentum.",
  "fundamental_brief": "One sentence on valuation or business health.",
  "timeframe": "Your suggested watching timeframe, e.g. '3-6 months' or '1+ year hold if fundamentals hold'."
}

Rules:
- Educational, not advisory. You're sharing your research, not telling anyone to buy.
- Be honest. If the valuation is stretched, say so. If the chart looks ugly, say so.
- Speak like a smart friend, not a Wall Street robot.
- Only use data from what's provided — never invent numbers.`;

export async function generateWeeklyPicks(): Promise<WeeklyStockPick[]> {
  const pickResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    temperature: 0.7,
    system: PICK_SYSTEM,
    tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
    messages: [
      {
        role: "user",
        content: `It's ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}. Find 3 notable stocks for this week's Late Bloomers newsletter. Return only the JSON array of tickers.`,
      },
    ],
  });

  let tickerText = "";
  for (const block of pickResponse.content) {
    if (block.type === "text") tickerText += block.text;
  }

  const tickerMatch = tickerText.match(/\[[\s\S]*?\]/);
  if (!tickerMatch) throw new Error("Could not parse ticker list from Claude");
  const tickers: string[] = JSON.parse(tickerMatch[0]);

  if (tickers.length === 0) throw new Error("No tickers returned");

  const picks: WeeklyStockPick[] = [];

  for (const ticker of tickers.slice(0, 3)) {
    try {
      const bundle = await fetchStockBundle(ticker);
      const dataBlock = buildDataBlock(bundle);
      const rawPrice = parseFloat(bundle.price.replace(/[$,]/g, "")) || 0;

      const analysisResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        temperature: 0.5,
        system: ANALYSIS_SYSTEM,
        messages: [
          {
            role: "user",
            content: `Analyze ${ticker} for this week's Late Bloomers newsletter.\n\nMARKET DATA:\n${dataBlock}`,
          },
        ],
      });

      let analysisText = "";
      for (const block of analysisResponse.content) {
        if (block.type === "text") analysisText += block.text;
      }

      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const analysis = JSON.parse(jsonMatch[0]);

      picks.push({
        symbol: ticker.toUpperCase(),
        price: rawPrice,
        why: analysis.why,
        entry_zone: analysis.entry_zone || analysis.entryZone || analysis.entry_point || "",
        risk: analysis.risk,
        technical_brief: analysis.technical_brief || analysis.technicalBrief || "",
        fundamental_brief: analysis.fundamental_brief || analysis.fundamentalBrief || "",
        timeframe: analysis.timeframe || "",
      });
    } catch (err) {
      console.error(`Failed to analyze ${ticker}:`, err);
    }
  }

  if (picks.length === 0) throw new Error("All stock analyses failed");

  return picks;
}
