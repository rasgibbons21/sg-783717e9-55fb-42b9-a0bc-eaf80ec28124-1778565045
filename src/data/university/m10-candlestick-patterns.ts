import type { UniversityLesson } from "@/data/university/m1-chart-reading";

export const M10_LESSONS: UniversityLesson[] = [
  // ─── 1. Bullish Engulfing ─────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "bullish-engulfing",
    title: "Bullish Engulfing",
    subtitle: "A big green candle that completely swallows the previous red candle's body — buyers overwhelming sellers in one move.",
    difficulty: "Intermediate",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}.a{animation:fadeIn 0.5s ease both}@keyframes growUp{from{transform:scaleY(0)}to{transform:scaleY(1)}}.bar{transform-origin:bottom;animation:growUp 0.6s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Bullish Engulfing</text><!-- Prior red candle --><line x1="148" y1="72" x2="148" y2="88" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.1s"/><rect x="136" y="88" width="24" height="52" rx="2" fill="#ef4444" class="a" style="animation-delay:0.2s"/><line x1="148" y1="140" x2="148" y2="155" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.2s"/><text x="148" y="168" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#ef4444" class="a" style="animation-delay:0.3s">Prior red</text><!-- Engulfing green candle --><line x1="230" y1="62" x2="230" y2="78" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.5s"/><rect x="216" y="78" width="28" height="76" rx="2" fill="#49B06E" class="a" style="animation-delay:0.6s"/><line x1="230" y1="154" x2="230" y2="168" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.6s"/><text x="230" y="182" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#49B06E" class="a" style="animation-delay:0.7s">Engulfing green</text><!-- Arrows showing engulf --><text x="175" y="102" font-family="DM Sans,sans-serif" font-size="18" fill="rgba(73,176,110,0.6)" class="a" style="animation-delay:0.8s">⟵</text><text x="175" y="148" font-family="DM Sans,sans-serif" font-size="18" fill="rgba(73,176,110,0.6)" class="a" style="animation-delay:0.8s">⟵</text><text x="270" y="120" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.5)" class="a" style="animation-delay:0.9s">fully</text><text x="268" y="131" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.5)" class="a" style="animation-delay:0.9s">engulfs</text><text x="200" y="200" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">Most meaningful at the bottom of a downtrend or at support</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "A big green candle that completely swallows the previous red candle's body — buyers showing up and overwhelming yesterday's sellers in one move."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "Price had been drifting down, sellers comfortable. Then buyers step in hard and erase the prior candle entirely. That total takeover is the message: control just flipped."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "Most meaningful at the bottom of a downtrend or at support — that's where a flip in control actually matters."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "Not an instant green light. The engulfing candle is the clue; traders look for the next candle to follow through before trusting it, and treat the engulfing candle's low as the natural invalidation point — if price slices back below it, the takeover failed."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Acting on the engulfing candle alone, mid-downtrend, with no support nearby and no follow-through. Location and confirmation are everything."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Buyers engulfing sellers at a meaningful level = a possible shift in control — confirmed by follow-through, invalidated below the candle's low.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "What defines a bullish engulfing candle?",
        options: [
          "Any green candle larger than the previous candle",
          "A green candle whose body completely covers the prior red candle's body",
          "A green candle with no upper wick",
          "Three consecutive green candles"
        ],
        correct: 1,
        explanation: "The defining feature is that the green body must fully engulf — open below and close above — the entire prior red candle's body. A larger candle that doesn't fully cover the prior body is not a true engulfing pattern."
      },
      {
        q: "Where does a bullish engulfing carry the most meaning?",
        options: [
          "In the middle of a sideways range",
          "After a strong uptrend",
          "At the bottom of a downtrend or at a support level",
          "On any day regardless of prior context"
        ],
        correct: 2,
        explanation: "Location is everything. A bullish engulfing at the bottom of a downtrend or at support is a potential signal of control flipping. The same candle mid-trend or in random price action carries far less meaning."
      },
      {
        q: "What does traders treating the engulfing candle's low as an 'invalidation point' mean conceptually?",
        options: [
          "Price must close exactly at the low to confirm",
          "If price decisively breaks back below the engulfing candle's low, the thesis of a flip in control is no longer valid",
          "The low is where a guaranteed bounce will occur",
          "Volume must spike at the low"
        ],
        correct: 1,
        explanation: "The engulfing candle's low represents where buyers took control. If price slices back below it convincingly, it means the buyers' 'takeover' failed and sellers are still in charge — the bullish interpretation is invalidated."
      },
      {
        q: "What is the most common mistake with bullish engulfing candles?",
        options: [
          "Waiting for follow-through confirmation",
          "Only looking for them at support",
          "Acting on the candle alone mid-downtrend with no nearby support and no follow-through",
          "Requiring the prior red candle to be very large"
        ],
        correct: 2,
        explanation: "The most common mistake is reacting to the engulfing shape alone without considering location or waiting for confirmation. A bullish engulfing mid-downtrend with no support nearby and no follow-through candle is just a strong day in a continuing downtrend."
      }
    ],
    girlToGirlTip: "One strong candle is buyers raising their hand, not winning the vote. Let the next candle second the motion before you believe it. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 2. Bearish Engulfing ─────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "bearish-engulfing",
    title: "Bearish Engulfing",
    subtitle: "The mirror — a big red candle that fully engulfs the prior green one. Sellers overwhelming buyers in a single move.",
    difficulty: "Intermediate",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}.a{animation:fadeIn 0.5s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Bearish Engulfing</text><!-- Prior green candle --><line x1="148" y1="72" x2="148" y2="88" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.1s"/><rect x="136" y="88" width="24" height="52" rx="2" fill="#49B06E" class="a" style="animation-delay:0.2s"/><line x1="148" y1="140" x2="148" y2="155" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.2s"/><text x="148" y="168" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#49B06E" class="a" style="animation-delay:0.3s">Prior green</text><!-- Engulfing red candle --><line x1="230" y1="60" x2="230" y2="76" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.5s"/><rect x="216" y="76" width="28" height="80" rx="2" fill="#ef4444" class="a" style="animation-delay:0.6s"/><line x1="230" y1="156" x2="230" y2="170" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.6s"/><text x="230" y="182" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#ef4444" class="a" style="animation-delay:0.7s">Engulfing red</text><text x="175" y="102" font-family="DM Sans,sans-serif" font-size="18" fill="rgba(239,68,68,0.6)" class="a" style="animation-delay:0.8s">⟵</text><text x="175" y="148" font-family="DM Sans,sans-serif" font-size="18" fill="rgba(239,68,68,0.6)" class="a" style="animation-delay:0.8s">⟵</text><text x="200" y="200" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">Most telling at the top of an uptrend or at resistance</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "The mirror — a big red candle that fully engulfs the prior green one. Sellers overwhelming buyers in a single move."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "Price had been climbing, buyers relaxed — then sellers slam it, erasing the last green candle entirely. Control flipped the other way."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "Most telling at the top of an uptrend or at resistance."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "Same logic reversed: the candle is a heads-up, not a trigger. Traders look for downside follow-through, and read the engulfing candle's high as the invalidation — a push back above it says buyers aren't done."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Calling every red candle \"bearish engulfing.\" It has to fully engulf the prior body, and it has to be somewhere that matters."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Sellers engulfing buyers at resistance = a possible top — confirmed by follow-through, invalidated above the candle's high.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "For a bearish engulfing to be valid, the red candle must:",
        options: [
          "Be any size larger than the prior green candle",
          "Fully engulf the prior green candle's body — open above and close below it entirely",
          "Have no lower wick",
          "Be the largest candle in the past 20 sessions"
        ],
        correct: 1,
        explanation: "A true bearish engulfing requires the red candle's body to completely swallow the prior green candle's body. Partial overlap doesn't qualify — the full body must be engulfed."
      },
      {
        q: "Where does a bearish engulfing pattern carry the most weight?",
        options: [
          "In the middle of a downtrend",
          "At the top of an uptrend or at a resistance level",
          "On any random day",
          "Only during high-volume sessions"
        ],
        correct: 1,
        explanation: "At the top of an uptrend or at resistance, a bearish engulfing represents sellers overpowering buyers at a meaningful level — a potential shift in control. Mid-downtrend it's just continuation, not reversal."
      },
      {
        q: "What is the conceptual invalidation level for a bearish engulfing thesis?",
        options: [
          "Below the red candle's low",
          "At the midpoint of the red candle's body",
          "Above the engulfing red candle's high — buyers reclaiming that level suggests sellers didn't win",
          "At the prior week's close"
        ],
        correct: 2,
        explanation: "If price pushes back above the bearish engulfing candle's high, it means buyers absorbed all that selling and then some — the 'sellers taking control' narrative is invalidated."
      },
      {
        q: "Why is calling every large red candle a 'bearish engulfing' a mistake?",
        options: [
          "Red candles are always bullish in disguise",
          "It must specifically fully engulf the prior candle's body AND appear at a meaningful location",
          "Only weekly candles can be bearish engulfing patterns",
          "The pattern requires a gap to be valid"
        ],
        correct: 1,
        explanation: "Two criteria must both be met: the body must completely engulf the prior candle, and it must appear somewhere meaningful (top of trend, resistance). A large red candle in a random location or one that doesn't fully cover the prior body is not the pattern."
      }
    ],
    girlToGirlTip: "Engulfing candles are loud, and loud isn't always right. Context (where it happens) decides whether it's a real warning or just noise. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 3. Hammer ───────────────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "hammer",
    title: "Hammer",
    subtitle: "A small body up top with a long lower wick — buyers slamming price back up after sellers drove it way down.",
    difficulty: "Beginner",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes draw{from{stroke-dashoffset:400}to{stroke-dashoffset:0}}.a{animation:fadeIn 0.5s ease both}.wick{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 0.8s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Hammer — Buyers Reject Lower Prices</text><!-- Hammer candle --><rect x="183" y="68" width="34" height="28" rx="2" fill="#49B06E" class="a" style="animation-delay:0.2s"/><!-- body --><line x1="200" y1="96" x2="200" y2="168" stroke="#49B06E" stroke-width="3" class="wick" style="animation-delay:0.4s"/><!-- long lower wick --><line x1="200" y1="64" x2="200" y2="68" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.3s"/><!-- tiny upper wick --><!-- Labels --><text x="248" y="80" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.6)" class="a" style="animation-delay:0.6s">Small body</text><line x1="218" y1="80" x2="246" y2="80" stroke="rgba(244,247,250,0.3)" stroke-width="0.8" class="a" style="animation-delay:0.6s"/><text x="248" y="140" font-family="DM Sans,sans-serif" font-size="9" fill="#27B7C8" class="a" style="animation-delay:0.7s">Long lower wick</text><text x="248" y="151" font-family="DM Sans,sans-serif" font-size="9" fill="#27B7C8" class="a" style="animation-delay:0.7s">(rejection)</text><line x1="203" y1="132" x2="246" y2="138" stroke="rgba(39,183,200,0.4)" stroke-width="0.8" class="a" style="animation-delay:0.7s"/><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">After a downtrend, often at support — that's what makes it a hammer</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "A small body up top with a long lower wick and little-to-no upper wick — like a hammer hanging down."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "Sellers drove price way down during the session… and buyers slammed it right back up by the close. That long lower wick is a rejection of lower prices — buyers drawing a line in the sand."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "After a downtrend, often at support. That's what makes it a hammer and not just a random candle."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "As a rejection clue, confirmed by what comes next. The hammer's low is the level that \"held\" — if price later breaks decisively below it, the rejection failed. Concept, not a copyable number."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Trusting a hammer in the middle of nowhere. No prior downtrend, no support? It's just a candle with a tail."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "A long lower wick after a downtrend = buyers rejecting lower prices — context and confirmation make it matter.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "What does the long lower wick of a hammer represent?",
        options: [
          "Sellers were in control all session",
          "Price opened low and never recovered",
          "Sellers drove price down but buyers pushed it back up — a rejection of lower prices",
          "Volume was extremely low during the session"
        ],
        correct: 2,
        explanation: "The long lower wick shows the range price traveled downward during the session before buyers stepped in and pushed it back up near the open level. It's a visual record of rejection — sellers tried to push lower and got shoved back."
      },
      {
        q: "What makes a hammer meaningful versus just a candle with a tail?",
        options: [
          "The color of the body (must be green)",
          "It appearing after a downtrend, often at a support level",
          "The body being at least twice the wick size",
          "It occurring on above-average volume always"
        ],
        correct: 1,
        explanation: "Context is the difference between a signal and noise. A hammer after a downtrend at support is a potential reversal clue. The same shape mid-trend or in random price action is just a candle — it has nothing to reverse from."
      },
      {
        q: "Conceptually, what would invalidate the bullish read of a hammer?",
        options: [
          "The next candle being green",
          "Price decisively breaking below the hammer's low — the level that 'held' did not hold",
          "Volume being below average on the hammer day",
          "The stock not gapping up the next morning"
        ],
        correct: 1,
        explanation: "The hammer's low represents where buyers defended and held. If price later moves decisively below that low, it means that defense failed — sellers retook the level and the rejection read is invalidated."
      },
      {
        q: "What is the ideal confirmation after a hammer?",
        options: [
          "Three consecutive down days before buying",
          "The following candle showing follow-through to the upside",
          "RSI reaching oversold levels",
          "A gap down on the next session"
        ],
        correct: 1,
        explanation: "A hammer is a clue, not a confirmed signal. Traders look for the next candle to show upside follow-through — closing higher, confirming that buyers didn't just create a one-session spike but are actually taking control."
      }
    ],
    girlToGirlTip: "That long lower wick is the candle saying \"we tried to go lower and got shoved back.\" Listen to where it's saying it. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 4. Hanging Man ───────────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "hanging-man",
    title: "Hanging Man",
    subtitle: "Looks identical to a hammer — but it appears after an uptrend. Same shape, opposite meaning.",
    difficulty: "Intermediate",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes draw{from{stroke-dashoffset:400}to{stroke-dashoffset:0}}.a{animation:fadeIn 0.6s ease both}.wick{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 0.8s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Hanging Man — Same Shape, Opposite Location</text><!-- Uptrend dots --><circle cx="60" cy="155" r="3" fill="#27B7C8" class="a" style="animation-delay:0.1s"/><circle cx="90" cy="135" r="3" fill="#27B7C8" class="a" style="animation-delay:0.15s"/><circle cx="120" cy="115" r="3" fill="#27B7C8" class="a" style="animation-delay:0.2s"/><circle cx="150" cy="95" r="3" fill="#27B7C8" class="a" style="animation-delay:0.25s"/><path d="M60,155 L90,135 L120,115 L150,95" stroke="#27B7C8" stroke-width="1.5" fill="none" class="a" style="animation-delay:0.3s"/><!-- Hanging man candle --><rect x="183" y="68" width="34" height="26" rx="2" fill="#ef4444" class="a" style="animation-delay:0.5s"/><line x1="200" y1="94" x2="200" y2="162" stroke="#ef4444" stroke-width="3" class="wick" style="animation-delay:0.7s"/><line x1="200" y1="64" x2="200" y2="68" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.6s"/><!-- warning label --><text x="248" y="74" font-family="DM Sans,sans-serif" font-size="9" fill="#fbbf24" class="a" style="animation-delay:0.9s">Warning candle</text><text x="248" y="85" font-family="DM Sans,sans-serif" font-size="9" fill="#fbbf24" class="a" style="animation-delay:0.9s">at uptrend top</text><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">Identical to a hammer — only the location tells you which one you're looking at</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "The one that teaches context: it looks identical to a hammer — small body, long lower wick — but it shows up after an uptrend instead of a downtrend."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "Even though buyers rescued the close, the fact that sellers drove price down that hard during an uptrend is a crack in the armor — a warning that selling pressure is creeping in."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "At the top of an uptrend. Same shape as the hammer, opposite location, opposite meaning."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "As a caution flag, never a standalone signal — they wait for bearish follow-through to take it seriously."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Confusing it with a bullish hammer. The candle is identical; only the location tells you which one you're looking at."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Same shape as a hammer, but at the top of an uptrend — a warning, not a bounce. Location is the whole lesson.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "What is the key difference between a hammer and a hanging man?",
        options: [
          "The hanging man has a longer wick",
          "The hanging man is always a different color",
          "The location — a hammer appears after a downtrend; a hanging man appears after an uptrend",
          "The hanging man has a larger body"
        ],
        correct: 2,
        explanation: "The candle shape is identical — small body, long lower wick. The only difference is where it appears. After a downtrend = hammer (bullish). After an uptrend = hanging man (bearish warning). Location is the entire distinction."
      },
      {
        q: "Why does a long lower wick send a bearish warning during an uptrend?",
        options: [
          "Because long wicks are always bearish",
          "Because selling pressure strong enough to drive price down significantly during an uptrend is unusual — it hints at a crack in buyer control",
          "Because buyers recovered the close, signaling exhaustion",
          "Because the wick length indicates volume"
        ],
        correct: 1,
        explanation: "During an uptrend, sellers driving price down hard enough to create a long lower wick is notable — it shows selling pressure is entering that was not present before. Even though buyers recovered by the close, the intraday activity is a warning signal."
      },
      {
        q: "A hanging man should be treated as:",
        options: [
          "An immediate bearish signal requiring no confirmation",
          "A bullish continuation signal",
          "A caution flag that needs bearish follow-through before being taken seriously",
          "A signal only relevant on monthly charts"
        ],
        correct: 2,
        explanation: "The hanging man is a warning, not a standalone trigger. Buyers did recover the close — so confirmation matters. Traders wait for bearish follow-through (the next session closing lower) before treating the hanging man as a meaningful reversal signal."
      },
      {
        q: "This pattern primarily teaches traders that:",
        options: [
          "Long lower wicks are always bullish",
          "Candle shape alone is not enough — context (location in the trend) determines meaning",
          "Only three-candle patterns are reliable",
          "Volume overrides all candle signals"
        ],
        correct: 1,
        explanation: "The hanging man is the clearest example of why context is everything in candlestick analysis. The identical shape — same body size, same wick — means opposite things depending purely on where in the trend it appears."
      }
    ],
    girlToGirlTip: "This is the candle that proves context is king. The exact same shape means \"bounce\" at a bottom and \"be careful\" at a top. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 5. Shooting Star ────────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "shooting-star",
    title: "Shooting Star",
    subtitle: "Buyers shot price up, then sellers rejected it hard — all that gain given back by the close.",
    difficulty: "Intermediate",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes draw{from{stroke-dashoffset:400}to{stroke-dashoffset:0}}.a{animation:fadeIn 0.6s ease both}.wick{stroke-dasharray:400;stroke-dashoffset:400;animation:draw 0.8s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Shooting Star — Rejected at the Highs</text><!-- Long upper wick --><line x1="200" y1="45" x2="200" y2="120" stroke="#ef4444" stroke-width="3" class="wick" style="animation-delay:0.2s"/><!-- Small body near bottom --><rect x="183" y="120" width="34" height="24" rx="2" fill="#ef4444" class="a" style="animation-delay:0.5s"/><!-- tiny lower wick --><line x1="200" y1="144" x2="200" y2="150" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.6s"/><!-- Labels --><text x="240" y="75" font-family="DM Sans,sans-serif" font-size="9" fill="#27B7C8" class="a" style="animation-delay:0.7s">Long upper wick</text><text x="240" y="86" font-family="DM Sans,sans-serif" font-size="9" fill="#27B7C8" class="a" style="animation-delay:0.7s">(rejection of highs)</text><line x1="201" y1="75" x2="238" y2="78" stroke="rgba(39,183,200,0.4)" stroke-width="0.8" class="a" style="animation-delay:0.7s"/><text x="240" y="132" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.5)" class="a" style="animation-delay:0.8s">Small body</text><line x1="218" y1="132" x2="238" y2="132" stroke="rgba(244,247,250,0.3)" stroke-width="0.8" class="a" style="animation-delay:0.8s"/><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">After an uptrend, often at resistance — rejection of higher prices</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "A small body near the bottom with a long upper wick — buyers shot price up, then got rejected hard and gave it all back by the close."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "That long upper wick is rejection of higher prices — the opposite of a hammer. Sellers took control before the bell."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "After an uptrend, often at resistance."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "As a rejection-of-highs clue, confirmed by downside follow-through. The candle's high is the natural invalidation level — reclaimed, the rejection failed."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Seeing a shooting star with no uptrend behind it. The setup needs something to reverse from."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "A long upper wick after an uptrend = buyers rejected at the highs — a possible top, pending confirmation.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "What does the long upper wick of a shooting star tell traders conceptually?",
        options: [
          "Buyers were in control all session",
          "Price rose significantly but sellers pushed it all the way back down — a rejection of higher prices",
          "Volume was low for the session",
          "The stock is about to gap up the next day"
        ],
        correct: 1,
        explanation: "The long upper wick records intraday price travel — buyers pushed price up significantly, but sellers stepped in and forced it all the way back down by the close. The wick is a visible rejection of the highs attempted during that session."
      },
      {
        q: "How is the shooting star the conceptual opposite of the hammer?",
        options: [
          "It has a green body instead of red",
          "It forms over three candles instead of one",
          "The hammer has a long lower wick (rejection of lows); the shooting star has a long upper wick (rejection of highs) — same idea, flipped direction",
          "The shooting star appears in downtrends only"
        ],
        correct: 2,
        explanation: "Both candles are about rejection. The hammer's long lower wick shows sellers tried to push lower and got rejected by buyers. The shooting star's long upper wick shows buyers tried to push higher and got rejected by sellers. Same structure, mirrored meaning."
      },
      {
        q: "What is the invalidation level for a bearish shooting star thesis?",
        options: [
          "Below the candle's low",
          "At the midpoint of the upper wick",
          "Above the candle's high — if price reclaims it, the rejection didn't hold",
          "At the 50-day moving average"
        ],
        correct: 2,
        explanation: "The shooting star's high represents where sellers rejected price. If price later pushes back above that high, it means the rejection failed — buyers absorbed all the selling and pushed higher, invalidating the bearish read."
      },
      {
        q: "Why must a shooting star have an uptrend behind it to be meaningful?",
        options: [
          "Shooting stars only form on Mondays after uptrends",
          "A rejection at the highs only matters when price has been trending higher — there needs to be something to reverse from",
          "Uptrends guarantee the pattern works",
          "Without an uptrend the wick will always be short"
        ],
        correct: 1,
        explanation: "Context is essential. A shooting star is a potential reversal signal — you need an uptrend to reverse. The same candle shape mid-downtrend or in a sideways market is not a shooting star; it's just a candle with a long upper wick."
      }
    ],
    girlToGirlTip: "Hammer = long wick down at a bottom. Shooting star = long wick up at a top. Same idea (rejection), flipped. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 6. Doji ─────────────────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "doji",
    title: "Doji",
    subtitle: "Price opened and closed at almost the same spot — buyers and sellers fought to a draw.",
    difficulty: "Beginner",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes draw{from{stroke-dashoffset:300}to{stroke-dashoffset:0}}.a{animation:fadeIn 0.5s ease both}.wick{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 0.7s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Doji — The Draw</text><!-- Upper wick --><line x1="200" y1="55" x2="200" y2="100" stroke="#F4F7FA" stroke-width="2" class="wick" style="animation-delay:0.2s"/><!-- Tiny body (almost a cross) --><rect x="188" y="99" width="24" height="4" rx="1" fill="#F4F7FA" class="a" style="animation-delay:0.5s"/><!-- Lower wick --><line x1="200" y1="103" x2="200" y2="160" stroke="#F4F7FA" stroke-width="2" class="wick" style="animation-delay:0.3s"/><!-- Labels --><text x="240" y="62" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.6)" class="a" style="animation-delay:0.7s">Upper wick</text><text x="240" y="108" font-family="DM Sans,sans-serif" font-size="9" fill="#fbbf24" class="a" style="animation-delay:0.8s">Tiny body ≈ open = close</text><text x="240" y="152" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.6)" class="a" style="animation-delay:0.7s">Lower wick</text><text x="120" y="108" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="rgba(244,247,250,0.3)" class="a" style="animation-delay:0.9s">= Indecision</text><text x="200" y="192" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">Most meaningful at a trend extreme — a pause that can foreshadow a turn</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "A candle where price opened and closed at almost the same spot — a tiny sliver of a body with wicks on one or both sides. Buyers and sellers fought to a draw."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "Pure indecision. Nobody won the session. After a strong trend, that sudden balance can hint momentum is tiring."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "Anywhere — but it means the most at a trend extreme, where a pause can foreshadow a turn."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "Almost never alone. A doji is a \"something's shifting\" whisper that needs context and the next candle to mean anything."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Treating every doji as a reversal. Most are just a quiet breath in the middle of nothing."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "A doji is a tie — indecision. Its meaning comes entirely from where it shows up.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "What does a doji candle tell traders about a session?",
        options: [
          "Buyers dominated the session completely",
          "Sellers dominated the session completely",
          "The session ended in a draw — open and close were nearly identical",
          "Volume was at a record high"
        ],
        correct: 2,
        explanation: "A doji forms when the open and close prices are nearly the same, leaving only a tiny body. It means neither buyers nor sellers could establish control — the session was a draw. The wicks show that both sides tried but neither succeeded."
      },
      {
        q: "When does a doji carry the most significance?",
        options: [
          "In the middle of a sideways range",
          "At a trend extreme — after a strong run up or down — where a pause may foreshadow a change",
          "When it appears three times in a row",
          "Only when there are no wicks"
        ],
        correct: 1,
        explanation: "A doji after a long trend is more meaningful than a doji in a quiet, directionless period. At a trend extreme, the sudden balance between buyers and sellers hints that the momentum may be tiring — a possible prelude to a shift."
      },
      {
        q: "Why should a doji almost never be used as a standalone signal?",
        options: [
          "Doji candles don't appear on modern charts",
          "It only shows indecision — context and the following candle are needed to determine which direction the indecision resolves",
          "Doji candles always lead to further trend continuation",
          "They only appear on 1-minute charts"
        ],
        correct: 1,
        explanation: "A doji whispers 'something may be shifting' but doesn't say which way. The next candle's direction and the broader context (location in trend, support/resistance nearby) determine what the doji's indecision actually means."
      },
      {
        q: "What is the most common mistake traders make with doji candles?",
        options: [
          "Ignoring them entirely",
          "Treating every doji as a reversal signal regardless of context",
          "Looking for them only after downtrends",
          "Requiring them to have no wicks"
        ],
        correct: 1,
        explanation: "Most doji candles are just quiet sessions — a breather with no special meaning. Treating every one as a reversal leads to reacting to noise. The rare meaningful doji appears at a trend extreme with context to support the interpretation."
      }
    ],
    girlToGirlTip: "A doji after a long strong run is the market catching its breath. Worth a glance — not worth a panic. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 7. Morning Star ──────────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "morning-star",
    title: "Morning Star",
    subtitle: "A three-candle story at a bottom: selling, then pause, then buyers taking over.",
    difficulty: "Advanced",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}.a{animation:fadeIn 0.5s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Morning Star — Three-Candle Reversal</text><!-- Candle 1: Big red --><line x1="110" y1="52" x2="110" y2="68" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.1s"/><rect x="96" y="68" width="28" height="72" rx="2" fill="#ef4444" class="a" style="animation-delay:0.2s"/><line x1="110" y1="140" x2="110" y2="155" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.2s"/><text x="110" y="170" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" class="a" style="animation-delay:0.3s">① Sell-off</text><!-- Candle 2: Small star --><line x1="200" y1="128" x2="200" y2="135" stroke="#F4F7FA" stroke-width="2" class="a" style="animation-delay:0.5s"/><rect x="190" y="135" width="20" height="18" rx="2" fill="#F4F7FA" opacity="0.7" class="a" style="animation-delay:0.6s"/><line x1="200" y1="153" x2="200" y2="160" stroke="#F4F7FA" stroke-width="2" class="a" style="animation-delay:0.6s"/><text x="200" y="174" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="rgba(244,247,250,0.6)" class="a" style="animation-delay:0.7s">② Pause (star)</text><!-- Candle 3: Big green --><line x1="290" y1="55" x2="290" y2="68" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.9s"/><rect x="276" y="68" width="28" height="68" rx="2" fill="#49B06E" class="a" style="animation-delay:1s"/><line x1="290" y1="136" x2="290" y2="148" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:1s"/><text x="290" y="170" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E" class="a" style="animation-delay:1.1s">③ Buyers take over</text><text x="200" y="195" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">The third candle does the confirming — don't call it early</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "A three-candle story at a bottom: a big red candle (selling), then a small indecision candle (the pause), then a big green candle (buyers taking over). Selling → balance → buying."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "A transition drawn out over three sessions — the downtrend exhausts, hesitates, then flips. More reliable than a single candle because it's a whole little arc."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "At the bottom of a downtrend."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "As a sequence — they want that third green candle to genuinely confirm the shift, and reason about invalidation below the low of the middle (star) candle."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Calling it early off the first two candles, before the green confirmation shows up."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Sell-off, pause, recovery across three candles = a possible bottom — the third candle does the confirming.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "What are the three candles in a morning star pattern, in order?",
        options: [
          "Small green, large red, small green",
          "Large red, small indecision candle, large green",
          "Large green, doji, large red",
          "Three consecutive small green candles"
        ],
        correct: 1,
        explanation: "The morning star is: (1) a large red candle showing the downtrend's selling, (2) a small indecision candle (the \"star\") showing the pause and balance, and (3) a large green candle showing buyers taking control. Each candle plays a specific role in the transition story."
      },
      {
        q: "Why is the morning star considered more reliable than a single-candle reversal signal?",
        options: [
          "It uses three times as much data",
          "It tells a complete arc — exhaustion, then balance, then recovery — rather than a single moment",
          "Three-candle patterns are always reliable",
          "It only works when all three candles are the same size"
        ],
        correct: 1,
        explanation: "A three-candle pattern draws out the transition over multiple sessions — the downtrend exhausts (candle 1), the market balances (candle 2), then buyers confirm control (candle 3). This narrative arc is more convincing than any single candle statement."
      },
      {
        q: "What is the conceptual invalidation level for a morning star bullish thesis?",
        options: [
          "Above the third green candle's high",
          "Below the low of the middle star candle",
          "At the open of the first red candle",
          "At the 20-day moving average"
        ],
        correct: 1,
        explanation: "The middle candle's low represents the balance point where sellers exhausted and buyers began stepping in. A move decisively below that level suggests the pause was not a reversal but simply a brief rest before the downtrend continued."
      },
      {
        q: "What is the most common mistake with the morning star pattern?",
        options: [
          "Waiting for the third candle to confirm",
          "Only looking for it at support levels",
          "Calling the pattern complete after only two candles, before the green confirmation appears",
          "Requiring the star candle to be a perfect doji"
        ],
        correct: 2,
        explanation: "The third candle — the large green one — is the confirmation that makes the pattern. Calling a morning star after just the red candle and the star is premature; the market could continue lower. The green candle's appearance and strength is what confirms the potential turn."
      }
    ],
    girlToGirlTip: "Three candles telling one story is more trustworthy than one candle shouting. Patterns that take their time tend to mean more. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 8. Evening Star ─────────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "evening-star",
    title: "Evening Star",
    subtitle: "The mirror at a top: buying, then pause, then sellers taking the wheel.",
    difficulty: "Advanced",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}.a{animation:fadeIn 0.5s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Evening Star — Three-Candle Top</text><!-- Candle 1: Big green --><line x1="110" y1="55" x2="110" y2="68" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.1s"/><rect x="96" y="68" width="28" height="72" rx="2" fill="#49B06E" class="a" style="animation-delay:0.2s"/><line x1="110" y1="140" x2="110" y2="152" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.2s"/><text x="110" y="168" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E" class="a" style="animation-delay:0.3s">① Rally</text><!-- Candle 2: Small star --><line x1="200" y1="45" x2="200" y2="52" stroke="#F4F7FA" stroke-width="2" class="a" style="animation-delay:0.5s"/><rect x="190" y="52" width="20" height="18" rx="2" fill="#F4F7FA" opacity="0.7" class="a" style="animation-delay:0.6s"/><line x1="200" y1="70" x2="200" y2="78" stroke="#F4F7FA" stroke-width="2" class="a" style="animation-delay:0.6s"/><text x="200" y="168" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="rgba(244,247,250,0.6)" class="a" style="animation-delay:0.7s">② Pause (star)</text><!-- Candle 3: Big red --><line x1="290" y1="55" x2="290" y2="68" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.9s"/><rect x="276" y="68" width="28" height="72" rx="2" fill="#ef4444" class="a" style="animation-delay:1s"/><line x1="290" y1="140" x2="290" y2="154" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:1s"/><text x="290" y="168" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" class="a" style="animation-delay:1.1s">③ Sellers take over</text><text x="200" y="195" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">Morning star at the bottom, evening star at the top</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "The mirror at a top: a big green candle, then a small indecision candle, then a big red candle. Buying → balance → selling."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "The uptrend runs, stalls into indecision, then sellers take the wheel. A turn drawn out over three sessions."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "At the top of an uptrend."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "As a confirmed sequence — the third red candle is the tell — with invalidation reasoned above the high of the middle candle."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Jumping on the first two candles before the red confirmation."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Rally, pause, sell-off across three candles = a possible top, confirmed by the third candle.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "The evening star is the mirror of the morning star. What does each appear at?",
        options: [
          "Morning star at tops, evening star at bottoms",
          "Morning star at bottoms (bullish), evening star at tops (bearish)",
          "Both appear at the same location",
          "Evening star only appears during earnings"
        ],
        correct: 1,
        explanation: "Morning star = three-candle bullish reversal at a downtrend bottom. Evening star = three-candle bearish reversal at an uptrend top. They share the same structure (big candle → small star → big candle) but are mirror images in both direction and location."
      },
      {
        q: "Which candle in the evening star confirms the bearish reversal?",
        options: [
          "The first large green candle",
          "The small middle star candle",
          "The third large red candle",
          "A fourth confirming candle after the pattern"
        ],
        correct: 2,
        explanation: "The third candle — the large red one — is the confirmation. It shows sellers have genuinely taken control after the uptrend's pause. Calling the pattern bearish before this candle forms is premature."
      },
      {
        q: "What is the conceptual invalidation level for an evening star bearish thesis?",
        options: [
          "Below the low of the red candle",
          "At the close of the green candle",
          "Above the high of the middle star candle — price reclaiming that level suggests sellers didn't win",
          "At the 50-day moving average"
        ],
        correct: 2,
        explanation: "The middle star candle's high represents the peak of the pattern's indecision zone. If price pushes back above it, buyers have absorbed the selling and the bearish reversal thesis fails."
      },
      {
        q: "What is the most common mistake when trading the evening star?",
        options: [
          "Waiting for the third candle",
          "Looking for it at resistance",
          "Treating the pattern as complete and acting on it after only the first two candles, before the red confirmation",
          "Requiring the star to be a perfect doji"
        ],
        correct: 2,
        explanation: "The pattern is not complete until the third red candle forms and confirms seller control. Acting after just the green candle and the star is premature — the market has only paused, not confirmed a reversal."
      }
    ],
    girlToGirlTip: "Morning star at the bottom, evening star at the top — like sunrise and sunset for a trend. Same structure, opposite ends. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 9. Marubozu ─────────────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "marubozu",
    title: "Marubozu",
    subtitle: "All body, no wicks — one side controlled the entire session from open to close, no pushback.",
    difficulty: "Intermediate",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}.a{animation:fadeIn 0.5s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Marubozu — Total Dominance</text><!-- Green marubozu --><rect x="100" y="55" width="40" height="110" rx="2" fill="#49B06E" class="a" style="animation-delay:0.2s"/><!-- no wicks indicator --><text x="120" y="178" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#49B06E" class="a" style="animation-delay:0.5s">Green Marubozu</text><text x="120" y="190" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="rgba(73,176,110,0.6)" class="a" style="animation-delay:0.5s">buyers · open to close</text><!-- Red marubozu --><rect x="260" y="55" width="40" height="110" rx="2" fill="#ef4444" class="a" style="animation-delay:0.7s"/><text x="280" y="178" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#ef4444" class="a" style="animation-delay:0.9s">Red Marubozu</text><text x="280" y="190" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="rgba(239,68,68,0.6)" class="a" style="animation-delay:0.9s">sellers · open to close</text><!-- No wick labels --><text x="155" y="62" font-family="DM Sans,sans-serif" font-size="8" fill="rgba(244,247,250,0.4)" class="a" style="animation-delay:0.6s">← no upper wick</text><text x="155" y="170" font-family="DM Sans,sans-serif" font-size="8" fill="rgba(244,247,250,0.4)" class="a" style="animation-delay:0.6s">← no lower wick</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "A candle that's basically all body, no wicks — one side controlled the entire session from open to close, no pushback."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "Total dominance. A green marubozu = buyers in charge start to finish; a red one = sellers, uncontested. No rejection because the other side never showed up."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "Anywhere, but powerful when it breaks a level or kicks off a move — it shows real conviction behind the push."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "As a conviction clue that strengthens whatever it confirms (a breakout, a continuation) — rarely traded in isolation."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Reading raw size as \"guaranteed continuation.\" Strong conviction can also mark an emotional, overextended push."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "All body, no wicks = one side fully in control — conviction, used to confirm, not predict.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "What makes a candle a marubozu?",
        options: [
          "It is larger than the prior 10 candles",
          "It has little to no wicks — the body extends from open to close with one side in total control",
          "It closes above the previous day's high",
          "It occurs with volume three times the average"
        ],
        correct: 1,
        explanation: "A marubozu is defined by the near-absence of wicks. Price moved from open to close in one direction with no meaningful pushback from the other side — no upper wick means sellers never pushed back; no lower wick means buyers never defended."
      },
      {
        q: "What does a green marubozu with no wicks tell traders about the session?",
        options: [
          "Price opened and closed near the same level",
          "Buyers were in complete control from the open to the close — sellers offered no meaningful resistance",
          "Volume was below average",
          "The stock gapped up and then sold off"
        ],
        correct: 1,
        explanation: "A green marubozu with no upper or lower wick shows that buyers drove price from the opening bell to the close without sellers ever pushing it back. It's one of the clearest single-candle expressions of buyer conviction."
      },
      {
        q: "How is a marubozu best used in analysis?",
        options: [
          "As a standalone buy or sell signal",
          "Only on weekly charts",
          "As a conviction clue that strengthens other signals — like confirming a breakout or a continuation",
          "It is only valid when it occurs at all-time highs"
        ],
        correct: 2,
        explanation: "A marubozu rarely tells the whole story by itself. Its value is in confirming: a marubozu on a breakout day adds conviction to the breakout; a marubozu in a trend says participants are committed. It strengthens other signals rather than replacing them."
      },
      {
        q: "Why can a very large marubozu at the end of a trend be a caution sign rather than a bullish signal?",
        options: [
          "Large candles are always bearish",
          "It may represent climactic, overextended buying — the last emotional push before the crowd runs out of buyers",
          "Marubozu candles can only appear at the start of trends",
          "No-wick candles always reverse the next day"
        ],
        correct: 1,
        explanation: "Strong conviction can look identical to emotional exhaustion at the extremes. A giant green marubozu after a long run might represent the last wave of buyers piling in — climactic buying that exhausts demand. Conviction and overextension can look the same on the candle."
      }
    ],
    girlToGirlTip: "A wickless candle is the market with zero hesitation. Powerful — but even confident moves run out of road. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 10. Spinning Top ────────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "spinning-top",
    title: "Spinning Top",
    subtitle: "A small body with wicks on both sides — the trend hesitated, neither side landing a knockout.",
    difficulty: "Beginner",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes draw{from{stroke-dashoffset:300}to{stroke-dashoffset:0}}.a{animation:fadeIn 0.5s ease both}.wick{stroke-dasharray:300;stroke-dashoffset:300;animation:draw 0.7s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Spinning Top — Neither Side Landed a Knockout</text><!-- Spinning top --><line x1="200" y1="50" x2="200" y2="88" stroke="#F4F7FA" stroke-width="2" class="wick" style="animation-delay:0.2s"/><rect x="184" y="88" width="32" height="32" rx="2" fill="#27B7C8" opacity="0.7" class="a" style="animation-delay:0.5s"/><line x1="200" y1="120" x2="200" y2="160" stroke="#F4F7FA" stroke-width="2" class="wick" style="animation-delay:0.3s"/><!-- Labels --><text x="250" y="62" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.5)" class="a" style="animation-delay:0.7s">Wick — buyers tried</text><text x="250" y="108" font-family="DM Sans,sans-serif" font-size="9" fill="#fbbf24" class="a" style="animation-delay:0.8s">Small body</text><text x="250" y="148" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.5)" class="a" style="animation-delay:0.7s">Wick — sellers tried</text><text x="200" y="195" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">Like a doji but with a slightly larger body — still mostly hesitation</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "A small body with wicks on both sides — like a doji's slightly more decisive cousin. Price wandered up and down and closed near where it opened."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "Balance and hesitation. Both sides took swings; neither landed a knockout. The trend, for a moment, is undecided."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "Often mid-trend as a pause, or at an extreme where it can hint at fading momentum."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "As a loss-of-momentum clue, dependent entirely on context and what follows — never a signal by itself."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Over-reading a single spinning top. By itself it mostly means \"the market shrugged.\""
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Small body, wicks both sides = hesitation — momentum may be cooling, but only context tells you if it matters.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "How does a spinning top differ from a doji?",
        options: [
          "A spinning top has no wicks; a doji has long wicks",
          "A spinning top has a slightly larger body than a doji, but both express indecision",
          "A spinning top is always bullish; a doji is always bearish",
          "They are identical patterns with different names"
        ],
        correct: 1,
        explanation: "Both express indecision, but a doji's body is nearly invisible (open ≈ close), while a spinning top has a slightly more defined body. Both have wicks on both sides. The spinning top's body is small enough that neither side clearly won, but slightly more than a pure standoff."
      },
      {
        q: "When does a spinning top carry the most potential meaning?",
        options: [
          "Mid-trend during a normal quiet session",
          "At a trend extreme where it can hint at fading momentum",
          "Only on Fridays",
          "When the wicks are perfectly equal in length"
        ],
        correct: 1,
        explanation: "A spinning top mid-trend in a calm period is mostly noise — the market paused. At a trend extreme, the same indecision signals that momentum may be fading, making it worth noting alongside other context."
      },
      {
        q: "Why should a spinning top never be used as a standalone signal?",
        options: [
          "It only appears once per trading session",
          "It expresses hesitation with no directional information — context and the following candle determine what the hesitation means",
          "Spinning tops always precede consolidation",
          "They only form during low-volume sessions"
        ],
        correct: 1,
        explanation: "A spinning top says 'the market paused' — it doesn't say which way the pause resolves. The next candle and the broader context (where in the trend, nearby support/resistance) are needed to interpret whether the hesitation becomes a reversal or just a blip before continuation."
      },
      {
        q: "What does it suggest when a spinning top appears after multiple strong trend candles?",
        options: [
          "The trend is definitely continuing at full speed",
          "The trend is accelerating",
          "Momentum may be cooling — the strong one-directional force that drove the prior candles is at least temporarily absent",
          "Volume will spike immediately after"
        ],
        correct: 2,
        explanation: "After a run of strong directional candles, a spinning top signals that the one-sided force has at least paused. Both sides showed up and neither dominated — this can hint at fading momentum, though by itself it's just a clue, not a conclusion."
      }
    ],
    girlToGirlTip: "Doji and spinning top are both \"the market can't decide.\" When indecision shows up after a big run, that's when you lean in and watch. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 11. Three White Soldiers ─────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "three-white-soldiers",
    title: "Three White Soldiers",
    subtitle: "Three strong green candles in a row, each closing higher — a steady, confident march upward.",
    difficulty: "Advanced",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}.a{animation:fadeIn 0.5s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Three White Soldiers — Steady Buying Over Three Sessions</text><!-- Soldier 1 --><line x1="115" y1="118" x2="115" y2="125" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.1s"/><rect x="101" y="125" width="28" height="48" rx="2" fill="#49B06E" class="a" style="animation-delay:0.2s"/><line x1="115" y1="173" x2="115" y2="178" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.2s"/><!-- Soldier 2 --><line x1="200" y1="88" x2="200" y2="95" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.5s"/><rect x="186" y="95" width="28" height="55" rx="2" fill="#49B06E" class="a" style="animation-delay:0.6s"/><line x1="200" y1="150" x2="200" y2="156" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.6s"/><!-- Soldier 3 --><line x1="285" y1="58" x2="285" y2="65" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:0.9s"/><rect x="271" y="65" width="28" height="58" rx="2" fill="#49B06E" class="a" style="animation-delay:1s"/><line x1="285" y1="123" x2="285" y2="130" stroke="#49B06E" stroke-width="2" class="a" style="animation-delay:1s"/><!-- Labels --><text x="115" y="195" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E" class="a" style="animation-delay:0.4s">①</text><text x="200" y="172" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E" class="a" style="animation-delay:0.8s">②</text><text x="285" y="148" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E" class="a" style="animation-delay:1.2s">③</text><text x="200" y="205" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">Strength is beautiful — until it's too much too fast</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "Three strong green candles in a row, each closing higher than the last, each with small wicks — a steady, confident march upward."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "Sustained, broad buying over three sessions. No big rejections, no stalling — just buyers showing up day after day. Strong, healthy demand."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "Often after a downtrend (signaling a turn) or as confirmation an uptrend has real legs."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "As genuine strength — but with a caution: three big candles too fast can mean the move is overextended and due for a breather. Strength and exhaustion can look alike at the edges."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Chasing into the third candle after the easy part of the move is already done."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Three steady green soldiers = strong sustained buying — powerful, but watch for overextension.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "What are the key characteristics of three white soldiers?",
        options: [
          "Three candles of any color closing above a moving average",
          "Three strong green candles, each closing higher than the last, with small wicks",
          "Three green candles that each gap up at the open",
          "Three candles with identical body sizes"
        ],
        correct: 1,
        explanation: "Three white soldiers requires three consecutive green candles, each with a higher close than the prior one, and relatively small wicks — indicating sustained buying without significant rejection from sellers over three sessions."
      },
      {
        q: "Where does the three white soldiers pattern carry the most significance?",
        options: [
          "In the middle of a strong uptrend when it's expected",
          "After a downtrend as a potential reversal signal, or early in an uptrend as confirmation of real buying",
          "Only after a gap down",
          "Only when volume is below average"
        ],
        correct: 1,
        explanation: "Three white soldiers after a downtrend signals that sustained buying may be flipping the trend. Within an uptrend, it confirms that buyers have real conviction over multiple sessions. Mid-trend on a quiet day it's less noteworthy."
      },
      {
        q: "Why does the pattern include a caution about overextension?",
        options: [
          "Green candles always precede sharp reversals",
          "Three strong candles in rapid succession can mean the move is stretched — the easy part is done and a breather may follow",
          "The pattern only works three times per year",
          "Small wicks indicate the pattern will fail"
        ],
        correct: 1,
        explanation: "Strength and exhaustion can look the same on a chart. Three big green candles in a row means lots of buyers entered in a short time — if there aren't enough fresh buyers left to push further, the pattern can mark a short-term peak rather than a launchpad."
      },
      {
        q: "Why is chasing into the third candle a common mistake?",
        options: [
          "The third candle is always the weakest",
          "By the third candle, much of the move has already occurred — latecomers enter after the momentum buyers and risk-averse traders who waited for confirmation",
          "Three candles is an invalid pattern",
          "The third candle always reverses the next day"
        ],
        correct: 1,
        explanation: "By the third candle, the pattern is already visible to everyone watching — which means many traders are simultaneously reacting. The easiest part of the move happened in candles one and two. Entering the third candle means paying up for confirmation and accepting more risk."
      }
    ],
    girlToGirlTip: "Strength is beautiful until it's too much too fast. Three strong candles is conviction; five or six straight is often the crowd arriving late. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },

  // ─── 12. Three Black Crows ────────────────────────────────────────────────
  {
    module: "m10-candlestick-patterns",
    slug: "three-black-crows",
    title: "Three Black Crows",
    subtitle: "Three strong red candles in a row, each closing lower — a steady, sustained march down.",
    difficulty: "Advanced",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 210"><style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}.a{animation:fadeIn 0.5s ease both}</style><rect width="400" height="210" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Three Black Crows — Steady Selling Over Three Sessions</text><!-- Crow 1 --><line x1="115" y1="38" x2="115" y2="45" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.1s"/><rect x="101" y="45" width="28" height="52" rx="2" fill="#ef4444" class="a" style="animation-delay:0.2s"/><line x1="115" y1="97" x2="115" y2="104" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.2s"/><!-- Crow 2 --><line x1="200" y1="68" x2="200" y2="75" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.5s"/><rect x="186" y="75" width="28" height="55" rx="2" fill="#ef4444" class="a" style="animation-delay:0.6s"/><line x1="200" y1="130" x2="200" y2="138" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.6s"/><!-- Crow 3 --><line x1="285" y1="100" x2="285" y2="108" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:0.9s"/><rect x="271" y="108" width="28" height="58" rx="2" fill="#ef4444" class="a" style="animation-delay:1s"/><line x1="285" y1="166" x2="285" y2="174" stroke="#ef4444" stroke-width="2" class="a" style="animation-delay:1s"/><!-- Labels --><text x="115" y="118" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" class="a" style="animation-delay:0.4s">①</text><text x="200" y="152" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" class="a" style="animation-delay:0.8s">②</text><text x="285" y="188" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" class="a" style="animation-delay:1.2s">③</text><text x="200" y="202" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.35)">The strongest part of a move is often the part everyone can already see</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "What It Is",
        content: "The mirror — three strong red candles in a row, each closing lower, small wicks. A steady march down."
      },
      {
        type: "psychology",
        heading: "Why It Forms",
        content: "Sustained selling over three sessions, no meaningful bounces. Sellers in firm, repeated control."
      },
      {
        type: "how-identify",
        heading: "Where It Appears",
        content: "Often after an uptrend (signaling a turn) or confirming a downtrend has momentum."
      },
      {
        type: "how-read",
        heading: "How Traders Read It",
        content: "As real weakness — with the same overextension caution: three hard red candles can also mean selling is becoming climactic and stretched."
      },
      {
        type: "mistakes",
        heading: "Common Mistake",
        content: "Panic-reacting on the third candle, right as the easy downside may already be spent."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: "Three steady red crows = strong sustained selling — real weakness, but watch for an overstretched move.\n\nEducational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
      }
    ],
    quiz: [
      {
        q: "What distinguishes three black crows from just three consecutive down days?",
        options: [
          "Three black crows requires a gap down each day",
          "Each candle must be strong (substantial body) with small wicks, each closing lower — showing steady, uncontested selling",
          "The candles must be the same size",
          "Volume must triple each day"
        ],
        correct: 1,
        explanation: "Three consecutive down days with small, weak candles is ordinary price action. Three black crows requires substantial red bodies with small wicks on each candle — showing that sellers were dominant from open to close across all three sessions, with buyers offering little resistance."
      },
      {
        q: "Why is 'panic-reacting on the third candle' a common mistake?",
        options: [
          "The third candle is always the signal to act",
          "By the third candle the move is very visible — the easiest part may already be done and the pattern may be approaching climactic selling",
          "Red candles always reverse after three",
          "The third candle is never a valid candle"
        ],
        correct: 1,
        explanation: "After three big red candles, the pattern is obvious to every trader watching. Reacting at this point means entering after much of the move has already happened, often right as the selling may be reaching exhaustion. The easy downside was candles one and two."
      },
      {
        q: "What does the overextension caution mean for three black crows?",
        options: [
          "The pattern is always wrong after three candles",
          "Three hard red candles in rapid succession can signal that selling is becoming climactic — stretched, not just strong",
          "Green candles always appear after three black crows",
          "The pattern only works in bear markets"
        ],
        correct: 1,
        explanation: "Strong and exhausted can look the same on a candlestick chart. Three large red candles may represent genuine momentum, but they may also represent a panic wave where sellers all exit at once — which can be followed by a sharp short-covering bounce as the aggressive selling exhausts itself."
      },
      {
        q: "Three black crows appearing after a long uptrend suggests:",
        options: [
          "The uptrend is definitely continuing",
          "A possible reversal where sustained selling is taking over — though confirmation and context are still needed",
          "The pattern is invalid because it needs a downtrend to form",
          "Buyers will step in on the fourth session"
        ],
        correct: 1,
        explanation: "Three black crows after an uptrend is a potential reversal signal — sustained selling across three sessions where buyers offered little resistance can indicate a shift in control. Like all patterns, context, volume, and what comes next determine how seriously to take it."
      }
    ],
    girlToGirlTip: "Whether it's soldiers or crows, three-in-a-row is a strong story — just remember the strongest part of a move is often the part everyone can already see. Educational only. Not financial advice. No candlestick guarantees a move — they fail constantly and only matter in context."
  },
];

export function getM10LessonBySlug(slug: string): UniversityLesson | undefined {
  return M10_LESSONS.find((l) => l.slug === slug);
}
