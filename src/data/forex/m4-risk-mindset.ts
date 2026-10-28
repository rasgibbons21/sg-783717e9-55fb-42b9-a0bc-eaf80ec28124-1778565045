import type { ForexLesson } from "./types";

export const M4_RISK_MINDSET: ForexLesson[] = [
  {
    module: "risk-mindset",
    slug: "position-sizing",
    title: "Position Sizing — The Math That Protects Your Account",
    subtitle: "The single most important skill in risk management: how much to risk on each trade.",
    pansyIntro: "Position sizing isn't exciting. It doesn't make you feel clever. But it's the difference between traders who survive and those who blow up. Let me teach you the formula that professionals use every single day.",
    difficulty: "Intermediate",
    readingMinutes: 6,
    sections: [
      {
        heading: "The 1-2% Rule",
        content: "The most widely used risk management rule in trading: never risk more than 1-2% of your account on a single trade.\n\nIf you have a $5,000 account and use the 1% rule, your maximum risk per trade is $50. If you use the 2% rule, it's $100.\n\nWhy these numbers? Because even a string of 10 consecutive losses (which happens more often than you'd think) only draws your account down 10-18%. You survive, you learn, you recover. At 10% risk per trade, the same losing streak wipes out 65% of your account. Recovery from that hole is nearly impossible psychologically."
      },
      {
        heading: "The Position Sizing Formula",
        content: "Here's the formula to calculate your lot size for every trade:\n\nLot size = (Account × Risk%) / (Stop-loss in pips × Pip value)\n\nWorked example:\nAccount: $5,000\nRisk per trade: 1% = $50\nStop-loss: 30 pips\nPair: EUR/USD (pip value for 1 standard lot = $10)\n\nLot size = $50 / (30 × $10) = $50 / $300 = 0.167 standard lots\n\nRound down to 0.16 lots (or 1.6 mini lots, or 16 micro lots).\n\nIf your stop-loss is wider — say 60 pips — the position is smaller:\n$50 / (60 × $10) = $50 / $600 = 0.083 lots\n\nIf your stop is tighter — say 15 pips:\n$50 / (15 × $10) = $50 / $150 = 0.33 lots\n\nThe key insight: the stop-loss distance determines the position size, not the other way around. Set your stop first based on the chart, then calculate the lot size that keeps your risk at 1-2%."
      },
      {
        heading: "Why Most Beginners Get This Wrong",
        content: "Common mistakes:\n\nFixed lot sizing: Trading 0.1 lots on every trade regardless of stop-loss distance. If your stop varies from 20 to 80 pips, your risk varies from $20 to $80 — a 4× difference. That's inconsistent risk.\n\nChasing bigger positions: After a win, increasing size dramatically (\"I'm on a streak!\"). After a loss, sizing up to recover (\"revenge trading\"). Both lead to ruin.\n\nIgnoring the calculation: \"I'll just eyeball it.\" In forex, eyeballing risk management is how accounts disappear.\n\nThe formula keeps you consistent. Same percentage risk on every trade, regardless of pair, timeframe, or how you feel."
      },
      {
        heading: "Practical Tips",
        content: "Use a position size calculator. Most brokers have one built in, and there are free web tools. You enter your account size, risk percentage, stop-loss in pips, and the pair — it gives you the lot size.\n\nAlways round down, not up. If the calculator says 0.167 lots, trade 0.16 or 0.15, not 0.17.\n\nConsider your total open risk. If you have three trades open, each risking 1%, your total risk is 3%. Some traders cap total open risk at 5-6%.\n\nAdjust for correlation. Two trades on EUR/USD and GBP/USD that are both betting on dollar weakness are effectively doubling your exposure. Count them as higher combined risk."
      }
    ],
    keyTakeaways: [
      "Never risk more than 1-2% of your account on any single trade.",
      "Lot size = (Account × Risk%) / (Stop-loss pips × Pip value) — memorize this formula.",
      "Set the stop-loss based on the chart first, then calculate position size to match your risk limit.",
      "Cap total open risk across all trades at 5-6%."
    ],
    quiz: [
      {
        q: "You have a $10,000 account and want to risk 1% per trade. Your stop-loss is 40 pips on EUR/USD. What lot size should you use?",
        options: [
          "1.0 standard lots",
          "0.25 standard lots",
          "0.50 standard lots",
          "0.10 standard lots"
        ],
        correct: 1,
        explanation: "Risk amount = $10,000 × 1% = $100. Lot size = $100 / (40 pips × $10 per pip) = $100 / $400 = 0.25 standard lots."
      },
      {
        q: "Why should you set the stop-loss before calculating the position size?",
        options: [
          "Because the broker requires it",
          "Because the stop-loss should be based on chart structure, and the position size adjusts to keep risk within your limit",
          "Because you can't change the stop-loss after placing the order",
          "Because wider stops always mean more profit"
        ],
        correct: 1,
        explanation: "Your stop-loss should be placed at a technically meaningful level (below support, beyond a pattern boundary, etc.). Then you calculate the lot size that keeps your dollar risk at 1-2%. Fitting the stop to the position size means you might place it at a meaningless level."
      },
      {
        q: "You have three open trades, each risking 2% of your account. What is your total open risk?",
        options: [
          "2% — it doesn't compound",
          "6% — and you should consider whether adding more trades is wise",
          "8% — because risk multiplies, not adds",
          "0% — because the trades offset each other"
        ],
        correct: 1,
        explanation: "Total open risk is additive: 3 trades × 2% = 6%. Many risk management frameworks suggest capping total open risk at 5-6%, so you'd want to be careful about adding a fourth trade."
      }
    ],
    brokerContext: ["risk-management", "position-sizing"],
    seoKeywords: ["forex position sizing", "how to calculate lot size", "1 percent rule trading"],
  },

  {
    module: "risk-mindset",
    slug: "risk-reward-ratio",
    title: "Risk-Reward Ratio — The Edge That Adds Up",
    subtitle: "Why a 1:2 risk/reward ratio means you can be wrong half the time and still profit.",
    pansyIntro: "Here's a truth that surprises most beginners: you don't need to be right on most of your trades to make money. You just need your winners to be bigger than your losers. That's what risk-reward ratio is all about.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        heading: "What Is Risk-Reward Ratio?",
        content: "The risk-reward ratio (R:R) compares how much you stand to lose against how much you stand to gain on a single trade.\n\nIf your stop-loss is 30 pips and your take-profit is 60 pips, your R:R is 1:2 (risking 1 to gain 2).\nIf your stop is 30 pips and your target is 90 pips, your R:R is 1:3.\n\nMany professional traders refuse to take any trade below 1:2. Some require 1:3 or better."
      },
      {
        heading: "The Math Behind Profitability",
        content: "At 1:2 risk-reward, you need a win rate of only 33.4% to break even. Even if you're wrong on two out of every three trades, you don't lose money.\n\nLet's prove it with 10 trades, each risking $100:\n\nScenario A (1:1 R:R, 50% win rate): 5 wins × $100 = $500. 5 losses × $100 = $500. Net = $0. Breakeven.\n\nScenario B (1:2 R:R, 50% win rate): 5 wins × $200 = $1,000. 5 losses × $100 = $500. Net = +$500.\n\nScenario C (1:2 R:R, 40% win rate): 4 wins × $200 = $800. 6 losses × $100 = $600. Net = +$200. Profitable even with more losses than wins.\n\nThis is the mathematical edge. Combined with consistent position sizing, it's what makes trading sustainable."
      },
      {
        heading: "How to Set Realistic Targets",
        content: "Your risk-reward ratio only works if your target is realistic — the price actually needs to be able to reach it.\n\nUse the chart, not wishful thinking:\n\nIdentify the next significant resistance level (for buy trades) or support level (for sell trades). That's your realistic target.\n\nIf the next resistance is only 15 pips above your entry and your stop is 30 pips, the R:R is 1:0.5 — not worth taking. Skip the trade.\n\nUse ATR to gauge whether your target is reasonable for the pair's typical daily range.\n\nThe best trades have a natural target at least 2× the stop distance, with open space for the price to travel (no major levels blocking the path)."
      },
      {
        heading: "Tracking Your R-Multiples",
        content: "Express all your results in terms of R (your risk per trade):\n\nA trade that gains twice your risk = +2R.\nA trade that hits your stop-loss = -1R.\nA trade you close early at half your target = +1R.\n\nOver time, your total R-multiple tells you your actual trading edge. If after 50 trades your total is +15R, you have a positive expectancy. If it's -10R, something needs to change.\n\nTracking in R-multiples removes the dollar amounts and makes performance comparable across different account sizes, risk levels, and pairs."
      }
    ],
    keyTakeaways: [
      "Risk-reward compares your potential loss to your potential gain on each trade.",
      "At 1:2 R:R, you only need a 33.4% win rate to break even.",
      "Only take trades where the chart shows a realistic path to at least 2× your stop distance.",
      "Track results in R-multiples to measure your actual trading edge."
    ],
    quiz: [
      {
        q: "Over 20 trades with a 1:3 risk-reward ratio, you win 8 and lose 12. Each trade risks $50. What is your net profit or loss?",
        options: [
          "-$200 loss",
          "$0 breakeven",
          "+$600 profit",
          "+$200 profit"
        ],
        correct: 2,
        explanation: "Wins: 8 × ($50 × 3) = 8 × $150 = $1,200. Losses: 12 × $50 = $600. Net = $1,200 - $600 = +$600 profit. Even with a 40% win rate, the 1:3 R:R creates a significant edge."
      },
      {
        q: "Your analysis shows a buy entry at 1.0850, the next resistance at 1.0870, and you'd need a stop-loss at 1.0820. Should you take this trade?",
        options: [
          "Yes — any trade with a stop-loss is fine",
          "No — the R:R is 1:0.67 (20 pips target / 30 pips risk), which is below the 1:2 minimum",
          "Yes — 20 pips of profit is always worthwhile",
          "It depends on the time of day"
        ],
        correct: 1,
        explanation: "Risk = 1.0850 - 1.0820 = 30 pips. Reward = 1.0870 - 1.0850 = 20 pips. R:R = 20:30 = 1:0.67. This means you're risking more than you could gain, which is below the recommended 1:2 minimum. Skip this trade and wait for a better setup."
      },
      {
        q: "What does it mean if your trading results over 50 trades total +8R?",
        options: [
          "You've made 8 trades total",
          "You have a positive expectancy — your system produces a net gain over time",
          "You've risked 8% of your account",
          "You've been trading for 8 months"
        ],
        correct: 1,
        explanation: "A total of +8R over 50 trades means your combined profits exceed your combined losses by 8 units of risk. This indicates positive expectancy — your strategy has an edge over a meaningful sample size."
      }
    ],
    brokerContext: ["risk-management"],
    seoKeywords: ["risk reward ratio forex", "forex risk management", "trading expectancy"],
  },

  {
    module: "risk-mindset",
    slug: "building-a-trading-plan",
    title: "Building a Trading Plan",
    subtitle: "A plan replaces impulse with process — and process is what keeps you in the game.",
    pansyIntro: "Trading without a plan is gambling with extra steps. A trading plan is your personal rulebook — it tells you what to trade, when, how much, and what to do when things go wrong. Let's build one.",
    difficulty: "Intermediate",
    readingMinutes: 6,
    sections: [
      {
        heading: "Why You Need a Plan",
        content: "In the heat of a live market, your emotions will make terrible decisions. Fear will close winners too early. Greed will hold losers too long. Excitement will push you into trades that don't meet your criteria.\n\nA trading plan is a set of rules written in advance, when you're calm and rational. When the market is open, you follow the plan — not your feelings. If a trade doesn't meet the plan's criteria, you don't take it. Period.\n\nEvery professional trader has a plan. The specific rules vary, but the discipline of having and following rules does not."
      },
      {
        heading: "What to Include",
        content: "Your trading plan should cover:\n\n1. Markets: Which pairs will you trade? Start with 2-3 major pairs you've studied. Don't scatter your attention across 20 pairs.\n\n2. Sessions: Which trading sessions will you be active during? Align with your schedule and your pairs.\n\n3. Strategy: What specific setups are you looking for? Define them precisely. Example: \"Bullish engulfing candle at H4 support with RSI below 40\" — not \"buy when it looks good.\"\n\n4. Entry rules: What conditions must all be true before you enter? Be specific.\n\n5. Exit rules: Where is your stop-loss? Where is your take-profit? What's your minimum R:R ratio?\n\n6. Position sizing: What percentage of your account will you risk per trade?\n\n7. Maximum daily/weekly loss: At what point do you stop trading and walk away? A common rule: stop trading for the day after 2-3 consecutive losses."
      },
      {
        heading: "An Example Plan",
        content: "Here's a simplified but complete plan:\n\nPairs: EUR/USD, GBP/USD\nSession: London and London/New York overlap (08:00-17:00 UTC)\nTimeframe: H4 for direction, H1 for entries\nSetup: Price at H4 support/resistance with a reversal candlestick pattern (hammer, engulfing, or morning star)\nEntry: On the next H1 candle after the H4 pattern completes\nStop-loss: Beyond the pattern's wick (opposite side of the reversal candle)\nTake-profit: Next significant S/R level, minimum 1:2 R:R\nRisk per trade: 1% of account\nMaximum daily loss: 3% (stop trading after 3 losses in a day)\nMaximum weekly loss: 6% (reduce position size if hit; stop trading for the week if hit twice)\n\nThis plan is specific, measurable, and auditable. You can look at any trade and ask: 'Did it meet every condition?' If yes, it was a valid trade regardless of the outcome."
      },
      {
        heading: "Following the Plan",
        content: "The hardest part isn't writing the plan — it's following it.\n\nKeep a trading journal. Log every trade: entry, exit, lot size, R:R, whether it met the plan's criteria, and what you were feeling. Review weekly.\n\nRate your discipline, not your results. A trade that followed the plan but lost money is a good trade. A trade that broke the plan but made money is a bad trade — you got lucky, and luck runs out.\n\nReview and refine. After 50+ trades, look at the data. Are your entries too early? Are your stops too tight? Is one pair underperforming? Adjust the plan based on evidence, not feelings."
      }
    ],
    keyTakeaways: [
      "A trading plan eliminates emotional decision-making during live markets.",
      "Define specific pairs, sessions, setups, entry/exit rules, position sizing, and maximum loss limits.",
      "Judge yourself on discipline (following the plan), not on individual trade outcomes.",
      "Review after 50+ trades and refine based on data, not feelings."
    ],
    quiz: [
      {
        q: "You see a trade setup that doesn't match your plan's criteria, but your gut says it will work. What should you do?",
        options: [
          "Take it — intuition is important in trading",
          "Take it but with a smaller position",
          "Skip it — a trade that doesn't meet the plan's criteria is not a valid trade",
          "Take it and update the plan if it works"
        ],
        correct: 2,
        explanation: "Your plan exists to override emotional impulses. Taking trades outside your plan criteria, regardless of how they feel, is undisciplined trading. If you consistently see a profitable setup your plan doesn't cover, add it to the plan during your review — not in the heat of the moment."
      },
      {
        q: "A trade followed your plan perfectly but resulted in a loss. Was it a good trade?",
        options: [
          "No — a loss is always a bad trade",
          "Yes — a trade that followed the plan is a good trade regardless of the outcome",
          "It depends on how much you lost",
          "Only if it was your first loss of the day"
        ],
        correct: 1,
        explanation: "In trading, you judge the process, not the individual outcome. Losses are inevitable even with a winning strategy. A plan-compliant trade that loses is a good trade — you followed your edge. Over many trades, discipline produces positive results."
      },
      {
        q: "Why should you limit the number of pairs you actively trade?",
        options: [
          "Because brokers charge more for additional pairs",
          "Because trading many pairs scatters your attention and makes it harder to develop expertise in any of them",
          "Because only major pairs are profitable",
          "Because your platform can only display three charts at once"
        ],
        correct: 1,
        explanation: "Each pair has its own personality — typical volatility, key levels, session behavior. By focusing on 2-3 pairs, you develop deep familiarity with how they move, making it easier to spot high-quality setups and avoid traps."
      }
    ],
    brokerContext: ["risk-management", "trading-plan"],
    seoKeywords: ["forex trading plan", "how to build a trading plan", "trading journal forex"],
  },

  {
    module: "risk-mindset",
    slug: "trading-psychology",
    title: "Trading Psychology — Your Biggest Opponent Is You",
    subtitle: "Fear, greed, revenge, overconfidence — and how to handle each one.",
    pansyIntro: "The market doesn't know you exist. It doesn't care about your mortgage, your ego, or your last trade. The only enemy is the one in the mirror. Let me walk you through the psychological traps and how to escape them.",
    difficulty: "Intermediate",
    readingMinutes: 6,
    sections: [
      {
        heading: "The Four Emotional Traps",
        content: "Fear: Manifests as hesitation (not entering valid trades), premature exits (closing winners early), or paralysis after a losing streak.\n\nGreed: Manifests as oversizing positions (\"this one's a sure thing\"), moving take-profits further away mid-trade (\"let it run!\"), or skipping the stop-loss (\"it'll come back\").\n\nRevenge trading: After a loss, immediately jumping into another trade to \"get it back\" — usually with larger size, less analysis, and worse judgment.\n\nOverconfidence: After a winning streak, feeling invincible. Increasing size, breaking rules, taking marginal setups. The market will humble you."
      },
      {
        heading: "Loss Aversion and Disposition Effect",
        content: "Humans feel losses about 2× more intensely than gains of the same size. A $100 loss hurts more than a $100 gain feels good. This is hardwired — and it's devastating for traders.\n\nThe result is the disposition effect: cutting winners short (locking in the pleasure of a gain before it disappears) while holding losers too long (avoiding the pain of admitting you were wrong).\n\nThis is the exact opposite of what profitable trading requires. You need to let winners run to their target and cut losers quickly at your stop. Knowing about the bias is the first step to overriding it."
      },
      {
        heading: "Practical Psychology Tools",
        content: "Process over outcome: After every trade, ask \"Did I follow my plan?\" not \"Did I make money?\" Grade yourself on discipline (A-F). If you consistently get A's, the money follows.\n\nPre-trade checklist: Before every trade, go through a physical checklist. Does this setup match your plan criteria? Is your position size correct? Is your stop-loss in place? A checklist interrupts emotional autopilot.\n\nMaximum daily loss rule: When you lose a set amount (2-3 consecutive losses, or 3% of your account), close the platform and walk away. Tomorrow is another day. The market will still be there.\n\nPhysical state: Tired, hungry, stressed, or distracted traders make bad decisions. Don't trade when impaired — treat it like operating heavy machinery, because in a way, you are."
      },
      {
        heading: "The Long Game",
        content: "Trading is a marathon, not a sprint. The traders who survive are the ones who:\n\nAccept that losses are part of the game. A 50% win rate with good R:R is profitable. Losses are not failures — they're a line item.\n\nFocus on monthly and quarterly results, not individual trades. One bad day doesn't define your performance.\n\nTake breaks. Step away from the screens. A clear mind makes better decisions than a fried one.\n\nNever risk money they can't afford to lose. If the money you're trading with keeps you awake at night, it's too much. Reduce size until you can execute without emotional distortion."
      }
    ],
    keyTakeaways: [
      "Fear, greed, revenge trading, and overconfidence are the four biggest psychological threats.",
      "Loss aversion causes traders to cut winners early and hold losers too long — the opposite of what works.",
      "Use a pre-trade checklist and maximum daily loss rule to interrupt emotional decision-making.",
      "Focus on monthly results, not individual trades — and never trade money you can't afford to lose."
    ],
    quiz: [
      {
        q: "You've just had two consecutive losing trades. You see a setup that sort of matches your plan but isn't perfect. What's happening if you take it?",
        options: [
          "Disciplined trading — any reasonable setup is worth trying",
          "Revenge trading — you're trying to recover losses rather than waiting for a setup that fully meets your criteria",
          "Smart risk management — getting back on the horse quickly",
          "Normal behavior — two losses in a row is nothing"
        ],
        correct: 1,
        explanation: "Taking a marginal setup after consecutive losses is a classic sign of revenge trading. The emotional urge to 'get it back' overrides your plan criteria. The correct action is to step away if you've hit your daily loss limit, or wait patiently for a setup that fully meets your rules."
      },
      {
        q: "Your trade is up 50 pips toward a 60-pip target, but you feel nervous and want to close it now. What psychological bias is at work?",
        options: [
          "Overconfidence bias",
          "The disposition effect — you want to lock in the gain before it can disappear",
          "Anchoring bias",
          "The gambler's fallacy"
        ],
        correct: 1,
        explanation: "The disposition effect — driven by loss aversion — makes us want to lock in gains early (the pleasure of winning) and avoid realizing losses (the pain of being wrong). Your plan set a 60-pip target for a reason. Trust it."
      },
      {
        q: "Why should you grade yourself on discipline rather than profit after each trade?",
        options: [
          "Because profit doesn't matter in trading",
          "Because any single trade is random — discipline over many trades is what produces positive results",
          "Because it's easier to track",
          "Because profitable trades are always disciplined"
        ],
        correct: 1,
        explanation: "Individual trade outcomes have a large random component. A plan-breaking trade can profit (luck), and a disciplined trade can lose (normal variance). But consistent discipline over hundreds of trades produces a positive edge. The process is what you control; the outcome is what follows."
      }
    ],
    brokerContext: ["psychology", "risk-management"],
    seoKeywords: ["trading psychology", "forex mindset", "revenge trading how to stop"],
  },

  {
    module: "risk-mindset",
    slug: "common-mistakes",
    title: "The 10 Most Common Beginner Mistakes",
    subtitle: "Every one of these will cost you money. Learn them here instead of the hard way.",
    pansyIntro: "I've watched thousands of new traders make the same mistakes. Every single one of these is avoidable — if you know to watch for them. Consider this your early-warning system.",
    difficulty: "Intermediate",
    readingMinutes: 6,
    sections: [
      {
        heading: "Mistakes 1-3: Risk Management Failures",
        content: "1. Trading without a stop-loss. The single fastest way to destroy an account. \"I'll watch it\" doesn't work when the market gaps through your mental stop.\n\n2. Risking too much per trade. Risking 10% or more on a single trade means a short losing streak (which is statistically inevitable) will cripple your account. Stick to 1-2%.\n\n3. Using maximum leverage. Just because you can use 500:1 leverage doesn't mean you should. High leverage makes you a precision target for normal market noise. Most blown accounts are leverage-related."
      },
      {
        heading: "Mistakes 4-6: Strategy Failures",
        content: "4. Overtrading. Taking 20 trades a day because you feel like you should be doing something. Quality matters more than quantity. Some of the best trading days involve zero trades because no valid setups appeared.\n\n5. Chasing the market. Jumping into a trade because the price has already moved without you. The entry you missed is gone — wait for the next setup at a better level.\n\n6. Strategy hopping. After three losses, switching to a completely different strategy. No strategy wins every trade. Give your approach at least 50 trades before evaluating it."
      },
      {
        heading: "Mistakes 7-8: Knowledge Failures",
        content: "7. Trading news events unprepared. A high-impact release can move a pair 100+ pips in seconds. If you're not specifically set up to trade news (with wide stops and small positions), close your trades before the release or avoid trading during it.\n\n8. Ignoring correlation. Being long on EUR/USD and GBP/USD simultaneously is not diversification — both trades are bets against the dollar. If the dollar strengthens, both lose. Understand how your positions relate to each other."
      },
      {
        heading: "Mistakes 9-10: Mindset Failures",
        content: "9. Skipping the demo phase. Going straight to live money because demos \"aren't real.\" Demos teach you the platform, your strategy, and whether you can actually execute under market conditions. Skip it and you'll pay tuition in real losses instead.\n\n10. Expecting quick riches. Forex is not a get-rich-quick scheme. Professional fund managers target 10-20% annual returns. If someone promises you 50% per month, they're either lying or taking catastrophic risk. Set realistic expectations: if you can grow your account 2-5% per month while learning, that's genuinely excellent performance."
      },
      {
        heading: "The Meta-Mistake",
        content: "The biggest mistake of all: knowing these mistakes and thinking \"that won't happen to me.\" Every new trader thinks they're the exception. They're not.\n\nProtect yourself with systems, not willpower. Stop-losses, position sizing calculators, trading plans, daily loss limits, and physical checklists work because they don't rely on you being calm, rational, and disciplined in the moment. Build the systems, then let the systems protect you."
      }
    ],
    keyTakeaways: [
      "Always use a stop-loss, limit risk to 1-2% per trade, and avoid maximum leverage.",
      "Quality over quantity — overtrade less, chase less, and give strategies time to work.",
      "Demo trade for 2-4 weeks minimum before risking real money.",
      "Build systems (checklists, calculators, daily limits) that protect you when emotions can't."
    ],
    quiz: [
      {
        q: "After three consecutive losses with your current strategy, what should you do?",
        options: [
          "Switch to a completely different strategy immediately",
          "Double your position size to recover faster",
          "Follow your plan's daily loss rule (likely stop trading for the day) and evaluate the strategy after 50+ trades, not 3",
          "Remove your stop-losses to give trades more room"
        ],
        correct: 2,
        explanation: "Three losses in a row is normal variance, not proof your strategy is broken. Follow your daily loss limit, step away, and continue with the same strategy tomorrow. Evaluate only after a meaningful sample size (50+ trades)."
      },
      {
        q: "EUR/USD has just spiked 80 pips in 10 minutes and you didn't catch the move. What should you do?",
        options: [
          "Jump in immediately before you miss more of the move",
          "Wait — the entry is gone, and chasing an extended move increases your risk of entering at the worst possible price",
          "Short it because it has to come back down",
          "Switch to a different pair"
        ],
        correct: 1,
        explanation: "Chasing a market after a sharp move means entering at an extended price with a poor risk-reward ratio. The smart approach is to wait for the market to settle and offer a new setup at a better level. There will always be another trade."
      },
      {
        q: "Why is being long EUR/USD and long GBP/USD simultaneously risky?",
        options: [
          "Because you can't hold two positions at once",
          "Because both trades are essentially bets against the US dollar — you're doubling your exposure to a single move",
          "Because brokers charge double the spread for correlated positions",
          "Because EUR and GBP always move in opposite directions"
        ],
        correct: 1,
        explanation: "EUR/USD and GBP/USD are positively correlated — both gain when the USD weakens and lose when it strengthens. Holding both long means if the dollar rallies, you lose on both positions. You've concentrated risk rather than diversified."
      }
    ],
    brokerContext: ["risk-management", "beginner-mistakes"],
    seoKeywords: ["forex trading mistakes", "common forex mistakes beginners", "how to avoid blowing forex account"],
  },

  {
    module: "risk-mindset",
    slug: "demo-to-live",
    title: "Going from Demo to Live — The Transition Plan",
    subtitle: "When you're ready, how to make the switch without losing your shirt.",
    pansyIntro: "You've learned the concepts, practiced on demo, and built a plan. Now comes the real test: live money. This transition is where many traders unravel. Let me give you a roadmap that keeps you safe.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        heading: "When Are You Ready?",
        content: "You're ready to consider live trading when:\n\nYou've demo traded for at least 2-4 weeks (longer is better).\nYou have a written trading plan that you've followed consistently.\nYou've been profitable or breakeven on demo over a meaningful number of trades (30-50+).\nYou can execute your plan without hesitation or second-guessing.\nYou understand position sizing, risk/reward, and leverage — and you use them on every trade.\n\nYou're NOT ready if: you're still changing strategies weekly, you skip stop-losses on demo, or you can't explain why you entered your last five trades."
      },
      {
        heading: "Start Micro",
        content: "Don't go from demo to a fully funded standard account. Start with the smallest possible live account:\n\nOption A: Open a micro or cent account with $100-$500. Trade micro lots (0.01). Your risk per trade might be $1-5. The point isn't to make money — it's to experience real emotions (the fear of losing real money) while keeping the stakes trivially low.\n\nOption B: Some brokers let you trade nano lots (0.001). Even smaller risk.\n\nThe gap between demo and live is emotional, not technical. Real money changes everything. A $5 loss on demo feels like nothing. A $5 loss of real money activates loss aversion, fear, and all the psychological traps. Better to experience this with $5 than $500."
      },
      {
        heading: "The Scaling Plan",
        content: "Once you're comfortable and consistently following your plan with micro lots, scale up gradually:\n\nPhase 1 (Month 1-2): Micro lots with $100-500. Goal: follow the plan on every trade. Measure discipline, not profit.\n\nPhase 2 (Month 3-4): If consistently disciplined and breakeven or profitable, increase to mini lots or increase your account size. Risk stays at 1%.\n\nPhase 3 (Month 5+): Continue scaling only if results and discipline justify it. If you hit a rough patch, scale back down. There's no shame in reducing size — it's smart risk management.\n\nNever increase size after a winning streak (overconfidence) or to recover from a losing streak (revenge). Scale based on consistent, plan-compliant results over at least 30 trades at the current level."
      },
      {
        heading: "Protect Yourself",
        content: "Only trade money you can genuinely afford to lose. If losing your entire trading account would affect your ability to pay rent, eat, or cover emergencies, the amount is too much.\n\nSeparate your trading account from your living expenses. Don't dip into savings, retirement, or emergency funds.\n\nSet a maximum loss for your learning period. \"I'm willing to lose up to $X while I learn. If I lose $X, I'll stop, review everything, and decide whether to continue.\" Having a predefined exit prevents the slow bleed of chasing losses.\n\nRemember: the goal of the first year isn't to get rich. It's to survive, learn, and develop a repeatable process. If you end your first year with your account intact and a proven plan, you've outperformed the vast majority of new traders."
      }
    ],
    keyTakeaways: [
      "Transition to live only after consistent demo performance over 30-50+ trades.",
      "Start with micro or cent accounts ($100-500) to experience real emotions at trivially low stakes.",
      "Scale up gradually based on consistent discipline, never after winning or losing streaks.",
      "Only trade money you can genuinely afford to lose — and set a maximum learning-period loss."
    ],
    quiz: [
      {
        q: "Why start with a micro account instead of immediately funding a standard account?",
        options: [
          "Because micro accounts have better spreads",
          "Because the emotional transition from demo to live money is significant — micro stakes let you experience real emotions while limiting financial exposure",
          "Because standard accounts require a license",
          "Because micro accounts are more profitable per pip"
        ],
        correct: 1,
        explanation: "The jump from demo to live isn't about skill — it's about psychology. Real money activates fear, greed, and loss aversion that demo trading doesn't. Micro accounts let you acclimate to these emotions while keeping the financial stakes small enough to survive mistakes."
      },
      {
        q: "You've had a great week — five winning trades in a row on your micro account. Should you immediately upgrade to a standard account?",
        options: [
          "Yes — you're clearly ready for the next level",
          "No — scaling up should be based on consistent performance over 30+ trades, not a short winning streak",
          "Yes — but only if you double your position size too",
          "It doesn't matter — the account size doesn't affect trading"
        ],
        correct: 1,
        explanation: "A 5-trade winning streak could be skill or it could be luck — the sample size is too small to tell. Scale up only after demonstrating consistent, plan-compliant results over at least 30 trades. Scaling on a short streak often coincides with overconfidence."
      },
      {
        q: "What is the most realistic goal for your first year of live forex trading?",
        options: [
          "Double your account in the first month",
          "Replace your full-time income within six months",
          "Survive, learn, develop a repeatable process, and end the year with your account intact",
          "Achieve a 100% win rate"
        ],
        correct: 2,
        explanation: "The first year is about education and survival, not profit. If you end year one with your account intact, a tested plan, and a growing understanding of the market, you've outperformed the vast majority of retail traders. Unrealistic profit expectations lead to excessive risk-taking."
      }
    ],
    brokerContext: ["demo-account", "getting-started"],
    seoKeywords: ["forex demo to live", "when to start live trading", "beginner forex account"],
  },

  {
    module: "risk-mindset",
    slug: "forex-scams",
    title: "Spotting Forex Scams and Protecting Your Money",
    subtitle: "The forex industry attracts fraudsters. Here's how to protect yourself.",
    pansyIntro: "For every legitimate forex educator and broker, there's someone trying to separate you from your money. Scams in this industry are rampant — but they all follow predictable patterns. Once you know the patterns, they're easy to spot.",
    difficulty: "Intermediate",
    readingMinutes: 5,
    sections: [
      {
        heading: "Signal Seller Scams",
        content: "A \"signal seller\" charges you a monthly fee to tell you when to buy and sell. Some are legitimate, but the majority are scams. Red flags:\n\nGuaranteed profits or specific return promises (\"Make 500 pips per month guaranteed!\"). Nobody can guarantee trading returns.\n\nFake track records. Screenshots of winning trades are trivially easy to fabricate. Ask for independently verified (by a third-party auditor) track records — most can't provide them.\n\nPressure tactics. \"Only 5 spots left!\" or \"Price goes up at midnight!\" Legitimate services don't need urgency manipulation.\n\nThe question to ask: if they can consistently generate 500 pips per month, why do they need your $99/month subscription? The math doesn't add up."
      },
      {
        heading: "Managed Account and PAMM Scams",
        content: "\"Give us your money and we'll trade it for you\" — also known as managed accounts or PAMM (Percentage Allocation Management Module).\n\nLegitimate managed accounts exist, but the scam version:\n\nTakes your deposit, trades recklessly (or doesn't trade at all), and eventually vanishes.\nShows you fake profit reports until you deposit more.\nMakes withdrawal increasingly difficult as time goes on.\n\nProtection: Only use managed accounts through regulated brokers with verifiable track records. Never send money directly to an individual. If the \"fund manager\" found you on Instagram or Telegram, it's almost certainly a scam."
      },
      {
        heading: "Fake Broker and Clone Scams",
        content: "Clone firms create websites that look identical to legitimate brokers, using the same logos, colors, and even regulatory license numbers.\n\nYou deposit money, see fake profits on a fake platform, and when you try to withdraw — nothing. Or they ask for a \"withdrawal fee\" or \"tax payment\" before releasing funds. This is always a scam.\n\nProtection:\n\nType the broker's URL directly — don't click links from emails, ads, or social media.\nVerify the license on the regulator's website.\nCheck that the contact details on the regulator's register match the ones on the website you're using.\nNever pay an upfront fee to withdraw your own money."
      },
      {
        heading: "Education Scams",
        content: "Some \"educators\" charge thousands of dollars for courses that contain information freely available online. Red flags:\n\nFlashing expensive cars, watches, and lifestyles on social media — this is marketing, not evidence of trading skill.\nVague credentials. \"Full-time trader for 10 years\" with no verifiable track record or institutional background.\nProhibiting negative reviews or independent discussion of the course.\nClaiming a \"secret\" strategy that nobody else knows.\n\nThere are no secrets in trading. The principles are well-known (risk management, technical analysis, discipline). What matters is consistent execution — and that can't be bought in a $5,000 course."
      },
      {
        heading: "Your Protection Checklist",
        content: "Before giving anyone money in the forex space:\n\n1. Is the broker or service regulated by a top-tier authority? Verify independently.\n2. Can they provide independently audited, verified results? Screenshots are not proof.\n3. Are they promising guaranteed returns? If yes, it's a scam.\n4. Are they pressuring you to act quickly? Legitimate services don't use artificial urgency.\n5. Can you find independent, uncontrolled reviews? Check forex forums and consumer complaint sites.\n6. Does the math make sense? If they can \"guarantee\" 50% monthly returns, why do they need your money?\n\nWhen in doubt, walk away. There will always be another opportunity — but money lost to a scam doesn't come back."
      }
    ],
    keyTakeaways: [
      "Nobody can guarantee trading returns — this is the single biggest red flag.",
      "Verify any broker's regulation on the regulator's website, not the broker's.",
      "Fake profit screenshots are trivially easy to create — demand independently audited results.",
      "If the math doesn't add up (why do they need your subscription if they're so profitable?), walk away."
    ],
    quiz: [
      {
        q: "A signal service on Instagram promises \"500 pips per month, guaranteed\" for $99/month. What should you do?",
        options: [
          "Sign up — 500 pips for $99 is a great deal",
          "Sign up but start with one month to test it",
          "Avoid it — guaranteed return promises are the number one red flag for forex scams",
          "Sign up and verify by checking if the first month's signals are profitable"
        ],
        correct: 2,
        explanation: "No legitimate service can guarantee specific returns. This promise is a red flag for a scam. Even the best traders have losing months. If they could consistently generate 500 pips, they'd be managing institutional money, not selling $99 subscriptions on Instagram."
      },
      {
        q: "You want to deposit money with a broker you found through a social media ad. The website looks professional and shows an FCA license number. What should you verify?",
        options: [
          "Nothing — a professional website with a license number is sufficient",
          "Check the license number on the FCA's own website and verify the contact details match the broker's website",
          "Call the phone number on the broker's website to confirm",
          "Check if the website has a padlock icon (HTTPS)"
        ],
        correct: 1,
        explanation: "Clone firms copy legitimate brokers' license numbers onto fake websites. You must verify the license number on the FCA's official register (register.fca.org.uk) and confirm that the contact details, website URL, and company details listed by the FCA match the site you're using."
      },
      {
        q: "An online forex educator posts videos with luxury cars and expensive travel, claiming they made it all from trading. What should you look for?",
        options: [
          "Nothing — the lifestyle proves they're successful",
          "A verified, independently audited trading track record — lifestyle displays are marketing, not evidence of trading ability",
          "More videos to see if the cars are consistently shown",
          "How many followers they have"
        ],
        correct: 1,
        explanation: "Luxury lifestyle displays are marketing tactics, not proof of trading skill. Cars can be rented, and social media is curated. Ask for independently verified, audited trading results. Most lifestyle marketers can't provide them because their real income comes from selling courses, not from trading."
      }
    ],
    brokerContext: ["scam-awareness", "broker-choice"],
    seoKeywords: ["forex scams to avoid", "how to spot forex scams", "is forex trading legitimate"],
  },
];
