import type { UniversityLesson } from "@/data/university/m1-chart-reading";

export const M7_LESSONS: UniversityLesson[] = [
  {
    module: "m7-managing",
    slug: "moving-your-stop-loss",
    title: "Moving Your Stop-Loss",
    subtitle: "Stops can move — but only toward safety, and only to a logical level.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Once a trade works, the stop doesn't have to stay frozen. Traders move it to reduce risk as the trade proves itself — always in one direction only.",
      },
      {
        type: "why-matters",
        heading: "The Golden Rule",
        content:
          "A stop is moved to reduce risk, never to increase it. The moment you move it away to dodge a loss, you've abandoned your plan.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "As price moves favorably and new structure forms, the old invalidation may no longer be relevant — so they bring the stop to a new logical level, locking in less risk.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Moving to reduce risk, or to avoid being wrong? New level based on real structure, or hope? Would calm-me agree?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Widening a stop to 'give it room' while losing; moving on emotion instead of structure.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Move a stop only to reduce risk, only to a logical level — never away to avoid a loss.\n\nEducational only. Not financial advice. These are trade-management frameworks, not instructions — managing risk does not guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes slideUp { from { transform: translateY(0); opacity: 0; } to { transform: translateY(-35px); opacity: 1; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .price-l { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.3s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Rising price -->
  <polyline class="price-l" points="20,145 60,125 100,105 140,85 180,65 220,48 270,35" fill="none" stroke="#49B06E" stroke-width="2.5"/>
  <!-- Stop 1 (original) -->
  <line x1="20" y1="160" x2="120" y2="160" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7"/>
  <text class="lbl" x="125" y="164" fill="#ef4444" font-size="8" font-family="sans-serif">Stop 1</text>
  <!-- Stop 2 (moved up) -->
  <line x1="80" y1="132" x2="200" y2="132" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.85"/>
  <text class="lbl" x="205" y="136" fill="#ef4444" font-size="8" font-family="sans-serif">Stop 2 ↑</text>
  <!-- Stop 3 (moved up further) -->
  <line x1="150" y1="100" x2="280" y2="100" stroke="#27B7C8" stroke-width="1.5" stroke-dasharray="5 3"/>
  <text class="lbl" x="265" y="96" fill="#27B7C8" font-size="8" font-family="sans-serif">Stop 3 ↑</text>
  <text class="lbl" x="20" y="172" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Stop moves only toward safety · Never away from it</text>
</svg>`,
    quiz: [
      {
        q: "What is the only acceptable reason to move a stop-loss?",
        options: [
          "To give the trade more room when it's moving against you",
          "To avoid taking a loss on a position approaching its level",
          "To reduce risk as the trade proves itself with new structure",
          "To match the stop of a similar trade taken earlier",
        ],
        correct: 2,
        explanation:
          "A stop-loss is only ever moved to reduce risk — bringing it to a new logical structural level as the trade works in your favor. Moving it away to avoid a loss is abandoning the plan that was set before emotion got involved.",
      },
      {
        q: "What makes a new stop level 'logical' when moving it?",
        options: [
          "Setting it at a round number below the current price",
          "Placing it where new price structure provides a genuine invalidation point",
          "Choosing whatever level reduces the dollar loss by 50%",
          "Setting it exactly one ATR below the current close",
        ],
        correct: 1,
        explanation:
          "A logical stop level is anchored to new price structure — a higher low, a support zone, a pattern boundary — not chosen arbitrarily. The stop should still represent 'this is where the idea is wrong.'",
      },
      {
        q: "What is the cardinal sin in stop management?",
        options: [
          "Trailing the stop upward as new highs form",
          "Moving the stop to break-even once the trade earns room",
          "Moving the stop further away from price to avoid being stopped out while losing",
          "Basing the stop level on price structure",
        ],
        correct: 2,
        explanation:
          "Moving a stop further away to dodge a loss is the cardinal sin — it turns a small planned loss into a potentially catastrophic one, and it means emotional-you has overridden the rational plan that was set before the trade.",
      },
      {
        q: "Why might the original invalidation level become irrelevant as a trade works?",
        options: [
          "Because prices always move in a straight line once correct",
          "Because new structure forms as price moves favorably, providing better logical levels closer to price",
          "Because the time elapsed makes the old level less statistically valid",
          "Because stops should always be updated every trading session",
        ],
        correct: 1,
        explanation:
          "As price moves favorably and creates new swing lows, pattern boundaries, or structure, the original stop may be far from current price and represent outdated logic. New structure gives closer, more relevant invalidation points.",
      },
    ],
    girlToGirlTip:
      "A stop only ever moves toward safety. The second you move it the other way, that's panicked-you talking. Don't let her drive.",
    videoSlot: null,
  },

  {
    module: "m7-managing",
    slug: "break-even-stops",
    title: "Break-Even Stops",
    subtitle: "Turn a risk into a free roll — but only once the trade earns the room.",
    difficulty: "Intermediate",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Once a trade has worked enough, traders slide the stop to their entry — so worst case, the trade now costs nothing.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "It turns 'risking money' into 'risking nothing' — a free roll. The relief lets you hold with a clearer head.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Wait until the trade has earned enough cushion that pulling the stop to entry won't get tripped by normal noise (ATR) — too early just stops you out of a good trade.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Has the trade earned the room? Or moving so early normal wiggle knocks me out? Doing this for protection, or anxiety?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Going to break-even too fast and getting shaken out; treating it as mandatory on every trade.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "A break-even stop turns a trade into a free roll — but only once it's earned the room.\n\nEducational only. Not financial advice. These are trade-management frameworks, not instructions — managing risk does not guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .price-l { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Price rising then pulling back slightly -->
  <polyline class="price-l" points="20,130 55,110 90,90 130,65 165,50 195,55 220,60 250,48 285,38"
    fill="none" stroke="#49B06E" stroke-width="2.5"/>
  <!-- Entry level -->
  <line x1="20" y1="130" x2="300" y2="130" stroke="#27B7C8" stroke-width="1.2" stroke-dasharray="5 3" opacity="0.6"/>
  <!-- Original stop (below entry) -->
  <line x1="20" y1="155" x2="120" y2="155" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
  <!-- Break-even stop (at entry) -->
  <line x1="120" y1="130" x2="300" y2="130" stroke="#49B06E" stroke-width="2" stroke-dasharray="5 3" opacity="0.8"/>
  <!-- Entry dot -->
  <circle cx="20" cy="130" r="5" fill="#27B7C8" opacity="0.9"/>
  <text class="lbl" x="22" y="126" fill="#27B7C8" font-size="8" font-family="sans-serif">Entry</text>
  <text class="lbl" x="125" y="151" fill="#ef4444" font-size="8" font-family="sans-serif">Original stop</text>
  <text class="lbl" x="188" y="127" fill="#49B06E" font-size="8" font-family="sans-serif">Break-even stop</text>
  <text class="lbl" x="20" y="172" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Wait for cushion · Too early = shaken out of a good trade</text>
</svg>`,
    quiz: [
      {
        q: "What does moving a stop to break-even accomplish?",
        options: [
          "It guarantees the trade will be profitable",
          "It removes the financial risk from the trade — worst case is now a scratch",
          "It forces the trade to close at a profit",
          "It replaces the need for a trailing stop",
        ],
        correct: 1,
        explanation:
          "Moving the stop to the entry price means the worst possible outcome is exiting at the same price you entered — no gain, no loss. The trade becomes a 'free roll' with no financial downside remaining.",
      },
      {
        q: "Why is moving to break-even too early a problem?",
        options: [
          "It locks in too much profit too quickly",
          "It signals weakness to other market participants",
          "Normal price volatility (noise) can hit the tight stop and exit a trade that was working fine",
          "Break-even stops require more margin",
        ],
        correct: 2,
        explanation:
          "If break-even is triggered before the trade has moved enough to create a cushion against normal noise, routine price fluctuations will stop the trade out before it has a chance to develop — killing winners in their early stages.",
      },
      {
        q: "When is the right time to consider a break-even stop?",
        options: [
          "Immediately after entering any trade",
          "Once the trade has moved far enough that normal volatility (ATR) is unlikely to reach the entry",
          "After exactly 24 hours in the trade",
          "As soon as the trade shows any profit at all",
        ],
        correct: 1,
        explanation:
          "A break-even stop only makes sense once the trade has moved enough that the distance from current price to entry is greater than normal market noise. ATR gives a sense of how much room 'enough' typically is.",
      },
      {
        q: "What emotion most commonly drives moving to break-even too early?",
        options: [
          "Greed for additional profits",
          "Anxiety — wanting to eliminate risk before the trade has earned it",
          "Boredom with the position",
          "Overconfidence in the setup",
        ],
        correct: 1,
        explanation:
          "Anxiety about an open position drives premature break-even moves. The discomfort of having money at risk makes traders want to remove that risk before the trade has genuinely earned a safe cushion.",
      },
    ],
    girlToGirlTip:
      "'Now this can't hurt me' is one of the best feelings in the game. Just don't rush it — too soon strangles your winners in the crib.",
    videoSlot: null,
  },

  {
    module: "m7-managing",
    slug: "trailing-stops",
    title: "Trailing Stops",
    subtitle: "Let winners run while locking in gains — the art is leaving room for the pullbacks.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "A trailing stop follows price as it moves in your favor, locking in more gain while still giving room to run.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "The tool for the hardest wish: letting a winner run without giving it all back. It rides up behind price until price turns and takes you out.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Trail behind structure (under each higher low) or by a volatility measure (ATR), so it survives normal pullbacks but tightens as the move extends. Too tight, out early; too loose, give back too much.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Enough room for normal pullbacks? Trailing by structure/volatility or arbitrarily? Trying to capture the whole move (impossible) or a good portion?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Trailing so tight normal noise ends a great trade; so loose it defeats the purpose.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Lets winners run while locking in gains — the art is leaving room to survive the pullbacks.\n\nEducational only. Not financial advice. These are trade-management frameworks, not instructions — managing risk does not guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .price-l { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawLine 2.2s ease forwards; }
    .trail { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawLine 2.2s ease 0.3s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.6s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Rising price with pullbacks -->
  <polyline class="price-l" points="20,150 55,125 80,135 110,105 130,115 160,85 180,95 210,65 230,75 260,45 285,55"
    fill="none" stroke="#49B06E" stroke-width="2.5"/>
  <!-- Trailing stop following behind -->
  <polyline class="trail" points="20,165 55,145 95,145 120,120 145,120 170,100 195,100 220,78 248,78 275,60"
    fill="none" stroke="#27B7C8" stroke-width="1.8" stroke-dasharray="5 3"/>
  <text class="lbl" x="240" y="56" fill="#49B06E" font-size="8" font-family="sans-serif">Price</text>
  <text class="lbl" x="240" y="76" fill="#27B7C8" font-size="8" font-family="sans-serif">Trailing stop ↑</text>
  <text class="lbl" x="20" y="172" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Follows price up · Stays behind for pullback room</text>
</svg>`,
    quiz: [
      {
        q: "What does a trailing stop do as price moves in the trader's favor?",
        options: [
          "It stays fixed at the original entry price",
          "It moves in the direction of the trade, locking in progressively more gain",
          "It widens to give the trade more room",
          "It triggers a partial exit automatically",
        ],
        correct: 1,
        explanation:
          "A trailing stop follows price as it moves favorably — ratcheting up in an uptrend. Because it only moves in one direction, it locks in more and more of the gain while still allowing the trade to run.",
      },
      {
        q: "What are the two main approaches to calibrating a trailing stop?",
        options: [
          "By time (hours held) and by position size",
          "By structure (under each new higher low) or by volatility measure (ATR)",
          "By percentage of original risk or by the broker's recommended setting",
          "By the stock's 52-week high and its current price",
        ],
        correct: 1,
        explanation:
          "The two main calibration methods are structure-based (trailing behind each new swing low that forms as price rises) and volatility-based (using a multiple of ATR to give room proportional to the instrument's normal movement).",
      },
      {
        q: "What is the risk of setting a trailing stop too tight?",
        options: [
          "The position grows too large before it's triggered",
          "Normal price pullbacks within a healthy trend trigger the stop, ending a good trade prematurely",
          "The trailing stop becomes invisible on the chart",
          "It prevents partial profits from being taken",
        ],
        correct: 1,
        explanation:
          "Every trend has normal pullbacks. A trailing stop set too close to current price gets hit by routine noise — the natural breathing of a healthy trend — and closes a winning trade before the move is genuinely over.",
      },
      {
        q: "Why is it impossible to capture the 'whole move' with a trailing stop?",
        options: [
          "Trailing stops are banned on most exchanges",
          "The trailing stop must be far enough below price to survive pullbacks, so it always triggers below the peak",
          "Trailing stops expire after 24 hours",
          "Trailing stops only work on daily charts",
        ],
        correct: 1,
        explanation:
          "By design, a trailing stop must sit below current price to survive normal pullbacks. When the trend eventually reverses, the stop is triggered below the peak — capturing a portion, not the whole move. That's the expected outcome, not a failure.",
      },
    ],
    girlToGirlTip:
      "You'll never catch the exact top, and chasing it makes you crazy. A trailing stop is how you make peace with 'a great chunk.'",
    videoSlot: null,
  },

  {
    module: "m7-managing",
    slug: "taking-partial-profits",
    title: "Taking Partial Profits",
    subtitle: "Bank some, keep some — plan the exit points before the trade is open.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Not all-in or all-out. Bank a portion of the gain while leaving the rest to keep working.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "Resolves 'lock it in!' vs 'let it run!' by doing both — secure real progress while keeping skin in the game.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Plan partial-profit points in advance — at logical levels or objectives — so the decision is calm and pre-made, not a panicked reaction to a green number.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Did I plan partials before the heat? Banking to manage risk, or quiet nerves? Plan for the rest?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Dumping the whole position at first profit out of fear; or never taking any and round-tripping to zero.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Partial profits lock in progress and keep you in the move — plan the points in advance, not in the panic.\n\nEducational only. Not financial advice. These are trade-management frameworks, not instructions — managing risk does not guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .price-l { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .bar { transform-origin: bottom; animation: growBar 0.4s ease forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.3s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Rising price -->
  <polyline class="price-l" points="20,150 60,120 100,95 140,70 185,50 230,35 275,25" fill="none" stroke="#49B06E" stroke-width="2.5"/>
  <!-- Partial exit 1 -->
  <line x1="100" y1="80" x2="100" y2="165" stroke="#27B7C8" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"/>
  <rect class="bar" x="93" y="148" width="14" height="17" fill="#27B7C8" opacity="0.7" rx="2" style="animation-delay:0.5s"/>
  <!-- Partial exit 2 -->
  <line x1="185" y1="40" x2="185" y2="165" stroke="#27B7C8" stroke-width="1" stroke-dasharray="3 3" opacity="0.5"/>
  <rect class="bar" x="178" y="140" width="14" height="25" fill="#27B7C8" opacity="0.85" rx="2" style="animation-delay:0.9s"/>
  <!-- Runner continues -->
  <text class="lbl" x="90" y="172" fill="#27B7C8" font-size="8" font-family="sans-serif">Partial 1</text>
  <text class="lbl" x="174" y="172" fill="#27B7C8" font-size="8" font-family="sans-serif">Partial 2</text>
  <text class="lbl" x="240" y="28" fill="#49B06E" font-size="8" font-family="sans-serif">Runner</text>
</svg>`,
    quiz: [
      {
        q: "What problem does taking partial profits solve?",
        options: [
          "It eliminates the need for a trailing stop",
          "It resolves the tension between locking in gains and letting winners run — by doing both",
          "It guarantees the trade ends in profit",
          "It removes emotional attachment to the position",
        ],
        correct: 1,
        explanation:
          "Taking partial profits is a practical compromise: a portion is secured (satisfying 'lock it in') while the remainder stays open (satisfying 'let it run'). Neither outcome is sacrificed entirely.",
      },
      {
        q: "When should partial profit levels be decided?",
        options: [
          "As soon as the trade shows any profit",
          "Whenever the heart rate rises during the trade",
          "In advance — before the trade is open, when thinking is calm",
          "After the first partial is taken",
        ],
        correct: 2,
        explanation:
          "Partial profit points should be planned before the trade is entered — when the decision is analytical rather than emotional. Making these decisions in real-time with money on the line leads to reactive, fear-driven exits.",
      },
      {
        q: "What is 'round-tripping' in the context of partial profits?",
        options: [
          "Entering and exiting a trade on the same day",
          "Taking all profit at the very first level, well before the thesis plays out",
          "Holding a winning trade until it reverses back to the entry — giving all gains back",
          "Taking profits on a round number price",
        ],
        correct: 2,
        explanation:
          "Round-tripping means watching a significant unrealized profit shrink all the way back to zero (or a loss) because no partial profits were taken. It's one of the most demoralizing — and avoidable — outcomes.",
      },
      {
        q: "What is the most common mistake in managing a winning trade?",
        options: [
          "Planning partial exits before entering",
          "Dumping the entire position at the very first sign of profit out of fear",
          "Using trailing stops alongside partial exits",
          "Adjusting partials as the trade develops",
        ],
        correct: 1,
        explanation:
          "Fear-driven full exits at the first profitable tick cut potential winners short before the thesis has had time to work. This pattern — done repeatedly — means the win rate may be fine but the average winner is too small to cover the average loser.",
      },
    ],
    girlToGirlTip:
      "There's real peace in paying yourself along the way. Banking a little takes the desperation out of the rest of the trade.",
    videoSlot: null,
  },

  {
    module: "m7-managing",
    slug: "holding-winners",
    title: "Holding Winners",
    subtitle: "Exit on a reason, not the discomfort of being in profit.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "The harder flip side of cutting losers — resisting the urge to grab a small profit and run, so good trades are big enough to matter.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "The math only works if winners outweigh losers. Cut every winner short and even a high win-rate bleeds out.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "As long as the thesis is intact — structure holding, trend unbroken — let it work rather than bailing because a profit feels uncomfortable. Exit on a reason, not a feeling.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Thesis still intact, or has the chart changed? Selling because the setup broke, or because profit is scary? Winners big enough to outweigh losses?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Snatching tiny profits out of fear; exiting a healthy trade for no structural reason.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Let winners run while the thesis holds — exit on a reason, not the discomfort of being in profit.\n\nEducational only. Not financial advice. These are trade-management frameworks, not instructions — managing risk does not guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .good { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawLine 2.5s ease forwards; }
    .bad { stroke-dasharray: 300; stroke-dashoffset: 300; animation: drawLine 1s ease 2.5s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.8s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Full trend move (let it run) -->
  <polyline class="good" points="20,155 55,135 90,115 125,95 160,75 200,55 240,38 280,22"
    fill="none" stroke="#49B06E" stroke-width="2.5"/>
  <!-- Impatient early exit mark -->
  <circle cx="90" cy="115" r="6" fill="#ef4444" opacity="0.8"/>
  <line x1="90" y1="109" x2="90" y2="60" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.6"/>
  <text class="lbl" x="95" y="80" fill="#ef4444" font-size="8" font-family="sans-serif">Exit too early</text>
  <text class="lbl" x="95" y="90" fill="#ef4444" font-size="8" font-family="sans-serif">(thesis still intact)</text>
  <!-- Exit on reason mark -->
  <circle cx="280" cy="22" r="6" fill="#27B7C8" opacity="0.8"/>
  <text class="lbl" x="225" y="18" fill="#27B7C8" font-size="8" font-family="sans-serif">Exit on reason</text>
  <text class="lbl" x="20" y="172" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Thesis intact = hold · Thesis broken = exit on a reason</text>
</svg>`,
    quiz: [
      {
        q: "What is 'loss aversion' and how does it affect winning trades?",
        options: [
          "The fear of taking any loss, causing traders to hold losers too long",
          "The psychological tendency to prefer securing a small gain over risking it for a larger one",
          "The reluctance to enter new trades after a string of losses",
          "The preference for high-win-rate strategies over high risk-to-reward",
        ],
        correct: 1,
        explanation:
          "Loss aversion makes a small confirmed gain feel safer than the possibility of losing it — even when the thesis is intact. This drives premature exits that cut the size of winners and undermine the risk-to-reward math.",
      },
      {
        q: "What is the correct reason to exit a winning trade?",
        options: [
          "The profit feels large and uncomfortable to hold",
          "Another trader mentioned they exited the same position",
          "The thesis is broken — the chart reason for the trade no longer holds",
          "The trade has been open for more than 24 hours",
        ],
        correct: 2,
        explanation:
          "Exiting a winner should be driven by a structural reason — the setup is invalidated, a key level is broken, the pattern has played out. Exiting because a profit feels large is emotion, not analysis.",
      },
      {
        q: "Why does cutting every winner short eventually lead to losing money, even with a high win rate?",
        options: [
          "High win rates always indicate overtrading",
          "Small winners can't offset the inevitable large losses that occur even with a high win rate",
          "The broker charges higher fees for more frequent small exits",
          "Markets punish traders with high win rates through adverse price movement",
        ],
        correct: 1,
        explanation:
          "If losses are allowed to reach full size (the planned invalidation) but winners are cut tiny, even a 70% win rate bleeds out over time. The math requires winners to be meaningfully larger than losers to produce a positive expectancy.",
      },
      {
        q: "What should a trader ask when tempted to exit a winner early?",
        options: [
          "Is this a good profit in dollar terms?",
          "Is my thesis still intact, or has the chart actually changed?",
          "Has the stock been trending for more than 3 days?",
          "Am I ahead of my weekly profit target?",
        ],
        correct: 1,
        explanation:
          "The right question is whether the chart reason for the trade is still valid — not whether the profit feels good. If the thesis is intact, the impulse to exit is emotional, not analytical.",
      },
    ],
    girlToGirlTip:
      "Loss aversion makes a small win feel safer than a big one. But trading only works if winners are allowed to be winners. Let the good ones breathe.",
    videoSlot: null,
  },

  {
    module: "m7-managing",
    slug: "cutting-losers",
    title: "Cutting Losers",
    subtitle: "The most important discipline — take the small planned loss before it becomes a big one.",
    difficulty: "Intermediate",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "The most important discipline: when a trade hits its invalidation, take the loss — small, planned, clean — instead of hoping it comes back.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "Every blown-up account has the same story: a small loss someone refused to take that became a disaster. Cutting quickly keeps every loss survivable.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "The stop already defined where the idea is wrong — so when price gets there, the thinking is done. Honoring it is executing the calm decision you made earlier, not a fresh one made in pain.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Has invalidation actually been hit? Honoring my plan, or hoping and bargaining? Still small because I'm acting, or growing because I'm freezing?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Moving the stop to avoid the loss; 'it'll come back' hoping; turning a small planned loss into a giant one.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Cut losers small and clean at the invalidation — the calm decision was already made; honoring it is the whole job.\n\nEducational only. Not financial advice. These are trade-management frameworks, not instructions — managing risk does not guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .good-cut { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawLine 1s ease forwards; }
    .bad-cut { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawLine 1.8s ease 0.5s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.5s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Entry level -->
  <line x1="20" y1="80" x2="300" y2="80" stroke="#27B7C8" stroke-width="1" stroke-dasharray="4 3" opacity="0.4"/>
  <text x="22" y="76" fill="#27B7C8" font-size="8" font-family="sans-serif" opacity="0.5">Entry</text>
  <!-- Invalidation line -->
  <line x1="20" y1="110" x2="300" y2="110" stroke="#ef4444" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="22" y="107" fill="#ef4444" font-size="8" font-family="sans-serif" opacity="0.7">Invalidation</text>
  <!-- Good cut: price hits stop, exit -->
  <polyline class="good-cut" points="20,75 50,82 80,90 105,108 115,113" fill="none" stroke="#49B06E" stroke-width="2"/>
  <circle cx="115" cy="113" r="5" fill="#49B06E" opacity="0.9"/>
  <text class="lbl" x="120" y="110" fill="#49B06E" font-size="8" font-family="sans-serif">Clean cut</text>
  <!-- Bad cut: ignores stop, loss grows -->
  <polyline class="bad-cut" points="20,75 50,82 80,90 105,108 130,120 160,135 200,150 240,162"
    fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 3"/>
  <text class="lbl" x="205" y="158" fill="#ef4444" font-size="8" font-family="sans-serif">Ignored → disaster</text>
  <text class="lbl" x="20" y="173" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Small loss = planned · Growing loss = refused</text>
</svg>`,
    quiz: [
      {
        q: "Why is cutting a loser quickly described as 'honoring a calm decision'?",
        options: [
          "Because calm traders make more money than emotional ones",
          "Because the invalidation level was set before the trade, when thinking was rational — executing it is following that plan",
          "Because quick exits always result in smaller losses",
          "Because the stop-loss decision is made by algorithms, not humans",
        ],
        correct: 1,
        explanation:
          "The invalidation level was set before the trade was entered — when thinking was calm and analytical. When price reaches it, the analysis has already been done. Taking the loss is simply executing a pre-made rational decision, not making a new emotional one.",
      },
      {
        q: "What is the most dangerous pattern that turns small losses into large ones?",
        options: [
          "Taking the loss immediately when the invalidation is hit",
          "Using position sizing to control risk",
          "Moving the stop further away or removing it to 'give it room' while losing",
          "Setting the stop before entering the trade",
        ],
        correct: 2,
        explanation:
          "Moving a stop further away — or removing it entirely — while a trade is already losing is how small manageable losses become account-damaging ones. Every major trading blowup follows this pattern.",
      },
      {
        q: "What story does every blown-up trading account share?",
        options: [
          "Too many trades taken in a single session",
          "A small loss that someone refused to take, which then grew into a disaster",
          "A winning strategy that suddenly stopped working",
          "Positions that were too small to matter",
        ],
        correct: 1,
        explanation:
          "Nearly every account blowup traces back to a small loss that was refused — the trader hoped, bargained, widened the stop, and held — until a manageable loss became an unrecoverable one. Cutting losses small and fast is the antidote.",
      },
      {
        q: "What is the correct response when a trade reaches its pre-defined invalidation level?",
        options: [
          "Assess whether the broader market might reverse and save the trade",
          "Wait one more session to see if it recovers",
          "Exit — the analysis was already done when the level was set",
          "Add to the position to lower the average cost",
        ],
        correct: 2,
        explanation:
          "When price reaches the invalidation level, the decision is already made — exit. Reassessing in the moment introduces emotion and hope into a decision that should be mechanical. The analysis happened before the trade.",
      },
    ],
    girlToGirlTip:
      "A small loss is just the cost of doing business — totally normal. It only becomes dangerous when you refuse to take it. Take the small one, every time.",
    videoSlot: null,
  },

  {
    module: "m7-managing",
    slug: "protecting-profits",
    title: "Protecting Profits",
    subtitle: "As gains grow, protecting them matters more than chasing more.",
    difficulty: "Advanced",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Once a trade hands you real gains, the priority shifts from 'make more' to 'don't give this back.'",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "Round-tripping — watching a solid gain melt back to nothing — is one of the most demoralizing and most avoidable experiences in trading.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Combine the tools — trailing the stop, taking partials, moving to break-even — so a winning trade can't fully reverse. As profit grows, protection tightens.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "What have I locked in vs what's still at risk? Protecting this gain, or greedy for the last dollar? Which tool fits — trail, partial, break-even?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Getting greedy for the absolute top and giving it all back; doing nothing to protect a big unrealized profit.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "As gains grow, protecting them matters more than chasing more — never let a real winner round-trip to zero.\n\nEducational only. Not financial advice. These are trade-management frameworks, not instructions — managing risk does not guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .price-l { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawLine 2.5s ease forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.8s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Entry -->
  <line x1="20" y1="130" x2="300" y2="130" stroke="#27B7C8" stroke-width="1" stroke-dasharray="4 3" opacity="0.3"/>
  <!-- Price rises, then reverses fully (round-trip scenario) -->
  <polyline class="price-l" points="20,130 50,110 90,85 130,60 165,40 200,50 230,75 260,110 290,130"
    fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 3" opacity="0.6"/>
  <!-- Protected scenario: partial taken, trailing stop triggered -->
  <polyline class="price-l" points="20,130 50,110 90,85 130,60 165,40" fill="none" stroke="#49B06E" stroke-width="2.5" style="animation-delay:0.5s"/>
  <!-- Trailing stop triggers on reversal -->
  <circle cx="200" cy="58" r="5" fill="#27B7C8" opacity="0.9"/>
  <text class="lbl" x="205" y="55" fill="#27B7C8" font-size="8" font-family="sans-serif">Trail exits here</text>
  <text class="lbl" x="260" y="126" fill="#ef4444" font-size="8" font-family="sans-serif">Round-trip</text>
  <text class="lbl" x="22" y="127" fill="#27B7C8" font-size="8" font-family="sans-serif">Entry</text>
  <text class="lbl" x="20" y="170" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Protect gains as they grow · Greed for the top loses it all</text>
</svg>`,
    quiz: [
      {
        q: "At what point should a trader's priority shift from 'make more' to 'protect this'?",
        options: [
          "Only when the trade is at a 100% gain",
          "As meaningful gains accumulate — there's no fixed number, but real unrealized profit should trigger protection thinking",
          "After exactly three trading sessions",
          "Only when the broader market starts declining",
        ],
        correct: 1,
        explanation:
          "There's no magic percentage — but as unrealized gains become meaningful, the calculus changes. The question shifts from 'can this go higher?' to 'how do I make sure I keep a real portion of this?'",
      },
      {
        q: "What is 'round-tripping' a winning trade?",
        options: [
          "Entering and exiting on the same day",
          "Taking profits and then re-entering the same trade",
          "Watching a large unrealized gain reverse entirely back to the entry price or worse",
          "Closing a trade and immediately opening a new one",
        ],
        correct: 2,
        explanation:
          "Round-tripping means holding a trade through a significant gain and then through a full reversal — ending at or below entry after having been well ahead. It's demoralizing and avoidable with basic profit-protection tools.",
      },
      {
        q: "Which combination of tools does profit protection typically employ?",
        options: [
          "Adding to the position and widening the stop",
          "Trailing stops, partial profits, and break-even stops working together",
          "Moving entirely to cash once any profit appears",
          "Setting a fixed percentage target and exiting in full",
        ],
        correct: 1,
        explanation:
          "Protecting profits typically involves combining tools: a trailing stop catches the bulk of any reversal, partial exits lock in pieces of the gain, and a break-even stop ensures the trade can't become a loss. Together they prevent round-trips.",
      },
      {
        q: "What drives the mistake of holding too long and giving back all gains?",
        options: [
          "Insufficient knowledge of trailing stop mechanics",
          "Greed for the absolute top — the refusal to exit while there might be more left",
          "Lack of access to profit-taking tools",
          "Excessive use of partial profits early in the trade",
        ],
        correct: 1,
        explanation:
          "The desire to capture every last cent of a move — refusing to exit while price might still go higher — is what keeps traders in past the point of good risk management. Greed for the top is how real profits become round-trips.",
      },
    ],
    girlToGirlTip:
      "Greed for the very last dollar is how people turn winners into losers. A banked gain beats a bigger one you never actually kept.",
    videoSlot: null,
  },

  {
    module: "m7-managing",
    slug: "managing-emotions-open-trade",
    title: "Managing Emotions in an Open Trade",
    subtitle: "Trade management is emotional management — the plan is calm-you's gift to in-the-trade-you.",
    difficulty: "Beginner",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "The hardest part of managing a trade isn't the chart — it's you, in real time, with money on the line. Every management decision is an emotional one in disguise.",
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content:
          "Fear cuts winners and freezes on losers; greed ignores the plan and chases the top. Staying calm with an open position is an edge no indicator provides.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Lean on pre-made plans so you're not deciding in the heat of the moment — the plan is calm-you's gift to in-the-trade-you. When emotion spikes, follow the plan, don't override it.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Coming from my plan, or a feeling right now? Heart racing? (If yes, pause.) Would calm-me, who set this up, agree?",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Overriding a solid plan because a feeling got loud; letting every tick dictate impulsive moves.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Trade management is emotional management — pre-made plans exist so feelings don't get the final vote.\n\nEducational only. Not financial advice. These are trade-management frameworks, not instructions — managing risk does not guarantee profits.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes fadeCheck { from { opacity:0; transform: scale(0.6); } to { opacity:1; transform: scale(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .check { animation: fadeCheck 0.3s ease forwards; opacity: 0; }
    .lbl { animation: fadeIn 0.5s ease 1.8s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Two columns: feeling vs plan -->
  <text x="35" y="22" fill="#ef4444" font-size="10" font-family="sans-serif" opacity="0.8">Feeling says…</text>
  <text x="185" y="22" fill="#49B06E" font-size="10" font-family="sans-serif" opacity="0.8">Plan says…</text>
  <line x1="155" y1="10" x2="155" y2="170" stroke="#F4F7FA" stroke-width="0.5" opacity="0.15"/>
  <!-- Feeling column -->
  <text class="check" x="18" y="48" fill="#ef4444" font-size="10" font-family="sans-serif" style="animation-delay:0.2s">✗</text>
  <text class="check" x="30" y="48" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.7" style="animation-delay:0.2s">Exit — profit feels scary</text>
  <text class="check" x="18" y="72" fill="#ef4444" font-size="10" font-family="sans-serif" style="animation-delay:0.4s">✗</text>
  <text class="check" x="30" y="72" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.7" style="animation-delay:0.4s">Hold — loss feels wrong</text>
  <text class="check" x="18" y="96" fill="#ef4444" font-size="10" font-family="sans-serif" style="animation-delay:0.6s">✗</text>
  <text class="check" x="30" y="96" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.7" style="animation-delay:0.6s">Add — "double down"</text>
  <!-- Plan column -->
  <text class="check" x="163" y="48" fill="#49B06E" font-size="10" font-family="sans-serif" style="animation-delay:0.3s">✓</text>
  <text class="check" x="175" y="48" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.7" style="animation-delay:0.3s">Let it run (thesis intact)</text>
  <text class="check" x="163" y="72" fill="#49B06E" font-size="10" font-family="sans-serif" style="animation-delay:0.5s">✓</text>
  <text class="check" x="175" y="72" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.7" style="animation-delay:0.5s">Cut it (invalidation hit)</text>
  <text class="check" x="163" y="96" fill="#49B06E" font-size="10" font-family="sans-serif" style="animation-delay:0.7s">✓</text>
  <text class="check" x="175" y="96" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.7" style="animation-delay:0.7s">Follow the plan</text>
  <text class="lbl" x="55" y="140" fill="#27B7C8" font-size="10" font-family="sans-serif">When they conflict — trust the plan.</text>
</svg>`,
    quiz: [
      {
        q: "Why is every trade management decision described as 'an emotional one in disguise'?",
        options: [
          "Because computers make most trading decisions now",
          "Because with money on the line in real time, feelings of fear and greed actively shape every choice",
          "Because management decisions don't require analysis",
          "Because all traders are naturally emotional",
        ],
        correct: 1,
        explanation:
          "When a trade is open and money is at risk, the emotional brain is activated. Fear, greed, hope, and anxiety all compete with the analytical plan. Recognizing that every in-trade decision has an emotional component is the first step to managing it.",
      },
      {
        q: "What is 'calm-you's gift to in-the-trade-you'?",
        options: [
          "A larger initial position size",
          "A pre-made plan created before the trade, when thinking is analytical rather than reactive",
          "A profit target set after the trade is already working",
          "Watching price action without any plan at all",
        ],
        correct: 1,
        explanation:
          "The pre-trade plan — entry rationale, invalidation level, partial exits, trailing stop approach — is made by an analytical mind not under pressure. That plan is the gift to the emotional, in-trade self who will be tempted to deviate.",
      },
      {
        q: "What does fear specifically tend to do to winning trades?",
        options: [
          "Make traders hold winners too long",
          "Cause traders to add to winning positions",
          "Cut winners short — exiting before the thesis has played out",
          "Trigger trailing stops prematurely",
        ],
        correct: 2,
        explanation:
          "Fear of giving back a gain drives early exits on winners — the opposite of what good risk-to-reward math requires. Fear says 'take it now before it disappears' while the plan says 'hold while the thesis is intact.'",
      },
      {
        q: "What should a trader do when emotion spikes during an open trade?",
        options: [
          "Make an immediate decision to resolve the discomfort",
          "Increase position size to show confidence",
          "Pause, consult the pre-made plan, and follow it rather than the emotion",
          "Close the trade and re-evaluate from scratch",
        ],
        correct: 2,
        explanation:
          "When emotional intensity rises — heart racing, urge to act immediately — the right move is to pause and return to the pre-made plan. The plan was made by calm, analytical thinking. The spike of emotion is not new information.",
      },
    ],
    girlToGirlTip:
      "The plan you make before the trade is calm and smart. The you inside the trade is not. When they disagree, trust the calm one — that's the whole game.",
    videoSlot: null,
  },
];

export function getM7LessonBySlug(slug: string): UniversityLesson | undefined {
  return M7_LESSONS.find((l) => l.slug === slug);
}
