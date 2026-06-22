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

export const M2_LESSONS: UniversityLesson[] = [
  // ─── Lesson 1: Double Top ────────────────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "double-top",
    title: "Double Top",
    subtitle: "A bearish reversal pattern that forms after price tests the same high twice and fails both times.",
    difficulty: "Intermediate",
    readingMinutes: 8,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.line{stroke-dasharray:800;stroke-dashoffset:800;animation:draw 2.5s ease forwards}.neckline{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 2.5s ease 1s forwards}.lbl{animation:fadeIn 0.5s ease 2.5s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Double Top</text><path d="M30,160 L70,160 L90,80 L110,160 L130,90 L150,160 L170,160 L200,165 L240,165 L280,165" stroke="#27B7C8" stroke-width="2.5" fill="none" class="line"/><line x1="110" y1="160" x2="380" y2="160" stroke="#49B06E" stroke-width="1.5" stroke-dasharray="6,3" class="neckline"/><circle cx="90" cy="80" r="4" fill="#27B7C8" class="lbl"/><circle cx="130" cy="90" r="4" fill="#27B7C8" class="lbl"/><text x="80" y="74" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Top 1</text><text x="120" y="84" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Top 2</text><text x="285" y="157" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Neckline</text><path d="M170,160 L240,195" stroke="#ef4444" stroke-width="2" stroke-dasharray="800" class="line" style="animation-delay:2s"/><text x="245" y="198" fill="#ef4444" font-family="DM Sans,sans-serif" font-size="9" class="lbl" style="animation-delay:2.5s">Breakdown</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is a Double Top?",
        content: "A double top is a bearish reversal pattern that appears on price charts when an asset tests the same resistance level twice and fails to push through on both attempts. It looks like the letter \"M\" — two roughly equal peaks separated by a trough, followed by a breakdown below the trough level (called the neckline).\n\nThe pattern is considered complete — and the bearish signal confirmed — only when price closes below the neckline after forming the second peak. Until that breakdown occurs, the pattern is simply two equal highs, which could just as easily resolve upward."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "The double top tells a story about buyer exhaustion. During the first peak, bulls push price to a new high with conviction. Sellers step in and push price back down to the neckline. Then buyers try again — but this time they can only reach approximately the same level before running out of steam.\n\nThis second failure signals that buyers are losing control. When price then breaks the neckline, everyone who bought near the peaks is sitting on a loss and becomes a potential seller, accelerating the move lower. The pattern's power comes from this shift in the balance of trapped longs versus newly energized shorts."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "Traders look for these specific features:\n\n1. A clear prior uptrend — the pattern must have something to reverse.\n2. Two peaks at approximately the same price level (within a few percent).\n3. A meaningful pullback between the peaks (ideally 10–20% or more).\n4. Lower volume on the second peak than the first — this is a classic sign of weakening momentum.\n5. A neckline drawn across the trough between the two peaks.\n\nThe pattern is only valid as a bearish signal after a confirmed close below the neckline. Many traders wait for a retest of the broken neckline (now acting as resistance) before considering the pattern confirmed."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The textbook read is bearish once the neckline breaks. Traders measure the distance from the peak to the neckline and project that same distance downward from the breakout point — this is the measured-move logic, not a promise.\n\nThe invalidation level for a bearish thesis on a double top is a sustained close back above both peaks. If price reclaims the highs with volume, the pattern is negated and the uptrend may be resuming. Risk management around this level is essential — patterns fail constantly and nothing guarantees profits."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "The most common mistake is calling the pattern before the neckline breaks. Two equal highs with no breakdown is not a double top — it's just a ranging market that could go either way.\n\nDouble tops also fail when broader market conditions are strongly bullish. A powerful rally can push price straight through the second peak, turning the \"double top\" into a simple consolidation before the uptrend continues. Volume is the tell — if the second peak forms on rising volume, buyers are still in control and the pattern loses credibility.\n\nFinally, very wide patterns (weeks between peaks) are less reliable than tighter ones because market conditions change significantly over time."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The double top pattern reflects buyer exhaustion at a tested resistance level. The signal is only meaningful after a neckline breakdown. Like all chart patterns, it fails regularly — always consider the broader trend, volume, and multiple confirmation signals before drawing any conclusions."
      }
    ],
    quiz: [
      {
        q: "When is a double top pattern considered confirmed?",
        options: ["When the second peak forms at the same level as the first", "When price closes below the neckline", "When volume drops on the second peak", "When the first peak is formed"],
        correct: 1,
        explanation: "The pattern is only confirmed — and the bearish signal activated — when price closes below the neckline (the trough between the two peaks). The second peak alone is not a signal."
      },
      {
        q: "What does lower volume on the second peak typically suggest?",
        options: ["The uptrend is strengthening", "Buyers are losing momentum", "A breakout above the peaks is likely", "The neckline is invalid"],
        correct: 1,
        explanation: "Lower volume on the second peak compared to the first is a classic sign that buying pressure is weakening — fewer participants are willing to buy at those levels, supporting the bearish interpretation."
      },
      {
        q: "Where do traders typically place the invalidation level for a bearish double-top thesis?",
        options: ["Below the neckline", "At the midpoint between the two peaks", "Above both peaks", "At the first peak only"],
        correct: 2,
        explanation: "A sustained close above both peaks invalidates the bearish thesis. This is the level where the idea is proven wrong — the uptrend may be resuming and the 'double top' was simply a pause."
      },
      {
        q: "How do traders typically estimate a measured-move target after a neckline breakdown?",
        options: ["They subtract the neckline level from zero", "They project the peak-to-neckline distance downward from the breakout", "They use RSI levels to determine the target", "They look for the nearest round number below the neckline"],
        correct: 1,
        explanation: "The textbook measured-move logic projects the distance from the peaks down to the neckline, then applies that same distance below the neckline. This is an estimate, not a guarantee — targets are measured-move logic, not a promise."
      }
    ],
    girlToGirlTip: "Girl, the biggest trap with double tops is calling them too early. Two equal highs does NOT equal a double top until that neckline cracks — the market has a way of faking everyone out and then ripping higher just to mess with people. Wait for the breakdown, and even then, watch for a retest of the broken neckline before getting excited. Patience is your edge here. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 2: Double Bottom ─────────────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "double-bottom",
    title: "Double Bottom",
    subtitle: "A bullish reversal pattern that forms when price tests the same support level twice and holds both times.",
    difficulty: "Intermediate",
    readingMinutes: 8,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.line{stroke-dasharray:800;stroke-dashoffset:800;animation:draw 2.5s ease forwards}.neckline{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 2.5s ease 1s forwards}.lbl{animation:fadeIn 0.5s ease 2.5s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Double Bottom</text><path d="M30,60 L70,60 L90,150 L110,60 L130,140 L150,60 L170,60 L220,55 L270,40" stroke="#27B7C8" stroke-width="2.5" fill="none" class="line"/><line x1="110" y1="60" x2="380" y2="60" stroke="#49B06E" stroke-width="1.5" stroke-dasharray="6,3" class="neckline"/><circle cx="90" cy="150" r="4" fill="#27B7C8" class="lbl"/><circle cx="130" cy="140" r="4" fill="#27B7C8" class="lbl"/><text x="75" y="168" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Bottom 1</text><text x="115" y="158" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Bottom 2</text><text x="285" y="57" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Neckline</text><path d="M150,60 L270,25" stroke="#49B06E" stroke-width="2" class="line" style="animation-delay:2s"/><text x="272" y="24" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl" style="animation-delay:2.5s">Breakout</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is a Double Bottom?",
        content: "A double bottom is the bullish mirror image of the double top. It forms when price tests the same support level twice and holds on both attempts, creating a \"W\" shape on the chart. The pattern signals a potential reversal from a downtrend to an uptrend.\n\nLike the double top, the signal is not complete until price closes above the neckline — the peak between the two lows. Until that breakout occurs, the pattern could simply be continued consolidation or even the beginning of a further decline."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "The double bottom reflects the exhaustion of selling pressure at a key level. During the first low, sellers push price down aggressively. Buyers absorb that selling and push back up to the neckline. Then sellers try again — but this second attempt fails to make a lower low, signaling that sellers are running out of conviction.\n\nWhen buyers then push price above the neckline, traders who were short (betting on a further decline) begin covering their positions, adding fuel to the rally. The pattern's bullish power comes from this combination of diminishing selling pressure and a short squeeze as the neckline breaks."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "The key features traders look for:\n\n1. A clear prior downtrend — the pattern must have something to reverse.\n2. Two lows at approximately the same price level (within a few percent).\n3. A meaningful bounce between the lows (the neckline should be a noticeable retracement).\n4. Volume often increases on the breakout above the neckline — this is the cleaner signal.\n5. The second low may be slightly higher than the first, which is seen as a sign of accumulation.\n\nConfirmation comes from a close above the neckline, not just an intraday tag."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The textbook read is bullish after the neckline break. The measured-move logic projects the distance from the lows to the neckline upward from the breakout point. This is a conceptual target range, not a guaranteed destination.\n\nThe invalidation level for a bullish double-bottom thesis is a close below both lows. If price fails at the neckline and then undercuts the prior lows, the pattern fails and the downtrend may be continuing. Nothing about this pattern guarantees profits — patterns fail constantly."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "Calling the pattern before the neckline break is the most common error. Two similar lows in a downtrend could easily become a triple bottom, a head & shoulders top (inverted), or simply continued downside.\n\nDouble bottoms also fail when the broader market environment remains heavily bearish — broad selling pressure can overwhelm even a textbook-perfect pattern. Weak volume on the neckline breakout is a warning sign; strong follow-through requires real buying conviction.\n\nAnother failure mode is the \"neckline fake\" — price closes above the neckline for one or two sessions, triggers a rush of buyers, and then reverses sharply lower. Waiting for a sustained close rather than reacting to intraday pops helps filter these false signals."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The double bottom reflects seller exhaustion at a tested support zone. The bullish signal is only valid after a neckline breakout, ideally with increasing volume. Like all patterns, it fails regularly — the broader context, sector conditions, and overall market environment always matter more than any single pattern."
      }
    ],
    quiz: [
      {
        q: "What shape does a double bottom create on a price chart?",
        options: ["An M shape", "A W shape", "A V shape", "A U shape"],
        correct: 1,
        explanation: "A double bottom creates a \"W\" shape — two lows at approximately the same level separated by a bounce, resembling the letter W."
      },
      {
        q: "What confirms the double bottom as a bullish signal?",
        options: ["The second low holding above the first", "A high-volume close above the neckline", "RSI rising above 50", "Price reaching the measured-move target"],
        correct: 1,
        explanation: "The pattern is only confirmed as bullish when price closes above the neckline (the peak between the two lows), ideally with increasing volume. The second low alone is not a signal."
      },
      {
        q: "Where is the invalidation level for a bullish double-bottom thesis?",
        options: ["Above the neckline", "Below both lows", "At the midpoint between the lows", "At the 50-day moving average"],
        correct: 1,
        explanation: "A close below both lows invalidates the bullish pattern — the idea is proven wrong at that point and the downtrend may be resuming."
      },
      {
        q: "Why does a short squeeze sometimes amplify the move after a neckline break?",
        options: ["Because options expire at neckline levels", "Because short sellers cover positions when their thesis is invalidated, adding buying pressure", "Because market makers always buy at necklines", "Because the pattern attracts algorithmic buying only"],
        correct: 1,
        explanation: "Traders who were short (betting on continued decline) face increasing losses as price rises above the neckline. Many will cover (buy back) their short positions, which adds upward pressure to the move — this is a short squeeze."
      }
    ],
    girlToGirlTip: "The double bottom is one of the prettiest patterns on a chart, but don't fall in love with it before it actually confirms. So many traders see those two similar lows and get excited — then price makes a new low and the whole thing falls apart. The neckline break is everything. Also, pay attention to whether the second low is slightly higher than the first — that tiny detail often means buyers are quietly stepping in at higher and higher prices, which is a beautiful sign. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 3: Head & Shoulders ──────────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "head-and-shoulders",
    title: "Head & Shoulders",
    subtitle: "One of the most recognized bearish reversal patterns — three peaks where the middle peak stands tallest.",
    difficulty: "Intermediate",
    readingMinutes: 9,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.line{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 3s ease forwards}.nk{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 2s ease 1.5s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Head &amp; Shoulders</text><path d="M20,155 L60,155 L75,110 L90,155 L140,55 L190,155 L210,100 L230,155 L280,155" stroke="#27B7C8" stroke-width="2.5" fill="none" class="line"/><line x1="90" y1="155" x2="350" y2="155" stroke="#49B06E" stroke-width="1.5" stroke-dasharray="5,3" class="nk"/><text x="65" y="105" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">L Shoulder</text><text x="130" y="50" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Head</text><text x="212" y="95" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">R Shoulder</text><text x="300" y="152" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Neckline</text><path d="M230,155 L310,185" stroke="#ef4444" stroke-width="2" class="line" style="animation-delay:2.5s"/></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is a Head & Shoulders?",
        content: "The head and shoulders pattern is one of the most widely recognized and studied reversal patterns in technical analysis. It forms after an uptrend and consists of three peaks: a left shoulder, a higher central peak (the head), and a right shoulder that is roughly equal in height to the left shoulder.\n\nA neckline connects the two troughs between the peaks. The pattern signals a potential trend reversal from bullish to bearish, but the signal is only confirmed when price closes below the neckline after forming the right shoulder."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "The head and shoulders tells a detailed story of a bull market losing its strength in stages.\n\nThe left shoulder forms as bulls push price to a new high with strong conviction, then sellers take partial profits and price pulls back. The head forms as bulls make one more powerful push to an even higher high — but sellers again step in and push price back to the neckline. Then bulls make a final attempt with the right shoulder — this time they can only reach the level of the left shoulder, signaling that buying power is clearly weakening. When the neckline breaks, the bulls' last line of defense is gone and a new downtrend can begin."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "The key features:\n\n1. Left shoulder: a peak followed by a decline back to the neckline area.\n2. Head: a higher peak (the highest point in the pattern) followed by another decline.\n3. Right shoulder: a lower peak roughly equal to the left shoulder.\n4. Neckline: a line connecting the two troughs — it may be horizontal or slightly sloped.\n5. Volume: ideally declines from left shoulder to head to right shoulder, confirming weakening buying pressure.\n\nPattern symmetry matters — a right shoulder that is dramatically higher or lower, or that takes far longer to form, is considered less reliable."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The textbook read is bearish once the neckline breaks. The measured-move target is calculated by measuring the distance from the top of the head down to the neckline, then projecting that distance downward from the neckline breakout. This is measured-move logic, not a promise.\n\nThe invalidation level is a sustained close back above the right shoulder (or above the neckline if the breakdown has occurred and then reversed). Many traders also watch for a \"retest\" of the broken neckline from below — a common occurrence where price briefly returns to the neckline before resuming lower. Risk management is essential; patterns fail constantly and nothing guarantees profits."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "The most frequent mistake is drawing necklines too loosely, turning almost any three-peak formation into a \"head and shoulders.\" The pattern loses meaning if the analyst is too flexible.\n\nHead and shoulders patterns also fail when the right shoulder breaks out above the head level — this represents a powerful bullish continuation signal. Strong sector tailwinds or broad market momentum can overwhelm even a well-formed pattern.\n\nThe right shoulder can also take a very long time to form, during which the market environment changes. A pattern that takes many months to complete is less predictive than one that completes within a clear market context."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The head and shoulders pattern is a textbook representation of a bull market losing steam in stages. Three peaks with a lower right shoulder, a clear neckline, and declining volume across the formation are the hallmarks of the highest-quality setups. Confirmation only comes from a neckline break — until then, it's just an interesting formation."
      }
    ],
    quiz: [
      {
        q: "In a head and shoulders pattern, which peak is the highest?",
        options: ["The left shoulder", "The right shoulder", "The head (center peak)", "They are all equal"],
        correct: 2,
        explanation: "The head is always the highest peak in the pattern — it represents the final strong push by bulls before the pattern begins deteriorating, with the right shoulder unable to match even the left shoulder's height."
      },
      {
        q: "What is the neckline in a head and shoulders pattern?",
        options: ["A line connecting the three peaks", "A line connecting the two troughs between the peaks", "The moving average beneath the pattern", "The price midpoint of the head"],
        correct: 1,
        explanation: "The neckline connects the two troughs — the low between the left shoulder and head, and the low between the head and right shoulder. Breaking this line is the bearish confirmation signal."
      },
      {
        q: "What does it signal when the right shoulder forms with noticeably higher volume than the left shoulder?",
        options: ["The pattern is more bearish", "The pattern is less reliable — buyers may still be in control", "The measured-move target will be larger", "The neckline will slope upward"],
        correct: 1,
        explanation: "Higher volume on the right shoulder suggests buyers are still actively participating. The classic head and shoulders sees declining volume across the formation — strong volume on the right shoulder weakens the bearish thesis."
      },
      {
        q: "What is the invalidation level for a bearish head-and-shoulders thesis (before neckline break)?",
        options: ["Below the neckline", "Below the left shoulder low", "A sustained close above the right shoulder or head", "At the 200-day moving average"],
        correct: 2,
        explanation: "If price closes back above the right shoulder level (or especially the head), the bearish thesis is invalidated. The idea is proven wrong — the uptrend may be resuming."
      }
    ],
    girlToGirlTip: "The head and shoulders is one of those patterns that feels so textbook-clean when you see it forming — but girl, the amount of fake-outs on this one is real. The pattern isn't complete until that neckline breaks with conviction. And here's a pro tip: watch for the \"right shoulder retest\" after the neckline cracks — price often bounces back up to test it from below before continuing lower. That retest can be a key moment in the pattern's story. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 4: Inverse Head & Shoulders ──────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "inverse-head-and-shoulders",
    title: "Inverse Head & Shoulders",
    subtitle: "The bullish mirror of the classic head and shoulders — three troughs where the middle dips deepest.",
    difficulty: "Intermediate",
    readingMinutes: 9,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.line{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 3s ease forwards}.nk{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 2s ease 1.5s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Inverse Head &amp; Shoulders</text><path d="M20,65 L60,65 L75,105 L90,65 L140,155 L190,65 L210,110 L230,65 L300,65 L340,30" stroke="#27B7C8" stroke-width="2.5" fill="none" class="line"/><line x1="90" y1="65" x2="360" y2="65" stroke="#49B06E" stroke-width="1.5" stroke-dasharray="5,3" class="nk"/><text x="55" y="120" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">L Shoulder</text><text x="133" y="170" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Head</text><text x="213" y="125" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">R Shoulder</text><text x="300" y="60" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Neckline</text><text x="342" y="28" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Breakout</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is an Inverse Head & Shoulders?",
        content: "The inverse head and shoulders (also called a \"head and shoulders bottom\") is the bullish mirror image of the classic pattern. Instead of three peaks, it has three troughs — a left shoulder, a deeper central trough (the head), and a right shoulder trough roughly equal to the left shoulder.\n\nThe neckline connects the two peaks between the troughs. The bullish signal is confirmed when price closes above the neckline after forming the right shoulder. This pattern appears after a downtrend and signals a potential reversal to an uptrend."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "The inverse head and shoulders tells the story of sellers running out of energy in stages.\n\nThe left shoulder forms as sellers push price to a new low, then buyers step in and push price back to the neckline. The head forms when sellers make one more powerful push to an even lower low — but buyers again absorb the selling and push back to the neckline. Then sellers try once more with the right shoulder — this time they can only push price to the level of the left shoulder, indicating seller exhaustion. When buyers finally push above the neckline, the sellers' control is broken."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "Key features to identify:\n\n1. Left shoulder: a trough followed by a bounce toward the neckline.\n2. Head: a deeper trough (lowest point in the pattern) followed by another bounce.\n3. Right shoulder: a shallower trough roughly equal to the left shoulder.\n4. Neckline: a line connecting the two peaks between the troughs.\n5. Volume: ideally the right shoulder forms on declining volume, with a volume surge on the neckline breakout — this surge confirms that buyers are serious.\n\nThe right shoulder should not make a new low — if it does, the pattern structure is weakened."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The textbook read is bullish after the neckline breaks. The measured-move target is the distance from the bottom of the head to the neckline, projected upward from the breakout point. This is an educational framework for thinking about potential moves — it is not a promise or a target.\n\nThe invalidation level is a close below the right shoulder (or especially the head). If price fails at the neckline and makes a new low, the bullish thesis is off the table. Risk management around the invalidation level is essential — patterns fail constantly and nothing about this pattern guarantees profits."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "The most common mistake is assuming the pattern will complete just because a head has formed. The right shoulder must hold above the head's low — if it makes a new low, the pattern structure fails.\n\nWeak volume on the neckline breakout is a serious warning. A breakout without volume conviction is more likely to be a bull trap — where buyers get excited, price pops above the neckline, and then sellers push it right back down.\n\nInverse head and shoulders patterns that form over very long periods (many months) are also less predictive because the market context changes significantly during that time."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The inverse head and shoulders reflects seller exhaustion at increasingly shallow lows — a sign that buyers are gradually gaining control. The pattern only matters once the neckline breaks with conviction. Volume confirmation on the breakout is the clearest signal that the reversal may have real momentum behind it."
      }
    ],
    quiz: [
      {
        q: "In an inverse head and shoulders, which trough is the deepest?",
        options: ["The left shoulder", "The right shoulder", "The head (center trough)", "They are all equal"],
        correct: 2,
        explanation: "The head is the deepest trough — it represents sellers' most powerful push lower before their momentum begins fading, with the right shoulder unable to match even the left shoulder's low."
      },
      {
        q: "What does a volume surge on the neckline breakout suggest?",
        options: ["The pattern is invalid", "Buyers are entering with conviction, supporting the bullish reversal", "Sellers are about to overwhelm buyers", "The measured-move target will be smaller"],
        correct: 1,
        explanation: "A volume surge when price breaks the neckline signals that real buying conviction is behind the move — this is one of the strongest confirmations that the bullish reversal may have legs."
      },
      {
        q: "What happens to the bullish thesis if the right shoulder makes a new low below the head?",
        options: ["The pattern becomes more bullish", "The pattern structure is weakened or invalidated", "The neckline moves lower", "The measured move target increases"],
        correct: 1,
        explanation: "The right shoulder making a new low below the head means sellers are still in control — the pattern structure fails because the right shoulder should hold above the head's low."
      },
      {
        q: "What is the measured-move concept for an inverse head and shoulders breakout?",
        options: ["Project the neckline level doubled upward", "Project the distance from the head to the neckline upward from the breakout", "Use the 200-day MA as the target", "Estimate based on volume"],
        correct: 1,
        explanation: "The textbook measured-move logic measures the distance from the head (deepest trough) up to the neckline, then projects that same distance upward from the breakout point. This is educational logic, not a guaranteed price target."
      }
    ],
    girlToGirlTip: "When you spot an inverse head and shoulders, the right shoulder is everything to watch. If it holds well above the head's low, that's the sign buyers are stepping in at higher and higher prices — which is exactly what you want to see before a real reversal. Volume on the neckline break is your confirmation bestie here. No volume? Be skeptical. Big volume surge? That's the market speaking louder. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 5: Bull Flag ──────────────────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "bull-flag",
    title: "Bull Flag",
    subtitle: "A brief, orderly pullback after a sharp rally — often a pause before continuation higher.",
    difficulty: "Intermediate",
    readingMinutes: 7,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.pole{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 1s ease forwards}.flag{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 1.5s ease 1s forwards}.brk{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 1s ease 2.5s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Bull Flag</text><line x1="100" y1="160" x2="100" y2="60" stroke="#27B7C8" stroke-width="3" class="pole"/><path d="M100,60 L130,75 L160,65 L190,80 L220,70 L220,95 L190,105 L160,90 L130,100 L100,88" stroke="#49B06E" stroke-width="2" fill="rgba(73,176,110,0.08)" class="flag"/><path d="M220,70 L320,30" stroke="#27B7C8" stroke-width="2.5" class="brk"/><text x="50" y="110" fill="#27B7C8" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Pole</text><text x="150" y="115" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Flag</text><text x="295" y="28" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Breakout</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is a Bull Flag?",
        content: "A bull flag is a continuation pattern that forms during an established uptrend. It consists of two parts: a sharp, near-vertical price rally (the pole) followed by a brief, orderly consolidation or slight pullback (the flag). The flag portion typically slopes slightly downward or moves sideways in a parallel channel.\n\nThe pattern suggests that the prior upward move is pausing — not reversing — as early buyers take partial profits and the market consolidates gains. The bullish signal comes when price breaks out above the upper boundary of the flag channel."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "Bull flags form because sharp moves rarely go straight up without pausing. After a powerful rally (the pole), some traders take profits, creating temporary selling pressure. This profit-taking is orderly and measured — buyers simply step back momentarily rather than aggressively selling. The price drifts lower in a controlled, low-volume way.\n\nThis orderly pullback is a sign of strength, not weakness. It signals that sellers are not overwhelming buyers — they're simply waiting. When buyers re-enter with fresh conviction and price breaks above the flag's upper boundary, the prior momentum often resumes."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "A clean bull flag has these features:\n\n1. A strong, sharp rally on elevated volume (the pole) — ideally at least 20–40% in a short period.\n2. A consolidation phase where price drifts sideways or slightly lower in a parallel channel (the flag).\n3. Volume declining during the flag consolidation — this is key. Heavy selling during the flag undermines the pattern.\n4. The flag should not retrace more than about 50% of the pole move — deeper pullbacks suggest the move may be reversing rather than consolidating.\n5. Breakout above the upper flag boundary, ideally with a volume increase."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The textbook read is bullish when price breaks above the flag's upper channel line. The measured-move logic adds the pole's length to the breakout point to estimate a potential continuation target. This is conceptual, not a guarantee.\n\nThe invalidation level is typically a close below the lower boundary of the flag channel. If the flag channel breaks to the downside, the consolidation may be turning into a reversal rather than a continuation. Patterns fail constantly — risk management is essential."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "The most common mistake is calling every shallow pullback a \"bull flag.\" A true bull flag requires a genuine pole — a sharp, strong preceding move. A gradual drift lower after a gradual move up is just a downtrend.\n\nBull flags fail when the broader market turns negative mid-pattern, when the news catalyst behind the pole move gets reversed, or when the flag retraces more than 50% of the pole, signaling that sellers are more aggressive than the pattern assumes.\n\nHigh volume during the flag itself is also a warning — it suggests active selling rather than orderly profit-taking."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The bull flag is a momentum continuation pattern — it works best in strong uptrends. The quality of the pole matters: a sharper, higher-volume pole suggests stronger underlying momentum than a gradual one. Declining volume during the flag and a volume surge on the breakout are the clearest confirmation signals."
      }
    ],
    quiz: [
      {
        q: "What does the 'pole' in a bull flag represent?",
        options: ["A gradual upward trend", "A sharp, near-vertical price rally before the consolidation", "The downward-sloping channel", "The neckline of the pattern"],
        correct: 1,
        explanation: "The pole is the sharp, near-vertical rally that precedes the flag consolidation — it represents a burst of strong buying momentum. The pole's quality (sharpness, volume) determines the pattern's strength."
      },
      {
        q: "What does declining volume during the flag consolidation suggest?",
        options: ["Sellers are taking control", "The pattern is invalid", "Orderly profit-taking with buyers waiting — a sign of strength", "The breakout will be weak"],
        correct: 2,
        explanation: "Declining volume during the flag means sellers are not overwhelming buyers — it's orderly profit-taking. This is actually a bullish characteristic, as it suggests the prior upward momentum is pausing, not reversing."
      },
      {
        q: "How deep should a flag's pullback ideally be relative to the pole?",
        options: ["No more than about 50% of the pole", "Equal to the full pole length", "At least 75% of the pole", "Exactly 38.2% Fibonacci level"],
        correct: 0,
        explanation: "A flag pullback deeper than 50% of the pole suggests sellers are becoming more aggressive than typical profit-taking would explain — the move may be turning into a reversal rather than a consolidation."
      },
      {
        q: "What is the invalidation level for a bullish bull-flag thesis?",
        options: ["A close above the upper flag boundary", "A close below the lower flag channel boundary", "Any day with declining price", "When RSI drops below 50"],
        correct: 1,
        explanation: "A close below the lower boundary of the flag channel means the orderly consolidation has broken down — the pattern is no longer intact and the bullish thesis is no longer valid."
      }
    ],
    girlToGirlTip: "Bull flags are one of the most reliable continuation patterns out there, but the pole quality is everything. A gradual, slow drift up followed by a pullback is just price going sideways — it's not a bull flag. The real thing has a sharp, almost violent upward move first. That energy tells you there's serious momentum behind the stock. And always watch volume during the flag: if volume dries up while price consolidates, that's the market taking a breath before possibly running again. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 6: Bear Flag ──────────────────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "bear-flag",
    title: "Bear Flag",
    subtitle: "A brief counter-trend bounce during a downtrend — a pause before potential continuation lower.",
    difficulty: "Intermediate",
    readingMinutes: 7,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.pole{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 1s ease forwards}.flag{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 1.5s ease 1s forwards}.brk{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 1s ease 2.5s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Bear Flag</text><line x1="100" y1="50" x2="100" y2="140" stroke="#ef4444" stroke-width="3" class="pole"/><path d="M100,140 L130,125 L160,135 L190,120 L220,130 L220,110 L190,100 L160,115 L130,105 L100,120" stroke="#27B7C8" stroke-width="2" fill="rgba(39,183,200,0.08)" class="flag"/><path d="M220,130 L320,175" stroke="#ef4444" stroke-width="2.5" class="brk"/><text x="55" y="100" fill="#ef4444" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Pole</text><text x="150" y="100" fill="#27B7C8" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Flag</text><text x="295" y="185" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Breakdown</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is a Bear Flag?",
        content: "A bear flag is the bearish equivalent of the bull flag — a continuation pattern that forms during a downtrend. It consists of a sharp price drop (the pole) followed by a brief, orderly consolidation or slight bounce (the flag). The flag typically slopes slightly upward or moves sideways in a parallel channel.\n\nThe pattern suggests the prior downward move is pausing rather than reversing. The bearish signal is triggered when price breaks below the lower boundary of the flag channel, suggesting the downtrend is resuming."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "After a sharp decline (the pole), short sellers take some profits and buyers attempt a counter-trend bounce, hoping the worst is over. This creates a brief rally — the flag — that is typically low conviction. Volume dries up because buyers aren't aggressively stepping in; they're just absorbing some of the selling pressure.\n\nThe orderly nature of the bounce (not a powerful reversal, just a drift) is the giveaway that sellers are still in control and simply resting. When sellers resume with fresh conviction and price breaks below the flag, the downtrend often continues."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "A bear flag has these characteristics:\n\n1. A sharp, near-vertical price decline on elevated volume (the pole).\n2. A brief, orderly bounce or sideways consolidation (the flag) — typically sloping slightly upward.\n3. Volume declining during the flag — the bounce lacks conviction.\n4. The flag should not retrace more than about 50% of the pole's decline — a stronger bounce suggests possible reversal.\n5. The flag channel is defined by two roughly parallel trend lines containing the bounce.\n\nBreakdown below the lower flag boundary confirms the pattern."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The textbook read is bearish when price closes below the lower flag channel line. The measured-move logic takes the pole's length and projects it downward from the breakdown point as a conceptual target range — not a promise.\n\nThe invalidation level for a bearish bear-flag thesis is a close above the upper flag boundary, especially on elevated volume. This would suggest that buyers are gaining control and the counter-trend bounce may be turning into a genuine reversal. Nothing guarantees the pattern will work — patterns fail constantly and risk management is essential."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "The most common mistake is calling any brief bounce during a downtrend a \"bear flag.\" The pole is essential — a slow, gradual decline does not create the energy needed for a valid bear flag pattern.\n\nBear flags fail when the bounce becomes too powerful, reclaiming more than 50% of the pole. This suggests buyers are more active than sellers anticipated and a reversal may be underway.\n\nBroadly bullish market conditions can also overwhelm even a well-formed bear flag. A single positive news event during the flag phase can trigger a powerful short squeeze that invalidates the entire bearish thesis."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The bear flag is a signal that momentum may still be pointing downward — but context is everything. A bear flag in a broadly rising market is far less reliable than one that forms after a major trend has clearly turned lower. The quality of the pole and the orderly nature of the bounce are the two most important factors to evaluate."
      }
    ],
    quiz: [
      {
        q: "What distinguishes a bear flag from a genuine reversal bounce?",
        options: ["The bounce is very sharp and high volume", "The bounce is orderly, low volume, and retraces less than 50% of the pole", "The bounce lasts more than two weeks", "Price stays below the 200-day moving average"],
        correct: 1,
        explanation: "A genuine reversal bounce is typically sharp and accompanied by strong buying volume. A bear flag bounce is orderly, low conviction, and relatively shallow — suggesting sellers are resting rather than retreating."
      },
      {
        q: "What is the bearish signal in a bear flag pattern?",
        options: ["When the pole completes", "When price closes below the lower flag channel boundary", "When volume spikes during the flag", "When price reaches the 50% retracement level"],
        correct: 1,
        explanation: "The bearish signal is a close below the lower flag channel boundary — this confirms that sellers have resumed control after the brief consolidation and the downtrend may be continuing."
      },
      {
        q: "What does a bear flag that retraces more than 50% of the pole suggest?",
        options: ["The downtrend is stronger than expected", "Sellers have more conviction than usual", "Buyers may be gaining control and the pattern may be failing", "The flag is simply wider than normal"],
        correct: 2,
        explanation: "A bounce that retraces more than half the pole's decline suggests buyers are more active than a simple counter-trend correction would explain — the bearish thesis becomes less reliable."
      },
      {
        q: "What is the invalidation level for a bearish bear-flag thesis?",
        options: ["A close below the lower flag boundary", "A close above the upper flag boundary with volume", "When the flag lasts more than 10 days", "When RSI rises above 50"],
        correct: 1,
        explanation: "A close above the upper flag boundary (especially on elevated volume) suggests buyers have taken control and the 'bear flag' may be turning into a bullish reversal — invalidating the bearish thesis."
      }
    ],
    girlToGirlTip: "The bear flag is sneaky because the bounce inside the flag can look really enticing — price starts moving up and people think the bottom is in. But if the bounce is slow, low-volume, and corrects less than half the prior drop, that's often just sellers catching their breath. The quality of that initial drop (the pole) tells the real story. A sharp, high-volume drop says momentum is serious. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 7: Cup & Handle ───────────────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "cup-and-handle",
    title: "Cup & Handle",
    subtitle: "A bullish continuation pattern shaped like a teacup — a rounded base followed by a small consolidation.",
    difficulty: "Intermediate",
    readingMinutes: 9,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.cup{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 3s ease forwards}.handle{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 1s ease 2.5s forwards}.brk{stroke-dasharray:200;stroke-dashoffset:200;animation:draw 0.8s ease 3.5s forwards}.lbl{animation:fadeIn 0.5s ease 3.5s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Cup &amp; Handle</text><path d="M30,70 C30,70 60,68 80,80 C100,95 110,130 140,148 C170,162 200,165 220,148 C250,130 260,95 280,80 C300,68 320,68 320,68" stroke="#27B7C8" stroke-width="2.5" fill="none" class="cup"/><path d="M320,68 L340,80 L355,75 L365,82 L370,68" stroke="#49B06E" stroke-width="2" fill="none" class="handle"/><path d="M370,68 L395,45" stroke="#27B7C8" stroke-width="2.5" class="brk"/><line x1="30" y1="68" x2="395" y2="68" stroke="rgba(244,247,250,0.2)" stroke-width="1" stroke-dasharray="4,3"/><text x="135" y="168" fill="#27B7C8" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Cup (Rounded Base)</text><text x="328" y="95" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Handle</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is a Cup & Handle?",
        content: "The cup and handle is a bullish continuation pattern that was popularized by investor William O'Neil in his research on high-growth stocks. The pattern resembles a teacup when viewed on a price chart: a rounded, U-shaped base (the cup) followed by a smaller, shallower consolidation (the handle).\n\nThe pattern typically forms over weeks or months in strong uptrending stocks. The bullish breakout signal comes when price clears the resistance level defined by the cup's rim — the price level at both the left and right edges of the cup."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "The cup forms as price declines from a prior high (the left rim), gradually rounds out at the bottom as selling pressure exhausts itself, and then rallies back toward the prior high. This rounded base — as opposed to a sharp V-bottom — suggests gradual accumulation rather than a panic buying spike.\n\nWhen price approaches the prior high again (the right rim), sellers who bought at the top of the prior move see a chance to exit at breakeven. This creates selling pressure that forms the handle — a brief, smaller consolidation just below the rim. When buyers finally absorb this last wave of overhead selling and push price through the rim, the prior resistance becomes support and the breakout is underway."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "Key features to look for:\n\n1. An uptrend prior to the cup — the pattern is a continuation, not a reversal.\n2. A rounded, U-shaped cup base (not a sharp V — rounded bases suggest more orderly accumulation).\n3. The cup depth is typically 15–33% from rim to bottom (deeper cups are less ideal).\n4. Volume often decreases during the right side of the cup and handle, and surges on the breakout.\n5. The handle forms in the upper half of the cup — not near the bottom.\n6. The handle's correction is usually 5–15% — a very deep handle weakens the pattern.\n\nBreakout above the cup's rim, ideally on a strong volume surge, is the confirmation."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The textbook read is bullish when price clears the cup's rim (the resistance level at both edges) after forming the handle. The measured-move logic adds the cup's depth to the breakout point to estimate a potential target — measured-move logic, not a promise.\n\nThe invalidation level for a bullish cup-and-handle thesis is a close below the handle's low. If price falls through the handle support, the pattern structure is compromised. A very deep breakdown that pushes into the lower portion of the cup raises serious questions about whether the pattern is still valid. Risk management is essential — patterns fail constantly."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "Calling V-shaped bottoms a cup is a common error. The cup should be rounded, taking weeks to months to form — not a sharp spike down and up. The rounded bottom reflects gradual accumulation, not panic and recovery.\n\nCup and handle patterns fail when the broader market turns against the stock during the handle phase, when earnings or news disappoint as the stock approaches the breakout level, or when the breakout occurs on weak volume (suggesting low conviction from buyers).\n\nVery deep cups (40%+ decline from rim to bottom) are also considered weaker because the overhead selling pressure from trapped buyers is more severe."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The cup and handle pattern reflects a stock successfully digesting overhead resistance through a period of orderly accumulation. The rounded base, decreasing volume through the handle, and a volume-confirmed rim breakout are the hallmarks of the highest-quality setups. This pattern tends to appear in fundamentally strong stocks during bull markets."
      }
    ],
    quiz: [
      {
        q: "Why is a rounded (U-shaped) cup base preferred over a V-shaped base?",
        options: ["V-shapes have more volume", "Rounded bases suggest gradual accumulation; V-shapes often reflect panic and don't show sustained buyer interest", "V-shapes always break down", "Rounded bases are easier to draw"],
        correct: 1,
        explanation: "A rounded base forms over weeks or months as buyers gradually absorb selling pressure — it reflects orderly accumulation. A V-shaped base means price dropped and snapped back quickly, which often lacks the sustained buying conviction that makes cup and handle breakouts reliable."
      },
      {
        q: "Where should the handle form within the cup's structure?",
        options: ["Near the bottom of the cup", "In the upper half of the cup, close to the rim", "Exactly at the midpoint of the cup", "Outside the cup's boundaries"],
        correct: 1,
        explanation: "The handle should form in the upper portion of the cup, near the rim. A handle that forms near the bottom of the cup suggests price has fallen too far and the pattern structure is weakened."
      },
      {
        q: "What is the key confirmation signal for a cup and handle breakout?",
        options: ["Price reaching the handle's midpoint", "A volume surge as price clears the cup's rim", "Three consecutive up days in the handle", "The 50-day MA crossing above the 200-day MA"],
        correct: 1,
        explanation: "A high-volume breakout above the cup's rim is the key confirmation. Volume conviction on the breakout suggests real buyer demand — a rim break on low volume is more likely to be a false breakout."
      },
      {
        q: "How deep should a cup typically be relative to the prior price?",
        options: ["5–10%", "15–33%", "40–60%", "More than 60%"],
        correct: 1,
        explanation: "A cup depth of roughly 15–33% from the rim to the base is considered constructive. Deeper cups (40%+) mean there is more overhead selling pressure from trapped buyers, which makes the eventual breakout harder to sustain."
      }
    ],
    girlToGirlTip: "Cup and handle is one of Pansy's favorite patterns because it tells a beautiful story of patient buyers winning out over time. But honestly? The pattern is only as good as the stock behind it. A perfect cup and handle on a weak company in a terrible sector is far less meaningful than a slightly imperfect one on a market leader. Always look at the context — what's the stock been doing before the cup? Is the broader market in a healthy uptrend? Context beats pattern purity every time. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 8: Ascending Triangle ────────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "ascending-triangle",
    title: "Ascending Triangle",
    subtitle: "A bullish continuation pattern with a flat resistance top and rising support lows.",
    difficulty: "Intermediate",
    readingMinutes: 8,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.res{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 2s ease forwards}.sup{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease 0.5s forwards}.brk{stroke-dasharray:200;stroke-dashoffset:200;animation:draw 1s ease 2.5s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Ascending Triangle</text><line x1="60" y1="80" x2="310" y2="80" stroke="#ef4444" stroke-width="2" class="res"/><path d="M60,160 L310,95" stroke="#49B06E" stroke-width="2" class="sup"/><path d="M310,80 L375,45" stroke="#27B7C8" stroke-width="2.5" class="brk"/><path d="M60,160 L80,80 L110,135 L150,80 L190,112 L230,80 L260,95 L310,80" stroke="#27B7C8" stroke-width="1.5" fill="none" opacity="0.6" class="sup"/><text x="290" y="75" fill="#ef4444" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Resistance</text><text x="220" y="130" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Rising Support</text><text x="355" y="43" fill="#27B7C8" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Breakout</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is an Ascending Triangle?",
        content: "An ascending triangle is a bullish continuation pattern defined by a flat horizontal resistance line at the top and a rising support line that connects a series of higher lows at the bottom. As price moves within this narrowing wedge, the highs repeatedly test the same resistance level while the lows keep climbing — indicating that buyers are gaining ground.\n\nThe pattern typically resolves with a bullish breakout above the horizontal resistance, though breakdowns do occur. The ascending triangle is most reliable when it forms within an existing uptrend."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "The ascending triangle reveals a tug of war between buyers and sellers at a specific resistance level. Sellers consistently take profits at the horizontal resistance line — but buyers are becoming more aggressive over time, reflected in the rising lows. Each pullback finds buyers at higher and higher prices.\n\nThis behavior shows that buyers are willing to pay more and more for the stock, even before it breaks resistance. Eventually, this increasing demand typically overwhelms the supply at the resistance level, triggering a breakout. The sellers' line in the sand gets absorbed by buyers who keep stepping in earlier and earlier."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "Three or more touches of the horizontal resistance line and two or more rising lows are needed to draw the pattern credibly. The resistance line should be as flat as possible — a significantly sloping upper line is a different pattern (symmetrical or descending triangle).\n\nVolume often declines as the triangle forms and then spikes on the breakout. The breakout typically occurs somewhere between half and three-quarters of the way through the triangle's length — if price reaches the apex without breaking, the pattern becomes less reliable."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The textbook read is bullish when price closes above the horizontal resistance line. The measured-move logic takes the widest part of the triangle (the distance between the first high and the first low) and projects it upward from the breakout point. This is conceptual, not a guaranteed target.\n\nThe invalidation level is a close below the rising support line. A breakdown through rising support means buyers are no longer defending higher lows — the bullish structure is compromised. Patterns fail constantly and nothing guarantees profits."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "The most common mistake is forcing a flat top line when it's actually sloping. A pattern with a sloping upper line is a symmetrical triangle or wedge — different patterns with different implications.\n\nAscending triangles break down (not up) roughly 25–30% of the time — particularly in bearish market environments. Buyers who assume the pattern will always resolve bullishly get caught in these breakdowns.\n\nFake breakouts above the resistance line followed by quick reversals are also common. Waiting for a confirmed close (not just an intraday tag) above resistance helps filter false signals."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The ascending triangle reflects buyers gaining ground at a fixed resistance level — rising lows tell the story of increasing buyer confidence. While most ascending triangles resolve bullishly, breakdowns occur and should never be dismissed as impossible. Volume confirmation on the breakout is the most reliable signal of a genuine move."
      }
    ],
    quiz: [
      {
        q: "What does the flat upper line in an ascending triangle represent?",
        options: ["A support level buyers are defending", "A resistance level where sellers consistently take profits", "The average price during the pattern", "A moving average"],
        correct: 1,
        explanation: "The flat upper line is a horizontal resistance level where sellers have repeatedly stepped in and capped price. The pattern becomes bullish when buyers finally absorb all that supply and push through."
      },
      {
        q: "What do rising lows within an ascending triangle suggest about buyer behavior?",
        options: ["Buyers are becoming less active", "Buyers are stepping in at progressively higher prices — increasing aggression", "Sellers are pulling their offers lower", "The stock is running out of buyers"],
        correct: 1,
        explanation: "Rising lows mean buyers are willing to pay more and more to accumulate shares — they're not waiting for the stock to come back to previous support levels. This is a sign of increasing buying conviction."
      },
      {
        q: "Where in the triangle should a breakout ideally occur?",
        options: ["At the apex (end point)", "Between half and three-quarters of the way through the pattern", "At the very beginning", "Only at exactly the midpoint"],
        correct: 1,
        explanation: "Breakouts that occur between 50–75% of the way through the triangle tend to be more reliable. Patterns that reach the apex without breaking often lose their energy and become unpredictable."
      },
      {
        q: "What percentage of ascending triangles break DOWN rather than up?",
        options: ["Less than 5%", "About 10%", "Roughly 25–30%", "More than 50%"],
        correct: 2,
        explanation: "While ascending triangles are considered bullish-biased, roughly 25–30% break to the downside — especially in bearish market environments. This is why treating any pattern as guaranteed is a mistake."
      }
    ],
    girlToGirlTip: "Ascending triangles are satisfying to spot, but don't get so attached to the bullish outcome that you miss it when it breaks down. The flat resistance line is a real battleground — and sometimes the sellers win. Watch for how each approach to resistance looks: is volume picking up? Are the bounces getting weaker? Those tiny details inside the triangle tell you who's winning the fight before the actual breakout. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 9: Descending Triangle ───────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "descending-triangle",
    title: "Descending Triangle",
    subtitle: "A bearish continuation pattern with flat support and a series of declining highs.",
    difficulty: "Intermediate",
    readingMinutes: 8,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.sup{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 2s ease forwards}.res{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease 0.5s forwards}.brk{stroke-dasharray:200;stroke-dashoffset:200;animation:draw 1s ease 2.5s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Descending Triangle</text><line x1="60" y1="145" x2="310" y2="145" stroke="#49B06E" stroke-width="2" class="sup"/><path d="M60,55 L310,130" stroke="#ef4444" stroke-width="2" class="res"/><path d="M310,145 L375,175" stroke="#ef4444" stroke-width="2.5" class="brk"/><path d="M60,55 L80,145 L120,95 L160,145 L200,120 L240,145 L270,133 L310,145" stroke="#27B7C8" stroke-width="1.5" fill="none" opacity="0.6"/><text x="265" y="142" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Support</text><text x="220" y="100" fill="#ef4444" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Declining Highs</text><text x="355" y="185" fill="#ef4444" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Breakdown</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is a Descending Triangle?",
        content: "A descending triangle is the bearish counterpart to the ascending triangle. It forms with a flat horizontal support line at the bottom and a declining resistance line connecting a series of lower highs at the top. The pattern suggests that sellers are increasingly aggressive — they're willing to sell at lower and lower prices — while buyers are defending a fixed support level.\n\nThe pattern typically resolves with a bearish breakdown below the horizontal support, though bullish breakouts above the declining upper line do occur. The descending triangle is most reliable within an established downtrend."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "The descending triangle shows a battle where sellers are gradually winning. The horizontal support line represents a level where buyers keep stepping in — but each bounce reaches a lower high, meaning buyers are losing momentum and sellers are starting to sell earlier and earlier.\n\nEach time buyers defend support, they do so with less and less follow-through. Eventually, sellers overwhelm buyers at the support level and break it, often triggering a wave of stop losses from traders who were buying the support — which accelerates the move lower."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "Look for:\n\n1. Three or more touches of the horizontal support line.\n2. Two or more declining highs that form a downward-sloping upper line.\n3. Volume typically decreasing as the pattern forms.\n4. A breakdown below the flat support line, ideally on elevated volume.\n\nThe pattern needs enough time to develop — at least three touches of each boundary creates a more credible structure. Breakout should happen before price reaches the apex or the pattern loses energy."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The textbook read is bearish when price closes below the horizontal support line. The measured-move logic takes the widest portion of the triangle and projects it downward from the breakdown point. This is a conceptual target range, not a guarantee.\n\nThe invalidation level for a bearish thesis is a close above the declining resistance line (especially above the most recent high). This would suggest buyers have regained control. Risk management around this level is essential — patterns fail constantly and nothing guarantees profits."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "The same mistake as the ascending triangle: forcing a flat support line when it's actually sloping. If both lines are sloping, it's a symmetrical or falling wedge — different patterns.\n\nDescending triangles break upward roughly 25–30% of the time, particularly in strong bull markets or when a positive catalyst arrives during the pattern. Buyers who force-sold short on a descending triangle in a strong bull market get caught in violent short squeezes.\n\nFake breakdowns (price briefly dips below support and then reverses sharply) are also common. These fakeouts can trap impatient traders before the actual move occurs — in the opposite direction."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The descending triangle reflects sellers gaining control at a fixed support level — lower highs tell the story of declining seller conviction on bounces. While most descending triangles resolve bearishly, the market context is always paramount. The same pattern in a strong bull market is far less reliable than in an established downtrend."
      }
    ],
    quiz: [
      {
        q: "What do declining highs within a descending triangle suggest?",
        options: ["Buyers are becoming more aggressive", "Sellers are stepping in at progressively lower prices, gaining control", "Support is getting stronger", "The stock is forming a reversal pattern"],
        correct: 1,
        explanation: "Declining highs mean sellers are entering earlier and earlier — they don't wait for price to reach the prior resistance level before selling. This is a sign of increasing seller aggression and buyer weakness."
      },
      {
        q: "What confirms a descending triangle as a bearish signal?",
        options: ["The formation of the third lower high", "A close below the horizontal support line", "When volume spikes during the pattern", "When price reaches the apex"],
        correct: 1,
        explanation: "The bearish signal is confirmed when price closes below the flat horizontal support line — not before. Until that breakdown occurs, the pattern could still resolve to the upside."
      },
      {
        q: "What is a 'fake breakdown' in a descending triangle?",
        options: ["A breakdown that happens too slowly", "A brief dip below support that quickly reverses, trapping short sellers", "When the support line slopes slightly", "A breakdown on low volume"],
        correct: 1,
        explanation: "A fake breakdown occurs when price briefly breaks below the support line — triggering traders who expected a bearish continuation — and then quickly reverses upward. This can lead to a sharp short squeeze as trapped traders cover their positions."
      },
      {
        q: "The invalidation level for a bearish descending triangle thesis is:",
        options: ["A close below the support line", "A close above the declining resistance line with volume", "When price reaches the 200-day MA", "When RSI drops below 30"],
        correct: 1,
        explanation: "If price closes above the declining upper resistance line (especially with strong volume), the bearish thesis is invalidated — buyers have overcome sellers and the pattern's bearish structure is broken."
      }
    ],
    girlToGirlTip: "The descending triangle feels straightforward — \"lower highs plus flat support equals breakdown incoming\" — but fake breakdowns are one of the sneakiest traps in all of charting. Price dips just below support, everyone who was watching the pattern panics or goes short, and then price rockets back up and runs the whole triangle. The key is watching for volume and how price behaves in the hours after a support break. Does it hold below? Does volume confirm? One day's close isn't always the whole story. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 10: Symmetrical Triangle ─────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "symmetrical-triangle",
    title: "Symmetrical Triangle",
    subtitle: "A neutral coiling pattern where price compresses between two converging trend lines — a breakout can go either way.",
    difficulty: "Intermediate",
    readingMinutes: 8,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.upper{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease forwards}.lower{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease 0.3s forwards}.brk{stroke-dasharray:200;stroke-dashoffset:200;animation:draw 1s ease 2.5s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Symmetrical Triangle</text><path d="M40,50 L300,100" stroke="#ef4444" stroke-width="2" class="upper"/><path d="M40,165 L300,100" stroke="#49B06E" stroke-width="2" class="lower"/><path d="M300,100 L370,60" stroke="#27B7C8" stroke-width="2.5" stroke-dasharray="6,3" class="brk"/><path d="M300,100 L370,140" stroke="#ef4444" stroke-width="2" stroke-dasharray="6,3" class="brk" style="animation-delay:3s"/><text x="42" y="45" fill="#ef4444" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Declining Highs</text><text x="42" y="180" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Rising Lows</text><text x="340" y="56" fill="#27B7C8" font-family="DM Sans,sans-serif" font-size="9" class="lbl">↑ Breakout</text><text x="340" y="155" fill="#ef4444" font-family="DM Sans,sans-serif" font-size="9" class="lbl">↓ Breakdown</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is a Symmetrical Triangle?",
        content: "A symmetrical triangle forms when price makes a series of lower highs and higher lows, creating two converging trend lines that slope toward each other symmetrically. Unlike the ascending or descending triangle, neither buyers nor sellers have a clear advantage — the pattern is neutral and a breakout can occur in either direction.\n\nThe pattern is essentially a coiling of price action, where volatility compresses as price approaches the apex. A breakout from either boundary signals that one side has finally won the battle, and a potentially significant move often follows."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "A symmetrical triangle reflects genuine uncertainty. Sellers are offering at lower and lower prices (declining highs), but buyers are also stepping in at higher and higher prices (rising lows). Neither side is dominant.\n\nThis compression typically builds tension. As price tightens toward the apex, the energy of the move that created the triangle dissipates and traders wait for a catalyst. When one side finally capitulates — either buyers push through the upper line or sellers push through the lower line — the pent-up energy often produces a sharp, fast move."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "A valid symmetrical triangle needs:\n\n1. At least two touches of the upper (declining) line and two touches of the lower (rising) line.\n2. Both lines converging at a roughly symmetrical angle toward an apex.\n3. Volume typically declining as the triangle forms — compression in both price and volume.\n4. The breakout (or breakdown) occurring between half and three-quarters of the way to the apex.\n\nThe prior trend context matters: a symmetrical triangle that forms after a strong uptrend is more likely to resolve bullishly (continuation); one that forms after a downtrend tends to resolve bearishly, though neither is certain."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "Because the direction is uncertain, many traders wait for the actual breakout before drawing conclusions. A close above the declining upper line is a bullish signal; a close below the rising lower line is bearish. Volume confirmation on the breakout strengthens either signal.\n\nThe measured-move logic uses the widest part of the triangle (the height at the left side) and projects it in the breakout direction. This is conceptual, not a guarantee. The invalidation level is the opposite boundary — if a \"bullish\" breakout quickly reverses back below the upper line, the breakout was likely false. Patterns fail constantly and nothing guarantees profits."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "Predicting the breakout direction before it happens is the most common mistake. While the prior trend is a guide, symmetrical triangles break in the \"wrong\" direction frequently enough that anticipating the breakout is risky.\n\nFake breakouts are especially common with symmetrical triangles because both bulls and bears are watching the same pattern. A brief break above the upper line traps bulls, then quickly reverses and breaks below the lower line — or vice versa. Waiting for a confirmed, sustained close outside the boundaries (not just an intraday touch) helps filter some of these false moves."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The symmetrical triangle is one of the most honest patterns — it openly admits uncertainty. Both buyers and sellers are equally matched, and the breakout direction will tell the story. Volume confirmation is essential because the pattern itself offers no directional bias. The prior trend, the broader market environment, and confirmation are everything."
      }
    ],
    quiz: [
      {
        q: "What makes a symmetrical triangle 'neutral' compared to ascending or descending triangles?",
        options: ["It always forms during sideways markets", "Both buyers and sellers are gaining ground — declining highs AND rising lows", "The volume is always zero inside", "It only forms on weekly charts"],
        correct: 1,
        explanation: "In an ascending triangle, buyers are gaining ground (rising lows against flat resistance). In a descending triangle, sellers are gaining ground. In a symmetrical triangle, both sides are gaining — it's a genuine standoff, making the breakout direction uncertain."
      },
      {
        q: "When should a breakout typically occur within a symmetrical triangle?",
        options: ["At the very beginning", "Between 50–75% of the way to the apex", "Exactly at the apex", "After the apex is reached"],
        correct: 1,
        explanation: "Breakouts between 50–75% of the way through the triangle tend to be more energetic. If price reaches the apex without breaking, the pattern often loses its energy and becomes less predictive."
      },
      {
        q: "How does the prior trend affect the interpretation of a symmetrical triangle?",
        options: ["It has no effect — the triangle is always neutral", "A triangle after an uptrend tends to resolve bullishly (continuation bias)", "A triangle after a downtrend always breaks upward", "The prior trend only matters for volume"],
        correct: 1,
        explanation: "While not guaranteed, a symmetrical triangle that forms after a strong uptrend has a higher probability of resolving bullishly as a continuation pattern. Context matters — but the triangle itself offers no certainty."
      },
      {
        q: "What is a 'fake breakout' in a symmetrical triangle?",
        options: ["A breakout that happens too quickly", "A brief close outside a boundary that quickly reverses back inside the triangle", "A breakout with too much volume", "Any breakout below the lower line"],
        correct: 1,
        explanation: "A fake breakout occurs when price briefly closes outside one of the triangle's boundaries, traps traders who acted on the signal, and then reverses back into the triangle (and often through the opposite boundary). Waiting for sustained confirmation helps filter these traps."
      }
    ],
    girlToGirlTip: "Symmetrical triangles are fascinating because they're the most honest pattern — they just say 'I don't know yet, wait and see.' The best approach is to let the market tell you which way. Don't predict; observe. And watch out for the fake breakout — it's almost a ritual with this pattern. Price pops above one boundary, people pile in, and then it reverses completely. The second move, the real one, often catches everyone off guard. Patience and confirmation are your best friends here. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 11: Rising & Falling Wedge ───────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "rising-falling-wedge",
    title: "Rising & Falling Wedge",
    subtitle: "Wedges are reversal or continuation patterns where both trend lines slope in the same direction.",
    difficulty: "Intermediate",
    readingMinutes: 9,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.rw{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease forwards}.fw{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease 0.5s forwards}.lbl{animation:fadeIn 0.5s ease 2.5s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Rising Wedge (bearish) · Falling Wedge (bullish)</text><path d="M30,130 L160,65" stroke="#ef4444" stroke-width="2" class="rw"/><path d="M30,155 L160,105" stroke="#ef4444" stroke-width="1.5" class="rw"/><path d="M160,85 L230,145" stroke="#27B7C8" stroke-width="2" stroke-dasharray="4,3"/><text x="32" y="125" fill="#ef4444" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Rising Wedge</text><path d="M220,65 L350,115" stroke="#49B06E" stroke-width="2" class="fw"/><path d="M220,40 L350,80" stroke="#49B06E" stroke-width="1.5" class="fw"/><path d="M350,80 L390,40" stroke="#27B7C8" stroke-width="2" stroke-dasharray="4,3" class="fw"/><text x="255" y="130" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Falling Wedge</text><text x="165" y="155" fill="#ef4444" font-family="DM Sans,sans-serif" font-size="8" class="lbl">Breakdown</text><text x="355" y="38" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="8" class="lbl">Breakout</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Are Rising and Falling Wedges?",
        content: "Wedge patterns form when both the upper and lower trend lines slope in the same direction — unlike triangles, where the lines converge from different angles.\n\nA rising wedge has both lines sloping upward, with the lower line rising more steeply than the upper line. Despite the upward slope (which looks bullish), the rising wedge is considered a bearish pattern — it often signals that the upward move is losing steam.\n\nA falling wedge has both lines sloping downward, with the upper line falling more steeply. Despite the downward appearance, the falling wedge is considered a bullish pattern, often signaling that the downtrend is running out of energy.\n\nBoth wedges can appear as reversals or continuations depending on the prior trend."
      },
      {
        type: "psychology",
        heading: "Why They Form",
        content: "The rising wedge is bearish because even though price is making higher highs, it's also making higher lows at a faster rate — meaning the price range is compressing. Buyers are getting weaker relative to sellers: each new high requires more effort and each pullback is shallower, until buyers simply can't push higher anymore.\n\nThe falling wedge is bullish for the same logic in reverse. Price is making lower lows, but the lows are getting shallower relative to the highs — sellers are losing control. Buyers are absorbing more and more of the selling, until sellers finally exhaust themselves and buyers take over."
      },
      {
        type: "how-identify",
        heading: "How to Identify Them",
        content: "Rising wedge: Both upper and lower lines slope upward. The lower line has a steeper slope than the upper line, causing the channel to narrow as it rises. Typically resolves with a breakdown below the lower line.\n\nFalling wedge: Both lines slope downward. The upper line has a steeper slope than the lower line, causing the channel to narrow as it falls. Typically resolves with a breakout above the upper line.\n\nBoth patterns need at least two touches of each line to be credible. Volume typically declines within both wedges and then spikes on the breakout or breakdown."
      },
      {
        type: "how-read",
        heading: "How Traders Read Them",
        content: "For a rising wedge, the bearish signal is a close below the lower trend line. For a falling wedge, the bullish signal is a close above the upper trend line.\n\nMeasured-move logic for both: measure the widest part of the wedge and project it in the breakout direction from the breakout point. This is conceptual, not a guarantee.\n\nInvalidation for the rising wedge bearish thesis: a breakout above the upper line. Invalidation for the falling wedge bullish thesis: a breakdown below the lower line. Risk management is essential — patterns fail constantly and nothing guarantees profits."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How They Fail",
        content: "The most common mistake is confusing wedges with channels. A parallel channel (both lines the same slope) is a channel — the price range isn't narrowing. A wedge specifically requires converging lines.\n\nRising wedges fail when buyers simply push through the upper line with a surge of momentum — particularly in powerful bull markets where buying pressure overwhelms the exhaustion signal. Falling wedges fail when sellers find new conviction and break below the lower line, particularly in bearish markets.\n\nThe counterintuitive nature of these patterns (rising = bearish, falling = bullish) causes many traders to trade them backward, entering in the wrong direction."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Wedges are deceptive patterns — they look like trends but signal exhaustion. The rising wedge's narrowing range despite upward movement shows buyers losing power; the falling wedge's narrowing range shows sellers losing power. Always wait for the breakout or breakdown before drawing conclusions, and always consider the broader market environment."
      }
    ],
    quiz: [
      {
        q: "A rising wedge is generally considered what type of signal?",
        options: ["Bullish continuation", "Bearish — it suggests buyer exhaustion despite the upward slope", "Neutral", "Only relevant after a downtrend"],
        correct: 1,
        explanation: "Despite sloping upward, a rising wedge is a bearish pattern. The narrowing price range signals that buyers are weakening — each higher high requires more effort and buyers are slowly losing control."
      },
      {
        q: "What distinguishes a wedge from a parallel channel?",
        options: ["Wedges always slope downward", "Wedges have two lines converging (narrowing range); channels have parallel lines", "Channels have more volume", "Wedges only form on daily charts"],
        correct: 1,
        explanation: "The key difference is convergence. A wedge has two lines narrowing toward each other — the price range compresses as the pattern develops. A parallel channel has equal spacing between the lines throughout."
      },
      {
        q: "What confirms a falling wedge as a bullish signal?",
        options: ["A breakdown below the lower line", "A breakout above the upper trend line", "When both lines become horizontal", "When price reaches the apex"],
        correct: 1,
        explanation: "For a falling wedge, the bullish signal comes when price closes above the upper (declining) trend line. This signals that buyers have absorbed all the selling pressure and are taking control."
      },
      {
        q: "Why do wedges generate counterintuitive signals (rising = bearish, falling = bullish)?",
        options: ["Because they are always reversal patterns", "Because the narrowing range inside the wedge signals exhaustion in the dominant direction, despite the direction of slope", "Because of arbitrage", "Because volume always spikes against the trend"],
        correct: 1,
        explanation: "The price range compressing within the wedge signals that the force driving the wedge's direction is running out. In a rising wedge, buyers can't maintain the same rate of advance — their power is diminishing even as price moves higher."
      }
    ],
    girlToGirlTip: "Wedges trick people constantly because our brains say 'price going up = bullish' and 'price going down = bearish.' But chart patterns have their own logic. The rising wedge is quietly warning that the uptrend is getting tired — the range is shrinking, the momentum is slowing. And the falling wedge is often building a coiled spring for a reversal. The most beautiful thing about learning this is you start to see what the market is feeling, not just where price is. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 12: Rectangle & Channel ──────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "rectangle-channel",
    title: "Rectangle & Channel",
    subtitle: "Price moving between two parallel lines — a trading range that defines support and resistance clearly.",
    difficulty: "Intermediate",
    readingMinutes: 8,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.top{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease forwards}.bot{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 2s ease 0.3s forwards}.price{stroke-dasharray:1000;stroke-dashoffset:1000;animation:draw 3s ease 0.5s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Rectangle / Trading Range</text><line x1="40" y1="70" x2="310" y2="70" stroke="#ef4444" stroke-width="2" class="top"/><line x1="40" y1="140" x2="310" y2="140" stroke="#49B06E" stroke-width="2" class="bot"/><path d="M40,110 L70,70 L100,140 L140,75 L175,140 L210,78 L245,138 L280,73 L310,140" stroke="#27B7C8" stroke-width="2" fill="none" class="price"/><path d="M310,70 L370,40" stroke="#27B7C8" stroke-width="2.5" stroke-dasharray="6,3" class="price"/><text x="315" y="68" fill="#ef4444" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Resistance</text><text x="315" y="140" fill="#49B06E" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Support</text><text x="355" y="38" fill="#27B7C8" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Breakout</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Are Rectangles and Channels?",
        content: "A rectangle (also called a trading range or consolidation box) forms when price bounces between a clear horizontal resistance line at the top and a clear horizontal support line at the bottom. The price oscillates between these two parallel lines for a period of time before eventually breaking out.\n\nA channel is similar but the two boundary lines are not horizontal — they both slope in the same direction (both rising in an ascending channel, both falling in a descending channel). Channels define the ongoing trend boundaries.\n\nBoth patterns define clear reference levels and eventually break out in one direction, signaling either a trend continuation or reversal."
      },
      {
        type: "psychology",
        heading: "Why They Form",
        content: "Rectangles form when buyers and sellers reach a rough equilibrium — neither side has a compelling reason to push price significantly in either direction. Sellers consistently take profits at the resistance level; buyers consistently step in at the support level. This creates a predictable range until a catalyst shifts the balance.\n\nChannels form when a trend is progressing at a steady, consistent pace. An ascending channel shows buyers consistently paying more, with sellers also raising their offer level at a matching rate. A descending channel shows the reverse. Channels often represent the \"normal\" progression of a trend — until the channel breaks."
      },
      {
        type: "how-identify",
        heading: "How to Identify Them",
        content: "For a rectangle: two or more touches of a horizontal resistance line and two or more touches of a horizontal support line. The more touches of each boundary, the more confirmed the range.\n\nFor a channel: draw a trend line connecting the swing lows, then draw a parallel line connecting the swing highs. Both lines should slope in the same direction at roughly the same angle.\n\nVolume within rectangles often decreases as the range persists, and then spikes on the eventual breakout. Volume during channel trading tends to pick up on the dominant trend direction (up in ascending channels, down in descending channels)."
      },
      {
        type: "how-read",
        heading: "How Traders Read Them",
        content: "Within a rectangle, the textbook approach involves noting that support may attract buyers and resistance may attract sellers — but breakouts end the range. A close above resistance is bullish; a close below support is bearish.\n\nFor channels: a break above an ascending channel is exceptionally bullish (the trend is accelerating); a break below is a warning of possible trend reversal. A break below a descending channel may signal capitulation (the downtrend is exhausting); a break above is a bullish reversal signal.\n\nThe measured-move for a rectangle projects the height of the range in the breakout direction. For channels, the width of the channel itself is the conceptual target. All of these are frameworks, not promises — patterns fail constantly and risk management is essential."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "In rectangles, the most common mistake is trying to trade every touch of support and resistance within the range. Each touch becomes a lower-probability trade because the range can end at any time with a breakout.\n\nFake breakouts from rectangles are also extremely common — price closes above resistance, traders act on the breakout, and then price reverses back into the range. Waiting for a sustained close (and ideally a volume confirmation) is more reliable.\n\nIn channels, the mistake is assuming the channel will continue indefinitely. Channels break — either through acceleration (very bullish or bearish) or reversal. The longer a channel persists, the more traders are anchored to it, which often makes the eventual break more violent."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Rectangles and channels provide clear visual structure — they define where support and resistance are in real time. The power is in identifying the eventual breakout. Context always matters: a rectangle in a strong uptrend is more likely to break upward; a rectangle in a downtrend is more likely to break downward. The channel's boundaries also serve as the most basic risk management framework — the idea is proven wrong when price breaks the channel's defining boundaries."
      }
    ],
    quiz: [
      {
        q: "How does a rectangle differ from a channel?",
        options: ["A rectangle has sloping lines; a channel has horizontal lines", "A rectangle has horizontal parallel lines; a channel has sloping parallel lines", "They are the same pattern", "A channel always leads to a breakdown"],
        correct: 1,
        explanation: "A rectangle has two horizontal parallel lines (horizontal support and resistance). A channel has two parallel sloping lines — both rising in an ascending channel, both falling in a descending channel."
      },
      {
        q: "What does a break above an ascending channel typically suggest?",
        options: ["The uptrend is about to reverse", "The uptrend is accelerating — buyers are gaining strength above the normal trend pace", "The stock is about to form a rectangle", "Volume will immediately decrease"],
        correct: 1,
        explanation: "Breaking above the upper boundary of an ascending channel suggests the trend is accelerating — buyers have gained enough strength to push price beyond the channel's normal pace. This is considered exceptionally bullish in the short term."
      },
      {
        q: "Why are fake breakouts common in rectangles?",
        options: ["Because rectangles always fail", "Because many traders watch the same boundaries, creating crowded trades that can be quickly reversed", "Because volume is always low in rectangles", "Because rectangles form in low-liquidity stocks"],
        correct: 1,
        explanation: "Many traders monitor the same horizontal boundaries, making rectangle breakouts popular entry points. This crowded positioning means a fake breakout can trigger many traders simultaneously, creating a quick reversal as they exit."
      },
      {
        q: "In a downtrending rectangle (more bearish context), which direction is considered the higher-probability breakout?",
        options: ["Upward — rectangles always break up", "Downward — consistent with the prior trend", "There is no higher-probability direction", "Whichever direction has lower volume"],
        correct: 1,
        explanation: "Context matters enormously with rectangles. A rectangle that forms after a clear downtrend has a higher probability of breaking to the downside as a continuation pattern. Prior trend direction provides a probabilistic bias."
      }
    ],
    girlToGirlTip: "Rectangles feel like easy money — 'buy support, sell resistance, repeat.' But the fake breakouts in these patterns are brutal. Price will pop above resistance just enough to get everyone excited, then crash back into the range and then below it. That's why context is so important: is this a rectangle in an uptrend (more likely to break up) or a downtrend (more likely to break down)? The broader environment is always the most important filter. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },

  // ─── Lesson 13: Pennant ───────────────────────────────────────────────────
  {
    module: "m2-chart-patterns",
    slug: "pennant",
    title: "Pennant",
    subtitle: "A brief, tight consolidation after a sharp move — similar to a flag but with converging trend lines.",
    difficulty: "Intermediate",
    readingMinutes: 7,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><style>@keyframes draw{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}.pole{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 1s ease forwards}.upper{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 1.5s ease 1s forwards}.lower{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 1.5s ease 1.2s forwards}.brk{stroke-dasharray:200;stroke-dashoffset:200;animation:draw 1s ease 2.8s forwards}.lbl{animation:fadeIn 0.5s ease 3s both}</style><rect width="400" height="200" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="11">Pennant (Bullish)</text><line x1="80" y1="165" x2="80" y2="75" stroke="#27B7C8" stroke-width="3" class="pole"/><path d="M80,75 L200,100" stroke="#ef4444" stroke-width="1.5" class="upper"/><path d="M80,95 L200,100" stroke="#49B06E" stroke-width="1.5" class="lower"/><path d="M200,100 L300,55" stroke="#27B7C8" stroke-width="2.5" class="brk"/><text x="30" y="120" fill="#27B7C8" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Pole</text><text x="110" y="90" fill="#F4F7FA" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Pennant</text><text x="275" y="50" fill="#27B7C8" font-family="DM Sans,sans-serif" font-size="9" class="lbl">Breakout</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What Is a Pennant?",
        content: "A pennant is a short-term continuation pattern that forms after a sharp, near-vertical price move (the pole), followed by a brief consolidation where both the upper and lower trend lines converge toward a point — forming a small symmetrical triangle shape (the pennant).\n\nPennants look almost identical to flags, with one key difference: in a flag, the consolidation is a parallel channel sloping against the trend. In a pennant, the consolidation is a small converging triangle — neither line is parallel.\n\nThe pattern is considered a continuation signal: the same direction as the prior pole move is expected to resume when the pennant breaks out."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "After a sharp directional move, some traders take profits while others hesitate to chase the move. This creates a brief pause where neither buyers nor sellers are aggressively in control — the tight, converging consolidation reflects uncertainty that resolves quickly.\n\nThe pennant's short duration is key. Unlike a longer consolidation pattern, a pennant typically forms over just a few days to two weeks. This brevity suggests the underlying momentum is still strong — the market is simply catching its breath before continuing. When the pennant breaks, the prior energy often resumes quickly."
      },
      {
        type: "how-identify",
        heading: "How to Identify It",
        content: "A valid pennant has:\n\n1. A sharp, near-vertical prior move (the pole) on elevated volume.\n2. A short consolidation phase where the highs decline slightly and the lows rise slightly, creating converging lines.\n3. The consolidation is brief — typically 5–15 trading sessions.\n4. Volume dries up significantly during the pennant phase.\n5. A breakout in the direction of the pole, ideally on a volume spike.\n\nThe shorter and tighter the pennant, the stronger the momentum signal. A pennant that drags on for too long becomes a symmetrical triangle and loses the \"continuation\" character."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "The textbook read is a continuation in the pole's direction after the pennant breaks out of its converging boundaries. The measured-move logic takes the length of the pole and projects it from the pennant's breakout point in the same direction as the pole — this is conceptual, not a guarantee.\n\nThe invalidation level is the opposite side of the pennant's boundaries from the breakout direction. A bullish pennant's bearish invalidation is a close below the lower converging line. Patterns fail constantly — momentum can reverse, news can disrupt, and nothing guarantees profits."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes & How It Fails",
        content: "The most common mistake is confusing a pennant with a flag. Both follow a pole, but flags have parallel boundaries (slightly sloping against the trend) while pennants have converging boundaries (forming a small triangle). The distinction affects how the boundaries are drawn and where the breakout is expected.\n\nPennants fail when the consolidation is simply too long — the momentum dissipates and the pattern transitions into a longer consolidation that may resolve in any direction. They also fail when the broader market reverses sentiment mid-pattern or when the news that drove the pole reverses.\n\nLow volume on the breakout is a warning sign. A pennant breakout needs volume confirmation — a quiet, low-conviction break often leads to a failed continuation."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "The pennant is a high-momentum continuation pattern — it works best when the pole was sharp and significant, the pennant is short and tight, and the breakout comes with volume. Its brevity is the point: a quick pause in a powerful move, not a prolonged consolidation. Like all patterns, context and confirmation matter more than the pattern shape alone."
      }
    ],
    quiz: [
      {
        q: "What is the key visual difference between a pennant and a flag?",
        options: ["Pennants follow downtrends; flags follow uptrends", "Pennants have converging boundary lines forming a small triangle; flags have parallel boundary lines", "Flags always slope downward; pennants slope upward", "Pennants take longer to form than flags"],
        correct: 1,
        explanation: "The key difference is the shape of the consolidation. A flag uses parallel lines (a small channel sloping against the trend). A pennant uses converging lines (a small symmetrical triangle). Both follow a pole and signal continuation."
      },
      {
        q: "Why is a short duration important for a pennant's validity?",
        options: ["Longer pennants are always more bullish", "Brevity signals that underlying momentum is still strong — the market is pausing, not reversing", "Short pennants have more volume", "Duration determines the measured-move target"],
        correct: 1,
        explanation: "A brief pennant (5–15 sessions) suggests the market is simply catching its breath before continuing. A prolonged consolidation loses the character of a \"momentum pause\" and becomes a different pattern type with less directional certainty."
      },
      {
        q: "What does the measured-move logic use as the basis for a pennant's target?",
        options: ["The height of the pennant itself", "The height of the pole, projected from the breakout point", "The 50-day moving average", "Three times the pennant width"],
        correct: 1,
        explanation: "The measured-move for a pennant takes the length of the pole (the prior sharp move) and projects that same distance from the pennant's breakout point in the continuation direction. This is a conceptual framework, not a guaranteed target."
      },
      {
        q: "What volume pattern is most supportive of a valid pennant pattern?",
        options: ["Increasing volume throughout the pennant with a quiet breakout", "High volume on the pole, decreasing volume during the pennant, then a volume surge on the breakout", "Constant volume throughout", "Very high volume only during the pennant consolidation"],
        correct: 1,
        explanation: "The classic pennant volume signature is: elevated volume driving the pole, declining volume during the quiet consolidation, and then a volume surge confirming the breakout. This pattern reflects strong momentum pausing before reasserting."
      }
    ],
    girlToGirlTip: "Pennants are so satisfying because everything makes logical sense: there was a strong move, then a quick breather, and then potentially more of the same. But the key word is 'quickly.' If the consolidation drags on and on, the momentum is gone and you're looking at a completely different situation. Also, please learn to tell the difference between a pennant and a flag — they look similar but the converging lines versus parallel lines matter for how you read the boundaries. Details like this make you sharper. Educational only. Not financial advice. No pattern or signal guarantees profits — they fail constantly and risk management is essential."
  },
];

export function getM2LessonBySlug(slug: string): UniversityLesson | undefined {
  return M2_LESSONS.find((l) => l.slug === slug);
}
