import type { IndicatorStrategy } from "./types";
import {
  EMA_TREND_CHART,
  VWAP_CHART,
  RSI_TREND_CHART,
  BOLLINGER_CHART,
  BREAKOUT_VOLUME_CHART,
} from "./chart-data";

export const INDICATOR_STRATEGIES: IndicatorStrategy[] = [
  {
    slug: "indicator-sma",
    name: "Simple Moving Average (SMA)",
    category: "Indicator Workshop",
    filters: ["Trend"],
    difficulty: "Beginner",
    timeframe: "Any",
    marketConditions: "Trending markets",
    icon: "📏",
    lessonCount: 2,
    indicatorType: "Trend / Overlay",
    whatItMeasures: "The average closing price over a set number of periods. A 20-SMA adds the last 20 closing prices and divides by 20.",
    whatItDoesNot: "It does NOT predict where price will go. It shows you where price HAS BEEN — a lagging indicator. By the time the SMA turns, the move may already be well underway.",
    commonSettings: "20-period (short-term trend), 50-period (medium-term), 200-period (long-term). Higher periods = smoother line, more lag. Lower = more responsive, more noise.",
    falseSignals: "In choppy/sideways markets, the SMA will whipsaw — price will cross above and below repeatedly, generating false signals. The SMA is designed for trending markets.",
    beginnerMistakes: "Treating SMA crosses as automatic signals. An SMA cross is an observation, not a command. Always consider market context, volume, and price action.",
    whenNotToUse: "Choppy, range-bound markets where price oscillates around the average. The more sideways the market, the more false signals the SMA produces.",
    combineWithPriceAction: "Use the SMA to identify the general trend direction, then use price action (candlestick patterns, support/resistance, volume) to time entries. The SMA says WHERE you should look — price action says WHEN.",
    sections: [
      { type: "overview", heading: "What Is the SMA?", content: "The Simple Moving Average calculates the mean closing price over a specific number of periods. A 50-day SMA adds the last 50 closing prices and divides by 50.\n\nAs each new day passes, the oldest price drops off and the newest is added. This creates a smooth line that trails behind price, showing the trend direction." },
      { type: "setup", heading: "Reading the SMA", content: "• Price above SMA → uptrend tendency.\n• Price below SMA → downtrend tendency.\n• SMA slope rising → strengthening trend.\n• SMA flattening → trend weakening or transition.\n\nThese are observations, not trade signals. Always confirm with additional analysis." },
      { type: "mistakes", heading: "The SMA Is Not a Crystal Ball", content: "The most common beginner mistake: treating the SMA as a signal generator. 'Price crossed above the 50-SMA, so I should buy' — this kind of mechanical thinking ignores context.\n\nAsk instead: Is the market trending? Is there volume confirming the move? What does the broader picture look like?" },
      { type: "takeaway", heading: "Key Takeaway", content: "The SMA smooths price data to reveal trend direction. It's a lens for seeing the trend more clearly — not a system for generating entries.\n\nIndicators should not be treated as magical signals. They are tools for organizing price information.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><path d="M30,150 L60,140 L90,130 L120,120 L150,105 L180,95 L210,85 L240,80 L270,75 L300,70 L330,68 L360,65" stroke="#F4F7FA" stroke-width="1.5" fill="none" opacity="0.5"/><path d="M30,155 L60,148 L90,140 L120,132 L150,118 L180,108 L210,98 L240,90 L270,83 L300,78 L330,74 L360,72" stroke="#27B7C8" stroke-width="2" fill="none"/><text x="365" y="62" font-size="7" fill="#F4F7FA" opacity="0.5">Price</text><text x="365" y="78" font-size="7" fill="#27B7C8">SMA</text><text x="200" y="190" text-anchor="middle" font-size="7" fill="rgba(244,247,250,0.3)">Hypothetical — SMA lags behind price</text></svg>`,
    quiz: [
      { q: "What does the SMA measure?", options: ["Future price direction", "The average of past closing prices over a set period", "Volume trends", "Volatility"], correct: 1, explanation: "The SMA calculates the arithmetic mean of closing prices over a specified lookback period. It tells you where price HAS been, not where it's going." },
      { q: "Why does the SMA produce false signals in sideways markets?", options: ["Because it's broken", "Because price repeatedly crosses above and below the average in choppy conditions", "Because sideways markets don't exist", "Because you need a faster computer"], correct: 1, explanation: "In a range-bound market, price naturally oscillates around its average. Each cross generates a 'signal' that quickly reverses — this is whipsaw." },
      { q: "What is the correct way to use the SMA?", options: ["As an automatic buy/sell signal", "As a trend direction guide, confirmed by price action and volume", "To predict exact prices", "Only for day trading"], correct: 1, explanation: "The SMA identifies trend direction. Use it as context — then confirm with price action, volume, and other analysis before making decisions." }
    ],
    chartExercises: [],
    pansy: { intro: "The SMA is like looking at a road from an airplane — it shows you the general direction, but you still need to watch the road itself.", duringChart: ["See how the SMA trails behind? That lag is the price you pay for smoothness.", "The trend is your context. Price action is your timing."], afterQuiz: ["You understand that the SMA is a lens, not a crystal ball. That's the right mindset."], encouragement: "Every indicator is a tool, not a system. You're learning to use them wisely.", warning: "Never trade solely on SMA signals. They lag. They whipsaw. They need context." },
    toolbelt: { bestStudiedDuring: "When identifying trend direction on any timeframe", lookFor: "Price consistently above/below SMA, SMA sloping in trend direction", avoid: "Choppy sideways markets, treating crosses as automatic signals", confirmation: "Trend direction confirmed by price action and volume", invalidation: "Repeated whipsaw — market is likely range-bound, SMA is unreliable here" }
  },

  {
    slug: "indicator-ema",
    name: "Exponential Moving Average (EMA)",
    category: "Indicator Workshop",
    filters: ["Trend"],
    difficulty: "Beginner",
    timeframe: "Any",
    marketConditions: "Trending markets",
    icon: "⚡",
    lessonCount: 2,
    indicatorType: "Trend / Overlay",
    whatItMeasures: "A weighted moving average that gives more weight to recent prices. Reacts faster to price changes than the SMA.",
    whatItDoesNot: "It does NOT predict future price. It's faster than SMA but also more prone to reacting to noise. Speed is not the same as accuracy.",
    commonSettings: "9 EMA (very short-term), 20 EMA (short-term), 50 EMA (medium), 200 EMA (long-term). Shorter = faster reaction, more noise.",
    falseSignals: "Same as SMA but more frequent in choppy markets because the EMA reacts faster. More sensitivity = more whipsaw.",
    beginnerMistakes: "Using the EMA on very short timeframes and treating every cross as a signal. On a 1-minute chart, the EMA will cross dozens of times — most are meaningless.",
    whenNotToUse: "Choppy, low-volume markets. The EMA's speed becomes a liability when there's no real trend to track.",
    combineWithPriceAction: "Use the EMA to identify short-term trend direction. Look for price action setups (engulfing candles, pin bars) that align with the EMA trend. The EMA says the trend — price action says the moment.",
    sections: [
      { type: "overview", heading: "EMA vs SMA", content: "The EMA uses an exponential weighting formula that emphasizes recent prices. If the last few days had big moves, the EMA reflects that faster than the SMA.\n\nTrade-off: faster reaction to real moves, but also faster reaction to noise." },
      { type: "setup", heading: "Reading the EMA", content: "• Price above EMA → short-term bullish bias.\n• Price below EMA → short-term bearish bias.\n• EMA slope tells you momentum direction.\n• Multiple EMAs (9, 20, 50) can show trend layers.\n\nThese are context clues, not trade commands." },
      { type: "takeaway", heading: "Key Takeaway", content: "The EMA is a faster-reacting version of the SMA. Speed is useful in trends but dangerous in chop. Choose the right tool for the market condition.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><path d="M30,150 L60,140 L90,125 L120,115 L150,100 L180,90 L210,82 L240,78 L270,72 L300,68 L330,64 L360,60" stroke="#F4F7FA" stroke-width="1.5" fill="none" opacity="0.5"/><path d="M30,152 L60,138 L90,122 L120,110 L150,97 L180,88 L210,80 L240,76 L270,70 L300,67 L330,63 L360,59" stroke="#49B06E" stroke-width="2" fill="none"/><path d="M30,155 L60,148 L90,138 L120,128 L150,112 L180,100 L210,92 L240,85 L270,79 L300,74 L330,70 L360,68" stroke="#27B7C8" stroke-width="1.5" fill="none" stroke-dasharray="4"/><text x="365" y="56" font-size="7" fill="#49B06E">EMA</text><text x="365" y="72" font-size="7" fill="#27B7C8">SMA</text><text x="200" y="190" text-anchor="middle" font-size="7" fill="rgba(244,247,250,0.3)">EMA reacts faster than SMA</text></svg>`,
    quiz: [
      { q: "How does the EMA differ from the SMA?", options: ["It uses volume data", "It gives more weight to recent prices, reacting faster", "It predicts future price", "It's always more accurate"], correct: 1, explanation: "The EMA applies exponential weighting so recent prices influence the average more. This makes it react faster — but not necessarily more accurately." },
      { q: "Is faster always better for a moving average?", options: ["Yes, always", "No — faster reaction also means more sensitivity to noise and false signals", "It depends on your computer speed", "Speed doesn't matter"], correct: 1, explanation: "A faster moving average reacts to real moves sooner, but also reacts to random noise sooner. In choppy markets, a faster MA produces more false signals." },
      { q: "What is the best way to combine the EMA with trading?", options: ["Buy every time price crosses above", "Use it for trend context and confirm with price action", "Only use it on 1-minute charts", "Ignore it completely"], correct: 1, explanation: "The EMA gives you trend direction context. Use price action, volume, and support/resistance to actually time entries within that trend." }
    ],
    chartExercises: [{ id: "ema-1", type: "spot_setup", title: "EMA Trend Reading", instruction: "Observe how the EMA trails price. Notice the relationship between price position relative to the EMA and trend direction.", chartData: EMA_TREND_CHART, question: "When price is consistently above a rising EMA, what does that suggest?", options: [{ label: "The EMA is broken", correct: false, explanation: "Price above a rising EMA is exactly what a healthy uptrend looks like through this lens." }, { label: "Short-term uptrend tendency — price is above its recent average", correct: true, explanation: "Price staying above a rising EMA is a contextual sign of uptrend. It's not a buy signal — it's trend context." }, { label: "You should buy immediately", correct: false, explanation: "The EMA shows trend direction, not entry timing. You need price action confirmation." }, { label: "The market is about to crash", correct: false, explanation: "A price above a rising EMA shows current strength, not an impending reversal." }], pansyExplanation: "The EMA is like a compass — it tells you which direction you're heading. But a compass doesn't tell you when to take each step. That's price action's job." }],
    pansy: { intro: "Think of the EMA as a speed-tuned version of the SMA. Same concept, faster reaction. But speed without wisdom is just chaos.", duringChart: ["Notice how the EMA hugs price more closely? That's the speed advantage.", "But watch in choppy areas — that speed becomes noise sensitivity."], afterQuiz: ["You know when speed helps and when it hurts. That's indicator literacy."], encouragement: "You're learning to match the tool to the market condition. That's the real skill.", warning: "A fast EMA on a short timeframe is a noise amplifier, not a signal generator." },
    toolbelt: { bestStudiedDuring: "When you need faster trend detection than SMA", lookFor: "Price above/below EMA in a clear trend, EMA slope matching direction", avoid: "Choppy markets where speed amplifies noise", confirmation: "EMA direction confirmed by price action and volume", invalidation: "Repeated whipsaw — EMA speed is creating false readings" }
  },

  {
    slug: "indicator-vwap",
    name: "Volume-Weighted Average Price (VWAP)",
    category: "Indicator Workshop",
    filters: ["Day Trading", "Trend"],
    difficulty: "Intermediate",
    timeframe: "Intraday",
    marketConditions: "Active trading sessions",
    icon: "📊",
    lessonCount: 2,
    indicatorType: "Trend / Overlay",
    whatItMeasures: "The average price weighted by volume throughout the trading day. Where price has traded with the most volume — the 'fair value' consensus for the day.",
    whatItDoesNot: "It does NOT predict future price. It does NOT work on daily/weekly charts (it resets every day). It does NOT tell you when to enter or exit — it tells you where the volume-weighted average sits.",
    commonSettings: "VWAP is calculated from the session open with no customizable period. Some traders use VWAP bands (standard deviations above/below VWAP).",
    falseSignals: "VWAP becomes less useful near the end of the day as it stabilizes. In the first 15-30 minutes, VWAP is very volatile and can give misleading readings.",
    beginnerMistakes: "Thinking VWAP is a support/resistance level. VWAP shows average price — it's not a wall. Price can slice through it without hesitation.",
    whenNotToUse: "After-hours, pre-market, or on daily/weekly charts. VWAP is a single-session indicator.",
    combineWithPriceAction: "Use VWAP to understand where the day's volume-weighted average sits. If price is above VWAP, intraday bias is bullish. Then use candlestick patterns and volume at specific levels to time entries.",
    sections: [
      { type: "overview", heading: "What Is VWAP?", content: "VWAP calculates the cumulative average price weighted by volume from market open. It answers: 'If every share traded today were bought at the average price, what would that price be?'\n\nInstitutional traders often benchmark their executions against VWAP. Getting filled near VWAP means you got 'fair' relative to the day's average." },
      { type: "setup", heading: "Reading VWAP", content: "• Price above VWAP → buyers have been in control (so far today).\n• Price below VWAP → sellers have been in control (so far today).\n• Price at VWAP → equilibrium.\n\nVWAP tells you the intraday bias. It does NOT predict what happens next." },
      { type: "takeaway", heading: "Key Takeaway", content: "VWAP is the volume-weighted consensus price for the day. It's context, not a signal. Think of it as a 'fairness gauge' for intraday price.\n\nVWAP is an intraday indicator only. Do not apply it to daily or weekly charts.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><path d="M30,100 L60,95 L90,105 L120,98 L150,85 L180,80 L210,75 L240,72 L270,70 L300,68 L330,67 L360,66" stroke="#F4F7FA" stroke-width="1.5" fill="none" opacity="0.5"/><path d="M30,105 L60,100 L90,98 L120,95 L150,90 L180,85 L210,82 L240,78 L270,75 L300,73 L330,72 L360,71" stroke="#FFD700" stroke-width="2" fill="none"/><text x="365" y="63" font-size="7" fill="#F4F7FA" opacity="0.5">Price</text><text x="365" y="74" font-size="7" fill="#FFD700">VWAP</text><text x="200" y="190" text-anchor="middle" font-size="7" fill="rgba(244,247,250,0.3)">VWAP shows the volume-weighted average price</text></svg>`,
    quiz: [
      { q: "What does VWAP measure?", options: ["Future price targets", "The volume-weighted average price since market open", "The highest price of the day", "Total volume traded"], correct: 1, explanation: "VWAP is the cumulative volume-weighted average price. It shows where the day's average trade has occurred." },
      { q: "Can VWAP be used on daily or weekly charts?", options: ["Yes, it works everywhere", "No — VWAP resets at each session open and is an intraday-only indicator", "Only on weekends", "Only on monthly charts"], correct: 1, explanation: "VWAP is calculated from the current session's open. It resets each day and has no meaning on multi-day charts." },
      { q: "Is VWAP a support or resistance level?", options: ["Yes, price always bounces off VWAP", "No — VWAP shows average price, not a price wall. Price can easily move through it", "It's always support", "It's always resistance"], correct: 1, explanation: "VWAP is an average, not a barrier. Price can and does move through VWAP. Treating it as an automatic support/resistance level is a beginner mistake." }
    ],
    chartExercises: [{ id: "vwap-1", type: "spot_setup", title: "VWAP Context", instruction: "Observe the price action relative to the VWAP line. Notice how price interacts with the day's volume-weighted average.", chartData: VWAP_CHART, question: "When price is consistently above VWAP throughout the session, what does that tell you?", options: [{ label: "The stock will keep going up", correct: false, explanation: "VWAP tells you about the current session's bias, not future direction." }, { label: "Buyers have been stronger than sellers so far today — intraday bullish bias", correct: true, explanation: "Price above VWAP means most volume traded at lower prices. Current buyers are paying above the day's average." }, { label: "VWAP is broken", correct: false, explanation: "Price above VWAP is normal — it happens in bullish sessions." }, { label: "You should sell immediately", correct: false, explanation: "VWAP doesn't tell you to buy or sell. It gives context about the day's price action." }], pansyExplanation: "VWAP is like a score — it tells you who's winning so far today. But today's score doesn't guarantee tomorrow's result." }],
    pansy: { intro: "VWAP is the market's report card for the day. It tells you whether buyers or sellers have been in control — so far.", duringChart: ["Price above VWAP? Buyers are winning today's session.", "But remember — VWAP is today's story. Tomorrow starts fresh."], afterQuiz: ["You understand VWAP as context, not a crystal ball. That's the right way to use it."], encouragement: "Understanding the difference between 'indicator' and 'signal' is a superpower.", warning: "VWAP is meaningless on timeframes longer than one session. Don't apply it to daily charts." },
    toolbelt: { bestStudiedDuring: "Intraday trading sessions with active volume", lookFor: "Price position relative to VWAP for intraday bias", avoid: "Using VWAP on daily/weekly charts, treating it as support/resistance", confirmation: "Intraday trend aligns with VWAP direction", invalidation: "End of day (VWAP stabilizes), low volume sessions" }
  },

  {
    slug: "indicator-rsi",
    name: "Relative Strength Index (RSI)",
    category: "Indicator Workshop",
    filters: ["Momentum", "Mean Reversion"],
    difficulty: "Intermediate",
    timeframe: "Any",
    marketConditions: "Both trending and range-bound (interpreted differently)",
    icon: "🔄",
    lessonCount: 3,
    indicatorType: "Momentum / Oscillator",
    whatItMeasures: "The speed and magnitude of recent price changes on a 0-100 scale. It measures momentum — how fast price is moving relative to recent history.",
    whatItDoesNot: "It does NOT tell you direction. It does NOT mean 'overbought = sell' or 'oversold = buy'. In a strong trend, RSI can stay overbought/oversold for extended periods.",
    commonSettings: "14-period (standard). 70+ considered overbought, 30- considered oversold. Some use 80/20 for stronger signals.",
    falseSignals: "In strong uptrends, RSI can remain above 70 for weeks. Selling because RSI is 'overbought' in a strong trend is a classic mistake. Similarly, buying 'oversold' in a downtrend catches falling knives.",
    beginnerMistakes: "The #1 mistake: treating overbought/oversold as buy/sell signals. RSI 70 in a strong uptrend means 'strong momentum' — not 'time to sell.' Context matters everything.",
    whenNotToUse: "As a standalone signal in any market. RSI needs context — trend direction, support/resistance, volume, price action.",
    combineWithPriceAction: "In range-bound markets, RSI extremes can highlight potential reversal zones — but confirm with price action (rejection candles, volume spikes). In trending markets, use RSI pullbacks (RSI dipping to 40-50 in an uptrend) as potential continuation zones.",
    sections: [
      { type: "overview", heading: "What Is RSI?", content: "RSI compares the magnitude of recent gains to recent losses over a specified period (usually 14). The result is a number between 0 and 100.\n\nAbove 70: strong recent gains (overbought zone).\nBelow 30: strong recent losses (oversold zone).\n\nCritical: overbought does NOT mean 'too high' and oversold does NOT mean 'too low.' They describe momentum, not value." },
      { type: "why", heading: "The Overbought/Oversold Trap", content: "The most dangerous RSI mistake: 'RSI is at 75, the stock is overbought, I should sell.'\n\nIn a strong uptrend, RSI can stay above 70 for weeks while the price continues rising. Similarly, in a strong downtrend, RSI can stay below 30 for extended periods while price keeps falling.\n\nOverbought = strong momentum. It can stay strong." },
      { type: "setup", heading: "How to Actually Read RSI", content: "In trending markets:\n• RSI staying above 40 = bullish momentum intact.\n• RSI dipping to 40-50 and bouncing = healthy pullback.\n• RSI breaking below 40 = momentum fading.\n\nIn range-bound markets:\n• RSI at extremes (70+/30-) at known support/resistance = potential reversal zone.\n• But ALWAYS confirm with price action." },
      { type: "visual", heading: "RSI Divergence (Advanced)", content: "Sometimes price makes a new high, but RSI makes a lower high. This is called bearish divergence — momentum is weakening even though price is still rising.\n\nDivergence is an early warning, NOT a signal. Many divergences resolve without a reversal. It tells you to pay attention, not to act immediately." },
      { type: "takeaway", heading: "Key Takeaway", content: "RSI measures momentum speed, not direction or value. Treat overbought/oversold as momentum descriptions, not trade signals. Context determines meaning.\n\nIndicators should not be treated as magical signals.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#0E1B30"/><line x1="30" y1="50" x2="370" y2="50" stroke="#ef4444" stroke-width="1" opacity="0.3"/><text x="375" y="53" font-size="7" fill="#ef4444" opacity="0.5">70</text><line x1="30" y1="110" x2="370" y2="110" stroke="#F4F7FA" stroke-width="0.5" opacity="0.2"/><text x="375" y="113" font-size="7" fill="#F4F7FA" opacity="0.3">50</text><line x1="30" y1="170" x2="370" y2="170" stroke="#49B06E" stroke-width="1" opacity="0.3"/><text x="375" y="173" font-size="7" fill="#49B06E" opacity="0.5">30</text><path d="M30,110 L60,90 L90,60 L120,45 L150,55 L180,70 L210,85 L240,75 L270,55 L300,65 L330,90 L360,100" stroke="#27B7C8" stroke-width="2" fill="none"/><rect x="80" y="35" width="80" height="15" fill="#ef4444" opacity="0.1" rx="2"/><text x="120" y="45" text-anchor="middle" font-size="7" fill="#ef4444" opacity="0.5">Overbought zone</text><rect x="270" y="155" width="80" height="25" fill="#49B06E" opacity="0.1" rx="2"/><text x="310" y="170" text-anchor="middle" font-size="7" fill="#49B06E" opacity="0.5">Oversold zone</text><text x="200" y="210" text-anchor="middle" font-size="7" fill="rgba(244,247,250,0.3)">Overbought ≠ sell. Oversold ≠ buy.</text></svg>`,
    quiz: [
      { q: "RSI is at 75. What should you do?", options: ["Sell immediately — it's overbought", "Nothing based on RSI alone — overbought means strong momentum, not 'too high'", "Buy more — high RSI means it'll go higher", "The RSI is broken"], correct: 1, explanation: "Overbought means strong upward momentum, not 'time to sell.' In strong trends, RSI can stay above 70 for extended periods while price continues rising." },
      { q: "When is RSI most useful as an overbought/oversold indicator?", options: ["In strong trends", "In range-bound markets, combined with support/resistance and price action confirmation", "Always, on any chart", "Never — RSI is useless"], correct: 1, explanation: "In range-bound markets, RSI extremes at known support/resistance levels can highlight potential reversal zones. But even then, price action confirmation is essential." },
      { q: "What does RSI divergence mean?", options: ["The indicator is broken", "Momentum is weakening — an early warning to pay attention, NOT an automatic signal", "Price will definitely reverse", "You should sell immediately"], correct: 1, explanation: "Divergence means price and momentum are disagreeing. It's an early warning that current momentum may be fading — but many divergences resolve without a reversal." }
    ],
    chartExercises: [{ id: "rsi-1", type: "spot_setup", title: "RSI in Context", instruction: "Study the price action and consider what RSI might show. Remember: RSI measures momentum speed, not direction.", chartData: RSI_TREND_CHART, question: "In a strong uptrend, RSI stays above 50 and occasionally touches 70+. What does this mean?", options: [{ label: "The stock is dangerously overvalued", correct: false, explanation: "RSI measures momentum speed, not valuation. It doesn't tell you if a stock is overvalued." }, { label: "Strong bullish momentum — the trend is intact", correct: true, explanation: "RSI staying above 50 with periodic pushes above 70 shows healthy, strong upward momentum. This is what a trend looks like through the RSI lens." }, { label: "You should sell at every RSI 70 reading", correct: false, explanation: "Selling at RSI 70 in a strong uptrend means selling into strength — you'd miss the entire trend." }, { label: "RSI doesn't work in trends", correct: false, explanation: "RSI works in trends — you just read it differently. Above 40 = momentum intact. Dips to 40-50 = pullback, not reversal." }], pansyExplanation: "In a trend, RSI above 50 means momentum is still with the bulls. Those dips to 40-50? That's the trend taking a breath. The trend dies when RSI breaks below 40 — that's when you reassess." }],
    pansy: { intro: "RSI is the most misunderstood indicator in all of trading. Let me save you from the biggest trap beginners fall into.", duringChart: ["See RSI at 70? Most beginners panic. But in a trend, that's just momentum being strong.", "Watch for RSI staying above 50 — that's the real signal of trend health."], afterQuiz: ["You now understand RSI better than most traders who've been at it for years. Seriously.", "The overbought/oversold trap has cost people real money. You just avoided it."], encouragement: "You've learned the most important RSI lesson: context matters more than the number.", warning: "RSI 70 in a strong uptrend is NOT a sell signal. RSI 30 in a strong downtrend is NOT a buy signal." },
    toolbelt: { bestStudiedDuring: "Any timeframe — but interpretation depends on market condition", lookFor: "RSI staying above 50 in uptrends, below 50 in downtrends. Divergences as early warnings.", avoid: "Mechanical overbought/oversold trading without context", confirmation: "RSI direction aligns with price trend and volume", invalidation: "RSI breaks below 40 in an uptrend (momentum fading) or above 60 in a downtrend" }
  },

  {
    slug: "indicator-macd",
    name: "MACD (Moving Average Convergence Divergence)",
    category: "Indicator Workshop",
    filters: ["Trend", "Momentum"],
    difficulty: "Intermediate",
    timeframe: "Any",
    marketConditions: "Trending markets",
    icon: "📈",
    lessonCount: 2,
    indicatorType: "Trend / Momentum",
    whatItMeasures: "The relationship between two EMAs (typically 12 and 26 period). When the faster EMA pulls away from the slower one, momentum is building. When they converge, momentum is fading.",
    whatItDoesNot: "It does NOT predict reversals. MACD crossovers lag behind price — by the time the MACD crosses, the move may already be well underway or finishing.",
    commonSettings: "12, 26, 9 (standard). The MACD line = 12 EMA - 26 EMA. Signal line = 9 EMA of the MACD line. Histogram = MACD - Signal.",
    falseSignals: "In choppy markets, MACD crosses back and forth repeatedly — classic whipsaw. The MACD was designed for trending conditions.",
    beginnerMistakes: "Blindly following MACD crossovers. A MACD cross is the LAST thing to confirm a move, not the first. If you wait for the MACD, you're late.",
    whenNotToUse: "Choppy, sideways markets. Low-volatility environments where the two EMAs barely diverge.",
    combineWithPriceAction: "Use the MACD histogram to gauge momentum strength. Look for price action setups that align with MACD momentum direction. The histogram shrinking can be an early warning of momentum loss.",
    sections: [
      { type: "overview", heading: "How MACD Works", content: "MACD tracks the difference between a fast EMA (12) and a slow EMA (26).\n\n• When the 12 EMA is above the 26 EMA → MACD is positive → bullish momentum.\n• When the 12 EMA is below the 26 EMA → MACD is negative → bearish momentum.\n• The histogram shows the gap between MACD and its signal line — growing histogram = strengthening momentum." },
      { type: "mistakes", heading: "The Crossover Trap", content: "MACD crossovers are the most popular signal — and one of the most misused. By the time the slow MACD crosses, the move has already happened.\n\nThe histogram is more useful than the crossover. A shrinking histogram warns you momentum is fading BEFORE the crossover occurs." },
      { type: "takeaway", heading: "Key Takeaway", content: "MACD shows momentum direction and strength through the relationship between two moving averages. Use the histogram for early momentum reading, not just crossovers.\n\nIndicators should not be treated as magical signals.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><line x1="30" y1="100" x2="370" y2="100" stroke="#F4F7FA" stroke-width="0.5" opacity="0.2"/><text x="25" y="103" font-size="7" fill="#F4F7FA" opacity="0.3">0</text><path d="M30,110 L60,105 L90,95 L120,80 L150,70 L180,65 L210,72 L240,80 L270,90 L300,95 L330,102 L360,108" stroke="#27B7C8" stroke-width="2" fill="none"/><text x="365" y="111" font-size="7" fill="#27B7C8">MACD</text><path d="M30,108 L60,106 L90,100 L120,90 L150,78 L180,72 L210,70 L240,75 L270,85 L300,92 L330,98 L360,105" stroke="#ef4444" stroke-width="1.5" fill="none" stroke-dasharray="4"/><text x="365" y="102" font-size="7" fill="#ef4444">Signal</text><rect x="117" y="80" width="8" height="10" fill="#49B06E" opacity="0.5" rx="1"/><rect x="147" y="70" width="8" height="8" fill="#49B06E" opacity="0.5" rx="1"/><rect x="177" y="65" width="8" height="7" fill="#49B06E" opacity="0.5" rx="1"/><rect x="207" y="70" width="8" height="2" fill="#49B06E" opacity="0.3" rx="1"/><rect x="237" y="75" width="8" height="5" fill="#ef4444" opacity="0.3" rx="1"/><text x="200" y="190" text-anchor="middle" font-size="7" fill="rgba(244,247,250,0.3)">MACD histogram shrinking = momentum fading</text></svg>`,
    quiz: [
      { q: "What does the MACD histogram show?", options: ["Volume", "The difference between the MACD line and the signal line — momentum strength", "The stock price", "Support and resistance"], correct: 1, explanation: "The histogram shows how far apart the MACD and signal lines are. Growing histogram = strengthening momentum. Shrinking histogram = weakening momentum." },
      { q: "Why are MACD crossovers often late?", options: ["Because MACD uses past data", "Because MACD is based on moving averages, which lag price — the move is often well underway by the time they cross", "Because MACD is broken", "They're always early, not late"], correct: 1, explanation: "MACD is built from two EMAs, both of which lag price. When they cross, the move has already been developing. The histogram gives earlier warning." }
    ],
    chartExercises: [],
    pansy: { intro: "MACD crossovers are the most clicked indicator signal in the world. They're also one of the most misleading. Let me show you why.", duringChart: ["Watch the histogram, not just the crossover. It tells you the story sooner.", "A shrinking histogram is whispering that momentum is fading."], afterQuiz: ["You understand that MACD is about momentum, not prediction. That puts you ahead."], encouragement: "Most traders stare at the crossover line. You're learning to read the histogram. That's the edge.", warning: "MACD crossovers in choppy markets will empty your account. Trend first, MACD second." },
    toolbelt: { bestStudiedDuring: "Trending markets where you want to gauge momentum", lookFor: "MACD histogram direction, growing/shrinking momentum", avoid: "Choppy markets, using crossovers as standalone signals", confirmation: "MACD and histogram align with price trend direction", invalidation: "Histogram shrinking while price makes new highs/lows (potential divergence)" }
  },

  {
    slug: "indicator-bollinger-bands",
    name: "Bollinger Bands",
    category: "Indicator Workshop",
    filters: ["Mean Reversion", "Momentum"],
    difficulty: "Intermediate",
    timeframe: "Any",
    marketConditions: "Both trending and range-bound (interpreted differently)",
    icon: "🎯",
    lessonCount: 2,
    indicatorType: "Volatility / Overlay",
    whatItMeasures: "Volatility — how much price is varying from its average. The bands expand when volatility increases and contract when it decreases.",
    whatItDoesNot: "It does NOT tell you which direction price will go. Touching the upper band does NOT mean 'sell.' Touching the lower band does NOT mean 'buy.' In a trend, price can ride a band for extended periods.",
    commonSettings: "20-period SMA with 2 standard deviations. Upper band = SMA + 2σ. Lower band = SMA - 2σ. Approximately 95% of price action falls within the bands.",
    falseSignals: "In strong trends, price can 'walk the band' — staying at or beyond the upper band in an uptrend. Fading this move (selling because price is at the upper band) is a classic mistake.",
    beginnerMistakes: "Treating the bands as automatic buy/sell zones. 'Price touched the upper band so I should sell' — this is wrong in a trend. Bollinger Bands describe volatility, not entry points.",
    whenNotToUse: "As a standalone signal in any market condition. Always combine with price action and trend context.",
    combineWithPriceAction: "In range-bound markets, band touches combined with rejection candles (pin bars, engulfing) at support/resistance can highlight potential reversal zones. In trending markets, the band squeeze (contracting bands) can signal that a big move is coming — but not which direction.",
    sections: [
      { type: "overview", heading: "What Are Bollinger Bands?", content: "Bollinger Bands place a channel around a moving average based on standard deviation.\n\n• Upper band = 20 SMA + 2 standard deviations.\n• Lower band = 20 SMA - 2 standard deviations.\n• Middle line = 20 SMA.\n\nThe bands are dynamic — they expand and contract based on how volatile price has been recently." },
      { type: "setup", heading: "The Squeeze", content: "When Bollinger Bands contract tightly (the 'squeeze'), it means volatility has compressed. Historically, periods of low volatility are followed by periods of high volatility.\n\nA squeeze signals that a big move is coming — but it does NOT tell you which direction. You need other tools to determine direction." },
      { type: "takeaway", heading: "Key Takeaway", content: "Bollinger Bands measure volatility, not direction. They tell you when the market is calm (squeeze) or wild (expansion). Combine with price action for context.\n\nBand touches are NOT buy/sell signals.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><path d="M30,60 L90,65 L150,70 L180,30 L210,25 L240,35 L300,50 L360,55" stroke="#27B7C8" stroke-width="1" fill="none" opacity="0.4"/><path d="M30,100 L90,100 L150,100 L180,80 L210,75 L240,82 L300,90 L360,92" stroke="#F4F7FA" stroke-width="1" fill="none" opacity="0.3" stroke-dasharray="4"/><path d="M30,140 L90,135 L150,130 L180,130 L210,125 L240,130 L300,130 L360,130" stroke="#27B7C8" stroke-width="1" fill="none" opacity="0.4"/><rect x="120" y="68" width="40" height="65" fill="#FFD700" opacity="0.05" rx="2"/><text x="140" y="105" text-anchor="middle" font-size="7" fill="#FFD700" opacity="0.5">Squeeze</text><path d="M30,95 L60,92 L90,98 L120,96 L150,93 L180,60 L210,50 L240,55 L270,65 L300,70 L330,75 L360,78" stroke="#F4F7FA" stroke-width="1.5" fill="none" opacity="0.6"/><text x="200" y="190" text-anchor="middle" font-size="7" fill="rgba(244,247,250,0.3)">Squeeze → expansion. Direction requires other analysis.</text></svg>`,
    quiz: [
      { q: "Price touches the upper Bollinger Band. What should you do?", options: ["Sell immediately", "Nothing based on the band touch alone — in a trend, price can ride the upper band", "Buy more", "The indicator is broken"], correct: 1, explanation: "Touching the upper band just means price is at the high end of recent volatility. In a strong uptrend, price routinely rides the upper band for extended periods." },
      { q: "What does a Bollinger Band squeeze indicate?", options: ["The market is about to crash", "Volatility has compressed — a bigger move may follow, but direction is unknown", "You should buy", "The indicator is resetting"], correct: 1, explanation: "A squeeze means volatility has contracted. Low volatility periods tend to precede high volatility periods — but the squeeze doesn't predict direction." },
      { q: "What do Bollinger Bands actually measure?", options: ["Support and resistance", "Volatility — how much price deviates from its average", "Volume", "Earnings growth"], correct: 1, explanation: "Bollinger Bands measure volatility using standard deviation. They show you how volatile price has been, not where it's going." }
    ],
    chartExercises: [{ id: "bb-1", type: "spot_setup", title: "Bollinger Band Volatility", instruction: "Study the price movement within the Bollinger Bands. Notice how the bands expand and contract with volatility.", chartData: BOLLINGER_CHART, question: "If you see Bollinger Bands tightly contracted followed by a sharp expansion upward, what can you conclude?", options: [{ label: "The uptrend will continue forever", correct: false, explanation: "Nothing continues forever. The expansion shows increased volatility with an upward bias — but that can reverse." }, { label: "A period of low volatility resolved into a higher-volatility move upward", correct: true, explanation: "The squeeze resolved to the upside this time. But squeezes can break in either direction — you can't predict it from the bands alone." }, { label: "Bollinger Bands predicted the move", correct: false, explanation: "The bands showed low volatility and then high volatility. They didn't predict direction — the breakout direction came from price action and market context." }, { label: "You should short the stock", correct: false, explanation: "The expansion was upward, and shorting into an upward breakout goes against the observed momentum." }], pansyExplanation: "The squeeze told you SOMETHING was going to happen. Price action told you WHAT happened. That's how indicators and price action work together — the indicator alerts you, price action guides you." }],
    pansy: { intro: "Bollinger Bands are a volatility map. They don't tell you where to go — they tell you when the road is about to get bumpy.", duringChart: ["See those narrow bands? That's the calm before the storm. The storm is coming — but from which direction?", "The bands expand with the move. Volatility feeds on itself."], afterQuiz: ["You know Bollinger Bands measure volatility, not direction. That's the insight that most miss."], encouragement: "You understand what an indicator actually measures vs what people wish it measured. That's real skill.", warning: "Never trade a band touch as a signal. In trends, price walks the band. In ranges, you need price action confirmation." },
    toolbelt: { bestStudiedDuring: "When assessing market volatility or watching for squeeze breakouts", lookFor: "Band width changes, squeeze formations, price action at bands combined with S/R", avoid: "Fading band touches in trends, using bands as automatic buy/sell zones", confirmation: "Squeeze breakout direction confirmed by volume and price action", invalidation: "False breakout — price reverses after initial squeeze break" }
  },

  {
    slug: "indicator-atr",
    name: "Average True Range (ATR)",
    category: "Indicator Workshop",
    filters: ["Risk Management"],
    difficulty: "Intermediate",
    timeframe: "Any",
    marketConditions: "All — risk management tool",
    icon: "📐",
    lessonCount: 2,
    indicatorType: "Volatility",
    whatItMeasures: "The average range (high-low) of price movement over a period. ATR tells you HOW MUCH a stock typically moves — its volatility in dollar terms.",
    whatItDoesNot: "It does NOT tell you direction. ATR = 2.50 means the stock moves about $2.50 per period on average. It says nothing about whether that movement is up or down.",
    commonSettings: "14-period (standard). Higher ATR = more volatile stock. Lower ATR = calmer stock. ATR changes over time as volatility shifts.",
    falseSignals: "ATR doesn't generate signals — it's a measurement tool. But using a fixed dollar stop on a high-ATR stock is a common mistake (the stop is too tight relative to normal movement).",
    beginnerMistakes: "Setting stop losses without considering ATR. If a stock has an ATR of $3 and your stop is $1 away, you're almost certainly getting stopped out by normal price movement.",
    whenNotToUse: "As a directional indicator — it's not one. ATR is purely a volatility measurement for risk management.",
    combineWithPriceAction: "Use ATR to set appropriate stop distances. A common approach: stop = entry ± 1.5-2x ATR. This accounts for normal price movement and reduces being stopped out by noise.",
    sections: [
      { type: "overview", heading: "What Is ATR?", content: "ATR calculates the average range of price movement (high-to-low, including gaps) over a specified period.\n\nIf a stock's 14-period ATR is $3.00, that means it has averaged $3.00 of movement per bar over the last 14 periods. This is invaluable for position sizing and stop placement." },
      { type: "setup", heading: "ATR for Risk Management", content: "ATR helps you answer crucial questions:\n\n• How much does this stock normally move? (Is my stop appropriate?)\n• How much risk am I taking in dollar terms?\n• Is this stock too volatile for my account size?\n\n(Hypothetical example) If ATR = $2.00:\n• A stop 2x ATR away = $4.00 from entry.\n• On 100 shares, that's $400 risk per trade.\n• Adjust share count to match your risk tolerance." },
      { type: "takeaway", heading: "Key Takeaway", content: "ATR is a risk management tool, not a signal generator. Use it to size stops appropriately and understand the volatility of what you're studying.\n\nThis is a hypothetical educational example for studying risk concepts.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="20" text-anchor="middle" font-size="9" fill="#F4F7FA">ATR = Average Daily Range</text><rect x="60" y="50" width="30" height="80" fill="#ef4444" opacity="0.2" rx="3"/><text x="75" y="95" text-anchor="middle" font-size="7" fill="#ef4444">ATR $5</text><text x="75" y="45" text-anchor="middle" font-size="7" fill="#ef4444">Wide</text><rect x="160" y="60" width="30" height="60" fill="#FFD700" opacity="0.2" rx="3"/><text x="175" y="95" text-anchor="middle" font-size="7" fill="#FFD700">ATR $3</text><text x="175" y="55" text-anchor="middle" font-size="7" fill="#FFD700">Medium</text><rect x="260" y="75" width="30" height="30" fill="#49B06E" opacity="0.2" rx="3"/><text x="275" y="95" text-anchor="middle" font-size="7" fill="#49B06E">ATR $1</text><text x="275" y="70" text-anchor="middle" font-size="7" fill="#49B06E">Tight</text><text x="200" y="155" text-anchor="middle" font-size="8" fill="#F4F7FA" opacity="0.6">Your stop must account for normal ATR movement</text><text x="200" y="185" text-anchor="middle" font-size="7" fill="rgba(244,247,250,0.3)">Hypothetical educational example</text></svg>`,
    quiz: [
      { q: "A stock has an ATR of $4.00. You place a stop $1.50 from your entry. What is likely to happen?", options: ["The stop will work perfectly", "You'll likely get stopped out by normal price movement — the stop is less than half the average range", "ATR doesn't matter for stops", "The stock will only move $1.50"], correct: 1, explanation: "If a stock normally moves $4 per period, a $1.50 stop is well within normal fluctuation. You'll get stopped out by noise, not by a meaningful price move against you." },
      { q: "What does ATR measure?", options: ["Price direction", "The average range of price movement over a period — volatility in dollar terms", "Volume", "The strength of a trend"], correct: 1, explanation: "ATR measures average price range per period. It tells you how much a stock typically moves, which is essential for risk management and stop placement." }
    ],
    chartExercises: [],
    pansy: { intro: "ATR is one of the most underrated tools in trading. It doesn't tell you where to go — it tells you how bumpy the road is. And that's crucial for your seatbelt (stop loss).", duringChart: [], afterQuiz: ["You understand that risk management starts with knowing how much a stock moves. That's foundational."], encouragement: "Most beginners skip ATR because it's not exciting. But surviving long enough to learn IS the game.", warning: "A stop inside normal ATR range is a stop that will get hit by noise." },
    toolbelt: { bestStudiedDuring: "When determining stop placement or assessing a stock's volatility", lookFor: "ATR value relative to stock price, current ATR vs historical ATR", avoid: "Placing stops tighter than 1x ATR, ignoring volatility in position sizing", confirmation: "Stop is at least 1.5-2x ATR from entry to avoid noise stops", invalidation: "ATR expanding dramatically — volatility regime changing, reassess risk" }
  },

  {
    slug: "indicator-volume",
    name: "Volume Analysis",
    category: "Indicator Workshop",
    filters: ["Momentum", "Breakouts"],
    difficulty: "Beginner",
    timeframe: "Any",
    marketConditions: "All — volume confirms or questions every move",
    icon: "📊",
    lessonCount: 2,
    indicatorType: "Confirmation",
    whatItMeasures: "The number of shares (or contracts) traded in a given period. Volume shows participation — how many market participants are behind a move.",
    whatItDoesNot: "It does NOT tell you direction by itself. High volume on an up day is different from high volume on a down day. You need to combine volume with price direction.",
    commonSettings: "Volume bars beneath the price chart. 20-period volume average for comparison. Above-average = noteworthy activity.",
    falseSignals: "Volume spikes at market open are common and don't always mean much. End-of-day volume increases can be institutional rebalancing, not directional conviction.",
    beginnerMistakes: "Ignoring volume entirely. A breakout on low volume is suspect. A move on high volume has more participation behind it.",
    whenNotToUse: "Volume is always relevant context. But don't treat a single high-volume bar as a trade signal without price action confirmation.",
    combineWithPriceAction: "Volume confirms price moves. A breakout with high volume = more conviction behind the move. A breakout with low volume = fewer participants, higher chance of failure. Always check volume on significant moves.",
    sections: [
      { type: "overview", heading: "Why Volume Matters", content: "Volume is like the crowd behind a move. A breakout with heavy volume is like a march with thousands of people — it has momentum. A breakout on thin volume is like two people walking — it can easily reverse.\n\nVolume doesn't predict direction, but it tells you whether to trust the move that's already happening." },
      { type: "setup", heading: "Reading Volume", content: "• Price up + volume up = strong buying conviction.\n• Price up + volume down = weak buying, potential reversal.\n• Price down + volume up = strong selling pressure.\n• Price down + volume down = weak selling, potential exhaustion.\n• Breakout + above-average volume = conviction behind the breakout.\n• Breakout + below-average volume = suspect breakout." },
      { type: "takeaway", heading: "Key Takeaway", content: "Volume tells you how many participants are behind a move. More participation = more conviction. Always check volume on breakouts, reversals, and significant moves.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><path d="M30,80 L60,78 L90,75 L120,73 L150,70 L180,60 L210,55 L240,52 L270,58 L300,62 L330,60 L360,58" stroke="#F4F7FA" stroke-width="1.5" fill="none" opacity="0.5"/><rect x="50" y="145" width="20" height="25" fill="#49B06E" opacity="0.3" rx="2"/><rect x="80" y="150" width="20" height="20" fill="#49B06E" opacity="0.3" rx="2"/><rect x="110" y="148" width="20" height="22" fill="#49B06E" opacity="0.3" rx="2"/><rect x="140" y="140" width="20" height="30" fill="#49B06E" opacity="0.3" rx="2"/><rect x="170" y="110" width="20" height="60" fill="#49B06E" opacity="0.6" rx="2"/><text x="180" y="105" text-anchor="middle" font-size="7" fill="#49B06E">Breakout volume!</text><rect x="200" y="120" width="20" height="50" fill="#49B06E" opacity="0.4" rx="2"/><rect x="230" y="135" width="20" height="35" fill="#49B06E" opacity="0.3" rx="2"/><rect x="260" y="145" width="20" height="25" fill="#ef4444" opacity="0.3" rx="2"/><rect x="290" y="150" width="20" height="20" fill="#ef4444" opacity="0.3" rx="2"/><line x1="30" y1="155" x2="370" y2="155" stroke="#FFD700" stroke-width="1" stroke-dasharray="4" opacity="0.3"/><text x="375" y="158" font-size="6" fill="#FFD700" opacity="0.5">Avg</text><text x="200" y="190" text-anchor="middle" font-size="7" fill="rgba(244,247,250,0.3)">Volume confirms conviction behind price moves</text></svg>`,
    quiz: [
      { q: "A stock breaks above resistance on volume 3x its average. What does that suggest?", options: ["Nothing — volume doesn't matter", "Strong participation behind the breakout — more conviction than a low-volume break", "The stock will definitely keep going up", "You should sell immediately"], correct: 1, explanation: "High volume on a breakout shows many participants are involved. This doesn't guarantee continuation, but it shows more conviction than a thin-volume breakout." },
      { q: "A stock rallies but volume is declining each day. What might this suggest?", options: ["The rally is strong", "Participation is fading — fewer buyers each day, the rally may exhaust", "Volume doesn't affect rallies", "The stock will crash tomorrow"], correct: 1, explanation: "Declining volume during a rally means fewer and fewer participants are driving it higher. This can indicate fading conviction, though the rally may still continue." }
    ],
    chartExercises: [{ id: "vol-1", type: "spot_setup", title: "Volume Confirmation", instruction: "Study the breakout bar and its volume compared to previous bars. Notice the relationship between price movement and participation.", chartData: BREAKOUT_VOLUME_CHART, question: "The breakout candle has significantly higher volume than surrounding candles. Why does this matter?", options: [{ label: "It doesn't matter", correct: false, explanation: "Volume is one of the most important confirmation tools in technical analysis." }, { label: "High volume on the breakout shows many participants are driving the move — higher conviction", correct: true, explanation: "Volume confirms participation. More participants behind a breakout = more conviction = higher probability of follow-through (though never guaranteed)." }, { label: "High volume means the move is over", correct: false, explanation: "High volume on a breakout typically shows the beginning of a move, not the end. Volume exhaustion usually comes after an extended run." }, { label: "You should always buy high-volume candles", correct: false, explanation: "High volume confirms the move but doesn't mean you should chase it. Entry timing, risk management, and overall context still matter." }], pansyExplanation: "Volume is the crowd behind the move. A breakout with a crowd has momentum. A breakout alone in the dark? That can reverse in a heartbeat." }],
    pansy: { intro: "Volume is the one indicator that isn't derived from price — it's independent information. That makes it uniquely valuable.", duringChart: ["See that volume spike? That's the crowd showing up. When the crowd moves, pay attention.", "Low volume moves are whispers. High volume moves are shouts."], afterQuiz: ["You understand volume as confirmation. That's a tool you'll use for the rest of your investing education."], encouragement: "Volume is the simplest indicator to understand and one of the most powerful. You just added a superpower.", warning: "High volume doesn't predict direction by itself. It confirms conviction behind whatever move is happening." },
    toolbelt: { bestStudiedDuring: "Any significant price move — breakouts, reversals, trend confirmations", lookFor: "Above-average volume on breakouts and key moves, volume divergence", avoid: "Ignoring volume, treating single volume spikes without price context", confirmation: "Price direction + above-average volume = conviction", invalidation: "Price moves on declining volume — participation is fading" }
  },

  {
    slug: "indicator-relative-volume",
    name: "Relative Volume (RVOL)",
    category: "Indicator Workshop",
    filters: ["Momentum", "Day Trading"],
    difficulty: "Intermediate",
    timeframe: "Intraday / Daily",
    marketConditions: "Active trading sessions",
    icon: "🔥",
    lessonCount: 2,
    indicatorType: "Confirmation",
    whatItMeasures: "Today's volume compared to its average for the same time of day. RVOL of 2.0 means today's volume is twice the normal level at this time.",
    whatItDoesNot: "It does NOT tell you direction. RVOL 3.0 means high participation — but it could be heavy buying OR heavy selling. Always check price direction alongside RVOL.",
    commonSettings: "RVOL compared to 20-day average volume at the same time of day. RVOL > 1.5 = noteworthy. RVOL > 2.0 = significant. RVOL > 3.0 = unusual activity.",
    falseSignals: "RVOL can spike on news events that don't create lasting moves. An earnings gap with high RVOL doesn't mean it will continue in that direction.",
    beginnerMistakes: "Chasing any stock with high RVOL. High RVOL means something is happening — it doesn't mean you should be in the trade.",
    whenNotToUse: "On stocks with very low average volume where even a small increase creates a misleading RVOL spike.",
    combineWithPriceAction: "Use RVOL as a filter: focus on setups that have above-average participation. A chart pattern with high RVOL has more conviction behind it than the same pattern on low RVOL.",
    sections: [
      { type: "overview", heading: "What Is Relative Volume?", content: "Regular volume tells you how many shares traded. Relative volume tells you how that compares to what's normal for this stock at this time.\n\n100,000 shares traded might be massive for one stock and tiny for another. RVOL normalizes this by comparing today's volume to the stock's own historical average." },
      { type: "setup", heading: "Reading RVOL", content: "• RVOL < 0.5 → Unusually quiet. Less participation than normal.\n• RVOL 0.8-1.2 → Normal activity.\n• RVOL 1.5-2.0 → Above-average interest. Something noteworthy.\n• RVOL 2.0-3.0 → Significant activity. Unusual participation.\n• RVOL > 3.0 → Very unusual. News, earnings, or major catalyst.\n\nHigher RVOL means more eyes and more money focused on this stock right now." },
      { type: "takeaway", heading: "Key Takeaway", content: "RVOL normalizes volume so you can compare apples to apples. It tells you whether today's activity is unusual for this specific stock. Unusual activity means something is happening — investigate before acting.\n\nEducational only. Not financial advice." }
    ],
    diagram: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="20" text-anchor="middle" font-size="9" fill="#F4F7FA">Relative Volume Comparison</text><rect x="60" y="90" width="60" height="80" fill="#F4F7FA" opacity="0.1" rx="4"/><text x="90" y="135" text-anchor="middle" font-size="8" fill="#F4F7FA" opacity="0.4">Normal</text><text x="90" y="150" text-anchor="middle" font-size="7" fill="#F4F7FA" opacity="0.3">RVOL 1.0</text><rect x="170" y="50" width="60" height="120" fill="#FFD700" opacity="0.2" rx="4"/><text x="200" y="115" text-anchor="middle" font-size="8" fill="#FFD700">Above Avg</text><text x="200" y="130" text-anchor="middle" font-size="7" fill="#FFD700">RVOL 2.0</text><rect x="280" y="20" width="60" height="150" fill="#ef4444" opacity="0.2" rx="4"/><text x="310" y="100" text-anchor="middle" font-size="8" fill="#ef4444">Unusual</text><text x="310" y="115" text-anchor="middle" font-size="7" fill="#ef4444">RVOL 3.0+</text><text x="200" y="190" text-anchor="middle" font-size="7" fill="rgba(244,247,250,0.3)">Higher RVOL = more unusual activity for this stock</text></svg>`,
    quiz: [
      { q: "A stock has RVOL of 3.5. What does this tell you?", options: ["The stock is going up", "Volume is 3.5x normal — something unusual is happening with this stock today", "The stock is overvalued", "You should buy immediately"], correct: 1, explanation: "RVOL 3.5 means volume is 3.5 times what's normal for this stock at this time of day. Something is drawing unusual attention — news, earnings, or a major catalyst." },
      { q: "Why is RVOL more useful than raw volume?", options: ["It's not — raw volume is better", "It normalizes volume to the stock's own average, making comparison meaningful across different stocks", "It predicts price", "It eliminates risk"], correct: 1, explanation: "RVOL compares a stock's current volume to its own historical average. This lets you compare activity levels across different stocks regardless of their typical volume." }
    ],
    chartExercises: [],
    pansy: { intro: "RVOL is your 'something is happening here' detector. It won't tell you what's happening — but it'll tell you to pay attention.", duringChart: [], afterQuiz: ["You understand relative vs absolute volume. That's a filter most beginners don't even know exists."], encouragement: "RVOL is how you separate 'normal day' from 'something's up.' It's a simple but powerful lens.", warning: "High RVOL is a reason to investigate, not a reason to trade. Always know WHY volume is elevated." },
    toolbelt: { bestStudiedDuring: "Intraday scanning for unusual activity", lookFor: "RVOL above 1.5 with a clear catalyst or technical setup", avoid: "Chasing high RVOL without understanding the catalyst, low-float RVOL spikes on thin stocks", confirmation: "High RVOL + clear price action setup + identifiable catalyst", invalidation: "RVOL spike with no follow-through — the interest was a one-bar event" }
  },
];
