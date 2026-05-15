import type { NextApiRequest, NextApiResponse } from "next";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (!ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not configured");
    return res.status(200).json({
      content: "I'm having trouble connecting to my analysis system right now. Try again in a moment! 💛",
      sentiment: "Neutral",
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: "You are Dahlia, a warm friendly female AI investing guide for Bloom - an investing app for women. You explain investing like a knowledgeable girlfriend - warm, clear, no jargon, encouraging but honest. Use emojis occasionally. Never say buy or sell. Always add educational disclaimer.",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API error:", errorData);
      throw new Error("Anthropic API request failed");
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Determine sentiment from the analysis
    let sentiment = "Neutral";
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("strong") || lowerContent.includes("good") || lowerContent.includes("positive") || lowerContent.includes("climbing") || lowerContent.includes("momentum")) {
      sentiment = "Positive";
    } else if (lowerContent.includes("concern") || lowerContent.includes("dropping") || lowerContent.includes("risk") || lowerContent.includes("careful") || lowerContent.includes("watch")) {
      sentiment = "Negative";
    }

    return res.status(200).json({
      content,
      sentiment,
      analysis: content,
    });
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return res.status(200).json({
      content: "I'm having a little trouble analyzing this right now. The market data is still there though - take a look at the charts and news yourself! 💛",
      sentiment: "Neutral",
    });
  }
}