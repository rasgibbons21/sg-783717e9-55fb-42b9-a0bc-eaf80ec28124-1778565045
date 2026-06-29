import Anthropic from "@anthropic-ai/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { requireLoggedInUser, sendAuthError, isRateLimited } from "@/lib/requireProUser";
import { PANSY_GENERAL_PERSONA } from "@/lib/pansyPersona";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ChatTurn = { role: "user" | "assistant"; content: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Ask Pansy is a free-tier feature — any logged-in user, not Pro-gated.
  const auth = await requireLoggedInUser(req);
  if (auth.error) return sendAuthError(res, auth.error);
  const userId = auth.user!.id;

  // Light abuse guard: 30 messages per 5 minutes per user.
  if (isRateLimited(userId, "ask-pansy", 30, 5 * 60 * 1000)) {
    return res.status(429).json({ error: "You're chatting fast! Give me a moment and try again." });
  }

  try {
    const { message, history } = req.body as { message?: string; history?: ChatTurn[] };

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    // Keep the last 10 turns for context; ignore anything malformed.
    const priorTurns = Array.isArray(history)
      ? history
          .filter(
            (t): t is ChatTurn =>
              !!t &&
              (t.role === "user" || t.role === "assistant") &&
              typeof t.content === "string" &&
              t.content.trim().length > 0
          )
          .slice(-10)
      : [];

    const messages = [
      ...priorTurns.map((t) => ({ role: t.role, content: t.content })),
      { role: "user" as const, content: message },
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
