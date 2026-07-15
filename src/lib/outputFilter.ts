const DIRECTIVE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(you should|I recommend|I suggest|I advise)\s+(buy|sell|hold|invest|short|get in|exit|enter)\b/gi, label: "direct-advice" },
  { pattern: /\b(buy|sell|short|dump|load up on)\s+[A-Z]{1,5}\b/g, label: "ticker-directive" },
  { pattern: /\bprice target\s*(of|is|at|:)?\s*\$?\d/gi, label: "price-target" },
  { pattern: /\b(buy|sell|enter|exit|get in)\s+(at|around|below|above|near)\s*\$\d/gi, label: "level-directive" },
  { pattern: /\bstop[- ]?loss\s+(at|of|around)\s*\$\d/gi, label: "stop-loss-directive" },
  { pattern: /\b(guaranteed|risk[- ]?free|can't lose|sure thing|free money)\b/gi, label: "guarantee-language" },
];

const REPLACEMENT = "[content removed — educational platform policy]";

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
