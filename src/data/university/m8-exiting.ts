import type { UniversityLesson } from "./m1-chart-reading";

const DISCLAIMER =
  "Educational only. Not financial advice. These are exit frameworks, not instructions — no exit method guarantees profits.";

export const M8_LESSONS: UniversityLesson[] = [
  // ─── Lesson 1: Why Exits Matter More Than Entries ────────────────────────────
  {
    module: "m8-exiting",
    slug: "why-exits-matter",
    title: "Why Exits Matter More Than Entries",
    subtitle: "Enter perfectly and still lose by exiting badly. The exit decides the outcome.",
    difficulty: "Beginner",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220"><rect width="400" height="220" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">The Two Halves of a Trade</text><rect x="30" y="35" width="155" height="120" rx="8" fill="#27B7C8" opacity="0.12" stroke="#27B7C8" stroke-width="1"/><text x="107" y="58" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#27B7C8" font-weight="bold">ENTRY</text><text x="107" y="76" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.7">Where you get in</text><text x="107" y="94" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.7">The guess</text><text x="107" y="112" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.7">Half the plan</text><text x="107" y="140" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#27B7C8" opacity="0.6">Everyone focuses here</text><rect x="215" y="35" width="155" height="120" rx="8" fill="#49B06E" opacity="0.12" stroke="#49B06E" stroke-width="1"/><text x="292" y="58" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#49B06E" font-weight="bold">EXIT</text><text x="292" y="76" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.7">Where the result lives</text><text x="292" y="94" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.7">The outcome</text><text x="292" y="112" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.7">The missing half</text><text x="292" y="140" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#49B06E" opacity="0.6">Plan this first</text><text x="200" y="185" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Decide how you'll get out before you get in</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content: "Everyone obsesses over the entry, but the exit determines whether a trade made money. A trader can enter perfectly and still lose by exiting badly — or enter okay and do great with a disciplined exit. The exit is where the result actually lives."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "The entry is a guess; the exit is the result. A plan that's detailed about getting in but vague about getting out is only half a plan — and the missing half is the one that pays you. Many traders spend hours finding an entry and five seconds thinking about the exit."
      },
      {
        type: "how-identify",
        heading: "The Framework",
        content: "Pre-planned exits remove the need to decide under pressure. Before entering, a thoughtful framework considers both where the trade is wrong (the stop) and where the trade has achieved its objective if it works. Knowing both answers in advance means the exit is a plan executed, not an emotion reacted to."
      },
      {
        type: "psychology",
        heading: "The Thinking Checklist",
        content: "Before entering: Did I plan my exit before entering? Do I know how I'd exit a loss AND a win? Or only the fun part — getting in? A plan with only an entry is half a plan."
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content: "Detailed entry thinking, 'winging' the exit. A clear thesis for why to get in, no clear thesis for when to get out. A profit objective that's just a hope, not a level."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: `The exit decides the outcome — plan how you'll get out before you get in.\n\n${DISCLAIMER}`
      }
    ],
    quiz: [
      {
        q: "Why do many experienced practitioners say exits matter more than entries?",
        options: [
          "Because entries are easy and anyone can do them",
          "Because the exit is where the result of the trade is actually determined",
          "Because exits require more technical knowledge",
          "Because brokers charge more for entries"
        ],
        correct: 1,
        explanation: "The entry is a hypothesis — the exit is the result. A perfect entry paired with a poor exit can still produce a loss. The outcome of the trade lives in the exit."
      },
      {
        q: "What is the key timing principle for exit planning described in this lesson?",
        options: [
          "Plan the exit only after the trade starts moving in your favour",
          "Plan the exit the night before you trade",
          "Plan the exit before entering the trade",
          "Let the market determine the exit organically"
        ],
        correct: 2,
        explanation: "Deciding the exit before entering means the decision is made when you're calm and thinking clearly — not under the pressure of a live, moving position."
      },
      {
        q: "A complete exit plan considers which of the following?",
        options: [
          "Only where the trade is wrong (the stop)",
          "Only where to take profit if the trade works",
          "Both where the trade is wrong AND where it has achieved its objective",
          "Neither — exits should be spontaneous based on feel"
        ],
        correct: 2,
        explanation: "A full plan addresses both sides: where the trade is invalidated (stop) and where it has done what it was supposed to do (profit objective). Half a plan leaves half the decision to emotion."
      },
      {
        q: "Which pattern does this lesson identify as a common mistake?",
        options: [
          "Planning the exit but not the entry",
          "Detailed entry thinking paired with a vague or nonexistent exit plan",
          "Exiting too early before any profit is realised",
          "Placing too many orders at once"
        ],
        correct: 1,
        explanation: "The most common error is spending significant time on the entry and almost none on the exit. The missing half of the plan — getting out — is the half that ultimately determines the outcome."
      }
    ],
    girlToGirlTip: "Anyone can get into a trade. Getting out well is the skill that separates a plan from a prayer. Decide your exit while you're calm — future-you, in the heat of a moving position, will thank you."
  },

  // ─── Lesson 2: Profit Targets ────────────────────────────────────────────────
  {
    module: "m8-exiting",
    slug: "profit-targets",
    title: "Profit Targets",
    subtitle: "A pre-planned, logical destination for a trade — decided when you're calm, not in the moment.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220"><rect width="400" height="220" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Logical vs Arbitrary Targets</text><line x1="40" y1="180" x2="40" y2="40" stroke="#F4F7FA" stroke-width="1" opacity="0.3"/><line x1="40" y1="180" x2="380" y2="180" stroke="#F4F7FA" stroke-width="1" opacity="0.3"/><polyline points="40,175 80,165 120,150 160,130 200,115 240,100 280,95 320,92 360,90" fill="none" stroke="#27B7C8" stroke-width="2"/><line x1="40" y1="115" x2="380" y2="115" stroke="#49B06E" stroke-width="1" stroke-dasharray="5,4" opacity="0.7"/><text x="385" y="118" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E">Resistance</text><text x="165" y="108" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E">Logical target zone</text><circle cx="200" cy="115" r="4" fill="#49B06E"/><line x1="40" y1="50" x2="380" y2="50" stroke="#ef4444" stroke-width="1" stroke-dasharray="5,4" opacity="0.5"/><text x="385" y="53" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444">Random</text><text x="100" y="47" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" opacity="0.7">Arbitrary number, no basis</text><text x="200" y="210" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Base targets on chart logic, not on a number you like</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content: "A profit target is a pre-planned objective — a logical place to consider taking gain, decided in advance rather than in the moment. It gives the trade a destination and answers the question 'where is this going?' before the trade is opened."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "A target takes the agonising 'should I take profit now?!' off the table emotionally. When that thinking is done in advance — while calm — the decision has already been made. Without a target, a trader is left making emotional decisions in real-time while a position is moving."
      },
      {
        type: "how-identify",
        heading: "The Framework",
        content: "Logical targets are set at places that make sense on the chart: the next major area of resistance, a measured-move projection from a pattern, or a level that makes the risk-to-reward ratio worthwhile. An arbitrary round number with no chart basis is not a target — it is a guess dressed up as one."
      },
      {
        type: "psychology",
        heading: "The Thinking Checklist",
        content: "Is the target at a logical level, or a number I picked because I liked it? Does it make the risk-to-reward worthwhile? Was it set before the trade was opened, not during?"
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content: "Arbitrary targets with no chart basis — just a feeling or a round number. Targets set so far away the price never realistically reaches them. Moving the target further out mid-trade when it gets close — 'just a little more' — is a form of plan abandonment."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: `A profit target is a pre-planned, logical destination — base it on the chart and on risk-to-reward, not on what you wish would happen.\n\n${DISCLAIMER}`
      }
    ],
    quiz: [
      {
        q: "What is the primary purpose of a pre-planned profit target?",
        options: [
          "To guarantee a specific amount of profit on every trade",
          "To remove emotional real-time decision-making by deciding in advance",
          "To ensure the trade stays open as long as possible",
          "To tell other traders where to exit"
        ],
        correct: 1,
        explanation: "A pre-planned target moves the exit decision to a moment when the trader is calm and thinking clearly — before the position is open — rather than in the heat of a live, moving trade."
      },
      {
        q: "Which of the following is an example of a logically-based target?",
        options: [
          "A round number that feels satisfying",
          "The next major area of chart resistance",
          "The highest the stock has ever traded",
          "Whatever the trade needs to cover commission costs"
        ],
        correct: 1,
        explanation: "A logical target uses chart structure — resistance levels, measured moves from patterns, or levels that justify the risk taken. An arbitrary round number with no chart basis is a guess, not a target."
      },
      {
        q: "What does it mean to 'move the target out' mid-trade?",
        options: [
          "Adjusting the stop loss to lock in profit",
          "Cancelling the trade before it reaches the target",
          "Extending the profit objective further while the trade is moving — typically driven by greed",
          "Scaling into a larger position size"
        ],
        correct: 2,
        explanation: "Moving the target out mid-trade — 'just a little more' — is a form of plan abandonment driven by greed. The original target was set with clear reasoning; changing it in the moment removes that discipline."
      },
      {
        q: "What does risk-to-reward have to do with target placement?",
        options: [
          "Nothing — targets are always set at resistance regardless of risk",
          "The target should be placed so that the potential gain justifies the amount risked",
          "The target should always be exactly twice the stop distance",
          "Risk-to-reward only applies to stop losses, not targets"
        ],
        correct: 1,
        explanation: "A target should make the risk-to-reward ratio worthwhile — meaning the potential gain should justify the risk being taken. A target too close to the entry makes the ratio unattractive regardless of how good the setup looks."
      }
    ],
    girlToGirlTip: "'I'll take profit when it feels right' is how good trades become round-trips. Give the trade a destination before you set off — then trust the plan you made when you were calm."
  },

  // ─── Lesson 3: Technical Exits ───────────────────────────────────────────────
  {
    module: "m8-exiting",
    slug: "technical-exits",
    title: "Technical Exits (Structure & Levels)",
    subtitle: "Let the chart — not a fixed number — signal when a move's character has changed.",
    difficulty: "Advanced",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220"><rect width="400" height="220" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Structure Break — When Character Changes</text><polyline points="40,175 80,155 120,140 140,150 160,130 180,145 200,115 220,128 240,105 260,120 280,145 310,160 340,148 370,165" fill="none" stroke="#27B7C8" stroke-width="2"/><line x1="280" y1="40" x2="280" y2="185" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" opacity="0.7"/><text x="283" y="55" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444">Structure break</text><text x="283" y="67" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444">(first lower low)</text><text x="45" y="100" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E">Healthy uptrend</text><text x="45" y="112" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E">higher highs &amp; lows</text><text x="295" y="185" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444" opacity="0.8">Character changed</text><text x="200" y="210" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Exit when structure changes, not because of noise</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content: "Instead of a fixed price target, a technical exit is based on what price action does — letting the chart, rather than a number, signal that the move is over. The trade stays open while behaviour is healthy; it closes when behaviour changes."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "A technical exit can keep a trader in a trend longer than a fixed target — capturing more of a move. A fixed target sells at a price; a technical exit sells when the character of the move changes. In a strong trend, that can mean staying in much longer."
      },
      {
        type: "how-identify",
        heading: "The Framework",
        content: "The most common structural signal is a break of trend structure: in an uptrend, the sequence is higher highs and higher lows. The first time price makes a lower low — breaking that sequence — is a signal that the character of the move has changed. A clear rejection at a major resistance level, or losing a key support, are other structural signals practitioners watch."
      },
      {
        type: "psychology",
        heading: "The Thinking Checklist",
        content: "Has structure actually broken — or is this just a normal pullback within the trend? Is the chart telling me the move is over, or am I reacting to noise? What, specifically, would need to happen on the chart for me to step aside?"
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content: "Confusing a routine pullback for a structure break and stepping out of a healthy trend too early. Conversely, ignoring a genuine structure break — a clear lower low — and staying in as the move reverses. The signal is objective; the interpretation is where mistakes happen."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: `A technical exit lets the chart decide — a break of structure or a key level lost signals the character of the move has changed.\n\n${DISCLAIMER}`
      }
    ],
    quiz: [
      {
        q: "What makes a technical exit different from a fixed profit target?",
        options: [
          "A technical exit is based on a set price; a target is based on indicators",
          "A technical exit is triggered by price behaviour changing, not a predetermined price level",
          "Technical exits are only used by professional traders",
          "Technical exits are always more profitable than fixed targets"
        ],
        correct: 1,
        explanation: "A fixed target exits at a price; a technical exit exits when price behaviour changes — a structure break, a level lost, a rejection. The trigger is what the market does, not a number decided in advance."
      },
      {
        q: "In an uptrend, what is the most commonly watched structure break signal?",
        options: [
          "A new all-time high",
          "A gap up on high volume",
          "The first lower low — breaking the sequence of higher highs and higher lows",
          "A gap down below the 50-day moving average"
        ],
        correct: 2,
        explanation: "An uptrend is defined by higher highs and higher lows. The first time price makes a lower low breaks that structural sequence — signalling the character of the move has changed and is often used as a technical exit trigger."
      },
      {
        q: "What is the risk of misidentifying a normal pullback as a structure break?",
        options: [
          "Staying in the trade too long",
          "Exiting a healthy trend prematurely before it has had time to develop",
          "Increasing position size at the wrong time",
          "Missing the original entry price"
        ],
        correct: 1,
        explanation: "Every trend has pullbacks — temporary moves against the direction. Mistaking a healthy pullback for a structure break leads to stepping out of a trade that still had more to give. Distinguishing between the two is the core skill."
      },
      {
        q: "What should a practitioner define before using a technical exit approach?",
        options: [
          "The exact dollar amount they want to make",
          "Specifically what price action would constitute a change in character — in advance",
          "The name of the pattern the stock is forming",
          "How many shares to buy back after stepping out"
        ],
        correct: 1,
        explanation: "The power of a technical exit is that the trigger is defined in advance: 'I'll step aside if X happens.' Without defining what X is before the trade opens, the exit becomes a real-time emotional judgement — the opposite of a plan."
      }
    ],
    girlToGirlTip: "Sometimes the best signal isn't a target — it's the chart quietly telling you the party's over. Learn to hear it. A lower low where higher lows used to be is the market's way of clearing its throat."
  },

  // ─── Lesson 4: Indicator-Based Exits ─────────────────────────────────────────
  {
    module: "m8-exiting",
    slug: "indicator-exits",
    title: "Indicator-Based Exits",
    subtitle: "A systematic, less-emotional exit trigger — with a clear trade-off to understand.",
    difficulty: "Advanced",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220"><rect width="400" height="220" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Indicator Exit — Signal After the Turn</text><polyline points="40,165 80,148 120,128 160,108 200,95 230,90 255,92 280,100 310,118 340,138 370,152" fill="none" stroke="#27B7C8" stroke-width="2"/><polyline points="40,175 80,168 120,158 160,145 200,135 230,128 255,125 280,128 310,134 340,143 370,150" fill="none" stroke="#49B06E" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.8"/><text x="45" y="195" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E" opacity="0.7">Indicator signal (lags)</text><line x1="280" y1="30" x2="280" y2="190" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/><text x="282" y="42" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444">Price turns</text><line x1="330" y1="30" x2="330" y2="190" stroke="#F4F7FA" stroke-width="1" stroke-dasharray="4,3" opacity="0.3"/><text x="332" y="42" font-family="DM Sans,sans-serif" font-size="8" fill="#F4F7FA" opacity="0.5">Signal fires</text><text x="200" y="210" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">The lag is the trade-off for consistency</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content: "An indicator-based exit uses a momentum or trend tool as the exit trigger — letting a consistent, rule-based signal determine when to step out, rather than a feeling. The indicator fires when conditions have shifted enough to warrant attention."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "A rule-based exit removes moment-to-moment emotional decisions from the equation. When the rule fires, the action is taken — regardless of how you feel about the trade or how much you hope it might recover. Consistency over time is the benefit."
      },
      {
        type: "how-identify",
        heading: "The Framework",
        content: "Common indicator-based exit signals practitioners study: a moving average crossing back against the trend direction; a MACD line crossing back below signal; an RSI divergence forming as price makes a new high; price losing VWAP for intraday frameworks. Each is a rule — it fires or it doesn't."
      },
      {
        type: "psychology",
        heading: "The Thinking Checklist",
        content: "Does this exit signal match how the entry was framed — using the same timeframe and logic? Is the indicator being used consistently, or being selected after the fact because it supports a view? Is price action confirming, or contradicting, the signal?"
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content: "Indicators lag — they reflect what already happened and will always exit a little late. Relying on a single indicator in isolation removes the context of what price is actually doing. Flip-flopping between which signal to trust — in real time — defeats the purpose of having a rule."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: `Indicator-based exits offer a systematic, less-emotional trigger — but they lag and work best alongside what price action is doing, not as a replacement for it.\n\n${DISCLAIMER}`
      }
    ],
    quiz: [
      {
        q: "What is the primary advantage of an indicator-based exit?",
        options: [
          "It always exits at the exact top of the move",
          "It provides a consistent, rule-based trigger that removes emotion from the exit decision",
          "It works without needing to understand price action",
          "It guarantees a profit on every trade"
        ],
        correct: 1,
        explanation: "The value of an indicator exit is consistency — the rule fires when it fires, regardless of how the trader feels about the trade. This removes moment-to-moment emotional decision-making from the exit."
      },
      {
        q: "Which of the following is a known limitation of indicator-based exits?",
        options: [
          "They are too complicated for most traders to use",
          "They only work on specific stock sectors",
          "Indicators lag price — they reflect what already happened and will exit after the turn",
          "They require a subscription to professional data services"
        ],
        correct: 2,
        explanation: "Indicators are derived from price — they follow it, not the other way around. An indicator-based exit will always fire after the move has already turned, meaning some retracement from the top or bottom is inherent in the method."
      },
      {
        q: "What does VWAP stand for, and when is it commonly used as an exit reference?",
        options: [
          "Volume-Weighted Average Price — used as an intraday reference level",
          "Volatility-Weighted Average Percentage — used for overnight positions",
          "Value-Weighted Asset Price — used for long-term holdings",
          "Volume-to-Weighted Asset Positioning — used for futures contracts"
        ],
        correct: 0,
        explanation: "VWAP (Volume-Weighted Average Price) calculates the average price weighted by volume throughout the session. Intraday practitioners often use price losing or reclaiming VWAP as a context signal for trend direction."
      },
      {
        q: "Why is it important that an indicator exit matches how the entry was framed?",
        options: [
          "It is not important — any indicator can be used for any entry",
          "The indicator and entry should use the same logic and timeframe for consistency",
          "The indicator should always be the opposite of the entry signal",
          "To ensure the trade closes at exactly the planned target"
        ],
        correct: 1,
        explanation: "Consistency requires that the exit logic matches the entry logic. If an entry was based on a daily chart trend, an exit triggered by a five-minute indicator fires on a completely different timeframe and introduces noise rather than clarity."
      }
    ],
    girlToGirlTip: "An indicator exit takes your feelings out of it — that's its gift. Just know it'll get you out a little late. That's the trade-off for consistency, and it's usually a good deal."
  },

  // ─── Lesson 5: Support & Resistance Exits ────────────────────────────────────
  {
    module: "m8-exiting",
    slug: "support-resistance-exits",
    title: "Support & Resistance Exits",
    subtitle: "Step out as price nears a level where it's historically struggled — before the rejection, not after.",
    difficulty: "Intermediate",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220"><rect width="400" height="220" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Exiting Into a Known Resistance Zone</text><line x1="40" y1="70" x2="370" y2="70" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.7"/><text x="375" y="73" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444">Resistance</text><polyline points="40,180 80,165 120,148 160,130 200,108 240,86 260,75" fill="none" stroke="#27B7C8" stroke-width="2"/><circle cx="260" cy="75" r="5" fill="#49B06E" stroke="#0E1B30" stroke-width="1.5"/><text x="268" y="70" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E">Consider exit zone</text><text x="268" y="81" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E">into strength</text><polyline points="260,75 290,65 310,72 330,60 350,68 370,58" fill="none" stroke="#F4F7FA" stroke-width="1.5" opacity="0.25" stroke-dasharray="3,3"/><text x="200" y="210" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Known levels are logical zones — consider acting before the rejection</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content: "A support and resistance exit involves stepping out as price approaches a major level where it has historically struggled — a known overhead ceiling on the way up, or a known floor on the way down. The logic: these are places where moves have stalled or reversed before."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "Significant levels are where moves often pause or reverse — they are natural places to consider banking gains before a potential rejection. Waiting for the rejection to happen before acting means stepping out into a move that's already turning against you."
      },
      {
        type: "how-identify",
        heading: "The Framework",
        content: "Identify the next major level in the direction the trade is moving. Levels that have been respected multiple times carry more weight than levels touched only once. As price approaches that zone, it becomes a logical area to consider reducing or stepping out — acting into strength rather than waiting for weakness."
      },
      {
        type: "psychology",
        heading: "The Thinking Checklist",
        content: "What is the next major level in the way of this move? Has that level been respected repeatedly in the past? Is there a reason to bank gains before that zone, rather than waiting for a potential rejection to force the decision?"
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content: "Ignoring an obvious overhead level and holding through a rejection — then stepping out in a panic below where a calm decision could have been made. Conversely, exiting at every minor level that appears and never allowing a real move to develop."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: `Support and resistance mark logical exit zones — consider banking gains into strength as price approaches a level that has stalled it before.\n\n${DISCLAIMER}`
      }
    ],
    quiz: [
      {
        q: "Why might a practitioner consider stepping out as price approaches a resistance level rather than waiting at it?",
        options: [
          "Because resistance levels always stop price exactly",
          "To act while the trade is still moving favourably, rather than waiting for a rejection",
          "Because price always gaps past resistance levels",
          "Resistance levels only matter on weekly charts"
        ],
        correct: 1,
        explanation: "Acting into strength — before a potential rejection — allows for a calmer, more deliberate decision. Waiting for the rejection to confirm means stepping out into a move that's already turned against you."
      },
      {
        q: "Which resistance levels tend to carry more significance?",
        options: [
          "Levels that were only touched once, very briefly",
          "Levels that are even round numbers with no chart history",
          "Levels that have been respected multiple times across different timeframes",
          "Levels created entirely by indicator crossovers"
        ],
        correct: 2,
        explanation: "The more times a level has been respected — where price approached and was rejected — the more significance it tends to carry in practice. A level tested and respected multiple times represents a place where supply or demand has repeatedly shown up."
      },
      {
        q: "What is the mistake of exiting at every minor level that appears?",
        options: [
          "It protects capital from large losses",
          "It prevents any real move from developing by stepping out of healthy trends prematurely",
          "It is the correct application of support/resistance exits",
          "It guarantees a small profit on every trade"
        ],
        correct: 1,
        explanation: "Not all levels are equal. Stepping out at every minor level — even when the overall trend is healthy and the major level is still far away — means a position never has time to develop into a meaningful move."
      },
      {
        q: "Why does this framework call for considering exits into 'strength'?",
        options: [
          "Because strong moves always reverse immediately",
          "Because liquidity is better when price is still moving favourably, allowing cleaner exits",
          "Because it is easier emotionally to step out of a losing trade",
          "Because support and resistance are more accurate on up days"
        ],
        correct: 1,
        explanation: "Stepping out while price is still moving toward the objective — into strength — means there's liquidity and the move hasn't stalled yet. Waiting for confirmation of the rejection means stepping out into weakness and potentially worse positioning."
      }
    ],
    girlToGirlTip: "Stepping out near a known level feels counterintuitive — you're still winning and the move looks good. But it beats waiting for a rejection to force the decision in a panic. Consider banking into strength."
  },

  // ─── Lesson 6: Time-Based Exits ──────────────────────────────────────────────
  {
    module: "m8-exiting",
    slug: "time-based-exits",
    title: "Time-Based Exits",
    subtitle: "If a trade hasn't done what it should within a reasonable window, the thesis may have quietly expired.",
    difficulty: "Intermediate",
    readingMinutes: 4,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220"><rect width="400" height="220" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Dead Money — The Opportunity Cost of Stuck Capital</text><line x1="40" y1="110" x2="360" y2="110" stroke="#F4F7FA" stroke-width="1" opacity="0.2"/><polyline points="40,110 80,112 120,108 160,111 200,109 240,112 280,108 320,111 360,110" fill="none" stroke="#27B7C8" stroke-width="2"/><text x="200" y="95" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.5">Going nowhere</text><line x1="320" y1="40" x2="320" y2="185" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/><text x="322" y="52" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444">Time threshold</text><text x="322" y="63" font-family="DM Sans,sans-serif" font-size="8" fill="#ef4444">reached</text><text x="45" y="145" font-family="DM Sans,sans-serif" font-size="8" fill="#F4F7FA" opacity="0.4">Capital locked here</text><text x="45" y="157" font-family="DM Sans,sans-serif" font-size="8" fill="#F4F7FA" opacity="0.4">can't be elsewhere</text><text x="200" y="210" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">A trade that does nothing is not neutral — it has an opportunity cost</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content: "Sometimes the exit isn't about price at all — it's about time. If a trade hasn't done what it was supposed to do within a reasonable window for that setup, stepping aside is valid regardless of what price is doing. The thesis quietly expired."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "A trade going nowhere has an opportunity cost even when it isn't losing money. Capital tied up in a dead-money position is capital that can't be deployed in a better setup. Attention tied up monitoring a flat position is attention elsewhere. 'Flat' isn't neutral — it has a cost."
      },
      {
        type: "how-identify",
        heading: "The Framework",
        content: "Every setup has a realistic timeframe. A swing trade has days to weeks. A day trade has the session. Defining a time window in advance — 'this should do something within X days' — means not being in the business of holding indefinitely. When that window passes without the thesis playing out, stepping aside is a valid, unemotional reason to close."
      },
      {
        type: "psychology",
        heading: "The Thinking Checklist",
        content: "Has this trade had a fair amount of time for its setup type? Is it tying up capital and attention that could be better used? Is the reason for staying in the trade logic — or stubbornness dressed up as patience?"
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content: "Holding a flat, going-nowhere trade indefinitely 'just in case it moves.' Ignoring the opportunity cost of locked-up capital. Confusing stubbornness with patience — patience is staying in a trade that's acting right; stubbornness is staying in one that isn't for no reason other than not wanting to be wrong."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: `A time-based exit frees you from dead money — if the thesis hasn't played out in a fair window for the setup, moving on is a valid decision.\n\n${DISCLAIMER}`
      }
    ],
    quiz: [
      {
        q: "What is 'dead money' in the context of a trade?",
        options: [
          "A trade that has lost money",
          "Capital locked in a position that isn't moving, while potentially better opportunities exist elsewhere",
          "A stock with very low trading volume",
          "A position held overnight during a major news event"
        ],
        correct: 1,
        explanation: "Dead money refers to capital committed to a position that is going nowhere — flat, with no meaningful movement. Even though it isn't losing, it has an opportunity cost: that capital and attention can't be deployed in a better setup."
      },
      {
        q: "What is a time-based exit?",
        options: [
          "Exiting only at market open or close",
          "Stepping aside when a trade hasn't achieved its objective within a pre-defined time window",
          "Setting a calendar reminder to check on the trade",
          "Holding until the next earnings announcement"
        ],
        correct: 1,
        explanation: "A time-based exit uses a pre-defined time window — appropriate for the setup type — as a trigger. If the trade hasn't done what it was supposed to do within that window, stepping aside is valid regardless of what price is doing."
      },
      {
        q: "What is the difference between patience and stubbornness in this context?",
        options: [
          "They are the same thing with different names",
          "Patience is staying in a trade that is acting correctly; stubbornness is staying in one that isn't — for no reason other than not wanting to be wrong",
          "Patience means holding for longer timeframes; stubbornness means shorter ones",
          "Stubbornness is always wrong; patience is always right"
        ],
        correct: 1,
        explanation: "Patience is giving a trade the space it needs while it's still acting in line with the thesis. Stubbornness is staying in a trade that has stopped acting right — or never started — because of an unwillingness to accept being wrong."
      },
      {
        q: "Why does defining a time window in advance help with this type of exit?",
        options: [
          "It prevents any emotional decisions entirely",
          "It sets a pre-planned, objective threshold that removes the need to decide 'how long is too long' in the heat of the moment",
          "It guarantees the trade will move within that window",
          "It is required by most brokers' risk management systems"
        ],
        correct: 1,
        explanation: "Defining the time window before the trade opens means the threshold is set objectively — when thinking is clear. Without it, 'how long do I give this?' becomes an emotional real-time question that gets answered with hope rather than logic."
      }
    ],
    girlToGirlTip: "A trade that just sits there isn't neutral — it's quietly costing you the better trades you can't take. 'Flat' is not free. Give the setup a fair amount of time, and if nothing's happened, moving on is not giving up — it's good capital management."
  },

  // ─── Lesson 7: Scaling Out of a Position ─────────────────────────────────────
  {
    module: "m8-exiting",
    slug: "scaling-out",
    title: "Scaling Out of a Position",
    subtitle: "Nobody knows the exact top. Scaling out means being partly right no matter what price does next.",
    difficulty: "Advanced",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220"><rect width="400" height="220" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Scaling Out — Pre-Planned Exit Points</text><polyline points="40,180 80,162 120,140 160,118 200,100 240,85 280,78 310,74 350,65" fill="none" stroke="#27B7C8" stroke-width="2"/><circle cx="160" cy="118" r="6" fill="#49B06E" stroke="#0E1B30" stroke-width="1.5"/><text x="168" y="114" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E">1st exit</text><text x="168" y="124" font-family="DM Sans,sans-serif" font-size="8" fill="#49B06E">partial</text><circle cx="240" cy="85" r="6" fill="#27B7C8" stroke="#0E1B30" stroke-width="1.5"/><text x="248" y="81" font-family="DM Sans,sans-serif" font-size="8" fill="#27B7C8">2nd exit</text><text x="248" y="91" font-family="DM Sans,sans-serif" font-size="8" fill="#27B7C8">more off</text><circle cx="310" cy="74" r="6" fill="#F4F7FA" stroke="#0E1B30" stroke-width="1.5"/><text x="318" y="70" font-family="DM Sans,sans-serif" font-size="8" fill="#F4F7FA" opacity="0.7">Runner</text><text x="318" y="80" font-family="DM Sans,sans-serif" font-size="8" fill="#F4F7FA" opacity="0.7">trailing stop</text><text x="200" y="210" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Bank some, hold some — stop trying to call the exact top</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content: "Exits don't have to be all-or-nothing. Scaling out means closing a position in pieces — banking some at one point, more at another, and letting a final piece run. Nobody knows exactly where the top is; scaling out means being partly right no matter what price does next."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "Scaling removes the pressure of one perfect exit decision. If the trade runs further after a partial exit, the remaining position captures more. If it reverses, some was already banked before the move ended. It is the practical answer to not knowing exactly when the move is over."
      },
      {
        type: "how-identify",
        heading: "The Framework",
        content: "Pre-plan the scale-out points before the trade opens: a partial at a first logical objective, more at the next level, and a final runner held with a trailing stop that moves to protect gains. The specifics matter less than having planned them — three pre-planned points is better than one panicked decision."
      },
      {
        type: "psychology",
        heading: "The Thinking Checklist",
        content: "Were the scale-out points planned in advance — or am I deciding in real-time? Is this managing genuine uncertainty, or fidgeting emotionally with a healthy position? What is the plan for the final runner — a trailing stop, a structural exit, or a target?"
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content: "Overcomplicating into a dozen tiny exits that become impossible to track and create excessive transaction friction. Planning a scale-out but then panic-dumping the entire remaining position at the first wobble — which abandons the plan at the worst moment. The partial exit was supposed to remove the urge to panic, not enable it."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: `Scaling out removes the pressure of one perfect exit — bank some, hold some, and stop trying to call the exact top.\n\n${DISCLAIMER}`
      }
    ],
    quiz: [
      {
        q: "What is the core benefit of scaling out rather than exiting all at once?",
        options: [
          "It always results in more total profit",
          "It removes the need for one perfect exit decision — some is banked early, some runs further",
          "It reduces the number of trades in a portfolio",
          "It is required for position sizes above a certain threshold"
        ],
        correct: 1,
        explanation: "Scaling out removes the burden of calling the exact top. Banking part of the position early locks in some gain; keeping the remainder allows participation in further movement. Either outcome is partially 'right.'"
      },
      {
        q: "What does a 'trailing stop' on a runner refer to?",
        options: [
          "A stop loss that moves to break even only once",
          "A stop that moves in the direction of the trade to protect accumulated gains as price moves further",
          "A stop placed below the all-time low of the stock",
          "A stop that trails the S&P 500 index"
        ],
        correct: 1,
        explanation: "A trailing stop moves in the direction of the profitable trade — locking in more gain as price advances. If price reverses enough to hit it, the runner is closed and the protected gains are realised. It allows participation while managing the remaining exposure."
      },
      {
        q: "What is the mistake of panic-dumping the full position at the first wobble after already taking partials?",
        options: [
          "It is the correct response to any adverse price movement",
          "It abandons the scale-out plan at the worst moment — the partial exit was supposed to provide emotional relief, not trigger a full exit",
          "It results in paying too much in taxes",
          "It converts the position to a day trade"
        ],
        correct: 1,
        explanation: "The partial exit is meant to reduce the emotional pressure — some gain is already secured. Using that partial to then panic-close the remaining position at the first dip defeats the purpose and abandons the plan at the worst moment."
      },
      {
        q: "Why should scale-out points be planned before the trade is opened?",
        options: [
          "Brokers require exit plans to be submitted in advance",
          "Planning in advance removes the need to make emotional decisions while the position is live and moving",
          "Pre-planned exits always occur at better prices",
          "It is only necessary for very large position sizes"
        ],
        correct: 1,
        explanation: "Like all exit planning, the value is in the timing: decisions made before a position is open are made calmly and objectively. Decisions made while the position is live — especially while it's moving favourably — are made under the influence of emotion and greed."
      }
    ],
    girlToGirlTip: "Since nobody can call the exact top, scaling out lets you stop trying. Take some, let some ride, and stop torturing yourself over the one perfect exit that doesn't exist. Being partly right every time beats being completely right never."
  },

  // ─── Lesson 8: Reviewing the Trade Afterwards ────────────────────────────────
  {
    module: "m8-exiting",
    slug: "trade-review",
    title: "Reviewing the Trade Afterwards",
    subtitle: "The trade isn't over when you exit — it's over when you've learned from it.",
    difficulty: "Beginner",
    readingMinutes: 5,
    videoSlot: null,
    diagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220"><rect width="400" height="220" fill="#0E1B30"/><text x="200" y="18" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#F4F7FA">Review Loop — Random Results → Real Skill</text><circle cx="200" cy="115" r="75" fill="none" stroke="#27B7C8" stroke-width="1.5" opacity="0.4"/><text x="200" y="50" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.8">Trade</text><text x="290" y="120" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.8">Exit</text><text x="200" y="190" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.8">Review</text><text x="110" y="120" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#F4F7FA" opacity="0.8">Improve</text><text x="200" y="120" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#49B06E">Journal</text><path d="M200,55 Q265,55 275,110" fill="none" stroke="#27B7C8" stroke-width="1.5" marker-end="url(#arr)" opacity="0.7"/><path d="M275,125 Q270,175 215,185" fill="none" stroke="#27B7C8" stroke-width="1.5" opacity="0.7"/><path d="M185,185 Q130,175 125,125" fill="none" stroke="#27B7C8" stroke-width="1.5" opacity="0.7"/><path d="M125,108 Q130,55 185,52" fill="none" stroke="#27B7C8" stroke-width="1.5" opacity="0.7"/><text x="200" y="210" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(244,247,250,0.4)">Every trade reviewed is a lesson — win or loss</text></svg>`,
    sections: [
      {
        type: "overview",
        heading: "The Idea",
        content: "The trade isn't over when you exit — it's over when you've learned from it. Reviewing each trade turns random outcomes into actual skill. Without review, patterns repeat forever; with it, every trade — win or loss — becomes a data point that makes the process better over time."
      },
      {
        type: "why-matters",
        heading: "Why It Matters",
        content: "A trading journal is where experience becomes improvement. Without honest review, a lucky win reinforces bad habits, and a well-managed loss feels like a failure. With honest review, the opposite becomes true: process is separated from outcome, and the learning is extracted from both."
      },
      {
        type: "how-identify",
        heading: "The Framework",
        content: "The questions that matter after a trade: Did I follow my plan, regardless of outcome? Was the outcome the result of process or luck? A losing trade with a great process is a good trade. A winning trade where the plan was abandoned entirely is a dangerous trade — it rewards the wrong behaviour. One thing to repeat, one thing to fix, every single time."
      },
      {
        type: "psychology",
        heading: "The Thinking Checklist",
        content: "Did I follow the plan I made before the trade? Was the result explained by process, or was it random? What is one specific thing that went well in the process? What is one specific thing to do differently next time?"
      },
      {
        type: "mistakes",
        heading: "Common Mistakes",
        content: "Only reviewing losers — winners hide mistakes too, especially when a plan was abandoned and luck saved the outcome. Judging trades solely by win or loss, not by the quality of the process. Never keeping a journal at all — meaning every lesson has to be re-learned from scratch."
      },
      {
        type: "takeaway",
        heading: "Key Takeaway",
        content: `Review every trade by process, not just outcome — that is how random results turn into real skill over time.\n\n${DISCLAIMER}`
      }
    ],
    quiz: [
      {
        q: "Why is a winning trade with a broken plan considered potentially dangerous?",
        options: [
          "Because winning trades always involve more risk",
          "Because it rewards bad habits — the win came despite the process, not because of it",
          "Because it creates a tax liability",
          "Because it overestimates position size"
        ],
        correct: 1,
        explanation: "A win that resulted from abandoning the plan can be worse than a loss in the long run — it reinforces the broken behaviour. 'It worked out' teaches the wrong lesson if the process was poor."
      },
      {
        q: "What does it mean to judge a trade by process rather than outcome?",
        options: [
          "Ignoring profit and loss entirely",
          "Evaluating whether the plan was followed correctly — separately from whether the trade made money",
          "Only reviewing trades that lasted more than five days",
          "Comparing the trade to an index benchmark"
        ],
        correct: 1,
        explanation: "Outcome and process are not the same thing. A well-executed plan can result in a loss because of random market movement; a poorly-executed plan can result in a win for the same reason. Judging by process — did I do what I planned? — is the only variable fully in control."
      },
      {
        q: "Why should winning trades also be reviewed, not just losing ones?",
        options: [
          "Only losing trades contain useful information",
          "Because winning trades sometimes involved broken plans — and luck-saved mistakes need to be identified too",
          "Because winners are always larger in size and need more documentation",
          "Regulators require review of profitable trades"
        ],
        correct: 1,
        explanation: "Winners can mask poor process just as effectively as losers reveal it. A win achieved by abandoning the plan and getting lucky teaches the wrong lesson if not identified. Both wins and losses need honest process review."
      },
      {
        q: "What is the stated purpose of keeping a trading journal?",
        options: [
          "To show other people your trading history",
          "To calculate exact tax obligations",
          "To turn experience into improvement by reviewing each trade honestly against the plan",
          "To track which broker provides the best execution"
        ],
        correct: 2,
        explanation: "A journal turns the raw experience of each trade into a lesson — extracting what went well in the process, what to change, and whether the outcome matched the quality of the thinking. Without this step, the same mistakes repeat indefinitely."
      }
    ],
    girlToGirlTip: "Judge yourself on whether you followed your plan, not just whether you made money. A disciplined loss is a win for your future, and a reckless win is a trap. Keep a journal — it's where you actually grow."
  },
];

export function getM8LessonBySlug(slug: string): UniversityLesson | undefined {
  return M8_LESSONS.find((l) => l.slug === slug);
}
