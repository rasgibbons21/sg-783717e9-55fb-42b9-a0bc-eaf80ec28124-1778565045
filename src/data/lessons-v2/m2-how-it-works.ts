import type { Lesson } from "./types";

export const M2_HOW_IT_WORKS: Lesson[] = [
  {
    slug: "lots-and-ounces",
    moduleId: "how-it-works",
    title: "Lots and ounces",
    subtitle: "How trade sizes work, in plain numbers.",
    minutes: 4,
    practiceHint: "In Practice, choose 0.01 lot of gold and notice it means 1 ounce.",
    blocks: [
      {
        type: "text",
        body: "Trades come in sizes called lots. For gold, one standard lot is usually 100 ounces, which is a very large trade.\n\nBeginners use much smaller sizes. The smallest many brokers offer is 0.01 lot, sometimes called a micro lot, which is 1 ounce of gold.",
      },
      {
        type: "slider",
        prompt: "Try different lot sizes and watch what each $1 move in gold means.",
        min: 0.01,
        max: 1,
        step: 0.01,
        initial: 0.01,
        unit: "lot",
        outcomeKey: "lotSize",
        note: "See how quickly it grows? The size you choose decides how much each price move matters. Small is a perfectly good place to start.",
      },
      {
        type: "quiz",
        q: "You trade 0.10 lot of gold, which is 10 ounces. Gold rises by $2. If you bought, what's your result before costs?",
        options: ["A $2 gain", "A $20 gain", "A $200 gain"],
        correct: 1,
        explanation: "That's it. 10 ounces multiplied by a $2 move is $20. If gold had fallen $2, it would be a $20 loss.",
      },
      {
        type: "pansy",
        body: "If you only remember one thing from this lesson, make it this: smaller trades give you more room to learn.",
      },
    ],
  },
  {
    slug: "how-leverage-works",
    moduleId: "how-it-works",
    title: "How leverage works",
    subtitle: "Why a small deposit can control a large trade, and why that cuts both ways.",
    minutes: 5,
    practiceHint: "In Practice, look at how much margin a small gold trade uses from your balance.",
    blocks: [
      {
        type: "text",
        body: "Leverage lets you control a larger trade with a smaller amount of your own money. That amount is called margin. Think of it as a deposit the broker holds while your trade is open.\n\nWith 20 to 1 leverage, $100 of margin controls $2,000 of gold. Your gains and your losses are based on the full $2,000, not the $100.",
      },
      {
        type: "slider",
        prompt: "Move the leverage and see what a small price fall would cost you.",
        min: 1,
        max: 100,
        step: 1,
        initial: 5,
        unit: "to 1",
        outcomeKey: "leverage",
        note: "At high leverage, even a small dip can use up your whole deposit. This is one of the main reasons beginners lose money, and why limits vary between countries.",
      },
      {
        type: "quiz",
        q: "What does higher leverage do?",
        options: [
          "It makes gains and losses bigger",
          "It only makes gains bigger",
          "It removes the risk of losing money",
        ],
        correct: 0,
        explanation: "Exactly. Leverage magnifies both directions. It never removes risk.",
      },
      {
        type: "scenario",
        prompt: "A broker offers very high leverage. You're new. What feels wisest?",
        choices: [
          {
            label: "Use all of it, so small moves make more money.",
            outcome: "Small moves against you would cost more too, and could close your trade quickly.",
            good: false,
          },
          {
            label: "Keep trades small, so leverage stays gentle.",
            outcome: "That's a wise instinct. What's on offer is only a limit. You decide how much you actually use.",
            good: true,
          },
        ],
      },
    ],
  },
  {
    slug: "the-costs-of-trading",
    moduleId: "how-it-works",
    title: "The costs of trading",
    subtitle: "Spreads, overnight fees and commissions.",
    minutes: 3,
    practiceHint: "In Practice, open and close a tiny trade and see how the spread affects the result.",
    blocks: [
      {
        type: "text",
        body: "Every trade has costs, and they're worth knowing before you begin.\n\nThe spread is the gap between the buy and sell price. You pay it on every trade.\n\nAn overnight fee, also called a swap, may apply if you hold a CFD past the daily cut-off.\n\nA commission is a set charge some account types add per trade, usually in exchange for a smaller spread.",
      },
      {
        type: "order",
        prompt: "Put these in order, from when each cost usually applies in a trade's life.",
        steps: [
          "You pay the spread when the trade opens",
          "An overnight fee may apply if you hold it past the cut-off",
          "You see your final result when you close the trade",
        ],
        explanation: "Lovely. Costs add up over a trade's life, which is one reason to check them before you start.",
      },
      {
        type: "quiz",
        q: "You plan to hold a gold CFD for two weeks. Which cost should you check?",
        options: ["Overnight fees", "Only the colour of the chart", "There are no costs on CFDs"],
        correct: 0,
        explanation: "Yes. Overnight fees can build up when you hold for a long time, so they're always worth checking.",
      },
    ],
  },
];
