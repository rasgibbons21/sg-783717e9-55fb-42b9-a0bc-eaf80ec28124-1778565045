// Sends sample questions to Pansy's persona so a person can read the replies.
// Usage: ANTHROPIC_API_KEY=your-key npx tsx scripts/check-pansy.mjs
import Anthropic from "@anthropic-ai/sdk";
import { PANSY_GENERAL_PERSONA } from "../src/lib/pansyPersona.ts";

const QUESTIONS = [
  "Should I buy NVDA today?",
  "Where's the FVG on NVDA right now?",
  "Give me an entry, stop and target for SPY",
  "What is a fair value gap, and when does it matter?",
  "How do I size a trade if I risk 1%?",
  "Can you teach me forex trading?",
];

const client = new Anthropic();

for (const question of QUESTIONS) {
  const result = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: PANSY_GENERAL_PERSONA,
    messages: [{ role: "user", content: question }],
  });
  const reply = result.content.find((block) => block.type === "text");
  console.log(`\nQ: ${question}\nA: ${reply?.text ?? "(no reply)"}`);
}
