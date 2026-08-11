import type { Strategy } from "./types";
import { ORB_CHART, VWAP_CHART, EMA_TREND_CHART, BREAKOUT_VOLUME_CHART, MOMENTUM_PULLBACK_CHART, SUPPORT_RESISTANCE_CHART, BULL_FLAG_CHART, BEAR_FLAG_CHART } from "./chart-data";

export const DAY_TRADING_STRATEGIES: Strategy[] = [
  {
    slug: "opening-range-breakout",
    name: "Opening Range Breakout (ORB)",
    category: "Day Trading",
    filters: ["Day Trading", "Breakouts"],
    difficulty: "Intermediate",
    timeframe: "5-min / 15-min intraday",
    marketConditions: "High-volume open, trending days",
    icon: "🚀",
    lessonCount: 4,
    sections: [
      {
        type: "overview",
        heading: "What Is the Opening Range?",
        content: "The opening range is the high and low price established during the first 5 or 15 minutes of the trading session. It represents the initial battle between buyers and sellers — the first real negotiation of the day.\n\nTraders watch this range because the first few minutes tend to concentrate the most volume and the most institutional activity. Where price goes after establishing this range often sets the tone for the rest of the session.\n\nThis is an educational framework. The opening range is not a guaranteed predictor of daily direction."
      },
      {
        type: "why",
        heading: "Why Traders Study This",
        content: "The open is when overnight news, pre-market activity, and institutional orders all converge. The opening range captures that information. When price breaks out of this range with conviction, it may signal that one side — buyers or sellers — has gained short-term control.\n\nStudying the ORB helps learners understand how early session activity can create a framework for the rest of the day. It teaches patience (waiting for the range to form) and discipline (only acting when there's confirmation)."
      },
      {
        type: "when-appropriate",
        heading: "When This Setup Tends to Work",
        content: "Days with a clear catalyst — earnings reports, economic data, sector news. High pre-market volume. Clean, defined opening ranges (not choppy, overlapping candles). Markets that tend to trend rather than chop."
      },
      {
        type: "when-inappropriate",
        heading: "When to Avoid",
        content: "Low-volume, holiday-shortened sessions. Extremely choppy opens with no defined range. Markets in a tight daily range with no catalyst. When the opening range is extremely wide (risk becomes too large relative to potential reward)."
      },
      {
        type: "setup",
        heading: "Identifying the Setup",
        content: "1. Wait for the first 5 or 15 minutes to complete (depending on your chosen timeframe).\n2. Mark the high and low of that period — this is your opening range.\n3. Watch for price to break above the range high or below the range low.\n4. Look for volume expansion on the breakout candle.\n5. Watch for a potential retest of the broken level."
      },
      {
        type: "entry",
        heading: "Entry Logic (Educational)",
        content: "Some traders consider entering when price breaks and closes above the opening range high (for long) or below the opening range low (for short), with volume confirming the move.\n\nA more conservative approach waits for a breakout followed by a brief pullback that holds above the broken level, then enters on the continuation.\n\nThis is a hypothetical educational example — not a recommendation to enter any specific trade."
      },
      {
        type: "invalidation",
        heading: "Invalidation / Stop Logic",
        content: "If price breaks above the range high and you're studying a long setup, the setup becomes invalid if price falls back below the range high (or the midpoint of the opening range, depending on the approach).\n\nThe key concept: your stop should be placed where the setup no longer makes sense — not where you hope the price won't go."
      },
      {
        type: "exit",
        heading: "Exit Approaches",
        content: "Common educational exit concepts:\n\n• A measured move equal to the height of the opening range, projected from the breakout point.\n• Previous day's high/low as a potential area of interest.\n• A trailing approach that exits if price closes back inside the range.\n• Time-based: some traders reduce exposure in the final hour when volume dynamics shift."
      },
      {
        type: "position-sizing",
        heading: "Position Sizing & Risk",
        content: "The distance from entry to stop defines your risk per share. Multiply by your position size to get total risk.\n\nExample: If the range is $1 wide, and you place your stop at the opposite side of the range, your risk is approximately $1 per share.\n\nNever risk more than you're comfortable losing on any single educational exercise."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content: "• Entering before the opening range is fully formed.\n• Chasing a breakout that's already moved significantly.\n• Ignoring volume — a breakout on declining volume is suspect.\n• Using too wide a stop because the opening range was too large.\n• Not recognizing false breakouts (price briefly breaks the range, then reverses)."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The ORB teaches a fundamental concept: define a range, wait for a decisive break, confirm with volume, manage risk. It's a structured way to approach the most active part of the trading day.\n\nEducational only. Not financial advice."
      }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><rect x="30" y="60" width="120" height="60" fill="#27B7C8" opacity="0.15" stroke="#27B7C8" stroke-dasharray="4"/><text x="90" y="55" text-anchor="middle" font-size="9" fill="#27B7C8">Opening Range</text><line x1="30" y1="60" x2="150" y2="60" stroke="#27B7C8" stroke-width="1.5"/><text x="155" y="58" font-size="8" fill="#F4F7FA">Range High</text><line x1="30" y1="120" x2="150" y2="120" stroke="#27B7C8" stroke-width="1.5"/><text x="155" y="122" font-size="8" fill="#F4F7FA">Range Low</text><path d="M160,58 L200,50 L240,45 L280,38 L320,30 L360,25" stroke="#49B06E" stroke-width="2" fill="none"/><circle cx="160" cy="58" r="4" fill="#49B06E"/><text x="165" y="48" font-size="8" fill="#49B06E">Breakout</text><rect x="200" y="15" width="2" height="25" fill="#49B06E" opacity="0.6"/><rect x="240" y="12" width="2" height="28" fill="#49B06E" opacity="0.6"/><text x="250" y="50" font-size="8" fill="#F4F7FA" opacity="0.5">Volume expansion</text><text x="200" y="190" text-anchor="middle" font-size="8" fill="rgba(244,247,250,0.3)">Hypothetical educational example</text></svg>`,
    quiz: [
      { q: "What defines the opening range?", options: ["The first candle of the day", "The high and low of the first 5 or 15 minutes", "The previous day's close to today's open", "The pre-market high and low"], correct: 1, explanation: "The opening range is specifically the high and low established during the first 5 or 15 minutes of the regular trading session — not the pre-market or just the first candle." },
      { q: "Why is volume important during an opening range breakout?", options: ["Higher volume means the stock is expensive", "Volume confirms that real participation is behind the move", "Volume determines the stock's direction for the week", "Volume is irrelevant to breakouts"], correct: 1, explanation: "Volume shows participation. A breakout on strong volume suggests real buying or selling pressure, while a breakout on weak volume might lack conviction and could reverse." },
      { q: "What is a false breakout in the context of an ORB?", options: ["When the opening range is too small", "When price briefly breaks the range but reverses back inside", "When volume is extremely high", "When the market closes unchanged"], correct: 1, explanation: "A false breakout occurs when price temporarily moves beyond the range boundary but fails to hold, reversing back inside. This is why confirmation and volume matter." },
      { q: "Where should a stop be placed conceptually?", options: ["At a random dollar amount below entry", "Where the setup no longer makes sense", "As far away as possible", "Exactly at your entry price"], correct: 1, explanation: "A stop should be placed where the original thesis becomes invalid — not at an arbitrary level. For an ORB long, that's often the opposite side of the range or the range midpoint." }
    ],
    chartExercises: [
      {
        id: "orb-spot-1",
        type: "spot_setup",
        title: "Find the Opening Range",
        instruction: "Look at this 5-minute chart. Identify where the opening range high and low are.",
        chartData: ORB_CHART,
        question: "What would you watch for after the opening range forms?",
        options: [
          { label: "Enter immediately at the range high", correct: false, explanation: "Entering at the exact level without confirmation is premature. You want to see a break AND confirmation." },
          { label: "Wait for a break with volume confirmation", correct: true, explanation: "Waiting for price to break the range AND seeing volume expand gives you more information before acting." },
          { label: "Ignore the range and trade based on feelings", correct: false, explanation: "Trading without a framework is one of the most common mistakes. The opening range gives you structure." },
          { label: "Chase the biggest green candle", correct: false, explanation: "Chasing extended moves often leads to entering at the worst possible level — right when the move is exhausted." }
        ],
        pansyExplanation: "Nice work identifying the range! The key here is patience. Let the range form, wait for the break, and check the volume. No volume confirmation? No conviction. And remember — sometimes the best trade is the one you don't take."
      }
    ],
    pansy: {
      intro: "Before we look at any indicator, let's start with what price itself is telling us during those first few minutes. The opening range is your first clue of the day.",
      duringChart: [
        "See those first few candles? That's the range forming. Don't touch anything yet.",
        "Volume is the key. A breakout without volume is like a promise without action.",
        "Notice how price tested the range high twice before breaking? That's conviction building."
      ],
      afterQuiz: [
        "You're thinking about this the right way. Structure first, then confirmation.",
        "Remember — the ORB is a framework, not a crystal ball."
      ],
      encouragement: "You're learning to read the open like a pro. Most people just stare at green candles — you're reading the story.",
      warning: "The opening range is one tool. It works some days, not others. Never assume any single setup will always work."
    },
    toolbelt: {
      bestStudiedDuring: "High-volume market opens with a catalyst",
      lookFor: "Defined range + breakout + volume expansion",
      avoid: "Chasing extended candles, low-volume opens",
      confirmation: "Break + close beyond range + volume above average",
      invalidation: "Price falls back inside the range"
    }
  },

  {
    slug: "vwap-trend",
    name: "VWAP Trend Strategy",
    category: "Day Trading",
    filters: ["Day Trading", "Trend"],
    difficulty: "Intermediate",
    timeframe: "5-min / 15-min intraday",
    marketConditions: "Trending days with clear direction",
    icon: "📊",
    lessonCount: 4,
    sections: [
      { type: "overview", heading: "What VWAP Represents", content: "VWAP — Volume Weighted Average Price — is the average price a stock has traded at throughout the day, weighted by volume. It gives you a sense of the \"fair value\" for the day based on actual transactions.\n\nUnlike a simple moving average, VWAP gives more weight to prices where more shares changed hands. If price is above VWAP, buyers have generally been willing to pay above the day's average. Below VWAP, sellers have had more influence." },
      { type: "why", heading: "Why Traders Watch VWAP", content: "Institutional traders often use VWAP as a benchmark. When large funds buy, they frequently try to get fills at or near VWAP. This makes VWAP a level where real buying or selling interest may appear.\n\nFor educational purposes, watching how price interacts with VWAP teaches you about institutional behavior and the concept of value versus price." },
      { type: "setup", heading: "The VWAP Setup", content: "• Price above VWAP: Buyers are in control on the day.\n• Price below VWAP: Sellers are in control.\n• VWAP Reclaim: Price dips below VWAP, then breaks back above it with volume — a potential shift back to buyer control.\n• VWAP Rejection: Price pushes up to VWAP, fails to break above, and continues lower.\n\nThe strongest signals occur when VWAP interactions align with the broader trend." },
      { type: "when-inappropriate", heading: "When to Avoid", content: "Sideways, choppy markets where price crosses VWAP repeatedly with no conviction. Low-volume days where VWAP has less significance. Late in the day when VWAP becomes less responsive." },
      { type: "entry", heading: "Entry Logic (Educational)", content: "On a VWAP reclaim: some traders consider entering after price breaks back above VWAP with volume, especially if the broader trend supports a move higher.\n\nOn a VWAP hold: during a trending day, some traders consider entries when price pulls back to VWAP, holds, and resumes the trend direction.\n\nHypothetical educational example only." },
      { type: "invalidation", heading: "Invalidation", content: "For a VWAP reclaim long: if price falls back below VWAP after breaking above, the reclaim has failed.\n\nFor a VWAP hold: if price closes below VWAP on increasing volume, buyers are losing the day." },
      { type: "exit", heading: "Exit Approaches", content: "• Previous highs/lows as areas of potential interest.\n• A move equal to the distance from VWAP to the entry.\n• If price begins to flatline around VWAP with no conviction." },
      { type: "mistakes", heading: "Common Mistakes", content: "• Treating VWAP as a magic line — it's a reference, not a guarantee.\n• Trading VWAP in choppy markets where it gets crossed constantly.\n• Forgetting that VWAP resets each day — it's an intraday tool only.\n• Using VWAP on daily or weekly charts (it doesn't apply)." },
      { type: "takeaway", heading: "Key Takeaway", content: "VWAP teaches you to think about where the average buyer and seller are positioned today. Price above = bullish context. Below = bearish context. Reclaims and rejections at VWAP are high-information moments.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><path d="M20,130 Q80,120 140,110 Q200,100 260,95 Q320,90 380,85" stroke="#FFD700" stroke-width="2" fill="none" stroke-dasharray="6 3"/><text x="385" y="82" font-size="8" fill="#FFD700">VWAP</text><path d="M20,150 L60,135 L80,140 L100,125 L120,130 L140,115 L160,120 L180,105 L200,95 L220,100 L240,85 L260,80 L280,75 L300,70 L320,65 L340,60 L360,55 L380,50" stroke="#49B06E" stroke-width="1.5" fill="none"/><circle cx="180" cy="105" r="5" fill="none" stroke="#27B7C8" stroke-width="1.5"/><text x="185" y="118" font-size="8" fill="#27B7C8">VWAP Reclaim</text><text x="200" y="190" text-anchor="middle" font-size="8" fill="rgba(244,247,250,0.3)">Hypothetical educational example</text></svg>`,
    quiz: [
      { q: "What does VWAP stand for?", options: ["Volume Weighted Average Price", "Variable Weighted Asset Price", "Volume Widened Average Pattern", "Vertical Weighted Analysis Point"], correct: 0, explanation: "VWAP is the Volume Weighted Average Price — the average price weighted by the volume traded at each price level throughout the day." },
      { q: "When price is above VWAP, what does that generally suggest?", options: ["The stock is overvalued", "Buyers have been willing to pay above the day's average price", "The stock will definitely go higher", "Volume is declining"], correct: 1, explanation: "Price above VWAP means most of the day's volume has been transacted below the current price — buyers have been paying above the average." },
      { q: "What is a VWAP reclaim?", options: ["When VWAP reaches a new high", "When price dips below VWAP then breaks back above with volume", "When two VWAPs cross", "When VWAP equals the closing price"], correct: 1, explanation: "A VWAP reclaim occurs when price falls below VWAP temporarily but then pushes back above it with conviction — suggesting buyers are reasserting control." },
      { q: "When should you avoid using VWAP as a reference?", options: ["On trending days", "On choppy, sideways days where price crosses VWAP repeatedly", "During the first 15 minutes", "When volume is high"], correct: 1, explanation: "In choppy markets, price crosses VWAP back and forth with no conviction, making it unreliable as a directional reference." }
    ],
    chartExercises: [
      {
        id: "vwap-spot-1", type: "spot_setup", title: "Read the VWAP", instruction: "Identify where price interacts with VWAP on this chart.",
        chartData: VWAP_CHART,
        question: "Price dipped below VWAP and then broke back above with increased volume. What is this called?",
        options: [
          { label: "VWAP rejection", correct: false, explanation: "A rejection is when price fails to break through VWAP and reverses — the opposite of what happened here." },
          { label: "VWAP reclaim", correct: true, explanation: "Price reclaimed VWAP — it went below, came back above, and volume confirmed the move. This is a high-information moment." },
          { label: "VWAP breakdown", correct: false, explanation: "A breakdown is when price falls below VWAP and stays below. Here it came back." },
          { label: "No setup present", correct: false, explanation: "There is a setup here — the VWAP reclaim with volume is a well-known educational pattern." }
        ],
        pansyExplanation: "You spotted the reclaim — that's the moment when the story changed. Price fell below fair value and then buyers said 'no, we're taking this back.' Volume confirmed it wasn't just noise."
      }
    ],
    pansy: {
      intro: "VWAP is one of the most-watched levels by institutional traders. Let's learn why — and more importantly, when it matters and when it doesn't.",
      duringChart: ["See that golden line? That's VWAP — the day's volume-weighted fair value.", "Price just touched VWAP and bounced. Buyers defending that level.", "Watch the volume on the reclaim candle — that's what confirmation looks like."],
      afterQuiz: ["You're starting to think about price in context, not just direction. That's a level up.", "VWAP is a tool, not a religion. Use it when it's useful."],
      encouragement: "Understanding VWAP means you're thinking about where the real money is positioned. That's sophisticated.",
      warning: "VWAP resets every day. It's an intraday tool. Don't try to use it on daily charts."
    },
    toolbelt: { bestStudiedDuring: "Trending intraday sessions with clear direction", lookFor: "VWAP reclaim or hold with volume confirmation", avoid: "Choppy sideways days, late-session trades", confirmation: "Volume expansion on VWAP break/hold", invalidation: "Price falls back below VWAP on volume" }
  },

  {
    slug: "ema-trend",
    name: "EMA Trend Strategy",
    category: "Day Trading",
    filters: ["Day Trading", "Trend"],
    difficulty: "Intermediate",
    timeframe: "Multiple (5-min to daily)",
    marketConditions: "Trending markets",
    icon: "📈",
    lessonCount: 4,
    sections: [
      { type: "overview", heading: "What Are EMAs?", content: "Exponential Moving Averages (EMAs) give more weight to recent prices than simple moving averages. The three most commonly watched are the 9 EMA (very short-term), 20 EMA (short-term), and 50 EMA (medium-term).\n\nWhen these EMAs are stacked in order — 9 above 20 above 50 — it suggests a strong uptrend. When they're inverted (9 below 20 below 50), it suggests a downtrend." },
      { type: "why", heading: "Why Traders Watch EMAs", content: "EMAs act as dynamic support and resistance. In a healthy trend, price tends to pull back to an EMA and bounce. The 9 EMA catches the shallowest pullbacks, the 20 catches moderate ones, and the 50 catches deeper ones.\n\nStudying EMA behavior teaches you to read trend strength and identify when a trend may be weakening." },
      { type: "setup", heading: "The EMA Alignment Setup", content: "Bullish alignment: 9 EMA > 20 EMA > 50 EMA, all rising.\n\nBearish alignment: 9 EMA < 20 EMA < 50 EMA, all falling.\n\nPullback to EMA: In an uptrend, price pulls back to the 9 or 20 EMA, holds, and continues higher.\n\nCrossover: The 9 EMA crosses above the 20 EMA (bullish) or below (bearish). But be cautious — crossovers alone are unreliable." },
      { type: "when-inappropriate", heading: "When to Avoid", content: "Sideways/ranging markets where EMAs flatten and get tangled. Crossovers in choppy conditions produce whipsaws. EMAs lag — they confirm trends, they don't predict them." },
      { type: "entry", heading: "Entry Logic (Educational)", content: "On a pullback: some traders consider entries when price pulls back to the 9 or 20 EMA in a trending market, holds, and the next candle shows continuation.\n\nOn alignment: when EMAs align for the first time (9 crosses above 20 above 50), some traders see this as the start of a new trend.\n\nHypothetical educational example only." },
      { type: "invalidation", heading: "Why EMA Crosses Alone Are Dangerous", content: "Blindly trading every EMA cross will result in many false signals during sideways markets. EMAs lag, so by the time they cross, the move may already be over.\n\nThe EMA cross is a confirmation tool — used alongside price action, volume, and market structure. Never in isolation." },
      { type: "mistakes", heading: "Common Mistakes", content: "• Trading every EMA crossover without context.\n• Using EMAs in choppy, sideways markets.\n• Expecting EMAs to predict the future (they only describe what has happened).\n• Using the same EMA settings on every timeframe without understanding why." },
      { type: "takeaway", heading: "Key Takeaway", content: "EMAs help you read trend direction, identify pullback opportunities, and understand when a trend is losing momentum. They're descriptive tools, not predictive ones.\n\nBullish example: 9 > 20 > 50, all rising, pullback to 20 holds.\nBearish example: 9 < 20 < 50, all falling, rally to 20 rejects.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><path d="M20,160 Q100,130 200,90 Q300,50 380,30" stroke="#ef4444" stroke-width="1.5" fill="none"/><text x="385" y="28" font-size="8" fill="#ef4444">9 EMA</text><path d="M20,165 Q100,140 200,100 Q300,65 380,45" stroke="#27B7C8" stroke-width="1.5" fill="none"/><text x="385" y="43" font-size="8" fill="#27B7C8">20 EMA</text><path d="M20,170 Q100,150 200,115 Q300,80 380,65" stroke="#FFD700" stroke-width="1.5" fill="none"/><text x="385" y="63" font-size="8" fill="#FFD700">50 EMA</text><circle cx="200" cy="100" r="8" fill="none" stroke="#49B06E" stroke-width="1.5"/><text x="210" y="108" font-size="8" fill="#49B06E">Pullback to 20</text><text x="200" y="190" text-anchor="middle" font-size="8" fill="rgba(244,247,250,0.3)">Hypothetical educational example</text></svg>`,
    quiz: [
      { q: "What does EMA alignment mean?", options: ["All EMAs are at the same price", "EMAs are stacked in order (9 > 20 > 50 for uptrend)", "EMAs are crossing each other", "The stock is at its all-time high"], correct: 1, explanation: "EMA alignment means the shorter EMAs are above the longer ones (or below, for a downtrend), all moving in the same direction — indicating a strong trend." },
      { q: "Why is blindly trading every EMA crossover dangerous?", options: ["Because EMAs are always wrong", "Because in choppy markets, EMAs produce many false crossover signals", "Because crossovers only work on daily charts", "Because EMAs don't use volume"], correct: 1, explanation: "In sideways markets, EMAs flatten and produce frequent crosses that lead nowhere. Crossovers work best as confirmation in already-trending markets, never as standalone signals." },
      { q: "In an uptrend, where might price find dynamic support?", options: ["At the 50 EMA only", "At the 9 or 20 EMA during pullbacks", "Only at round numbers", "At the previous day's VWAP"], correct: 1, explanation: "In a healthy uptrend, the 9 EMA catches shallow pullbacks and the 20 EMA catches moderate ones. Price bouncing off these levels suggests the trend remains intact." },
      { q: "What does it mean when the 9 EMA is below the 20 EMA, which is below the 50 EMA?", options: ["Bullish alignment", "Bearish alignment — downtrend", "No trend", "Time to buy"], correct: 1, explanation: "When shorter EMAs are below longer ones (9 < 20 < 50), it indicates bearish alignment — a downtrend where sellers are in control." }
    ],
    chartExercises: [{ id: "ema-spot-1", type: "spot_setup", title: "Read the EMA Stack", instruction: "Identify the EMA alignment and the pullback opportunity.", chartData: EMA_TREND_CHART, question: "The 9 EMA is above the 20 EMA, above the 50 EMA, and price just pulled back to the 20 EMA. What does this suggest?", options: [{ label: "The trend is over", correct: false, explanation: "Pullbacks to the 20 EMA in a stacked trend are normal — they don't mean the trend is over." }, { label: "A potential pullback entry in a healthy uptrend", correct: true, explanation: "In a stacked uptrend, a pullback to the 20 EMA that holds is often considered a continuation opportunity." }, { label: "You should short immediately", correct: false, explanation: "Shorting against a stacked bullish EMA alignment is fighting the trend." }, { label: "Volume doesn't matter here", correct: false, explanation: "Volume always matters. A bounce off the 20 EMA with increasing volume is more convincing than one on thin volume." }], pansyExplanation: "You can see the EMAs stacked beautifully — 9 above 20 above 50, all rising. That pullback to the 20 EMA? That's the trend giving you a second chance. Not every pullback works, but the alignment tells you the bigger picture is still bullish." }],
    pansy: { intro: "EMAs are one of the first tools traders learn — and one of the most misused. Let's learn what they actually tell you, and what they don't.", duringChart: ["See how the three lines are stacked? That's alignment — the trend's fingerprint.", "Price touched the 20 EMA and bounced. The trend is still breathing.", "When these lines start tangling? That's your signal to step back."], afterQuiz: ["You're reading the trend, not predicting it. That's the right mindset.", "EMAs describe, they don't prescribe. Always combine with price action."], encouragement: "You're learning to see the trend beneath the noise. That's a real skill.", warning: "EMA crossovers in choppy markets will eat you alive. Context first, always." },
    toolbelt: { bestStudiedDuring: "Trending markets with clear direction", lookFor: "EMA alignment + pullback to 9/20 that holds", avoid: "Choppy sideways markets, blind crossover trading", confirmation: "Bounce off EMA + continuation candle + volume", invalidation: "Price closes below the 50 EMA in an uptrend" }
  },

  {
    slug: "breakout-volume",
    name: "Breakout + Volume Strategy",
    category: "Day Trading",
    filters: ["Day Trading", "Breakouts"],
    difficulty: "Intermediate",
    timeframe: "15-min to daily",
    marketConditions: "After consolidation periods",
    icon: "💥",
    lessonCount: 4,
    sections: [
      { type: "overview", heading: "What Is a Breakout?", content: "A breakout occurs when price moves beyond a defined resistance or support level that has held multiple times. Before a breakout, price typically consolidates — moving sideways in a tightening range.\n\nVolume is the confirmation. A breakout on high volume suggests real participation. A breakout on low volume is suspect." },
      { type: "setup", heading: "Identifying the Setup", content: "1. Identify a clear resistance level (for bullish breakouts) or support level (for bearish breakdowns).\n2. Look for consolidation below resistance — price should be making higher lows.\n3. Watch for volume contraction during consolidation (less trading = less interest, coiling).\n4. The breakout candle should have volume expansion — significantly above average.\n5. A retest of the broken level (resistance becoming support) adds confirmation." },
      { type: "entry", heading: "Entry Logic (Educational)", content: "Some traders consider entering on the first close above resistance with volume. Others wait for a breakout + pullback/retest of the broken level.\n\nThe retest approach is more conservative but may miss some moves. The immediate approach captures more moves but has a higher false breakout rate.\n\nHypothetical educational example only." },
      { type: "invalidation", heading: "False Breakouts", content: "A false breakout is when price briefly moves beyond the level but fails to hold. Price closes back below resistance after initially breaking above.\n\nFalse breakouts are common. Volume helps filter them — a breakout on thin volume is more likely to fail. This is why volume confirmation is essential to this framework." },
      { type: "mistakes", heading: "Common Mistakes", content: "• Buying the breakout without checking volume.\n• Chasing a breakout after it's already extended.\n• Not identifying a clear resistance level (you can't break out of nothing).\n• Ignoring the broader market context.\n• Setting stops too tight (breakouts often retest the level)." },
      { type: "takeaway", heading: "Key Takeaway", content: "Breakout + Volume teaches you that price levels matter, volume confirms, and consolidation creates opportunity. Not every breakout works — that's why risk management exists.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><line x1="20" y1="80" x2="280" y2="80" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4"/><text x="285" y="78" font-size="8" fill="#ef4444">Resistance</text><path d="M20,150 L60,130 L100,120 L140,110 L180,100 L220,95 L260,90 L280,85" stroke="#F4F7FA" stroke-width="1" fill="none" opacity="0.5"/><path d="M280,75 L300,60 L320,50 L340,45 L360,40" stroke="#49B06E" stroke-width="2" fill="none"/><circle cx="280" cy="78" r="5" fill="none" stroke="#49B06E" stroke-width="1.5"/><text x="290" y="72" font-size="8" fill="#49B06E">Breakout</text><rect x="280" y="140" width="8" height="40" fill="#49B06E" opacity="0.4"/><rect x="220" y="160" width="8" height="15" fill="#F4F7FA" opacity="0.2"/><text x="260" y="195" font-size="7" fill="#F4F7FA" opacity="0.4">Volume expansion</text><text x="200" y="190" text-anchor="middle" font-size="8" fill="rgba(244,247,250,0.3)">Hypothetical educational example</text></svg>`,
    quiz: [
      { q: "What confirms a breakout?", options: ["Price touching resistance once", "Price closing above resistance with volume expansion", "Price reaching a new 52-week high", "A news headline"], correct: 1, explanation: "A breakout is confirmed when price closes beyond the level (not just touches it) with volume significantly above average." },
      { q: "What is a false breakout?", options: ["When resistance never breaks", "When price briefly breaks above resistance but fails to hold", "When volume is very high", "When the stock splits"], correct: 1, explanation: "A false breakout occurs when price moves beyond a level temporarily but can't sustain the move, reversing back below." },
      { q: "What should volume do during consolidation before a breakout?", options: ["Increase dramatically", "Contract / decrease", "Stay exactly the same", "Volume doesn't matter"], correct: 1, explanation: "Volume typically contracts during consolidation as the range tightens. This coiling effect precedes the expansion — when volume surges, the breakout carries more weight." },
      { q: "What is a breakout retest?", options: ["Testing the breakout on a different chart", "Price pulling back to the broken level after breaking out", "A second breakout attempt", "When price breaks down instead"], correct: 1, explanation: "A retest occurs when price breaks above resistance, pulls back to that former resistance (now potential support), and holds. It's a common confirmation pattern." }
    ],
    chartExercises: [{ id: "bv-spot-1", type: "spot_setup", title: "Spot the Breakout", instruction: "This chart shows a stock consolidating near a resistance level. Look at the volume bars. Can you identify where the actual breakout occurs?", chartData: BREAKOUT_VOLUME_CHART, question: "At which point does the breakout occur with proper volume confirmation?", options: [{ label: "During the consolidation phase when price touches resistance", correct: false, explanation: "Touching resistance isn't a breakout — price needs to close beyond it with volume." }, { label: "The candle that closes above resistance with a volume spike", correct: true, explanation: "The breakout occurs when price closes above resistance AND volume expands significantly — that's the confirmation." }, { label: "The very first candle of the chart", correct: false, explanation: "The first candle is the beginning of the consolidation, not the breakout." }, { label: "There is no valid breakout on this chart", correct: false, explanation: "There is a clear breakout — look for the candle that closes above the established resistance with a dramatic volume increase." }], pansyExplanation: "See how volume contracted during that consolidation? And then BOOM — volume exploded on the breakout candle. That's what real participation looks like. The quiet before the storm, then the storm itself." }],
    pansy: { intro: "Breakouts look exciting. But most of them fail. Let's learn how to tell the difference.", duringChart: ["See the volume bars getting smaller? The market is coiling.", "Now look at that volume bar on the breakout candle — completely different story.", "Always ask: is the volume confirming the move, or is this just noise?"], afterQuiz: ["You're learning to read between the candles. Volume is the hidden language.", "Not every breakout works. But understanding volume helps you filter the fakes."], encouragement: "You're developing the eye for breakouts that most traders never get. Volume is your friend.", warning: "Chasing breakouts after they've already moved 5% is how people buy the top. Patience." },
    toolbelt: { bestStudiedDuring: "After periods of consolidation near key levels", lookFor: "Resistance + consolidation + volume contraction + breakout with volume expansion", avoid: "Buying extended breakouts, ignoring volume", confirmation: "Close above resistance + volume 2x+ average", invalidation: "Price closes back below the broken level" }
  },

  {
    slug: "momentum-pullback",
    name: "Momentum Pullback Strategy",
    category: "Day Trading",
    filters: ["Day Trading", "Momentum"],
    difficulty: "Intermediate",
    timeframe: "5-min to daily",
    marketConditions: "Strong trending moves",
    icon: "⚡",
    lessonCount: 3,
    sections: [
      { type: "overview", heading: "What Is a Momentum Pullback?", content: "A momentum pullback occurs after a strong initial move (the impulse). Price pauses and retraces a portion of the move on decreasing volume, then resumes in the original direction with increasing volume.\n\nThe initial move shows that one side has taken control. The pullback is natural — profit-taking and consolidation. The continuation confirms the original momentum is still alive." },
      { type: "setup", heading: "Identifying the Pattern", content: "1. Strong initial move with increasing volume (the impulse leg).\n2. A controlled pullback — ideally 30-50% retracement of the initial move.\n3. Volume decreases during the pullback (selling pressure fading).\n4. A continuation candle with increasing volume.\n5. The pullback ideally holds above a key level (prior resistance, EMA, VWAP)." },
      { type: "entry", heading: "Entry Logic (Educational)", content: "Some traders consider entries when the continuation candle appears after the pullback — especially if it reclaims the short-term EMA (9 or 20) with volume.\n\nThe key: the pullback should look orderly, not panicked. Decreasing volume on the pullback is essential.\n\nHypothetical educational example only." },
      { type: "invalidation", heading: "Invalidation", content: "If the pullback retraces more than 60-70% of the initial move, the momentum may be exhausted. If volume increases during the pullback (panic selling), this is not a controlled pullback — it's a reversal." },
      { type: "takeaway", heading: "Key Takeaway", content: "Momentum pullbacks teach you to read the health of a move. Strong impulse + quiet pullback + continuation = momentum intact. Weak impulse + aggressive pullback = be cautious.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><path d="M30,170 L80,100 L130,60" stroke="#49B06E" stroke-width="2.5" fill="none"/><text x="85" y="55" font-size="8" fill="#49B06E">Impulse</text><path d="M130,60 L170,85 L200,90" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="4"/><text x="165" y="100" font-size="8" fill="#F4F7FA" opacity="0.6">Pullback (low vol)</text><path d="M200,90 L250,60 L300,40 L350,25" stroke="#49B06E" stroke-width="2.5" fill="none"/><text x="280" y="20" font-size="8" fill="#49B06E">Continuation</text><text x="200" y="190" text-anchor="middle" font-size="8" fill="rgba(244,247,250,0.3)">Hypothetical educational example</text></svg>`,
    quiz: [
      { q: "What should volume do during a healthy pullback?", options: ["Increase dramatically", "Decrease — selling pressure fading", "Stay the same as the impulse", "Volume is irrelevant"], correct: 1, explanation: "A healthy pullback sees decreasing volume, suggesting the move against the trend is just profit-taking, not a reversal with real selling pressure." },
      { q: "How much should a pullback typically retrace?", options: ["100% of the initial move", "30-50% of the initial move", "Less than 5%", "It depends on the stock price"], correct: 1, explanation: "A 30-50% retracement is considered healthy. Too shallow may not offer a good entry. Too deep (60%+) suggests the momentum may be fading." },
      { q: "What confirms the continuation after a pullback?", options: ["Hope and optimism", "A continuation candle with increasing volume", "The stock price being a round number", "An EMA crossover only"], correct: 1, explanation: "A continuation candle with volume expansion shows that buyers (in an uptrend) are stepping back in after the pause." }
    ],
    chartExercises: [{ id: "mp-spot-1", type: "spot_setup", title: "Read the Pullback", instruction: "Identify the impulse, pullback, and continuation on this chart.", chartData: MOMENTUM_PULLBACK_CHART, question: "Volume decreased during the pullback and increased on the continuation. What does this tell you?", options: [{ label: "The trend is reversing", correct: false, explanation: "Decreasing volume on the pullback followed by increasing volume on continuation actually suggests the trend is healthy." }, { label: "The pullback is healthy and momentum is intact", correct: true, explanation: "Low volume pullback + high volume continuation = the original impulse has life. Sellers didn't take over." }, { label: "It means nothing", correct: false, explanation: "Volume behavior during pullbacks is one of the most important clues about trend health." }, { label: "You should sell immediately", correct: false, explanation: "This volume pattern actually suggests strength, not weakness." }], pansyExplanation: "Beautiful read! The impulse was strong, the pullback was quiet (declining volume), and then volume came back on the continuation. That's momentum speaking — the original move still has energy." }],
    pansy: { intro: "Momentum is exciting. But the real opportunity isn't in the first pop — it's in the pullback that follows. Let me show you.", duringChart: ["See that strong initial move? That's the impulse — momentum announcing itself.", "Now watch the pullback. Volume is fading. The selling is half-hearted.", "And there's the continuation. Volume came back. Momentum is alive."], afterQuiz: ["You're reading the rhythm of the market — impulse, rest, repeat.", "The key insight: the pullback tells you more than the impulse does."], encouragement: "You're learning to read momentum like a story, not just a green candle.", warning: "Not every pullback leads to continuation. That's what stops are for." },
    toolbelt: { bestStudiedDuring: "After strong moves on high volume", lookFor: "Impulse + controlled pullback (low volume) + continuation (high volume)", avoid: "Chasing the impulse, pullbacks with increasing volume", confirmation: "Continuation candle + volume expansion", invalidation: "Pullback retraces 60%+ of the impulse or volume increases during pullback" }
  },

  {
    slug: "support-resistance-bounce",
    name: "Support & Resistance Bounce",
    category: "Day Trading",
    filters: ["Day Trading", "Mean Reversion"],
    difficulty: "Beginner",
    timeframe: "Any timeframe",
    marketConditions: "Ranging or trending markets",
    icon: "🏀",
    lessonCount: 3,
    sections: [
      { type: "overview", heading: "How Important Price Levels Form", content: "Support and resistance are price levels where buying or selling pressure has historically appeared. Support is a floor — a level where buyers have stepped in. Resistance is a ceiling — a level where sellers have appeared.\n\nThese levels form through repeated tests. The more times price bounces off a level, the more significant it becomes. But here's the twist: eventually, all levels break." },
      { type: "setup", heading: "Reading Support & Resistance", content: "• Multiple tests: A level tested 3+ times is more significant than one tested once.\n• Role reversal: When resistance breaks, it often becomes support (and vice versa). This is called polarity.\n• Confirmation: A bounce off support with volume is more convincing than one on thin volume.\n• Failed levels: When a support level breaks with volume, previous buyers become trapped — that level may now act as resistance." },
      { type: "entry", heading: "Entry Logic (Educational)", content: "Bounce trades: Some traders consider entries when price approaches a well-established support level, shows signs of holding (wicks, volume), and starts to bounce.\n\nBreak trades: When a key level breaks with conviction and volume.\n\nHypothetical educational example only." },
      { type: "invalidation", heading: "When Levels Fail", content: "All levels eventually break. When a support level breaks on high volume, the thesis is invalidated. Holding and hoping is not risk management.\n\nA close below support (not just a wick) with volume is a failed level." },
      { type: "takeaway", heading: "Key Takeaway", content: "Support and resistance are the foundation of chart reading. They teach you where decisions are being made — where real buying and selling pressure exists. But no level holds forever.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><line x1="20" y1="60" x2="380" y2="60" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4"/><text x="10" y="55" font-size="8" fill="#ef4444">R</text><line x1="20" y1="150" x2="380" y2="150" stroke="#49B06E" stroke-width="1.5" stroke-dasharray="4"/><text x="10" y="155" font-size="8" fill="#49B06E">S</text><path d="M30,100 L70,70 L110,90 L150,65 L190,100 L230,145 L250,130 L270,148 L290,120 L310,70 L330,90 L350,65 L370,80" stroke="#F4F7FA" stroke-width="1.5" fill="none" opacity="0.7"/><circle cx="230" cy="145" r="4" fill="#49B06E" opacity="0.5"/><circle cx="270" cy="148" r="4" fill="#49B06E" opacity="0.5"/><text x="240" y="168" font-size="7" fill="#49B06E">Support bounces</text><circle cx="150" cy="65" r="4" fill="#ef4444" opacity="0.5"/><circle cx="350" cy="65" r="4" fill="#ef4444" opacity="0.5"/><text x="200" y="50" font-size="7" fill="#ef4444">Resistance rejections</text><text x="200" y="190" text-anchor="middle" font-size="8" fill="rgba(244,247,250,0.3)">Hypothetical educational example</text></svg>`,
    quiz: [
      { q: "What happens when a resistance level breaks?", options: ["It disappears", "It often becomes support (role reversal)", "It always becomes support", "Nothing changes"], correct: 1, explanation: "When resistance breaks, it often flips to become support — former sellers become buyers. This polarity is a fundamental concept, though it doesn't always happen." },
      { q: "What makes a support level more significant?", options: ["The stock's market cap", "Multiple tests over time where buyers defended the level", "Being a round number", "Being near the 200 EMA"], correct: 1, explanation: "A support level tested multiple times shows that buyers consistently appear at that price. More tests = more significance." },
      { q: "When is a support level considered broken?", options: ["When price touches it", "When price closes below it with volume", "When one wick goes below it", "When the daily chart looks bad"], correct: 1, explanation: "A wick below support isn't necessarily a break — it could be a test. A close below with volume is more definitive." }
    ],
    chartExercises: [{ id: "sr-spot-1", type: "spot_setup", title: "Find Support & Resistance", instruction: "Identify the key support and resistance levels on this chart.", chartData: SUPPORT_RESISTANCE_CHART, question: "Price has bounced off the $109.50 level three times. What does this suggest?", options: [{ label: "The level is meaningless", correct: false, explanation: "Three bounces means buyers are consistently defending this price — it's significant." }, { label: "It's a well-established support level with buying interest", correct: true, explanation: "Multiple tests of the same level where buyers step in creates a significant support zone." }, { label: "The stock can never go below $109.50", correct: false, explanation: "No level holds forever. 'Can never' doesn't exist in markets." }, { label: "You should buy as much as possible here", correct: false, explanation: "Identifying support is educational — it doesn't automatically mean you should buy." }], pansyExplanation: "Three bounces. Three times buyers said 'not here, not today.' That's support being established. But remember — every support level eventually breaks. The question is always: 'Is it holding THIS time?'" }],
    pansy: { intro: "Support and resistance are the most important concepts in chart reading. They tell you where the real decisions are being made.", duringChart: ["See how price keeps bouncing off that level? Buyers are defending it.", "Now look at the ceiling — sellers appear every time price reaches it.", "When that resistance finally breaks? Watch for it to become the new floor."], afterQuiz: ["You're reading the battlefield. Support is where buyers fight. Resistance is where sellers fight.", "No level holds forever. That's what makes risk management essential."], encouragement: "You now understand the language most traders never learn properly.", warning: "Never assume a level will hold. Always have a plan for when it doesn't." },
    toolbelt: { bestStudiedDuring: "Markets with established ranges or clear levels", lookFor: "Multiple tests of the same level with buyer/seller defense", avoid: "Assuming any level is unbreakable", confirmation: "Bounce + volume + candle pattern at the level", invalidation: "Close beyond the level with volume" }
  },

  {
    slug: "bull-bear-flag",
    name: "Bull Flag / Bear Flag",
    category: "Day Trading",
    filters: ["Day Trading", "Momentum", "Breakouts"],
    difficulty: "Intermediate",
    timeframe: "5-min to daily",
    marketConditions: "After strong impulsive moves",
    icon: "🚩",
    lessonCount: 4,
    sections: [
      { type: "overview", heading: "What Is a Flag Pattern?", content: "A flag pattern has two parts: the flagpole (a strong, sharp move) and the flag (a brief consolidation that slopes against the trend). A bull flag has an upward flagpole followed by a slight downward-sloping consolidation. A bear flag is the opposite.\n\nFlags are continuation patterns — they suggest the original momentum may resume after the pause." },
      { type: "setup", heading: "Identifying the Pattern", content: "Bull Flag:\n1. Strong upward move (flagpole) on high volume.\n2. Brief consolidation sloping slightly downward on decreasing volume.\n3. Breakout above the flag's upper trendline with volume expansion.\n\nBear Flag:\n1. Strong downward move (flagpole) on high volume.\n2. Brief consolidation sloping slightly upward on decreasing volume.\n3. Breakdown below the flag's lower trendline with volume expansion." },
      { type: "entry", heading: "Entry & Invalidation (Educational)", content: "Some traders consider entering when price breaks above the flag's upper boundary (bull) or below the lower boundary (bear) with volume.\n\nInvalidation: If the flag's opposite boundary is broken, the pattern fails. A bull flag that breaks below the flag is invalidated.\n\nHypothetical educational example only." },
      { type: "mistakes", heading: "Common Mistakes", content: "• Seeing flags everywhere — not every consolidation after a move is a flag.\n• Trading flags with no volume confirmation on the breakout.\n• Forgetting that flags can fail — that's why stops exist.\n• Confusing a deep, erratic pullback with a clean flag consolidation." },
      { type: "takeaway", heading: "Key Takeaway", content: "Flags teach you to read the pause within a trend. Strong move → quiet consolidation → continuation is one of the most recognizable patterns in markets. Study both bullish and bearish versions.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><text x="100" y="20" font-size="9" fill="#49B06E">Bull Flag</text><path d="M20,170 L60,120 L80,80 L100,50" stroke="#49B06E" stroke-width="2.5" fill="none"/><text x="55" y="45" font-size="7" fill="#F4F7FA" opacity="0.5">Flagpole</text><path d="M100,50 L120,60 L140,65 L160,70 L180,75" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="3"/><text x="140" y="85" font-size="7" fill="#F4F7FA" opacity="0.5">Flag</text><path d="M180,75 L200,55 L220,40 L240,30" stroke="#49B06E" stroke-width="2" fill="none"/><text x="200" y="25" font-size="7" fill="#49B06E">Breakout</text><text x="310" y="20" font-size="9" fill="#ef4444">Bear Flag</text><path d="M260,30 L280,60 L300,100 L320,140" stroke="#ef4444" stroke-width="2.5" fill="none"/><path d="M320,140 L340,130 L360,125 L370,120" stroke="#49B06E" stroke-width="1.5" fill="none" stroke-dasharray="3"/><path d="M370,120 L380,140 L390,160" stroke="#ef4444" stroke-width="2" fill="none"/><text x="200" y="190" text-anchor="middle" font-size="8" fill="rgba(244,247,250,0.3)">Hypothetical educational example</text></svg>`,
    quiz: [
      { q: "What does the flagpole represent?", options: ["A period of consolidation", "The strong initial impulsive move", "The breakout direction", "A reversal signal"], correct: 1, explanation: "The flagpole is the sharp, impulsive move that creates the flag pattern. It shows that strong momentum existed before the pause." },
      { q: "What should volume do during the flag (consolidation)?", options: ["Increase dramatically", "Decrease — showing the pullback is just a pause, not a reversal", "Volume doesn't matter for flags", "Match the flagpole volume"], correct: 1, explanation: "Volume should decrease during the flag portion, showing that the counter-move is just profit-taking and consolidation, not aggressive selling/buying." },
      { q: "What is the difference between a bull flag and a bear flag?", options: ["Bull flags only occur on stocks, bear flags on ETFs", "A bull flag has an upward pole + down-sloping consolidation; bear flag is the opposite", "There is no difference", "Bull flags use green candles, bear flags use red"], correct: 1, explanation: "A bull flag has an upward flagpole followed by a slight downward consolidation. A bear flag has a downward flagpole followed by a slight upward consolidation. They mirror each other." },
      { q: "When is a bull flag pattern invalidated?", options: ["When it reaches the target", "When price breaks below the flag's lower boundary", "When volume increases", "When the stock pays a dividend"], correct: 1, explanation: "A bull flag is invalidated when price breaks below the flag's lower boundary — the consolidation has turned into a reversal." }
    ],
    chartExercises: [
      { id: "bf-spot-1", type: "spot_setup", title: "Spot the Bull Flag", instruction: "Identify the flagpole, flag, and breakout on this chart.", chartData: BULL_FLAG_CHART, question: "The consolidation is on declining volume and slopes slightly down. What pattern is this?", options: [{ label: "Head and shoulders", correct: false, explanation: "This is not a head and shoulders — there's no left shoulder, head, and right shoulder structure here." }, { label: "Bull flag — a continuation pattern", correct: true, explanation: "Strong upward move (flagpole) + slight downward consolidation on declining volume = bull flag. It suggests the uptrend may continue." }, { label: "Double top reversal", correct: false, explanation: "A double top requires two peaks at similar levels followed by a break of the neckline. This structure is different." }, { label: "No recognizable pattern", correct: false, explanation: "This is a textbook bull flag — one of the most recognizable continuation patterns." }], pansyExplanation: "See how that consolidation is quiet and controlled? Volume dried up during the flag. Then BOOM — volume came back on the breakout. That's the flag pattern telling its story: strong move, rest, continue." },
      { id: "bf-spot-2", type: "spot_setup", title: "Spot the Bear Flag", instruction: "Now study a bearish version. Identify the downward flagpole and upward-sloping consolidation.", chartData: BEAR_FLAG_CHART, question: "This chart shows a downward move followed by a slight upward consolidation. What is this?", options: [{ label: "A buying opportunity", correct: false, explanation: "A bear flag is a continuation pattern for the downtrend — the slight bounce is just a pause, not a reversal." }, { label: "A bear flag — bearish continuation", correct: true, explanation: "Downward flagpole + upward-sloping consolidation on declining volume = bear flag. It suggests the downtrend may continue." }, { label: "A trend reversal to the upside", correct: false, explanation: "The small bounce during the flag portion often tricks traders into thinking it's a reversal. The declining volume tells you it's not." }, { label: "A cup and handle", correct: false, explanation: "A cup and handle has a very different structure — a rounded bottom followed by a small pullback." }], pansyExplanation: "This is the bearish mirror image. The selloff was aggressive, then volume dried up during that little bounce. That bounce isn't recovery — it's the market catching its breath before potentially continuing lower." }
    ],
    pansy: { intro: "Flags are one of the cleanest patterns you'll learn. A strong move, a quiet pause, then continuation. Let me show you both sides.", duringChart: ["That sharp move? That's the flagpole — momentum at full speed.", "Now watch the consolidation. Volume is fading. The pause is controlled.", "And there's the breakout. Volume returns. The flag told you the story before it happened."], afterQuiz: ["You can now see flags on both sides — bullish and bearish. That's balanced thinking.", "Remember: not every consolidation is a flag. The volume behavior is what separates flags from random noise."], encouragement: "You're building pattern recognition that most people only develop after years. Keep going.", warning: "Flags can fail. Always have a plan for when the pattern doesn't play out as expected." },
    toolbelt: { bestStudiedDuring: "After sharp impulsive moves on high volume", lookFor: "Strong flagpole + controlled consolidation + declining volume + breakout with volume", avoid: "Deep/erratic pullbacks masquerading as flags", confirmation: "Break of flag boundary + volume expansion", invalidation: "Break of the flag's opposite boundary" }
  },
];
