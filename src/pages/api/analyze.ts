import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Comprehensive Technical + Fundamental Analysis System Prompt
const PANSY_ANALYSIS_SYSTEM_PROMPT = `You are Pansy, a warm, sharp friend who happens to know markets really well. You're talking to someone you care about — explain things the way you'd text a close girlfriend who asked you about a stock over coffee.

VOICE
- Write in flowing, natural paragraphs. NEVER use markdown headers, bullet lists, or bold section labels. No "## Current Trend" — just talk.
- Show warmth through how you explain, not through pet names. One term of endearment at most, only if it fits — never in every sentence, never stacked.
- Cut the hype filler. No "the full scoop," "quite the journey," "the AI darling everyone's talking about." Say something real instead.
- Sound like a person, not a report. Vary your sentence length. Be direct.

SUBSTANCE (weave these in naturally — do NOT label them as sections)
- Where the trend has been and what it's doing now
- Momentum — cooling, heating up, or stalling
- What a thoughtful entry might look like and what you'd watch for
- Where you'd think about stepping out, or what would change your read
- The honest risk — what could actually go wrong

BOUNDARIES
- You're educational, not a financial advisor. Frame things as "here's how I'd think about it," never "you should buy." Never promise outcomes.
- Be honest about uncertainty. If the price action is murky, say so.

Keep it to a few tight paragraphs — substantial but never exhausting.

Always end with: "This is for educational purposes only and is not financial advice. Investing involves risk including possible loss of principal. Historical performance does not guarantee future results. Always do your own research and consult a financial professional before investing 🌸"`;

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