import type { Lesson } from "./types";

export const M1_GOLD_BASICS: Lesson[] = [
  {
    slug: "what-is-gold-trading",
    moduleId: "gold-basics",
    title: "What is gold trading?",
    subtitle: "What XAUUSD means, and how trading gold differs from owning it.",
    minutes: 4,
    practiceHint: "Open Practice and find XAUUSD. Just look around, there's no rush.",
    blocks: [
      {
        type: "pansy",
        body: "Hello, I'm Pansy. I'll be with you the whole way. You don't need any experience, and there are no silly questions here.",
      },
      {
        type: "text",
        body: "When people talk about trading gold online, they usually don't mean buying a gold bar. They mean agreeing a price for gold, then making or losing money as that price moves.\n\nYou'll often see gold written as XAUUSD. XAU is the code for gold, and USD means US dollars. So XAUUSD simply means the price of one ounce of gold in dollars.",
      },
      {
        type: "quiz",
        q: "What does XAUUSD mean?",
        options: ["A company that mines gold", "The price of one ounce of gold in US dollars", "A type of bank account"],
        correct: 1,
        explanation: "Exactly. XAU is gold and USD is dollars, so it's the dollar price of one ounce of gold.",
      },
      {
        type: "text",
        body: "Most brokers offer gold as a CFD, which stands for contract for difference. You and the broker agree to settle the difference between the price when you open a trade and the price when you close it.\n\nYou never own any actual gold. Because of that, you can try to benefit when the price falls as well as when it rises. You can also lose money in either direction.",
      },
      {
        type: "scenario",
        prompt: "A friend says, \"If I trade a gold CFD, I'll have real gold I can keep.\" What would you tell them?",
        choices: [
          {
            label: "That's right, the gold is stored for you.",
            outcome: "That's a common belief, but a CFD gives you no gold at all.",
            good: false,
          },
          {
            label: "A CFD only tracks the price. You don't own any gold.",
            outcome: "Well explained. A CFD is an agreement about price movement, not a purchase of metal.",
            good: true,
          },
        ],
      },
      {
        type: "pansy",
        body: "One honest thing before we go on: gold CFDs are high risk, and many beginners lose money. That's why we practise with simulated money here first. You're doing exactly the right thing by learning.",
      },
    ],
  },
  {
    slug: "why-gold-moves",
    moduleId: "gold-basics",
    title: "Why does the gold price move?",
    subtitle: "The everyday forces that push gold up and down.",
    minutes: 4,
    practiceHint: "In Practice, watch the gold price for a minute and notice how often it changes.",
    blocks: [
      {
        type: "text",
        body: "Gold's price changes all day because people are constantly deciding how much they'll pay for it. A few things tend to influence those decisions.\n\nWorry: when people feel uneasy about the world or the economy, some turn to gold as a place to feel safer.\n\nThe US dollar: gold is priced in dollars, so a stronger dollar often goes with a softer gold price, and a weaker dollar with a firmer one.\n\nInterest rates: gold pays no interest, so when savings and bonds pay more, gold can look less appealing.",
      },
      {
        type: "quiz",
        q: "Gold pays no interest. What might happen when interest rates rise?",
        options: [
          "Gold can look less appealing to some people",
          "Gold always doubles in price",
          "Nothing, rates never affect gold",
        ],
        correct: 0,
        explanation: "Right. When savings pay more, some people prefer them to gold. It's a tendency though, not a rule.",
      },
      {
        type: "pansy",
        body: "Notice I keep saying \"often\" and \"tends to\". Nobody knows for certain what gold will do next. Anyone who promises you they do isn't being honest.",
      },
      {
        type: "scenario",
        prompt: "You see a post saying, \"Gold is guaranteed to jump this week!\" What's the wise response?",
        choices: [
          {
            label: "Move quickly, it's guaranteed.",
            outcome: "It's tempting, but nothing in a market is guaranteed, and rushing is how beginners get hurt.",
            good: false,
          },
          {
            label: "Be sceptical. No one can guarantee a price.",
            outcome: "Exactly. Calm scepticism will protect you more than any prediction ever could.",
            good: true,
          },
        ],
      },
    ],
  },
  {
    slug: "how-gold-is-quoted",
    moduleId: "gold-basics",
    title: "How a gold price is quoted",
    subtitle: "Buy price, sell price and the small gap between them.",
    minutes: 3,
    practiceHint: "In Practice, find the gold price and read it out to yourself in dollars per ounce.",
    blocks: [
      {
        type: "text",
        body: "A broker shows two prices for gold. The higher one is what you'd pay to buy. The lower one is what you'd receive to sell.\n\nThe gap between them is called the spread, and it's one of the main ways brokers earn money. It means every trade starts slightly behind, so the price has to move your way just to break even.",
      },
      {
        type: "quiz",
        q: "Gold shows a sell price of 4,000.00 and a buy price of 4,000.40. What is the spread?",
        options: ["$4,000", "40 cents per ounce", "$40 per ounce"],
        correct: 1,
        explanation: "Yes. The gap is 0.40, so 40 cents per ounce. A small number, but you pay it on every trade.",
      },
      {
        type: "scenario",
        prompt: "You open a trade and it instantly shows a small loss, even though the price hasn't moved. What's happening?",
        choices: [
          {
            label: "Something has gone wrong with my account.",
            outcome: "It can feel that way the first time, but it's completely normal.",
            good: false,
          },
          {
            label: "That's the spread. Every trade starts slightly behind.",
            outcome: "That's it. Now you know why it happens, it won't catch you by surprise.",
            good: true,
          },
        ],
      },
    ],
  },
];
