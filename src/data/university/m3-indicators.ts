import type { UniversityLesson } from "@/data/university/m1-chart-reading";

export const M3_LESSONS: UniversityLesson[] = [
  {
    module: "m3-indicators",
    slug: "simple-moving-average",
    title: "Simple Moving Average (SMA)",
    subtitle: "A smooth line that cuts through noise to show which way price is leaning.",
    difficulty: "Beginner",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "The average closing price over a set number of periods — a smooth line that cuts through noise to show underlying direction.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "To see which way price is generally leaning. Rising = up-bias, falling = down-bias. The plainest trend filter there is.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "Price above the SMA = strength, below = weakness. Common lengths: 50 and 200 for the big picture, 20 for shorter swings.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "Reclaiming and holding above a key SMA leans bullish; losing it leans bearish. A shorter SMA crossing a longer one reads as a slower trend shift.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "It lags — an average of the past, so it confirms rather than predicts. In choppy markets it whipsaws constantly.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Treating 'price touched the 200 SMA' as an automatic bounce. It's a reference, not a force field.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "The SMA smooths price into a trend read — useful in trends, treacherous in chop.\n\nCombine with structure and support/resistance — an SMA lining up with a key level matters more than the line alone.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawSMA { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .sma { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawSMA 2s ease forwards; }
    .price { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawSMA 1.5s ease 0.3s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Noisy price line -->
  <polyline class="price" points="20,130 40,110 60,125 80,95 100,115 120,85 140,100 160,70 180,90 200,60 220,75 240,50 270,65 295,40"
    fill="none" stroke="#F4F7FA" stroke-width="1.5" opacity="0.45"/>
  <!-- Smooth SMA -->
  <polyline class="sma" points="20,132 50,118 90,105 130,92 170,80 210,67 255,56 295,44"
    fill="none" stroke="#27B7C8" stroke-width="2.5"/>
  <text class="lbl" x="258" y="42" fill="#27B7C8" font-size="9" font-family="sans-serif">SMA (50)</text>
  <text class="lbl" x="24" y="105" fill="#F4F7FA" font-size="9" font-family="sans-serif" opacity="0.5">Price</text>
  <text class="lbl" x="20" y="168" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Rising SMA = up-bias · Price above = strength</text>
</svg>`,
    quiz: [
      {
        q: "What does a rising SMA indicate about the underlying trend?",
        options: [
          "Price is about to reverse",
          "The average price over the period is moving higher — an up-bias",
          "Volatility is decreasing",
          "Volume is confirming the move",
        ],
        correct: 1,
        explanation:
          "A rising SMA means the average closing price over the look-back period is trending higher — the clearest sign of an up-bias in the underlying direction.",
      },
      {
        q: "Which SMA lengths are most commonly referenced for the 'big picture' trend?",
        options: [
          "5 and 10",
          "9 and 21",
          "50 and 200",
          "100 and 150",
        ],
        correct: 2,
        explanation:
          "The 50 and 200 SMAs are the most widely watched for long-term trend context. The 20 SMA is more common for shorter-term swings.",
      },
      {
        q: "What is the SMA's biggest limitation?",
        options: [
          "It is too complex to calculate",
          "It reacts faster than price, giving false early signals",
          "It lags — it reflects past prices and confirms rather than predicts",
          "It only works on weekly charts",
        ],
        correct: 2,
        explanation:
          "Because the SMA averages past prices, it inherently lags — it tells you where the trend has been, not where it's going. In choppy conditions, this lag creates constant whipsaws.",
      },
      {
        q: "What is the most common mistake traders make with the 200 SMA?",
        options: [
          "Using it alongside structure and support/resistance",
          "Treating a touch of the 200 SMA as a guaranteed bounce",
          "Applying it to trending rather than choppy markets",
          "Combining it with the 50 SMA for context",
        ],
        correct: 1,
        explanation:
          "The 200 SMA is a reference line, not a force field. Price respects it sometimes and ignores it others. Treating every touch as an automatic bounce is one of the most common and costly SMA misreadings.",
      },
    ],
    girlToGirlTip:
      "A moving average is a trend summary, not a crystal ball — where price has been leaning, not where it's going.",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "exponential-moving-average",
    title: "Exponential Moving Average (EMA)",
    subtitle: "A faster, recency-weighted moving average — quicker reads, more false alarms.",
    difficulty: "Beginner",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "Same as an SMA but weights recent prices more heavily, so it reacts faster to fresh moves.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "When they want a trend line that hugs price closely and turns sooner. Popular lengths: 9, 21, 50.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "Above = strength, below = weakness, just quicker. Fast EMAs (9, 21) for short-term tone; slower (50) for the bigger lean.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "A faster EMA crossing above a slower one leans bullish; below leans bearish (the EMA crossover from Module 4).",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "Faster reaction = more false signals. Still lags, whipsaws badly in sideways markets.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Hunting for the 'perfect' EMA length. The default is fine; the obsession is usually procrastination.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "A faster, recency-weighted moving average — quicker reads, more false alarms.\n\nCombine with structure and momentum tools. EMAs for trend + RSI for energy is a classic pairing.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .sma { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2.2s ease forwards; }
    .ema { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 1.8s ease 0.2s forwards; }
    .price { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 1.4s ease 0.5s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.4s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Price -->
  <polyline class="price" points="20,140 45,115 70,130 95,100 120,118 145,85 170,105 195,70 220,88 250,55 280,40"
    fill="none" stroke="#F4F7FA" stroke-width="1.5" opacity="0.35"/>
  <!-- SMA (slower, smoother) -->
  <polyline class="sma" points="20,142 60,125 110,110 160,95 210,78 260,62 295,50"
    fill="none" stroke="#49B06E" stroke-width="2" stroke-dasharray="6 3"/>
  <!-- EMA (faster, hugs price) -->
  <polyline class="ema" points="20,140 45,118 80,122 110,98 145,90 175,77 210,68 250,52 285,38"
    fill="none" stroke="#27B7C8" stroke-width="2.5"/>
  <text class="lbl" x="258" y="36" fill="#27B7C8" font-size="9" font-family="sans-serif">EMA (21)</text>
  <text class="lbl" x="258" y="60" fill="#49B06E" font-size="9" font-family="sans-serif">SMA (50)</text>
  <text class="lbl" x="20" y="172" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">EMA hugs price tighter · SMA smoother, slower</text>
</svg>`,
    quiz: [
      {
        q: "How does an EMA differ from an SMA of the same length?",
        options: [
          "The EMA is calculated over more periods",
          "The EMA weights recent prices more, so it reacts faster",
          "The EMA is always plotted on a logarithmic scale",
          "The EMA ignores the most recent price",
        ],
        correct: 1,
        explanation:
          "The EMA assigns higher weight to more recent prices, making it more responsive to fresh moves than a plain SMA of the same period length. That responsiveness is both its advantage and its weakness.",
      },
      {
        q: "What is the trade-off of using a faster EMA (e.g., 9-period) vs. a slower one (e.g., 50-period)?",
        options: [
          "Faster EMAs are more reliable but harder to calculate",
          "Faster EMAs respond sooner but generate more false signals",
          "Slower EMAs move more than faster ones in trending markets",
          "Faster EMAs work better on weekly charts",
        ],
        correct: 1,
        explanation:
          "The faster the EMA, the sooner it responds to price changes — but also the more noise it picks up. In choppy markets a fast EMA can whipsaw constantly, generating many false signals.",
      },
      {
        q: "What does a faster EMA crossing above a slower EMA suggest?",
        options: [
          "The stock is overbought and due to reverse",
          "A bearish trend shift is underway",
          "Short-term momentum is leaning bullish relative to the longer-term average",
          "Volume is confirming the current move",
        ],
        correct: 2,
        explanation:
          "When a shorter (faster) EMA crosses above a longer (slower) one, it means the recent average is rising above the longer-term average — a classic bullish momentum read. The EMA crossover signal covered in Module 4.",
      },
      {
        q: "What is the most common mistake traders make when choosing an EMA length?",
        options: [
          "Using 21 as a starting point",
          "Obsessing over finding the 'perfect' length rather than using the tool consistently",
          "Using EMAs in trending markets",
          "Combining EMAs with RSI",
        ],
        correct: 1,
        explanation:
          "The search for the 'perfect' EMA setting is usually procrastination dressed as research. Standard lengths (9, 21, 50) are used by enough participants to matter. Optimization rarely adds meaningful edge.",
      },
    ],
    girlToGirlTip:
      "SMA is the calm friend, EMA is the reactive one. Neither is 'better' — different speeds answering 'what's the trend.'",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "vwap",
    title: "VWAP",
    subtitle: "The session's volume-weighted fair-value line — powerful intraday, irrelevant long-term.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "Volume-Weighted Average Price — the average price weighted by how much traded at each level over the session. A true intraday 'fair value' line.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "Institutions reference it to judge fills, so it acts like a magnet and battle line intraday.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "Price above VWAP = buyers control the session; below = sellers. Resets each day.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "A reclaim (price back above VWAP) leans intraday-bullish; losing it leans bearish.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "Intraday only — nearly meaningless on daily/weekly charts, resets every session, useless for long-term investing.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Using VWAP on higher timeframes where it has no real meaning.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "The session's volume-weighted fair-value line — powerful intraday, irrelevant long-term.\n\nCombine with intraday structure and volume.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .vwap { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .price { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 1.6s ease 0.3s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.3s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- VWAP line, slightly rising through session -->
  <polyline class="vwap" points="20,100 70,98 120,95 170,93 220,90 270,88 300,87"
    fill="none" stroke="#27B7C8" stroke-width="2.5"/>
  <!-- Price: below → reclaim → above -->
  <polyline class="price" points="20,120 50,115 80,108 105,102 130,92 155,85 190,78 220,82 250,72 285,62"
    fill="none" stroke="#F4F7FA" stroke-width="1.8" opacity="0.7"/>
  <!-- Reclaim zone -->
  <rect x="100" y="88" width="40" height="20" fill="#49B06E" opacity="0.1" rx="3"/>
  <text class="lbl" x="22" y="87" fill="#27B7C8" font-size="9" font-family="sans-serif">VWAP</text>
  <text class="lbl" x="102" y="83" fill="#49B06E" font-size="8" font-family="sans-serif">Reclaim</text>
  <text class="lbl" x="22" y="130" fill="#ef4444" font-size="8" font-family="sans-serif" opacity="0.7">Below VWAP</text>
  <text class="lbl" x="190" y="70" fill="#49B06E" font-size="8" font-family="sans-serif">Above VWAP</text>
  <text class="lbl" x="20" y="172" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Resets every session · Intraday only</text>
</svg>`,
    quiz: [
      {
        q: "What makes VWAP different from a simple moving average?",
        options: [
          "VWAP is plotted over multiple days",
          "VWAP weights price by the volume traded at each level, not equally by time",
          "VWAP only applies to options markets",
          "VWAP gives more weight to older prices",
        ],
        correct: 1,
        explanation:
          "Unlike an SMA which averages prices equally across time, VWAP weights each price by how much volume traded there. This makes it a true 'fair value' — the average price paid, adjusted for participation.",
      },
      {
        q: "Why do institutions reference VWAP for their executions?",
        options: [
          "It predicts the next day's open price",
          "It's a benchmark for whether they got a good fill relative to the session's average",
          "It shows the strongest support/resistance levels from the past month",
          "Regulators require VWAP reporting",
        ],
        correct: 1,
        explanation:
          "Large institutions measure their execution quality against VWAP — buying below it and selling above it means a better-than-average fill. This institutional use is what makes VWAP a meaningful intraday reference.",
      },
      {
        q: "When is VWAP most useful?",
        options: [
          "On weekly and monthly charts for long-term trend analysis",
          "Intraday, within a single session",
          "Whenever the market is trending strongly",
          "During pre-market trading only",
        ],
        correct: 1,
        explanation:
          "VWAP resets at the start of each session, making it exclusively an intraday tool. On daily or weekly charts it loses its meaning — it doesn't accumulate across sessions the way price structure does.",
      },
      {
        q: "What does a VWAP reclaim suggest in intraday terms?",
        options: [
          "The stock is about to gap down",
          "Price returning to and holding above VWAP suggests buyers have reasserted session control",
          "Sellers are dominating the session",
          "Volume is about to dry up",
        ],
        correct: 1,
        explanation:
          "When price dips below VWAP and then reclaims it — closing back above — it suggests buyers stepped back in and retook the 'fair value' level. This is one of the most watched intraday patterns.",
      },
    ],
    girlToGirlTip:
      "VWAP is where the big money keeps score during the day — just remember it clocks out at the close.",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "rsi",
    title: "RSI (Relative Strength Index)",
    subtitle: "Measures momentum energy — overbought means strong, not doomed.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "Momentum — how fast and hard price has moved recently — on a 0-100 scale. Energy, not direction.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "To gauge whether a move is running hot or cooling, and to spot divergence.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "Above 70 = 'overbought,' below 30 = 'oversold.' Default: 14 periods.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "Bullish divergence (price lower low, RSI higher low) hints selling is tiring; bearish divergence (price higher high, RSI lower high) hints buying is tiring.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "In a strong trend RSI can stay overbought/oversold a long time while price keeps going. Betting against it in a powerful trend gets people run over.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Treating 70/30 as automatic buy/sell buttons. They're context, not triggers.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "RSI measures energy, not destiny — 'overbought' means strong, not doomed.\n\nCombine with structure. RSI divergence + a break of structure beats divergence alone.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .price-line { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .rsi-line { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease 0.4s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.5s forwards; opacity: 0; }
  </style>
  <rect width="320" height="200" fill="#0E1B30" rx="8"/>
  <!-- Price panel -->
  <text x="10" y="15" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">PRICE</text>
  <polyline class="price-line" points="20,75 55,60 90,55 120,65 145,52 170,48 200,58 230,50 265,60 295,55"
    fill="none" stroke="#F4F7FA" stroke-width="1.8" opacity="0.7"/>
  <!-- Divider -->
  <line x1="10" y1="90" x2="310" y2="90" stroke="#F4F7FA" stroke-width="0.5" opacity="0.2"/>
  <!-- RSI panel -->
  <text x="10" y="105" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">RSI (14)</text>
  <!-- 70 line -->
  <line x1="20" y1="120" x2="300" y2="120" stroke="#ef4444" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.6"/>
  <!-- 30 line -->
  <line x1="20" y1="170" x2="300" y2="170" stroke="#49B06E" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.6"/>
  <!-- RSI — divergence: price higher high, RSI lower high -->
  <polyline class="rsi-line" points="20,155 55,138 90,125 120,135 145,122 170,128 200,132 230,126 265,135 295,130"
    fill="none" stroke="#27B7C8" stroke-width="2"/>
  <text class="lbl" x="302" y="122" fill="#ef4444" font-size="8" font-family="sans-serif">70</text>
  <text class="lbl" x="302" y="172" fill="#49B06E" font-size="8" font-family="sans-serif">30</text>
  <text class="lbl" x="20" y="195" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Divergence: price ≠ RSI = momentum tiring</text>
</svg>`,
    quiz: [
      {
        q: "What does RSI actually measure?",
        options: [
          "Whether a stock is fundamentally overvalued",
          "The average volume over a period",
          "Momentum — the speed and magnitude of recent price movement",
          "The relationship between two moving averages",
        ],
        correct: 2,
        explanation:
          "RSI measures momentum — how fast and forcefully price has moved in a recent window. It's an energy gauge on a 0-100 scale, not a valuation or direction tool.",
      },
      {
        q: "What does 'bearish divergence' on the RSI indicate?",
        options: [
          "Price making a lower low while RSI makes a higher low",
          "Price making a higher high while RSI makes a lower high",
          "RSI staying above 70 for multiple periods",
          "Price and RSI moving in the same direction",
        ],
        correct: 1,
        explanation:
          "Bearish divergence: price reaches a new high but RSI fails to confirm with a new high of its own. The gap suggests buying momentum is weakening even as price pushes higher — a warning that the move may be tiring.",
      },
      {
        q: "In a powerful uptrend, what often happens to RSI above 70?",
        options: [
          "It immediately reverses to signal a peak",
          "It stays above 70 for an extended period while price continues rising",
          "It drops to 50 and then rises again",
          "It becomes unreliable and should be turned off",
        ],
        correct: 1,
        explanation:
          "In strong trends, RSI can remain in 'overbought' territory for a long time without price reversing. Betting against a trend just because RSI is above 70 is one of the most common and painful RSI misuses.",
      },
      {
        q: "What is the most common mistake in reading RSI?",
        options: [
          "Using a 14-period default setting",
          "Watching for divergence alongside structure",
          "Treating the 70/30 levels as automatic buy or sell triggers",
          "Combining RSI with EMAs for trend context",
        ],
        correct: 2,
        explanation:
          "The 70 and 30 levels are context clues, not buttons. Automatically selling every time RSI hits 70 ignores trend strength and leads to exiting positions far too early in a genuine trend.",
      },
    ],
    girlToGirlTip:
      "RSI is one voice in the room — listen, don't obey. Anyone selling it as a magic button is selling you something.",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "macd",
    title: "MACD",
    subtitle: "Reads momentum and its strength — a lagging confirmer, best with other clues.",
    difficulty: "Advanced",
    readingMinutes: 6,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "The relationship between two EMAs, plotted as a MACD line, signal line, and histogram. Momentum and its strength.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "To confirm momentum shifts and see when a trend's energy is building or fading.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "MACD crossing above its signal line = bullish read; below = bearish. Histogram shows strength — tall bars strong, shrinking bars fading.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "A bullish crossover or rising histogram leans up; reverse leans down. MACD divergence (price up, histogram down) is a respected warning.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "Lags and whipsaws in sideways chop. Crossovers fire late and often falsely.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Acting on every crossover. Most, especially in chop, are noise.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "MACD reads momentum and its strength — a lagging confirmer, best with other clues.\n\nCombine with structure and RSI. When MACD, RSI, and structure agree, that's confluence.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .macd { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .sig { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease 0.3s forwards; }
    .bar { transform-origin: center; animation: growBar 0.4s ease forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.5s forwards; opacity: 0; }
  </style>
  <rect width="320" height="200" fill="#0E1B30" rx="8"/>
  <!-- Price panel -->
  <text x="10" y="15" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">PRICE</text>
  <polyline points="20,68 60,55 100,50 140,60 180,45 220,38 270,42 300,38"
    fill="none" stroke="#F4F7FA" stroke-width="1.8" opacity="0.6"/>
  <line x1="10" y1="85" x2="310" y2="85" stroke="#F4F7FA" stroke-width="0.5" opacity="0.2"/>
  <!-- MACD zero line -->
  <line x1="20" y1="145" x2="300" y2="145" stroke="#F4F7FA" stroke-width="0.8" opacity="0.2"/>
  <!-- Histogram bars -->
  <rect class="bar" x="30" y="138" width="14" height="7" fill="#49B06E" opacity="0.7" style="animation-delay:0.3s"/>
  <rect class="bar" x="56" y="132" width="14" height="13" fill="#49B06E" opacity="0.8" style="animation-delay:0.4s"/>
  <rect class="bar" x="82" y="128" width="14" height="17" fill="#49B06E" opacity="0.9" style="animation-delay:0.5s"/>
  <rect class="bar" x="108" y="133" width="14" height="12" fill="#49B06E" opacity="0.7" style="animation-delay:0.6s"/>
  <rect class="bar" x="134" y="137" width="14" height="8" fill="#49B06E" opacity="0.6" style="animation-delay:0.7s"/>
  <rect class="bar" x="160" y="145" width="14" height="7" fill="#ef4444" opacity="0.6" style="animation-delay:0.8s"/>
  <rect class="bar" x="186" y="145" width="14" height="13" fill="#ef4444" opacity="0.7" style="animation-delay:0.9s"/>
  <!-- MACD line -->
  <polyline class="macd" points="20,142 56,135 90,128 130,134 165,140 195,148 230,153 270,158 300,160"
    fill="none" stroke="#27B7C8" stroke-width="2"/>
  <!-- Signal line -->
  <polyline class="sig" points="20,143 56,138 90,132 130,135 165,141 195,147 230,152 270,157 300,159"
    fill="none" stroke="#F4F7FA" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.7"/>
  <text class="lbl" x="22" y="100" fill="#27B7C8" font-size="8" font-family="sans-serif">MACD</text>
  <text class="lbl" x="70" y="100" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.6">Signal</text>
  <text class="lbl" x="20" y="192" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Histogram: tall = strong · shrinking = fading</text>
</svg>`,
    quiz: [
      {
        q: "What does the MACD histogram show?",
        options: [
          "The raw volume traded in each period",
          "The distance between the MACD line and the signal line — indicating momentum strength",
          "The number of periods since the last crossover",
          "The stock's price relative to its 52-week range",
        ],
        correct: 1,
        explanation:
          "The histogram is the distance between the MACD line and the signal line. Tall bars mean strong momentum divergence (building); shrinking bars mean the two lines are converging — momentum fading.",
      },
      {
        q: "What is MACD divergence?",
        options: [
          "The MACD and signal lines crossing each other",
          "Price moving in one direction while the MACD histogram moves in the opposite direction",
          "The histogram staying above zero for multiple sessions",
          "The MACD crossing the zero line",
        ],
        correct: 1,
        explanation:
          "MACD divergence — price making a new high while the histogram is making a lower high, or vice versa — is a warning that the momentum behind the price move is weakening, even as price continues.",
      },
      {
        q: "Why do MACD crossovers in choppy/sideways markets generate poor signals?",
        options: [
          "Crossovers only work in bear markets",
          "MACD requires high volume to be accurate",
          "Without a real trend, the two EMA lines cross constantly, producing whipsaws",
          "MACD is only accurate on weekly charts",
        ],
        correct: 2,
        explanation:
          "In sideways markets there's no sustained trend to follow, so the two EMAs underlying MACD criss-cross repeatedly, generating frequent crossovers that appear and reverse quickly — classic whipsaw behavior.",
      },
      {
        q: "What combination creates the strongest MACD-based read?",
        options: [
          "MACD crossover alone is sufficient",
          "MACD, RSI, and structure all agreeing — confluence across multiple tools",
          "Using MACD with the highest possible lookback period",
          "Combining MACD with VWAP on weekly charts",
        ],
        correct: 1,
        explanation:
          "MACD is a lagging confirmer. When it agrees with RSI momentum and price structure — multiple independent tools pointing the same way — that confluence carries much more weight than a MACD crossover alone.",
      },
    ],
    girlToGirlTip:
      "MACD, EMA, RSI all read momentum from different angles. All agree = confluence. Cherry-picking one = bias.",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "bollinger-bands",
    title: "Bollinger Bands",
    subtitle: "Shows volatility and stretch — a squeeze hints a move is coming, not which way.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "A moving average with two bands a set distance (standard deviations) above and below — widening when volatility rises, squeezing when it falls.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "To see volatility at a glance and judge whether price is stretched from its average.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "Near the upper band = stretched high; lower band = stretched low. A squeeze (bands pinching) signals low volatility that often precedes a big move.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "A squeeze breaking up leans bullish, down leans bearish — but the squeeze itself is direction-neutral until it breaks.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "The trap: 'price hit the upper band = sell.' In a strong trend price can ride the band a long time. Bands show stretch, not reversal.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Fading every band-touch. Touching a band is normal, not a signal alone.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Bollinger Bands show volatility and stretch — a squeeze hints a move is coming, not which way.\n\nCombine with volume and structure to judge whether a band-touch is exhaustion or strength.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .band { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawLine 2.2s ease forwards; }
    .mid { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawLine 1.8s ease 0.3s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.5s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Upper band -->
  <polyline class="band" points="20,50 70,45 110,55 140,48 175,60 200,80 230,90 270,110 295,130"
    fill="none" stroke="#27B7C8" stroke-width="1.5" opacity="0.7"/>
  <!-- Mid (SMA) -->
  <polyline class="mid" points="20,90 70,88 110,90 140,88 175,90 200,98 230,108 270,118 295,132"
    fill="none" stroke="#F4F7FA" stroke-width="1.8" opacity="0.5" stroke-dasharray="5 3"/>
  <!-- Lower band -->
  <polyline class="band" points="20,130 70,132 110,125 140,128 175,120 200,115 230,125 270,125 295,134"
    fill="none" stroke="#27B7C8" stroke-width="1.5" opacity="0.7" style="animation-delay:0.4s"/>
  <!-- Squeeze zone annotation -->
  <rect x="130" y="82" width="55" height="50" fill="#49B06E" opacity="0.06" rx="3"/>
  <text class="lbl" x="133" y="170" fill="#49B06E" font-size="9" font-family="sans-serif">Squeeze</text>
  <text class="lbl" x="22" y="48" fill="#27B7C8" font-size="9" font-family="sans-serif">Upper band</text>
  <text class="lbl" x="22" y="128" fill="#27B7C8" font-size="9" font-family="sans-serif">Lower band</text>
</svg>`,
    quiz: [
      {
        q: "What does a Bollinger Band squeeze indicate?",
        options: [
          "A strong trend is accelerating",
          "Volume is dropping to unusually low levels",
          "Volatility has contracted, often preceding a larger move",
          "The stock is at a 52-week high",
        ],
        correct: 2,
        explanation:
          "A squeeze — the bands pinching tightly together — signals that volatility has compressed. This coiling of energy often precedes a significant breakout or breakdown, though the bands themselves don't indicate which direction.",
      },
      {
        q: "Why is 'price hit the upper band' not automatically a sell signal?",
        options: [
          "Upper bands only matter on weekly charts",
          "In a strong trend, price can ride the upper band for an extended period",
          "The upper band only applies to downtrends",
          "Bollinger Bands have a lag that delays the upper band signal",
        ],
        correct: 1,
        explanation:
          "In a strong uptrend, price can walk along the upper band — touching or piercing it repeatedly while continuing to rise. Fading every upper-band touch means selling into strength, which is the opposite of a sound framework.",
      },
      {
        q: "What does a widening of the Bollinger Bands indicate?",
        options: [
          "The trend is weakening",
          "Volatility is increasing — price is moving more than average",
          "A reversal is imminent",
          "Volume has dropped significantly",
        ],
        correct: 1,
        explanation:
          "When the bands widen, it means price is making larger moves than the recent average — volatility is expanding. This often happens during news events, breakouts, or periods of strong trending action.",
      },
      {
        q: "What should traders combine with Bollinger Bands to judge a band-touch?",
        options: [
          "More Bollinger Bands with different settings",
          "Volume and price structure to determine if it's exhaustion or continuation",
          "VWAP from the previous session",
          "The 200-day SMA only",
        ],
        correct: 1,
        explanation:
          "A band-touch alone is ambiguous. Volume showing up at the touch — or a price structure reversal — distinguishes a genuine exhaustion signal from price simply hugging a band in a strong trend.",
      },
    ],
    girlToGirlTip:
      "The squeeze is the interesting part — the market loading up. Boring tight bands often come right before the action.",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "volume",
    title: "Volume",
    subtitle: "The conviction behind the move — price is what happened, volume is how much they meant it.",
    difficulty: "Beginner",
    readingMinutes: 4,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "How many shares/contracts traded in a period — the conviction behind a move.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "To judge whether a move is real. Price is what happened; volume is how much they meant it.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "High volume = real participation; low volume = thin, easily reversed. A volume spike can mark a turning point or exhaustion.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "A breakout on rising volume is taken seriously; on quiet volume it's suspect (likely fakeout). Climactic volume at an extreme can signal exhaustion.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "Volume rarely means anything alone — a confirmer, not a standalone signal. Varies by time of day and instrument.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Watching price and ignoring volume — trusting a big move no crowd showed up for.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Volume is the conviction behind the move — it confirms, it doesn't lead.\n\nCombine with everything. Volume is the lie-detector over breakouts, patterns, and candles.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 400; } to { stroke-dashoffset: 0; } }
    @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .price-line { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawLine 1.8s ease forwards; }
    .vol-bar { transform-origin: bottom; animation: growBar 0.4s ease forwards; }
    .lbl { animation: fadeIn 0.4s ease 2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Price -->
  <polyline class="price-line" points="20,100 55,90 90,85 125,75 160,50 195,65 230,70 270,80"
    fill="none" stroke="#F4F7FA" stroke-width="1.8" opacity="0.7"/>
  <!-- Volume bars -->
  <rect class="vol-bar" x="20" y="148" width="16" height="12" fill="#27B7C8" opacity="0.5" rx="2" style="animation-delay:0.1s"/>
  <rect class="vol-bar" x="52" y="143" width="16" height="17" fill="#27B7C8" opacity="0.6" rx="2" style="animation-delay:0.2s"/>
  <rect class="vol-bar" x="84" y="140" width="16" height="20" fill="#27B7C8" opacity="0.65" rx="2" style="animation-delay:0.3s"/>
  <rect class="vol-bar" x="116" y="136" width="16" height="24" fill="#27B7C8" opacity="0.75" rx="2" style="animation-delay:0.4s"/>
  <!-- Breakout candle + big volume spike -->
  <rect class="vol-bar" x="148" y="120" width="16" height="40" fill="#49B06E" opacity="0.9" rx="2" style="animation-delay:0.5s"/>
  <rect class="vol-bar" x="180" y="145" width="16" height="15" fill="#27B7C8" opacity="0.5" rx="2" style="animation-delay:0.6s"/>
  <rect class="vol-bar" x="212" y="148" width="16" height="12" fill="#27B7C8" opacity="0.45" rx="2" style="animation-delay:0.7s"/>
  <text class="lbl" x="138" y="115" fill="#49B06E" font-size="8" font-family="sans-serif">Breakout volume</text>
  <text class="lbl" x="20" y="173" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">High volume = conviction · Low volume = suspect</text>
</svg>`,
    quiz: [
      {
        q: "Why is a breakout on low volume considered suspicious?",
        options: [
          "Low volume always means institutional selling",
          "Without broad participation, the move may lack the conviction to sustain",
          "Volume must exceed the 200-day average to confirm a breakout",
          "Low volume breakouts always reverse within one session",
        ],
        correct: 1,
        explanation:
          "A breakout needs participation to sustain — if few participants show up for the move, there's little evidence of genuine demand or conviction. Low-volume breakouts frequently fail and snap back.",
      },
      {
        q: "What does climactic volume at a price extreme often signal?",
        options: [
          "The trend is just getting started",
          "Possible exhaustion — an emotional last surge before the move reverses",
          "Volume is too high to interpret",
          "Institutional accumulation in progress",
        ],
        correct: 1,
        explanation:
          "A massive volume spike at the end of a long trend can signal exhaustion — a climactic rush where the last buyers/sellers pile in emotionally. This doesn't guarantee reversal, but it's a warning worth noting.",
      },
      {
        q: "Why is volume described as a 'confirmer, not a leader'?",
        options: [
          "Volume always appears one session before the price move",
          "Volume provides context about a price move, not advance warning of one",
          "Volume only confirms moves that happen on Mondays",
          "Volume is only calculated after the market closes",
        ],
        correct: 1,
        explanation:
          "Volume doesn't predict moves — it validates them. When a price move occurs, checking whether volume supported it tells traders whether to trust it. Volume alone, with no price move, says very little.",
      },
      {
        q: "What is the most common mistake traders make with volume?",
        options: [
          "Using volume alongside breakouts and candle patterns",
          "Watching only price and ignoring whether volume supported the move",
          "Comparing volume to the 30-day average",
          "Noting when volume is abnormally high",
        ],
        correct: 1,
        explanation:
          "Ignoring volume when evaluating a price move is the most common mistake. A large candle with no volume behind it is a hollow signal — the crowd didn't show up, making the move far less trustworthy.",
      },
    ],
    girlToGirlTip:
      "A big move on tiny volume is a whisper pretending to be a shout. Real moves bring a crowd.",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "atr",
    title: "ATR (Average True Range)",
    subtitle: "A volatility ruler that sizes expectations — doesn't pick direction.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "The average size of price's moves over a period — pure volatility in price terms. How much something typically moves, not which direction.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "To right-size expectations and risk. A stock swinging $5/day needs more room than one swinging 50 cents.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "Rising ATR = volatility increasing; falling = calming. Directionless — just magnitude.",
      },
      {
        type: "how-read",
        heading: "How It's Used in Reasoning",
        content:
          "Where invalidation gets practical: traders use ATR to judge how much normal 'wiggle' to allow so they aren't shaken out by routine noise — informing how wide a sensible invalidation level is. A concept, not a copyable number.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "Says nothing about direction — using it to predict up/down is a misuse.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Expecting ATR to tell you which way price is going. Not its job.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "ATR measures how much price moves — it sizes expectations, it doesn't pick direction.\n\nCombine with structure, to set realistic expectations around levels.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes growBar { from { transform: scaleY(0); } to { transform: scaleY(1); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .price-line { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 1.8s ease forwards; }
    .atr-bar { transform-origin: bottom; animation: growBar 0.5s ease forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.2s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Price line with varying range -->
  <polyline class="price-line" points="20,90 45,85 60,95 80,80 100,92 120,75 145,60 175,45 195,55 215,42 240,50 270,38"
    fill="none" stroke="#F4F7FA" stroke-width="1.8" opacity="0.6"/>
  <!-- ATR bars (magnitude only, rising) -->
  <rect class="atr-bar" x="25" y="148" width="15" height="10" fill="#27B7C8" opacity="0.55" rx="2" style="animation-delay:0.1s"/>
  <rect class="atr-bar" x="55" y="144" width="15" height="14" fill="#27B7C8" opacity="0.6" rx="2" style="animation-delay:0.2s"/>
  <rect class="atr-bar" x="85" y="140" width="15" height="18" fill="#27B7C8" opacity="0.7" rx="2" style="animation-delay:0.3s"/>
  <rect class="atr-bar" x="115" y="133" width="15" height="25" fill="#27B7C8" opacity="0.8" rx="2" style="animation-delay:0.4s"/>
  <rect class="atr-bar" x="145" y="125" width="15" height="33" fill="#27B7C8" opacity="0.85" rx="2" style="animation-delay:0.5s"/>
  <rect class="atr-bar" x="175" y="118" width="15" height="40" fill="#ef4444" opacity="0.7" rx="2" style="animation-delay:0.6s"/>
  <text class="lbl" x="160" y="112" fill="#ef4444" font-size="8" font-family="sans-serif">ATR rising = more volatility</text>
  <text class="lbl" x="20" y="172" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Magnitude only · No direction signal</text>
</svg>`,
    quiz: [
      {
        q: "What does ATR measure?",
        options: [
          "The direction of the next price move",
          "The average magnitude of price movement over a set period",
          "The volume behind a move",
          "The momentum of the most recent trend",
        ],
        correct: 1,
        explanation:
          "ATR measures the average size of price swings (true range) over a look-back period. It's a pure volatility measure — how much price moves — with no directional information at all.",
      },
      {
        q: "How do traders use ATR when reasoning about invalidation levels?",
        options: [
          "They set the invalidation exactly at 1x ATR below entry, always",
          "ATR helps judge how much normal noise to allow so routine volatility doesn't trigger the invalidation prematurely",
          "ATR shows which direction the invalidation should be placed",
          "ATR is used to calculate position size directly",
        ],
        correct: 1,
        explanation:
          "ATR gives a sense of how much a given instrument typically moves — helping traders calibrate whether their invalidation level has enough room for normal volatility or is so tight that routine noise will hit it before the setup has a chance to develop.",
      },
      {
        q: "What does a rising ATR tell traders?",
        options: [
          "Price is trending upward strongly",
          "Volatility is increasing — price is making bigger moves than before",
          "Volume has dropped below average",
          "The stock is approaching a key resistance level",
        ],
        correct: 1,
        explanation:
          "A rising ATR means the average true range is expanding — price is swinging more than it was recently. This increased volatility affects how much room is appropriate for any given level or trade reasoning.",
      },
      {
        q: "What is a misuse of ATR?",
        options: [
          "Using it to calibrate how much room a trade idea needs",
          "Comparing ATR across different instruments to gauge relative volatility",
          "Using ATR to predict which direction price will move next",
          "Applying ATR to help right-size risk expectations",
        ],
        correct: 2,
        explanation:
          "ATR is directionally blind — it measures magnitude, not direction. Using it to predict whether price will go up or down is a fundamental misread of what the tool does.",
      },
    ],
    girlToGirlTip:
      "ATR is the difference between giving a trade room to breathe and getting shaken out by normal noise. A volatility ruler, nothing more.",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "adx",
    title: "ADX (Average Directional Index)",
    subtitle: "Measures trend strength — whether you're in a trend, not which way.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "The strength of a trend on a 0-100 scale — not direction, just how strong.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "To answer 'is this trending or just chop?' — which decides whether trend tools or range tools fit.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "Below ~20 = weak/no trend (range); above ~25 = a trend with real strength. Rising = strengthening, falling = weakening.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "Direction-neutral on its own — paired with +DI/-DI lines to read which side is winning. High ADX just says the trend, whichever way, is strong.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "Lags, and a high ADX can appear right as a trend is about to exhaust. Strength, not turning points.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Reading ADX as bullish or bearish. It's strength only.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "ADX measures trend strength — whether you're in a trend, not which way.\n\nCombine with structure and a direction tool. ADX confirms whether to trust a trend read; it doesn't supply direction.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .adx { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .price-l { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 1.8s ease 0.2s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.3s forwards; opacity: 0; }
  </style>
  <rect width="320" height="200" fill="#0E1B30" rx="8"/>
  <text x="10" y="15" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">PRICE</text>
  <!-- Price panel: choppy then trending -->
  <polyline class="price-l" points="20,55 45,50 60,58 75,50 90,57 110,52 130,48 155,35 180,25 210,18 245,22 280,15"
    fill="none" stroke="#F4F7FA" stroke-width="1.8" opacity="0.6"/>
  <line x1="10" y1="75" x2="310" y2="75" stroke="#F4F7FA" stroke-width="0.5" opacity="0.2"/>
  <text x="10" y="90" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">ADX</text>
  <!-- 25 threshold -->
  <line x1="20" y1="150" x2="300" y2="150" stroke="#49B06E" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.6"/>
  <!-- ADX line: low during chop, rises as trend builds -->
  <polyline class="adx" points="20,175 45,172 65,170 85,168 105,165 130,158 155,145 180,130 210,118 245,112 280,108"
    fill="none" stroke="#27B7C8" stroke-width="2.5"/>
  <text class="lbl" x="302" y="152" fill="#49B06E" font-size="8" font-family="sans-serif">25</text>
  <text class="lbl" x="22" y="178" fill="#ef4444" font-size="8" font-family="sans-serif" opacity="0.7">Chop (ADX &lt; 20)</text>
  <text class="lbl" x="175" y="126" fill="#49B06E" font-size="8" font-family="sans-serif">Trend (ADX &gt; 25)</text>
</svg>`,
    quiz: [
      {
        q: "What does ADX measure that EMAs and RSI do not?",
        options: [
          "The direction of the trend",
          "Whether a meaningful trend exists at all — trend strength regardless of direction",
          "Volume behind the current move",
          "The distance from price to the moving average",
        ],
        correct: 1,
        explanation:
          "ADX measures trend strength in a direction-neutral way. It doesn't say up or down — it says whether the market is trending strongly or just churning sideways. This is uniquely useful for deciding which tools to apply.",
      },
      {
        q: "What does an ADX reading below 20 generally indicate?",
        options: [
          "A powerful trend is in full force",
          "A bearish trend is underway",
          "Weak or no trend — likely sideways/ranging conditions",
          "The stock is about to break out",
        ],
        correct: 2,
        explanation:
          "ADX below 20 suggests there is little directional conviction in the market — it's likely choppy and sideways. In these conditions, trend-following tools tend to whipsaw and range-trading approaches fit better.",
      },
      {
        q: "Why can high ADX be a warning as much as a confirmation?",
        options: [
          "High ADX always means the trend will reverse immediately",
          "High ADX lags and can appear right as a trend is nearing exhaustion",
          "High ADX causes the +DI/-DI lines to invert",
          "High ADX reduces volume, making moves unreliable",
        ],
        correct: 1,
        explanation:
          "Because ADX lags, it sometimes reaches its highest readings just as a long trend is running out of fuel. Strong ADX confirms that a trend has been strong — it doesn't guarantee it will continue.",
      },
      {
        q: "What direction does an ADX reading of 35 indicate?",
        options: [
          "Strongly bullish",
          "Strongly bearish",
          "No direction — ADX only measures strength, not up or down",
          "The trend is reversing",
        ],
        correct: 2,
        explanation:
          "ADX is entirely direction-neutral. A reading of 35 means a strong trend exists — but whether it's up or down requires looking at the +DI/-DI lines or price structure separately.",
      },
    ],
    girlToGirlTip:
      "ADX is your 'is it worth using trend tools right now?' check. Low ADX? The market's just chopping.",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "stochastic-rsi",
    title: "Stochastic RSI",
    subtitle: "A faster, noisier RSI — great for early shifts, terrible alone.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "RSI run through a stochastic formula — a more sensitive momentum oscillator (0-100) that reacts faster than plain RSI.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "To spot shorter-term momentum extremes and shifts sooner than RSI shows them.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "Above 80 = stretched high, below 20 = stretched low, with two crossing lines (%K and %D) for momentum shifts.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "A cross up from the low zone leans short-term bullish; a cross down from the high zone leans bearish.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "Its sensitivity is its curse — fires constantly, floods of false signals, stays pinned at extremes in strong trends. Noisier than RSI.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Trading every Stoch RSI cross. Most are noise; a magnifying glass, not an oracle.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "A faster, noisier RSI — great for early shifts, terrible alone.\n\nCombine with higher-timeframe context and structure to filter the noise.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .k-line { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawLine 2s ease forwards; }
    .d-line { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawLine 2s ease 0.3s forwards; }
    .price-l { stroke-dasharray: 400; stroke-dashoffset: 400; animation: drawLine 1.6s ease 0.5s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.5s forwards; opacity: 0; }
  </style>
  <rect width="320" height="200" fill="#0E1B30" rx="8"/>
  <text x="10" y="15" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">PRICE</text>
  <polyline class="price-l" points="20,55 55,48 90,52 125,45 160,50 195,42 230,38 270,42"
    fill="none" stroke="#F4F7FA" stroke-width="1.5" opacity="0.5"/>
  <line x1="10" y1="72" x2="310" y2="72" stroke="#F4F7FA" stroke-width="0.5" opacity="0.2"/>
  <!-- Stoch RSI panel -->
  <text x="10" y="86" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">Stoch RSI</text>
  <!-- 80 / 20 lines -->
  <line x1="20" y1="108" x2="300" y2="108" stroke="#ef4444" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.5"/>
  <line x1="20" y1="178" x2="300" y2="178" stroke="#49B06E" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.5"/>
  <!-- Stoch RSI oscillating wildly -->
  <polyline class="k-line" points="20,170 38,112 55,185 72,100 89,188 106,108 123,190 140,105 157,185 174,108 191,175 210,112 228,182 248,105 268,178 290,115"
    fill="none" stroke="#27B7C8" stroke-width="2"/>
  <polyline class="d-line" points="20,162 38,120 55,175 72,112 89,175 106,118 123,175 140,115 157,174 174,118 191,168 210,120 228,170 248,115 268,168 290,125"
    fill="none" stroke="#F4F7FA" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.6"/>
  <text class="lbl" x="302" y="110" fill="#ef4444" font-size="8" font-family="sans-serif">80</text>
  <text class="lbl" x="302" y="180" fill="#49B06E" font-size="8" font-family="sans-serif">20</text>
  <text class="lbl" x="20" y="198" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Fires constantly — filter with context</text>
</svg>`,
    quiz: [
      {
        q: "How does Stochastic RSI differ from standard RSI?",
        options: [
          "Stoch RSI uses volume data while RSI does not",
          "Stoch RSI applies a stochastic formula to RSI, making it more sensitive and faster-reacting",
          "Stoch RSI is calculated over more periods than RSI",
          "Stoch RSI only applies to weekly charts",
        ],
        correct: 1,
        explanation:
          "Stochastic RSI applies the stochastic oscillator formula to RSI values rather than price — compressing them into a 0-100 range and making them more sensitive and quicker to react than plain RSI.",
      },
      {
        q: "What are the %K and %D lines in Stochastic RSI?",
        options: [
          "The 80 and 20 threshold levels",
          "The main Stoch RSI line and its smoothed signal line — crossovers between them hint at momentum shifts",
          "The fast and slow ATR measurements",
          "The bullish and bearish divergence indicators",
        ],
        correct: 1,
        explanation:
          "%K is the main Stochastic RSI line and %D is a smoothed version of it. When %K crosses above %D from the low zone it leans bullish short-term; crossing below from the high zone leans bearish.",
      },
      {
        q: "What is the biggest weakness of Stochastic RSI?",
        options: [
          "It is too slow to catch momentum shifts",
          "It doesn't work in trending markets at all",
          "It fires constantly, flooding traders with false signals",
          "It can only be used on the 1-minute chart",
        ],
        correct: 2,
        explanation:
          "Stoch RSI's sensitivity — its main advantage — is also its main weakness. It generates far more signals than plain RSI, and many of them are noise. Without filtering, it's overwhelming.",
      },
      {
        q: "What context makes a Stochastic RSI cross most meaningful?",
        options: [
          "When it happens on a 5-minute chart",
          "Every cross is equally valid",
          "When it aligns with higher-timeframe context and price structure",
          "When the cross happens exactly at the 50 level",
        ],
        correct: 2,
        explanation:
          "A Stoch RSI cross gains meaning when it agrees with the higher-timeframe trend and happens near a meaningful structure level. Used alone on a short timeframe, most crosses are noise.",
      },
    ],
    girlToGirlTip:
      "Stoch RSI is RSI with too much coffee. Helpful for early hints, but it cries wolf — always filter it.",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "ichimoku-cloud",
    title: "Ichimoku Cloud",
    subtitle: "An all-in-one trend system — start simple: above the cloud, below it, or inside it.",
    difficulty: "Advanced",
    readingMinutes: 6,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "A whole system in one view — a 'cloud' plus several lines showing trend, momentum, and support/resistance at a glance.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "For a fast all-in-one read of trend health without stacking five indicators.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "Simplest read: price above the cloud = bullish environment; below = bearish; inside = unclear/transition. Thicker cloud = stronger support/resistance.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "Price holding above a rising cloud leans bullish; below a falling cloud leans bearish.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "Looks intimidating, clutters the chart, lags, and struggles in choppy markets.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Using all its lines at once as a beginner. Start with just the cloud.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "An all-in-one trend system — start simple: above the cloud, below it, or inside it.\n\nAlready a combination — most use the cloud read plus basic structure rather than piling on more tools.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    .cloud { animation: fadeIn 1s ease forwards; opacity: 0; }
    .price-l { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease 0.8s forwards; }
    .lbl { animation: fadeIn 0.4s ease 2.5s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Cloud (Kumo) - bullish green zone -->
  <polygon class="cloud" points="20,90 90,80 160,75 220,70 300,65 300,100 220,108 160,115 90,120 20,125"
    fill="#27B7C8" opacity="0.12"/>
  <!-- Cloud edges -->
  <polyline points="20,90 90,80 160,75 220,70 300,65" fill="none" stroke="#27B7C8" stroke-width="1" opacity="0.5"/>
  <polyline points="20,125 90,120 160,115 220,108 300,100" fill="none" stroke="#49B06E" stroke-width="1" opacity="0.5"/>
  <!-- Price above cloud (bullish) -->
  <polyline class="price-l" points="20,65 60,55 100,48 140,42 190,38 240,32 285,28"
    fill="none" stroke="#49B06E" stroke-width="2.5"/>
  <text class="lbl" x="22" y="45" fill="#49B06E" font-size="9" font-family="sans-serif">Price (above = bullish)</text>
  <text class="lbl" x="100" y="96" fill="#27B7C8" font-size="9" font-family="sans-serif">Cloud (Kumo)</text>
  <text class="lbl" x="20" y="168" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.4">Above = bullish · Below = bearish · Inside = transition</text>
</svg>`,
    quiz: [
      {
        q: "What is the simplest, most actionable way to read the Ichimoku Cloud?",
        options: [
          "Memorize all five lines and their interactions before using it",
          "Price above the cloud = bullish environment; below = bearish; inside = transition",
          "Use only the Tenkan and Kijun lines",
          "Apply it exclusively to weekly charts",
        ],
        correct: 1,
        explanation:
          "The most practical starting point with Ichimoku is the cloud itself: above = generally bullish conditions, below = bearish, inside = unclear transition. Most of the value comes from this simple three-state read.",
      },
      {
        q: "What does a thicker Ichimoku cloud suggest?",
        options: [
          "The trend is weakening",
          "Volatility is increasing rapidly",
          "Stronger potential support or resistance in that area",
          "The chart is using incorrect settings",
        ],
        correct: 2,
        explanation:
          "The thickness of the cloud represents the strength of support or resistance in that area. A thick cloud suggests a wider, more contested zone that is likely harder for price to push through.",
      },
      {
        q: "Why is Ichimoku described as 'already a combination'?",
        options: [
          "It combines two different charting platforms",
          "It builds trend, momentum, and support/resistance readings into a single system",
          "It combines daily and weekly timeframes automatically",
          "It is a combination of MACD and RSI",
        ],
        correct: 1,
        explanation:
          "Ichimoku was designed to show trend direction, momentum, and potential support/resistance all in one system. This is why most users pair only the cloud with basic structure, rather than stacking additional indicators on top.",
      },
      {
        q: "What is the most common Ichimoku beginner mistake?",
        options: [
          "Starting with just the cloud for the basic read",
          "Combining the cloud with price structure",
          "Trying to use all five lines simultaneously before understanding each one",
          "Applying it to trending markets",
        ],
        correct: 2,
        explanation:
          "Ichimoku has five components and can look overwhelming. Beginners who try to interpret all lines at once often end up confused and paralyzed. Starting with just 'above the cloud / below the cloud / inside the cloud' captures most of the practical value.",
      },
    ],
    girlToGirlTip:
      "Don't let the cloud overwhelm you. 'Above or below the cloud?' gets you 80% of the value with none of the headache.",
    videoSlot: null,
  },

  {
    module: "m3-indicators",
    slug: "fibonacci-retracement",
    title: "Fibonacci Retracement",
    subtitle: "Marks common pullback zones — a guide, never a guarantee, strongest over real structure.",
    difficulty: "Advanced",
    readingMinutes: 5,
    sections: [
      {
        type: "overview",
        heading: "What It Measures",
        content:
          "A set of horizontal levels (38.2%, 50%, 61.8%) drawn across a move, marking spots where a pullback might find interest before the trend resumes.",
      },
      {
        type: "why-matters",
        heading: "Why Traders Use It",
        content:
          "To anticipate where a healthy pullback could pause — common zones where buyers/sellers re-engage.",
      },
      {
        type: "how-identify",
        heading: "How to Read It",
        content:
          "Drawn swing low to swing high (or vice versa). The 50%-61.8% 'golden pocket' is the most-watched pullback zone.",
      },
      {
        type: "how-read",
        heading: "Bullish / Bearish",
        content:
          "In an uptrend, a pullback holding a Fib level and resuming up reads as healthy; slicing through them all suggests it was more than a pullback.",
      },
      {
        type: "psychology",
        heading: "Weaknesses / When NOT to Rely on It",
        content:
          "Somewhat self-fulfilling and subjective — where you anchor the swing changes every level. Price respects Fibs until it ignores them.",
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content:
          "Treating Fib levels as magic. Zones of interest, not guaranteed turns.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content:
          "Fibs mark common pullback zones — a guide, never a guarantee, strongest when they overlap real structure.\n\nCombine with real structure and candle reads. A Fib lining up with actual support/resistance matters far more than a Fib alone.\n\nEducational only. Not financial advice. No indicator guarantees an outcome — every one gives false signals, and they work best combined with price action.",
      },
    ],
    diagram: `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px">
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .price-l { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .fib-l { animation: fadeIn 0.3s ease forwards; opacity: 0; }
    .lbl { animation: fadeIn 0.4s ease 2.3s forwards; opacity: 0; }
  </style>
  <rect width="320" height="180" fill="#0E1B30" rx="8"/>
  <!-- Fib levels (38.2, 50, 61.8) drawn on a pullback -->
  <line class="fib-l" x1="20" y1="45" x2="300" y2="45" stroke="#F4F7FA" stroke-width="0.8" opacity="0.3" style="animation-delay:0.3s"/>
  <line class="fib-l" x1="20" y1="75" x2="300" y2="75" stroke="#27B7C8" stroke-width="1.2" stroke-dasharray="5 3" opacity="0.6" style="animation-delay:0.5s"/>
  <line class="fib-l" x1="20" y1="95" x2="300" y2="95" stroke="#49B06E" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7" style="animation-delay:0.7s"/>
  <line class="fib-l" x1="20" y1="110" x2="300" y2="110" stroke="#49B06E" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.7" style="animation-delay:0.9s"/>
  <line class="fib-l" x1="20" y1="145" x2="300" y2="145" stroke="#F4F7FA" stroke-width="0.8" opacity="0.3" style="animation-delay:1.1s"/>
  <!-- Price: up, pullback to 61.8, resume -->
  <polyline class="price-l" points="20,145 60,120 100,90 140,55 180,45 200,55 220,85 240,108 255,105 270,85 290,60"
    fill="none" stroke="#F4F7FA" stroke-width="2" opacity="0.7"/>
  <text class="lbl" x="270" y="42" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">0%</text>
  <text class="lbl" x="270" y="72" fill="#27B7C8" font-size="8" font-family="sans-serif">38.2%</text>
  <text class="lbl" x="270" y="92" fill="#49B06E" font-size="8" font-family="sans-serif">50%</text>
  <text class="lbl" x="270" y="107" fill="#49B06E" font-size="8" font-family="sans-serif">61.8% ← golden pocket</text>
  <text class="lbl" x="270" y="142" fill="#F4F7FA" font-size="8" font-family="sans-serif" opacity="0.5">100%</text>
</svg>`,
    quiz: [
      {
        q: "What are Fibonacci retracement levels marking on a chart?",
        options: [
          "Exact price targets where a trend will end",
          "Common zones where a pullback within a trend might pause and find interest",
          "Guaranteed support levels derived from market microstructure",
          "The average highs and lows of the past 20 sessions",
        ],
        correct: 1,
        explanation:
          "Fibonacci retracement levels mark zones — derived from mathematical ratios — where pullbacks within a trend commonly pause and attract participation. They're areas of potential interest, not guaranteed turning points.",
      },
      {
        q: "What is the 'golden pocket' in Fibonacci retracement?",
        options: [
          "The exact midpoint of any price move",
          "The zone between the 50% and 61.8% retracement levels",
          "The 100% retracement back to the swing start",
          "The area between 23.6% and 38.2%",
        ],
        correct: 1,
        explanation:
          "The 50%-61.8% zone is widely called the 'golden pocket' — the most-watched Fibonacci retracement area. In a healthy trend pullback, this zone tends to attract the most attention from traders watching for the trend to resume.",
      },
      {
        q: "Why are Fibonacci levels called 'somewhat self-fulfilling'?",
        options: [
          "They are automatically accurate due to mathematical laws",
          "Many traders watching the same levels creates reaction zones through collective attention",
          "Fibonacci levels are built into most trading algorithms automatically",
          "They always align with the 200-day SMA",
        ],
        correct: 1,
        explanation:
          "Fibonacci levels work in part because many traders are watching the same zones. When enough participants expect a level to matter and act on it, the level can become self-reinforcing — a collective belief creating the outcome.",
      },
      {
        q: "When do Fibonacci levels carry the most weight?",
        options: [
          "When used on 1-minute charts for intraday scalping",
          "When they float independently without any nearby price structure",
          "When a Fibonacci level aligns with actual price structure — real support or resistance",
          "When price is in the middle of a ranging market",
        ],
        correct: 2,
        explanation:
          "A Fibonacci level that coincides with a real price structure level — prior support, a swing low, or a consolidation zone — carries far more weight than a Fibonacci level floating alone with no other evidence behind it.",
      },
    ],
    girlToGirlTip:
      "Fibs work best when they agree with something real. On actual support? Now you're talking. Floating alone? Take it lightly.",
    videoSlot: null,
  },
];

export function getM3LessonBySlug(slug: string): UniversityLesson | undefined {
  return M3_LESSONS.find((l) => l.slug === slug);
}
