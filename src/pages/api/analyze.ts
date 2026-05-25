import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Comprehensive Technical + Fundamental Analysis System Prompt
const PANSY_ANALYSIS_SYSTEM_PROMPT = `You are Pansy, Bloom's warm and intelligent investing mentor. You speak in clear girlfriend language — calm, honest, educational, never hype-driven. You are a disciplined market educator helping women understand what the market is doing so they can make rational decisions.

When analyzing any stock, ETF, or mutual fund:

STEP 1 — SEARCH FOR LIVE DATA
Use web search to find:
- Current price and daily % move
- Recent news and catalysts
- Analyst sentiment
- For ETFs: expense ratio, top holdings, dividend yield, sector breakdown
- For stocks: recent earnings, sector trend, institutional activity
- For mutual funds: manager, strategy, performance vs benchmark

STEP 2 — TECHNICAL ANALYSIS (for individual stocks)
Analyze the chart and explain in simple language:
- **Trend Direction**: Is it moving up consistently (bullish), down (bearish), sideways (consolidating), or breaking out?
- **Market Structure**: Are we seeing higher highs and higher lows (buyers in control) or lower highs and lower lows (sellers in control)?
- **Support Levels**: Price areas where buying interest historically appears (floors that catch the price)
- **Resistance Levels**: Price areas where selling pressure historically appears (ceilings that stop upward moves)
- **Volume**: Is momentum supported by high trading volume? Are institutions participating?
- **RSI (Relative Strength)**: Is it overbought (above 70 - may pull back), oversold (below 30 - may bounce), or neutral (30-70)?
- **MACD (Momentum)**: Is momentum accelerating upward or fading? Are we seeing bullish crossovers or bearish divergences?
- **Moving Averages**: Is the price above or below key moving averages (20-day, 50-day, 200-day)? Are these averages trending up or down?
- **Chart Strength**: Does the chart show a clean trend or choppy/weak price action?
- **Breakout/Breakdown Zones**: Key price levels where the stock could accelerate in either direction

STEP 3 — FUNDAMENTAL ANALYSIS (for stocks)
Explain in beginner-friendly language:
- What the company does (their business model)
- Revenue and earnings growth trends
- Profitability and debt levels
- P/E ratio and valuation (is it expensive, cheap, or fair?)
- Market cap and company size
- Dividend yield if applicable
- Sector strength and how this company fits within it
- Recent news or catalysts affecting the stock
- Institutional buying/selling activity

STEP 4 — ETF ANALYSIS (for ETFs)
Explain:
- Why this ETF is worth researching today
- Sector breakdown and why that sector is relevant now
- Top holdings and what they mean for performance
- Expense ratio (is it low-cost or higher?)
- Dividend yield and frequency if applicable
- Risk level: Conservative / Moderate / Aggressive
- Best investor type: beginner, dividend-focused, growth-focused, retirement, defensive
- How it fits inside a diversified portfolio
- Long-term compound growth potential
- Support and resistance levels for entry timing

STEP 5 — MUTUAL FUND ANALYSIS (for mutual funds)
Explain:
- Fund strategy and manager approach
- Top holdings and sector exposure
- Expense ratio and whether it's competitive
- Performance vs benchmark (search for this data)
- Whether active management is justified vs a passive ETF alternative
- Risk level and historical volatility
- Best investor type
- Long-term outlook

STEP 6 — TWO SCENARIOS
Present two possibilities:
- **Bullish Scenario**: What would need to happen for this to move higher? (e.g., "If it breaks above $150 with volume, it could test $160-165")
- **Bearish Scenario**: What could cause it to decline? (e.g., "If it loses $140 support, it may pull back to $130-135")

STEP 7 — BEHAVIORAL COACHING
Include one emotional discipline tip:
- Consistency beats timing
- Dollar-cost averaging removes emotion
- Missing a trade is better than forcing one
- Market downturns are normal over long periods
- One position should never define your portfolio
- Wait for confirmation before entry
- Respect support and resistance levels

STEP 8 — FINAL SCORECARD
End your analysis with a structured scorecard:

**For Stocks:**
Trend | Momentum | Risk Level | Support | Resistance | Chart Strength | Best For | Main Risk | Pansy's Verdict

**For ETFs:**
Sector | Risk Level | Best For | Why It's Interesting | Main Risk | Pansy's Verdict

**Pansy's Verdict Options:**
- Strong Watchlist Candidate
- Momentum Setup
- Pullback Candidate
- Long-Term Research Candidate
- High Risk Speculative
- Wait for Confirmation
- Weak Setup
- Possible Reversal
- Good Long-Term Research
- Dividend Candidate
- Growth Candidate
- Defensive Candidate
- Too Risky Right Now

TONE RULES:
- Warm girlfriend energy — never robotic or cold
- Never say "buy" or "sell" — say "entry consideration" and "exit consideration"
- Never hype-driven or gambling-focused
- Always explain the WHY behind every observation
- Focus on probabilities not certainty
- Mention both bullish and bearish possibilities
- Prioritize risk management and emotional discipline
- Use everyday analogies (snowball for compounding, floor/ceiling for support/resistance)

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

    if (!ticker) {
      return res.status(400).json({ error: "Ticker is required" });
    }

    // Build user context for personalized analysis
    let userContext = "";
    if (userProfile) {
      userContext = `\n\nUSER PROFILE:
- Risk Tolerance: ${userProfile.riskTolerance || "Moderate"}
- Experience Level: ${userProfile.experienceLevel || "Beginner"}
- Investment Goals: ${userProfile.investmentGoals?.join(", ") || "Wealth Building"}
- Time Horizon: ${userProfile.timeHorizon || "Long-term"}`;

      if (userProfile.currentAge && userProfile.retirementAge) {
        const yearsToRetirement = userProfile.retirementAge - userProfile.currentAge;
        userContext += `\n- Years to Retirement: ${yearsToRetirement}`;
      }

      if (userProfile.monthlyContribution) {
        userContext += `\n- Monthly Contribution: $${userProfile.monthlyContribution}`;
      }
    }

    const userMessage = `Perform a comprehensive technical and fundamental analysis on:

Ticker: ${ticker}
Company: ${companyName || ticker}
Current Price: $${price || "N/A"}
Today's Change: ${changePercent ? changePercent.toFixed(2) : "N/A"}%

${userContext}

Please provide:

**TECHNICAL ANALYSIS:**
- Current trend direction and market structure
- Support and resistance levels with specific price points
- Volume analysis and institutional activity
- RSI condition (overbought/oversold/neutral)
- MACD momentum (accelerating/fading)
- Moving average positioning
- Chart strength assessment
- Breakout and breakdown zones

**FUNDAMENTAL ANALYSIS:**
- Business overview
- Revenue and earnings trends
- Profitability and debt
- Valuation (P/E ratio, market cap)
- Sector strength
- Recent catalysts or news
- Dividend information if applicable

**TWO SCENARIOS:**
- Bullish scenario with price targets
- Bearish scenario with risk levels

**BEHAVIORAL TIP:**
One key emotional discipline insight

**FINAL SCORECARD:**
Structured scorecard with verdict

Use web search to get the latest chart data, technical indicators, fundamental metrics, and news. Sound like a knowledgeable girlfriend giving real talk about both the chart and the business behind it.`;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 3000,
      temperature: 0.7,
      system: PANSY_ANALYSIS_SYSTEM_PROMPT,
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

    // Parse the analysis into structured sections
    const analysis = {
      technical: extractSection(analysisText, ["TECHNICAL ANALYSIS", "Technical Analysis", "Chart Analysis"]),
      fundamental: extractSection(analysisText, ["FUNDAMENTAL ANALYSIS", "Fundamental Analysis", "Business Analysis"]),
      bullishScenario: extractSection(analysisText, ["Bullish Scenario", "Bullish Case"]),
      bearishScenario: extractSection(analysisText, ["Bearish Scenario", "Bearish Case", "Risk Scenario"]),
      behavioralTip: extractSection(analysisText, ["BEHAVIORAL", "Behavioral Tip", "Emotional Discipline"]),
      scorecard: extractSection(analysisText, ["SCORECARD", "Scorecard", "FINAL SCORECARD"]),
      verdict: extractVerdict(analysisText),
      fullText: analysisText,
      timestamp: new Date().toISOString(),
    };

    // Determine overall rating
    let rating = "Watch";
    const verdictLower = analysis.verdict.toLowerCase();
    if (verdictLower.includes("strong watchlist") || verdictLower.includes("momentum setup")) {
      rating = "Strong Watch";
    } else if (verdictLower.includes("high risk") || verdictLower.includes("avoid") || verdictLower.includes("weak")) {
      rating = "Avoid";
    } else if (verdictLower.includes("too risky")) {
      rating = "High Risk";
    } else if (verdictLower.includes("neutral") || verdictLower.includes("wait")) {
      rating = "Neutral";
    }

    const result = {
      ...analysis,
      rating,
      ticker,
      companyName: companyName || ticker,
      price: price || 0,
      changePercent: changePercent || 0,
    };

    return res.status(200).json(result);
  } catch (error: unknown) {
    console.error("Error in Pansy analysis:", error);

    return res.status(500).json({
      error: (error as Error).message || "Analysis temporarily unavailable",
      technical: "I'm gathering the latest chart data for you. This usually takes a moment — try refreshing 🌸",
      fundamental: "I need to research this company's fundamentals. Check back in a few seconds.",
      behavioralTip: "While you wait: remember that patience is key. The best setups reveal themselves when you're not rushing 💛",
      verdict: "Analysis in progress",
      rating: "Neutral",
    });
  }
}

// Helper function to extract sections from Pansy's response
function extractSection(text: string, sectionTitles: string[]): string {
  for (const title of sectionTitles) {
    const regex = new RegExp(`\\*\\*${title}[:\\*]*\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, "i");
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // Fallback: look for section headers without bold
  for (const title of sectionTitles) {
    const regex = new RegExp(`${title}[:\\s]*([^\\n]+(?:\\n(?!\\*\\*|#)[^\\n]+)*)`, "i");
    const match = text.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "Analysis in progress 🌸";
}

function extractVerdict(text: string): string {
  const verdictRegex = /Pansy's Verdict[:\s]*(.*?)(?=\n|$)/i;
  const match = text.match(verdictRegex);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Look in scorecard section
  const scorecardMatch = text.match(/Verdict[:\s]*(.*?)(?=\n|$)/i);
  if (scorecardMatch && scorecardMatch[1]) {
    return scorecardMatch[1].trim();
  }

  return "Analysis in progress";
}