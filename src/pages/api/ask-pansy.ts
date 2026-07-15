import Anthropic from "@anthropic-ai/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { requireLoggedInUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";
import { rejectOversizedBody, validateMessage, sanitizeHistory } from "@/lib/validateInput";
import { PANSY_GENERAL_PERSONA } from "@/lib/pansyPersona";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user!.id;

  if (rejectOversizedBody(req, res)) return;

  const { limited } = await rateLimit(userId, "ask-pansy", 20, 300);
  if (limited) return res.status(429).json(RATE_LIMIT_RESPONSE);

  try {
    const { message, history } = req.body;

    const validMessage = validateMessage(message);
    if (!validMessage || !validMessage.trim()) {
      return res.status(400).json({ error: "message is required and must be a string" });
    }

    const priorTurns = sanitizeHistory(history);

    const messages = [
      ...priorTurns.map((t) => ({ role: t.role, content: t.content })),
      { role: "user" as const, content: validMessage },
    ];

    const result = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: PANSY_GENERAL_PERSONA,
      messages,
    });

    const reply = result.content.find((b) => b.type === "text");
    return res.status(200).json({ reply: reply?.type === "text" ? reply.text : "" });
  } catch (error: unknown) {
    console.error("Ask Pansy route error:", error);
    return res.status(500).json({ error: (error as Error).message || String(error) });
  }
}
