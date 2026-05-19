import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Comprehensive Stock/ETF/Mutual Fund Analysis System Prompt
const PANSY_SYSTEM_PROMPT = `You are Pansy, Bloom's warm and intelligent investing mentor. You speak in clear girlfriend language — calm, honest, educational, never hype-driven. You are a disciplined market educator helping women understand what the market is doing so they can make rational decisions.

When analyzing any stock, ETF, or mutual fund:

STEP 1 — SEARCH FOR LIVE DATA
Use web search to find:
- Current price and daily % move
- Recent news and catalysts
- Analyst sentiment
- For ETFs: expense ratio, top holdings, dividend yield, sector breakdown
- For stocks: recent earnings, sector trend, institutional activity
- For mutual funds: manager, strategy, performance vs benchmark

STEP 2 — STOCK ANALYSIS (for individual stocks)
Explain in simple language:
- What the company does
- Overall trend: bullish, bearish, sideways, consolidating, breaking out
- Market structure: higher highs/lows or lower highs/lows — explain what this means for buyers vs sellers
- Volume: is momentum supported? Are institutions participating?
- Support and resistance levels — explain why they matter
- Momentum: RSI, MACD, moving averages in plain language
- Risk assessment: volatility, earnings risk, sector weakness
- Two scenarios: Bullish scenario and Bearish scenario
- Emotional discipline tip: avoid chasing, wait for confirmation, respect levels

End stock analysis with this scorecard:
Trend | Momentum | Risk Level | Support | Resistance | Chart Strength | Best For | Main Risk | Pansy's Verdict

Verdict options: Strong Watchlist Candidate / Momentum Setup / Pullback Candidate / Long-Term Research Candidate / High Risk Speculative / Wait for Confirmation / Weak Setup / Possible Reversal

STEP 3 — ETF ANALYSIS (for ETFs)
Explain:
- Why this ETF is worth researching today
- Sector breakdown and why that sector is relevant now
- Top holdings and what they mean for performance
- Risk level: Conservative / Moderate / Aggressive
- Best investor type: beginner, dividend, growth, retirement, defensive
- Entry reasoning: overextended / pulling back / near support / breaking out — never say "buy now" aggressively
- Support and resistance in beginner language
- Long-term outlook: growth, income, or stability focus
- How it fits inside a diversified portfolio
- Compound growth potential over long time horizons

End ETF analysis with scorecard:
Sector | Risk Level | Best For | Why It's Interesting | Main Risk | Pansy's Verdict

Verdict options: Strong Watchlist Candidate / Good Long-Term Research / Dividend Candidate / Growth Candidate / Defensive Candidate / Wait for Pullback / Too Risky Right Now

STEP 4 — MUTUAL FUND ANALYSIS (for mutual funds)
Explain:
- Fund strategy and manager approach
- Top holdings and sector exposure
- Expense ratio and whether it is competitive
- Performance vs benchmark (search for this)
- Whether active management is justified vs a passive ETF alternative
- Risk level and volatility history
- Best investor type
- Long-term outlook

STEP 5 — BEHAVIORAL COACHING
Every analysis must include one behavioral tip from Pansy:
- Consistency beats timing
- Dollar-cost averaging removes emotion
- Missing a trade is better than forcing one
- Market downturns are normal over long periods
- One position should never define your portfolio

TONE RULES:
- Warm girlfriend energy — never robotic or cold
- Never say buy or sell — say entry consideration and exit consideration
- Never hype-driven or gambling-focused
- Always explain the WHY behind every observation
- Focus on probabilities not certainty
- Mention both bullish and bearish possibilities
- Prioritize risk management and emotional discipline

Always end every analysis with:
"This is for educational purposes only and is not financial advice. Investing involves risk including possible loss of principal. Historical performance does not guarantee future results. Always do your own research and consult a financial professional before investing 🌸"`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { ticker, companyName, price, changePercent, userProfile } = req.body;

    if (!ticker || !companyName) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Build user context for personalized analysis
    let userContext = "";
    if (userProfile) {
      userContext = `\n\nUSER PROFILE:
- Risk Tolerance: ${userProfile.riskTolerance || "Moderate"}
- Experience Level: ${userProfile.experienceLevel || "Beginner"}
- Investment Goals: ${userProfile.investmentGoals?.join(", ") || "Wealth Building"}`;
      
      if (userProfile.age && userProfile.retirementAge) {
        const yearsToRetirement = userProfile.retirementAge - userProfile.age;
        userContext += `\n- Current Age: ${userProfile.age}
- Target Retirement Age: ${userProfile.retirementAge}
- Time Horizon: ${yearsToRetirement} years`;
      }
      
      if (userProfile.monthlyContribution) {
        userContext += `\n- Monthly Contribution: $${userProfile.monthlyContribution}`;
      }
    }

    const userMessage = `Analyze this investment for a female investor:

Ticker: ${ticker}
Company: ${companyName}
Current Price: $${price}
Change Today: ${changePercent?.toFixed(2)}%

${userContext}

Please provide a complete analysis following your framework:
1. Use web search to get the latest data, news, and analyst sentiment
2. For stocks: provide full trend, structure, volume, momentum analysis with scorecard
3. For ETFs: provide sector reasoning, holdings breakdown, portfolio fit with scorecard
4. For mutual funds: provide strategy, performance vs benchmark, expense ratio analysis
5. Include entry/exit considerations with bullish and bearish scenarios
6. Include risk assessment and behavioral coaching tip
7. End with your verdict

Structure your response with clear sections: Overview, Entry Consideration, Exit Consideration, Risk Assessment, Behavioral Tip, and Scorecard.`;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2500,
      temperature: 0.7,
      system: PANSY_SYSTEM_PROMPT,
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

    // Extract text content from response
    let analysisText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        analysisText += block.text;
      }
    }

    if (!analysisText) {
      throw new Error("No analysis text received from Pansy");
    }

    // Parse the analysis into structured format
    const extractSection = (text: string, titles: string[]): string => {
      for (const title of titles) {
        const regex = new RegExp(`\\*\\*${title}[:\\s]*\\*\\*\\s*([^\\n]+(?:\\n(?!\\*\\*)[^\\n]+)*)`, "i");
        const match = text.match(regex);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      const paragraphs = text.split("\n\n").filter(p => p.trim().length > 0);
      return paragraphs[0] || "";
    };

    const analysis = {
      overview: extractSection(analysisText, ["Overview", "Current Situation", "What's Happening"]) || analysisText.substring(0, 400),
      entry: extractSection(analysisText, ["Entry Consideration", "Entry", "Entry Point"]) || "Research timing carefully.",
      exit: extractSection(analysisText, ["Exit Consideration", "Exit", "Hold Strategy"]) || "Monitor position regularly.",
      risk: extractSection(analysisText, ["Risk Assessment", "Risk", "Main Risk", "Risks to Know"]) || "All investments carry risk.",
      behavioralTip: extractSection(analysisText, ["Behavioral Tip", "Behavioral Coaching", "Mindset Tip"]) || "Consistency beats timing.",
      scorecard: extractSection(analysisText, ["Scorecard", "Summary"]) || "",
      verdict: extractSection(analysisText, ["Verdict", "Pansy's Verdict", "Final Verdict"]) || "Research Candidate",
      fullText: analysisText,
      timestamp: new Date().toISOString(),
    };

    // Determine sentiment based on verdict
    let sentiment: "bullish" | "neutral" | "bearish" = "neutral";
    const verdictLower = analysis.verdict.toLowerCase();
    if (
      verdictLower.includes("strong") ||
      verdictLower.includes("momentum") ||
      verdictLower.includes("candidate")
    ) {
      sentiment = "bullish";
    } else if (
      verdictLower.includes("wait") ||
      verdictLower.includes("weak") ||
      verdictLower.includes("risky")
    ) {
      sentiment = "bearish";
    }

    return res.status(200).json({
      ...analysis,
      sentiment,
      ticker,
      companyName,
      price,
      changePercent,
    });
  } catch (error: any) {
    console.error("Error calling Anthropic API:", error);
    return res.status(500).json({ 
      error: error.message,
      overview: "I need a moment to gather the latest data for you. Try refreshing in a few seconds 🌸",
      entry: "Hold tight while I analyze current conditions.",
      exit: "I'll have insights for you shortly.",
      risk: "Market conditions are always changing.",
      behavioralTip: "Patience is key in investing.",
      verdict: "Analyzing...",
      fullText: "Analysis temporarily unavailable. Please try again.",
      sentiment: "neutral",
    });
  }
}