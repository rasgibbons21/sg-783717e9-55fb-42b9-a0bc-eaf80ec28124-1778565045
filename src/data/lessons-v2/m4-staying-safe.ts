import type { Lesson } from "./types";

export const M4_STAYING_SAFE: Lesson[] = [
  {
    slug: "the-one-percent-idea",
    moduleId: "staying-safe",
    title: "The 1% idea",
    subtitle: "A simple habit that keeps one bad trade from hurting too much.",
    minutes: 4,
    practiceHint: "In Practice, work out what 1% of your simulated balance is before your next trade.",
    blocks: [
      {
        type: "text",
        body: "Many experienced traders limit how much they could lose on any one trade to a small part of their account, often around 1%.\n\nIt isn't a magic number. It's a way of making sure that a run of losses, which happens to everyone, doesn't end your learning.",
      },
      {
        type: "slider",
        prompt: "Move the slider to see how much of a $10,000 practice account each risk level puts on the line.",
        min: 0.5,
        max: 10,
        step: 0.5,
        initial: 1,
        unit: "%",
        outcomeKey: "riskPercent",
        note: "At 10%, just a few losses in a row would be very painful. At 1%, you'd have plenty of room to keep learning.",
      },
      {
        type: "quiz",
        q: "Why keep the risk on each trade small?",
        options: [
          "So a losing streak doesn't do serious damage",
          "Because small trades never lose",
          "Because brokers require it",
        ],
        correct: 0,
        explanation: "Yes. Losses are a normal part of trading, so the goal is to make sure you can absorb them.",
      },
    ],
  },
  {
    slug: "stop-losses",
    moduleId: "staying-safe",
    title: "Stop losses",
    subtitle: "Deciding your exit before you enter.",
    minutes: 4,
    practiceHint: "In Practice, every trade needs a stop. Choose yours before you choose your size.",
    blocks: [
      {
        type: "text",
        body: "A stop loss is an instruction that closes your trade if the price reaches a level you've chosen. It's how you decide, while you're calm, how much you're prepared to lose.\n\nIn fast markets the price can jump past your stop, so a stop isn't a perfect guarantee. It's still one of the best habits you can build.",
      },
      {
        type: "order",
        prompt: "Put these steps in a calm, sensible order.",
        steps: [
          "Decide why you're considering this trade",
          "Choose where your stop would go",
          "Work out a size that keeps the risk small",
          "Place the practice trade",
        ],
        explanation: "Beautifully done. Notice that the size comes after the stop, because the stop tells you how much room the trade needs.",
      },
      {
        type: "scenario",
        prompt: "Your practice trade is getting close to your stop, and you feel tempted to move the stop further away. What do you do?",
        choices: [
          {
            label: "Move it. The price will probably turn around.",
            outcome: "That feeling is very human, but moving a stop is how small losses become large ones.",
            good: false,
          },
          {
            label: "Leave it. I chose it when I was calm.",
            outcome: "That's real discipline. A small planned loss is simply part of learning.",
            good: true,
          },
        ],
      },
    ],
  },
  {
    slug: "common-beginner-mistakes",
    moduleId: "staying-safe",
    title: "Common beginner mistakes",
    subtitle: "The traps almost everyone meets, and how to step around them.",
    minutes: 4,
    practiceHint: "In Practice, make one small trade today and write a line in your journal about how it felt.",
    blocks: [
      {
        type: "text",
        body: "Nearly everyone makes the same few mistakes at first. Trading too large. Trading without a stop. Trying to win back a loss straight away. Following strangers' tips online. Starting with real money too soon.\n\nKnowing about them doesn't make you immune, but it does help you notice them when they happen.",
      },
      {
        type: "scenario",
        prompt: "You've just had a losing practice trade and you feel frustrated. What's the best next step?",
        choices: [
          {
            label: "Open a bigger trade to win it back quickly.",
            outcome: "This is called revenge trading, and it's one of the quickest ways to lose money.",
            good: false,
          },
          {
            label: "Take a break and write down what happened.",
            outcome: "Lovely. A little distance and a few notes will teach you more than another rushed trade.",
            good: true,
          },
        ],
      },
      {
        type: "scenario",
        prompt: "Someone online messages you offering to trade for you and promises steady returns. What do you do?",
        choices: [
          {
            label: "Send a small amount to test them.",
            outcome: "Please don't. Promised returns and unsolicited offers are classic warning signs of a scam.",
            good: false,
          },
          {
            label: "Ignore and block them.",
            outcome: "Exactly right. Nobody can promise returns, and you never need to hand your money to a stranger.",
            good: true,
          },
        ],
      },
      {
        type: "quiz",
        q: "When is a good time to think about using real money?",
        options: [
          "Immediately, it's the only way to learn",
          "Only when you understand the risks, have practised, and can afford to lose it",
          "As soon as you have one winning practice trade",
        ],
        correct: 1,
        explanation: "Yes. And it's completely fine to decide real trading isn't for you. Learning is valuable either way.",
      },
    ],
  },
];
