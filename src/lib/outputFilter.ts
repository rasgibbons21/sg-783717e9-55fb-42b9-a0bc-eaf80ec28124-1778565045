// A backstop for Pansy's replies. The persona already forbids trade calls; this
// catches any that slip through, without touching plain teaching about stops or buying.

const INSTRUMENT = "(?:[A-Z]{2,6}|gold|silver|the euro|the dollar|the pound|the yen|forex|indices|it|this|that)";
const ACT_NOW = "(?:now|here|today|tomorrow|this week|right away|immediately)";
const LEVEL = "(?:at|around|near|above|below|under|over)\\s*\\$?\\d[\\d,.]*";

const DIRECTIVE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(you should|I recommend|I suggest|I advise|I would|I'd)\s+(buy|sell|hold|invest|short|get in|exit|enter)\b/gi, label: "direct-advice" },
  { pattern: new RegExp(`\\b(?:[Bb]uy|[Ss]ell|[Ss]hort|[Ll]oad up on|[Dd]ump)\\s+${INSTRUMENT}\\s+(?:${ACT_NOW}|${LEVEL})`, "g"), label: "act-now-directive" },
  { pattern: new RegExp(`\\b(?:buy|sell|enter|exit|get in)\\s+${LEVEL}`, "gi"), label: "level-directive" },
  { pattern: /\bprice target\s*(of|is|at|:)?\s*\$?\d/gi, label: "price-target" },
  { pattern: /\bstop[- ]?loss\s+(at|of|around|near)\s*\$?\d/gi, label: "stop-loss-directive" },
  { pattern: /\btake[- ]?profit\s+(at|of|around|near)\s*\$?\d/gi, label: "take-profit-directive" },
  { pattern: /\b(guaranteed|risk[- ]?free|can't lose|sure thing|free money)\b/gi, label: "guarantee-language" },
];

const REPLACEMENT = "(I can't give trade calls, but I'd love to show you how to read this yourself.)";

export function scrubDirectives(text: string): string {
  let scrubbed = text;
  let flagged = false;

  for (const { pattern, label } of DIRECTIVE_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(scrubbed)) {
      flagged = true;
      console.warn(`[outputFilter] directive detected: ${label}`);
      pattern.lastIndex = 0;
      scrubbed = scrubbed.replace(pattern, REPLACEMENT);
    }
  }

  if (flagged) {
    console.warn("[outputFilter] LLM output contained directive language — scrubbed before delivery");
  }

  return scrubbed;
}

export function checkDirectives(text: string, routeName: string): void {
  for (const { pattern, label } of DIRECTIVE_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      console.warn(`[outputFilter] directive in ${routeName}: ${label}`);
    }
  }
}
