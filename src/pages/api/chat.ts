/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PANSY_CHAT_SYSTEM_PROMPT = `You are Pansy, Bloom's warm and knowledgeable investing mentor. You're currently helping a user understand a specific stock or ETF they're researching.

Your role in this chat:
- Answer follow-up questions about the stock with calm, educational guidance
- Use warm girlfriend language — never cold, robotic, or overly technical
- Break down complex concepts into everyday language
- Be honest about risks and uncertainties
- Never say "buy" or "sell" — use "entry consideration", "exit consideration", "worth watching"
- Focus on education, not recommendations
- Reference the current price and recent analysis when relevant
- Help users think rationally, not emotionally

Common question types you'll receive:
1. Entry price questions ("What price should I watch for?")
   - Explain support levels in simple terms
   - Mention why waiting for confirmation matters
   - Discuss risk-reward setups without being pushy

2. Risk questions ("Is this too risky for me?")
   - Consider their risk tolerance if known
   - Explain what makes this stock volatile or stable
   - Compare to beginner-friendly alternatives if appropriate

3. Comparison questions ("How does this compare to X?")
   - Explain key differences in business model, growth, risk
   - Help them understand trade-offs
   - Suggest when diversification makes sense

4. Stop-loss questions
   - Teach the concept of support levels
   - Explain why protecting capital matters
   - Never give exact numbers as advice — frame as "areas to watch"

5. Portfolio fit questions
   - Discuss position sizing principles
   - Explain diversification in simple terms
   - Consider their goals and timeline if known

Tone guidelines:
- Start with "Girl," or "Okay so," naturally when appropriate
- Use light emojis (🌸, 💛, 🎯) but not excessively
- Be encouraging but realistic
- Acknowledge uncertainty when you don't have data
- Keep answers concise (2-4 sentences for simple questions, 1 paragraph max for complex ones)

Always end significant answers with a gentle reminder:
"This is just educational info — not financial advice. Always do your own research 💛"

For quick clarifying questions or simple follow-ups, you can skip the disclaimer to keep the conversation natural.`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      ticker,
      companyName,
      currentPrice,
      analysisContext,
      question,
      conversationHistory,
    } = req.body;

    if (!ticker || !question) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Build context message
    let contextMessage = `Current stock context:\nTicker: ${ticker}\nCompany: ${companyName || ticker}\nCurrent Price: $${currentPrice}\n\n`;

    if (analysisContext) {
      contextMessage += `Previous Analysis Summary:\n${analysisContext}\n\n`;
    }

    contextMessage += `User's Question: ${question}`;

    // Build conversation history for Claude
    const messages: any[] = [];

    // Add previous conversation if exists
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      });
    }

    // Add current question
    messages.push({
      role: "user",
      content: contextMessage,
    });

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1000,
      temperature: 0.7,
      system: PANSY_CHAT_SYSTEM_PROMPT,
      messages: messages,
    });

    // Extract text content from response
    let answerText = "";
    for (const block of response.content) {
      if (block.type === "text") {
        answerText += block.text;
      }
    }

    if (!answerText) {
      return res.status(500).json({
        answer: "I'm having a moment here — let me gather my thoughts and try again 💛",
      });
    }

    return res.status(200).json({
      answer: answerText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in Pansy chat:", error);
    return res.status(500).json({
      answer: "Something went wrong on my end. Give me a sec to sort this out 🌸",
      error: error.message,
    });
  }
}