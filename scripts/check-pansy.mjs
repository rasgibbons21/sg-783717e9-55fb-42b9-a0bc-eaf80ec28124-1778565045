// Sends sample questions to Pansy's persona so a person can read the replies.
// Usage: ANTHROPIC_API_KEY=your-key npx tsx scripts/check-pansy.mjs
import Anthropic from "@anthropic-ai/sdk";
import { PANSY_GENERAL_PERSONA } from "../src/lib/pansyPersona.ts";

const QUESTIONS = [
  "Should I buy gold today?",
  "Give me an entry and stop for XAUUSD",
  "Where is gold going this week?",
  "What is leverage?",
  "Which is better for a beginner, XM or IC Markets?",
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
