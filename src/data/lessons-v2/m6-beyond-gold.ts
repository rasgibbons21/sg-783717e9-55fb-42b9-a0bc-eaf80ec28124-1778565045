import type { Lesson } from "./types";

export const M6_BEYOND_GOLD: Lesson[] = [
  {
    slug: "major-forex-pairs",
    moduleId: "beyond-gold",
    title: "Major forex pairs",
    subtitle: "How currencies are traded, starting with EUR/USD.",
    minutes: 5,
    practiceHint: "In Practice, switch to EURUSD and compare how its price moves with gold's.",
    blocks: [
      {
        type: "text",
        body: "Forex means foreign exchange, the swapping of one currency for another. Currencies are always shown in pairs, because you're comparing two of them.\n\nIn EUR/USD at 1.0850, one euro costs about 1.09 dollars. If the price goes up, the euro has strengthened against the dollar.\n\nThe major pairs include EUR/USD, GBP/USD and USD/JPY. They're widely traded, and their spreads are often small.",
      },
      {
        type: "quiz",
        q: "EUR/USD rises from 1.0850 to 1.0900. What happened?",
        options: ["The euro strengthened against the dollar", "The dollar strengthened against the euro", "Both fell"],
        correct: 0,
        explanation: "Right. One euro now buys more dollars, so the euro has strengthened.",
      },
      {
        type: "text",
        body: "Small forex moves are measured in pips. For most pairs, a pip is the fourth decimal place, so a move from 1.0850 to 1.0851 is one pip. A standard lot in forex is usually 100,000 units of the first currency, so beginners use far smaller sizes here too.",
      },
      {
        type: "scenario",
        prompt: "Forex trades use leverage just like gold CFDs. What does that mean for you?",
        choices: [
          {
            label: "The small moves make it safe.",
            outcome: "The moves may look small, but leverage can make them matter a lot.",
            good: false,
          },
          {
            label: "The same risk habits still apply.",
            outcome: "Exactly. Small sizes and a stop on every trade serve you well in every market.",
            good: true,
          },
        ],
      },
    ],
  },
  {
    slug: "what-moves-currencies",
    moduleId: "beyond-gold",
    title: "What moves currencies",
    subtitle: "Interest rates, news and market hours.",
    minutes: 4,
    practiceHint: "In Practice, check EURUSD at different times of day and notice when it moves more.",
    blocks: [
      {
        type: "text",
        body: "Currencies respond to how a country's economy is doing. Interest rates are one of the biggest influences, because higher rates can attract money from around the world.\n\nThe forex market runs nearly 24 hours on weekdays, passing between Sydney, Tokyo, London and New York. Markets are often busiest when London and New York are both open.",
      },
      {
        type: "quiz",
        q: "Why might a higher interest rate support a country's currency?",
        options: ["It can attract money from investors", "It prints more currency", "It closes the market"],
        correct: 0,
        explanation: "Yes. Higher rates can draw in money looking for better returns, though many other things matter too.",
      },
      {
        type: "scenario",
        prompt: "A major economic announcement is due in five minutes. You're new. What's a sensible approach?",
        choices: [
          {
            label: "Trade right before it, to catch the big move.",
            outcome: "Prices can jump sharply and spreads can widen around big news, which is hard even for experienced traders.",
            good: false,
          },
          {
            label: "Wait, and simply watch what happens.",
            outcome: "A wise choice. Watching big moments is free, and it's a great way to learn.",
            good: true,
          },
        ],
      },
    ],
  },
  {
    slug: "what-are-indices",
    moduleId: "beyond-gold",
    title: "What are indices?",
    subtitle: "Trading the mood of a whole group of companies.",
    minutes: 3,
    practiceHint: "In Practice, try a tiny US500 trade with a stop, and compare it with gold.",
    blocks: [
      {
        type: "text",
        body: "An index tracks a group of company shares. The US500 follows 500 large American companies, and the US30 follows 30 well-known ones.\n\nInstead of picking one company, you're following the general direction of the group. Brokers usually offer indices as CFDs, so everything you've learned about leverage and stops applies here too.",
      },
      {
        type: "quiz",
        q: "What does the US500 track?",
        options: ["The price of gold", "A group of 500 large US companies", "500 currencies"],
        correct: 1,
        explanation: "Exactly. It's a single number that sums up how those companies are doing.",
      },
      {
        type: "scenario",
        prompt: "Your friend says an index is safer because it's spread across many companies. What's a balanced reply?",
        choices: [
          {
            label: "True, so you can't really lose much.",
            outcome: "Whole markets can fall sharply, and leverage makes those falls matter more.",
            good: false,
          },
          {
            label: "It's spread out, but with CFDs and leverage it's still high risk.",
            outcome: "That's a thoughtful answer. Spreading across companies helps, but it doesn't remove the risk.",
            good: true,
          },
        ],
      },
    ],
  },
  {
    slug: "silver-and-other-metals",
    moduleId: "beyond-gold",
    title: "Silver and other metals",
    subtitle: "Gold's lively cousin, and how lessons carry over.",
    minutes: 3,
    practiceHint: "In Practice, compare XAGUSD with XAUUSD and notice how different the sizes feel.",
    blocks: [
      {
        type: "text",
        body: "Silver is usually written as XAGUSD. It often moves in the same general direction as gold, but it can swing more sharply for its size.\n\nOne thing to watch is that a standard lot of silver is usually 5,000 ounces, not 100. Lot sizes differ between instruments, so always check what a lot means before you trade something new.",
      },
      {
        type: "quiz",
        q: "You switch from gold to silver. What should you check first?",
        options: ["What one lot means for this instrument", "Nothing, every lot is the same", "The colour of the chart"],
        correct: 0,
        explanation: "Yes. The same 0.01 lot can mean very different amounts on different instruments.",
      },
      {
        type: "pansy",
        body: "Look how far you've come. You started with what XAUUSD means, and now you can read a chart, size a trade and spot a scam. Whatever you decide to do next, you've earned this knowledge. I'm so proud of you.",
      },
    ],
  },
];
