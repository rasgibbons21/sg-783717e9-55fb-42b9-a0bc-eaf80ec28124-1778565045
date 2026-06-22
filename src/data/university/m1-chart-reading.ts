export interface LessonSection {
  type: "overview" | "why-matters" | "how-identify" | "psychology" | "how-read" | "mistakes" | "takeaway";
  heading: string;
  content: string;
}

export interface QuizQuestion {
  q: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface UniversityLesson {
  module: string;
  slug: string;
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readingMinutes: number;
  sections: LessonSection[];
  diagram: string;
  quiz: QuizQuestion[];
  girlToGirlTip: string;
  videoSlot: null;
}

export const M1_LESSONS: UniversityLesson[] = [
  // ─── Lesson 1: Candlesticks ───────────────────────────────────────────────
  {
    module: "M1",
    slug: "candlesticks",
    title: "Candlesticks",
    subtitle: "Reading the language of price action one bar at a time",
    difficulty: "Beginner",
    readingMinutes: 8,
    sections: [
      {
        type: "overview",
        heading: "What Is a Candlestick?",
        content:
          "A candlestick is a single visual unit that captures four prices for a given time period: the open, the high, the low, and the close. Japanese rice traders developed this charting style in the 18th century, and it remains the dominant chart type used by technical traders worldwide today.\n\nThe rectangular body of the candle spans the distance between the open and close price. Thin lines extending above and below that body — called wicks or shadows — mark the session's highest and lowest traded prices. When the close sits above the open, the body is typically rendered in a bullish color (often green or white). When the close sits below the open, the body is rendered in a bearish color (often red or black).\n\nPatterns fail constantly, and no single candlestick reading guarantees profits. What candlesticks offer is a structured way to observe the balance of buying and selling pressure within each time period — a starting point for analysis, never a final verdict.",
      },
      {
        type: "why-matters",
        heading: "Why Candlesticks Matter",
        content:
          "Candlesticks compress enormous amounts of market information into a format the human eye can process at a glance. A single candle reveals not just where price ended up, but the journey it took — whether buyers overwhelmed sellers near the close, or whether sellers clawed back gains that buyers had built up earlier in the session.\n\nThis context matters because markets are driven by human emotion and institutional positioning. A small body with long wicks on both sides tells a different story than a wide-bodied candle with almost no wicks. The first suggests indecision; the second suggests conviction. Neither reading is infallible, but both add texture to the analysis that a simple line chart would hide.\n\nTraders who understand candlestick anatomy can begin to read the emotional undercurrent of the market — fear, greed, exhaustion — encoded in the shapes that price leaves behind.",
      },
      {
        type: "how-identify",
        heading: "Key Candlestick Patterns to Recognize",
        content:
          "The doji is one of the most recognized single-candle signals. It forms when the open and close are nearly identical, leaving a cross-shaped candle with visible wicks. A doji inside a trend suggests the dominant side is losing momentum — though it rarely signals a reversal on its own.\n\nThe hammer appears at the bottom of a downtrend: a small body sits at the top of the candle range, with a long lower wick. The wick shows that sellers pushed price down aggressively during the session, but buyers recovered most of those losses before the close — a sign of potential demand.\n\nThe engulfing pattern is a two-candle formation. A bullish engulfing sees a large bullish candle fully absorb the prior bearish candle's body, suggesting buying pressure overwhelmed the previous session's sellers. A bearish engulfing is the mirror image. These patterns carry more weight when they appear at recognized support or resistance zones — context always amplifies or diminishes the signal.",
      },
      {
        type: "psychology",
        heading: "The Psychology Encoded in Each Candle",
        content:
          "Every candlestick is a summary of a battle. The open marks where the session began. The high marks how far buyers were able to push price before meeting resistance. The low marks how far sellers were able to push price before meeting support. The close reveals who won the session.\n\nA candle that closes near its high, with a long lower wick and a small upper wick, shows that buyers stepped in aggressively when price dipped, and they maintained control into the close. That is a picture of bullish conviction. A candle that closes near its low, leaving a long upper wick, shows that a rally was sold into — a picture of bearish conviction.\n\nTraders who internalize this psychological layer start to see candlestick charts as a real-time narrative of supply and demand tension rather than a simple price record. That shift in perspective is foundational to more advanced pattern recognition.",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes With Candlesticks",
        content:
          "One of the most common mistakes is treating single candlestick patterns as standalone signals divorced from context. A hammer at the top of an uptrend does not carry the same implication as a hammer at a major support level after a prolonged selloff. Context — trend direction, nearby levels, volume — determines whether a pattern has edge or is simply noise.\n\nAnother frequent error is acting on every pattern seen rather than waiting for high-quality setups at meaningful locations. Candlestick patterns appear constantly on every chart and every timeframe. The majority of them resolve without producing any meaningful move. Selectivity — waiting for confluence — dramatically changes the calculus.\n\nFinally, many newer market participants confuse the pattern with the trade. A bullish engulfing is an observation about price behavior. Whether that observation becomes a trade idea requires additional analysis of trend, structure, volume, and risk — patterns fail constantly, and nothing guarantees profits.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaways",
        content:
          "Candlesticks are the vocabulary of price action. Each candle encodes four data points — open, high, low, close — and the relationship between them tells a story about who controlled the session.\n\nThe most powerful candlestick readings appear in context: at recognized support or resistance levels, within clear trends, confirmed by volume. Isolated from context, even textbook-perfect candle patterns carry little predictive value.\n\nBuilding fluency with candlestick anatomy is the first step toward reading charts confidently. The next lessons in this module build on this foundation by introducing the levels and structures that give individual candles their greatest meaning.",
      },
    ],
    diagram: `<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='background:#0E1B30;border-radius:8px;'>
  <style>
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes wickGrow { from { transform:scaleY(0); transform-origin:center; } to { transform:scaleY(1); } }
    .candle1 { animation: fadeUp 0.6s ease forwards; }
    .candle2 { animation: fadeUp 0.6s ease 0.3s forwards; opacity:0; }
    .candle3 { animation: fadeUp 0.6s ease 0.6s forwards; opacity:0; }
    .candle4 { animation: fadeUp 0.6s ease 0.9s forwards; opacity:0; }
    .label { font-family:sans-serif; font-size:10px; fill:#F4F7FA; }
    .sublabel { font-family:sans-serif; font-size:8px; fill:#27B7C8; }
  </style>
  <!-- Bullish candle -->
  <g class='candle1'>
    <line x1='70' y1='40' x2='70' y2='160' stroke='#49B06E' stroke-width='1.5'/>
    <rect x='58' y='80' width='24' height='55' fill='#49B06E' rx='2'/>
    <text x='70' y='175' class='label' text-anchor='middle'>Bullish</text>
  </g>
  <!-- Doji candle -->
  <g class='candle2'>
    <line x1='150' y1='45' x2='150' y2='155' stroke='#F4F7FA' stroke-width='1.5'/>
    <rect x='138' y='98' width='24' height='4' fill='#F4F7FA' rx='1'/>
    <text x='150' y='175' class='label' text-anchor='middle'>Doji</text>
  </g>
  <!-- Bearish candle -->
  <g class='candle3'>
    <line x1='230' y1='40' x2='230' y2='160' stroke='#E05555' stroke-width='1.5'/>
    <rect x='218' y='65' width='24' height='55' fill='#E05555' rx='2'/>
    <text x='230' y='175' class='label' text-anchor='middle'>Bearish</text>
  </g>
  <!-- Hammer candle -->
  <g class='candle4'>
    <line x1='310' y1='60' x2='310' y2='160' stroke='#49B06E' stroke-width='1.5'/>
    <rect x='298' y='55' width='24' height='18' fill='#49B06E' rx='2'/>
    <text x='310' y='175' class='label' text-anchor='middle'>Hammer</text>
  </g>
  <!-- Labels -->
  <text x='200' y='20' class='sublabel' text-anchor='middle'>Candlestick Anatomy</text>
</svg>`,
    quiz: [
      {
        q: "What four prices does a single candlestick represent?",
        options: [
          "Open, High, Low, Close",
          "Open, Volume, Average, Close",
          "High, Low, Average, Volume",
          "Open, Close, Average, Median",
        ],
        correct: 0,
        explanation:
          "A candlestick encodes Open, High, Low, and Close (OHLC). The body spans open to close; the wicks extend to the high and low.",
      },
      {
        q: "A doji candlestick is characterized by:",
        options: [
          "A very long body with no wicks",
          "Open and close at nearly the same price",
          "A close far above the open",
          "A gap between the wick and the body",
        ],
        correct: 1,
        explanation:
          "A doji forms when the open and close are nearly identical, creating a cross shape. It signals indecision between buyers and sellers — neither side dominated the session.",
      },
      {
        q: "Which statement about candlestick patterns is most accurate?",
        options: [
          "A bullish engulfing always signals a price reversal",
          "Candlestick patterns work best in isolation from other analysis",
          "Patterns carry more weight when they appear at recognized support or resistance levels",
          "Doji candles only form on daily charts",
        ],
        correct: 2,
        explanation:
          "Context amplifies candlestick signals. A bullish engulfing at a major support zone, confirmed by volume, is far more meaningful than the same pattern in the middle of a range. Patterns fail constantly without confluence.",
      },
      {
        q: "The long lower wick on a hammer candle indicates:",
        options: [
          "Sellers dominated the entire session",
          "Price gapped down at the open",
          "Buyers recovered most of the session's losses before the close",
          "The high and low were the same",
        ],
        correct: 2,
        explanation:
          "The long lower wick shows price was pushed significantly lower during the session, but buyers stepped in and drove price back up near the open level before the close — a sign of demand absorbing selling pressure.",
      },
    ],
    girlToGirlTip:
      "Girl, before you memorize every pattern name out there — just start with the body and the wicks. Is the body big or tiny? Are there long wicks? That alone tells you so much about who was in control. The names come naturally once you see enough charts.",
    videoSlot: null,
  },

  // ─── Lesson 2: Support & Resistance ──────────────────────────────────────
  {
    module: "M1",
    slug: "support-and-resistance",
    title: "Support & Resistance",
    subtitle: "The invisible floors and ceilings that shape every chart",
    difficulty: "Beginner",
    readingMinutes: 9,
    sections: [
      {
        type: "overview",
        heading: "What Are Support and Resistance?",
        content:
          "Support and resistance are price levels where buying or selling pressure has historically been strong enough to slow or reverse a move. Support is a level where price has previously found demand — buyers stepped in and pushed price back up. Resistance is a level where price has previously met supply — sellers emerged and pushed price back down.\n\nThese levels are not magic lines drawn by any single authority. They emerge organically from the collective behavior of market participants who remember where price bounced or reversed in the past and who tend to act in similar ways when price revisits those zones.\n\nPatterns fail constantly, and support and resistance levels break all the time — nothing guarantees profits from trading these levels. But understanding where they sit, and why market participants watch them, is foundational to reading any chart.",
      },
      {
        type: "why-matters",
        heading: "Why Support and Resistance Matter",
        content:
          "Markets have memory. When price spends time at a certain level — bouncing off it, stalling at it, or breaking through it with force — that level becomes psychologically significant. Traders, institutions, and algorithms all reference historical price levels when making decisions.\n\nSupport and resistance levels create structure on charts. They define the zones where the probability of a reaction is elevated — not guaranteed, but elevated relative to random price locations. This makes them useful anchors for assessing where a trend might pause, where momentum might re-emerge, or where a breakout scenario becomes relevant.\n\nWithout identifying support and resistance, a trader is essentially navigating without a map. Every trade idea becomes disconnected from the structural context that gives it context and meaning.",
      },
      {
        type: "how-identify",
        heading: "How to Identify Key Levels",
        content:
          "The most reliable support and resistance levels are those where price has interacted multiple times. A level that has been tested three or more times — even on different timeframes — tends to be more significant than one that produced only a single bounce.\n\nSwing highs and swing lows are the primary building blocks. A swing high is a peak where price reversed downward. A swing low is a trough where price reversed upward. When price returns to these areas, traders watch to see whether the historical participants step in again or whether the level gives way.\n\nRound numbers also act as informal support and resistance. Price levels ending in 00 or 50 attract attention because human beings naturally anchor to round figures. Institutions often set limit orders at these levels, giving them a self-fulfilling dimension. A prior area of support that is broken can then become resistance — and vice versa — a concept known as role reversal.",
      },
      {
        type: "psychology",
        heading: "The Psychology Behind the Levels",
        content:
          "When price falls to a support level, three groups of traders become active. Those who are already long from lower prices add to their positions or hold firm. Those who missed the original move wait to buy at the support they've identified. And those who are short begin to take profits or feel the pressure to cover. The combined effect of these behaviors creates buying interest that can slow or reverse the decline.\n\nAt resistance, the dynamic inverts. Longs from lower prices begin to take profits. Would-be sellers who have been waiting for price to reach a favorable level enter short. Buyers who chased the move start to question their positions. Together, these flows create selling pressure that can stall or reverse the advance.\n\nThis psychological interplay is why levels work even though no single entity controls them — they are emergent phenomena born from the collective memory and behavior of market participants.",
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content:
          "A frequent error is treating support and resistance as precise price points rather than zones. Price rarely reverses at the exact tick of a prior level. More commonly it overshoots slightly, tests the zone, and then responds. Traders who expect pixel-perfect precision will often be stopped out of otherwise valid ideas by small violations that do not represent true breakdowns.\n\nAnother mistake is over-drawing levels and cluttering the chart with lines at every minor swing. The most useful levels are the ones that jump out as significant even at a glance — major peaks, major troughs, and areas where price has clearly reacted multiple times. Five clean, meaningful levels are far more useful than twenty marginal ones.\n\nFinally, many traders forget that all levels eventually break. A level's strength is not infinite. When a breakout occurs with conviction and volume, treating the broken level as still valid can be costly. The textbook read is that broken support becomes resistance and broken resistance becomes support — but this too fails sometimes. Context always requires a fresh assessment.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaways",
        content:
          "Support and resistance are among the most universally referenced concepts in technical analysis because they reflect the collective memory and psychology of market participants. They are not infallible, but they are among the most consistently observed phenomena in price action.\n\nThe strongest levels are those tested multiple times, visible on higher timeframes, and confirmed by behavioral signals like volume expansion or candlestick patterns at the zone. Single-touch levels are less reliable unless the initial reaction was sharp and decisive.\n\nReading support and resistance well requires zooming out before zooming in — understanding the larger structural picture before examining short-term wiggles. This skill compounds powerfully with the trendline and market structure lessons that follow.",
      },
    ],
    diagram: `<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='background:#0E1B30;border-radius:8px;'>
  <style>
    @keyframes dash { to { stroke-dashoffset: 0; } }
    @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
    .sr-line { stroke-dasharray:200; stroke-dashoffset:200; animation: dash 1.5s ease forwards; }
    .price-dot { animation: bounce 2s ease-in-out infinite; }
    .label { font-family:sans-serif; font-size:10px; fill:#F4F7FA; }
    .sublabel { font-family:sans-serif; font-size:8px; fill:#27B7C8; }
  </style>
  <!-- Resistance line -->
  <line x1='30' y1='60' x2='370' y2='60' stroke='#E05555' stroke-width='1.5' stroke-dasharray='6 3' class='sr-line'/>
  <text x='32' y='55' class='label' fill='#E05555'>Resistance</text>
  <!-- Support line -->
  <line x1='30' y1='150' x2='370' y2='150' stroke='#49B06E' stroke-width='1.5' stroke-dasharray='6 3' class='sr-line' style='animation-delay:0.4s;'/>
  <text x='32' y='168' class='label' fill='#49B06E'>Support</text>
  <!-- Price path -->
  <polyline points='30,130 80,110 120,160 160,95 200,155 240,70 280,110 320,65 360,100' fill='none' stroke='#27B7C8' stroke-width='2'/>
  <!-- Touch dots -->
  <circle cx='120' cy='160' r='4' fill='#49B06E' class='price-dot'/>
  <circle cx='200' cy='155' r='4' fill='#49B06E' class='price-dot' style='animation-delay:0.3s;'/>
  <circle cx='240' cy='70' r='4' fill='#E05555' class='price-dot' style='animation-delay:0.6s;'/>
  <circle cx='320' cy='65' r='4' fill='#E05555' class='price-dot' style='animation-delay:0.9s;'/>
  <text x='200' y='20' class='sublabel' text-anchor='middle'>Support and Resistance Zones</text>
</svg>`,
    quiz: [
      {
        q: "What does 'role reversal' mean in the context of support and resistance?",
        options: [
          "A support level that has never been broken",
          "A broken support level that subsequently acts as resistance",
          "A resistance level that doubles in strength after a bounce",
          "A level that only matters on weekly charts",
        ],
        correct: 1,
        explanation:
          "Role reversal refers to the phenomenon where a prior support level, once clearly broken, tends to act as resistance on subsequent retests — and vice versa. This occurs because the psychology of the participant groups at that level inverts after the break.",
      },
      {
        q: "Why are levels that have been tested multiple times considered more significant?",
        options: [
          "They are guaranteed to hold on the next test",
          "Multiple tests mean more participants have used that level, reinforcing the psychological importance",
          "Levels weaken on each test and become useless quickly",
          "Only levels tested more than ten times are tradeable",
        ],
        correct: 1,
        explanation:
          "Each test of a level represents another group of participants anchoring their decisions to that price. More tests mean a broader pool of market participants are watching and acting at that level, which generally increases the level's significance — though no level holds forever.",
      },
      {
        q: "Why should support and resistance be treated as zones rather than exact price points?",
        options: [
          "Because charting software rounds prices to the nearest zone",
          "Because price rarely reverses at the exact tick of a prior level and small violations are common",
          "Because zones are easier to draw",
          "Because exact levels only matter on tick charts",
        ],
        correct: 1,
        explanation:
          "Price action is inherently imprecise. Markets often test slightly beyond a prior level before reversing — a behavior sometimes called a 'stop hunt' or 'wick through.' Treating levels as zones rather than points prevents being invalidated by these small overshoots.",
      },
      {
        q: "Which of the following is the most reliable sign that a support level has genuinely broken?",
        options: [
          "Price touched the level once and bounced",
          "A small candle wick pierced the level briefly during low volume",
          "Price closed decisively below the level with expanding volume",
          "The level was created less than a month ago",
        ],
        correct: 2,
        explanation:
          "A decisive close below a support level — especially on expanding volume — is the strongest signal of a genuine break. Wick violations without follow-through closes are often noise rather than true breakdowns.",
      },
    ],
    girlToGirlTip:
      "Girl, here is the cheat code: zoom out to the daily or weekly chart first and draw the big obvious lines — the ones even your non-trading friend would notice. Those are your power levels. The tiny hourly squiggles can come later, once you have the map.",
    videoSlot: null,
  },

  // ─── Lesson 3: Trendlines ─────────────────────────────────────────────────
  {
    module: "M1",
    slug: "trendlines",
    title: "Trendlines",
    subtitle: "Connecting the dots to reveal the direction price is traveling",
    difficulty: "Beginner",
    readingMinutes: 7,
    sections: [
      {
        type: "overview",
        heading: "What Is a Trendline?",
        content:
          "A trendline is a straight line drawn across a series of successive swing points to visualize the direction and angle of a prevailing trend. In an uptrend, the line connects rising swing lows. In a downtrend, the line connects declining swing highs. The line itself represents a dynamic level of support or resistance that moves with the trend.\n\nTrendlines are one of the oldest tools in technical analysis and remain widely used because they force an observer to focus on the directional slope of price rather than just individual levels. The steepness of the trendline communicates something about the momentum and sustainability of the move.\n\nPatterns fail constantly, and trendlines break regularly — nothing guarantees profits from monitoring trendline behavior. What they provide is a visual framework for tracking whether a trend is intact, losing momentum, or reversing.",
      },
      {
        type: "why-matters",
        heading: "Why Trendlines Matter",
        content:
          "Trends persist because the forces driving them — economic fundamentals, institutional accumulation, sentiment shifts — don't resolve overnight. A trendline makes the trend visible and gives observers a reference point for assessing whether that persistence is continuing or breaking down.\n\nWhen price returns to a rising trendline during an uptrend and holds, it suggests the buyers driving the trend are still present and willing to step in at higher prices than before. This is the definition of a healthy uptrend. Conversely, when price begins to violate trendlines repeatedly, it suggests the underlying dynamic is shifting.\n\nTrendlines are also useful for communicating the pace of a move. A steeply angled trendline indicates rapid price movement — which can be powerful but is often unsustainable. Shallower trendlines represent more measured, sustainable trends that can persist for much longer periods.",
      },
      {
        type: "how-identify",
        heading: "How to Draw Trendlines Correctly",
        content:
          "Valid uptrend lines connect at least two ascending swing lows, with the line sloping upward from left to right. A third touch that holds adds significant validity. The more touches, the more participants have observed and acted on that line — and the more significant a break of the line becomes.\n\nFor downtrend lines, the line connects descending swing highs. Each time price rallies back to that line and fails to break through, it confirms that supply continues to overwhelm demand at progressively lower prices.\n\nA common question is whether to use candle bodies or wicks for drawing. Both approaches have merit. Using wick extremes captures the full range of price tested; using bodies focuses on where price was sustained. Neither is universally correct — consistency within a personal methodology matters more than which method is chosen. What traders want to avoid is adjusting the line retroactively to fit every new data point, which removes its predictive value.",
      },
      {
        type: "psychology",
        heading: "The Psychology of Trendline Tests",
        content:
          "Each return to a trendline during a trend represents a moment of tension. Trend-followers who bought at the previous touch are watching to see if the line holds again. New participants who missed the earlier entries are waiting for a pullback to the line as a potential entry location. Those who are betting against the trend are watching for a break.\n\nWhen the line holds again, those three groups respond in a way that reinforces the trend: trend-followers are validated, new participants enter, and those betting against are forced to cut losses. The very act of watching the same line creates the behavior that makes the line work.\n\nWhen a trendline breaks — particularly with a decisive close through the line on expanding volume — the psychological calculus inverts. The group that was reinforcing the trend now becomes a source of selling as longs exit. The trendline break itself becomes news that changes behavior.",
      },
      {
        type: "mistakes",
        heading: "Common Trendline Mistakes",
        content:
          "One of the most common mistakes is drawing trendlines through candle bodies rather than connecting genuine swing points, and then adjusting the line every time price misbehaves to keep it 'valid.' This produces a line that describes the past perfectly but has no predictive relationship to future price behavior.\n\nAnother frequent error is treating a single wick violation of a trendline as a definitive break. Price often tests slightly beyond a trendline before recovering — especially in volatile markets or around news events. A close through the line, sustained on subsequent candles, carries far more weight than a momentary intraday wick.\n\nFinally, traders sometimes anchor too rigidly to a single trendline while ignoring broader structural changes. When market structure shifts — the pattern of higher highs and higher lows breaks, for example — that is often more significant than any trendline. Trendlines are tools, not the whole picture.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaways",
        content:
          "Trendlines visualize the directional momentum of price and provide a dynamic reference point that moves with the trend. They are among the most intuitive tools in charting, which also means they are watched by enormous numbers of participants simultaneously.\n\nThe most meaningful trendlines have at least three touches, slope consistently in one direction, and are drawn from genuine swing points rather than arbitrary price locations. A break of a well-established trendline on strong volume is one of the more meaningful signals a chart can produce.\n\nCombining trendlines with support/resistance levels and candlestick behavior at the line creates a richer analysis than any one tool in isolation. The following lessons on volume and market structure will add further layers to this foundation.",
      },
    ],
    diagram: `<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='background:#0E1B30;border-radius:8px;'>
  <style>
    @keyframes drawLine { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
    @keyframes pop { from { r: 0; } to { r: 5; } }
    .trendline { stroke-dasharray: 500; stroke-dashoffset: 500; animation: drawLine 2s ease forwards; }
    .touch { animation: pop 0.4s ease forwards; }
    .t2 { animation-delay: 0.6s; }
    .t3 { animation-delay: 1.2s; }
    .label { font-family:sans-serif; font-size:10px; fill:#F4F7FA; }
    .sublabel { font-family:sans-serif; font-size:8px; fill:#27B7C8; }
  </style>
  <!-- Uptrend price line -->
  <polyline points='30,170 70,155 100,130 140,120 180,100 220,80 260,65 300,50 360,30' fill='none' stroke='#27B7C8' stroke-width='2'/>
  <!-- Trendline connecting swing lows -->
  <line x1='30' y1='170' x2='370' y2='50' stroke='#49B06E' stroke-width='2' stroke-dasharray='6 3' class='trendline'/>
  <!-- Touch points -->
  <circle cx='30' cy='170' r='5' fill='#49B06E' class='touch'/>
  <circle cx='140' cy='120' r='5' fill='#49B06E' class='touch t2'/>
  <circle cx='260' cy='65' r='5' fill='#49B06E' class='touch t3'/>
  <text x='135' y='140' class='label' fill='#49B06E'>Touch 2</text>
  <text x='255' y='85' class='label' fill='#49B06E'>Touch 3</text>
  <text x='22' y='190' class='label' fill='#49B06E'>Touch 1</text>
  <text x='200' y='20' class='sublabel' text-anchor='middle'>Uptrend Trendline — 3 Valid Touches</text>
</svg>`,
    quiz: [
      {
        q: "A valid uptrend trendline connects:",
        options: [
          "Declining swing highs from left to right",
          "At least two ascending swing lows from left to right",
          "Any two price points the trader chooses",
          "The highest and lowest points on the chart",
        ],
        correct: 1,
        explanation:
          "An uptrend trendline connects ascending swing lows — each low is higher than the previous. This slope captures the trend's direction and serves as a dynamic support reference during the trend.",
      },
      {
        q: "What does a very steep trendline angle generally suggest?",
        options: [
          "The trend is particularly slow and sustainable",
          "The trend is moving rapidly but may be difficult to sustain long-term",
          "The trendline is incorrectly drawn",
          "Volume must be declining",
        ],
        correct: 1,
        explanation:
          "Steep trendlines reflect rapid price movement. While powerful in the short term, extremely steep trends often prove unsustainable because the underlying momentum is difficult to maintain. Shallower trends tend to persist longer.",
      },
      {
        q: "When does a trendline break carry the most significance?",
        options: [
          "When price dips one tick below the line intraday",
          "When a wick briefly pierces the line during low volume",
          "When price closes decisively through the line, sustained on subsequent candles",
          "On the very first day a trendline is drawn",
        ],
        correct: 2,
        explanation:
          "A decisive close through the trendline — particularly one that is sustained rather than immediately recovered — is the most meaningful signal of a genuine break. Single-candle wick violations are often noise, especially in volatile markets.",
      },
      {
        q: "Adding a third touch to a trendline is important because:",
        options: [
          "Charts require exactly three lines to be valid",
          "It confirms that more participants have observed and acted on that level, increasing its significance",
          "Only three-touch trendlines are allowed under trading regulations",
          "It removes the need to analyze volume",
        ],
        correct: 1,
        explanation:
          "A third touch that holds confirms the trendline's significance to a broader audience. More participants watching and acting on the same line creates a self-reinforcing dynamic — and also makes a break of the line more meaningful when it eventually occurs.",
      },
    ],
    girlToGirlTip:
      "When a trendline first gets a third touch, that is the moment a lot of traders really start paying attention. It is not that two-touch lines are useless — they just haven't proven themselves yet. Three is when the crowd starts to lean on it, girl.",
    videoSlot: null,
  },

  // ─── Lesson 4: Volume ────────────────────────────────────────────────────
  {
    module: "M1",
    slug: "volume",
    title: "Volume",
    subtitle: "The fuel that confirms or questions every price move",
    difficulty: "Beginner",
    readingMinutes: 8,
    sections: [
      {
        type: "overview",
        heading: "What Is Volume?",
        content:
          "Volume is the total number of shares, contracts, or units traded during a given time period. It appears on charts as a series of vertical bars below the price panel — taller bars represent higher-volume periods, shorter bars represent lower-volume periods.\n\nIf price is the 'what' of a market move — where price went — then volume is the 'how much' — how many participants were engaged in driving it there. A price move backed by heavy participation carries a different quality than the same price move on thin, low-participation conditions.\n\nPatterns fail constantly, and volume analysis is no exception — nothing guarantees profits from reading volume correctly. But volume consistently provides one of the most objective available signals about the conviction behind a price move.",
      },
      {
        type: "why-matters",
        heading: "Why Volume Matters",
        content:
          "Volume is often described as the lifeblood of price action because it measures market conviction. When price advances on rising volume, it suggests that a growing number of participants believe price should be higher — a healthy sign for the move's continuation. When price advances on declining volume, it raises the question of whether the move has sufficient participation to sustain itself.\n\nInstitutional traders — who account for the majority of market volume in most liquid markets — leave footprints in the volume data. Large buying or selling programs show up as volume surges that a price-only analysis would miss entirely. Tracking volume gives retail market watchers a window into when large players may be active.\n\nVolume is also a leading indicator of volatility. Periods of unusually low volume often precede sharp expansions in price movement — the calm before the storm dynamic. Recognizing those quiet periods can be just as valuable as identifying the high-volume surges that follow.",
      },
      {
        type: "how-read",
        heading: "How to Read Volume Correctly",
        content:
          "The most important volume analysis is relative, not absolute. A volume bar of 5 million shares means little without knowing whether that is high or low for that particular security. Comparing volume to a recent average — commonly a 20-period moving average — reveals whether current activity is elevated or suppressed.\n\nThe textbook read is that volume should expand in the direction of the trend and contract during pullbacks. In an uptrend, advancing candles should show higher volume than declining candles. This pattern suggests the buyers driving the trend have greater conviction and activity than the sellers creating temporary dips.\n\nVolume divergence is a valuable concept: when price makes a new high but volume is declining, fewer participants are driving that new high than drove prior highs. This does not guarantee a reversal, but it suggests the move may be losing its foundation — a signal worth watching alongside other evidence.",
      },
      {
        type: "psychology",
        heading: "The Psychology of Volume",
        content:
          "Climactic volume — an extreme spike far beyond normal levels — often appears at turning points. A massive volume surge at the end of a long uptrend, for example, can represent exhaustion: the last wave of buyers who had been waiting finally capitulate and buy. With the remaining buyers now positioned, there is no new demand left to push price higher. This type of volume behavior is sometimes called a blow-off top.\n\nConversely, a volume climax at the end of a downtrend — sometimes called a selling climax — can represent the exhaustion of sellers. The panic-driven wave of selling eventually absorbs all remaining supply at ever-lower prices until buyers overwhelm the weakened selling.\n\nThese climactic events are identifiable only in hindsight with certainty, but the pattern of extreme volume at extreme price levels is one of the most studied phenomena in technical analysis. Traders watch for these signatures without assuming any single instance is definitive.",
      },
      {
        type: "mistakes",
        heading: "Common Volume Mistakes",
        content:
          "Treating volume in isolation is one of the most common errors. A high-volume day means very little without context — was it a trend day, a reversal day, a news event? Volume must always be read alongside price behavior and the surrounding structure to carry meaning.\n\nAnother mistake is ignoring volume during breakouts. When price breaks through a key support or resistance level on low volume, the textbook read is that the break lacks conviction and has a higher probability of failing or reversing. High-volume breakouts carry far more weight because they imply widespread participation, not just a vacuum in liquidity.\n\nFinally, many newer market participants focus solely on price charts and treat the volume panel as an afterthought. Volume is not a secondary indicator — it is the primary data point that gives price action its context. Ignoring it is like reading a text message and ignoring the tone of voice.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaways",
        content:
          "Volume is the measure of market participation and conviction behind every price move. Price and volume together tell a richer story than price alone — one that includes not just where the market went, but how many people cared enough to send it there.\n\nThe most useful volume analysis focuses on relative comparisons — is current volume above or below average? — and on the relationship between price direction and volume direction. Expanding volume in the direction of the trend is healthy; diverging volume is a warning.\n\nVolume analysis is not a crystal ball. Markets can trend on declining volume longer than seems logical. But as one of the few objective, quantity-based data points available to market observers, volume deserves consistent attention alongside price structure, levels, and candlestick behavior.",
      },
    ],
    diagram: `<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='background:#0E1B30;border-radius:8px;'>
  <style>
    @keyframes growBar { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); } }
    .bar { animation: growBar 0.5s ease forwards; transform-origin: bottom; }
    .b1{animation-delay:0.0s;} .b2{animation-delay:0.1s;} .b3{animation-delay:0.2s;}
    .b4{animation-delay:0.3s;} .b5{animation-delay:0.4s;} .b6{animation-delay:0.5s;}
    .b7{animation-delay:0.6s;} .b8{animation-delay:0.7s;}
    .label { font-family:sans-serif; font-size:9px; fill:#F4F7FA; }
    .sublabel { font-family:sans-serif; font-size:8px; fill:#27B7C8; }
  </style>
  <!-- Price line -->
  <polyline points='30,130 80,110 130,95 180,80 230,90 280,75 330,60 370,55' fill='none' stroke='#27B7C8' stroke-width='2'/>
  <!-- Volume bars -->
  <rect x='20' y='145' width='20' height='25' fill='#49B06E' class='bar b1'/>
  <rect x='70' y='140' width='20' height='30' fill='#49B06E' class='bar b2'/>
  <rect x='120' y='135' width='20' height='35' fill='#49B06E' class='bar b3'/>
  <rect x='170' y='130' width='20' height='40' fill='#49B06E' class='bar b4'/>
  <rect x='220' y='150' width='20' height='20' fill='#E05555' class='bar b5'/>
  <rect x='270' y='143' width='20' height='27' fill='#49B06E' class='bar b6'/>
  <rect x='320' y='128' width='20' height='42' fill='#49B06E' class='bar b7'/>
  <rect x='360' y='125' width='20' height='45' fill='#49B06E' class='bar b8'/>
  <!-- Baseline -->
  <line x1='10' y1='175' x2='390' y2='175' stroke='#F4F7FA' stroke-width='0.5' opacity='0.3'/>
  <text x='200' y='195' class='label' text-anchor='middle' fill='#27B7C8'>Volume expanding in trend direction = healthy</text>
  <text x='200' y='20' class='sublabel' text-anchor='middle'>Price vs. Volume Relationship</text>
</svg>`,
    quiz: [
      {
        q: "What does it mean when price makes a new high but volume is declining?",
        options: [
          "The trend is accelerating and likely to continue strongly",
          "Volume divergence — fewer participants are supporting the new high, which may signal weakening momentum",
          "Volume always declines at new highs due to profit-taking",
          "The security is about to be halted by regulators",
        ],
        correct: 1,
        explanation:
          "Volume divergence occurs when price makes a new high but fewer participants are driving the move than drove prior highs. This does not guarantee a reversal, but it suggests the move may be losing its foundation and warrants attention alongside other signals.",
      },
      {
        q: "Why is relative volume more useful than absolute volume?",
        options: [
          "Absolute volume is never publicly available",
          "Because a given volume number only has meaning when compared to what is normal for that security",
          "Relative volume eliminates all false signals",
          "Absolute volume is only relevant for futures markets",
        ],
        correct: 1,
        explanation:
          "A volume reading of 5 million shares means very different things for a thinly traded small-cap versus a large liquid blue-chip. Comparing current volume to a recent average reveals whether participation is elevated or suppressed relative to that security's norms.",
      },
      {
        q: "The textbook read for a healthy uptrend's volume signature is:",
        options: [
          "Volume is flat regardless of price direction",
          "Volume expands on advancing days and contracts on pullback days",
          "Volume always spikes during pullbacks in a healthy uptrend",
          "Volume is irrelevant during uptrends and only matters in downtrends",
        ],
        correct: 1,
        explanation:
          "In a healthy uptrend, advancing price sessions should show higher volume than declining sessions. This pattern suggests the buyers driving the trend have greater conviction and participation than the sellers causing temporary pullbacks.",
      },
      {
        q: "A 'selling climax' is characterized by:",
        options: [
          "Gradually declining volume as price falls slowly",
          "An extreme volume spike at the end of a prolonged downtrend, potentially indicating seller exhaustion",
          "Volume that matches the 20-day average exactly",
          "High volume on every day throughout a downtrend equally",
        ],
        correct: 1,
        explanation:
          "A selling climax features extreme, panic-level volume at the end of a significant downtrend. It can represent the final wave of forced selling — when that selling is absorbed by buyers, demand may begin to overwhelm supply. However, identifying it in real time carries significant uncertainty.",
      },
    ],
    girlToGirlTip:
      "Volume is like the crowd noise at a sports game. A big play with a quiet crowd is suspicious — maybe it was just luck. The same big play with the crowd going wild? That feels real. Same idea on charts: big moves on big volume carry a lot more weight.",
    videoSlot: null,
  },

  // ─── Lesson 5: Timeframes ─────────────────────────────────────────────────
  {
    module: "M1",
    slug: "timeframes",
    title: "Timeframes",
    subtitle: "Why the same chart looks completely different depending on your lens",
    difficulty: "Beginner",
    readingMinutes: 7,
    sections: [
      {
        type: "overview",
        heading: "What Are Timeframes?",
        content:
          "A timeframe determines how much price action each candlestick or bar represents. A 1-minute chart shows one candle per minute; a daily chart shows one candle per trading day; a weekly chart shows one candle per week. The same underlying price data produces very different-looking charts depending on which timeframe lens is applied.\n\nEvery price move exists simultaneously on multiple timeframes. What appears as a dramatic reversal on a 5-minute chart might be an invisible blip on a weekly chart. What looks like a clean uptrend on a daily chart might reveal a sideways range on a 1-hour chart within that trend.\n\nPatterns fail constantly regardless of timeframe, and nothing guarantees profits from timeframe analysis. What timeframe awareness provides is the ability to understand where a price move fits within the larger context — an essential skill for traders at any level.",
      },
      {
        type: "why-matters",
        heading: "Why Timeframes Matter",
        content:
          "Timeframes matter because context is everything in chart reading. A breakout above resistance on a 5-minute chart that is simultaneously hitting major resistance on the daily chart is a very different situation than a breakout that aligns with the daily trend. The higher timeframe context sets the backdrop; the lower timeframe provides the detail.\n\nDifferent market participants operate on different timeframes. Long-term investors make decisions based on monthly or weekly charts. Swing traders operate on daily and 4-hour charts. Day traders use 1-minute through 1-hour charts. Understanding this creates awareness of why certain levels attract attention — because participants on larger timeframes are acting at those levels.\n\nTimeframe alignment is one of the most powerful concepts in technical analysis: when multiple timeframes — weekly, daily, and hourly, for example — all show the same signal in the same direction, the probability of a meaningful move increases. When timeframes conflict, the picture becomes noisier and harder to act on with confidence.",
      },
      {
        type: "how-read",
        heading: "How to Use Multiple Timeframes",
        content:
          "The standard multi-timeframe approach uses three timeframes: a higher timeframe to establish context and bias, a middle timeframe to identify the specific setup, and a lower timeframe to observe the detailed price action around entry zones.\n\nFor swing trading, a common trio is weekly (context), daily (setup), and 4-hour (detail). For day trading, a common trio is daily (context), 1-hour (setup), and 15-minute (detail). The higher timeframe controls the directional bias — if the weekly chart shows a downtrend, most traders will be more cautious about buying setups on the daily chart, even if those setups look technically clean.\n\nThe key discipline is to always start from the top down, never the bottom up. Beginning with a 1-minute chart and then consulting the daily chart is backward — it leads to bias toward the micro picture without the macro context. Starting with the weekly or daily chart and then drilling down to the lower timeframe for detail preserves the correct hierarchy.",
      },
      {
        type: "psychology",
        heading: "The Psychology of Timeframe Selection",
        content:
          "There is a psychological pull toward lower timeframes because they appear to offer more 'action' — more moves, more signals, more opportunities. This pull is well-documented and generally counterproductive for most market participants. Lower timeframes contain more noise relative to signal, and the speed of lower-timeframe moves puts emotional pressure on decision-making.\n\nHigher timeframes, while slower and requiring more patience, offer cleaner signals because each candle filters out more of the intraday noise. A breakout on a daily chart represents a full day of participants agreeing on a price direction — considerably more meaningful than a breakout on a 5-minute chart that might represent one brief institutional order.\n\nThe challenge is that many participants drift toward shorter timeframes after a loss, seeking faster opportunities to recover. This drift tends to produce worse results, not better, because it moves the trader toward higher-noise environments when their emotional state is already compromised. Awareness of this dynamic is part of developing a sound trading psychology.",
      },
      {
        type: "mistakes",
        heading: "Common Timeframe Mistakes",
        content:
          "The most common mistake is timeframe-hopping: abandoning the original analysis timeframe when price moves against a position, then switching to a lower timeframe to find justification for staying in the trade. This practice destroys consistency and turns a disciplined approach into reactive guessing.\n\nAnother error is ignoring higher timeframe resistance or support when acting on lower timeframe signals. A clean hourly breakout that is simultaneously running into major daily or weekly resistance is not as clean as it looks in isolation. The higher timeframe structure acts as an invisible ceiling or floor that the lower timeframe chart doesn't show.\n\nFinally, some participants try to trade too many timeframes simultaneously, leading to analysis paralysis. Picking two to three complementary timeframes and developing real fluency with how they interact is far more productive than trying to monitor every possible lens at once.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaways",
        content:
          "Timeframes are lenses that reveal different aspects of the same price story. Each lens has value; the skill is learning to use them in a structured, top-down hierarchy that preserves context without losing detail.\n\nThe higher timeframe sets the bias and identifies the major levels. The middle timeframe reveals the specific pattern or setup. The lower timeframe provides the detail for assessing the immediate price behavior. Together they create a layered analysis that is more robust than any single timeframe view.\n\nConsistency with timeframe selection is more important than finding the 'perfect' timeframe. Developing a systematic process — always starting from the top down, always checking for timeframe alignment — builds the habit of thinking in context rather than in isolation.",
      },
    ],
    diagram: `<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='background:#0E1B30;border-radius:8px;'>
  <style>
    @keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
    .tf1 { animation: slideIn 0.5s ease forwards; }
    .tf2 { animation: slideIn 0.5s ease 0.3s forwards; opacity:0; }
    .tf3 { animation: slideIn 0.5s ease 0.6s forwards; opacity:0; }
    .label { font-family:sans-serif; font-size:9px; fill:#F4F7FA; }
    .sublabel { font-family:sans-serif; font-size:8px; fill:#27B7C8; }
  </style>
  <!-- Weekly chart (top context) -->
  <g class='tf1'>
    <text x='10' y='25' class='label' fill='#27B7C8'>Weekly (Context)</text>
    <polyline points='10,60 60,50 110,55 160,40 210,35' fill='none' stroke='#27B7C8' stroke-width='2'/>
    <line x1='0' y1='70' x2='220' y2='70' stroke='#F4F7FA' stroke-width='0.5' opacity='0.2'/>
  </g>
  <!-- Daily chart (setup) -->
  <g class='tf2'>
    <text x='10' y='90' class='label' fill='#49B06E'>Daily (Setup)</text>
    <polyline points='10,130 40,120 70,125 100,110 130,115 160,100 190,95 210,100' fill='none' stroke='#49B06E' stroke-width='2'/>
    <line x1='0' y1='140' x2='220' y2='140' stroke='#F4F7FA' stroke-width='0.5' opacity='0.2'/>
  </g>
  <!-- Hourly chart (detail) on right -->
  <g class='tf3'>
    <text x='240' y='25' class='label' fill='#F4F7FA' opacity='0.7'>4H (Detail)</text>
    <polyline points='240,100 260,90 275,95 290,82 305,86 320,75 340,78 360,65 375,60' fill='none' stroke='#F4F7FA' stroke-width='1.5' opacity='0.7'/>
  </g>
  <text x='200' y='190' class='sublabel' text-anchor='middle'>Top-down multi-timeframe analysis</text>
</svg>`,
    quiz: [
      {
        q: "In a top-down multi-timeframe analysis, which timeframe should be consulted first?",
        options: [
          "The lowest timeframe, for the most detail",
          "The timeframe that shows the clearest signal",
          "The highest timeframe, to establish context and directional bias",
          "All timeframes simultaneously to avoid missing signals",
        ],
        correct: 2,
        explanation:
          "Top-down analysis always starts with the highest timeframe to establish context and directional bias. The higher timeframe acts as the map; lower timeframes provide progressively more detailed views within that map. Starting from the bottom up creates bias toward noise.",
      },
      {
        q: "What is 'timeframe alignment' and why does it matter?",
        options: [
          "Making sure all charts are set to the same time zone",
          "When multiple timeframes show the same signal in the same direction, increasing confluence",
          "Ensuring each timeframe is checked exactly once per hour",
          "Aligning entry times with specific hours of the trading day",
        ],
        correct: 1,
        explanation:
          "Timeframe alignment occurs when multiple timeframes — weekly, daily, and hourly, for example — all show the same directional signal. This confluence of agreement across timeframes is considered one of the stronger confluence factors in technical analysis.",
      },
      {
        q: "What is 'timeframe-hopping' and why is it problematic?",
        options: [
          "Checking multiple timeframes before entering a trade",
          "Abandoning the original analysis timeframe when price moves against a position to find justification for staying in",
          "Using a longer timeframe than originally planned for a trade",
          "Switching from daily charts to weekly charts to identify long-term trends",
        ],
        correct: 1,
        explanation:
          "Timeframe-hopping means switching to a different timeframe when a position goes against you, in search of a view that justifies staying in. This destroys consistency and turns disciplined analysis into post-hoc rationalization — a classic cognitive bias in trading.",
      },
      {
        q: "Why do higher timeframes generally offer cleaner signals than lower timeframes?",
        options: [
          "Higher timeframes are used by more prestigious institutions",
          "Each higher-timeframe candle filters out more intraday noise, representing broader consensus about price direction",
          "Lower timeframes are illegal in most jurisdictions",
          "Higher timeframes always align perfectly with fundamental analysis",
        ],
        correct: 1,
        explanation:
          "A daily candle represents a full day of market participants agreeing on a price direction — filtering out every intraday fluctuation. This makes daily signals less susceptible to random noise than 5-minute signals, which can be moved by a single large order or brief liquidity vacuum.",
      },
    ],
    girlToGirlTip:
      "Start with the bigger picture every single time. It is tempting to dive into the 5-minute chart where the action is, but girl, that is how traders get lost in the noise. The weekly chart is your GPS. Use it first, always.",
    videoSlot: null,
  },

  // ─── Lesson 6: Breakouts ──────────────────────────────────────────────────
  {
    module: "M1",
    slug: "breakouts",
    title: "Breakouts",
    subtitle: "When price escapes a range and momentum can accelerate",
    difficulty: "Intermediate",
    readingMinutes: 9,
    sections: [
      {
        type: "overview",
        heading: "What Is a Breakout?",
        content:
          "A breakout occurs when price moves decisively through a previously established support or resistance level, suggesting that the balance of supply and demand has shifted enough to allow price to move into new territory. Breakouts can occur above resistance (bullish breakout) or below support (bearish breakdown).\n\nThe concept of a breakout is built on the observation that once a level that has contained price is overcome, the forces that created that containment are no longer sufficient. Participants who were selling at resistance are now offside; their eventual stop-outs can add fuel to the move. Participants who were waiting for confirmation of a break may now enter, adding additional momentum.\n\nPatterns fail constantly, and false breakouts are extremely common — perhaps more common than genuine ones. Nothing guarantees profits from trading breakouts. Understanding what separates high-conviction breaks from false breaks is the central challenge of breakout trading.",
      },
      {
        type: "why-matters",
        heading: "Why Breakouts Matter",
        content:
          "Breakouts matter because they represent potential inflection points in market structure. When price breaks through a level that has contained it for an extended period, the market is communicating that the prior equilibrium has shifted. The longer and more defined the range before the break, the more significant the structural change the breakout represents.\n\nBreakouts are also practically significant because they attract a large number of market participants simultaneously. Traders who use limit orders at resistance levels, stop-loss orders above resistance, and momentum-following algorithms all respond to the same price event — creating a self-reinforcing surge of activity.\n\nFor range-bound markets, a breakout signals the end of the balance phase and the potential beginning of a trending phase. For already-trending markets, a breakout of a consolidation zone signals a potential resumption of the prior trend — which is one of the highest-probability setups in the trader's toolkit when all conditions align.",
      },
      {
        type: "how-identify",
        heading: "Identifying High-Quality Breakouts",
        content:
          "The strongest breakouts tend to emerge from well-defined, well-tested levels. A resistance level that has rejected price multiple times over a significant period of time, when finally broken, attracts far more attention and participation than a level that was barely touched once. The more defined the level, the more meaningful its breach.\n\nVolume is the most important confirmation factor for any breakout. The textbook read is that a genuine breakout should be accompanied by significantly above-average volume as price exits the range. This volume expansion represents the participation of new buyers (in a bullish breakout) who were waiting for confirmation that the level was truly broken. A breakout on below-average volume is frequently followed by a reversal back into the range — a false breakout.\n\nA clean close through the level on a relevant timeframe — not just an intraday wick through — is also a key quality indicator. The daily close is particularly significant because it represents the consensus of a full day of market participants rather than a brief moment of thin liquidity.",
      },
      {
        type: "psychology",
        heading: "The Psychology of Breakouts",
        content:
          "When price breaks above resistance, three major groups of participants respond simultaneously. Those who were short the range have their positions go against them; if they placed stop orders above resistance (as is common practice), those orders trigger and become buy orders that amplify the breakout move. Those who were waiting for a breakout to confirm before entering now buy. And those who already held positions from lower levels add to their long positions or simply hold through with increased confidence.\n\nThis cascade of overlapping activity is what can create sharp, fast moves after a breakout. The move is sometimes called a 'breakout squeeze' when the stop-out buying from shorts combines with new long entry from breakout buyers.\n\nOn the other side, false breakouts exploit this same psychology. A brief push above resistance triggers the stops and the eager breakout buyers — and then price reverses sharply as those buyers become trapped and sellers who anticipated the false break take profits. False breakouts can be vicious precisely because so many participants are positioned in the wrong direction simultaneously.",
      },
      {
        type: "mistakes",
        heading: "Common Breakout Mistakes",
        content:
          "Chasing breakouts is among the most common and costly mistakes. When price has already moved 5% above resistance, the risk-reward of entering has typically degraded significantly compared to where it was at the actual break. The measured-move logic — the distance the pattern projects — doesn't change based on where a trader enters; it is fixed. Entering late means accepting a worse risk-reward without changing the target.\n\nIgnoring broader trend context is another frequent error. A breakout above resistance in the middle of a larger downtrend has a much lower probability of sustaining than the same breakout in an established uptrend. The higher-timeframe bias shapes the probabilities of any lower-timeframe breakout.\n\nFinally, many traders fail to account for the frequency of false breakouts, particularly in choppy markets. A false breakout is not a random error — it is a recurring phenomenon that the market produces repeatedly. Waiting for the first candle to close back inside the range after a break is often more reliable than acting on the initial breach.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaways",
        content:
          "Breakouts are among the most watched events in technical analysis because they signal a potential shift in market structure. The best breakouts emerge from well-defined levels, occur on expanding volume, and align with the broader trend.\n\nFalse breakouts are not exceptions — they are common enough to be considered part of the landscape. Trading breakouts effectively requires patience to wait for volume confirmation, discipline to avoid chasing, and an honest assessment of the broader trend context.\n\nThe measured-move concept provides a logical target framework for breakout trades: the width of the range that preceded the breakout is added to the breakout point to project a potential target. This is measured-move logic, not a promise — prices frequently exceed or fall short of this projection. It is a reference point, not a guarantee.",
      },
    ],
    diagram: `<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='background:#0E1B30;border-radius:8px;'>
  <style>
    @keyframes expandRange { from { opacity:0; } to { opacity:1; } }
    @keyframes shootUp { from { transform:translateY(30px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .range-box { animation: expandRange 1s ease forwards; }
    .breakout-arrow { animation: shootUp 0.8s ease 1s forwards; opacity:0; }
    .label { font-family:sans-serif; font-size:9px; fill:#F4F7FA; }
    .sublabel { font-family:sans-serif; font-size:8px; fill:#27B7C8; }
  </style>
  <!-- Resistance line -->
  <line x1='30' y1='70' x2='370' y2='70' stroke='#E05555' stroke-width='1.5' stroke-dasharray='5 3'/>
  <text x='32' y='65' class='label' fill='#E05555'>Resistance</text>
  <!-- Support line -->
  <line x1='30' y1='140' x2='370' y2='140' stroke='#49B06E' stroke-width='1.5' stroke-dasharray='5 3'/>
  <text x='32' y='155' class='label' fill='#49B06E'>Support</text>
  <!-- Range box -->
  <rect x='30' y='70' width='240' height='70' fill='#27B7C8' opacity='0.08' class='range-box'/>
  <!-- Price bouncing in range -->
  <polyline points='30,120 60,105 90,130 120,95 150,125 180,88 210,120 240,85 270,75' fill='none' stroke='#27B7C8' stroke-width='2'/>
  <!-- Breakout -->
  <g class='breakout-arrow'>
    <polyline points='270,75 310,45 350,25' fill='none' stroke='#49B06E' stroke-width='2.5'/>
    <polygon points='350,20 342,32 358,32' fill='#49B06E'/>
    <text x='310' y='40' class='label' fill='#49B06E'>Breakout!</text>
  </g>
  <text x='200' y='190' class='sublabel' text-anchor='middle'>Breakout above resistance — volume confirmation critical</text>
</svg>`,
    quiz: [
      {
        q: "What is the most important confirmation factor for a genuine breakout?",
        options: [
          "The breakout happening during the first hour of trading",
          "Price moving at least 5% above resistance",
          "Significantly above-average volume accompanying the price move through the level",
          "A breakout that occurs on the second attempt",
        ],
        correct: 2,
        explanation:
          "Volume is the primary breakout confirmation factor. Above-average volume on the breakout day demonstrates broad participation — new buyers entering or shorts covering. A breakout on below-average volume frequently reverses, as it may reflect a temporary vacuum of sellers rather than genuine demand.",
      },
      {
        q: "A 'false breakout' occurs when:",
        options: [
          "Price breaks resistance and continues strongly higher",
          "Price briefly pierces a level but then reverses back inside the prior range",
          "Volume is exactly average on a breakout day",
          "Price breaks resistance on a Friday",
        ],
        correct: 1,
        explanation:
          "A false breakout happens when price appears to breach a level but then fails to sustain the break and reverses back into the prior range. False breakouts are common and can trap traders who entered on the initial breach before the reversal became apparent.",
      },
      {
        q: "The 'measured move' concept for breakout targets refers to:",
        options: [
          "A guaranteed price target confirmed by regulators",
          "Adding the width of the prior range to the breakout point as a logical projection reference",
          "Measuring the exact number of candles in the range before the breakout",
          "The minimum move required before a breakout is legally valid",
        ],
        correct: 1,
        explanation:
          "Measured-move logic projects a target by adding the height of the prior range to the breakout point. It is a reference point based on symmetry, not a promise. Price frequently exceeds or falls short of this level. It serves as a logical area to assess the trade's progress, not a guaranteed destination.",
      },
      {
        q: "Why is chasing a breakout that has already moved significantly considered problematic?",
        options: [
          "Breakouts that move quickly are always false",
          "The risk-reward has degraded because the entry is farther from the invalidation level while the target hasn't changed",
          "Market makers penalize late entries with wider spreads",
          "Price always returns to the breakout level before continuing",
        ],
        correct: 1,
        explanation:
          "When a trader chases a breakout that has already moved significantly, the invalidation level (where the idea is proven wrong) remains near the breakout point while the entry price has moved far above it. This dramatically worsens the risk-reward ratio compared to entering near the actual break.",
      },
    ],
    girlToGirlTip:
      "Volume on a breakout is not optional, girl — it is the whole story. A breakout on thin volume is like a party announcement with nobody showing up. Wait for the crowd to confirm the move before getting too excited.",
    videoSlot: null,
  },

  // ─── Lesson 7: Pullbacks ──────────────────────────────────────────────────
  {
    module: "M1",
    slug: "pullbacks",
    title: "Pullbacks",
    subtitle: "The retracements within a trend that offer lower-risk alignment",
    difficulty: "Intermediate",
    readingMinutes: 8,
    sections: [
      {
        type: "overview",
        heading: "What Is a Pullback?",
        content:
          "A pullback — also called a retracement — is a temporary reversal against the direction of the primary trend. In an uptrend, price does not rise in a straight line; it advances, pulls back, then advances again. Each pullback represents a period of profit-taking, consolidation, or temporary selling that interrupts the trend before it resumes.\n\nPullbacks are a natural and healthy feature of trending markets. A trend that moves in a straight line without pullbacks is often unsustainable — it tends to run out of buyers quickly because anyone who wanted to buy has already done so. Pullbacks allow latecomers to enter at better prices and give the trend 'fuel' for its next leg higher.\n\nPatterns fail constantly, and pullbacks do not always resume in the direction of the trend — nothing guarantees profits from trading pullback setups. Sometimes a pullback becomes a full trend reversal. Understanding what differentiates a healthy pullback from an early sign of reversal is the central skill this lesson develops.",
      },
      {
        type: "why-matters",
        heading: "Why Pullbacks Matter",
        content:
          "From a risk-reward perspective, entering on a pullback toward support rather than chasing a breakout or buying into strength offers more favorable terms. The invalidation level — where the idea is proven wrong — can be placed more tightly relative to a nearby structural level. The potential upside toward the prior high or beyond remains unchanged. This geometry is more favorable than chasing into extended moves.\n\nPullbacks also represent a psychological advantage. Buying into strength — when price is already up significantly — creates anxiety about having 'missed the move.' Waiting for a pullback to a defined level aligns entry with a structural reference point, which reduces anxiety and creates a clearer assessment of whether the idea is valid or not.\n\nFor traders looking to participate in established trends, pullbacks are the primary opportunity to engage without chasing. Understanding where pullbacks are likely to find support — and what the price action looks like when that support is found — is foundational to trend-following approaches.",
      },
      {
        type: "how-identify",
        heading: "Identifying Pullback Opportunities",
        content:
          "The most commonly watched pullback targets are prior resistance levels that have become support (role reversal), rising trendlines, moving averages that price has respected during the trend, and Fibonacci retracement levels (most commonly the 38.2%, 50%, and 61.8% levels of the prior advance).\n\nNone of these levels is guaranteed to hold. The question is what price action looks like when it arrives at the level. A shallow, orderly pullback that arrives at support on declining volume and then produces a strong-bodied bullish candle is a different situation than a sharp, high-volume decline that blows through multiple support levels without pause.\n\nThe key quality criteria for a pullback setup: the primary trend should be clearly established; the pullback should be shallower than the prior advance (suggesting sellers are not overwhelming buyers); volume should contract during the pullback (suggesting the selling is not panic-driven); and a candlestick signal or price behavior change should appear at the support zone before acting on the setup.",
      },
      {
        type: "psychology",
        heading: "The Psychology of Pullbacks",
        content:
          "Pullbacks are psychologically challenging for two opposing reasons. Participants who missed the initial move are tempted to buy the pullback too early — while price is still falling — because they fear missing out again. This tendency, called 'catching a falling knife,' leads to entries before the pullback has actually stopped.\n\nOn the other side, participants who have been observing the pullback may hesitate to act when it finally shows signs of resuming because the recent selling has made them uncertain whether the trend is really intact. By the time they feel confident, price has often already moved significantly — and they are back to chasing.\n\nDeveloping a systematic approach — waiting for price to reach a defined level, watching for a specific behavioral signal, and acting decisively when both criteria are met — addresses both of these psychological traps. The discipline of process over impulse is the key psychological skill for pullback trading.",
      },
      {
        type: "mistakes",
        heading: "Common Pullback Mistakes",
        content:
          "Trying to pick the exact bottom of a pullback is a very common and costly mistake. Pullbacks are over only in hindsight. Entering based on a fixed percentage pullback — 'price is down 3%, so now it must bounce' — without regard for structural support levels leads to arbitrary entries.\n\nAnother common error is misidentifying the trend. If the primary trend is already showing signs of weakness — lower highs on the larger timeframe, declining volume on advances — then what looks like a pullback setup may actually be a downtrend rally. Trading a pullback setup in the wrong trend direction is a very different risk profile.\n\nFinally, many traders set the invalidation level too tightly on pullback trades, placing it just below the entry candle rather than below the key support zone they identified. When price does the normal, healthy thing of testing slightly below support before recovering, those tight invalidation levels are hit and the trade is exited at a loss right before the intended move begins.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaways",
        content:
          "Pullbacks are the primary mechanism through which trends create entry opportunities for participants who missed the initial move. They are not signs of trend weakness — in fact, orderly, low-volume pullbacks to defined support levels are a sign of trend health.\n\nThe best pullback setups occur in clearly established trends, retrace to recognized structural levels on declining volume, and produce behavioral signals (candlestick patterns, volume expansion) suggesting buyers are re-engaging at that level.\n\nFalse pullbacks — pullbacks that turn into reversals — are a constant reality. An invalidation level placed below the key support zone helps define the boundary between a normal retest and a true breakdown. Patterns fail constantly, but the structured approach of identifying level + signal + risk parameters gives pullback setups their analytical edge.",
      },
    ],
    diagram: `<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='background:#0E1B30;border-radius:8px;'>
  <style>
    @keyframes trace { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
    @keyframes glowPop { from { opacity:0; r:0; } to { opacity:1; r:6; } }
    .price-path { stroke-dasharray: 600; stroke-dashoffset: 600; animation: trace 3s ease forwards; }
    .entry-dot { animation: glowPop 0.4s ease 2.5s forwards; opacity:0; }
    .label { font-family:sans-serif; font-size:9px; fill:#F4F7FA; }
    .sublabel { font-family:sans-serif; font-size:8px; fill:#27B7C8; }
  </style>
  <!-- Support level -->
  <line x1='30' y1='130' x2='370' y2='130' stroke='#49B06E' stroke-width='1' stroke-dasharray='4 3' opacity='0.6'/>
  <!-- Price path: trend, pullback, resume -->
  <polyline class='price-path' points='30,170 80,140 130,110 180,85 200,100 220,130 240,125 260,100 300,70 350,40' fill='none' stroke='#27B7C8' stroke-width='2.5'/>
  <!-- Pullback zone highlight -->
  <rect x='195' y='85' width='70' height='50' fill='#E05555' opacity='0.07' rx='3'/>
  <text x='230' y='148' class='label' fill='#E05555' text-anchor='middle'>Pullback</text>
  <!-- Entry signal dot -->
  <circle cx='240' cy='125' r='6' fill='#49B06E' class='entry-dot'/>
  <text x='250' y='118' class='label' fill='#49B06E'>Resume</text>
  <!-- Arrows showing trend direction -->
  <text x='310' y='68' class='label' fill='#27B7C8'>Trend</text>
  <text x='200' y='195' class='sublabel' text-anchor='middle'>Pullback to support in an uptrend</text>
</svg>`,
    quiz: [
      {
        q: "What volume pattern is typical of a healthy pullback within an uptrend?",
        options: [
          "Volume spikes dramatically during the pullback, then collapses on the resumption",
          "Volume contracts during the pullback, suggesting the selling lacks conviction",
          "Volume remains identical throughout — no difference between advance and pullback",
          "Volume must reach zero before the pullback is considered valid",
        ],
        correct: 1,
        explanation:
          "In a healthy pullback, volume tends to contract as price retraces. This suggests the selling is orderly profit-taking rather than panic-driven liquidation. When volume then expands as price resumes in the trend direction, it adds confirmation that buyers are re-engaging.",
      },
      {
        q: "Why does trading pullbacks generally offer better risk-reward than chasing breakouts?",
        options: [
          "Pullbacks always produce larger moves than breakouts",
          "The invalidation level can be placed more tightly relative to a nearby structural level while the target remains unchanged",
          "Pullbacks are guaranteed to succeed while breakouts are not",
          "Trading pullbacks avoids the need to analyze volume",
        ],
        correct: 1,
        explanation:
          "A pullback entry near support allows the invalidation level to be placed just below that support zone — a tighter distance than from a breakout-chase entry. Since the potential target (prior high or measured move) stays the same regardless of entry price, the risk-reward geometry improves when entering closer to the structural level.",
      },
      {
        q: "What differentiates a healthy pullback from an early sign of trend reversal?",
        options: [
          "A pullback that lasts fewer than three candles is always healthy",
          "A healthy pullback is shallower than the prior advance, occurs on declining volume, and holds above key support",
          "Any pullback greater than 2% signals a trend reversal",
          "Only pullbacks on the daily chart are real; all others are false",
        ],
        correct: 1,
        explanation:
          "Key signs of a healthy pullback include: shallower depth than the prior advance, contracting volume during the retracement, and price holding above a defined support level. When the pullback becomes deeper than the prior advance or breaks key support on expanding volume, the reversal probability increases significantly.",
      },
      {
        q: "Placing the invalidation level too tightly on a pullback trade risks:",
        options: [
          "Making the trade too profitable",
          "Being exited at a small loss on a normal support test right before the intended move begins",
          "Breaking exchange rules on stop-loss placement",
          "Causing the trend to reverse immediately",
        ],
        correct: 1,
        explanation:
          "A very tight invalidation level placed just below the entry candle (rather than below the support zone) is often hit by normal price noise — the kind of minor undershoot of a support level that precedes a genuine recovery. This creates a frustrating outcome: being stopped out at a loss just before the trade idea proved correct.",
      },
    ],
    girlToGirlTip:
      "Patience is everything with pullbacks, girl. Watching price drop during the pullback feels awful — it looks like the trend is over. But that nervousness is exactly what creates the opportunity. The ones who wait for confirmation at the level get a much better entry than those who chased the original breakout.",
    videoSlot: null,
  },

  // ─── Lesson 8: Consolidation ──────────────────────────────────────────────
  {
    module: "M1",
    slug: "consolidation",
    title: "Consolidation",
    subtitle: "The pauses where the next big move is quietly being decided",
    difficulty: "Intermediate",
    readingMinutes: 8,
    sections: [
      {
        type: "overview",
        heading: "What Is Consolidation?",
        content:
          "Consolidation is a period during which price moves sideways within a defined range after a significant directional move. It represents a temporary balance between buyers and sellers — neither side has enough conviction to push price meaningfully in their direction, so it oscillates between an upper bound and a lower bound.\n\nConsolidation goes by many names depending on its shape: ranges, rectangles, flags, pennants, triangles, and wedges are all variations of the consolidation concept. What they share is the characteristic of decreasing price volatility relative to the preceding trend move, as the market 'digests' the prior advance or decline.\n\nPatterns fail constantly, and consolidation phases do not always resolve in the expected direction — nothing guarantees profits from consolidation analysis. What consolidation does reliably signal is that a directional decision is building, and that the resolution of the range may produce a meaningful move when it arrives.",
      },
      {
        type: "why-matters",
        heading: "Why Consolidation Matters",
        content:
          "Consolidation matters because it often precedes the market's next significant move. Think of a spring being compressed — the energy stored during the compression is released when the spring is let go. Similarly, the longer and tighter a consolidation phase, the more pent-up momentum may be released when price finally breaks free.\n\nConsolidation phases also give traders defined, observable boundaries to work with. The upper and lower edges of the range become actionable structural levels — potential resistance to fade against or potential support to monitor. The breakout from the range, when it comes, provides a clear signal with a logical invalidation level and a measured-move projection.\n\nFor trend-following traders, a consolidation that forms after a strong directional move (often called a 'continuation pattern') represents the highest-probability consolidation scenario. The prior trend's momentum suggests the resolution may favor the direction of the prior move — though this is an observation about probability, not a guarantee.",
      },
      {
        type: "how-identify",
        heading: "Identifying and Reading Consolidation Patterns",
        content:
          "The most basic consolidation form is a rectangle or range: price bounces between a horizontal upper resistance and a horizontal lower support for a defined period. The longer this range persists and the more often price tests the boundaries, the more meaningful the eventual breakout.\n\nFlags and pennants are tighter consolidation forms that appear after sharp, near-vertical moves. A flag has parallel, slightly downward-sloping boundaries after a bullish move (a brief, orderly retracement). A pennant has converging boundaries, like a small symmetrical triangle. Both patterns suggest the prior move's momentum is pausing briefly before potentially resuming.\n\nTriangles take three forms: ascending (horizontal resistance, rising support), descending (declining resistance, horizontal support), and symmetrical (converging trendlines from both directions). Each has a textbook bias, but the important practical point is that the direction of the breakout — not the shape of the triangle itself — determines the actual outcome. Any of these can resolve in either direction.",
      },
      {
        type: "psychology",
        heading: "The Psychology of Consolidation",
        content:
          "During consolidation, both bulls and bears are actively testing their convictions. Each test of the upper boundary is an attempt by buyers to push price higher; each failure adds to the resistance's apparent strength. Each test of the lower boundary tests the sellers' ability to break price down; each hold adds to the support's apparent strength.\n\nParticipant frustration often builds during prolonged consolidation. Traders who bought near the bottom of the range and watched price stall at the top may eventually give up and sell — providing fresh sellers. Traders who shorted the top and watched price hold above support may eventually cover — providing demand. These participant dynamics explain why consolidation ranges eventually resolve: the holding participants gradually overcome or exhaust the opposing side.\n\nWhen the range finally breaks, the psychological impact is significant. Participants on the wrong side experience a sudden change in position status — their comfortable range-bound positions become losing directional positions. The urgency to exit creates the momentum surge that often accompanies consolidation breakouts.",
      },
      {
        type: "mistakes",
        heading: "Common Consolidation Mistakes",
        content:
          "One of the most common mistakes is anticipating the direction of the breakout before it occurs. Traders often look at a consolidation pattern — particularly a triangle or wedge — and decide that it 'must' break upward or downward based on the pattern's shape. Patterns fail constantly, and consolidation patterns resolve in the 'wrong' direction regularly.\n\nTrading within the range — buying support and selling resistance — can work but becomes less reliable the longer the range persists. As consolidation extends in time, the eventual resolution becomes more likely to be a breakout. Traders who are accustomed to range-bound behavior may be caught off guard when the breakout finally arrives.\n\nFinally, many participants underestimate how long consolidation phases can persist. Periods of two, four, or even eight weeks of tight ranging are not unusual after a major move. Impatience during these periods often leads to poor timing — either abandoning valid positions too early or forcing entries before the pattern has resolved.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaways",
        content:
          "Consolidation is the market's pause — the period when buyers and sellers reach a temporary equilibrium after a significant directional move. It is not a sign of a dead market; it is a sign that the market is deciding what comes next.\n\nThe most valuable consolidation patterns for traders are those that form after a clear directional move (potential continuation), have well-defined boundaries that have been tested multiple times, and show contracting volume as the pattern matures — suggesting the battle between buyers and sellers is narrowing toward a decision.\n\nThe breakout direction remains unknown until price actually breaks. Volume on the breakout provides the most important initial confirmation. The measured-move projection — the height of the consolidation pattern added to the breakout point — offers a logical first target reference, understanding that it is a projection based on pattern symmetry, not a promise.",
      },
    ],
    diagram: `<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='background:#0E1B30;border-radius:8px;'>
  <style>
    @keyframes boxFade { from { opacity:0; } to { opacity:0.15; } }
    @keyframes tracePath { from { stroke-dashoffset:700; } to { stroke-dashoffset:0; } }
    @keyframes arrowAppear { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
    .range-fill { animation: boxFade 1s ease 0.5s forwards; opacity:0; }
    .price-trace { stroke-dasharray:700; stroke-dashoffset:700; animation: tracePath 2.5s ease forwards; }
    .resolution { animation: arrowAppear 0.6s ease 2.8s forwards; opacity:0; }
    .label { font-family:sans-serif; font-size:9px; fill:#F4F7FA; }
    .sublabel { font-family:sans-serif; font-size:8px; fill:#27B7C8; }
  </style>
  <!-- Prior trend -->
  <polyline class='price-trace' points='10,175 50,155 90,130 130,100 160,90' fill='none' stroke='#27B7C8' stroke-width='2'/>
  <!-- Consolidation range fill -->
  <rect x='155' y='80' width='160' height='55' fill='#27B7C8' class='range-fill' rx='2'/>
  <!-- Consolidation top/bottom lines -->
  <line x1='155' y1='80' x2='315' y2='80' stroke='#E05555' stroke-width='1.5' stroke-dasharray='4 3'/>
  <line x1='155' y1='135' x2='315' y2='135' stroke='#49B06E' stroke-width='1.5' stroke-dasharray='4 3'/>
  <!-- Consolidation price action -->
  <polyline class='price-trace' points='160,90 185,115 210,88 240,120 265,85 290,118 315,90' fill='none' stroke='#F4F7FA' stroke-width='1.5' opacity='0.8' style='animation-delay:1s;'/>
  <!-- Breakout -->
  <g class='resolution'>
    <polyline points='315,90 340,60 370,35' fill='none' stroke='#49B06E' stroke-width='2.5'/>
    <polygon points='370,28 362,40 378,40' fill='#49B06E'/>
    <text x='345' y='55' class='label' fill='#49B06E'>Breakout</text>
  </g>
  <text x='200' y='195' class='sublabel' text-anchor='middle'>Consolidation range resolving into breakout</text>
</svg>`,
    quiz: [
      {
        q: "What does contracting volume during a consolidation pattern typically suggest?",
        options: [
          "The pattern is invalid and should be ignored",
          "Market is closed for the period",
          "The battle between buyers and sellers is narrowing toward a decision — the spring is being compressed",
          "Volume always contracts before a downward breakdown",
        ],
        correct: 2,
        explanation:
          "Contracting volume during consolidation reflects decreasing disagreement between buyers and sellers as the range narrows. This compression of activity is often seen as a sign that the market is building energy for a directional move — though the direction of that move remains unknown until the breakout.",
      },
      {
        q: "A 'flag' pattern is best described as:",
        options: [
          "A horizontal range lasting more than six months",
          "A tight, slightly counter-trend consolidation after a sharp directional move",
          "A pattern that only forms on weekly charts",
          "Any candle that closes near its midpoint",
        ],
        correct: 1,
        explanation:
          "A flag is a brief, tight consolidation with slightly counter-trend-sloping parallel boundaries that forms after a sharp, near-vertical move. The 'flagpole' is the sharp move; the 'flag' is the brief consolidation. The pattern suggests temporary pausing before a potential continuation — though continuation is not guaranteed.",
      },
      {
        q: "An ascending triangle is characterized by:",
        options: [
          "Declining highs and declining lows",
          "Horizontal resistance and rising support converging toward the right",
          "Expanding price swings above and below a midpoint",
          "Volume that always rises throughout the pattern",
        ],
        correct: 1,
        explanation:
          "An ascending triangle features a horizontal resistance line (buyers keep failing at the same level) and a rising support trendline (buyers are setting higher lows each time). The textbook bias is bullish continuation, but the pattern can resolve in either direction — the breakout direction and volume confirmation are what matter most.",
      },
      {
        q: "Why is it problematic to anticipate a consolidation's breakout direction before it occurs?",
        options: [
          "Anticipating direction is against trading regulations in most markets",
          "Patterns fail constantly — consolidation patterns resolve in the unexpected direction regularly enough to make premature directional bias costly",
          "Only professional traders are allowed to anticipate breakouts",
          "Breakout direction is determined by the phase of the moon, not pattern shape",
        ],
        correct: 1,
        explanation:
          "Consolidation patterns fail to break in their 'textbook' direction with significant frequency. Premature directional conviction before a breakout leads to entering too early, being wrong-footed by a break in the opposite direction, and missing the actual setup when the real breakout occurs.",
      },
    ],
    girlToGirlTip:
      "Consolidation is like the market taking a breath before saying something important. It can feel boring — nothing is happening. But that is exactly when attention matters most, girl. The setup is building. The patient traders are the ones waiting for the breath to end.",
    videoSlot: null,
  },

  // ─── Lesson 9: Market Structure ───────────────────────────────────────────
  {
    module: "M1",
    slug: "market-structure",
    title: "Market Structure",
    subtitle: "The backbone framework behind all price action analysis",
    difficulty: "Intermediate",
    readingMinutes: 10,
    sections: [
      {
        type: "overview",
        heading: "What Is Market Structure?",
        content:
          "Market structure refers to the overarching pattern of highs and lows that price creates as it moves through time. Rather than focusing on any single candle or pattern, market structure analysis examines the sequence of swing points — their relative levels and relationships — to determine whether a market is trending, consolidating, or transitioning.\n\nThe core principle is simple: an uptrend is defined by a series of higher highs and higher lows (HH, HL). A downtrend is defined by a series of lower highs and lower lows (LH, LL). A ranging market produces no consistent pattern — highs and lows oscillate without systematic directional progression.\n\nPatterns fail constantly, and market structure signals frequently produce false reads — nothing guarantees profits from market structure analysis. But as a framework for organizing the seemingly chaotic movement of price into a coherent narrative, market structure analysis is among the most foundational tools in a technical trader's arsenal.",
      },
      {
        type: "why-matters",
        heading: "Why Market Structure Matters",
        content:
          "Every other technical concept in this module — candlesticks, support and resistance, trendlines, breakouts, pullbacks — gains meaning from the market structure context it sits within. A bullish engulfing candle means something different in a downtrend than in an uptrend. A breakout above resistance is more significant if the overall market structure supports an upward bias.\n\nMarket structure is the framework that determines whether individual signals should be treated as trend-following setups or counter-trend setups. Most technical analysis works better when it aligns with the prevailing structure than when it fights it. Understanding structure tells a trader which side of the market the higher-probability setups are likely to appear on.\n\nStructure analysis is also one of the most objective tools available. Unlike indicators that require parameter settings and can be optimized (over-fit) to look good in hindsight, the series of swing highs and lows that define market structure is simply drawn from price itself — no formula required.",
      },
      {
        type: "how-identify",
        heading: "Identifying and Tracking Market Structure",
        content:
          "Identifying market structure begins with marking significant swing highs and swing lows on a chart. A swing high is a peak where price made a high and then declined on both sides. A swing low is a trough where price made a low and then advanced on both sides. These are the building blocks.\n\nOnce swing points are marked, the relationship between consecutive swings reveals the structure. In a healthy uptrend: each swing high is higher than the previous swing high (HH), and each swing low is higher than the previous swing low (HL). The moment this sequence breaks — when price fails to make a new higher high, or when it drops below the most recent higher low — a structural warning signal is produced.\n\nThe most significant structural signal is a 'break of structure' (BOS): price moves below a prior significant swing low in what was an uptrend, or above a prior significant swing high in what was a downtrend. A break of structure on a higher timeframe is among the more powerful signals that trend direction may be changing — not a guarantee, but a meaningful development that warrants reassessing the prior directional bias.",
      },
      {
        type: "psychology",
        heading: "The Psychology Behind Market Structure",
        content:
          "The pattern of higher highs and higher lows in an uptrend reflects the behavior of buyers who are progressively more willing to pay higher prices, while sellers who attempt to push price lower are met with buying pressure at progressively higher floor levels. This dynamic represents genuine supply and demand shifting in favor of buyers over time.\n\nWhen structure breaks — when a significant prior swing low is violated — it means that the buyers who had been supporting price at higher levels are now unwilling or unable to defend that level. This is a behavioral shift, not just a price movement. The sellers have, at least temporarily, overwhelmed the buyers at a level where buyers had previously prevailed.\n\nThis behavioral context is why structural breaks tend to attract attention disproportionate to their visual significance on a chart. The break of a prior swing low is not just a number — it represents a documented change in the balance of market forces, visible to every participant who is watching the same swing points.",
      },
      {
        type: "mistakes",
        heading: "Common Market Structure Mistakes",
        content:
          "Over-labeling swing points is a common pitfall. On any timeframe, there are dozens of minor wiggles that could technically be called swing highs and lows. The most meaningful structural analysis focuses on the significant swings that jump out naturally — the ones that represent clear reactions and that are obvious to most market participants.\n\nIgnoring timeframe hierarchy is another frequent error. A break of structure on the 5-minute chart within a healthy uptrend on the daily chart is not the same thing as a break of structure on the daily chart itself. Lower-timeframe structural breaks within higher-timeframe trends are often just pullbacks. Context from the higher timeframe always governs.\n\nPerhaps the most costly mistake is treating a single structural break as a definitive reversal signal and immediately positioning aggressively against the prior trend. Structural breaks frequently produce a retest of the break level — what is sometimes called a 'pullback to the point of structural change' — before the new direction is truly established. Patience after a structural break, rather than urgency, serves traders better.",
      },
      {
        type: "takeaway",
        heading: "Key Takeaways",
        content:
          "Market structure is the framework that organizes price action into a coherent narrative. The sequence of higher highs and higher lows defines an uptrend; lower highs and lower lows define a downtrend. The moment that sequence breaks, the existing structural bias is under question.\n\nAll other technical analysis concepts gain their meaning from the structure context they inhabit. A setup that aligns with the prevailing structure is a trend-following setup; one that opposes it is a counter-trend setup — a fundamentally different risk profile.\n\nDeveloping fluency with market structure is a progression. It begins with learning to identify significant swing points, then progresses to reading the sequence of those swings, and eventually becomes an intuitive layer of awareness that accompanies every chart observation. This lesson sets the stage for the final lesson in Module 1: the complete chart reading workflow.",
      },
    ],
    diagram: `<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='background:#0E1B30;border-radius:8px;'>
  <style>
    @keyframes traceStruct { from { stroke-dashoffset:800; } to { stroke-dashoffset:0; } }
    @keyframes labelFade { from { opacity:0; } to { opacity:1; } }
    .struct-line { stroke-dasharray:800; stroke-dashoffset:800; animation: traceStruct 3s ease forwards; }
    .lbl { animation: labelFade 0.5s ease forwards; opacity:0; font-family:sans-serif; font-size:9px; }
    .lbl1{animation-delay:0.5s;} .lbl2{animation-delay:1s;} .lbl3{animation-delay:1.5s;} .lbl4{animation-delay:2s;} .lbl5{animation-delay:2.5s;}
    .sublabel { font-family:sans-serif; font-size:8px; fill:#27B7C8; }
  </style>
  <!-- HH HL sequence -->
  <polyline class='struct-line' points='20,170 70,130 110,155 170,95 220,120 280,65 330,90 370,50' fill='none' stroke='#27B7C8' stroke-width='2.5'/>
  <!-- Swing point dots -->
  <circle cx='20' cy='170' r='4' fill='#49B06E'/>
  <circle cx='70' cy='130' r='4' fill='#E05555'/>
  <circle cx='110' cy='155' r='4' fill='#49B06E'/>
  <circle cx='170' cy='95' r='4' fill='#E05555'/>
  <circle cx='220' cy='120' r='4' fill='#49B06E'/>
  <circle cx='280' cy='65' r='4' fill='#E05555'/>
  <circle cx='330' cy='90' r='4' fill='#49B06E'/>
  <!-- Labels -->
  <text x='62' y='122' class='lbl lbl1' fill='#E05555'>H</text>
  <text x='102' y='170' class='lbl lbl2' fill='#49B06E'>HL</text>
  <text x='162' y='87' class='lbl lbl3' fill='#E05555'>HH</text>
  <text x='212' y='138' class='lbl lbl4' fill='#49B06E'>HL</text>
  <text x='272' y='57' class='lbl lbl5' fill='#E05555'>HH</text>
  <text x='200' y='195' class='sublabel' text-anchor='middle'>Higher Highs (HH) + Higher Lows (HL) = Uptrend Structure</text>
</svg>`,
    quiz: [
      {
        q: "An uptrend is structurally defined by:",
        options: [
          "Price moving upward in a straight line without any pullbacks",
          "A series of higher highs and higher lows",
          "Volume increasing on every single candle",
          "Price staying above a 200-day moving average",
        ],
        correct: 1,
        explanation:
          "Market structure defines an uptrend as a sequence of higher highs (each peak exceeds the prior peak) and higher lows (each trough is above the prior trough). This pattern reflects buyers being willing to pay progressively higher prices and sellers being overcome at progressively higher floor levels.",
      },
      {
        q: "A 'break of structure' (BOS) in an uptrend occurs when:",
        options: [
          "A new all-time high is made",
          "Price makes a slightly lower high on one candle",
          "Price moves decisively below a significant prior swing low",
          "Volume drops below the 20-day average",
        ],
        correct: 2,
        explanation:
          "A break of structure in an uptrend occurs when price drops below a significant prior swing low — violating the pattern of higher lows that defined the trend. This behavioral shift suggests buyers are no longer defending that level at which they previously prevailed, and warrants reassessing the bullish bias.",
      },
      {
        q: "Why does a structural break on a 5-minute chart within a daily uptrend carry different significance than a break on the daily chart itself?",
        options: [
          "5-minute charts are not legally recognized in technical analysis",
          "Lower-timeframe structural breaks within larger-timeframe trends are often pullbacks within the prevailing trend rather than true reversals",
          "Daily charts are always correct and override all other timeframes automatically",
          "The 5-minute chart shows more candles and is therefore more accurate",
        ],
        correct: 1,
        explanation:
          "Timeframe hierarchy governs the significance of structural breaks. A break of structure on a 5-minute chart within a healthy daily uptrend is typically a normal pullback — the daily trend is intact. A break of structure on the daily chart itself is a higher-significance event that questions the larger bias.",
      },
      {
        q: "Why is patience recommended after a break of structure, rather than immediately positioning aggressively against the prior trend?",
        options: [
          "Markets are closed after a break of structure",
          "A break of structure typically produces a retest of the break level before the new direction is truly established, and premature positioning risks being caught in that retest",
          "The prior trend always resumes within 24 hours after a structural break",
          "Patience is only needed for beginner traders",
        ],
        correct: 1,
        explanation:
          "Structural breaks are frequently followed by a retest of the broken level — sometimes called a pullback to the point of structural change. Positioning aggressively immediately after the break can result in being caught in this retest move. Waiting for price to confirm the new direction adds a layer of discipline that often improves timing.",
      },
    ],
    girlToGirlTip:
      "When you understand market structure, suddenly all the other patterns make sense in context. Is this a breakout in a healthy uptrend? A pullback to a higher low? A possible trend change? Structure gives every other tool its meaning. This is the layer that ties everything together, girl.",
    videoSlot: null,
  },

  // ─── Lesson 10: Chart Reading Workflow ────────────────────────────────────
  {
    module: "M1",
    slug: "chart-reading-workflow",
    title: "Chart Reading Workflow",
    subtitle: "A systematic process for approaching any chart with confidence",
    difficulty: "Intermediate",
    readingMinutes: 12,
    sections: [
      {
        type: "overview",
        heading: "Why a Workflow Matters",
        content:
          "After covering nine individual concepts — candlesticks, support and resistance, trendlines, volume, timeframes, breakouts, pullbacks, consolidation, and market structure — the natural question is: how does a trader put these tools together into a coherent process when sitting down to look at a real chart?\n\nWithout a workflow, chart reading becomes reactive and inconsistent. A trader might notice an interesting candlestick, then look for support levels, then remember to check the trend, then notice volume after the fact — a scattered, order-dependent process that produces inconsistent results depending on what catches the eye first.\n\nA systematic workflow reverses this: it applies the same analytical sequence to every chart every time, regardless of what initially draws attention. This consistency reduces the influence of cognitive bias (seeing what one wants to see) and increases the reliability of the analysis. Patterns fail constantly and nothing guarantees profits, but a systematic process at least ensures that the analysis is thorough and consistent.",
      },
      {
        type: "why-matters",
        heading: "The Benefits of a Repeatable Process",
        content:
          "Systematic chart reading builds pattern recognition in a structured way. When the same analytical steps are applied consistently, the brain begins to link specific combinations of conditions to specific types of outcomes — a form of experiential learning that random, reactive analysis never produces.\n\nA workflow also creates a decision log. When a trader can articulate exactly why a chart is interesting — what the structure says, where the key levels are, what the trend direction is, what the volume signature shows — it becomes possible to evaluate and improve the process over time. This is how analysis matures from intuition to structured methodology.\n\nFinal decisions always rest with individual traders, who must conduct their own analysis and understand that no framework — however systematic — removes risk or guarantees results. A workflow is a process tool, not a signal generator.",
      },
      {
        type: "how-read",
        heading: "The Five-Step Chart Reading Workflow",
        content:
          "Step 1 — Start with the higher timeframe (weekly or daily). Before looking at anything else, establish the macro context: What is the dominant trend direction? Is the market making higher highs and higher lows, lower highs and lower lows, or oscillating without directional progress? Mark the major swing points and structural levels on this timeframe first.\n\nStep 2 — Identify the key levels. Mark horizontal support and resistance zones that are clearly visible — prior swing highs, swing lows, areas of significant price consolidation. These are the locations where the market has shown an elevated tendency to react. Mark them before zooming in to avoid being influenced by lower-timeframe noise.\n\nStep 3 — Assess the current position within structure. Is price approaching a key level? Is it in the middle of a range? Has it just broken through a level? The current position within the structural map determines whether a setup is high-priority or low-priority. Being near a key level in the direction of the trend is high-priority. Being in the middle of nowhere with no nearby level of interest is not.\n\nStep 4 — Drop to the setup timeframe and assess volume and price action detail. Now examine the more granular timeframe (daily or 4-hour for swing trading; 1-hour or 15-minute for shorter-term work) to evaluate volume patterns, candlestick behavior, and trendline dynamics at the key levels identified in step 2. This is where individual candle signals, volume confirmation, and trendline tests become relevant.\n\nStep 5 — Form a structured observation, not a forced trade. Articulate what the chart shows: the trend direction, the key levels, the current position, the volume signature, and whether any behavioral signal (candlestick pattern, volume expansion) exists at a meaningful location. This observation either produces a valid setup or it doesn't. Most charts on any given day will not produce a compelling observation. That is a correct and desirable outcome — not every chart needs to generate a trade idea.",
      },
      {
        type: "psychology",
        heading: "The Psychology of Disciplined Chart Reading",
        content:
          "The greatest obstacle to systematic chart reading is the desire to find something on every chart. Markets contain endless patterns, and the human brain is extraordinarily good at finding patterns even where none exist. A systematic workflow counteracts this by requiring that multiple specific criteria be met before an observation is considered meaningful.\n\nAnother psychological challenge is attachment to a prior thesis. After spending time analyzing a chart and developing a view, it becomes emotionally difficult to abandon that view when the chart behavior changes. A workflow helps by establishing that the analysis is of the chart as it is, not as one expects it to be. If the structure changes, the analysis updates — there is no prior thesis to defend.\n\nFinally, the most disciplined application of a chart reading workflow is accepting that a systematic review of many charts in a session may yield zero compelling observations. This is not a failure — it is the system working correctly. The goal of the workflow is accurate assessment, not generating trade ideas on demand.",
      },
      {
        type: "mistakes",
        heading: "Common Workflow Mistakes",
        content:
          "Skipping steps under time pressure is perhaps the most common workflow failure mode. When a price move is already underway, the urgency to act can lead a trader to jump straight to the lowest timeframe for entry detail without establishing the higher-timeframe context first. This bottom-up approach regularly produces entries that look clean on the micro view but are swimming against the macro current.\n\nForcing a narrative onto ambiguous charts is another frequent problem. Some charts are genuinely unclear — the trend is mixed, the levels are overlapping, the volume is noisy. A systematic workflow should produce the honest assessment: 'this chart is ambiguous and doesn't produce a high-quality observation today.' Forcing a narrative anyway leads to lower-quality observations and suboptimal analytical outcomes.\n\nFinally, many traders treat the workflow as something they'll adopt 'eventually' — once they develop more experience. The reality is the opposite: a systematic workflow builds the experience faster. Starting the structured process from the beginning, even imperfectly, produces the pattern-recognition learning that random chart scanning does not.",
      },
      {
        type: "takeaway",
        heading: "Module 1 Complete: What Comes Next",
        content:
          "Module 1 has covered the essential building blocks of chart reading: the language of individual candles (candlesticks), the horizontal structure of the market (support and resistance), the directional slope of the market (trendlines), the conviction behind every move (volume), the multiple perspectives available (timeframes), and the structural events that matter most (breakouts, pullbacks, consolidation, market structure).\n\nThe five-step workflow ties these tools into a coherent, repeatable analytical process — starting from the highest timeframe to establish context, identifying key levels, assessing current structural position, examining price action detail and volume at meaningful locations, and forming honest, criteria-based observations.\n\nPatterns fail constantly, and nothing learned in this module guarantees profits. What the module provides is a structured framework for understanding what a chart is communicating — and a systematic process for evaluating that communication consistently. That foundation supports every more advanced concept explored in subsequent modules. Welcome to the beginning of a genuine analytical education.",
      },
    ],
    diagram: `<svg viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg' style='background:#0E1B30;border-radius:8px;'>
  <style>
    @keyframes stepAppear { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
    .step1 { animation: stepAppear 0.4s ease 0.0s forwards; opacity:0; }
    .step2 { animation: stepAppear 0.4s ease 0.3s forwards; opacity:0; }
    .step3 { animation: stepAppear 0.4s ease 0.6s forwards; opacity:0; }
    .step4 { animation: stepAppear 0.4s ease 0.9s forwards; opacity:0; }
    .step5 { animation: stepAppear 0.4s ease 1.2s forwards; opacity:0; }
    .label { font-family:sans-serif; font-size:9px; fill:#F4F7FA; }
    .num { font-family:sans-serif; font-size:11px; font-weight:bold; fill:#27B7C8; }
    .sublabel { font-family:sans-serif; font-size:8px; fill:#27B7C8; }
  </style>
  <!-- Step boxes -->
  <g class='step1'>
    <rect x='10' y='20' width='370' height='24' fill='#27B7C8' opacity='0.15' rx='3'/>
    <text x='18' y='36' class='num'>1</text>
    <text x='36' y='36' class='label'>Higher Timeframe — Establish trend direction and mark major structure</text>
  </g>
  <g class='step2'>
    <rect x='10' y='52' width='370' height='24' fill='#49B06E' opacity='0.15' rx='3'/>
    <text x='18' y='68' class='num' fill='#49B06E'>2</text>
    <text x='36' y='68' class='label'>Key Levels — Mark support and resistance zones clearly</text>
  </g>
  <g class='step3'>
    <rect x='10' y='84' width='370' height='24' fill='#27B7C8' opacity='0.15' rx='3'/>
    <text x='18' y='100' class='num'>3</text>
    <text x='36' y='100' class='label'>Current Position — Is price near a key level in trend direction?</text>
  </g>
  <g class='step4'>
    <rect x='10' y='116' width='370' height='24' fill='#49B06E' opacity='0.15' rx='3'/>
    <text x='18' y='132' class='num' fill='#49B06E'>4</text>
    <text x='36' y='132' class='label'>Volume and Price Action — Candlestick signals and volume at the level</text>
  </g>
  <g class='step5'>
    <rect x='10' y='148' width='370' height='24' fill='#27B7C8' opacity='0.15' rx='3'/>
    <text x='18' y='164' class='num'>5</text>
    <text x='36' y='164' class='label'>Structured Observation — Valid setup or no setup. Both are correct answers.</text>
  </g>
  <text x='200' y='195' class='sublabel' text-anchor='middle'>The Five-Step Chart Reading Workflow</text>
</svg>`,
    quiz: [
      {
        q: "According to the five-step chart reading workflow, what should a trader do first when approaching any chart?",
        options: [
          "Find the most interesting candlestick pattern immediately visible",
          "Start with the highest timeframe to establish trend direction and major structure",
          "Check the volume bars for any unusual spikes",
          "Identify potential entry points on the lowest available timeframe",
        ],
        correct: 1,
        explanation:
          "The workflow always begins with the highest relevant timeframe to establish macro context and trend direction before examining any lower-timeframe detail. Starting with the lowest timeframe creates bottom-up analysis that misses the structural context that gives setups their meaning.",
      },
      {
        q: "What is the correct outcome when a systematic chart reading workflow is applied to a chart that shows no compelling observation?",
        options: [
          "The workflow must have been applied incorrectly — there is always a setup",
          "No observation is a valid and desirable outcome — it means the system is working correctly by filtering out low-quality situations",
          "The trader should switch to a lower timeframe until a setup is found",
          "All charts should produce observations every session",
        ],
        correct: 1,
        explanation:
          "A workflow that produces no compelling observation on a given chart is working correctly. The goal is accurate assessment, not generating setups on demand. Most charts on most days will not produce high-quality observations — recognizing and accepting that is a sign of analytical discipline, not failure.",
      },
      {
        q: "What does 'Step 3 — Assess the current position within structure' mean in the workflow?",
        options: [
          "Evaluating whether price is at an exact prior candlestick high",
          "Determining whether price is near a key level in the direction of the trend — a high-priority location — versus in the middle of a range with no nearby level of interest",
          "Calculating the percentage distance from a 52-week high",
          "Counting the number of candles in the current consolidation",
        ],
        correct: 1,
        explanation:
          "Assessing current position means evaluating where price sits within the structural map identified in steps 1 and 2. Being near a meaningful support or resistance level in the direction of the trend is the highest-priority location. Being between levels with no clear structural interest is a lower-priority situation regardless of what lower-timeframe patterns may appear.",
      },
      {
        q: "Why does the workflow recommend marking key levels on the higher timeframe before drilling into lower timeframe detail?",
        options: [
          "Lower timeframe charts don't show support and resistance levels",
          "To avoid being influenced by lower-timeframe noise and to ensure the most significant structural levels are identified first, before they can be unconsciously filtered out",
          "Higher timeframe levels are guaranteed to be more accurate",
          "Trading regulations require levels to be marked in this order",
        ],
        correct: 1,
        explanation:
          "Marking levels on the higher timeframe first prevents the common cognitive bias of anchoring on lower-timeframe levels and then selectively noting only the higher-timeframe levels that happen to align. Starting top-down ensures the most structurally significant levels are always identified first, providing the framework within which lower-timeframe detail is then interpreted.",
      },
    ],
    girlToGirlTip:
      "The workflow feels slow at first — like, why go through all five steps when one thing jumped out immediately? But that first thing that jumps out is often just what your brain wants to see, not what the chart is actually saying. The process exists to keep you honest with yourself, girl. Trust it.",
    videoSlot: null,
  },
];

export function getM1LessonBySlug(slug: string): UniversityLesson | undefined {
  return M1_LESSONS.find((l) => l.slug === slug);
}
