import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { requireProUser, sendAuthError } from "@/lib/requireProUser";
import { rateLimit, RATE_LIMIT_RESPONSE } from "@/lib/rateLimit";
import { rejectOversizedBody } from "@/lib/validateInput";
import { scrubDirectives } from "@/lib/outputFilter";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Lexi — a savvy side-hustle strategist who helps women find profitable niches that match their skills and lifestyle. You're warm, direct, and data-informed.

The user will describe their skills, interests, available time, and budget. Analyze these to suggest 3 concrete side hustle niches. For each niche:

1. **Niche Name** — a specific, actionable niche (not vague categories)
2. **Why It Fits You** — connect it to the user's specific skills and interests
3. **Market Demand** — assess demand level (High/Medium/Low) with reasoning
4. **Competition** — assess competition level with reasoning
5. **Revenue Potential** — realistic monthly income range for the first 3-6 months
6. **Time to First Dollar** — how long before they earn their first income
7. **Getting Started** — 3 concrete first steps they can take this week

Format your response in clear sections with markdown. Be specific — "freelance social media management for local restaurants" not just "social media."

End with a recommendation of which niche to try first and why.

Keep the total response under 1500 words. Be encouraging but honest about effort required.`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = await requireProUser(req);
  if (auth.error) return sendAuthError(res, auth.error);

  if (rejectOversizedBody(req, res)) return;

  const { limited } = await rateLimit(auth.user!.id, "niche-finder", 5, 300);
  if (limited) return res.status(429).json(RATE_LIMIT_RESPONSE);

  try {
    const { skills, interests, hoursPerWeek, budget, experience } = req.body;

    if (!skills || !interests) {
      return res.status(400).json({ error: "Skills and interests are required" });
    }

    const userMessage = `Here's what I'm working with:

**Skills:** ${skills}
**Interests:** ${interests}
**Available time:** ${hoursPerWeek || "Flexible"} hours per week
**Starting budget:** ${budget || "Under $100"}
**Experience level:** ${experience || "Beginner"}

Based on my profile, what are the best side hustle niches for me?`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "";
    const analysis = scrubDirectives(raw);

    return res.status(200).json({ analysis });
  } catch (err: any) {
    console.error("Niche finder error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
}
