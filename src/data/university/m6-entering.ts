import type { UniversityLesson } from "@/data/university/m1-chart-reading";

export const M6_LESSONS: UniversityLesson[] = [
  {
    module: "m6-entering",
    slug: "position-sizing",
    title: "Position Sizing — The Math That Keeps You Alive",
    subtitle: "How much you commit to any trade decides whether a string of losses is a bruise or a knockout.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "The single most important lesson, taught first: position sizing is how much you commit to any one trade — it decides whether a string of losses is a bruise or a knockout.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "You can be right less than half the time and be fine if losers are small; right most of the time and still blow up if one oversized loss wipes you out. Survival first.",
      },
      {
        type: "how-identify",
        heading: "How the Math Works (Illustrative, Not Instructions)",
        content:
          "Traders decide a small fixed slice of the account to risk per trade — often something like 1-2% — then work backwards: risk amount divided by the distance to the invalidation level tells you the size. Sized from risk, not from excitement. (Illustrative numbers, not a recommendation.)",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "What % am I risking? Is that small and survivable? Did I size from my risk or pick an amount that 'felt right'?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Sizing by emotion; risking so much one loss really hurts; ignoring sizing entirely.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Position sizing turns trading from gambling into risk management — small controlled risk per trade keeps you in the game.\n\nEducational only. Not financial advice. These are risk and decision frameworks, not instructions to take any trade — sizing and stops manage risk, they don't guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .bar { transform-origin: bottom; animation: growBar 0.5s ease forwards; }
    .label { animation: fadeIn 0.4s ease forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Account bar -->
  <rect x="30" y="30" width="50" height="120" fill="#27B7C8" opacity="0.15" rx="4"/>
  <text x="55" y="22" fill="#F4F7FA" font-size="9" font-family="sans-serif" text-anchor="middle" opacity="0.6">Account</text>
  <!-- Risk slice -->
  <rect class="bar" x="30" y="122" width="50" height="28" fill="#ef4444" opacity="0.7" rx="4" style="animation-delay:0.3s"/>
  <text class="label" x="90" y="140" fill="#ef4444" font-size="9" font-family="sans-serif" style="animation-delay:0.7s">Risk slice (~1-2%)</text>
  <!-- Arrow: risk ÷ distance = size -->
  <text class="label" x="130" y="70" fill="#F4F7FA" font-size="10" font-family="sans-serif" opacity="0.8" style="animation-delay:1s">Risk Amount</text>
  <line class="label" x1="195" y1="78" x2="225" y2="78" stroke="#27B7C8" stroke-width="1.5" style="animation-delay:1.1s"/>
  <text class="label" x="130" y="100" fill="#F4F7FA" font-size="10" font-family="sans-serif" opacity="0.8" style="animation-delay:1.2s">÷ Distance to</text>
  <text class="label" x="130" y="115" fill="#F4F7FA" font-size="10" font-family="sans-serif" opacity="0.8" style="animation-delay:1.2s">Invalidation</text>
  <line class="label" x1="130" y1="125" x2="280" y2="125" stroke="#F4F7FA" stroke-width="1" opacity="0.3" style="animation-delay:1.3s"/>
  <text class="label" x="130" y="145" fill="#49B06E" font-size="11" font-family="sans-serif" font-weight="bold" style="animation-delay:1.4s">= Position Size</text>
</svg>`,
    quiz: [
      {
        q: "Why is position sizing called 'the math that keeps you alive'?",
        options: [
          "It guarantees profits on every trade",
          "It controls how much damage any single loss can do",
          "It predicts the direction of the next move",
          "It eliminates the need for a stop-loss",
        ],
        correct: 1,
        explanation:
          "Position sizing controls how much of the account is at risk on any single trade. Keeping that slice small means a string of losses is survivable — not account-ending.",
      },
      {
        q: "In the illustrative sizing framework, what does the position size derive from?",
        options: [
          "How excited the trader feels about the setup",
          "The risk amount divided by the distance to the invalidation level",
          "A fixed number of shares regardless of price",
          "The account's total value multiplied by current volatility",
        ],
        correct: 1,
        explanation:
          "The framework works backwards from risk: decide what dollar amount to risk, then divide by the distance to the invalidation level to find the appropriate size. Risk-first, not excitement-first.",
      },
      {
        q: "A trader is right 40% of the time. Under what condition can they still be profitable?",
        options: [
          "They increase size on every trade to compensate",
          "They stop trading until their win rate improves",
          "Their winners are significantly larger than their losers",
          "They only trade the most volatile stocks",
        ],
        correct: 2,
        explanation:
          "If losses are small and controlled and wins are meaningfully larger, a sub-50% win rate can still produce positive results over many trades. This is why sizing and risk-to-reward matter more than being right.",
      },
      {
        q: "What is the most common position sizing mistake?",
        options: [
          "Using a fixed % of the account as the risk unit",
          "Working backwards from the invalidation level",
          "Sizing by emotion — picking an amount that 'feels right'",
          "Keeping the risk slice small per trade",
        ],
        correct: 2,
        explanation:
          "Sizing based on emotion or intuition — rather than a defined risk percentage and the chart's invalidation level — is the most common mistake. It leads to inconsistent, often oversized losses.",
      },
    ],
    girlToGirlTip:
      "Protecting your money comes before growing it. You can't win the game if you get knocked out of it — size so no single trade can end you.",
    videoSlot: null,
  },

  {
    module: "m6-entering",
    slug: "risk-vs-reward",
    title: "Risk vs. Reward",
    subtitle: "The ratio that lets you be wrong often and still come out ahead.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Before anything: what am I risking, and what's the realistic reward if it works? That ratio is the lens everything passes through.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "A favorable ratio means you can be wrong often and still come out ahead, because wins are bigger than losses. The goal becomes 'make the math work over many trades,' not 'be right.'",
      },
      {
        type: "how-identify",
        heading: "How It's Reasoned (Concept, Not a Setup)",
        content:
          "Compare entry-to-invalidation distance (risk) against the distance to a realistic objective (reward). A setup where reward dwarfs risk is treated very differently from one where they're equal — regardless of how 'sure' it feels.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "What's my risk if wrong? A realistic reward if right? Is the ratio actually favorable, or am I fantasizing about reward and ignoring risk?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Focusing only on upside; risking a lot to make a little; inventing an unrealistic reward to justify a trade.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Risk-to-reward lets you be wrong often and still win — it shifts the goal from being right to making the math work.\n\nEducational only. Not financial advice. These are risk and decision frameworks, not instructions to take any trade — sizing and stops manage risk, they don't guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes growUp { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes growDown { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .reward-bar { transform-origin: bottom; animation: growUp 0.6s ease 0.4s forwards; transform: scaleY(0); }
    .risk-bar { transform-origin: top; animation: growDown 0.4s ease forwards; transform: scaleY(0); }
    .label { animation: fadeIn 0.4s ease 1.2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Entry line -->
  <line x1="60" y1="110" x2="260" y2="110" stroke="#F4F7FA" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.5"/>
  <text x="15" y="114" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">Entry</text>
  <!-- Risk bar (down) -->
  <rect class="risk-bar" x="100" y="110" width="40" height="35" fill="#ef4444" opacity="0.7" rx="3"/>
  <!-- Reward bar (up) -->
  <rect class="reward-bar" x="100" y="5" width="40" height="105" fill="#49B06E" opacity="0.7" rx="3"/>
  <!-- Labels -->
  <text class="label" x="150" y="133" fill="#ef4444" font-size="9" font-family="sans-serif">Risk: 1</text>
  <text class="label" x="150" y="55" fill="#49B06E" font-size="9" font-family="sans-serif">Reward: 3</text>
  <text class="label" x="155" y="108" fill="#27B7C8" font-size="10" font-family="sans-serif" font-weight="bold">3:1 ratio</text>
</svg>`,
    quiz: [
      {
        q: "Why does a favorable risk-to-reward ratio allow a trader to be wrong more than 50% of the time?",
        options: [
          "Because they make fewer trades overall",
          "Because wins are larger than losses, so the math can still work over many trades",
          "Because the market moves in their favor automatically",
          "Because they use a wider stop-loss",
        ],
        correct: 1,
        explanation:
          "If each win is, say, 3x the size of each loss, a trader only needs to be right roughly 1 in 4 times to break even — and right more often than that to be profitable. The ratio does the work.",
      },
      {
        q: "What does the 'risk' component in risk-to-reward represent?",
        options: [
          "The total account value",
          "The distance from entry to the invalidation level",
          "The number of shares traded",
          "How volatile the stock has been historically",
        ],
        correct: 1,
        explanation:
          "Risk is the distance from the entry to where the trade idea is considered wrong (the invalidation level). This is what can be lost if the idea fails.",
      },
      {
        q: "What is the most common way traders distort their risk-to-reward calculation?",
        options: [
          "Using realistic objectives based on chart structure",
          "Keeping the risk small relative to reward",
          "Inventing an unrealistic reward to make a poor setup look attractive",
          "Comparing the ratio across multiple setups",
        ],
        correct: 2,
        explanation:
          "Traders often inflate the reward side of the ratio — imagining price going much further than the chart supports — to justify a setup that doesn't actually offer a favorable ratio.",
      },
      {
        q: "A trader consistently takes setups where the risk is twice the realistic reward. What happens over many trades?",
        options: [
          "They break even since wins and losses balance",
          "They lose money on average even with a 50% win rate",
          "They profit because they win more often",
          "The ratio doesn't affect long-term results",
        ],
        correct: 1,
        explanation:
          "Risking 2 to make 1 means that at a 50% win rate, losses outweigh gains. The trader needs to be right more than 66% of the time just to break even — a very difficult standard to meet consistently.",
      },
    ],
    girlToGirlTip:
      "'How much can I make?' is the fun question. 'How much can I lose?' keeps you in business. Ask the second one first.",
    videoSlot: null,
  },

  {
    module: "m6-entering",
    slug: "choosing-an-entry",
    title: "Choosing an Entry",
    subtitle: "Where reasons align and risk is clearly defined — a condition met, not a moment of nerve.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "An entry isn't a random moment of courage — it's where your reasons line up, the thesis is confirmed, and risk is clearly defined.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "Where you engage shapes your whole risk picture — a thoughtful entry near a logical level keeps risk tight; a chased entry far from any level makes risk huge and the stop fuzzy.",
      },
      {
        type: "how-identify",
        heading: "How It's Reasoned (No Copyable Price)",
        content:
          "Look for confluence — structure, a level, a pattern or signal agreeing — and an entry area where the invalidation is close and clear. The entry isn't 'this price,' it's 'this condition being met.'",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "What confirms this idea? Is my invalidation close and clear from here? Entering on a plan, or chasing out of FOMO?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Entering with no clear invalidation; chasing far from any level so risk balloons; calling a hunch a 'setup.'",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "A good entry is where reasons align and risk is clearly defined — a condition met, not a moment of nerve.\n\nEducational only. Not financial advice. These are risk and decision frameworks, not instructions to take any trade — sizing and stops manage risk, they don't guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .draw { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawLine 1.8s ease forwards; }
    .label { animation: fadeIn 0.5s ease 2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Support level -->
  <line x1="20" y1="120" x2="300" y2="120" stroke="#27B7C8" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.6"/>
  <!-- Price approaching level -->
  <polyline class="draw" points="20,60 60,80 90,70 120,95 150,115 170,118" fill="none" stroke="#F4F7FA" stroke-width="2" opacity="0.7"/>
  <!-- Confluence arrow + entry zone -->
  <rect x="148" y="108" width="40" height="24" fill="#49B06E" opacity="0.15" rx="3"/>
  <circle cx="168" cy="120" r="6" fill="#49B06E" opacity="0.8"/>
  <!-- Invalidation line below -->
  <line x1="20" y1="145" x2="300" y2="145" stroke="#ef4444" stroke-width="1" stroke-dasharray="4 3" opacity="0.5"/>
  <text class="label" x="22" y="117" fill="#27B7C8" font-size="9" font-family="sans-serif">Support</text>
  <text class="label" x="195" y="116" fill="#49B06E" font-size="9" font-family="sans-serif">Entry area</text>
  <text class="label" x="22" y="142" fill="#ef4444" font-size="9" font-family="sans-serif">Invalidation</text>
</svg>`,
    quiz: [
      {
        q: "What is 'confluence' in the context of choosing an entry?",
        options: [
          "Multiple indicators all showing overbought conditions",
          "Structure, a level, and a signal all agreeing at the same area",
          "The highest volume point of the day",
          "A price that feels psychologically important",
        ],
        correct: 1,
        explanation:
          "Confluence means multiple independent factors — a structural level, a pattern, a signal — all pointing to the same area. More agreement generally means a more reliable entry area.",
      },
      {
        q: "Why does a chased entry (far from any logical level) make risk larger?",
        options: [
          "Chased entries always trigger stop-losses",
          "The invalidation level is far away, meaning more can be lost if wrong",
          "Position size automatically increases when chasing",
          "Volatility is always higher in chased entries",
        ],
        correct: 1,
        explanation:
          "When price is far from a logical level, the natural invalidation point is also far away — meaning the distance from entry to 'I'm wrong' is large, which means larger potential loss per share.",
      },
      {
        q: "How does an experienced trader frame their entry?",
        options: [
          "As a specific price number to target precisely",
          "As a condition being met — reasons aligning, invalidation clear",
          "As the lowest price of the last 20 sessions",
          "As a gut feeling confirmed by recent news",
        ],
        correct: 1,
        explanation:
          "A thoughtful entry is a condition: the thesis is confirmed, a level is nearby, and the invalidation is close and clear. 'This price' is less important than 'this condition being true.'",
      },
      {
        q: "What does it mean if a trader can't identify their invalidation level before entering?",
        options: [
          "The trade is particularly high-probability",
          "The stop can be set arbitrarily below the entry",
          "They don't have a defined entry — they have a wish",
          "The strategy doesn't require a stop",
        ],
        correct: 2,
        explanation:
          "Not being able to clearly define where the idea is wrong means there's no real trade thesis — just a hope. A genuine entry always has a clear invalidation level built into the reasoning before the trade is taken.",
      },
    ],
    girlToGirlTip:
      "If you can't say exactly where you'd be wrong, you don't have an entry — you have a wish. Clarity before courage.",
    videoSlot: null,
  },

  {
    module: "m6-entering",
    slug: "stop-loss-invalidation",
    title: "The Stop-Loss — Your Invalidation Level",
    subtitle: "The point that says 'this idea is wrong' — decided in advance, calmly.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "A stop-loss is the point that says 'this idea is wrong' — decided in advance, calmly, before you're emotionally tangled in the trade.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "It keeps a small planned loss from becoming a huge emotional one. The trader who decides their exit before entering is a different person from the one improvising while losing.",
      },
      {
        type: "how-identify",
        heading: "How It's Reasoned (Concept, Not a Number)",
        content:
          "Place the invalidation where the idea breaks — beyond a structure level, under a pattern, past where the setup stops making sense — using volatility (ATR) to give room against normal noise. The level comes from the chart's logic, not 'how much I'm willing to lose.'",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Where is this idea genuinely proven wrong? Did I set it before entering? Enough room for noise, or too tight out of fear?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "No stop at all; placing it so tight normal noise triggers it; moving it away to avoid being wrong (the cardinal sin).",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "The stop is your pre-decided 'I'm wrong' line — set it from the chart's logic, in advance, and respect it.\n\nEducational only. Not financial advice. These are risk and decision frameworks, not instructions to take any trade — sizing and stops manage risk, they don't guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .draw { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawLine 2s ease forwards; }
    .label { animation: fadeIn 0.4s ease 2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Structure level -->
  <line x1="20" y1="90" x2="300" y2="90" stroke="#27B7C8" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.6"/>
  <!-- Price held at structure, then moves up -->
  <polyline class="draw" points="20,130 50,110 80,95 100,88 130,85 165,70 200,55 240,40" fill="none" stroke="#49B06E" stroke-width="2.5"/>
  <!-- Invalidation zone below structure -->
  <rect x="20" y="115" width="280" height="20" fill="#ef4444" opacity="0.07" rx="3"/>
  <line x1="20" y1="125" x2="300" y2="125" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
  <!-- Entry dot -->
  <circle cx="100" cy="88" r="5" fill="#27B7C8" opacity="0.9"/>
  <text class="label" x="108" y="85" fill="#27B7C8" font-size="9" font-family="sans-serif">Entry area</text>
  <text class="label" x="22" y="87" fill="#27B7C8" font-size="9" font-family="sans-serif">Structure</text>
  <text class="label" x="22" y="122" fill="#ef4444" font-size="9" font-family="sans-serif">Invalidation (idea broken here)</text>
</svg>`,
    quiz: [
      {
        q: "Where should the invalidation level (stop) come from?",
        options: [
          "A fixed percentage below the entry price",
          "The chart's logic — where the trade idea is genuinely broken",
          "Wherever keeps the dollar loss under a specific target",
          "Just below the previous day's low",
        ],
        correct: 1,
        explanation:
          "The invalidation level should come from the chart — where the structure, pattern, or setup that justified the trade no longer makes sense. 'How much I'm willing to lose' is the wrong starting point.",
      },
      {
        q: "What is the 'cardinal sin' in stop-loss management?",
        options: [
          "Setting it before entering the trade",
          "Giving it room for normal market noise",
          "Moving it further away to avoid being stopped out",
          "Using ATR to calibrate it to volatility",
        ],
        correct: 2,
        explanation:
          "Moving a stop further away once the trade is on — to avoid taking a loss — is the cardinal sin. It turns a planned small loss into a potentially large emotional one and destroys the discipline the stop was meant to provide.",
      },
      {
        q: "Why might a stop that's set too tight cause problems?",
        options: [
          "It means too much of the account is at risk",
          "Normal price noise triggers it before the idea gets a chance to work",
          "The position size becomes too small",
          "It forces the trader to hold losing positions longer",
        ],
        correct: 1,
        explanation:
          "Markets fluctuate normally. A stop placed too close to the entry gets hit by routine noise — triggering a loss on a trade that may have actually been right — before the setup ever had space to develop.",
      },
      {
        q: "Why is the trader who sets a stop before entering different from one who improvises?",
        options: [
          "Pre-set stops guarantee the trade will be profitable",
          "Pre-set stops eliminate all market risk",
          "Pre-entry stops are made calmly, not while emotional and losing",
          "Pre-entry stops make position sizing unnecessary",
        ],
        correct: 2,
        explanation:
          "Decisions made before entering are calm and analytical. Decisions made while watching a position move against you are emotional. The pre-entry stop is rational-you protecting emotional-you.",
      },
    ],
    girlToGirlTip:
      "Decide where you're wrong before you're emotionally in it. The stop is calm-you protecting panicked-you.",
    videoSlot: null,
  },

  {
    module: "m6-entering",
    slug: "waiting-for-confirmation",
    title: "Waiting for Confirmation",
    subtitle: "Patience is a position — let the market prove your idea before committing.",
    difficulty: "Advanced",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Patience is a position. Confirmation means letting the market prove your idea before committing, instead of front-running a setup that hasn't happened.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "Acting early feels smart but it's where fakeouts catch people. Waiting costs a little of the move and removes a lot of bad trades.",
      },
      {
        type: "how-identify",
        heading: "How It's Reasoned",
        content:
          "Define in advance what would confirm the idea — a level holding, a candle closing a certain way, volume showing up — and treat 'not yet confirmed' as a complete answer. No confirmation, no trade.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "What exactly would confirm this? Has it actually happened, or am I anticipating? Waiting on a plan, or just impatient?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Jumping the gun; redefining 'confirmation' on the fly to justify acting; mistaking impatience for conviction.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Confirmation trades a little of the move for far fewer bad entries — 'not yet' is a complete answer.\n\nEducational only. Not financial advice. These are risk and decision frameworks, not instructions to take any trade — sizing and stops manage risk, they don't guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes popDot { from { r: 0; opacity:0; } to { r: 6; opacity:1; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .draw { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .dot { animation: popDot 0.4s ease 2s forwards; r: 0; opacity: 0; }
    .label { animation: fadeIn 0.4s ease 2.5s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Price approaching level, holding, then breakout -->
  <polyline class="draw" points="20,140 60,110 100,90 130,88 155,86 175,88 185,85" fill="none" stroke="#F4F7FA" stroke-width="2" opacity="0.6"/>
  <!-- Level line -->
  <line x1="80" y1="85" x2="220" y2="85" stroke="#27B7C8" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
  <!-- Confirmation: candle closes above -->
  <rect x="188" y="65" width="14" height="20" fill="#49B06E" opacity="0.8" rx="2"/>
  <!-- Confirmed entry dot -->
  <circle class="dot" cx="202" cy="75" r="6" fill="#49B06E"/>
  <text class="label" x="85" y="80" fill="#27B7C8" font-size="9" font-family="sans-serif">Level</text>
  <text class="label" x="210" y="72" fill="#49B06E" font-size="9" font-family="sans-serif">Confirmed</text>
  <text class="label" x="22" y="160" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.5">Not yet → not yet → confirmed ✓</text>
</svg>`,
    quiz: [
      {
        q: "What does 'not yet confirmed' mean in a trade decision process?",
        options: [
          "The trader should enter with half the planned position",
          "It is a complete answer — no trade until confirmation arrives",
          "The setup is invalid and should be removed from the watchlist",
          "Volume needs to be checked before deciding",
        ],
        correct: 1,
        explanation:
          "'Not yet confirmed' is a complete answer that prevents acting too early. The setup exists — the trade does not yet. Waiting for the defined confirmation signal is the entire point.",
      },
      {
        q: "Why does acting before confirmation lead to more fakeout losses?",
        options: [
          "Early entries always have worse prices",
          "Entering before the setup is proven means riding out more false starts",
          "Confirmation signals are legally required before trading",
          "Early entries always trigger stop-losses immediately",
        ],
        correct: 1,
        explanation:
          "Entering before confirmation means participating in a potential move before the market has provided any evidence the move is happening. Many of those anticipatory entries hit setups that never materialize.",
      },
      {
        q: "What is 'redefining confirmation on the fly'?",
        options: [
          "Updating the confirmation criteria based on new chart information",
          "Changing what counts as confirmation after watching price move, to justify acting",
          "Using volume as confirmation instead of price",
          "Setting a later time for the confirmation check",
        ],
        correct: 1,
        explanation:
          "Redefining confirmation mid-watch — moving the goalposts because price is moving and FOMO is kicking in — is a form of self-deception. The confirmation criteria should be defined before watching.",
      },
      {
        q: "What is the cost of waiting for confirmation vs. acting early?",
        options: [
          "Missing the trade entirely since confirmed moves always reverse",
          "A slightly less optimal entry in exchange for far fewer bad trades",
          "Larger position sizes required to compensate",
          "Only works in trending markets, never in ranges",
        ],
        correct: 1,
        explanation:
          "Waiting for confirmation typically means entering a little later than the absolute best price — but that small cost is exchanged for a large reduction in fakeout losses. The entry is slightly less optimal; the trade quality is significantly higher.",
      },
    ],
    girlToGirlTip:
      "The trades you don't take protect the account as much as the ones you do. Missing a move is annoying; forcing one is expensive.",
    videoSlot: null,
  },

  {
    module: "m6-entering",
    slug: "scaling-in",
    title: "Scaling In",
    subtitle: "Build the position in pieces — test the waters and add as the idea proves itself.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Instead of committing the whole position in one shot, build it in pieces — test the waters and add as the idea proves itself.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "It softens the cost of being wrong early and lets you commit more only once it's working — managing uncertainty rather than betting it all on one moment.",
      },
      {
        type: "how-identify",
        heading: "How It's Reasoned",
        content:
          "Start partial, then add on confirmation or at planned points if the thesis holds — always keeping total risk within sizing rules. Scaling stages the same risk; it's not an excuse to risk more.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Does my total size still respect my risk rules? Adding because it's confirming, or doubling down on a loser? A plan for each add?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Letting 'scaling in' become over-risking; adding to a losing position hoping it turns; no plan for the adds.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Scaling stages the same risk in pieces — it manages uncertainty, it doesn't license risking more.\n\nEducational only. Not financial advice. These are risk and decision frameworks, not instructions to take any trade — sizing and stops manage risk, they don't guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .draw { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .bar { transform-origin: bottom; animation: growBar 0.4s ease forwards; }
    .label { animation: fadeIn 0.4s ease 2.3s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Price rising -->
  <polyline class="draw" points="20,150 70,120 120,95 170,70 220,50 280,30" fill="none" stroke="#27B7C8" stroke-width="2"/>
  <!-- Add 1 -->
  <rect class="bar" x="60" y="135" width="14" height="18" fill="#49B06E" opacity="0.6" rx="2" style="animation-delay:0.4s"/>
  <!-- Add 2 -->
  <rect class="bar" x="110" y="110" width="14" height="28" fill="#49B06E" opacity="0.75" rx="2" style="animation-delay:0.7s"/>
  <!-- Add 3 -->
  <rect class="bar" x="160" y="82" width="14" height="40" fill="#49B06E" opacity="0.9" rx="2" style="animation-delay:1s"/>
  <text class="label" x="52" y="162" fill="#49B06E" font-size="8" font-family="sans-serif">Add 1</text>
  <text class="label" x="102" y="162" fill="#49B06E" font-size="8" font-family="sans-serif">Add 2</text>
  <text class="label" x="152" y="162" fill="#49B06E" font-size="8" font-family="sans-serif">Add 3</text>
  <text class="label" x="185" y="45" fill="#27B7C8" font-size="9" font-family="sans-serif">As thesis confirms</text>
</svg>`,
    quiz: [
      {
        q: "What is the primary purpose of scaling into a position?",
        options: [
          "To maximize the number of shares owned at the lowest price",
          "To manage uncertainty by committing more only as the idea proves itself",
          "To avoid ever having a full position",
          "To increase total risk beyond normal sizing rules",
        ],
        correct: 1,
        explanation:
          "Scaling in means starting small and adding as the thesis confirms — reducing the cost of being wrong early while allowing full participation once the idea is proving out.",
      },
      {
        q: "What does scaling in NOT do?",
        options: [
          "Stage risk across multiple entry points",
          "Reduce the cost of a failed early entry",
          "License taking on more total risk than sizing rules allow",
          "Allow position building as confirmation arrives",
        ],
        correct: 2,
        explanation:
          "Scaling in is a way to stage the same total planned risk — not a mechanism to increase it. The total of all adds should still respect the overall risk rules. 'I'll scale in' is not an excuse for a larger total position.",
      },
      {
        q: "What is the dangerous version of 'scaling in' that traders must avoid?",
        options: [
          "Adding a second tranche after the first entry confirms",
          "Adding to a losing position hoping it will turn around",
          "Planning the add points in advance",
          "Keeping each add within total risk rules",
        ],
        correct: 1,
        explanation:
          "Adding to a losing position — sometimes called 'averaging down' — is the dangerous version. It's not scaling in; it's increasing risk in a losing trade in hope of a reversal, which can dramatically amplify losses.",
      },
      {
        q: "What should a trader define before beginning to scale into a position?",
        options: [
          "The exact price at which the position will be profitable",
          "The plan for each add — conditions, size, and total risk",
          "The news catalyst that will drive the move",
          "The broker's margin requirements for the position",
        ],
        correct: 1,
        explanation:
          "Scaling in should follow a pre-defined plan: what conditions trigger each add, how large each add is, and what the total risk across all adds equals. Unplanned adds are guessing, not strategy.",
      },
    ],
    girlToGirlTip:
      "Scaling in is 'prove it to me' in action — commit a little, add as it earns trust. Never an excuse to bet bigger than your rules.",
    videoSlot: null,
  },

  {
    module: "m6-entering",
    slug: "scaling-out",
    title: "Scaling Out",
    subtitle: "Bank some, let some run — resolving the impossible wish of locking gains and riding winners.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "The mirror — instead of exiting all at once, take partial profits along the way while letting a portion run.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "It makes peace with two impossible wishes: locking in gains and letting winners run. Banking some removes the agony of a profit evaporating; keeping some participates if it continues.",
      },
      {
        type: "how-identify",
        heading: "How It's Reasoned",
        content:
          "Plan in advance points to take a portion off — easing risk and emotion as it works — leaving a remainder with a trailing plan. The point is to reduce pressure and lock progress, not fiddle randomly.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Did I plan partials in advance, or react emotionally? Scaling out to manage risk, or soothe nerves? Plan for the runner?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Taking all profit at the first wiggle (cutting winners short); or never taking any and round-tripping a gain to zero.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Scaling out banks some, lets some run — it resolves lock-it-in vs. let-it-run instead of choosing one.\n\nEducational only. Not financial advice. These are risk and decision frameworks, not instructions to take any trade — sizing and stops manage risk, they don't guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .draw { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .bar { transform-origin: bottom; animation: growBar 0.4s ease forwards; }
    .label { animation: fadeIn 0.4s ease 2.3s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Price rising -->
  <polyline class="draw" points="20,155 70,120 120,90 170,65 220,45 280,25" fill="none" stroke="#49B06E" stroke-width="2.5"/>
  <!-- Take off 1 -->
  <rect class="bar" x="108" y="108" width="14" height="22" fill="#27B7C8" opacity="0.7" rx="2" style="animation-delay:0.5s"/>
  <!-- Take off 2 -->
  <rect class="bar" x="158" y="82" width="14" height="32" fill="#27B7C8" opacity="0.85" rx="2" style="animation-delay:0.9s"/>
  <!-- Runner arrow -->
  <line x1="225" y1="44" x2="275" y2="28" stroke="#49B06E" stroke-width="2" marker-end="url(#arr)"/>
  <text class="label" x="100" y="143" fill="#27B7C8" font-size="8" font-family="sans-serif">Take partial</text>
  <text class="label" x="150" y="125" fill="#27B7C8" font-size="8" font-family="sans-serif">Take partial</text>
  <text class="label" x="232" y="38" fill="#49B06E" font-size="9" font-family="sans-serif">Runner</text>
</svg>`,
    quiz: [
      {
        q: "What problem does scaling out attempt to solve?",
        options: [
          "Choosing between locking gains and letting winners run — it does both",
          "Avoiding taxes on profitable trades",
          "Reducing the number of trades taken",
          "Eliminating the need for a trailing stop",
        ],
        correct: 0,
        explanation:
          "Scaling out is a practical compromise between two competing wishes: the desire to lock in gains (satisfied by taking partials) and the desire to let winners run (satisfied by keeping a portion on).",
      },
      {
        q: "What is 'round-tripping a gain'?",
        options: [
          "Entering and exiting the same trade twice",
          "Holding a winning position until it returns to the entry price or worse",
          "Taking profits on a round number price level",
          "Scaling out in equal portions at regular intervals",
        ],
        correct: 1,
        explanation:
          "Round-tripping means watching a significant open profit shrink back to zero (or a loss) because no partial profits were taken and the position was held too long. It's the result of never taking anything off.",
      },
      {
        q: "When should partial exits be planned?",
        options: [
          "Randomly as the trade develops",
          "After watching the first sign of weakness",
          "In advance — before the trade is entered",
          "Only once the full target is reached",
        ],
        correct: 2,
        explanation:
          "Like entries and stops, partial exit plans should be made before entering — when thinking is calm and analytical. Deciding when to take partials in the heat of a moving trade leads to emotional, reactive decisions.",
      },
      {
        q: "What is 'cutting winners short'?",
        options: [
          "Taking all profit at the first tiny wiggle, well before the thesis has played out",
          "Using a trailing stop to follow a winner higher",
          "Scaling out at the first planned partial level",
          "Exiting a position after it has doubled",
        ],
        correct: 0,
        explanation:
          "Cutting winners short means panic-exiting an entire winning position at the first small adverse move — long before the original thesis has had time to develop. It's the opposite error to round-tripping.",
      },
    ],
    girlToGirlTip:
      "Taking a little off the table can be the difference between a calm trade and a stressful one. No shame in paying yourself along the way.",
    videoSlot: null,
  },

  {
    module: "m6-entering",
    slug: "avoiding-fomo",
    title: "Avoiding FOMO",
    subtitle: "The racing-heart feeling is a warning, not a green light.",
    difficulty: "Beginner",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "FOMO — fear of missing out — is the most expensive emotion in trading, and it lives at the entry: the urge to chase something that's already run because watching it go hurts.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "FOMO entries are late, far from any logical level, with fuzzy risk — the opposite of everything in this module. The market engineers moves to trigger it because impatient money is easy money.",
      },
      {
        type: "how-identify",
        heading: "How It's Reasoned Away",
        content:
          "Anchor to the plan and a simple truth: there's always another opportunity. Missing one is free; chasing one is expensive. Treat the racing-heart feeling as a warning, not a green light.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Entering on my plan, or because I can't stand watching it go? Is my heart racing? (If yes, slow down.) Is the risk defined, or am I chasing?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Chasing an already-extended move; abandoning rules over one exciting candle; confusing urgency with opportunity.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "FOMO produces late entries with fuzzy risk — the racing-heart feeling is a warning, not a signal. There's always another trade.\n\nEducational only. Not financial advice. These are risk and decision frameworks, not instructions to take any trade — sizing and stops manage risk, they don't guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .draw { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .label { animation: fadeIn 0.4s ease 2.2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Price runs up fast -->
  <polyline class="draw" points="20,155 50,145 80,130 105,105 130,70 155,40 175,25" fill="none" stroke="#49B06E" stroke-width="2.5"/>
  <!-- Ideal entry zone (early, near level) -->
  <rect x="95" y="95" width="30" height="25" fill="#27B7C8" opacity="0.12" rx="3"/>
  <text class="label" x="97" y="110" fill="#27B7C8" font-size="8" font-family="sans-serif">Ideal zone</text>
  <!-- FOMO chase entry (late, extended) -->
  <circle cx="175" cy="25" r="7" fill="#ef4444" opacity="0.8"/>
  <text class="label" x="182" y="22" fill="#ef4444" font-size="9" font-family="sans-serif">FOMO chase</text>
  <!-- Then reversal -->
  <polyline class="draw" points="175,25 200,50 225,80 255,115 285,145" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 3" style="animation-delay:2s"/>
  <text class="label" x="240" y="140" fill="#ef4444" font-size="8" font-family="sans-serif">Reversal</text>
</svg>`,
    quiz: [
      {
        q: "Why are FOMO entries typically more dangerous than planned entries?",
        options: [
          "They always coincide with news events",
          "They are late, far from logical levels, with fuzzy or undefined risk",
          "They require larger position sizes",
          "They happen only in bear markets",
        ],
        correct: 1,
        explanation:
          "FOMO entries happen after a move has already run — meaning the trader is late, far from any sensible level, and often has no clear invalidation point. All three are the opposite of a disciplined entry.",
      },
      {
        q: "What does 'the market engineers moves to trigger FOMO' mean?",
        options: [
          "Market makers deliberately set price targets to trap retail investors",
          "Fast moves naturally create urgency that pulls undisciplined money in at the worst time",
          "News is released to time with major price moves",
          "Algorithms are programmed to find FOMO traders",
        ],
        correct: 1,
        explanation:
          "Fast, strong moves create urgency and FOMO naturally. The people who chase those moves at extended prices provide liquidity for those who entered earlier and are now selling. Impatient money tends to arrive late and exit painfully.",
      },
      {
        q: "What is the correct interpretation of a racing heart when watching a fast-moving position?",
        options: [
          "A signal that the move has strong momentum",
          "A green light to act quickly before missing more",
          "A warning to slow down, not a signal to act",
          "Confirmation that the trade will continue in that direction",
        ],
        correct: 2,
        explanation:
          "Emotional arousal — a racing heart, urgency, excitement — is a warning that decision-making is being taken over by emotion rather than analysis. Experienced traders treat that feeling as a cue to pause, not act.",
      },
      {
        q: "What is the core antidote to FOMO in trading?",
        options: [
          "Moving to a faster timeframe to catch the move",
          "Increasing position size to compensate for a late entry",
          "Anchoring to the plan and the truth that there is always another opportunity",
          "Setting price alerts and acting immediately when triggered",
        ],
        correct: 2,
        explanation:
          "The antidote to FOMO is perspective: missing one move is free. Chasing it poorly is expensive. Disciplined traders anchor to their plan and accept that passing on a FOMO moment protects the account for the next setup.",
      },
    ],
    girlToGirlTip:
      "The market is designed to make you feel like you're missing out — that's the trap. Calm money makes better decisions than panicked money, every time.",
    videoSlot: null,
  },
];

export function getM6LessonBySlug(slug: string): UniversityLesson | undefined {
  return M6_LESSONS.find((l) => l.slug === slug);
}
