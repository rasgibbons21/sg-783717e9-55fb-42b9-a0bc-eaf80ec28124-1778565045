import type { Lesson } from "./types";

export const M5_DEMO_ACCOUNT: Lesson[] = [
  {
    slug: "what-is-a-demo-account",
    moduleId: "demo-account",
    title: "What is a demo account?",
    subtitle: "A broker's own practice space, with pretend money.",
    minutes: 3,
    practiceHint: "Keep practising here in Bloom for as long as you like. There's no hurry to move on.",
    blocks: [
      {
        type: "text",
        body: "A broker is the company that gives you access to markets. A demo account is a free practice account on that broker's real platform, using pretend money.\n\nIt's a gentle next step after Bloom's practice area, because you get to see the actual screens you'd use one day. Nothing you do on a demo can lose real money.",
      },
      {
        type: "quiz",
        q: "What can you lose on a demo account?",
        options: ["Your deposit", "No real money, only pretend money", "Your bank savings"],
        correct: 1,
        explanation: "That's right. Demo money isn't real, which makes it a safe place to get familiar with a platform.",
      },
      {
        type: "scenario",
        prompt: "Your demo account is doing well. Does that mean real trading will feel the same?",
        choices: [
          {
            label: "Yes, the results will be the same.",
            outcome: "Not quite. Real money brings real emotions, and fills and costs can differ too.",
            good: false,
          },
          {
            label: "No, real money feels different and carries real risk.",
            outcome: "Exactly. Practice builds skill, but it can't fully prepare you for the feeling of real risk.",
            good: true,
          },
        ],
      },
    ],
  },
  {
    slug: "opening-a-demo",
    moduleId: "demo-account",
    title: "Opening a demo at XM or IC Markets",
    subtitle: "What to expect, and what to check first.",
    minutes: 4,
    practiceHint: "Compare what you see on a broker's demo with the Practice screen here in Bloom.",
    blocks: [
      {
        type: "text",
        body: "XM and IC Markets are two brokers that offer gold and other instruments, and both offer demo accounts. The steps are similar at most brokers.\n\nAvailability depends on your country. These brokers generally don't accept US residents, so if you're in the US, stay with Bloom's lessons and practice area. Everyone should check that a broker is regulated and accepts people from where they live.",
      },
      {
        type: "order",
        prompt: "Put the usual steps for opening a demo account in order.",
        steps: [
          "Check the broker accepts people from your country",
          "Choose the demo option, not a live account",
          "Enter your details and choose a platform",
          "Log in and find XAUUSD",
        ],
        explanation: "Perfect. And you don't need to pay anything for a demo. If you're asked to deposit money, stop, because you've likely reached a live account.",
      },
      {
        type: "scenario",
        prompt: "While opening your demo, you're asked to make a deposit. What's happening?",
        choices: [
          {
            label: "Demos need a deposit, so I'll pay.",
            outcome: "A demo shouldn't need any money. Please pause here.",
            good: false,
          },
          {
            label: "I may be on the live account page, so I'll go back.",
            outcome: "Exactly right. Look for the words demo or practice, and never feel rushed.",
            good: true,
          },
        ],
      },
      {
        type: "pansy",
        body: "A quick and honest note: Bloom earns a commission if you open an account through some of our links. It doesn't cost you anything, and it's always your choice whether to open one at all.",
      },
    ],
  },
  {
    slug: "placing-a-practice-order",
    moduleId: "demo-account",
    title: "Placing a practice order",
    subtitle: "The parts of an order ticket, one by one.",
    minutes: 4,
    practiceHint: "In Practice, place one small gold trade with a stop, using everything you've just learned.",
    blocks: [
      {
        type: "text",
        body: "An order ticket is the small form you fill in to place a trade. Most tickets ask for the same things: the instrument, the direction, the size, and your stop.\n\nDirection means buy if you expect the price may rise, or sell if you expect it may fall.",
      },
      {
        type: "order",
        prompt: "Fill in the order ticket in a sensible order.",
        steps: ["Choose XAUUSD", "Choose buy or sell", "Set your stop", "Choose a small size", "Check it over, then confirm"],
        explanation: "You've got it. That last check is a habit worth keeping, because mistyped sizes are surprisingly common.",
      },
      {
        type: "quiz",
        q: "You think gold may fall, and you want to practise that idea. Which direction would you choose?",
        options: ["Buy", "Sell"],
        correct: 1,
        explanation: "Yes. Selling is how a CFD trader practises the idea that a price may fall.",
      },
    ],
  },
];
