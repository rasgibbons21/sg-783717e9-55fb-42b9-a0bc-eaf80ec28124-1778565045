// A backstop for Pansy's replies. The persona already forbids trade calls; this
// replaces any sentence that slips through, without touching plain teaching,
// honest warnings or clearly labelled examples.

const INSTRUMENT = "(?:[A-Z]{2,6}|gold|silver|the euro|the dollar|the pound|the yen|forex|indices|it|this|that)";
const ACT_NOW = "(?:now|here|today|tomorrow|this week|right away|immediately)";
const LEVEL = "(?:at|around|near|above|below|under|over)\\s*\\$?\\d[\\d,.]*";

const DIRECTIVE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(you should|I recommend|I suggest|I advise|I would|I'd)\s+(buy|sell|hold|invest|short|get in|exit|enter)\b/i, label: "direct-advice" },
  { pattern: new RegExp(`\\b(?:buy|sell|short|load up on|dump)\\s+${INSTRUMENT}\\s+(?:${ACT_NOW}|${LEVEL})`, "i"), label: "act-now-directive" },
  { pattern: new RegExp(`^\\s*(?:buy|sell|short)\\s+${INSTRUMENT}\\s*[.!]?\\s*$`, "i"), label: "bare-directive" },
  { pattern: new RegExp(`\\b(?:consider|try|think about)\\s+(?:buying|selling|shorting)\\s+${INSTRUMENT}`, "i"), label: "soft-directive" },
  { pattern: /\bgo (?:long|short)\b/i, label: "go-long-short" },
  { pattern: new RegExp(`\\b(?:buy|sell|enter|exit|get in)\\s+(?:[A-Z]{1,5}\\s+)?${LEVEL}`, "i"), label: "level-directive" },
  { pattern: /\bprice target\s*(of|is|at|:)?\s*\$?\d/i, label: "price-target" },
  { pattern: /\bstop(?:[- ]?loss)?\s+(?:(?:on|for)\s+[A-Z]{1,5}\s+)?(at|of|around|near)\s*\$?\d/i, label: "stop-directive" },
  { pattern: /\btake[- ]?profit\s+(at|of|around|near)\s*\$?\d/i, label: "take-profit-directive" },
  { pattern: /\b(guaranteed|risk[- ]?free|can't lose|sure thing|free money)\b/i, label: "guarantee-language" },
];

const LABELLED_EXAMPLE = /\b(for example|for instance|as an example|imagine|made[- ]up|let's say|say you|suppose|hypothetical)\b/i;
const NEGATED_PROMISE = /\b(nothing|no such thing|not|isn't|aren't|never|no one|nobody|can't be|cannot be|without)\b[^.!?]*\b(guaranteed|risk[- ]?free|sure thing|free money)\b/i;

const REPLACEMENT = "I can't give trade calls, but I'd love to show you how to read this yourself.";

function directiveIn(sentence: string): string | null {
  if (LABELLED_EXAMPLE.test(sentence)) return null;
  const hit = DIRECTIVE_PATTERNS.find(({ pattern, label }) => {
    if (label === "guarantee-language" && NEGATED_PROMISE.test(sentence)) return false;
    return pattern.test(sentence);
  });
  return hit?.label ?? null;
}

/** Splits text into sentences, keeping the spacing between them so paragraphs survive. */
function splitSentences(text: string): string[] {
  return text.match(/[^.!?\n]+(?:\.(?=\d)[^.!?\n]*)*[.!?]*\s*|\s+/g) ?? [text];
}

export function scrubDirectives(text: string): string {
  let offered = false;
  return splitSentences(text)
    .map((sentence) => {
      const label = directiveIn(sentence);
      if (!label) return sentence;
      console.warn(`[outputFilter] directive detected: ${label}`);
      if (offered) return "";
      offered = true;
      const spacing = sentence.match(/\s*$/)?.[0] ?? "";
      return REPLACEMENT + spacing;
    })
    .join("");
}

export function checkDirectives(text: string, routeName: string): void {
  for (const sentence of splitSentences(text)) {
    const label = directiveIn(sentence);
    if (label) console.warn(`[outputFilter] directive in ${routeName}: ${label}`);
  }
}
