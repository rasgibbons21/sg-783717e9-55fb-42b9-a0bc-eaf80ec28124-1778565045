import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
// In a real app, this should be a server-only environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: "Anthropic API key is not configured" });
    }

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      temperature: 0.7,
      system: `You are Dahlia, an expert, warm, and approachable financial guide for women.
Your goal is to explain stock/ETF data in plain, casual "girlfriend-tone" language.
No jargon. Keep it empowering, grounded, and concise.

Formatting rules:
- Keep it to 2-3 short paragraphs.
- Use emojis naturally.
- Always end with exactly this disclaimer: "This is just educational info — not financial advice. Always invest what feels right for you 💛 — Dahlia"

You must respond with a JSON object in this exact format:
{
  "content": "Your warm, plain-language analysis paragraphs...",
  "sentiment": "Optimistic" | "Cautious" | "Neutral" | "Watchful"
}`,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseContent = msg.content[0];
    if (responseContent.type !== "text") {
      throw new Error("Unexpected response type from Anthropic");
    }

    // Try to parse the JSON response
    try {
      const parsedResponse = JSON.parse(responseContent.text);
      return res.status(200).json(parsedResponse);
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", responseContent.text);
      return res.status(500).json({ error: "Invalid response format from AI" });
    }
  } catch (error: any) {
    console.error("Error in AI analysis endpoint:", error);
    return res.status(500).json({ error: error.message || "Failed to generate analysis" });
  }
}