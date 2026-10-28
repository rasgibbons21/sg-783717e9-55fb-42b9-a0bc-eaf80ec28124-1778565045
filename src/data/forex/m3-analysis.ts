import type { ForexLesson } from "./types";

export const M3_ANALYSIS: ForexLesson[] = [
  {
    module: "analysis",
    slug: "candlestick-patterns",
    title: "Reading Candlesticks on Forex Charts",
    subtitle: "Each candle tells a story about the battle between buyers and sellers.",
    pansyIntro: "Candlestick patterns are the language of price charts. Once you learn to read them, you'll see market sentiment in real time — who's winning, who's losing, and when the momentum is shifting. Let's decode the most important patterns.",
    difficulty: "Intermediate",
    readingMinutes: 7,
    sections: [
      {
        heading: "Anatomy of a Candlestick",
        content: "Every candlestick has four data points: open, high, low, and close (OHLC).\n\nThe body is the thick part — it spans from open to close. A green (bullish) body means the close was above the open. A red (bearish) body means the close was below the open.\n\nThe wicks (or shadows) extend above and below the body. The upper wick shows the highest price reached during that period. The lower wick shows the lowest.\n\nA long body with short wicks = strong conviction. Buyers (green) or sellers (red) were in control the whole time.\nA short body with long wicks = indecision. The market tested both directions but couldn't commit.\nA candle with no body (open = close) = a doji — pure indecision."
      },
      {
        heading: "Reversal Patterns",
        content: "These patterns suggest the current trend might reverse:\n\nHammer: A small body at the top with a long lower wick (at least 2× the body). Found at the bottom of a downtrend, it means sellers pushed the price down but buyers fought back hard. Bullish signal.\n\nShooting Star: The opposite — small body at the bottom with a long upper wick. Found at the top of an uptrend. Bearish signal.\n\nEngulfing Pattern: A two-candle pattern where the second candle's body completely engulfs the first. A bullish engulfing (green candle engulfs a red one) at a support level is a strong reversal signal.\n\nMorning Star / Evening Star: A three-candle pattern. Morning Star (bullish): large red candle → small-bodied candle (the \"star\") → large green candle. Evening Star is the bearish mirror image."
      },
      {
        heading: "Continuation Patterns",
        content: "These suggest the current trend will continue:\n\nThree White Soldiers: Three consecutive green candles with progressively higher closes. Each opens within the previous candle's body. Strong bullish continuation.\n\nThree Black Crows: Three consecutive red candles with progressively lower closes. Strong bearish continuation.\n\nRising/Falling Three Methods: A long candle in the trend direction, followed by three small counter-trend candles contained within the first candle's range, then another long candle continuing the trend. It's a pause, not a reversal."
      },
      {
        heading: "Using Patterns in Context",
        content: "A single candlestick pattern is a clue, not a verdict. The same hammer at a major support level with RSI showing oversold is far more significant than a hammer in the middle of nowhere.\n\nAlways consider:\n\nWhere is the pattern? Patterns at key support/resistance levels carry more weight.\nWhat's the trend? Reversal patterns need an existing trend to reverse.\nWhat's the volume? Higher volume behind a pattern makes it more reliable.\nConfirmation: Wait for the next candle to confirm the signal before acting. A hammer followed by a strong green candle is more trustworthy than the hammer alone."
      }
    ],
    keyTakeaways: [
      "The body shows open-to-close direction; wicks show the session's extremes.",
      "Hammer and engulfing patterns are the most reliable reversal signals for beginners.",
      "Patterns gain significance at key support/resistance levels and with confirming volume.",
      "Always wait for the next candle to confirm before acting on a pattern."
    ],
    quiz: [
      {
        q: "A candle has a small body at the top and a long lower wick at the bottom of a downtrend. What pattern is this?",
        options: [
          "Shooting Star",
          "Doji",
          "Hammer",
          "Evening Star"
        ],
        correct: 2,
        explanation: "A hammer has a small body near the top with a long lower wick (at least twice the body length). Found at the bottom of a downtrend, it signals that sellers pushed the price down but buyers fought back, suggesting a potential bullish reversal."
      },
      {
        q: "What makes a candlestick pattern more reliable?",
        options: [
          "When it appears on a 1-minute chart",
          "When it forms at a key support or resistance level with confirming volume",
          "When the candle body is very small",
          "When it appears during low-liquidity sessions"
        ],
        correct: 1,
        explanation: "Candlestick patterns gain significance when they form at important price levels (support/resistance) and are backed by higher-than-average volume. Context and confluence increase reliability."
      },
      {
        q: "In a bullish engulfing pattern, what happens?",
        options: [
          "A small green candle is followed by a large red candle",
          "A red candle's body is completely engulfed by the next green candle's body",
          "Three consecutive green candles appear",
          "A doji appears between two large candles"
        ],
        correct: 1,
        explanation: "A bullish engulfing pattern occurs when a green (bullish) candle's body completely covers the previous red (bearish) candle's body. It signals that buyers have overwhelmed sellers."
      }
    ],
    brokerContext: ["charting", "analysis"],
    seoKeywords: ["forex candlestick patterns", "how to read candlesticks", "hammer shooting star pattern"],
  },

  {
    module: "analysis",
    slug: "support-resistance",
    title: "Support and Resistance — The Invisible Walls",
    subtitle: "Price doesn't move randomly. It bounces off levels where buyers and sellers have drawn lines in the sand.",
    pansyIntro: "Support and resistance are the foundation of technical analysis. They're the price levels where the market has repeatedly said 'no further.' Once you learn to spot them, you'll see structure where others see chaos.",
    difficulty: "Intermediate",
    readingMinutes: 6,
    sections: [
      {
        heading: "What Are Support and Resistance?",
        content: "Support is a price level where buying pressure consistently overcomes selling pressure, preventing the price from falling further. Think of it as a floor.\n\nResistance is a price level where selling pressure consistently overcomes buying pressure, preventing the price from rising further. Think of it as a ceiling.\n\nThese levels form because traders remember them. If EUR/USD bounced off 1.0800 three times, traders watch that level — they set buy orders near it, reinforcing the support. It becomes a self-fulfilling prophecy."
      },
      {
        heading: "How to Identify Key Levels",
        content: "Horizontal levels: Look for price points where the market has reversed multiple times. The more touches, the stronger the level. Two touches form a tentative level; three or more touches make it significant.\n\nRound numbers: Pairs often respect round numbers (1.0800, 1.1000, 150.00) because traders place orders at psychologically clean levels.\n\nPrevious highs and lows: Yesterday's high and low, the weekly high and low, and all-time highs and lows are all watched as potential support/resistance.\n\nTip: Draw levels as zones (a band of 10-20 pips) rather than exact lines. The market rarely turns at a precise pip — it turns in an area."
      },
      {
        heading: "Breakouts and Role Reversal",
        content: "When price breaks through a support level with conviction, that former support often becomes resistance — and vice versa. This is called role reversal or polarity.\n\nWorked example: EUR/USD has bounced off support at 1.0800 three times. On the fourth test, it breaks through and closes at 1.0770. Now 1.0800 is resistance. If the price rallies back to 1.0800, expect sellers to defend that level from above.\n\nFalse breakouts are common. The price briefly pokes through a level but quickly reverses back. Wait for the candle to close beyond the level before treating it as a genuine break. A close through the level plus a retest that holds is the most reliable breakout confirmation."
      },
      {
        heading: "Trading with Support and Resistance",
        content: "Bounce strategy: Buy near support, sell near resistance. Place your stop-loss just beyond the level (below support for longs, above resistance for shorts).\n\nBreakout strategy: Enter after a confirmed break of a level. Wait for a close beyond it, ideally followed by a pullback that retests the level as new support (for a bullish breakout) or resistance (for a bearish one).\n\nDo not buy directly at resistance or sell at support against the prevailing trend. Support and resistance are stronger when they align with the bigger trend direction.\n\nCombine with candlestick patterns: A hammer forming right at a support level is a much stronger signal than either signal alone."
      }
    ],
    keyTakeaways: [
      "Support is a floor (buyers defend); resistance is a ceiling (sellers defend).",
      "Draw levels as zones, not exact lines — the market turns in areas, not at precise pips.",
      "When a level breaks, it often reverses role — old support becomes new resistance.",
      "Wait for a candle close beyond a level before treating a breakout as genuine."
    ],
    quiz: [
      {
        q: "EUR/USD has bounced off 1.0800 three times over the past month. What does this level represent?",
        options: [
          "Resistance — because the price keeps going up from there",
          "Support — because buying pressure at that level repeatedly prevents further decline",
          "A pivot point — because it was calculated from yesterday's data",
          "A moving average — because it represents the average price"
        ],
        correct: 1,
        explanation: "When the price repeatedly bounces UP from a level, that level is support — it acts as a floor where buying pressure overcomes selling pressure and prevents the price from falling further."
      },
      {
        q: "What is 'role reversal' in the context of support and resistance?",
        options: [
          "When a trend changes from bullish to bearish",
          "When a broken support level becomes resistance, or a broken resistance becomes support",
          "When the base and quote currencies switch positions",
          "When a buy order converts to a sell order"
        ],
        correct: 1,
        explanation: "Role reversal (polarity) occurs when a level that previously acted as support gets broken and subsequently acts as resistance (or vice versa). Traders who bought at the old support may sell to break even when price returns to that level."
      },
      {
        q: "Why should you draw support and resistance as zones rather than exact lines?",
        options: [
          "Because exact lines are harder to draw on mobile platforms",
          "Because the market rarely reverses at a precise pip — it turns in an area of 10-20 pips",
          "Because zones look better on charts",
          "Because brokers show different prices for the same pair"
        ],
        correct: 1,
        explanation: "Different traders react at slightly different prices, and different brokers show slightly different quotes. Price tends to reverse within a zone rather than at one exact pip, so a band of 10-20 pips captures the real reversal area."
      }
    ],
    brokerContext: ["charting", "analysis"],
    seoKeywords: ["forex support and resistance", "how to find support resistance levels", "support resistance trading"],
  },

  {
    module: "analysis",
    slug: "indicators-for-forex",
    title: "Indicators That Actually Help in Forex",
    subtitle: "Focused on the indicators that forex traders use most — and how to avoid indicator overload.",
    pansyIntro: "There are hundreds of technical indicators. You don't need them all. In fact, using too many is worse than using none. Here are the ones that forex traders actually rely on — and how to use them without paralysis.",
    difficulty: "Intermediate",
    readingMinutes: 7,
    sections: [
      {
        heading: "Moving Averages for Trend Direction",
        content: "A moving average smooths out price noise to show the underlying trend direction.\n\nSimple Moving Average (SMA): The average closing price over N periods. The 50 SMA and 200 SMA are the most widely watched in forex.\n\nExponential Moving Average (EMA): Weighs recent prices more heavily, making it more responsive to recent moves. The 20 EMA is popular for short-term trend tracking.\n\nHow to use them:\n\nTrend filter: If price is above the 200 SMA, the long-term trend is up — favor buy trades. Below = favor sells.\nCrossover signal: When the 50 SMA crosses above the 200 SMA (golden cross), it's a bullish signal. When it crosses below (death cross), bearish.\nDynamic support/resistance: Price often bounces off key moving averages, especially the 50 and 200 on H4 and daily charts."
      },
      {
        heading: "RSI — Momentum and Overbought/Oversold",
        content: "The Relative Strength Index (RSI) oscillates between 0 and 100, measuring the speed and size of recent price moves.\n\nAbove 70: Potentially overbought — the move up may be exhausted.\nBelow 30: Potentially oversold — the move down may be exhausted.\n\nBut 'overbought' doesn't mean 'sell immediately.' In a strong trend, RSI can stay above 70 for weeks. The best use of RSI in forex:\n\nDivergence: Price makes a new high, but RSI makes a lower high = bearish divergence (momentum is weakening). Price makes a new low, but RSI makes a higher low = bullish divergence. Divergences are one of the most reliable RSI signals.\n\nConfirmation: RSI crossing back below 70 from overbought territory confirms a potential reversal. Crossing back above 30 from oversold confirms a potential bounce."
      },
      {
        heading: "MACD — Trend and Momentum Combined",
        content: "The MACD (Moving Average Convergence Divergence) combines trend following with momentum. It consists of:\n\nMACD Line: The difference between the 12-period and 26-period EMAs.\nSignal Line: A 9-period EMA of the MACD line.\nHistogram: The difference between the MACD line and signal line — it visualizes the momentum.\n\nSignals:\n\nMACD crossing above the signal line = bullish.\nMACD crossing below the signal line = bearish.\nHistogram growing = momentum increasing. Histogram shrinking = momentum fading.\n\nDivergence works here too: if price makes a new high but the MACD histogram makes a lower high, momentum is weakening."
      },
      {
        heading: "ATR — Measuring Volatility",
        content: "The Average True Range (ATR) tells you how much a pair typically moves in a given period. It doesn't give buy or sell signals — it measures volatility.\n\nWhy it matters for forex:\n\nStop-loss placement: If the 14-period ATR on EUR/USD daily is 80 pips, a 20-pip stop-loss is too tight — normal volatility will stop you out. A stop of 1–1.5× ATR gives your trade room to breathe.\n\nPosition sizing: Wider ATR = more volatile pair = smaller position to keep risk constant.\n\nFilter for quiet markets: When ATR is very low, the market is consolidating. When ATR expands, expect bigger moves."
      },
      {
        heading: "The Indicator Trap",
        content: "New traders often stack indicator after indicator, hoping more data means better decisions. The result is the opposite: conflicting signals, analysis paralysis, and late entries.\n\nThe rule of three: Use one trend indicator (e.g., moving average), one momentum indicator (e.g., RSI or MACD), and one volatility measure (e.g., ATR or Bollinger Bands). That's it.\n\nIndicators are derived from price. They're lagging by nature — they tell you what already happened. The chart itself (candlesticks, support/resistance) is the leading indicator. Indicators confirm what the chart is already showing; they don't replace chart reading."
      }
    ],
    keyTakeaways: [
      "Use the 50/200 SMA for trend direction and the 20 EMA for short-term momentum.",
      "RSI divergence is more reliable than overbought/oversold readings alone.",
      "ATR helps you set realistic stop-losses and size positions based on actual volatility.",
      "Stick to 2-3 indicators max — more causes paralysis, not precision."
    ],
    quiz: [
      {
        q: "Price makes a new high on EUR/USD, but RSI makes a lower high. What does this indicate?",
        options: [
          "Strong bullish momentum — buy aggressively",
          "Bearish divergence — momentum is weakening despite higher prices",
          "The RSI is broken and needs to be reset",
          "Support has formed at the new high"
        ],
        correct: 1,
        explanation: "When price makes a new high but RSI does not, it's bearish divergence — the upward momentum is fading. This warns that the move higher may be running out of steam. It's not an automatic sell signal but a caution flag."
      },
      {
        q: "The 14-period ATR on GBP/USD daily chart is 120 pips. Why would a 25-pip stop-loss be problematic?",
        options: [
          "Because 25 pips is too large for any trade",
          "Because normal daily volatility (120 pips) would likely trigger the stop before the trade has a chance to work",
          "Because ATR must always equal the stop-loss exactly",
          "Because GBP/USD only moves in 50-pip increments"
        ],
        correct: 1,
        explanation: "If the pair typically moves 120 pips per day, a 25-pip stop is far too tight — random intraday swings will stop you out even if your trade direction is correct. A stop of 1-1.5× ATR (120-180 pips) would accommodate normal volatility."
      },
      {
        q: "Why is stacking many indicators on your chart counterproductive?",
        options: [
          "It slows down your computer",
          "Indicators often give conflicting signals, causing analysis paralysis and late entries",
          "Brokers charge fees for each indicator used",
          "It makes it impossible to see candlestick patterns"
        ],
        correct: 1,
        explanation: "Indicators are all derived from price data, so they often overlap or conflict. When five indicators give three different signals, you're paralyzed. Stick to 2-3 complementary indicators (trend + momentum + volatility) for clarity."
      }
    ],
    brokerContext: ["charting", "indicators", "analysis"],
    seoKeywords: ["best forex indicators", "RSI divergence forex", "moving average forex strategy"],
  },

  {
    module: "analysis",
    slug: "fundamental-analysis-forex",
    title: "Fundamental Analysis — The Economic Engine Behind Currencies",
    subtitle: "Interest rates, employment data, inflation — the forces that drive long-term currency moves.",
    pansyIntro: "Technical analysis shows you what the market is doing. Fundamental analysis tells you why. The biggest forex moves are driven by economics, not chart patterns. Here's what to watch and why it matters.",
    difficulty: "Intermediate",
    readingMinutes: 7,
    sections: [
      {
        heading: "Interest Rates: The Biggest Driver",
        content: "Central banks set interest rates, and interest rates are the single most important driver of currency values.\n\nWhen a central bank raises rates, its currency tends to strengthen because higher rates attract foreign capital (investors get a better return on deposits in that currency). When rates are cut, the currency tends to weaken.\n\nKey central banks to watch:\n\nFederal Reserve (Fed) — US dollar. The most influential central bank globally.\nEuropean Central Bank (ECB) — Euro.\nBank of England (BoE) — British pound.\nBank of Japan (BoJ) — Japanese yen. Known for ultra-low (sometimes negative) rates.\nReserve Bank of Australia (RBA) — Australian dollar.\n\nIt's not just the rate itself — it's the expectation. If the market expects the Fed to raise rates and they do, the move is already priced in. The currency moves most when the decision surprises the market."
      },
      {
        heading: "Key Economic Indicators",
        content: "Non-Farm Payrolls (NFP): Released the first Friday of each month (US). Shows how many jobs were added or lost. Strong NFP = strong economy = stronger dollar. This release causes the largest regular volatility events in forex.\n\nConsumer Price Index (CPI): Measures inflation. Rising inflation often leads to rate hikes (bullish for the currency). Falling inflation may lead to cuts (bearish).\n\nGross Domestic Product (GDP): The broadest measure of economic health. Stronger-than-expected GDP is bullish; weaker is bearish.\n\nPurchasing Managers' Index (PMI): A survey of business conditions. Above 50 = expansion. Below 50 = contraction. It's a leading indicator — it often signals changes before they show up in GDP.\n\nRetail Sales: Measures consumer spending. Strong retail sales suggest economic health."
      },
      {
        heading: "The Economic Calendar",
        content: "Professional traders start each day by checking the economic calendar. Free calendars are available on sites like Forex Factory and Investing.com. They show:\n\nWhat data is releasing and when (in your time zone).\nThe expected value (consensus forecast).\nThe previous value.\nThe impact level (low, medium, high).\n\nThe market moves when the actual number differs from the expectation. If NFP is expected at +200K but comes in at +350K, the dollar spikes. If it comes in at +50K, the dollar drops.\n\nRule: Never open a new trade right before a high-impact release unless you specifically want to trade the event. The volatility can move the price 50-100+ pips in seconds, easily blowing through your stop-loss with slippage."
      },
      {
        heading: "Central Bank Communication",
        content: "Rate decisions happen 6-8 times per year, but central banks communicate constantly through:\n\nPress conferences: The bank chair answers questions after rate decisions. Tone matters as much as the decision itself — hawkish (expecting tighter policy) strengthens the currency; dovish (expecting looser policy) weakens it.\n\nMinutes: Published weeks after the meeting, showing the internal debate. Can reveal split opinions or hints about future moves.\n\nSpeeches: Central bank officials give speeches frequently. A single sentence can move a currency pair 100+ pips if it shifts rate expectations.\n\nForward guidance: When a central bank explicitly states its future intentions (\"we expect rates to remain elevated\"), the market adjusts before the next meeting."
      },
      {
        heading: "Putting It Together",
        content: "You don't need a degree in economics to use fundamentals. Here's a practical approach:\n\n1. Check the economic calendar each morning.\n2. Identify any high-impact releases for the pairs you trade.\n3. Know the market expectation (consensus) and whether the actual number beat or missed it.\n4. Watch central bank rate decisions and listen for hawkish or dovish shifts.\n5. Use fundamentals to set your directional bias (which way you expect the pair to move over days/weeks), then use technicals to time your entries and exits.\n\nFundamentals tell you which direction to lean. Technicals tell you when to pull the trigger."
      }
    ],
    keyTakeaways: [
      "Interest rate expectations are the primary long-term driver of currency pairs.",
      "NFP, CPI, GDP, and PMI are the high-impact releases that move forex markets most.",
      "Check the economic calendar daily — never open a new trade right before a major release.",
      "Use fundamentals for direction, technicals for timing."
    ],
    quiz: [
      {
        q: "The Fed is expected to hold rates steady but instead raises by 25 basis points. What likely happens to the US dollar?",
        options: [
          "Nothing — rate decisions don't affect forex",
          "The dollar weakens because higher rates slow the economy",
          "The dollar strengthens sharply because the rate hike was unexpected",
          "The dollar stays flat because the change was only 25 basis points"
        ],
        correct: 2,
        explanation: "The biggest currency moves happen on surprises. Since the market expected no change, an unexpected rate hike means the dollar becomes more attractive (higher yields), causing a sharp appreciation."
      },
      {
        q: "Why should you avoid opening a new trade right before a high-impact economic release?",
        options: [
          "Because the market is closed during economic releases",
          "Because the release can cause 50-100+ pip moves in seconds, potentially blowing through your stop-loss with slippage",
          "Because brokers disable trading during news events",
          "Because economic data is always priced in beforehand"
        ],
        correct: 1,
        explanation: "High-impact releases like NFP can cause extreme volatility — 50-100+ pip moves in seconds. Spreads widen dramatically and slippage means your stop-loss might execute far beyond your intended level."
      },
      {
        q: "What does it mean when a central bank chair's tone is described as 'hawkish'?",
        options: [
          "They expect to lower interest rates soon",
          "They're signaling tighter monetary policy (higher rates), which tends to strengthen the currency",
          "They're worried about a recession",
          "They want to weaken their currency to boost exports"
        ],
        correct: 1,
        explanation: "Hawkish tone signals that the central bank is inclined toward tighter policy — raising rates or reducing stimulus. This tends to strengthen the currency because higher rates attract foreign capital."
      }
    ],
    brokerContext: ["fundamental-analysis", "economic-calendar"],
    seoKeywords: ["forex fundamental analysis", "economic calendar forex", "interest rates and forex"],
  },
];
