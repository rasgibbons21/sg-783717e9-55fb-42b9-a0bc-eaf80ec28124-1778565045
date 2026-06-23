import type { UniversityLesson } from "@/data/university/m1-chart-reading";

export const M5_LESSONS: UniversityLesson[] = [
  {
    module: "m5-strategies",
    slug: "trend-following",
    title: "Trend Following",
    subtitle: "Align with a move already in motion instead of predicting one.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Instead of guessing tops and bottoms, identify a trend already in motion and align with it. Ride the wave rather than fight it.",
      },
      {
        type: "why-matters",
        heading: "Conditions It Suits",
        content:
          "Clearly trending markets. Terrible in choppy sideways markets — that's the key.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Confirm the trend with structure and maybe a moving average or ADX, then participate in the direction of that trend, treating a break of structure as the sign it may be over.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Is there actually a trend or am I imagining one? Which direction? Where would the trend be proven over? Trending or chopping right now?",
      },
      {
        type: "psychology",
        heading: "Risk Reasoning",
        content:
          "The hard part is sitting through pullbacks without bailing — and accepting many small losses in chop in exchange for catching the occasional big move.",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Forcing trend trades sideways; bailing on the first pullback; calling the top out of ego.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Aligns with an established move instead of predicting one — powerful in trends, painful in chop.\n\nEducational only. Not financial advice. No strategy guarantees profits — every one has losing stretches, and risk management matters more than any approach.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawTrend { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .trend-line { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawTrend 2s ease forwards; }
    .label { animation: fadeIn 0.5s ease 2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Trend line rising -->
  <polyline class="trend-line" points="20,150 70,120 110,130 150,100 190,80 230,60 280,30" fill="none" stroke="#27B7C8" stroke-width="2.5"/>
  <!-- Pullbacks -->
  <polyline points="70,120 90,135 110,130" fill="none" stroke="#F4F7FA" stroke-width="1.2" opacity="0.5"/>
  <polyline points="150,100 170,112 190,80" fill="none" stroke="#F4F7FA" stroke-width="1.2" opacity="0.5"/>
  <!-- MA line -->
  <polyline points="20,155 80,130 140,108 200,85 280,38" fill="none" stroke="#49B06E" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text class="label" x="230" y="45" fill="#27B7C8" font-size="10" font-family="sans-serif">Trend</text>
  <text class="label" x="200" y="100" fill="#49B06E" font-size="9" font-family="sans-serif">MA</text>
  <text class="label" x="80" y="150" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.6">pullbacks</text>
</svg>`,
    quiz: [
      {
        q: "Trend following works best in which market condition?",
        options: [
          "Tight sideways ranges",
          "Clearly directional trending markets",
          "High-volatility choppy conditions",
          "Markets near all-time highs only",
        ],
        correct: 1,
        explanation:
          "Trend following is designed for markets moving clearly in one direction. It struggles badly in choppy sideways conditions where whipsaws eat small losses repeatedly.",
      },
      {
        q: "What does a break of trend structure typically signal to a trend follower?",
        options: [
          "A buying opportunity within the trend",
          "The trend is strengthening",
          "The trend may be over — the idea is potentially invalidated",
          "Volume needs to be rechecked",
        ],
        correct: 2,
        explanation:
          "A break of structure (lower high and lower low in an uptrend, for example) is the sign a trend follower uses to reason that the move they were following may be ending.",
      },
      {
        q: "Which is the most common mistake in trend following?",
        options: [
          "Using a moving average to confirm",
          "Forcing trend trades in choppy sideways markets",
          "Waiting for a confirmed trend direction",
          "Accepting small losses in chop",
        ],
        correct: 1,
        explanation:
          "Forcing trend trades when the market is actually chopping sideways is the classic error — the strategy is designed for trends, not for sideways price action.",
      },
      {
        q: "Why do trend followers accept many small losses?",
        options: [
          "To guarantee profits on every trade",
          "Because losses prove the trend exists",
          "The trade-off for catching the occasional large trend move",
          "Small losses trigger better entries",
        ],
        correct: 2,
        explanation:
          "Trend following accepts a higher number of small losses (especially in choppy markets) in exchange for the potential to capture a large move when a genuine trend develops.",
      },
    ],
    girlToGirlTip:
      "You don't have to call the bottom to do well. Catching the fat middle of a trend is plenty — and a lot less stressful than playing hero.",
    videoSlot: null,
  },

  {
    module: "m5-strategies",
    slug: "breakout-trading",
    title: "Breakout Trading",
    subtitle: "Catch the start of a fresh move as price escapes a level or range.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Participate when price breaks out of a level or range it's been respecting — catching the start of a fresh move.",
      },
      {
        type: "why-matters",
        heading: "Conditions It Suits",
        content:
          "Tight consolidations, ranges, coiling patterns. Energy building before release.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Identify the level, then wait for a confirmed break — volume showing up, price holding beyond — rather than the first candle out. The false breakout is the whole risk.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "What's the level? Is volume confirming or quiet? Did price hold or snap back? Where's the invalidation if it's a fakeout?",
      },
      {
        type: "psychology",
        heading: "Risk Reasoning",
        content:
          "High fakeout rate, so reasoning centers on confirmation and knowing in advance where a failed break says 'I was wrong.'",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Chasing the first candle on FOMO; ignoring volume; no plan for the fakeout.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Catches new moves out of coiled energy — confirmation is everything, fakeouts are the enemy.\n\nEducational only. Not financial advice. No strategy guarantees profits — every one has losing stretches, and risk management matters more than any approach.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawBreak { from { stroke-dashoffset: 300; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .break-line { stroke-dasharray: 300; stroke-dashoffset: 300; animation: drawBreak 2s ease 0.5s forwards; }
    .label { animation: fadeIn 0.5s ease 2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Resistance level -->
  <line x1="20" y1="80" x2="200" y2="80" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5 3"/>
  <!-- Consolidation range -->
  <rect x="30" y="85" width="140" height="35" fill="#27B7C8" opacity="0.07" rx="3"/>
  <polyline points="30,115 60,100 90,108 120,95 150,102 175,88 200,80" fill="none" stroke="#F4F7FA" stroke-width="1.5" opacity="0.6"/>
  <!-- Breakout -->
  <polyline class="break-line" points="200,80 230,55 260,35 300,15" fill="none" stroke="#49B06E" stroke-width="2.5"/>
  <!-- Volume bar -->
  <rect x="200" y="140" width="12" height="28" fill="#49B06E" opacity="0.8"/>
  <text class="label" x="22" y="75" fill="#ef4444" font-size="10" font-family="sans-serif">Resistance</text>
  <text class="label" x="215" y="45" fill="#49B06E" font-size="10" font-family="sans-serif">Breakout</text>
  <text class="label" x="196" y="170" fill="#49B06E" font-size="9" font-family="sans-serif">Vol</text>
</svg>`,
    quiz: [
      {
        q: "What is the primary risk in breakout trading?",
        options: [
          "Missing the move entirely",
          "False breakouts (fakeouts) that snap back",
          "Too much volume confirming the break",
          "Choosing too tight a consolidation",
        ],
        correct: 1,
        explanation:
          "False breakouts — where price briefly pierces a level then snaps back — are the central risk in breakout trading. This is why confirmation matters so much.",
      },
      {
        q: "What do traders look for to confirm a genuine breakout vs a fakeout?",
        options: [
          "Price breaking the level on low volume quietly",
          "The first candle closing beyond the level",
          "Volume showing up and price holding beyond the level",
          "A breakout after a long uptrend",
        ],
        correct: 2,
        explanation:
          "A genuine breakout tends to have volume supporting the move and price sustaining beyond the level. A fakeout often occurs on thin volume with price quickly reversing back.",
      },
      {
        q: "Which market condition is best suited to breakout trading?",
        options: [
          "Strong established trends with no pauses",
          "Tight consolidations with coiling price action",
          "Falling markets with heavy selling",
          "Markets that have been trending for months",
        ],
        correct: 1,
        explanation:
          "Breakout trading looks for tight ranges or consolidations where energy is building — the tighter and longer the coil, the more potential energy behind the eventual move.",
      },
      {
        q: "What is the most common mistake breakout traders make?",
        options: [
          "Waiting for volume confirmation",
          "Chasing the first candle out of the range on FOMO",
          "Having a plan for a fakeout scenario",
          "Identifying the key level in advance",
        ],
        correct: 1,
        explanation:
          "FOMO-chasing the very first candle that breaks a level — before confirmation — is the classic error. That first candle is where fakeouts most often happen.",
      },
    ],
    girlToGirlTip:
      "The market sets fakeouts because it knows you're excited. Letting a breakout prove itself costs a little upside and saves a lot of pain.",
    videoSlot: null,
  },

  {
    module: "m5-strategies",
    slug: "pullback-trading",
    title: "Pullback Trading",
    subtitle: "Join a trend at a calmer spot instead of chasing it at new highs.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Instead of chasing a trend at its highs, wait for a temporary dip within it and join in the trend's direction at a calmer spot.",
      },
      {
        type: "why-matters",
        heading: "Conditions It Suits",
        content: "Healthy established trends that pause and breathe.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Confirm the trend is intact, watch for a shallow low-energy pullback to a logical area (a moving average, prior support, a Fib zone), and a sign the pullback is ending before participating with the trend.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Is the bigger trend intact? Healthy shallow pullback or deep reversal? Pausing at a logical level? Where's it proven wrong?",
      },
      {
        type: "psychology",
        heading: "Risk Reasoning",
        content:
          "The danger is a 'pullback' that's actually a reversal — so depth, energy, and structure tell them apart.",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Buying a falling knife and calling it a pullback; ignoring how deep/violent the dip is; no invalidation.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Joins a trend at a discount — the skill is telling a healthy pause from a real reversal.\n\nEducational only. Not financial advice. No strategy guarantees profits — every one has losing stretches, and risk management matters more than any approach.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawUp { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .up-line { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawUp 2.5s ease forwards; }
    .label { animation: fadeIn 0.5s ease 2.5s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Trend up, pullback, resume -->
  <polyline class="up-line" points="20,155 60,120 100,95 130,110 160,125 185,108 220,80 260,50 295,25" fill="none" stroke="#27B7C8" stroke-width="2.5"/>
  <!-- Support zone at pullback -->
  <rect x="120" y="105" width="75" height="28" fill="#49B06E" opacity="0.08" rx="3"/>
  <line x1="120" y1="125" x2="195" y2="125" stroke="#49B06E" stroke-width="1" stroke-dasharray="4 3"/>
  <text class="label" x="125" y="148" fill="#49B06E" font-size="9" font-family="sans-serif">Support zone</text>
  <text class="label" x="225" y="68" fill="#27B7C8" font-size="10" font-family="sans-serif">Trend resumes</text>
  <text class="label" x="130" y="95" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.6">Pullback</text>
</svg>`,
    quiz: [
      {
        q: "What is the central skill in pullback trading?",
        options: [
          "Identifying when a trend will end",
          "Distinguishing a healthy pause from a real reversal",
          "Timing the exact bottom of every dip",
          "Using only daily charts",
        ],
        correct: 1,
        explanation:
          "The core skill is reading whether a dip is a normal healthy pause within an ongoing trend, or the beginning of a genuine reversal. Depth, energy, and structure are the clues.",
      },
      {
        q: "Which type of pullback is most concerning for this strategy?",
        options: [
          "A shallow, low-energy dip to a moving average",
          "A brief pause at prior support before resuming",
          "A deep, violent drop breaking below key structure",
          "A slow grind lower with declining volume",
        ],
        correct: 2,
        explanation:
          "A deep, violent drop that breaks through key structure suggests a possible reversal rather than a healthy pullback — that depth and energy are warning signs the trend may be over.",
      },
      {
        q: "What logical areas do traders watch for a pullback to find support?",
        options: [
          "Random price levels with no prior history",
          "Moving averages, prior support, or Fibonacci zones",
          "The all-time high only",
          "Wherever the stock closed last Friday",
        ],
        correct: 1,
        explanation:
          "Meaningful areas like moving averages, prior support levels, or Fibonacci zones give a pullback logical places to pause — random areas without prior price context are much less reliable.",
      },
      {
        q: "What is the most common mistake in pullback trading?",
        options: [
          "Confirming the trend is intact before acting",
          "Waiting for a sign the pullback is ending",
          "Buying a falling knife and calling it a pullback",
          "Using a moving average as a reference",
        ],
        correct: 2,
        explanation:
          "Buying into a steep decline and labeling it a 'pullback' without checking trend health or having an invalidation level is the classic error — some dips keep falling.",
      },
    ],
    girlToGirlTip:
      "'Buy the dip' isn't a strategy by itself — some dips keep dipping. The art is knowing which pause is healthy.",
    videoSlot: null,
  },

  {
    module: "m5-strategies",
    slug: "swing-trading",
    title: "Swing Trading",
    subtitle: "Capture one leg of a larger move over days to weeks.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Holding days to a few weeks to capture one leg of a larger move. Slower than day trading, faster than investing.",
      },
      {
        type: "why-matters",
        heading: "Conditions It Suits",
        content:
          "Markets with clear swings and enough movement to be worth the hold. Trends and wide ranges.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Usually a higher-timeframe read (daily charts), combining structure, a pattern or signal, and patience — giving the trade room and time without staring at every tick.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "What's the higher-timeframe trend? My reason for the swing? Can I hold through overnight moves? Where's the invalidation?",
      },
      {
        type: "psychology",
        heading: "Risk Reasoning",
        content:
          "Holding overnight/weekends means accepting gaps and news risk — the trade-off for not watching screens all day.",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Watching a swing like a day trade and panic-managing it; ignoring overnight/gap risk.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Captures one leg of a move over days-to-weeks — patience and higher-timeframe context are the edge.\n\nEducational only. Not financial advice. No strategy guarantees profits — every one has losing stretches, and risk management matters more than any approach.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawSwing { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .swing-line { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawSwing 2.5s ease forwards; }
    .label { animation: fadeIn 0.5s ease 2.5s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Swing wave pattern -->
  <polyline class="swing-line" points="20,140 60,90 100,120 150,60 200,100 250,40 295,70" fill="none" stroke="#27B7C8" stroke-width="2.5"/>
  <!-- Day labels -->
  <text class="label" x="18" y="158" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">Day 1</text>
  <text class="label" x="135" y="158" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">Day 7</text>
  <text class="label" x="272" y="158" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">Day 14</text>
  <!-- Swing leg highlight -->
  <polyline points="100,120 150,60" stroke="#49B06E" stroke-width="3" opacity="0.7"/>
  <text class="label" x="112" y="78" fill="#49B06E" font-size="9" font-family="sans-serif">One leg</text>
</svg>`,
    quiz: [
      {
        q: "What timeframe does swing trading typically use for its primary analysis?",
        options: [
          "1-minute and 5-minute intraday charts",
          "Tick charts",
          "Daily charts for higher-timeframe context",
          "Monthly charts only",
        ],
        correct: 2,
        explanation:
          "Swing trading typically centers on daily charts to read the higher-timeframe trend and structure — giving the trade room to breathe without reacting to every short-term tick.",
      },
      {
        q: "What is the key trade-off in swing trading vs. day trading?",
        options: [
          "Swing trading requires more screen time",
          "Swing trading has zero overnight risk",
          "Swing trading accepts overnight/gap risk in exchange for less screen time",
          "Swing trading only works in bear markets",
        ],
        correct: 2,
        explanation:
          "Swing traders hold positions overnight and over weekends, which means exposure to gaps and news events — but the trade-off is not having to watch every tick during the day.",
      },
      {
        q: "What is the most common mistake swing traders make?",
        options: [
          "Using the daily chart for context",
          "Panic-managing a swing trade like a day trade",
          "Having an invalidation level",
          "Giving the position time to develop",
        ],
        correct: 1,
        explanation:
          "Treating a swing trade like a day trade — reacting to every intraday wiggle — leads to panic-exiting positions that simply needed more time. The strategy requires giving the trade room.",
      },
      {
        q: "Swing trading is best suited to which market condition?",
        options: [
          "Tick-by-tick scalping markets",
          "Markets with no directional movement",
          "Markets with clear swings and enough movement to be worth the hold",
          "Markets where fundamentals dominate every move",
        ],
        correct: 2,
        explanation:
          "Swing trading needs markets with identifiable swings — enough directional movement over days to make a multi-day hold worthwhile. It struggles in slow, range-bound, low-volatility markets.",
      },
    ],
    girlToGirlTip:
      "Swing trading suits real life — but that means trusting your plan when you're not watching. Set it up well, then let it breathe.",
    videoSlot: null,
  },

  {
    module: "m5-strategies",
    slug: "momentum-trading",
    title: "Momentum Trading",
    subtitle: "Ride existing strength — the fastest and most demanding style.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Go where the energy already is — participate in things moving strongly on heavy volume, on the idea that strength can persist short-term.",
      },
      {
        type: "why-matters",
        heading: "Conditions It Suits",
        content:
          "Strong high-volume moves and active markets. Dies in quiet conditions.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Read momentum through strong candles, volume, and relative strength versus the market — and respect that momentum can vanish fast.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Real momentum or am I late? How extended already? Plan if momentum dies suddenly?",
      },
      {
        type: "psychology",
        heading: "Risk Reasoning",
        content:
          "The fastest, most emotional style — punishes hesitation and greed; 'too far too fast' is a constant exhaustion risk.",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Arriving late; refusing to let go when momentum dies; confusing a crowded overextended move for strength.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Rides existing strength — exciting and fast, but evaporates quickly and punishes the late and greedy.\n\nEducational only. Not financial advice. No strategy guarantees profits — every one has losing stretches, and risk management matters more than any approach.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes shootUp { from { stroke-dashoffset: 350; } to { stroke-dashoffset: 0; } }
    @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .rocket { stroke-dasharray: 350; stroke-dashoffset: 350; animation: shootUp 1.5s ease forwards; }
    .vol-bar { transform-origin: bottom; animation: growBar 0.4s ease forwards; }
    .label { animation: fadeIn 0.5s ease 2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Flat base then rocket -->
  <polyline points="20,140 80,138 100,135 115,130" fill="none" stroke="#F4F7FA" stroke-width="1.5" opacity="0.4"/>
  <polyline class="rocket" points="115,130 150,95 185,60 220,30 255,15" fill="none" stroke="#27B7C8" stroke-width="3"/>
  <!-- Volume bars -->
  <rect class="vol-bar" x="115" y="155" width="10" height="15" fill="#27B7C8" opacity="0.5" style="animation-delay:1.5s"/>
  <rect class="vol-bar" x="150" y="148" width="10" height="22" fill="#27B7C8" opacity="0.7" style="animation-delay:1.6s"/>
  <rect class="vol-bar" x="185" y="140" width="10" height="30" fill="#27B7C8" opacity="0.9" style="animation-delay:1.7s"/>
  <rect class="vol-bar" x="220" y="132" width="10" height="38" fill="#49B06E" opacity="0.9" style="animation-delay:1.8s"/>
  <text class="label" x="225" y="27" fill="#27B7C8" font-size="10" font-family="sans-serif">Momentum</text>
  <text class="label" x="22" y="130" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.5">Base</text>
</svg>`,
    quiz: [
      {
        q: "What does relative strength versus the market tell a momentum trader?",
        options: [
          "Whether the company has good fundamentals",
          "Whether a stock is moving more powerfully than the broader market",
          "Whether to use weekly or daily charts",
          "Whether dividends are sustainable",
        ],
        correct: 1,
        explanation:
          "Relative strength compares how a stock moves versus the broader market. A stock rising while the market is flat or falling shows genuine internal momentum — not just the tide lifting all boats.",
      },
      {
        q: "What is momentum trading's biggest weakness?",
        options: [
          "It works too slowly to capture moves",
          "It requires fundamental analysis",
          "Momentum can evaporate quickly and punishes late arrivals harshly",
          "It only works in bear markets",
        ],
        correct: 2,
        explanation:
          "Momentum can reverse fast, especially when a move becomes overextended and crowded. Traders who arrive late or who won't let go when it fades often face sharp reversals.",
      },
      {
        q: "Which market condition kills momentum trading?",
        options: [
          "High-volume breakout sessions",
          "Quiet, low-volatility, subdued markets",
          "Earnings season with heavy news flow",
          "Wide-spread trending markets",
        ],
        correct: 1,
        explanation:
          "Momentum trading requires active, energetic markets with strong moves and volume. In quiet, subdued markets there is no momentum to ride — the style simply doesn't apply.",
      },
      {
        q: "What does 'too far too fast' mean in momentum trading?",
        options: [
          "The strategy is working as planned",
          "Volume is too high to read clearly",
          "A move may be overextended and vulnerable to a sharp reversal",
          "The trend is just getting started",
        ],
        correct: 2,
        explanation:
          "'Too far too fast' means price has moved so quickly in a short time that the move may be exhausted and overextended — making late arrivals especially vulnerable to a quick reversal.",
      },
    ],
    girlToGirlTip:
      "The most adrenaline-heavy style, so the most dangerous for your discipline. If it makes your heart race, slow down, don't speed up.",
    videoSlot: null,
  },

  {
    module: "m5-strategies",
    slug: "position-trading",
    title: "Position Trading",
    subtitle: "Ride a major trend over weeks to months by ignoring daily noise.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "The patient cousin of swing trading — holding weeks to months to ride a major trend, ignoring day-to-day noise.",
      },
      {
        type: "why-matters",
        heading: "Conditions It Suits",
        content:
          "Strong durable trends and bigger-picture moves. Built for patience.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Weekly/monthly charts, the dominant trend, and fundamentals or macro context alongside the chart — holding through normal pullbacks as long as the big trend holds.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "What's the long-term trend and bigger story? Can I ignore daily noise? Where does the major trend break? Real analysis or a feeling?",
      },
      {
        type: "psychology",
        heading: "Risk Reasoning",
        content:
          "Wider swings to stomach and longer commitment — the trade-off is far less screen time and fewer chances to self-sabotage.",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Panic-reacting to daily noise; abandoning the thesis at the first scary headline.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Rides major trends over months — patience and big-picture conviction over daily noise.\n\nEducational only. Not financial advice. No strategy guarantees profits — every one has losing stretches, and risk management matters more than any approach.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLong { from { stroke-dashoffset: 700; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .long-line { stroke-dasharray: 700; stroke-dashoffset: 700; animation: drawLong 3s ease forwards; }
    .label { animation: fadeIn 0.5s ease 3s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Long multi-month trend with shallow pullbacks -->
  <polyline class="long-line" points="10,158 40,140 70,118 85,128 100,112 130,95 145,105 160,88 190,70 210,80 230,62 260,40 290,22" fill="none" stroke="#27B7C8" stroke-width="2.5"/>
  <!-- Month markers -->
  <line x1="70" y1="163" x2="70" y2="168" stroke="#F4F7FA" stroke-width="1" opacity="0.3"/>
  <line x1="160" y1="163" x2="160" y2="168" stroke="#F4F7FA" stroke-width="1" opacity="0.3"/>
  <line x1="250" y1="163" x2="250" y2="168" stroke="#F4F7FA" stroke-width="1" opacity="0.3"/>
  <text class="label" x="55" y="175" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Mo 1</text>
  <text class="label" x="145" y="175" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Mo 3</text>
  <text class="label" x="235" y="175" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Mo 5</text>
  <text class="label" x="255" y="38" fill="#49B06E" font-size="10" font-family="sans-serif">Major trend</text>
</svg>`,
    quiz: [
      {
        q: "What charts do position traders primarily use for analysis?",
        options: [
          "1-minute and 5-minute intraday",
          "Hourly charts",
          "Weekly and monthly charts",
          "Tick charts only",
        ],
        correct: 2,
        explanation:
          "Position traders use weekly and monthly charts to read the dominant long-term trend and bigger-picture context — daily noise is intentionally filtered out.",
      },
      {
        q: "What is the main trade-off of position trading compared to shorter strategies?",
        options: [
          "Fewer opportunities to profit",
          "Wider swings to endure in exchange for far less screen time",
          "No exposure to overnight risk",
          "Smaller position sizes required",
        ],
        correct: 1,
        explanation:
          "Position traders must stomach larger swings and longer holding periods, but the trade-off is minimal screen time and fewer emotional decisions — less chance of self-sabotage.",
      },
      {
        q: "What signals position traders that the major trend may be over?",
        options: [
          "A single bad news day",
          "Any small daily pullback",
          "A break of the major trend's key structure on the weekly/monthly chart",
          "A competitor announcing better earnings",
        ],
        correct: 2,
        explanation:
          "Position traders stay through normal pullbacks and noise, and only reassess when the major structure on the higher timeframe (weekly/monthly) breaks — that's the signal the thesis may be invalidated.",
      },
      {
        q: "What is the most common mistake position traders make?",
        options: [
          "Using weekly charts for context",
          "Panic-reacting to daily noise and abandoning the thesis early",
          "Holding through normal pullbacks within the trend",
          "Including macro context in the analysis",
        ],
        correct: 1,
        explanation:
          "Panic-selling on a scary daily headline or a normal pullback — when the major trend is actually still intact — is the classic position trading mistake. Daily noise is part of the deal.",
      },
    ],
    girlToGirlTip:
      "Fewer decisions often means better results. Position trading wins by not fiddling — sometimes the best move is to leave it alone.",
    videoSlot: null,
  },

  {
    module: "m5-strategies",
    slug: "etf-investing",
    title: "ETF Investing",
    subtitle: "Own the whole field instead of betting on one horse.",
    difficulty: "Beginner",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Instead of betting on one company, own a basket of many through a single ETF — instant diversification, the lazy-genius move, in the Pro context.",
      },
      {
        type: "why-matters",
        heading: "Why It Suits Most People",
        content:
          "Spreads risk automatically — if one stumbles, others cushion it — and sidesteps the impossible game of picking the one perfect stock.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Broad exposure (a whole index, sector, or theme), low fees, long horizons — growth of the group, not the heroics of one name.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "What does this ETF hold? What are its fees? Fits a long-term diversified plan? Diversifying or accidentally concentrating?",
      },
      {
        type: "psychology",
        heading: "Risk Reasoning",
        content:
          "Reduces single-company risk but not market risk — a broad ETF still falls when the whole market falls. Lower risk, not no risk.",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Assuming 'ETF' means 'safe'; owning five ETFs that all hold the same top companies.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Buys the whole field instead of one horse — diversified, low-effort, still exposed to the market itself.\n\nEducational only. Not financial advice. No strategy guarantees profits — every one has losing stretches, and risk management matters more than any approach.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    .label { animation: fadeIn 0.6s ease forwards; opacity: 0; }
    .bar { transform-origin: bottom; animation: growBar 0.6s ease forwards; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- ETF basket diagram -->
  <rect class="bar" x="30" y="100" width="28" height="55" fill="#27B7C8" opacity="0.7" rx="3" style="animation-delay:0.1s"/>
  <rect class="bar" x="68" y="85" width="28" height="70" fill="#27B7C8" opacity="0.7" rx="3" style="animation-delay:0.2s"/>
  <rect class="bar" x="106" y="110" width="28" height="45" fill="#27B7C8" opacity="0.7" rx="3" style="animation-delay:0.3s"/>
  <rect class="bar" x="144" y="75" width="28" height="80" fill="#27B7C8" opacity="0.7" rx="3" style="animation-delay:0.4s"/>
  <rect class="bar" x="182" y="95" width="28" height="60" fill="#27B7C8" opacity="0.7" rx="3" style="animation-delay:0.5s"/>
  <!-- Bracket -->
  <polyline points="20,155 20,165 240,165 240,155" fill="none" stroke="#49B06E" stroke-width="2"/>
  <text class="label" x="85" y="178" fill="#49B06E" font-size="10" font-family="sans-serif" style="animation-delay:0.8s">One ETF = many companies</text>
</svg>`,
    quiz: [
      {
        q: "What type of risk does a broad ETF NOT eliminate?",
        options: [
          "Single-company risk",
          "Market-wide (systematic) risk",
          "Sector concentration risk",
          "Individual stock earnings risk",
        ],
        correct: 1,
        explanation:
          "A broad ETF diversifies away single-company risk — if one holding collapses, others cushion it. But when the whole market falls, a broad ETF falls with it. Lower risk, not no risk.",
      },
      {
        q: "What is a common mistake ETF investors make about diversification?",
        options: [
          "Holding ETFs with low expense ratios",
          "Investing with a long time horizon",
          "Owning multiple ETFs that all hold the same top companies",
          "Spreading across different sectors",
        ],
        correct: 2,
        explanation:
          "Owning five different ETFs that all have the same mega-cap tech stocks as their top holdings creates the illusion of diversification — real concentration is hiding behind multiple ticker symbols.",
      },
      {
        q: "What does a low expense ratio mean for an ETF investor?",
        options: [
          "The ETF holds fewer companies",
          "Less of the investment's return is consumed by fees over time",
          "The ETF is riskier than average",
          "The fund manager is more active",
        ],
        correct: 1,
        explanation:
          "Expense ratios are annual fees charged by the ETF. Lower fees mean more of the market's return stays in the investor's pocket — compounded over years, this difference is meaningful.",
      },
      {
        q: "Why does ETF investing sidestep the 'picking the perfect stock' problem?",
        options: [
          "ETFs automatically predict which stocks will rise",
          "Owning a basket means not needing any single holding to outperform",
          "ETFs never fall during market downturns",
          "ETFs are managed by professional stock pickers",
        ],
        correct: 1,
        explanation:
          "By owning a broad basket, the investor doesn't need to correctly identify one winning company. They capture the group's growth — which historically has been far easier than picking individual winners.",
      },
    ],
    girlToGirlTip:
      "Boring and spread-out has quietly built more wealth than almost any hot tip. No shame in the steady path.",
    videoSlot: null,
  },

  {
    module: "m5-strategies",
    slug: "dividend-investing",
    title: "Dividend Investing",
    subtitle: "Build a portfolio that pays you to hold it.",
    difficulty: "Beginner",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Build a portfolio around companies that pay you to hold them — steady income plus growth, not just price gains.",
      },
      {
        type: "why-matters",
        heading: "Why It Suits a Certain Investor",
        content:
          "Rewards patience with regular cash, and reinvesting dividends compounds quietly over years.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Look at the durability of the dividend (can they keep paying it?), the business's health, and consistency — not just the headline yield.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Is this dividend sustainable or stretched? Is the business healthy? Reinvesting to compound? Is a sky-high yield a reward or a warning?",
      },
      {
        type: "psychology",
        heading: "Risk Reasoning",
        content:
          "A very high yield can be a red flag — sometimes the market expects a cut. Yield without durability is a trap.",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Chasing the highest yield without checking sustainability; ignoring the company's health.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Builds income plus growth from durable payers — sustainability matters more than a flashy yield.\n\nEducational only. Not financial advice. No strategy guarantees profits — every one has losing stretches, and risk management matters more than any approach.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes growCompound { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .compound-bar { transform-origin: bottom; animation: growCompound 0.5s ease forwards; }
    .label { animation: fadeIn 0.5s ease 2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Compounding dividend bars growing over time -->
  <rect class="compound-bar" x="25" y="145" width="22" height="12" fill="#49B06E" opacity="0.8" rx="2" style="animation-delay:0.1s"/>
  <rect class="compound-bar" x="60" y="138" width="22" height="19" fill="#49B06E" opacity="0.8" rx="2" style="animation-delay:0.2s"/>
  <rect class="compound-bar" x="95" y="128" width="22" height="29" fill="#49B06E" opacity="0.8" rx="2" style="animation-delay:0.3s"/>
  <rect class="compound-bar" x="130" y="115" width="22" height="42" fill="#49B06E" opacity="0.8" rx="2" style="animation-delay:0.4s"/>
  <rect class="compound-bar" x="165" y="98" width="22" height="59" fill="#49B06E" opacity="0.85" rx="2" style="animation-delay:0.5s"/>
  <rect class="compound-bar" x="200" y="78" width="22" height="79" fill="#49B06E" opacity="0.9" rx="2" style="animation-delay:0.6s"/>
  <rect class="compound-bar" x="235" y="52" width="22" height="105" fill="#27B7C8" opacity="0.9" rx="2" style="animation-delay:0.7s"/>
  <text class="label" x="200" y="45" fill="#27B7C8" font-size="10" font-family="sans-serif">Compounding</text>
  <text class="label" x="22" y="172" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">Yr 1</text>
  <text class="label" x="232" y="172" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">Yr 7</text>
</svg>`,
    quiz: [
      {
        q: "What does a very high dividend yield sometimes signal?",
        options: [
          "An exceptionally healthy company with strong cash flow",
          "The market may be expecting a dividend cut",
          "The stock is undervalued with no risks",
          "Dividends will compound faster than normal",
        ],
        correct: 1,
        explanation:
          "When a yield looks unusually high, it often means the stock price has fallen sharply — which can happen when the market expects the company may have to cut its dividend. High yield without durability is a trap.",
      },
      {
        q: "What matters more than headline yield in dividend investing?",
        options: [
          "The number of years the company has existed",
          "How big the company's marketing budget is",
          "The durability and sustainability of the dividend",
          "Whether the stock price has risen recently",
        ],
        correct: 2,
        explanation:
          "A flashy yield means nothing if the company can't sustain the payment. Dividend investors look for companies with the business health to keep paying — consistency and durability matter far more than the current headline number.",
      },
      {
        q: "How does reinvesting dividends help a long-term investor?",
        options: [
          "It guarantees the stock price won't fall",
          "It creates compounding — returns generating more returns over time",
          "It reduces the number of shares owned",
          "It protects against market downturns",
        ],
        correct: 1,
        explanation:
          "Reinvesting dividends buys more shares, which then pay more dividends, which buy more shares — the compounding effect quietly accelerates returns over years and decades.",
      },
      {
        q: "What is the most common mistake in dividend investing?",
        options: [
          "Checking the company's financial health",
          "Reinvesting dividends over time",
          "Chasing the highest yield without checking if it's sustainable",
          "Favoring consistent payers over high yielders",
        ],
        correct: 2,
        explanation:
          "Yield-chasing without checking sustainability is the classic mistake. A high number attracts attention, but if the company can't maintain it, the dividend gets cut — and the stock often falls sharply when that happens.",
      },
    ],
    girlToGirlTip:
      "A dividend is getting paid to be patient — but only if the company can keep paying it. A yield too good to be true usually is.",
    videoSlot: null,
  },

  {
    module: "m5-strategies",
    slug: "dollar-cost-averaging",
    title: "Dollar-Cost Averaging (DCA)",
    subtitle: "Trade market-timing for consistency — show up on schedule.",
    difficulty: "Beginner",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content:
          "Investing a fixed amount on a regular schedule regardless of price. The antidote to trying to time the market.",
      },
      {
        type: "why-matters",
        heading: "Why It Suits Almost Everyone",
        content:
          "Removes the pressure of 'is now a good time?' — you buy more shares when low, fewer when high, automatically, and sidestep the emotional disaster of timing entries.",
      },
      {
        type: "how-identify",
        heading: "The Reasoning",
        content:
          "Consistency over cleverness. Keep showing up so time (compounding) does the heavy lifting.",
      },
      {
        type: "how-read",
        heading: "Thinking Checklist",
        content:
          "Can I commit to a consistent amount and schedule? Investing long-term? Can I keep going during scary down periods? Letting emotion break the schedule?",
      },
      {
        type: "psychology",
        heading: "Risk Reasoning",
        content:
          "Doesn't remove market risk — removes timing risk and emotional risk, the bigger destroyers of returns for most people.",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "Stopping the schedule exactly when markets drop (worst time to stop); waiting for 'a better price' and never starting.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Trades market-timing for consistency — show up on schedule and let time do the work.\n\nEducational only. Not financial advice. No strategy guarantees profits — every one has losing stretches, and risk management matters more than any approach.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawPrice { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes popDot { from { r: 0; opacity:0; } to { r: 5; opacity:1; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .price-line { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawPrice 2s ease forwards; }
    .dot { animation: popDot 0.3s ease forwards; }
    .label { animation: fadeIn 0.5s ease 2.5s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Volatile price line -->
  <polyline class="price-line" points="20,100 50,70 80,110 110,60 140,90 170,50 200,80 230,45 260,70 295,40" fill="none" stroke="#27B7C8" stroke-width="2"/>
  <!-- Regular investment dots at fixed intervals -->
  <circle class="dot" cx="50" cy="70" r="5" fill="#49B06E" style="animation-delay:0.5s"/>
  <circle class="dot" cx="110" cy="60" r="5" fill="#49B06E" style="animation-delay:0.8s"/>
  <circle class="dot" cx="170" cy="50" r="5" fill="#49B06E" style="animation-delay:1.1s"/>
  <circle class="dot" cx="230" cy="45" r="5" fill="#49B06E" style="animation-delay:1.4s"/>
  <circle class="dot" cx="295" cy="40" r="5" fill="#49B06E" style="animation-delay:1.7s"/>
  <!-- Average cost line -->
  <line x1="30" y1="85" x2="295" y2="68" stroke="#F4F7FA" stroke-width="1" stroke-dasharray="4 3" opacity="0.4"/>
  <text class="label" x="18" y="64" fill="#49B06E" font-size="9" font-family="sans-serif">Regular buys</text>
  <text class="label" x="150" y="105" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">Avg cost</text>
</svg>`,
    quiz: [
      {
        q: "What is the core mechanic of dollar-cost averaging?",
        options: [
          "Investing more when prices are rising",
          "Timing the market at the best possible price",
          "Investing a fixed amount on a regular schedule regardless of price",
          "Avoiding investments during downturns",
        ],
        correct: 2,
        explanation:
          "DCA means committing a fixed dollar amount at regular intervals — weekly, monthly — no matter what price is doing. This removes timing decisions entirely.",
      },
      {
        q: "What happens naturally when you DCA into a falling market?",
        options: [
          "You buy fewer shares than usual",
          "The schedule should be paused temporarily",
          "You automatically buy more shares at lower prices",
          "The average cost rises quickly",
        ],
        correct: 2,
        explanation:
          "When prices fall, the same fixed dollar amount buys more shares. This automatic feature of DCA means downturns quietly lower your average cost — the opposite of what fear-driven investors do.",
      },
      {
        q: "What risk does DCA eliminate compared to lump-sum investing?",
        options: [
          "Market risk — the portfolio never falls",
          "Inflation risk over the long term",
          "Timing risk and emotional decision-making risk",
          "Currency risk for international stocks",
        ],
        correct: 2,
        explanation:
          "DCA doesn't protect against the market falling — if the market goes down, the portfolio falls too. What it removes is the timing risk (buying right before a crash) and the emotional risk of agonizing over when to invest.",
      },
      {
        q: "What is the worst time to break the DCA schedule?",
        options: [
          "When markets are at all-time highs",
          "When the market is falling and feels scary",
          "When dividends are being paid",
          "When the investment horizon is long",
        ],
        correct: 1,
        explanation:
          "Stopping DCA when markets are falling is the most damaging mistake — those are the periods when shares are cheaper and the schedule does its most effective work. Fear breaks the schedule at exactly the wrong moment.",
      },
    ],
    girlToGirlTip:
      "The magic of DCA is it protects you from yourself. No agonizing over timing — just show up, again and again. Discipline beats brilliance.",
    videoSlot: null,
  },
];

export function getM5LessonBySlug(slug: string): UniversityLesson | undefined {
  return M5_LESSONS.find((l) => l.slug === slug);
}
