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
    module: "m1-chart-reading",
    slug: "candlesticks",
    title: "Candlesticks — What They Actually Mean",
    subtitle: "This is the alphabet, love. Learn to read one candle and you can read any chart.",
    difficulty: "Beginner",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}.a{animation:fadeIn 0.6s ease both}.lbl{font-family:'DM Sans',sans-serif;font-size:10px;fill:#F4F7FA}</style><rect width="400" height="220" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Anatomy of a Candle</text><!-- Green candle --><line x1="110" y1="40" x2="110" y2="70" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.1s"/><!-- upper wick --><rect x="96" y="70" width="28" height="80" rx="2" fill="#49B06E" class="a" style="animation-delay:0.2s"/><!-- body --><line x1="110" y1="150" x2="110" y2="175" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.3s"/><!-- lower wick --><text x="148" y="50" class="lbl a" style="animation-delay:0.4s">Upper wick</text><line x1="145" y1="50" x2="118" y2="52" stroke="#F4F7FA" stroke-width="0.8" opacity="0.4" class="a" style="animation-delay:0.4s"/><text x="148" y="112" class="lbl a" style="animation-delay:0.5s">Body (open→close)</text><line x1="145" y1="110" x2="126" y2="110" stroke="#F4F7FA" stroke-width="0.8" opacity="0.4" class="a" style="animation-delay:0.5s"/><text x="148" y="170" class="lbl a" style="animation-delay:0.6s">Lower wick</text><line x1="145" y1="168" x2="118" y2="168" stroke="#F4F7FA" stroke-width="0.8" opacity="0.4" class="a" style="animation-delay:0.6s"/><!-- Red candle --><line x1="270" y1="45" x2="270" y2="75" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.7s"/><rect x="256" y="75" width="28" height="75" rx="2" fill="#ef4444" class="a" style="animation-delay:0.8s"/><line x1="270" y1="150" x2="270" y2="178" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.9s"/><text x="15" y="85" class="lbl a" style="animation-delay:1s" fill="#49B06E">Closed higher</text><text x="15" y="98" class="lbl a" style="animation-delay:1s" fill="#49B06E">(buyers won)</text><text x="305" y="115" class="lbl a" style="animation-delay:1.1s" fill="#ef4444">Closed lower</text><text x="305" y="128" class="lbl a" style="animation-delay:1.1s" fill="#ef4444">(sellers won)</text><text x="200" y="210" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Body = who won · Wicks = where they got rejected</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "Overview",
        content: "This is the alphabet, love. Learn to read one candle and you can read any chart. Each candle tells the story of one slice of time in four numbers: where price opened, where it closed, and the highest and lowest it touched in between."
      },
      {
        type: "how-read",
        heading: "How to Read One",
        content: "The thick part is the body — open to close. Closed higher than it opened? Usually green: buyers won that round. Lower? Red: sellers won. The thin lines poking out are the wicks — the highest and lowest price reached before things settled. A long wick means price tried to go somewhere and got shoved back. That rejection is the juicy part."
      },
      {
        type: "psychology",
        heading: "What They Mean",
        content: "A big green body with tiny wicks = buyers calm and in control. A tiny body with long wicks both ways = total indecision, a tug-of-war with no winner. A long lower wick = price dropped and got bought right back up (buyers defending). A long upper wick = price popped and got sold right back down (sellers defending). The candle is emotion, drawn."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Reading one candle like a prophecy. One candle is a sentence, not the story — always read it with the ones around it."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Body = who won. Wicks = where they got rejected. That's the whole alphabet.\n\nEducational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
      }
    ],
    quiz: [
      {
        q: "What does a long lower wick on a candle typically suggest?",
        options: [
          "Sellers dominated the entire session",
          "Price dropped and was bought back up — buyers defended that level",
          "The candle closed at the session low",
          "Volume was unusually high"
        ],
        correct: 1,
        explanation: "A long lower wick means price fell significantly during the session but buyers stepped in and pushed it back up. That recovery is visible in the wick — it shows where sellers tried and got rejected."
      },
      {
        q: "What does the body of a candlestick represent?",
        options: [
          "The highest and lowest price of the session",
          "The total volume traded",
          "The range from open to close",
          "The moving average over the period"
        ],
        correct: 2,
        explanation: "The body shows the range from open to close. A green body means close was above open (buyers won); a red body means close was below open (sellers won)."
      },
      {
        q: "A candle has a tiny body and long wicks on both sides. What does this suggest?",
        options: [
          "Buyers were strongly in control",
          "Total indecision — a tug-of-war with no clear winner",
          "A powerful breakout is confirmed",
          "Volume was at its highest"
        ],
        correct: 1,
        explanation: "A tiny body with long wicks on both sides means price made big swings in both directions but ended near where it started — neither buyers nor sellers won the session. That's a classic indecision candle."
      },
      {
        q: "Why is it a mistake to read a single candle in isolation?",
        options: [
          "Single candles don't contain valid price data",
          "Candles only show volume, not direction",
          "One candle is a sentence, not the story — context from surrounding candles is essential",
          "Candlestick charts are less reliable than bar charts"
        ],
        correct: 2,
        explanation: "A single candle shows one moment in time. Its meaning changes entirely depending on what came before and after it. Reading candles in context — as part of a sequence — is what produces useful information."
      }
    ],
    girlToGirlTip: "Don't memorize a hundred candle names yet. Just learn to feel a candle — strong, weak, or undecided. That instinct beats the vocabulary every time. Educational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
  },

  // ─── Lesson 2: Support ────────────────────────────────────────────────────
  {
    module: "m1-chart-reading",
    slug: "support-and-resistance",
    title: "Support — The Floor",
    subtitle: "A price level where buyers keep stepping in — a floor price has bounced off before.",
    difficulty: "Beginner",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.line{stroke-dasharray:800;stroke-dashoffset:800;animation:draw 2s ease forwards}.price{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 3s ease 0.5s forwards}.lbl{animation:fadeIn 0.5s ease 2.5s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Support — The Floor</text><line x1="30" y1="148" x2="375" y2="148" stroke="#49B06E" stroke-width="2" stroke-dasharray="6,4" class="line"/><path d="M30,80 L70,95 L90,148 L115,100 L140,148 L170,90 L200,148 L230,85 L260,148 L290,78 L320,110 L350,75" stroke="#27B7C8" stroke-width="2" fill="none" class="price"/><text x="340" y="144" font-family="DM Sans,sans-serif" font-size="10" fill="#49B06E" class="lbl">Support zone</text><circle cx="90" cy="148" r="4" fill="#49B06E" opacity="0.8" class="lbl"/><circle cx="140" cy="148" r="4" fill="#49B06E" opacity="0.8" class="lbl"/><circle cx="200" cy="148" r="4" fill="#49B06E" opacity="0.8" class="lbl"/><circle cx="260" cy="148" r="4" fill="#49B06E" opacity="0.8" class="lbl"/><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Buyers step in repeatedly — each touch is a bounce, not a guarantee</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "Overview",
        content: "Support is a price level where buyers keep stepping in — a floor price has bounced off before. Think of it as a level with memory."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "People remember where they bought, where something felt \"cheap,\" where it turned last time. When price returns there, buyers show up again, and that repeated buying holds the floor."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "They watch how price reacts at the level — does it bounce with energy, or limp? A level that holds again and again is \"respected.\" But here's the part that matters: support is a zone, not a magic line, and floors break. When support breaks, it often flips into a ceiling (resistance) — old floors become new walls."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Treating support as a guarantee that price will bounce. It's a level of interest, not a force field."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Support is where buyers have shown up before — watch the reaction, respect the break.\n\nEducational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
      }
    ],
    quiz: [
      {
        q: "What is support in the context of a price chart?",
        options: [
          "A technical indicator calculated from volume",
          "A price level where buyers have repeatedly stepped in, creating a floor",
          "The highest price reached in a trading session",
          "A government regulation on minimum price"
        ],
        correct: 1,
        explanation: "Support is a price level with \"memory\" — a zone where buyers have previously stepped in and held the price up. The more times it has held, the more it is watched by traders."
      },
      {
        q: "What often happens when a support level breaks convincingly?",
        options: [
          "Price immediately recovers to the same level",
          "Volume disappears entirely",
          "The old support floor often becomes a new resistance ceiling",
          "The support level becomes stronger on the next test"
        ],
        correct: 2,
        explanation: "When support breaks, the dynamic often flips — buyers who held at that level are now sitting on losses and may sell when price returns to it. Old floors become new walls. This role-reversal is a key concept in technical analysis."
      },
      {
        q: "A support level is best understood as:",
        options: [
          "A guaranteed bounce point where price must reverse",
          "A zone of interest where buyers have historically appeared — a probability, not a promise",
          "A moving average crossover signal",
          "A level determined purely by trading volume"
        ],
        correct: 1,
        explanation: "Support is a zone of interest, not a force field. It increases the probability of a bounce but guarantees nothing. Treating it as a guarantee is the most common mistake traders make with support levels."
      },
      {
        q: "How do traders typically assess the quality of a support level?",
        options: [
          "By counting how many times it has been tested, and watching how price reacts at it",
          "By checking if a news event occurred near that price",
          "By measuring the distance from the 200-day moving average",
          "By looking at after-hours trading data only"
        ],
        correct: 0,
        explanation: "A support level that has been tested multiple times and held each time is considered well-established. Traders also watch the reaction at the level — a strong, energetic bounce is more convincing than a weak, hesitant one."
      }
    ],
    girlToGirlTip: "\"It always bounces here\" is how people get caught the one time it doesn't. Levels are probabilities, not promises. Educational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
  },

  // ─── Lesson 3: Resistance ─────────────────────────────────────────────────
  {
    module: "m1-chart-reading",
    slug: "resistance",
    title: "Resistance — The Ceiling",
    subtitle: "The mirror of support — a level where sellers keep stepping in, capping the move.",
    difficulty: "Beginner",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.line{stroke-dasharray:800;stroke-dashoffset:800;animation:draw 2s ease forwards}.price{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 3s ease 0.5s forwards}.lbl{animation:fadeIn 0.5s ease 2.5s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Resistance — The Ceiling</text><line x1="30" y1="62" x2="375" y2="62" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,4" class="line"/><path d="M30,140 L60,110 L90,62 L115,118 L145,62 L175,130 L205,62 L235,120 L265,62 L295,105 L325,62 L355,90" stroke="#27B7C8" stroke-width="2" fill="none" class="price"/><text x="340" y="58" font-family="DM Sans,sans-serif" font-size="10" fill="#ef4444" class="lbl">Resistance zone</text><circle cx="90" cy="62" r="4" fill="#ef4444" opacity="0.8" class="lbl"/><circle cx="145" cy="62" r="4" fill="#ef4444" opacity="0.8" class="lbl"/><circle cx="205" cy="62" r="4" fill="#ef4444" opacity="0.8" class="lbl"/><circle cx="265" cy="62" r="4" fill="#ef4444" opacity="0.8" class="lbl"/><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Sellers step in repeatedly — old ceilings can become new floors</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "Overview",
        content: "Resistance is the mirror of support — a level where sellers keep stepping in. A ceiling price struggles to break above."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "It's where people who bought too high are relieved to \"get out even,\" where price stalled before. That selling caps the move."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "Same logic flipped: watch the reaction at the ceiling. Repeated rejections = respected resistance. And the role-reversal works both ways — when price finally breaks above resistance, that old ceiling often becomes the new floor."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Assuming a ceiling can never break. Strong trends slice through resistance all the time; the level is information, not a stop sign."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Resistance is where sellers have shown up before — and a broken ceiling can become a floor.\n\nEducational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
      }
    ],
    quiz: [
      {
        q: "Why does resistance form at a particular price level?",
        options: [
          "Because regulators set maximum prices there",
          "Because traders who bought too high are relieved to sell at breakeven when price returns to that level",
          "Because moving averages converge at that point",
          "Because volume is always lowest at resistance"
        ],
        correct: 1,
        explanation: "Resistance forms because of memory and psychology. Traders who bought at a high price and watched it fall are eager to exit at breakeven when price returns — that wave of selling creates the ceiling."
      },
      {
        q: "What typically happens when price breaks convincingly above a resistance level?",
        options: [
          "The resistance level disappears entirely",
          "Price always continues higher indefinitely",
          "The old resistance ceiling often becomes a new support floor",
          "Volume always drops sharply after the break"
        ],
        correct: 2,
        explanation: "The role-reversal principle applies here: traders who missed the breakout now see the old resistance as an attractive level to participate — their buying at that level creates new support. Old ceilings become new floors."
      },
      {
        q: "Support and resistance are best understood as:",
        options: [
          "Opposite forces that cancel each other out",
          "The same idea — a level that matters — seen from above or below",
          "Indicators derived from trading volume only",
          "Only relevant on weekly and monthly charts"
        ],
        correct: 1,
        explanation: "Support and resistance are the same concept: a price level that the market has shown memory of. Whether it acts as a floor or ceiling depends on which side of the level price is on. The underlying dynamic is identical."
      },
      {
        q: "A stock has tested a resistance level four times over three months and failed each time. What does this suggest?",
        options: [
          "The resistance is guaranteed to hold forever",
          "The level is well-established and watched — but strong enough selling pressure has been present each time to cap the move",
          "The stock has no buyers",
          "The resistance will definitely break on the fifth attempt"
        ],
        correct: 1,
        explanation: "Multiple failed tests establish that the level is meaningful — sellers have consistently stepped in there. However, repeated tests also mean the resistance is absorbing selling; eventually those sellers can be exhausted. The level is information, not a guarantee."
      }
    ],
    girlToGirlTip: "Support and resistance aren't opposites — they're the same idea (a level that matters) seen from above or below. Once that clicks, charts get a lot quieter. Educational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
  },

  // ─── Lesson 4: Trendlines ────────────────────────────────────────────────
  {
    module: "m1-chart-reading",
    slug: "trendlines",
    title: "Trendlines — Drawing the Direction",
    subtitle: "A single line that makes the trend's slope visible and turns a messy chart into a clear question.",
    difficulty: "Beginner",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.tl{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease forwards}.price{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 3s ease 0.3s forwards}.lbl{animation:fadeIn 0.6s ease 2.8s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Trendline — Connect the Higher Lows</text><!-- Uptrend price path --><path d="M30,165 L60,145 L80,155 L110,125 L135,138 L165,108 L190,118 L220,85 L250,100 L280,68 L310,80 L340,52" stroke="#27B7C8" stroke-width="2" fill="none" class="price"/><!-- Trendline connecting higher lows --><line x1="30" y1="165" x2="340" y2="55" stroke="#49B06E" stroke-width="2" stroke-dasharray="6,3" class="tl"/><circle cx="30" cy="165" r="4" fill="#49B06E" class="lbl"/><circle cx="135" cy="138" r="4" fill="#49B06E" class="lbl"/><circle cx="250" cy="100" r="4" fill="#49B06E" class="lbl"/><text x="345" y="52" font-family="DM Sans,sans-serif" font-size="9" fill="#49B06E" class="lbl">Trendline</text><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Connect the higher lows — the break is the news</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "Overview",
        content: "A trendline is a single line that makes the trend's slope visible. In an uptrend, you connect the higher lows; in a downtrend, you connect the lower highs."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "It turns a messy chart into a clear question: is price still respecting the line, or did it break it? The line is a quick read on whether the trend is intact."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "As long as price keeps bouncing along the line, the trend is considered healthy. A clean break of the line is a change-of-character heads-up — not proof of reversal, but a reason to pay attention."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Forcing a line that isn't really there. If you have to ignore three candles to make it \"fit,\" it's a wish, not a trendline. Two touches is a guess; three or more earns respect."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Connect the lows in an uptrend, the highs in a downtrend — the break is the news.\n\nEducational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
      }
    ],
    quiz: [
      {
        q: "In an uptrend, what points does a trendline connect?",
        options: [
          "The highest highs",
          "The highest and lowest points equally",
          "The higher lows",
          "The closing prices only"
        ],
        correct: 2,
        explanation: "An uptrend trendline connects the higher lows — the sequence of rising swing lows that define the ascending structure. This makes the slope of the uptrend visible and shows whether the trend is intact."
      },
      {
        q: "How many touches of a trendline are generally needed to consider it credible?",
        options: [
          "One touch is enough",
          "Two touches defines it",
          "Three or more touches earn real respect",
          "Ten or more touches are required"
        ],
        correct: 2,
        explanation: "Two touches draws the line; three or more confirms it has been meaningful to the market. Each additional touch adds credibility — it shows the market has repeatedly respected that level."
      },
      {
        q: "A clean break of an uptrend trendline is best described as:",
        options: [
          "Proof that a major reversal is definitely underway",
          "A change-of-character signal — a reason to pay attention, not automatic confirmation of reversal",
          "Meaningless noise that should be ignored",
          "A guaranteed entry signal"
        ],
        correct: 1,
        explanation: "A trendline break is a change-of-character heads-up. It means the market's behavior has shifted in a notable way, but it doesn't automatically confirm a full reversal. Context — volume, how decisively it broke, what happens next — matters enormously."
      },
      {
        q: "In a downtrend, a trendline connects:",
        options: [
          "The lower lows",
          "The lower highs",
          "The average closing price",
          "The opening prices only"
        ],
        correct: 1,
        explanation: "In a downtrend, the trendline connects the lower highs — the sequence of declining swing highs that define the descending structure. This makes the slope of the downtrend visible."
      }
    ],
    girlToGirlTip: "If you're squinting and bending the line to make it work, the market is telling you the trend isn't as clean as you hoped. Listen. Educational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
  },

  // ─── Lesson 5: Volume ────────────────────────────────────────────────────
  {
    module: "m1-chart-reading",
    slug: "volume",
    title: "Volume — The Conviction Behind the Move",
    subtitle: "If price is the move, volume is the conviction behind it.",
    difficulty: "Beginner",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.bar{transform-origin:bottom;animation:grow 0.4s ease both}.price{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease 1.5s forwards}.lbl{animation:fadeIn 0.5s ease 2.5s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Volume — Conviction Behind the Move</text><!-- Volume bars --><rect x="35" y="148" width="22" height="22" fill="#27B7C8" opacity="0.5" class="bar" style="animation-delay:0.1s"/><rect x="65" y="140" width="22" height="30" fill="#27B7C8" opacity="0.5" class="bar" style="animation-delay:0.2s"/><rect x="95" y="145" width="22" height="25" fill="#27B7C8" opacity="0.5" class="bar" style="animation-delay:0.3s"/><rect x="125" y="143" width="22" height="27" fill="#27B7C8" opacity="0.5" class="bar" style="animation-delay:0.4s"/><!-- Breakout — high volume bar --><rect x="155" y="105" width="22" height="65" fill="#49B06E" opacity="0.9" class="bar" style="animation-delay:0.5s"/><text x="155" y="100" font-family="DM Sans,sans-serif" font-size="9" fill="#49B06E" class="lbl">High volume</text><text x="150" y="91" font-family="DM Sans,sans-serif" font-size="9" fill="#49B06E" class="lbl">breakout</text><!-- Low vol after --><rect x="185" y="158" width="22" height="12" fill="#27B7C8" opacity="0.3" class="bar" style="animation-delay:0.6s"/><rect x="215" y="162" width="22" height="8" fill="#27B7C8" opacity="0.3" class="bar" style="animation-delay:0.7s"/><rect x="245" y="155" width="22" height="15" fill="#27B7C8" opacity="0.3" class="bar" style="animation-delay:0.8s"/><text x="210" y="150" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)" class="lbl">Low volume</text><!-- Price line --><path d="M46,135 L76,128 L106,125 L136,120 L166,78 L196,75 L226,72 L256,68" stroke="#F4F7FA" stroke-width="1.5" fill="none" class="price"/><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Price = what · Volume = how much they meant it</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "Overview",
        content: "Volume is how many shares or contracts changed hands in a given period. If price is the move, volume is the conviction behind it."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "A move on high volume means lots of people agreed — real participation. The same move on low volume is thin, easily reversed, less trustworthy. Volume tells you whether the market meant it."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "It's mostly used to confirm. A breakout on rising volume is taken more seriously than one on quiet volume. A huge volume spike can mark exhaustion or a turning point. Volume rarely acts alone — it's the lie-detector for price."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Watching price and ignoring volume entirely. A pretty move with no volume behind it is a whisper pretending to be a shout."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Price tells you what; volume tells you how much they meant it.\n\nEducational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
      }
    ],
    quiz: [
      {
        q: "What does high volume on a price move suggest?",
        options: [
          "The move will definitely continue",
          "Many participants agreed with the move — real conviction behind it",
          "The move is about to reverse",
          "Only institutional traders were involved"
        ],
        correct: 1,
        explanation: "High volume means many market participants took action in the same direction — it suggests genuine conviction and participation. This makes the move more meaningful than the same price action on thin volume."
      },
      {
        q: "A stock breaks out to new highs on unusually low volume. How would traders typically view this?",
        options: [
          "As a very strong, confirmed breakout",
          "As a suspicious, potentially unreliable move that may reverse easily",
          "As a guaranteed continuation of the trend",
          "Volume is irrelevant to breakout analysis"
        ],
        correct: 1,
        explanation: "A breakout without volume conviction is a whisper pretending to be a shout. Low participation means fewer traders committed to the move — it's more likely to reverse than a breakout backed by real buying volume."
      },
      {
        q: "What role does volume primarily play in technical analysis?",
        options: [
          "It predicts price direction independently",
          "It acts as confirmation — a lie-detector for price moves",
          "It replaces the need to look at price action",
          "It only matters on monthly charts"
        ],
        correct: 1,
        explanation: "Volume is a confirmation tool, not a standalone signal. It adds or subtracts credibility from price moves. A price signal backed by strong volume is more reliable than the same signal on light volume."
      },
      {
        q: "What might an unusually large volume spike at the end of a long trend suggest?",
        options: [
          "The trend is about to accelerate strongly",
          "Volume spikes are always bullish",
          "Possible exhaustion or a climax — a turning point where the last wave of buyers or sellers piles in",
          "A new support or resistance level is forming"
        ],
        correct: 2,
        explanation: "A climax volume spike at the end of a trend can mark exhaustion — where the last wave of participants enters and the move runs out of fuel. This pattern (high volume reversal) is watched as a potential turning point, not a continuation signal."
      }
    ],
    girlToGirlTip: "When something makes a big move on tiny volume, raise an eyebrow. Real moves usually bring a crowd. Educational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
  },

  // ─── Lesson 6: Timeframes ────────────────────────────────────────────────
  {
    module: "m1-chart-reading",
    slug: "timeframes",
    title: "Timeframes — Zooming In and Out",
    subtitle: "The same chart looks completely different on a 1-minute view versus a daily versus a weekly.",
    difficulty: "Beginner",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}.a{animation:fadeIn 0.6s ease both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Same Price — Different Lens</text><!-- Weekly (big picture) --><rect x="20" y="30" width="100" height="70" rx="4" fill="rgba(39,183,200,0.08)" stroke="#27B7C8" stroke-width="1" class="a" style="animation-delay:0.1s"/><text x="70" y="46" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#27B7C8" class="a" style="animation-delay:0.1s">Weekly</text><path d="M28,88 L45,75 L62,65 L79,55 L96,48 L113,42" stroke="#49B06E" stroke-width="2" fill="none" class="a" style="animation-delay:0.3s"/><text x="70" y="108" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="rgba(244,247,250,0.5)" class="a" style="animation-delay:0.3s">Clear uptrend</text><!-- Daily (middle) --><rect x="150" y="30" width="100" height="70" rx="4" fill="rgba(39,183,200,0.08)" stroke="#27B7C8" stroke-width="1" class="a" style="animation-delay:0.4s"/><text x="200" y="46" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#27B7C8" class="a" style="animation-delay:0.4s">Daily</text><path d="M158,82 L170,70 L182,78 L194,62 L206,68 L218,55 L230,60 L242,50" stroke="#27B7C8" stroke-width="2" fill="none" class="a" style="animation-delay:0.6s"/><text x="200" y="108" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="rgba(244,247,250,0.5)" class="a" style="animation-delay:0.6s">Uptrend with pullbacks</text><!-- 5-min (noisy) --><rect x="280" y="30" width="100" height="70" rx="4" fill="rgba(39,183,200,0.08)" stroke="#27B7C8" stroke-width="1" class="a" style="animation-delay:0.7s"/><text x="330" y="46" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#27B7C8" class="a" style="animation-delay:0.7s">5-min</text><path d="M288,60 L296,75 L304,55 L312,80 L320,50 L328,72 L336,48 L344,65 L352,52 L360,70 L368,45" stroke="#ef4444" stroke-width="1.5" fill="none" class="a" style="animation-delay:0.9s"/><text x="330" y="108" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="rgba(244,247,250,0.5)" class="a" style="animation-delay:0.9s">Noise</text><!-- Arrow flow --><text x="130" y="68" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="14" fill="rgba(244,247,250,0.3)" class="a" style="animation-delay:1s">→</text><text x="260" y="68" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="14" fill="rgba(244,247,250,0.3)" class="a" style="animation-delay:1s">→</text><text x="200" y="145" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#F4F7FA" class="a" style="animation-delay:1.1s">Context first → Detail second</text><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Higher timeframe = louder signal · Lower timeframe = more noise</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "Overview",
        content: "The same chart looks completely different on a 1-minute view versus a daily versus a weekly. Each is a different lens on the same price."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "Higher timeframes (daily, weekly) show the big picture and tend to be more reliable — more participants, more meaning. Lower timeframes (1-min, 5-min) show detail but also a lot of noise. Where you look shapes what you conclude."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "Many zoom out first to see the overall trend, then zoom in for detail — \"context, then close-up.\" A signal that looks huge on a 1-minute chart can be a meaningless blip on the daily."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Living on the lowest timeframe and mistaking noise for signal. Beginners almost always zoom in too much and panic over wiggles that don't matter."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Big picture first, detail second. The higher the timeframe, the louder the signal.\n\nEducational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
      }
    ],
    quiz: [
      {
        q: "Why do higher timeframes (daily, weekly) tend to produce more reliable signals?",
        options: [
          "They are less commonly used, so they contain more hidden information",
          "They represent more participants, more time, and more meaningful price agreements",
          "Higher timeframes eliminate all noise",
          "They are updated less frequently, reducing false signals automatically"
        ],
        correct: 1,
        explanation: "Higher timeframe candles represent more time and more market participants agreeing on price. A weekly candle reflects five full trading days of activity — its structure carries more weight than a 5-minute candle representing a fraction of an hour."
      },
      {
        q: "A pattern looks very significant on a 1-minute chart. How should traders interpret this?",
        options: [
          "A 1-minute pattern is always more urgent and actionable",
          "Context from higher timeframes is needed — what looks huge on 1-minute may be a blip on the daily",
          "1-minute patterns are more reliable than daily patterns",
          "Ignore the higher timeframes when 1-minute signals appear"
        ],
        correct: 1,
        explanation: "A signal on a lower timeframe must be viewed in the context of higher timeframes. Something that looks dramatic on a 1-minute chart can be completely invisible noise on the daily chart — the higher timeframe always provides the broader context."
      },
      {
        q: "What is the recommended approach for using multiple timeframes?",
        options: [
          "Only use one timeframe to avoid conflicting signals",
          "Zoom out first for context, then zoom in for detail — big picture before close-up",
          "Always start with the smallest timeframe and work upward",
          "Use the same timeframe for all analysis regardless of the holding period"
        ],
        correct: 1,
        explanation: "The standard approach is context first, detail second — establish the big picture on higher timeframes, then use lower timeframes for closer observation. This prevents mistaking low-timeframe noise for meaningful signals."
      },
      {
        q: "What commonly happens when beginners focus primarily on very low timeframes?",
        options: [
          "They gain a significant edge from having more data",
          "They panic over normal price wiggles that mean nothing on higher timeframes",
          "They avoid false breakouts more effectively",
          "They can more easily identify long-term trends"
        ],
        correct: 1,
        explanation: "Low timeframes are full of noise — random fluctuations that have no significance on a higher timeframe. Beginners who live on 1-minute or 5-minute charts often react to movements that experienced traders would dismiss as meaningless on the daily chart."
      }
    ],
    girlToGirlTip: "Feeling anxious about a chart? Zoom out. Half the panic on a 5-minute chart disappears the second you see the daily. Educational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
  },

  // ─── Lesson 7: Breakouts ─────────────────────────────────────────────────
  {
    module: "m1-chart-reading",
    slug: "breakouts",
    title: "Breakouts — Stepping Out of the Box",
    subtitle: "Price moving decisively beyond a level it had been respecting — and the honest read on what that means.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.res{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 1.5s ease forwards}.price{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 2.5s ease 0.3s forwards}.brk{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 1s ease 2.8s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Breakout — Price Stepping Out of the Box</text><!-- Resistance line --><line x1="30" y1="90" x2="260" y2="90" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,3" class="res"/><text x="200" y="84" font-family="DM Sans,sans-serif" font-size="9" fill="#ef4444" class="lbl">Resistance</text><!-- Price bouncing in range --><path d="M30,140 L65,90 L90,132 L125,90 L155,128 L190,92 L220,130 L255,90" stroke="#27B7C8" stroke-width="2" fill="none" class="price"/><!-- Breakout --><path d="M255,90 L320,52 L370,38" stroke="#49B06E" stroke-width="2.5" class="brk"/><circle cx="255" cy="90" r="5" fill="#fbbf24" class="lbl"/><text x="265" y="86" font-family="DM Sans,sans-serif" font-size="9" fill="#fbbf24" class="lbl">Breakout point</text><text x="335" y="48" font-family="DM Sans,sans-serif" font-size="9" fill="#49B06E" class="lbl">Continuation</text><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Confirmation (volume + hold) separates real from fakeout</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "Overview",
        content: "A breakout is price moving decisively beyond a level it had been respecting — above resistance, below support, or out of a range."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "It can mark the start of a fresh move, as one side finally overpowers the other. That's why breakouts get so much attention."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The honest read centers on confirmation — does volume show up, does price hold beyond the level or immediately snap back? That snap-back is the famous false breakout (a \"fakeout\"), and it's everywhere. A breakout that can't hold is often more telling than one that does."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Chasing the very first candle out of the box on excitement, then getting trapped when it was a fakeout."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "A breakout is a potential new move — confirmation (volume, holding the level) separates the real ones from the traps.\n\nEducational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
      }
    ],
    quiz: [
      {
        q: "What is a false breakout (fakeout)?",
        options: [
          "A breakout that happens on extremely high volume",
          "When price breaks beyond a level but immediately snaps back, trapping traders who acted on the break",
          "A breakout that only occurs on low timeframes",
          "A breakout followed by a period of consolidation"
        ],
        correct: 1,
        explanation: "A false breakout (fakeout) occurs when price briefly moves beyond a key level, draws in traders expecting a continuation, and then quickly reverses back. The fakeout is extremely common — markets use the level's significance to trap impatient traders."
      },
      {
        q: "What does confirmation typically involve for a breakout?",
        options: [
          "A single candle closing just above the level",
          "Volume showing up and price holding above the broken level for a sustained period",
          "A news announcement confirming the direction",
          "The RSI reaching 70 at the same time"
        ],
        correct: 1,
        explanation: "Confirmation requires two things: volume conviction (real participation in the move) and price holding above the broken level. A breakout that can't hold the level is more likely a fakeout than a genuine new move."
      },
      {
        q: "Why do breakouts receive so much attention from traders?",
        options: [
          "Because they always produce profitable trades",
          "Because they can mark the start of a fresh directional move as one side overpowers the other",
          "Because breakouts are guaranteed by market structure",
          "Because they eliminate the need for risk management"
        ],
        correct: 1,
        explanation: "Breakouts attract attention because they signal that one side (buyers or sellers) has finally overwhelmed the other at a key level. When genuine, they can mark the beginning of a significant new move. The challenge is distinguishing real breakouts from fakeouts."
      },
      {
        q: "What insight can a failed breakout (fakeout) sometimes provide?",
        options: [
          "Failed breakouts are meaningless and should be ignored",
          "A breakout that can't hold is often more telling than one that does — it reveals the level's strength and who has control",
          "Failed breakouts always signal the end of the prior trend",
          "They indicate the chart pattern is invalid"
        ],
        correct: 1,
        explanation: "A fakeout reveals that the level was too strong to break — sellers were powerful enough to push price back down (in the case of a failed upside breakout). This can actually be more informative than a successful breakout, showing where real supply or demand is concentrated."
      }
    ],
    girlToGirlTip: "The market loves a fakeout because it loves your FOMO. Letting a breakout prove itself costs you a little upside and saves you a lot of pain. Educational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
  },

  // ─── Lesson 8: Pullbacks ─────────────────────────────────────────────────
  {
    module: "m1-chart-reading",
    slug: "pullbacks",
    title: "Pullbacks — The Healthy Pause",
    subtitle: "A temporary move against the trend — a breather, not a breakdown.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.price{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 3s ease forwards}.lbl{animation:fadeIn 0.5s ease 2.5s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Pullback — The Healthy Pause in an Uptrend</text><path d="M25,168 L65,135 L90,148 L130,108 L158,125 L195,88 L220,105 L260,68 L285,82 L325,48 L355,60" stroke="#27B7C8" stroke-width="2.5" fill="none" class="price"/><!-- Pullback annotations --><line x1="65" y1="135" x2="90" y2="148" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2" class="lbl"/><text x="94" y="158" font-family="DM Sans,sans-serif" font-size="9" fill="#ef4444" class="lbl">Pullback</text><line x1="130" y1="108" x2="158" y2="125" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2" class="lbl"/><text x="162" y="133" font-family="DM Sans,sans-serif" font-size="9" fill="#ef4444" class="lbl">Pullback</text><line x1="195" y1="88" x2="220" y2="105" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2" class="lbl"/><text x="224" y="113" font-family="DM Sans,sans-serif" font-size="9" fill="#ef4444" class="lbl">Pullback</text><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Shallow + calm = rest · Deep + violent = possible reversal</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "Overview",
        content: "A pullback is a temporary move against the trend — a breather, not a breakdown. Price takes two steps forward, one step back."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "Trends don't move in straight lines. Pullbacks are where the move catches its breath, and learning to tell a pause from a reversal is one of the most useful skills there is."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "A healthy pullback is usually shallow, calm, and on lighter volume — the trend still intact underneath. A pullback that goes too deep, gets too violent, or breaks key structure starts looking like an actual reversal instead."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Panic-reacting to every pullback as \"the top,\" or the opposite — assuming every dip is automatically a gift. Depth and energy are the tells."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "A pullback is the trend resting; a reversal is the trend ending. Read the depth and the energy to tell them apart.\n\nEducational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
      }
    ],
    quiz: [
      {
        q: "What distinguishes a healthy pullback from a potential reversal?",
        options: [
          "The number of red candles in the move",
          "Depth and energy — a healthy pullback is shallow and calm; a reversal tends to be deeper and more violent",
          "Whether the pullback happens on a Monday",
          "The absolute price level where it occurs"
        ],
        correct: 1,
        explanation: "Depth and energy are the key reads. A healthy pullback is typically shallow (retracing a modest portion of the prior move), calm in tempo, and on lighter volume. A reversal tends to be deeper, more aggressive, and often breaks key structural levels."
      },
      {
        q: "Why do pullbacks occur even within strong uptrends?",
        options: [
          "Because market makers deliberately push price lower",
          "Because trends never move in straight lines — profit-taking and short-term selling create natural breathing pauses",
          "Because support levels always stop price temporarily",
          "Because volume always drops to zero during uptrends"
        ],
        correct: 1,
        explanation: "No trend moves in a straight line. Traders who participated in the prior move take partial profits; short-term sellers test the level. These natural forces create pullbacks — temporary dips within the larger trend that don't change the overall direction."
      },
      {
        q: "What does light volume during a pullback typically suggest?",
        options: [
          "The downside move is accelerating and dangerous",
          "The selling is not heavily participated in — the pullback may be orderly profit-taking rather than a reversal",
          "The trend is definitely over",
          "Volume is irrelevant during pullbacks"
        ],
        correct: 1,
        explanation: "Light volume on a pullback means few participants are aggressively selling — it's often just profit-taking by traders who rode the prior move. This is actually constructive: sellers are not overwhelming buyers, the trend structure is likely intact."
      },
      {
        q: "\"Buy the dip\" as a strategy in isolation:",
        options: [
          "Always works in uptrending markets",
          "Is a complete and reliable strategy on its own",
          "Is incomplete — some dips continue much lower and the skill is telling a pause from a deeper breakdown",
          "Only applies to index funds, not individual stocks"
        ],
        correct: 2,
        explanation: "\"Buy the dip\" is not a strategy by itself — it's an idea that requires context. Some pullbacks are healthy pauses; others are the early stages of a deeper correction or full reversal. Reading the depth, energy, and structural context of the dip is what makes the difference."
      }
    ],
    girlToGirlTip: "\"Buy the dip\" isn't a strategy by itself — some dips keep dipping. The skill is knowing which pauses are healthy and which are warnings. Educational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
  },

  // ─── Lesson 9: Consolidation ─────────────────────────────────────────────
  {
    module: "m1-chart-reading",
    slug: "consolidation",
    title: "Consolidation — The Market Catching Its Breath",
    subtitle: "Price moving sideways in a range — no clear winner, energy coiling before the next move.",
    difficulty: "Intermediate",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.line{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease forwards}.price{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 3s ease 0.4s forwards}.brk{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 1s ease 3s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Consolidation — Sideways Range Before the Break</text><!-- Range boundaries --><line x1="100" y1="75" x2="290" y2="75" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3" class="line"/><line x1="100" y1="135" x2="290" y2="135" stroke="#49B06E" stroke-width="1.5" stroke-dasharray="5,3" class="line"/><!-- Price in range --><path d="M30,110 L60,90 L100,105 L125,75 L150,120 L175,78 L200,128 L225,80 L250,122 L275,82 L290,105 L310,75 L360,40" stroke="#27B7C8" stroke-width="2" fill="none" class="price"/><!-- Range label --><text x="40" y="72" font-family="DM Sans,sans-serif" font-size="9" fill="#ef4444" class="lbl">Resistance</text><text x="40" y="132" font-family="DM Sans,sans-serif" font-size="9" fill="#49B06E" class="lbl">Support</text><text x="183" y="110" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)" class="lbl">Range / Chop</text><!-- Breakout arrow --><text x="335" y="45" font-family="DM Sans,sans-serif" font-size="9" fill="#27B7C8" class="lbl">Breakout</text><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">The exit from the range is the signal — not the chop inside it</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "Overview",
        content: "Consolidation is price moving sideways in a range — no clear winner between buyers and sellers. The market digesting, deciding."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "Tight, quiet consolidation often comes before a big move — energy coiling up before it releases. Boredom on the chart is frequently the calm before action."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "They watch the range (the floor and ceiling of the chop) and wait for price to break out of it — that break is usually where the next move and the information live. Inside the box, it's just noise."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Forcing trades inside the chop, or assuming a direction before the range actually breaks. Ranges can last far longer than feels reasonable."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Sideways = balance and digestion. The exit from the range is the signal, not the chop inside it.\n\nEducational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
      }
    ],
    quiz: [
      {
        q: "What does consolidation typically represent on a price chart?",
        options: [
          "A trend reversal in progress",
          "A period of balance between buyers and sellers — the market digesting and deciding",
          "A breakdown in trading volume",
          "An indicator that the stock is about to be delisted"
        ],
        correct: 1,
        explanation: "Consolidation is a sideways price range where neither buyers nor sellers have a clear edge. The market is in balance — digesting the prior move and building energy before the next directional decision."
      },
      {
        q: "Why is tight, quiet consolidation sometimes viewed as constructive?",
        options: [
          "Because it always precedes a downtrend",
          "Because it can represent energy coiling — the calm before a significant directional move",
          "Because lower volume is always positive",
          "Because horizontal price action is the most reliable trend"
        ],
        correct: 1,
        explanation: "Tight consolidation with declining volume often precedes significant breakouts. As the range compresses, the energy of the next move builds — boredom on a chart can indeed be the calm before an important directional decision."
      },
      {
        q: "Where does the most meaningful information from a consolidation range typically come from?",
        options: [
          "From the candles in the middle of the range",
          "From the volume during the consolidation",
          "From the breakout out of the range — that's where the directional decision is made",
          "From the moving average passing through the consolidation"
        ],
        correct: 2,
        explanation: "The action inside a range is noise — neither buyers nor sellers are in control. The meaningful signal comes from the exit: which direction does price break out of the range, and does it hold? That break answers the question the range was asking."
      },
      {
        q: "What is a common mistake traders make during a consolidation range?",
        options: [
          "Waiting too long for the breakout",
          "Forcing trades within the range or assuming a breakout direction before it actually breaks",
          "Using too high a timeframe to view the consolidation",
          "Over-relying on volume signals during the range"
        ],
        correct: 1,
        explanation: "Trading inside the chop is low-probability — neither side has the edge. Assuming a breakout direction before the range actually resolves is also a mistake. Ranges can persist far longer than expected, and the direction of the eventual break is not known until it happens."
      }
    ],
    girlToGirlTip: "Quiet isn't nothing — it's often the market loading up. Patience during the boring part is where discipline is built. Educational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
  },

  // ─── Lesson 10: Market Structure ─────────────────────────────────────────
  {
    module: "m1-chart-reading",
    slug: "market-structure",
    title: "Market Structure — The Skeleton of a Chart",
    subtitle: "The lesson that ties Module 1 together — higher highs, lower lows, and the break that changes everything.",
    difficulty: "Intermediate",
    readingMinutes: 6,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes draw{from{stroke-dashoffset:1200}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.up{stroke-dasharray:1200;stroke-dashoffset:1200;animation:draw 3s ease forwards}.dn{stroke-dasharray:1200;stroke-dashoffset:1200;animation:draw 3s ease 0.5s forwards}.lbl{animation:fadeIn 0.6s ease 3s both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Market Structure — HH/HL vs LH/LL</text><!-- Uptrend: HH + HL --><path d="M20,168 L50,138 L70,152 L105,112 L128,128 L162,82 L185,100 L215,58" stroke="#49B06E" stroke-width="2.5" fill="none" class="up"/><!-- HH/HL labels --><text x="105" y="107" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E" class="lbl">HH</text><text x="128" y="142" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E" class="lbl">HL</text><text x="162" y="77" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E" class="lbl">HH</text><text x="185" y="113" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E" class="lbl">HL</text><text x="22" y="150" font-family="DM Sans,sans-serif" font-size="9" fill="#49B06E" class="lbl">Uptrend</text><!-- Downtrend: LH + LL --><path d="M215,58 L240,82 L258,65 L285,108 L305,90 L335,135 L355,118 L385,162" stroke="#ef4444" stroke-width="2.5" fill="none" class="dn"/><!-- LH/LL labels --><text x="258" y="60" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" class="lbl">LH</text><text x="285" y="120" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" class="lbl">LL</text><text x="305" y="85" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" class="lbl">LH</text><text x="335" y="148" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" class="lbl">LL</text><text x="340" y="110" font-family="DM Sans,sans-serif" font-size="9" fill="#ef4444" class="lbl">Downtrend</text><!-- BOS marker --><circle cx="215" cy="58" r="5" fill="#fbbf24" class="lbl"/><text x="220" y="50" font-family="DM Sans,sans-serif" font-size="8" fill="#fbbf24" class="lbl">Break of Structure</text><text x="200" y="200" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">HH + HL = uptrend · LH + LL = downtrend · Break = change of character</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "Overview",
        content: "This is the lesson that ties Module 1 together. Market structure is the underlying framework of highs and lows that tells you the trend at a glance."
      },
      {
        type: "how-read",
        heading: "The Core Read",
        content: "Higher highs + higher lows = uptrend (buyers in control). Lower highs + lower lows = downtrend (sellers in control). Sideways, no clear pattern = range. That's the skeleton under every chart, no indicators required."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "Once you can name the structure, everything else slots in: support and resistance, trendlines, pullbacks, breakouts — they all make sense inside the structure. You stop seeing random candles and start seeing a story."
      },
      {
        type: "psychology",
        heading: "How Traders Read It",
        content: "They watch for a break of structure — when an uptrend suddenly makes a lower low, or a downtrend makes a higher high. That's a change-of-character signal: the trend may be shifting. Not a guarantee — a heads-up."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Trading against the structure on a hunch — fighting an uptrend because it \"feels\" too high. The structure is the context for everything else."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Higher highs/lows = up, lower highs/lows = down. Read the skeleton first; the details make sense after.\n\nEducational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
      }
    ],
    quiz: [
      {
        q: "What defines an uptrend in terms of market structure?",
        options: [
          "Price above the 200-day moving average",
          "A series of higher highs and higher lows",
          "Volume increasing over time",
          "Three consecutive green candles"
        ],
        correct: 1,
        explanation: "An uptrend is defined by higher highs and higher lows — each swing high exceeds the previous one, and each swing low is above the prior low. This structure shows buyers are consistently stepping in at higher prices, confirming trend strength."
      },
      {
        q: "What is a 'break of structure' in an uptrend?",
        options: [
          "When price reaches a new all-time high",
          "When the uptrend makes a lower low — a change-of-character signal suggesting the trend may be shifting",
          "When volume spikes above its 20-day average",
          "When price gaps up significantly"
        ],
        correct: 1,
        explanation: "In an established uptrend (HH + HL), a lower low is a break of structure — the first sign that the pattern of higher lows has been violated. It's a change-of-character heads-up, not a reversal guarantee, but it warrants paying attention."
      },
      {
        q: "Why is market structure described as the 'skeleton' of a chart?",
        options: [
          "Because it requires X-ray equipment to see",
          "Because it is the underlying framework on which everything else — patterns, signals, support/resistance — is built",
          "Because it only appears on skeletal charts without indicators",
          "Because it was developed using anatomical research"
        ],
        correct: 1,
        explanation: "Market structure is the foundational framework. Support and resistance, trendlines, pullbacks, and breakouts all make more sense when viewed within the context of structure. It's the skeleton that gives the rest of the chart its meaning."
      },
      {
        q: "What question should traders ask before analyzing any pattern or indicator?",
        options: [
          "What is the current RSI reading?",
          "What is the structure — is the trend up, down, or sideways?",
          "What did the stock do last week?",
          "What is the average daily volume?"
        ],
        correct: 1,
        explanation: "Structure is the context for everything else. Knowing whether the overall structure is up, down, or sideways determines how to interpret every other piece of information on the chart. This single question is often enough to filter out many low-quality setups."
      }
    ],
    girlToGirlTip: "Before any pattern or indicator, ask one question: what's the structure? Up, down, or sideways. Answer that and you're already ahead of most people staring at the same chart. Educational only. Not financial advice. Reading a chart is about understanding probability, never certainty."
  },
];

export function getM1LessonBySlug(slug: string): UniversityLesson | undefined {
  return M1_LESSONS.find((l) => l.slug === slug);
}
